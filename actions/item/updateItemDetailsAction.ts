import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { itemStandardInclude } from "@/lib/item/includes"
import { ItemWithRelations, updateDetailsSchema } from "@/lib/item/schemas"
import { revalidateItem } from "@/lib/item/revalidation"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"

// Update: Item Details (SKU/Barcode/Physical)
export const updateItemDetailsAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<ItemWithRelations>> => {
    const data = updateDetailsSchema.parse(input)

    if (data.sku) {
      // Unique SKU per org
      const conflict = await db.item.findFirst({
        where: {
          sku: data.sku,
          organizationId: data.organizationId,
          id: { not: data.id },
        },
        select: { id: true },
      })
      if (conflict) {
        throw new Error('Another item with this SKU already exists');
      }
    }

    const updated = await db.item.update({
      where: { id: data.id },
      data: {
        sku: data.sku ?? undefined,
        barcode: data.barcode ?? undefined,
        dimensions: data.dimensions ?? undefined,
        weight: data.weight ?? undefined,
        upc: data.upc ?? undefined,
        ean: data.ean ?? undefined,
        mpn: data.mpn ?? undefined,
        isbn: data.isbn ?? undefined,
      },
      include: itemStandardInclude,
    })

    revalidateItem(updated.id, data.organizationId)
    return { success: true, data: updated }
  },
  {
    actionName: 'updateItemDetailsAction',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'update',
      resourceType: 'item'
    }
  }
)
