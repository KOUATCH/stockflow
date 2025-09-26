"use server"

import { db } from "@/prisma/db"
import { revalidatePath, revalidateTag } from "next/cache"

export interface InventoryFilters {
  organizationId: string
  search?: string
  locationId?: string
  categoryId?: string
  lowStock?: boolean
  outOfStock?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface InventoryWithRelations {
  id: string
  itemId: string
  locationId: string
  organizationId: string
  quantity: number
  totalValue: number
  averageCost: number
  reorderLevel: number
  maxLevel: number
  lastUpdated: Date
  item: {
    id: string
    name: string
    sku: string
    description: string | null
    category: {
      id: string
      name: string
    } | null
    costPrice: number
    sellingPrice: number
  }
  location: {
    id: string
    name: string
    address: string | null
  }
}

export interface InventoryTransaction {
  id: string
  itemId: string
  locationId: string
  organizationId: string
  type: string
  quantity: number
  unitPrice: number
  totalValue: number
  reference: string | null
  notes: string | null
  createdAt: Date
  item: {
    id: string
    name: string
    sku: string
  }
  location: {
    id: string
    name: string
  }
}

/**
 * Fetches inventory data with filters
 */
export async function getInventory(filters: InventoryFilters) {
  try {
    if (!filters.organizationId) {
      throw new Error("Organization ID is required")
    }

    const page = Math.max(1, filters.page || 1)
    const limit = Math.min(100, Math.max(1, filters.limit || 20))
    const skip = (page - 1) * limit

    const where: any = {
      organizationId: filters.organizationId,
    }

    if (filters.search?.trim()) {
      where.OR = [
        {
          item: {
            OR: [
              { name: { contains: filters.search.trim(), mode: "insensitive" } },
              { sku: { contains: filters.search.trim(), mode: "insensitive" } },
              { description: { contains: filters.search.trim(), mode: "insensitive" } },
            ],
          },
        },
        {
          location: {
            name: { contains: filters.search.trim(), mode: "insensitive" },
          },
        },
      ]
    }

    if (filters.locationId) {
      where.locationId = filters.locationId
    }

    if (filters.categoryId) {
      where.item = {
        ...where.item,
        categoryId: filters.categoryId,
      }
    }

    if (filters.lowStock) {
      where.quantity = {
        lte: db.raw("reorder_level"),
        gt: 0,
      }
    }

    if (filters.outOfStock) {
      where.quantity = 0
    }

    const sortBy = filters.sortBy || "lastUpdated"
    const sortOrder = filters.sortOrder || "desc"

    const [inventory, totalCount] = await Promise.all([
      db.inventory.findMany({
        where,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              sku: true,
              description: true,
              costPrice: true,
              sellingPrice: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
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
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.inventory.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return {
      data: inventory,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: { ...filters, page, limit },
    }
  } catch (error) {
    console.error("Error fetching inventory:", error)
    throw new Error("Failed to fetch inventory data")
  }
}

/**
 * Fetches inventory summary statistics
 */
export async function getInventorySummary(organizationId: string) {
  try {
    if (!organizationId) throw new Error("Organization ID is required")

    const [totalItems, totalValue, lowStockItems, outOfStockItems, totalLocations, recentTransactions] =
      await Promise.all([
        db.inventory.count({
          where: { organizationId },
        }),
        db.inventory.aggregate({
          where: { organizationId },
          _sum: { totalValue: true },
        }),
        db.inventory.count({
          where: {
            organizationId,
            quantity: {
              lte: db.raw("reorder_level"),
              gt: 0,
            },
          },
        }),
        db.inventory.count({
          where: {
            organizationId,
            quantity: 0,
          },
        }),
        db.inventory.groupBy({
          by: ["locationId"],
          where: { organizationId },
        }),
        db.inventoryTransaction.count({
          where: {
            organizationId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ])

    return {
      totalItems,
      totalValue: totalValue._sum.totalValue || 0,
      lowStockItems,
      outOfStockItems,
      totalLocations: totalLocations.length,
      recentTransactions,
    }
  } catch (error) {
    console.error("Error fetching inventory summary:", error)
    throw new Error("Failed to fetch inventory summary")
  }
}

/**
 * Fetches inventory transactions
 */
export async function getInventoryTransactions(
  organizationId: string,
  itemId?: string,
  locationId?: string,
  limit = 50,
) {
  try {
    if (!organizationId) throw new Error("Organization ID is required")

    const where: any = {
      organizationId,
    }

    if (itemId) where.itemId = itemId
    if (locationId) where.locationId = locationId

    const transactions = await db.inventoryTransaction.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return transactions
  } catch (error) {
    console.error("Error fetching inventory transactions:", error)
    throw new Error("Failed to fetch inventory transactions")
  }
}

/**
 * Updates inventory reorder levels
 */
export async function updateReorderLevels(
  inventoryId: string,
  reorderLevel: number,
  maxLevel: number,
  organizationId: string,
) {
  try {
    if (!inventoryId) throw new Error("Inventory ID is required")
    if (!organizationId) throw new Error("Organization ID is required")

    const inventory = await db.inventory.findFirst({
      where: {
        id: inventoryId,
        organizationId,
      },
    })

    if (!inventory) {
      throw new Error("Inventory record not found")
    }

    await db.inventory.update({
      where: { id: inventoryId },
      data: {
        reorderLevel,
        maxLevel,
        lastUpdated: new Date(),
      },
    })

    revalidateTag("inventory")
    revalidateTag(`inventory-${organizationId}`)
    revalidatePath("/dashboard/inventory")

    return {
      success: true,
      message: "Reorder levels updated successfully",
    }
  } catch (error) {
    console.error("Error updating reorder levels:", error)
    throw new Error("Failed to update reorder levels")
  }
}

/**
 * Creates manual inventory adjustment
 */
export async function createInventoryAdjustment(
  itemId: string,
  locationId: string,
  adjustmentQuantity: number,
  reason: string,
  organizationId: string,
  userId: string,
) {
  try {
    if (!itemId) throw new Error("Item ID is required")
    if (!locationId) throw new Error("Location ID is required")
    if (!organizationId) throw new Error("Organization ID is required")
    if (!userId) throw new Error("User ID is required")
    if (adjustmentQuantity === 0) throw new Error("Adjustment quantity cannot be zero")

    const result = await db.$transaction(async (tx) => {
      // Get current inventory
      const inventory = await tx.inventory.findFirst({
        where: {
          itemId,
          locationId,
          organizationId,
        },
        include: {
          item: true,
        },
      })

      if (!inventory) {
        throw new Error("Inventory record not found")
      }

      const newQuantity = Math.max(0, inventory.quantity + adjustmentQuantity)
      const adjustmentValue = adjustmentQuantity * inventory.averageCost

      // Update inventory
      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: newQuantity,
          totalValue: inventory.totalValue + adjustmentValue,
          lastUpdated: new Date(),
        },
      })

      // Create transaction record
      await tx.inventoryTransaction.create({
        data: {
          itemId,
          locationId,
          organizationId,
          type: adjustmentQuantity > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
          quantity: Math.abs(adjustmentQuantity),
          unitPrice: inventory.averageCost,
          totalValue: Math.abs(adjustmentValue),
          reference: "MANUAL_ADJUSTMENT",
          notes: reason,
          createdAt: new Date(),
        },
      })

      // Update item total quantity
      const totalInventory = await tx.inventory.aggregate({
        where: {
          itemId,
          organizationId,
        },
        _sum: {
          quantity: true,
        },
      })

      await tx.item.update({
        where: { id: itemId },
        data: {
          quantity: totalInventory._sum.quantity || 0,
          lastUpdated: new Date(),
        },
      })

      return inventory
    })

    revalidateTag("inventory")
    revalidateTag(`inventory-${organizationId}`)
    revalidateTag("items")
    revalidateTag(`items-${organizationId}`)
    revalidatePath("/dashboard/inventory")

    return {
      success: true,
      message: "Inventory adjustment completed successfully",
    }
  } catch (error) {
    console.error("Error creating inventory adjustment:", error)
    throw new Error("Failed to create inventory adjustment")
  }
}
