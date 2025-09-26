import { itemStandardInclude } from "@/lib/item/includes"
import { ActionResult, ItemWithRelations, revalidateItems, slugify, updateTrackingSchema } from "@/lib/item/schemas"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"


// Update: Tracking / Flags
export async function updateItemTrackingAction(
  input: unknown
): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = updateTrackingSchema.parse(input)

    const patch: Prisma.ItemUpdateInput = {
      isActive: data.isActive ?? undefined,
      // isSerialTracked: data.isSerialTracked ?? undefined,
    }

    if (typeof data.slug === 'string') {
      patch.slug = data.slug === '' ? slugify(data.id) : slugify(data.slug)
    }

    const updated = await db.item.update({
      where: { id: data.id },
      data: patch,
      include: itemStandardInclude,
    })

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: 'Item tracking updated' }
  } catch (error) {
    console.error('updateItemTrackingAction error:', error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
        ? error.message
        : 'Failed to update tracking'
    return { success: false, error: message }
  }
}