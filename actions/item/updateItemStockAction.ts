
import { updateInventoryLevels } from "@/lib/inventory/update-inventory-levels"
import { itemStandardInclude } from "@/lib/item/includes"
import { ActionResult, ItemWithRelations, revalidateItems, updateStockSchema } from "@/lib/item/schemas"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"


// Update: Stock policy + optional inventory adjustment
export async function updateItemStockAction(
  input: unknown
): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = updateStockSchema.parse(input)

    const updated = await db.$transaction(async (tx) => {
      const updatedItem = await tx.item.update({
        where: { id: data.id },
        data: {
          minStockLevel: data.minStockLevel ?? undefined,
          maxStockLevel: data.maxStockLevel ?? undefined,
          unitOfMeasure: data.unitOfMeasure ?? undefined,
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

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: 'Stock updated' }
  } catch (error) {
    console.error('updateItemStockAction error:', error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code === 'P2003'
          ? 'Related record not found'
          : `Database error: ${error.code}`
        : error instanceof Error
        ? error.message
        : 'Failed to update stock'
    return { success: false, error: message }
  }
}
