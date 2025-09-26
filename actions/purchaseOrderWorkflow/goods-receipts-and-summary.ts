'use server'

import { db } from '@/prisma/db'
import { PurchaseOrderStatus as POStatus, Prisma } from '@prisma/client'

/**
 * Runtime type for goods receipts with lines, item, receivedBy, and location.
 */
export type GoodsReceiptWithRelations = Prisma.GoodsReceiptGetPayload<{
  include: {
    lines: {
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      }
    },
    receivedBy: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    location: {
      select: {
        id: true,
        name: true,
        address: true
      }
    }
  }
}>

/**
 * Fetches goods receipts for a purchase order.
 */
export async function getGoodsReceiptsForPurchaseOrder(
  purchaseOrderId: string,
  organizationId: string
): Promise<GoodsReceiptWithRelations[]> {
  try {
    if (!purchaseOrderId) throw new Error('Purchase order ID is required')
    if (!organizationId) throw new Error('Organization ID is required')

    const receipts = await db.goodsReceipt.findMany({
      where: {
        purchaseOrderId,
        organizationId,
      },
      include: {
        lines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        receivedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      // Prefer receiptDate for ordering; createdAt is also valid
      orderBy: { receiptDate: 'desc' },
    })

    return receipts
  } catch (error) {
    console.error('Error fetching goods receipts:', error)
    throw new Error('Failed to fetch goods receipts')
  }
}

export type PurchaseOrderSummary = {
  totalOrders: number
  statusBreakdown: {
    draft: number
    submitted: number
    approved: number
    partiallyReceived: number
    received: number
    cancelled: number
    closed: number // mapped from COMPLETED
  }
  totalValue: number
  overdueOrders: number
}

/**
 * Computes a summary of purchase orders for an organization.
 * - Uses the Prisma enum statuses
 * - "closed" is mapped from COMPLETED
 * - "overdue" means expectedDeliveryDate < now AND status not in [RECEIVED, COMPLETED, CANCELLED]
 */
export async function getPurchaseOrdersSummary(organizationId: string): Promise<PurchaseOrderSummary> {
  try {
    if (!organizationId) throw new Error('Organization ID is required')

    const now = new Date()

    const [
      totalOrders,
      draftOrders,
      submittedOrders,
      approvedOrders,
      partiallyReceivedOrders,
      receivedOrders,
      cancelledOrders,
      completedOrders,
      totalValueAgg,
      overdueOrders,
    ] = await Promise.all([
      db.purchaseOrder.count({ where: { organizationId } }),
      db.purchaseOrder.count({ where: { organizationId, status: POStatus.DRAFT } }),
      db.purchaseOrder.count({ where: { organizationId, status: POStatus.SUBMITTED } }),
      db.purchaseOrder.count({ where: { organizationId, status: POStatus.APPROVED } }),
      db.purchaseOrder.count({ where: { organizationId, status: POStatus.PARTIALLY_RECEIVED } }),
      db.purchaseOrder.count({ where: { organizationId, status: POStatus.RECEIVED } }),
      db.purchaseOrder.count({ where: { organizationId, status: POStatus.CANCELLED } }),
      db.purchaseOrder.count({ where: { organizationId, status: POStatus.COMPLETED } }),
      db.purchaseOrder.aggregate({
        where: { organizationId },
        _sum: { total: true },
      }),
      db.purchaseOrder.count({
        where: {
          organizationId,
          expectedDeliveryDate: { lt: now },
          // Exclude delivered/completed/cancelled
          status: { notIn: [POStatus.RECEIVED, POStatus.COMPLETED, POStatus.CANCELLED] },
        },
      }),
    ])

    const totalValue = totalValueAgg?._sum?.total ?? 0

    return {
      totalOrders,
      statusBreakdown: {
        draft: draftOrders,
        submitted: submittedOrders,
        approved: approvedOrders,
        partiallyReceived: partiallyReceivedOrders,
        received: receivedOrders,
        cancelled: cancelledOrders,
        closed: completedOrders, // map COMPLETED -> closed
      },
      totalValue,
      overdueOrders,
    }
  } catch (error) {
    console.error('Error fetching purchase orders summary:', error)
    throw new Error('Failed to fetch purchase orders summary')
  }
}
