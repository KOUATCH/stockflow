"use server"

import { auth } from "@/auth"
import { db } from "@/prisma/db"

/**
 * Client-safe inventory actions that don't use getAuthenticatedUser()
 * These use NextAuth session instead to prevent NEXT_REDIRECT errors
 */

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value) || 0
}

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
        nameEn: true,
        nameFr: true,
        slug: true,
        costPrice: true,
        sellingPrice: true,
        createdAt: true,
        updatedAt: true,
        imageUrls: true,
        thumbnail: true,
        sku: true,
        barcode: true,
        descriptionEn: true,
        descriptionFr: true,
        weight: true,
        dimensions: true,
        isActive: true,
        maxStockLevel: true,
        category: {
          select: {
            id: true,
            titleEn: true,
            titleFr: true,
          },
        },
        brand: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
          },
        },
        unit: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
            symbol: true,
          },
        },
        inventoryLevels: {
          select: {
            id: true,
            quantityOnHand: true,
            quantityAvailable: true,
            quantityReserved: true,
            reorderPoint: true,
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
      data: items.map((item) => ({
        ...item,
        name: item.nameEn,
        description: item.descriptionEn,
        costPrice: toNumber(item.costPrice),
        sellingPrice: toNumber(item.sellingPrice),
        weight: toNumber(item.weight),
        tags: [],
        category: item.category
          ? {
              ...item.category,
              name: item.category.titleEn ?? item.category.titleFr ?? "",
            }
          : null,
        brand: item.brand
          ? {
              ...item.brand,
              name: item.brand.nameEn ?? item.brand.nameFr ?? "",
            }
          : null,
        unit: item.unit
          ? {
              ...item.unit,
              name: item.unit.nameEn ?? item.unit.nameFr ?? item.unit.symbol,
              abbreviation: item.unit.symbol,
            }
          : null,
        inventoryLevels: item.inventoryLevels.map((level) => ({
          ...level,
          quantityOnHand: toNumber(level.quantityOnHand),
          quantityAvailable: toNumber(level.quantityAvailable),
          quantityReserved: toNumber(level.quantityReserved),
          reorderPoint: toNumber(level.reorderPoint),
          maxStockLevel: toNumber(item.maxStockLevel),
          averageCost: toNumber(level.averageCost),
          totalValue: toNumber(level.totalValue),
        })),
      })),
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
            nameEn: true,
            nameFr: true,
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
          nameEn: 'asc',
        },
      },
    })

    return {
      success: true,
      data: inventoryLevels.map((level) => ({
        ...level,
        quantityOnHand: toNumber(level.quantityOnHand),
        quantityReserved: toNumber(level.quantityReserved),
        quantityAvailable: toNumber(level.quantityAvailable),
        quantityInTransit: toNumber(level.quantityInTransit),
        quantityOnOrder: toNumber(level.quantityOnOrder),
        reorderPoint: toNumber(level.reorderPoint),
        averageCost: toNumber(level.averageCost),
        totalValue: toNumber(level.totalValue),
        item: {
          ...level.item,
          name: level.item.nameEn ?? level.item.nameFr ?? "",
        },
      })),
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
