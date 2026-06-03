import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { deleteItemSchema } from "@/lib/item/schemas"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"
import { revalidatePath, revalidateTag } from "next/cache"

// Delete
export const deleteItemAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<{ id: string }>> => {
    const { id, organizationId } = deleteItemSchema.parse(input)

    // Optional: guard if item is referenced elsewhere (purchase order lines, etc.)
    // Example check on purchase order lines
    const polCount = await db.purchaseOrderLine.count({
      where: { itemId: id },
    })
    if (polCount > 0) {
      throw new Error('Cannot delete item that has been used in purchase orders');
    }

    await db.item.delete({
      where: { id },
    })

    revalidateTag('items')
    revalidateTag(`item-${id}`)
    revalidateTag(`org-${organizationId}-items`)
    revalidatePath('/dashboard/items')

    return { success: true, data: { id } }
  },
  {
    actionName: 'deleteItemAction',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'delete',
      resourceType: 'item'
    }
  }
)
