import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { itemStandardInclude } from "@/lib/item/includes"
import { ItemWithRelations, updatePricingSchema } from "@/lib/item/schemas"
import { revalidateItem } from "@/lib/item/revalidation"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"

// Update: Pricing
export const updateItemPricingAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<ItemWithRelations>> => {
    const data = updatePricingSchema.parse(input)

    const updated = await db.item.update({
      where: { id: data.id },
      data: {
        costPrice: data.costPrice ?? undefined,
        sellingPrice: data.sellingPrice ?? undefined,
        // taxRate: data.tax ,
      },
      include: itemStandardInclude,
    })

    revalidateItem(updated.id, data.organizationId)
    return { success: true, data: updated }
  },
  {
    actionName: 'updateItemPricingAction',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'update',
      resourceType: 'item'
    }
  }
)
