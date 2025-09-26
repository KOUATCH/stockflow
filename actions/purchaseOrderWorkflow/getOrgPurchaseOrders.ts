"use server"

import { standardInclude } from "@/lib/purchase-orders/includes"
import { db } from "@/prisma/db"
import type { PurchaseOrderResponse, PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"
import type { Prisma } from "@prisma/client"

type PrismaResult = Prisma.PurchaseOrderGetPayload<{
  include: typeof standardInclude
}>

function transformPurchaseOrder(po: PrismaResult): PurchaseOrderWithRelations {
  return {
    id: po.id,
    orderNumber: po.orderNumber,
    status: po.status as PurchaseOrderWithRelations["status"],
    orderDate: po.orderDate,
    expectedDeliveryDate: po.expectedDeliveryDate,
    paymentTerms: po.paymentTerms,
    notes: po.notes,
    subtotal: po.subtotal || 0,
    taxAmount: po.taxAmount || 0,
    shippingCost: po.shippingCost || 0,
    discount: po.discount || 0,
    total: po.total || 0,
    supplier: po.supplier,
    location: po.location,
    organization: po.organization,
    createdBy: po.createdBy,
    approvedBy: po.approvedBy,
    lines: po.lines.map((line) => ({
      id: line.id,
      itemId: line.itemId,
      orderedQuantity: line.orderedQuantity,
      receivedQuantity: line.receivedQuantity || 0,
      unitCost: line.unitCost,
      discount: line.discount || 0,
      taxRate: line.taxRate || 0,
      taxAmount: line.taxAmount || 0,
      lineTotal: line.lineTotal,
      notes: line.notes,
      item: line.item,
    })),
    createdAt: po.createdAt,
    updatedAt: po.updatedAt,
  }
}

export async function getOrgPurchaseOrders(
  organizationId: string,
): Promise<PurchaseOrderResponse<PurchaseOrderWithRelations[]>> {
  try {
    if (!organizationId) {
      throw new Error("Organization ID is required")
    }

    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        organizationId,
      },
      include: standardInclude,
    })

    const transformedData = purchaseOrders.map(transformPurchaseOrder)

    return {
      data: transformedData,
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching purchase orders:", error)
    return {
      data: [],
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch purchase orders. Please try again.",
    }
  }
}
