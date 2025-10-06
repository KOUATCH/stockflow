"use server"

import { auth } from "@/auth"
import { db } from "@/prisma/db"

/**
 * Client-safe inventory actions that don't use getAuthenticatedUser()
 * These use NextAuth session instead to prevent NEXT_REDIRECT errors
 */

export async function getOrgItemsWithInventoryLevelsClientSafe(organizationId?: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: [] }
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: [] }
    }

    const items = await db.item.findMany({
      where: {
        organizationId: userOrgId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        costPrice: true,
        sellingPrice: true,
        createdAt: true,
        updatedAt: true,
        imageUrls: true,
        thumbnail: true,
        sku: true,
        barcode: true,
        description: true,
        weight: true,
        dimensions: true,
        tags: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
          },
        },
        inventoryLevels: {
          select: {
            id: true,
            quantityOnHand: true,
            quantityAvailable: true,
            quantityReserved: true,
            reorderPoint: true,
            maxStockLevel: true,
            averageCost: true,
            totalValue: true,
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return {
      success: true,
      data: items,
      error: null
    }
  } catch (error) {
    console.error("Error fetching items with inventory levels:", error)
    return {
      success: false,
      error: "Failed to fetch items",
      data: []
    }
  }
}

export async function getInventoryStatsClientSafe(organizationId?: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: "Not authenticated", data: null }
    }

    const userOrgId = organizationId || session.user.organizationId

    if (!userOrgId) {
      return { success: false, error: "No organization ID", data: null }
    }

    // Get inventory stats
    const [totalItems, totalValue, lowStockItems] = await Promise.all([
      db.item.count({
        where: {
          organizationId: userOrgId,
          isActive: true,
        },
      }),
      db.inventoryLevel.aggregate({
        where: {
          item: {
            organizationId: userOrgId,
            isActive: true,
          },
        },
        _sum: {
          totalValue: true,
        },
      }),
      db.inventoryLevel.count({
        where: {
          item: {
            organizationId: userOrgId,
            isActive: true,
          },
          quantityOnHand: {
            lte: db.inventoryLevel.fields.reorderPoint,
          },
        },
      }),
    ])

    return {
      success: true,
      data: {
        totalItems,
        totalValue: totalValue._sum.totalValue || 0,
        lowStockItems,
      },
      error: null
    }
  } catch (error) {
    console.error("Error fetching inventory stats:", error)
    return {
      success: false,
      error: "Failed to fetch inventory stats",
      data: null
    }
  }
}

export async function getInventoryLevelsClientSafe(organizationId?: string, locationId?: string) {
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
      item: {
        organizationId: userOrgId,
        isActive: true,
      },
    }

    if (locationId) {
      whereClause.locationId = locationId
    }

    const inventoryLevels = await db.inventoryLevel.findMany({
      where: whereClause,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
            barcode: true,
            imageUrls: true,
            thumbnail: true,
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
      orderBy: {
        item: {
          name: 'asc',
        },
      },
    })

    return {
      success: true,
      data: inventoryLevels,
      error: null
    }
  } catch (error) {
    console.error("Error fetching inventory levels:", error)
    return {
      success: false,
      error: "Failed to fetch inventory levels",
      data: []
    }
  }
}