import { itemStandardInclude } from "@/lib/item/includes"
import { ActionResult, ItemWithRelations, revalidateItems, updateDetailsSchema } from "@/lib/item/schemas"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"



// Update: Item Details (SKU/Barcode/Physical)
export async function updateItemDetailsAction(
  input: unknown
): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = updateDetailsSchema.parse(input)

    if (data.sku) {
      // Unique SKU per org
      const conflict = await db.item.findFirst({
        where: {
          sku: data.sku,
          organizationId: data.organizationId,
          id: { not: data.id },
        },
        select: { id: true },
      })
      if (conflict) {
        return { success: false, error: 'Another item with this SKU already exists' }
      }
    }

    const updated = await db.item.update({
      where: { id: data.id },
      data: {
        sku: data.sku ?? undefined,
        barcode: data.barcode ?? undefined,
        dimensions: data.dimensions ?? undefined,
        weight: data.weight ?? undefined,
        upc: data.upc ?? undefined,
        ean: data.ean ?? undefined,
        mpn: data.mpn ?? undefined,
        isbn: data.isbn ?? undefined,
      },
      include: itemStandardInclude,
    })

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: 'Item details updated' }
  } catch (error) {
    console.error('updateItemDetailsAction error:', error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
        ? error.message
        : 'Failed to update item details'
    return { success: false, error: message }
  }
}
