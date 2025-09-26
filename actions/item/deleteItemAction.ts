import { ActionResult, deleteItemSchema } from "@/lib/item/schemas"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"
import { revalidatePath, revalidateTag } from "next/cache"

// Delete
export async function deleteItemAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const { id, organizationId } = deleteItemSchema.parse(input)

    // Optional: guard if item is referenced elsewhere (purchase order lines, etc.)
    // Example check on purchase order lines
    const polCount = await db.purchaseOrderLine.count({
      where: { itemId: id },
    })
    if (polCount > 0) {
      return {
        success: false,
        error: 'Cannot delete item that has been used in purchase orders',
      }
    }

    await db.item.delete({
      where: { id },
    })

    revalidateTag('items')
    revalidateTag(`item-${id}`)
    revalidateTag(`org-${organizationId}-items`)
    revalidatePath('/dashboard/items')

    return { success: true, data: { id }, message: 'Item deleted' }
  } catch (error) {
    console.error('deleteItemAction error:', error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code === 'P2003'
          ? 'Cannot delete item due to existing references'
          : `Database error: ${error.code}`
        : error instanceof Error
        ? error.message
        : 'Failed to delete item'
    return { success: false, error: message }
  }
}
