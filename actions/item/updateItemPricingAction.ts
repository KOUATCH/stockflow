
import { itemStandardInclude } from "@/lib/item/includes"
import { ActionResult, ItemWithRelations, revalidateItems, updatePricingSchema } from "@/lib/item/schemas"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"



// Update: Pricing
export async function updateItemPricingAction(
  input: unknown
): Promise<ActionResult<ItemWithRelations>> {
  try {
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

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: 'Item pricing updated' }
  } catch (error) {
    console.error('updateItemPricingAction error:', error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
        ? error.message
        : 'Failed to update pricing'
    return { success: false, error: message }
  }
}
