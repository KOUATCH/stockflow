import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { itemStandardInclude } from "@/lib/item/includes"
import { ItemWithRelations, updateBasicInfoSchema } from "@/lib/item/schemas"
import { revalidateItem } from "@/lib/item/revalidation"
import { db } from "@/prisma/db"

// Update: Basic Info
export const updateItemBasicInfoAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<ItemWithRelations>> => {
    const data = updateBasicInfoSchema.parse(input)
    const updated = await db.item.update({
      where: { id: data.id },
      data: {
        nameEn: data.nameEn ?? undefined,
        nameFr: data.nameFr === undefined ? undefined : data.nameFr,
        descriptionEn: data.descriptionEn === undefined ? undefined : data.descriptionEn,
        descriptionFr: data.descriptionFr === undefined ? undefined : data.descriptionFr,
        imageUrls:
          data.imageUrls === undefined
            ? undefined
            : data.imageUrls
              ? [data.imageUrls]
              : [],
        thumbnail: data.thumbnail ?? undefined,
        // If slug is based on name and is empty on the record, we can set it (optional behavior)
      },
      include: itemStandardInclude,
    })

    revalidateItem(updated.id, data.organizationId)
    return { success: true, data: updated }
  },
  {
    actionName: 'updateItemBasicInfoAction',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'update',
      resourceType: 'item'
    }
  }
)
