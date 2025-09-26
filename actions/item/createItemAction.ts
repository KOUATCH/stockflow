'use server'

import { generateSimpleSKU } from '@/lib/generateSKU';
import { generateSlug } from '@/lib/generateSlug';
import { updateInventoryLevels } from '@/lib/inventory/update-inventory-levels';
import { itemStandardInclude } from '@/lib/item/includes';
import {
  type ActionResult,
  type ItemWithRelations,
  createItemSchema,
  revalidateItems
} from '@/lib/item/schemas';
import { db } from '@/prisma/db'; // Fixed import path
import { Prisma } from '@prisma/client';

// Create Item (optionally seed initial inventory at a specific location)
export async function createItemAction(
  input: unknown
): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = createItemSchema.parse(input)

    // Enforce unique SKU within org
    const existingSku = await db.item.findFirst({
      where: { sku: data.sku, organizationId: data.organizationId },
      select: { id: true },
    })
    if (existingSku) {
      return { success: false, error: 'SKU already exists in this organization' }
    }

    data.slug = generateSlug(`${data.name}`, `${data.sku}`)
console.log(data)
    const created = await db.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          description: data.description ?? null,
          imageUrls: data.thumbnail ?? "", // string or null
          thumbnail: data.thumbnail ?? null,
          sku: generateSimpleSKU(12,"DBAKES"),
          barcode: data.barcode ?? null,
          dimensions: data.dimensions ?? null,
          weight: data.weight ?? 0,
          upc: data.upc ?? null,
          ean: data.ean ?? null,
          mpn: data.mpn ?? null,
          isbn: data.isbn ?? null,
          costPrice: data.costPrice ?? 0,
          sellingPrice: data.sellingPrice ?? 0,
          taxRateId: data.taxRateId ?? null ,
          categoryId: data.categoryId ?? null,
          brandId: data.brandId ?? null,
          unitId: data.unitId ?? null,
          minStockLevel: data.minStockLevel ?? 0,
          maxStockLevel: data.maxStockLevel ?? null,
          isActive: data.isActive ?? true,
          slug: generateSlug(`${data.name}`, `${data.sku}`)

          // isSerialTracked: data.isSerialTracked ?? false,
        },
        include: itemStandardInclude,
      })

      // Optional initial inventory
      if (data.initialInventory && data.initialInventory.quantity > 0) {
        const inv = data.initialInventory
        await updateInventoryLevels(tx, {
          itemId: item.id,
          locationId: inv.locationId,
          deltaQty: inv.quantity,
          unitCost: inv.unitCost ?? item.costPrice ?? 0,
          organizationId: data.organizationId,
          meta: {
            notes: inv.notes ?? 'Initial item stock',
            createdById: inv.createdById,
            referenceType: 'GOODS_RECEIPT',
            referenceId: undefined,
            referenceNumber: inv.referenceNumber,
            batchNumber: inv.batchNumber,
            serialNumbers: inv.serialNumbers,
            expiryDate: inv.expiryDate,
          },
        })
      }

      return item
    })

    revalidateItems(created.id, created.organizationId) // Ensure fresh data after mutation [^2]

    return {
      success: true,
      data: created,
      message: 'Item created successfully',
    }
  } catch (error) {
    console.error('createItemAction error:', error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
          ? error.message
          : 'Failed to create item'
    return { success: false, error: message }
  }
}
