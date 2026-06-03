import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { itemStandardInclude } from "@/lib/item/includes"
import { ItemWithRelations, updateRelationsSchema } from "@/lib/item/schemas"
import { revalidateItem } from "@/lib/item/revalidation"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"

// Update: Relations
export const updateItemRelationsAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<ItemWithRelations>> => {
    const data = updateRelationsSchema.parse(input)

    const updated = await db.item.update({
      where: { id: data.id },
      data: {
        categoryId: data.categoryId ?? null,
        brandId: data.brandId ?? null,
        unitId: data.unitId ?? null,
        taxRateId: data.taxRateId ?? null,
      },
      include: itemStandardInclude,
    })

    revalidateItem(updated.id, data.organizationId)
    return { success: true, data: updated }
  },
  {
    actionName: 'updateItemRelationsAction',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'update',
      resourceType: 'item'
    }
  }
)
