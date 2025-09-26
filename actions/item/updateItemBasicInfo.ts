import { itemStandardInclude } from "@/lib/item/includes"
import { ActionResult, ItemWithRelations, revalidateItems, updateBasicInfoSchema } from "@/lib/item/schemas"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"

// Update: Basic Info
export async function updateItemBasicInfoAction(
  input: unknown
): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = updateBasicInfoSchema.parse(input)
    const updated = await db.item.update({
      where: { id: data.id },
      data: {
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        imageUrls: data.imageUrls ?? undefined,
        thumbnail: data.thumbnail ?? undefined,
        // If slug is based on name and is empty on the record, we can set it (optional behavior)
      },
      include: itemStandardInclude,
    })

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: 'Item updated' }
  } catch (error) {
    console.error('updateItemBasicInfoAction error:', error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
        ? error.message
        : 'Failed to update item'
    return { success: false, error: message }
  }
}
