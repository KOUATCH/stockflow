"use server"

import { db } from "@/prisma/db"
import {
  Prisma,
  TransactionReferenceType as PrismaTransactionReferenceType,
  TransactionType as PrismaTransactionType,
} from "@prisma/client"
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

const toNumber = (value: Prisma.Decimal | number | null | undefined) => {
  if (value instanceof Prisma.Decimal) return value.toNumber()
  return Number(value ?? 0)
}

const itemName = (item: { nameEn: string; nameFr: string | null }) => item.nameEn || item.nameFr || ""

const mapInventoryLevel = (
  level: Prisma.InventoryLevelGetPayload<{
    include: {
      item: {
        select: {
          id: true
          organizationId: true
          nameEn: true
          nameFr: true
          sku: true
          descriptionEn: true
          descriptionFr: true
          costPrice: true
          sellingPrice: true
          maxStockLevel: true
          category: {
            select: {
              id: true
              titleEn: true
              titleFr: true
            }
          }
        }
      }
      location: {
        select: {
          id: true
          name: true
          address: true
        }
      }
    }
  }>
): InventoryWithRelations => ({
  id: level.id,
  itemId: level.itemId,
  locationId: level.locationId,
  organizationId: level.item.organizationId,
  quantity: toNumber(level.quantityOnHand),
  totalValue: toNumber(level.totalValue),
  averageCost: toNumber(level.averageCost),
  reorderLevel: toNumber(level.reorderPoint),
  maxLevel: toNumber(level.item.maxStockLevel),
  lastUpdated: level.updatedAt,
  item: {
    id: level.item.id,
    name: itemName(level.item),
    sku: level.item.sku,
    description: level.item.descriptionEn ?? level.item.descriptionFr,
    category: level.item.category
      ? {
          id: level.item.category.id,
          name: level.item.category.titleEn ?? level.item.category.titleFr ?? "",
        }
      : null,
    costPrice: toNumber(level.item.costPrice),
    sellingPrice: toNumber(level.item.sellingPrice),
  },
  location: {
    id: level.location.id,
    name: level.location.name,
    address: level.location.address,
  },
})

const sortInventory = (
  inventory: InventoryWithRelations[],
  sortBy = "lastUpdated",
  sortOrder: "asc" | "desc" = "desc"
) => {
  const direction = sortOrder === "asc" ? 1 : -1
  const valueFor = (row: InventoryWithRelations) => {
    switch (sortBy) {
      case "quantity":
        return row.quantity
      case "totalValue":
        return row.totalValue
      case "averageCost":
        return row.averageCost
      case "reorderLevel":
        return row.reorderLevel
      case "name":
        return row.item.name
      case "sku":
        return row.item.sku
      case "location":
        return row.location.name
      default:
        return row.lastUpdated.getTime()
    }
  }

  return [...inventory].sort((a, b) => {
    const aValue = valueFor(a)
    const bValue = valueFor(b)
    if (typeof aValue === "string" || typeof bValue === "string") {
      return String(aValue).localeCompare(String(bValue)) * direction
    }
    return (Number(aValue) - Number(bValue)) * direction
  })
}

/**
 * Fetches inventory data with filters.
 */
export async function getInventory(filters: InventoryFilters) {
  try {
    if (!filters.organizationId) {
      throw new Error("Organization ID is required")
    }

    const page = Math.max(1, filters.page || 1)
    const limit = Math.min(100, Math.max(1, filters.limit || 20))
    const skip = (page - 1) * limit
    const search = filters.search?.trim()

    const where: Prisma.InventoryLevelWhereInput = {
      item: {
        organizationId: filters.organizationId,
        deletedAt: null,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(search && {
          OR: [
            { nameEn: { contains: search, mode: "insensitive" } },
            { nameFr: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { descriptionEn: { contains: search, mode: "insensitive" } },
            { descriptionFr: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      ...(filters.locationId && { locationId: filters.locationId }),
      ...(search && {
        OR: [
          {
            location: {
              name: { contains: search, mode: "insensitive" },
            },
          },
          {
            item: {
              organizationId: filters.organizationId,
              deletedAt: null,
              OR: [
                { nameEn: { contains: search, mode: "insensitive" } },
                { nameFr: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { descriptionEn: { contains: search, mode: "insensitive" } },
                { descriptionFr: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      }),
    }

    const levels = await db.inventoryLevel.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            organizationId: true,
            nameEn: true,
            nameFr: true,
            sku: true,
            descriptionEn: true,
            descriptionFr: true,
            costPrice: true,
            sellingPrice: true,
            maxStockLevel: true,
            category: {
              select: {
                id: true,
                titleEn: true,
                titleFr: true,
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
    })

    let inventory = levels.map(mapInventoryLevel)

    if (filters.lowStock) {
      inventory = inventory.filter((level) => level.quantity <= level.reorderLevel && level.quantity > 0)
    }

    if (filters.outOfStock) {
      inventory = inventory.filter((level) => level.quantity <= 0)
    }

    const sortedInventory = sortInventory(inventory, filters.sortBy, filters.sortOrder)
    const data = sortedInventory.slice(skip, skip + limit)
    const totalPages = Math.ceil(sortedInventory.length / limit)

    return {
      data,
      pagination: {
        page,
        limit,
        total: sortedInventory.length,
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
 * Fetches inventory summary statistics.
 */
export async function getInventorySummary(organizationId: string) {
  try {
    if (!organizationId) throw new Error("Organization ID is required")

    const [levels, totalValue, recentTransactions] = await Promise.all([
      db.inventoryLevel.findMany({
        where: {
          item: {
            organizationId,
            deletedAt: null,
          },
        },
        select: {
          locationId: true,
          quantityOnHand: true,
          quantityAvailable: true,
          reorderPoint: true,
        },
      }),
      db.inventoryLevel.aggregate({
        where: {
          item: {
            organizationId,
            deletedAt: null,
          },
        },
        _sum: { totalValue: true },
      }),
      db.inventoryTransaction.count({
        where: {
          organizationId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    const lowStockItems = levels.filter((level) => {
      const quantity = toNumber(level.quantityAvailable)
      return quantity <= toNumber(level.reorderPoint) && quantity > 0
    }).length

    const outOfStockItems = levels.filter((level) => toNumber(level.quantityAvailable) <= 0).length
    const totalLocations = new Set(levels.map((level) => level.locationId)).size

    return {
      totalItems: levels.length,
      totalValue: toNumber(totalValue._sum.totalValue),
      lowStockItems,
      outOfStockItems,
      totalLocations,
      recentTransactions,
    }
  } catch (error) {
    console.error("Error fetching inventory summary:", error)
    throw new Error("Failed to fetch inventory summary")
  }
}

/**
 * Fetches inventory transactions.
 */
export async function getInventoryTransactions(
  organizationId: string,
  itemId?: string,
  locationId?: string,
  limit = 50
): Promise<InventoryTransaction[]> {
  try {
    if (!organizationId) throw new Error("Organization ID is required")

    const transactions = await db.inventoryTransaction.findMany({
      where: {
        organizationId,
        ...(itemId && { itemId }),
        ...(locationId && { locationId }),
      },
      include: {
        item: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
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

    return transactions.map((transaction) => ({
      id: transaction.id,
      itemId: transaction.itemId,
      locationId: transaction.locationId,
      organizationId: transaction.organizationId,
      type: transaction.type,
      quantity: toNumber(transaction.quantity),
      unitPrice: toNumber(transaction.unitCost),
      totalValue: toNumber(transaction.totalCost),
      reference: transaction.referenceNumber ?? transaction.referenceId,
      notes: transaction.notes,
      createdAt: transaction.createdAt,
      item: {
        id: transaction.item.id,
        name: itemName(transaction.item),
        sku: transaction.item.sku,
      },
      location: {
        id: transaction.location.id,
        name: transaction.location.name,
      },
    }))
  } catch (error) {
    console.error("Error fetching inventory transactions:", error)
    throw new Error("Failed to fetch inventory transactions")
  }
}

/**
 * Updates inventory reorder levels.
 */
export async function updateReorderLevels(
  inventoryId: string,
  reorderLevel: number,
  maxLevel: number,
  organizationId: string
) {
  try {
    if (!inventoryId) throw new Error("Inventory ID is required")
    if (!organizationId) throw new Error("Organization ID is required")

    const inventory = await db.inventoryLevel.findFirst({
      where: {
        id: inventoryId,
        item: {
          organizationId,
          deletedAt: null,
        },
      },
    })

    if (!inventory) {
      throw new Error("Inventory record not found")
    }

    await db.$transaction([
      db.inventoryLevel.update({
        where: { id: inventoryId },
        data: {
          reorderPoint: new Prisma.Decimal(reorderLevel),
        },
      }),
      db.item.update({
        where: { id: inventory.itemId },
        data: {
          maxStockLevel: new Prisma.Decimal(maxLevel),
        },
      }),
    ])

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
 * Creates manual inventory adjustment.
 */
export async function createInventoryAdjustment(
  itemId: string,
  locationId: string,
  adjustmentQuantity: number,
  reason: string,
  organizationId: string,
  userId: string
) {
  try {
    if (!itemId) throw new Error("Item ID is required")
    if (!locationId) throw new Error("Location ID is required")
    if (!organizationId) throw new Error("Organization ID is required")
    if (!userId) throw new Error("User ID is required")
    if (adjustmentQuantity === 0) throw new Error("Adjustment quantity cannot be zero")

    await db.$transaction(async (tx) => {
      const inventory = await tx.inventoryLevel.findFirst({
        where: {
          itemId,
          locationId,
          item: {
            organizationId,
            deletedAt: null,
          },
        },
      })

      if (!inventory) {
        throw new Error("Inventory record not found")
      }

      const adjustment = new Prisma.Decimal(adjustmentQuantity)
      const newQuantity = Prisma.Decimal.max(new Prisma.Decimal(0), inventory.quantityOnHand.plus(adjustment))
      const quantityAvailable = newQuantity.minus(inventory.quantityReserved)
      const totalValue = newQuantity.mul(inventory.averageCost)
      const totalCost = adjustment.mul(inventory.averageCost)

      await tx.inventoryLevel.update({
        where: { id: inventory.id },
        data: {
          quantityOnHand: newQuantity,
          quantityAvailable,
          totalValue,
          lastTransactionAt: new Date(),
        },
      })

      await tx.inventoryTransaction.create({
        data: {
          itemId,
          locationId,
          organizationId,
          createdById: userId,
          type: adjustmentQuantity > 0 ? PrismaTransactionType.ADJUSTMENT_IN : PrismaTransactionType.ADJUSTMENT_OUT,
          quantity: adjustment,
          unitCost: inventory.averageCost,
          totalCost,
          referenceType: PrismaTransactionReferenceType.MANUAL,
          referenceNumber: "MANUAL_ADJUSTMENT",
          notes: reason,
          balanceAfter: newQuantity,
        },
      })
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
