import { itemStandardInclude } from "@/lib/item/includes"
import { ActionResult, ItemWithRelations, revalidateItems, updateRelationsSchema } from "@/lib/item/schemas"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"


// Update: Relations
export async function updateItemRelationsAction(
  input: unknown
): Promise<ActionResult<ItemWithRelations>> {
  try {
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

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: 'Item relations updated' }
  } catch (error) {
    console.error('updateItemRelationsAction error:', error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
        ? error.message
        : 'Failed to update relations'
    return { success: false, error: message }
  }
}