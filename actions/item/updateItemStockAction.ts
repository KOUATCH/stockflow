import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { updateInventoryLevels } from "@/lib/inventory/update-inventory-levels"
import { itemStandardInclude } from "@/lib/item/includes"
import { ItemWithRelations, updateStockSchema } from "@/lib/item/schemas"
import { revalidateItem } from "@/lib/item/revalidation"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"

// Update: Stock policy + optional inventory adjustment
export const updateItemStockAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<ItemWithRelations>> => {
    const data = updateStockSchema.parse(input)

    const updated = await db.$transaction(async (tx) => {
      const updatedItem = await tx.item.update({
        where: { id: data.id },
        data: {
          minStockLevel: data.minStockLevel ?? undefined,
          maxStockLevel: data.maxStockLevel ?? undefined,
        },
        include: itemStandardInclude,
      })

      if (data.adjustInventory && data.adjustInventory.deltaQty !== 0) {
        const { locationId, deltaQty, unitCost, notes, createdById, batchNumber, serialNumbers, expiryDate, referenceNumber } =
          data.adjustInventory

        // Apply inventory delta with weighted-average costing
        await updateInventoryLevels(tx, {
          itemId: updatedItem.id,
          locationId,
          deltaQty,
          unitCost: unitCost ?? updatedItem.costPrice ?? 0,
          organizationId: updatedItem.organizationId,
          meta: {
            notes: notes ?? 'Manual stock adjustment',
            createdById,
            referenceType: 'GOODS_RECEIPT', // Using existing enum path from helper
            referenceId: undefined,
            referenceNumber,
            batchNumber,
            serialNumbers,
            expiryDate,
          },
        })
      }

      return updatedItem
    })

    revalidateItem(updated.id, data.organizationId)
    return { success: true, data: updated }
  },
  {
    actionName: 'updateItemStockAction',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'update',
      resourceType: 'item'
    }
  }
)
