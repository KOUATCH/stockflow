"use server"

import { getAuthenticatedUser } from "@/lib/auth-server"
import { db } from "@/prisma/db"
import { Prisma, TransactionReferenceType, TransactionType } from "@prisma/client"
import { revalidatePath } from "next/cache"

export interface LocalInventoryLevel {
  id: string
  itemId: string
  locationId: string
  quantityOnHand: number
  quantityReserved: number
  quantityAvailable: number
  quantityInTransit: number
  quantityOnOrder: number
  unitCost: number
  totalValue: number
  reorderPoint: number
  maxStockLevel: number
  item: {
    id: string
    name: string
    sku: string
    category: string
    unit: string
  }
  location: {
    id: string
    name: string
    type: string
  }
}

export interface LocalInventoryTransaction {
  id: string
  type: string
  quantity: number
  unitCost: number
  totalCost: number
  referenceType: string
  referenceId: string
  itemId: string
  createdAt: Date
  item: {
    name: string
  }
}

export interface LocalInventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  overStockItems: number
  totalTransactions: number
  recentTransactions: LocalInventoryTransaction[]
}

export interface InventoryAlerts {
  lowStock: LocalInventoryLevel[]
  outOfStock: LocalInventoryLevel[]
  overStock: LocalInventoryLevel[]
}

export interface InventoryTransactionResponse {
  success: boolean
  data?: LocalInventoryTransaction[]
  error?: string | null
}

export interface InventoryLevelsResponse {
  success: boolean
  data?: LocalInventoryLevel[]
  error?: string | null
}

export type InventoryLevelResponse = InventoryLevelsResponse

export interface LocalInventoryStatsResponse {
  success: boolean
  data?: LocalInventoryStats
  error?: string | null
}

export type InventoryStatsResponse = LocalInventoryStatsResponse

const INVENTORY_REVALIDATION_PATHS = [
  "/[locale]/dashboard/inventory",
  "/[locale]/dashboard/inventory/items",
  "/[locale]/dashboard/inventory/stock",
] as const

function revalidateInventoryPaths() {
  for (const path of INVENTORY_REVALIDATION_PATHS) {
    revalidatePath(path, "page")
  }
}

function createId() {
  return crypto.randomUUID()
}

function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0
  }

  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    return Number(value) || 0
  }

  return value.toNumber()
}

function localizedName(entity: { nameEn?: string | null; nameFr?: string | null; titleEn?: string | null; titleFr?: string | null } | null | undefined) {
  if (!entity) return ""
  return entity.nameEn || entity.nameFr || entity.titleEn || entity.titleFr || ""
}

function mapInventoryLevel(level: any): LocalInventoryLevel {
  const itemName = localizedName(level.item) || level.item?.sku || "Unnamed item"
  const categoryName = localizedName(level.item?.category) || "Uncategorized"
  const unitName = localizedName(level.item?.unit) || level.item?.unit?.symbol || ""

  return {
    id: level.id,
    itemId: level.itemId,
    locationId: level.locationId,
    quantityOnHand: toNumber(level.quantityOnHand),
    quantityReserved: toNumber(level.quantityReserved),
    quantityAvailable: toNumber(level.quantityAvailable),
    quantityInTransit: toNumber(level.quantityInTransit),
    quantityOnOrder: toNumber(level.quantityOnOrder),
    unitCost: toNumber(level.averageCost),
    totalValue: toNumber(level.totalValue),
    reorderPoint: toNumber(level.reorderPoint),
    maxStockLevel: toNumber(level.item?.maxStockLevel),
    item: {
      id: level.item?.id ?? "",
      name: itemName,
      sku: level.item?.sku ?? "",
      category: categoryName,
      unit: unitName,
    },
    location: {
      id: level.location?.id ?? "",
      name: level.location?.name ?? "",
      type: level.location?.type ?? "",
    },
  }
}

function mapInventoryTransaction(transaction: any): LocalInventoryTransaction {
  return {
    id: transaction.id,
    type: transaction.type,
    quantity: toNumber(transaction.quantity),
    unitCost: toNumber(transaction.unitCost),
    totalCost: toNumber(transaction.totalCost),
    referenceType: transaction.referenceType ?? "",
    referenceId: transaction.referenceId ?? "",
    itemId: transaction.itemId,
    createdAt: transaction.createdAt,
    item: {
      name: localizedName(transaction.item) || transaction.item?.sku || "",
    },
  }
}

function normalizeReferenceType(referenceType?: string): TransactionReferenceType | undefined {
  if (!referenceType) return undefined
  return Object.values(TransactionReferenceType).includes(referenceType as TransactionReferenceType)
    ? referenceType as TransactionReferenceType
    : undefined
}

export async function getInventoryLevels(locationId?: string): Promise<InventoryLevelResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user.organizationId) {
      return {
        success: false,
        error: "User not authenticated or missing organization",
      }
    }

    const inventoryLevels = await db.inventoryLevel.findMany({
      where: {
        ...(locationId && { locationId }),
        item: {
          organizationId: user.organizationId,
          deletedAt: null,
        },
      },
      include: {
        item: {
          include: {
            category: true,
            unit: true,
          },
        },
        location: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return {
      success: true,
      data: inventoryLevels.map(mapInventoryLevel),
      error: null,
    }
  } catch (error) {
    console.error("Error fetching inventory levels:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getInventoryStats(): Promise<InventoryStatsResponse> {
  try {
    const inventoryLevelsResponse = await getInventoryLevels()
    if (!inventoryLevelsResponse.success || !inventoryLevelsResponse.data) {
      return {
        success: false,
        error: "Failed to fetch inventory levels for stats",
      }
    }

    const recentTransactionsResponse = await getInventoryTransactions({ limit: 5 })
    const levels = inventoryLevelsResponse.data
    const recentTransactions = recentTransactionsResponse.data ?? []

    return {
      success: true,
      data: {
        totalItems: levels.length,
        totalValue: levels.reduce((sum, level) => sum + level.totalValue, 0),
        lowStockItems: levels.filter((level) =>
          level.quantityAvailable <= level.reorderPoint && level.quantityAvailable > 0
        ).length,
        outOfStockItems: levels.filter((level) => level.quantityAvailable === 0).length,
        overStockItems: levels.filter((level) =>
          level.maxStockLevel > 0 && level.quantityAvailable > level.maxStockLevel
        ).length,
        totalTransactions: recentTransactions.length,
        recentTransactions,
      },
    }
  } catch (error) {
    console.error("Error fetching inventory stats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getInventoryTransactions(
  options: {
    limit?: number
    itemId?: string
    locationId?: string
    type?: TransactionType
  } = {}
): Promise<InventoryTransactionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user.organizationId) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    const { limit = 10, itemId, locationId, type } = options

    const transactions = await db.inventoryTransaction.findMany({
      where: {
        organizationId: user.organizationId,
        ...(itemId && { itemId }),
        ...(locationId && { locationId }),
        ...(type && { type }),
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
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
      },
    })

    return {
      success: true,
      data: transactions.map(mapInventoryTransaction),
    }
  } catch (error) {
    console.error("Error fetching inventory transactions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function updateInventoryLevel(
  inventoryLevelId: string,
  updates: {
    quantityOnHand?: number
    quantityReserved?: number
    unitCost?: number
    reorderPoint?: number
    maxStockLevel?: number
  }
): Promise<{ success: boolean; data?: LocalInventoryLevel; error?: string }> {
  try {
    const existingLevel = await db.inventoryLevel.findUnique({
      where: { id: inventoryLevelId },
      include: {
        item: true,
      },
    })

    if (!existingLevel) {
      return {
        success: false,
        error: "Inventory level not found",
      }
    }

    const nextQuantityOnHand = updates.quantityOnHand ?? toNumber(existingLevel.quantityOnHand)
    const nextQuantityReserved = updates.quantityReserved ?? toNumber(existingLevel.quantityReserved)
    const nextUnitCost = updates.unitCost ?? toNumber(existingLevel.averageCost)
    const nextQuantityAvailable = Math.max(0, nextQuantityOnHand - nextQuantityReserved)

    const updated = await db.$transaction(async (tx) => {
      if (updates.maxStockLevel !== undefined) {
        await tx.item.update({
          where: { id: existingLevel.itemId },
          data: {
            maxStockLevel: updates.maxStockLevel,
            updatedAt: new Date(),
          },
        })
      }

      return tx.inventoryLevel.update({
        where: { id: inventoryLevelId },
        data: {
          quantityOnHand: nextQuantityOnHand,
          quantityReserved: nextQuantityReserved,
          quantityAvailable: nextQuantityAvailable,
          averageCost: nextUnitCost,
          reorderPoint: updates.reorderPoint,
          totalValue: nextQuantityOnHand * nextUnitCost,
          updatedAt: new Date(),
        },
        include: {
          item: {
            include: {
              category: true,
              unit: true,
            },
          },
          location: true,
        },
      })
    })

    revalidateInventoryPaths()
    return {
      success: true,
      data: mapInventoryLevel(updated),
    }
  } catch (error) {
    console.error("Error updating inventory level:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function createInventoryTransaction(
  inventoryLevelId: string,
  transaction: {
    type: TransactionType
    quantity: number
    unitCost: number
    referenceType?: string
    referenceId?: string
    notes?: string
  }
): Promise<{ success: boolean; data?: LocalInventoryTransaction; error?: string }> {
  try {
    const user = await getAuthenticatedUser()
    if (!user.organizationId) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    const inventoryLevel = await db.inventoryLevel.findUnique({
      where: { id: inventoryLevelId },
      include: { item: true },
    })

    if (!inventoryLevel) {
      return {
        success: false,
        error: "Inventory level not found",
      }
    }

    const balanceAfter = toNumber(inventoryLevel.quantityOnHand) + transaction.quantity

    const newTransaction = await db.inventoryTransaction.create({
      data: {
        id: createId(),
        itemId: inventoryLevel.itemId,
        locationId: inventoryLevel.locationId,
        organizationId: user.organizationId,
        createdById: user.id,
        type: transaction.type,
        quantity: transaction.quantity,
        unitCost: transaction.unitCost,
        totalCost: transaction.quantity * transaction.unitCost,
        balanceAfter,
        referenceType: normalizeReferenceType(transaction.referenceType),
        referenceId: transaction.referenceId,
        serialNumbers: [],
        notes: transaction.notes,
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
      },
    })

    revalidateInventoryPaths()
    return {
      success: true,
      data: mapInventoryTransaction(newTransaction),
    }
  } catch (error) {
    console.error("Error creating inventory transaction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getLowStockItems(threshold = 10): Promise<InventoryLevelsResponse> {
  try {
    const inventoryLevelsResponse = await getInventoryLevels()
    if (!inventoryLevelsResponse.success || !inventoryLevelsResponse.data) {
      return inventoryLevelsResponse
    }

    return {
      success: true,
      data: inventoryLevelsResponse.data.filter((item) =>
        item.quantityAvailable <= threshold && item.quantityAvailable > 0
      ),
    }
  } catch (error) {
    console.error("Error fetching low stock items:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function bulkUpdateInventoryLevels(
  updates: Array<{
    inventoryLevelId: string
    updates: {
      quantityOnHand?: number
      quantityReserved?: number
      unitCost?: number
      reorderPoint?: number
      maxStockLevel?: number
    }
  }>
): Promise<{ success: boolean; data?: LocalInventoryLevel[]; error?: string }> {
  try {
    const updatedItems: LocalInventoryLevel[] = []

    for (const { inventoryLevelId, updates: itemUpdates } of updates) {
      const result = await updateInventoryLevel(inventoryLevelId, itemUpdates)
      if (result.success && result.data) {
        updatedItems.push(result.data)
      } else {
        throw new Error(result.error || "Failed to update inventory level")
      }
    }

    revalidateInventoryPaths()
    return {
      success: true,
      data: updatedItems,
    }
  } catch (error) {
    console.error("Error bulk updating inventory levels:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function getInventoryAlerts(): Promise<{ success: boolean; data?: InventoryAlerts; error?: string }> {
  try {
    const inventoryLevelsResponse = await getInventoryLevels()
    if (!inventoryLevelsResponse.success || !inventoryLevelsResponse.data) {
      return {
        success: false,
        error: "Failed to fetch inventory levels",
      }
    }

    const levels = inventoryLevelsResponse.data

    return {
      success: true,
      data: {
        lowStock: levels.filter((level) =>
          level.quantityAvailable <= level.reorderPoint && level.quantityAvailable > 0
        ),
        outOfStock: levels.filter((level) => level.quantityAvailable === 0),
        overStock: levels.filter((level) =>
          level.maxStockLevel > 0 && level.quantityAvailable > level.maxStockLevel
        ),
      },
    }
  } catch (error) {
    console.error("Error fetching inventory alerts:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
