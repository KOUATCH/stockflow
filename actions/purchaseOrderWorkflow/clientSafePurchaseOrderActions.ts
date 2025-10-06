"use server"

import { auth } from "@/auth"
import { db } from "@/prisma/db"
import type { PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"

/**
 * Client-safe version that uses NextAuth session instead of getAuthenticatedUser
 * This prevents NEXT_REDIRECT errors in client components
 */
export async function getOrgPurchaseOrdersClientSafe(organizationId?: string) {
  try {
    // Use NextAuth session instead of getAuthenticatedUser to avoid redirects
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: [] }
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: [] }
    }

    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        organizationId: userOrgId,
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          }
        },
        lines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: purchaseOrders as PurchaseOrderWithRelations[],
      error: null
    }
  } catch (error) {
    console.error("Error fetching purchase orders:", error)
    return {
      success: false,
      error: "Failed to fetch purchase orders",
      data: []
    }
  }
}

export async function getOrgPurchaseOrdersByLocationClientSafe(
  organizationId?: string,
  locationId?: string
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: [] }
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: [] }
    }

    const whereClause: any = {
      organizationId: userOrgId,
    }

    if (locationId) {
      whereClause.locationId = locationId
    }

    const purchaseOrders = await db.purchaseOrder.findMany({
      where: whereClause,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          }
        },
        lines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: purchaseOrders as PurchaseOrderWithRelations[],
      error: null
    }
  } catch (error) {
    console.error("Error fetching purchase orders by location:", error)
    return {
      success: false,
      error: "Failed to fetch purchase orders",
      data: []
    }
  }
}