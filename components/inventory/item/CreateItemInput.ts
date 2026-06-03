"use server"

import { itemStandardInclude } from "@/lib/item/includes"
import { createItemSchema, slugify, type ItemWithRelations } from "@/lib/item/schemas"
import { revalidateItem } from "@/lib/item/revalidation"
import { db } from "@/prisma/db"
import type { z } from "zod"

export type CreateItemInput = z.infer<typeof createItemSchema>

async function ensureUniqueSlug(baseSlug: string, organizationId: string) {
  const slug = baseSlug
  const existing = await db.item.findFirst({
    where: { slug, organizationId },
    select: { id: true },
  })
  if (!existing) return slug

  // Add a numeric suffix until unique
  let suffix = 2
  let candidate = `${slug}-${suffix}`
  // Limit attempts to avoid infinite loops
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const taken = await db.item.findFirst({
      where: { slug: candidate, organizationId },
      select: { id: true },
    })
    if (!taken) return candidate
    suffix += 1
    candidate = `${slug}-${suffix}`
    if (suffix > 200) {
      // Safety guard
      return `${slug}-${Date.now()}`
    }
  }
}

/**
 * Creates an item. Validates with Zod, normalizes fields, and returns the newly created item with relations.
 * NOTE: If you provide initialInventory, you can seed stock later with a dedicated inventory action.
 */
export async function createItemAction(input: CreateItemInput): Promise<ItemWithRelations> {
  // 1) Validate and coerce incoming values
  const parsed = createItemSchema.parse(input)

  // 2) Normalize strings and derived fields
  const nameEn = parsed.nameEn.trim()
  const sku = parsed.sku.trim().toUpperCase()
  const organizationId = parsed.organizationId

  const desiredSlug = parsed.slug?.trim()
  const baseSlug = slugify(desiredSlug && desiredSlug.length > 0 ? desiredSlug : nameEn)
  const uniqueSlug = await ensureUniqueSlug(baseSlug, organizationId)

  // 3) Create the item (exclude client-only initialInventory from the data payload)
  const {
    initialInventory, // client-only seeding payload
    ...rest
  } = parsed

  const created = await db.item.create({
    data: {
      organizationId,
      nameEn,
      nameFr: rest.nameFr ?? null,
      sku,
      descriptionEn: rest.descriptionEn ?? null,
      descriptionFr: rest.descriptionFr ?? null,
      imageUrls: rest.imageUrls ? [rest.imageUrls] : [],
      thumbnail: rest.thumbnail ?? null,
      barcode: rest.barcode ?? null,
      dimensions: rest.dimensions ?? null,
      weight: rest.weight ?? null,

      upc: rest.upc ?? null,
      ean: rest.ean ?? null,
      mpn: rest.mpn ?? null,
      isbn: rest.isbn ?? null,

      costPrice: Number(rest.costPrice ?? 0),
      sellingPrice: Number(rest.sellingPrice ?? 0),
      // taxRateId: rest.taxRateId ?? "",

      categoryId: rest.categoryId ?? null,
      brandId: rest.brandId ?? null,
      unitId: rest.unitId ?? null,
      taxRateId: rest.taxRateId ?? null,

      minStockLevel: Number(rest.minStockLevel ?? 0),
      maxStockLevel: rest.maxStockLevel ?? null,

      isActive: rest.isActive ?? true,
      // isSerialTracked: rest.isSe rialTracked ?? false,

      slug: uniqueSlug,
    },
    include: itemStandardInclude,
  })

  // 4) Optionally seed initial inventory (recommended to handle via a dedicated action)
  // We intentionally do not mutate stock here to keep this action focused and avoid
  // coupling to inventory schema. Use your existing inventory action to seed stock.

  // 5) Revalidate caches so UI stays fresh
  revalidateItem(created.id, organizationId)

  return created
}
