
"use server"
import { standardInclude } from "@/lib/purchase-orders/includes"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"

/**
 * Fetches a single purchase order by its ID.
 */
export async function getOrgPurchaseOrderById(id: string, organizationId?: string) {
  try {
    if (!id) {
      throw new Error("Purchase order ID is required")
    }

    const where: Prisma.PurchaseOrderWhereInput = { id }
    if (organizationId) {
      where.organizationId = organizationId
    }

    const purchaseOrder = await db.purchaseOrder.findFirst({
      where,
      include: standardInclude,
    })

    if (!purchaseOrder) {
      throw new Error("Purchase Order not found")
    }

    return purchaseOrder
  } catch (error) {
    console.error("Error fetching purchase order:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch purchase order")
  }
}
