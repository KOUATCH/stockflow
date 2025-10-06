"use server"

import { getAuthenticatedUser } from "@/lib/auth-server"
import { db } from "@/prisma/db"
import {
  TransactionReferenceType,
  TransactionType,
  type CreateInventoryLevelData,
  type InventoryLevel,
  type InventoryLevelResponse,
  type InventoryTransaction,
  type InventoryTransactionResponse,
  type LocationType,
  type StockAdjustmentData,
  type StockAdjustmentResponse,
  type UpdateInventoryLevelData,
} from "@/types/inventory"
import { revalidatePath } from "next/cache"

// Inventory Stats interface
export interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  totalTransactions: number
  recentTransactions: InventoryTransaction[]
}

export interface InventoryStatsResponse {
  success: boolean
  data?: InventoryStats
  error?: string | null
}

/**
 * Get inventory levels for a specific location or organization
 */
export async function getInventoryLevels(
  locationId?: string,
  organizationId?: string,
): Promise<InventoryLevelResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
        data: undefined,
      }
    }

    const userOrgId = organizationId || user.organizationId
    if (!userOrgId) {
      return {
        success: false,
        error: "Organization ID not found",
        data: undefined,
      }
    }

    console.log(`[v0] [getInventoryLevels] Fetching for org: ${userOrgId}, location: ${locationId || "all"}`)

    const whereClause: any = {
      item: {
        organizationId: userOrgId,
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
            slug: true,
            costPrice: true,
            sellingPrice: true,
            imageUrls: true,
            thumbnail: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    console.log(`[v0] [getInventoryLevels] Found ${inventoryLevels.length} inventory levels`)

    const mappedInventoryLevels: InventoryLevel[] = inventoryLevels.map((level) => ({
      id: level.id,
      itemId: level.itemId,
      locationId: level.locationId,
      quantityOnHand: level.quantityOnHand,
      quantityReserved: level.quantityReserved,
      quantityAvailable: level.quantityAvailable,
      quantityInTransit: level.quantityInTransit,
      quantityOnOrder: level.quantityOnOrder,
      averageCost: level.averageCost,
      totalValue: level.totalValue,
      reorderPoint: level.reorderPoint,
      lastCountDate: level.lastCountDate,
      lastTransactionAt: level.lastTransactionAt,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
      item: level.item
        ? {
            id: level.item.id,
            name: level.item.name,
            sku: level.item.sku,
            slug: level.item.slug,
            costPrice: level.item.costPrice,
            sellingPrice: level.item.sellingPrice,
            imageUrls: level.item.imageUrls,
            thumbnail: level.item.thumbnail,
          }
        : undefined,
      location: level.location
        ? {
            id: level.location.id,
            name: level.location.name,
            code: level.location.code,
            type: level.location.type as LocationType,
          }
        : undefined,
    }))

    return {
      success: true,
      data: mappedInventoryLevels,
      error: null,
    }
  } catch (error) {
    console.error("[getInventoryLevels] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch inventory levels",
      data: undefined,
    }
  }
}

/**
 * Get inventory statistics for an organization
 */
export async function getInventoryStats(organizationId?: string): Promise<InventoryStatsResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
        data: undefined,
      }
    }

    const userOrgId = organizationId || user.organizationId
    if (!userOrgId) {
      return {
        success: false,
        error: "Organization ID not found",
        data: undefined,
      }
    }

    console.log(`[v0] [getInventoryStats] Getting stats for org: ${userOrgId}`)

    // Get inventory levels
    const inventoryResult = await getInventoryLevels(undefined, userOrgId)
    if (!inventoryResult.success || !inventoryResult.data) {
      return {
        success: false,
        error: inventoryResult.error || "Failed to get inventory data",
        data: undefined,
      }
    }

    const inventoryLevels = inventoryResult.data

    // Get recent transactions count
    const transactionCount = await db.inventoryTransaction.count({
      where: {
        organizationId: userOrgId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    })

    // Get recent transactions
    const recentTransactionsData = await db.inventoryTransaction.findMany({
      where: {
        organizationId: userOrgId,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        item: {
          select: {
            name: true,
            sku: true,
          },
        },
        location: {
          select: {
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    })

    const recentTransactions: InventoryTransaction[] = recentTransactionsData.map((txn) => ({
      id: txn.id,
      type: txn.type as TransactionType,
      quantity: txn.quantity,
      unitCost: txn.unitCost,
      totalCost: txn.totalCost,
      notes: txn.notes,
      itemId: txn.itemId,
      locationId: txn.locationId,
      organizationId: txn.organizationId,
      createdById: txn.createdById,
      referenceType: txn.referenceType as TransactionReferenceType | null,
      referenceId: txn.referenceId,
      referenceNumber: txn.referenceNumber,
      batchNumber: txn.batchNumber,
      serialNumbers: Array.isArray(txn.serialNumbers) ? txn.serialNumbers : [],
      expiryDate: txn.expiryDate,
      balanceAfter: txn.balanceAfter,
      createdAt: txn.createdAt,
      item: txn.item
        ? {
            name: txn.item.name,
            sku: txn.item.sku,
          }
        : undefined,
      location: txn.location
        ? {
            name: txn.location.name,
            code: txn.location.code,
          }
        : undefined,
      createdBy: txn.createdBy
        ? {
            name: txn.createdBy.name,
          }
        : undefined,
    }))

    // Calculate stats
    const totalItems = inventoryLevels.length
    const totalValue = inventoryLevels.reduce((sum, level) => sum + level.totalValue, 0)
    const lowStockItems = inventoryLevels.filter(
      (level) => level.quantityAvailable <= level.reorderPoint && level.quantityAvailable > 0,
    ).length
    const outOfStockItems = inventoryLevels.filter((level) => level.quantityAvailable <= 0).length

    const stats: InventoryStats = {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      totalTransactions: transactionCount,
      recentTransactions,
    }

    console.log(`[v0] [getInventoryStats] Calculated stats:`, {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      transactionCount,
    })

    return {
      success: true,
      data: stats,
      error: null,
    }
  } catch (error) {
    console.error("[getInventoryStats] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get inventory stats",
      data: undefined,
    }
  }
}

/**
 * Get inventory transactions with filtering options
 */
export async function getInventoryTransactions(
  options: {
    limit?: number
    itemId?: string
    locationId?: string
    type?: TransactionType
    organizationId?: string
  } = {},
): Promise<InventoryTransactionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
        data: undefined,
      }
    }

    const { limit = 50, itemId, locationId, type, organizationId } = options

    const userOrgId = organizationId || user.organizationId
    if (!userOrgId) {
      return {
        success: false,
        error: "Organization ID not found",
        data: undefined,
      }
    }

    console.log(`[v0] [getInventoryTransactions] Fetching transactions for org: ${userOrgId}`, options)

    const whereClause: any = {
      organizationId: userOrgId,
    }

    if (itemId) whereClause.itemId = itemId
    if (locationId) whereClause.locationId = locationId
    if (type) whereClause.type = type

    const transactions = await db.inventoryTransaction.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        item: {
          select: {
            name: true,
            sku: true,
          },
        },
        location: {
          select: {
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    })

    console.log(`[v0] [getInventoryTransactions] Found ${transactions.length} transactions`)

    const mappedTransactions: InventoryTransaction[] = transactions.map((txn) => ({
      id: txn.id,
      type: txn.type as TransactionType,
      quantity: txn.quantity,
      unitCost: txn.unitCost,
      totalCost: txn.totalCost,
      notes: txn.notes,
      itemId: txn.itemId,
      locationId: txn.locationId,
      organizationId: txn.organizationId,
      createdById: txn.createdById,
      referenceType: txn.referenceType as TransactionReferenceType | null,
      referenceId: txn.referenceId,
      referenceNumber: txn.referenceNumber,
      batchNumber: txn.batchNumber,
      serialNumbers: Array.isArray(txn.serialNumbers) ? txn.serialNumbers : [],
      expiryDate: txn.expiryDate,
      balanceAfter: txn.balanceAfter,
      createdAt: txn.createdAt,
      item: txn.item
        ? {
            name: txn.item.name,
            sku: txn.item.sku,
          }
        : undefined,
      location: txn.location
        ? {
            name: txn.location.name,
            code: txn.location.code,
          }
        : undefined,
      createdBy: txn.createdBy
        ? {
            name: txn.createdBy.name,
          }
        : undefined,
    }))

    return {
      success: true,
      data: mappedTransactions,
      error: null,
    }
  } catch (error) {
    console.error("[getInventoryTransactions] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch inventory transactions",
      data: undefined,
    }
  }
}

export async function updateInventoryLevel(
  inventoryLevelId: string,
  updates: UpdateInventoryLevelData,
): Promise<InventoryLevelResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
        data: undefined,
      }
    }

    if (!inventoryLevelId) {
      return {
        success: false,
        error: "Inventory level ID is required",
        data: undefined,
      }
    }

    console.log(`[v0] [updateInventoryLevel] Updating level ${inventoryLevelId}`, updates)

    const result = await db.$transaction(async (tx) => {
      // Get current level first
      const currentLevel = await tx.inventoryLevel.findUnique({
        where: { id: inventoryLevelId },
        include: {
          item: {
            select: {
              organizationId: true,
            },
          },
        },
      })

      if (!currentLevel) {
        throw new Error("Inventory level not found")
      }

      if (currentLevel.item.organizationId !== user.organizationId) {
        throw new Error("Access denied to this inventory level")
      }

      // Calculate derived values
      const calculatedUpdates: any = { ...updates }

      if (updates.quantityOnHand !== undefined) {
        const newQuantityReserved = updates.quantityReserved ?? currentLevel.quantityReserved
        calculatedUpdates.quantityAvailable = updates.quantityOnHand - newQuantityReserved
        calculatedUpdates.totalValue = updates.quantityOnHand * (updates.averageCost ?? currentLevel.averageCost)
      }

      if (updates.quantityReserved !== undefined && updates.quantityOnHand === undefined) {
        calculatedUpdates.quantityAvailable = currentLevel.quantityOnHand - updates.quantityReserved
      }

      calculatedUpdates.lastTransactionAt = new Date()

      return await tx.inventoryLevel.update({
        where: { id: inventoryLevelId },
        data: calculatedUpdates,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              sku: true,
              slug: true,
              costPrice: true,
              sellingPrice: true,
              imageUrls: true,
              thumbnail: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
            },
          },
        },
      })
    })

    const mappedLevel: InventoryLevel = {
      id: result.id,
      itemId: result.itemId,
      locationId: result.locationId,
      quantityOnHand: result.quantityOnHand,
      quantityReserved: result.quantityReserved,
      quantityAvailable: result.quantityAvailable,
      quantityInTransit: result.quantityInTransit,
      quantityOnOrder: result.quantityOnOrder,
      averageCost: result.averageCost,
      totalValue: result.totalValue,
      reorderPoint: result.reorderPoint,
      lastCountDate: result.lastCountDate,
      lastTransactionAt: result.lastTransactionAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      item: result.item
        ? {
            id: result.item.id,
            name: result.item.name,
            sku: result.item.sku,
            slug: result.item.slug,
            costPrice: result.item.costPrice,
            sellingPrice: result.item.sellingPrice,
            imageUrls: result.item.imageUrls,
            thumbnail: result.item.thumbnail,
          }
        : undefined,
      location: result.location
        ? {
            id: result.location.id,
            name: result.location.name,
            code: result.location.code,
            type: result.location.type as LocationType,
          }
        : undefined,
    }

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/pos")

    return {
      success: true,
      data: [mappedLevel],
      error: null,
    }
  } catch (error) {
    console.error("[updateInventoryLevel] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update inventory level",
      data: undefined,
    }
  }
}

export async function createInventoryTransaction(data: {
  type: TransactionType
  quantity: number
  unitCost: number
  notes?: string
  itemId: string
  locationId: string
  organizationId?: string
  createdById?: string
  referenceType?: TransactionReferenceType
  referenceId?: string
  referenceNumber?: string
  batchNumber?: string
  serialNumbers?: string[]
  expiryDate?: Date
}): Promise<InventoryTransactionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
        data: undefined,
      }
    }

    if (!data.itemId || !data.locationId) {
      return {
        success: false,
        error: "Item ID and Location ID are required",
        data: undefined,
      }
    }

    if (data.quantity === 0) {
      return {
        success: false,
        error: "Transaction quantity cannot be zero",
        data: undefined,
      }
    }

    const userOrgId = data.organizationId || user.organizationId
    const userId = data.createdById || user.id

    if (!userOrgId) {
      return {
        success: false,
        error: "Organization ID not found",
        data: undefined,
      }
    }

    console.log(`[v0] [createInventoryTransaction] Creating transaction`, data)

    const result = await db.$transaction(async (tx) => {
      // Get current inventory level
      const inventoryLevel = await tx.inventoryLevel.findFirst({
        where: {
          itemId: data.itemId,
          locationId: data.locationId,
          item: {
            organizationId: userOrgId,
          },
        },
      })

      if (!inventoryLevel) {
        throw new Error("Inventory level not found for this item and location")
      }

      const balanceAfter = inventoryLevel.quantityOnHand + data.quantity

      const location = await tx.location.findUnique({
        where: { id: data.locationId },
        select: { allowNegativeStock: true },
      })

      if (!location?.allowNegativeStock && balanceAfter < 0) {
        throw new Error(
          `Insufficient stock. Available: ${inventoryLevel.quantityOnHand}, Requested: ${Math.abs(data.quantity)}`,
        )
      }

      // Create transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          type: data.type,
          quantity: data.quantity,
          unitCost: data.unitCost,
          totalCost: data.quantity * data.unitCost,
          notes: data.notes,
          itemId: data.itemId,
          locationId: data.locationId,
          organizationId: userOrgId,
          createdById: userId,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          referenceNumber: data.referenceNumber,
          batchNumber: data.batchNumber,
          serialNumbers: data.serialNumbers || [],
          expiryDate: data.expiryDate,
          balanceAfter: balanceAfter,
        },
        include: {
          item: {
            select: {
              name: true,
              sku: true,
            },
          },
          location: {
            select: {
              name: true,
              code: true,
            },
          },
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      })

      // Update inventory level
      await tx.inventoryLevel.update({
        where: { id: inventoryLevel.id },
        data: {
          quantityOnHand: balanceAfter,
          quantityAvailable: balanceAfter - inventoryLevel.quantityReserved,
          lastTransactionAt: new Date(),
          totalValue: balanceAfter * inventoryLevel.averageCost,
        },
      })

      return transaction
    })

    const mappedTransaction: InventoryTransaction = {
      id: result.id,
      type: result.type as TransactionType,
      quantity: result.quantity,
      unitCost: result.unitCost,
      totalCost: result.totalCost,
      notes: result.notes,
      itemId: result.itemId,
      locationId: result.locationId,
      organizationId: result.organizationId,
      createdById: result.createdById,
      referenceType: result.referenceType as TransactionReferenceType | null,
      referenceId: result.referenceId,
      referenceNumber: result.referenceNumber,
      batchNumber: result.batchNumber,
      serialNumbers: Array.isArray(result.serialNumbers) ? result.serialNumbers : [],
      expiryDate: result.expiryDate,
      balanceAfter: result.balanceAfter,
      createdAt: result.createdAt,
      item: result.item
        ? {
            name: result.item.name,
            sku: result.item.sku,
          }
        : undefined,
      location: result.location
        ? {
            name: result.location.name,
            code: result.location.code,
          }
        : undefined,
      createdBy: result.createdBy
        ? {
            name: result.createdBy.name,
          }
        : undefined,
    }

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/pos")

    return {
      success: true,
      data: [mappedTransaction],
      error: null,
    }
  } catch (error) {
    console.error("[createInventoryTransaction] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create inventory transaction",
      data: undefined,
    }
  }
}

/**
 * Get low stock items
 */
export async function getLowStockItems(threshold = 10, organizationId?: string): Promise<InventoryLevelResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
        data: undefined,
      }
    }

    const userOrgId = organizationId || user.organizationId
    const inventoryResult = await getInventoryLevels(undefined, userOrgId)

    if (!inventoryResult.success || !inventoryResult.data) {
      return inventoryResult
    }

    const lowStockItems = inventoryResult.data.filter(
      (item) => item.quantityAvailable <= threshold && item.quantityAvailable > 0,
    )

    return {
      success: true,
      data: lowStockItems,
      error: null,
    }
  } catch (error) {
    console.error("[getLowStockItems] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch low stock items",
      data: undefined,
    }
  }
}

/**
 * Get inventory alerts (low stock, out of stock, overstock)
 */
export async function getInventoryAlerts(organizationId?: string): Promise<{
  success: boolean
  data?: {
    lowStock: InventoryLevel[]
    outOfStock: InventoryLevel[]
    overStock: InventoryLevel[]
  }
  error?: string
}> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    const userOrgId = organizationId || user.organizationId
    const inventoryResult = await getInventoryLevels(undefined, userOrgId)

    if (!inventoryResult.success || !inventoryResult.data) {
      return {
        success: false,
        error: inventoryResult.error || "Failed to get inventory data",
      }
    }

    const inventoryLevels = inventoryResult.data

    const lowStock = inventoryLevels.filter(
      (level) => level.quantityAvailable <= level.reorderPoint && level.quantityAvailable > 0,
    )

    const outOfStock = inventoryLevels.filter((level) => level.quantityAvailable <= 0)

    const overStock = inventoryLevels.filter(
      (level) => level.maxStockLevel > 0 && level.quantityAvailable > level.maxStockLevel,
    )

    return {
      success: true,
      data: { lowStock, outOfStock, overStock },
    }
  } catch (error) {
    console.error("[getInventoryAlerts] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch inventory alerts",
    }
  }
}

/**
 * Bulk update inventory levels
 */
export async function bulkUpdateInventoryLevels(
  updates: Array<{
    inventoryLevelId: string
    updates: {
      quantityOnHand?: number
      quantityReserved?: number
      unitCost?: number
      averageCost?: number
      reorderPoint?: number
      maxStockLevel?: number
    }
  }>,
): Promise<InventoryLevelResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
        data: undefined,
      }
    }

    console.log(`[bulkUpdateInventoryLevels] Updating ${updates.length} inventory levels`)

    const updatedLevels: InventoryLevel[] = []

    for (const { inventoryLevelId, updates: itemUpdates } of updates) {
      const result = await updateInventoryLevel(inventoryLevelId, itemUpdates)
      if (result.success && result.data) {
        updatedLevels.push(...result.data)
      } else {
        console.error(`Failed to update inventory level ${inventoryLevelId}:`, result.error)
      }
    }

    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/pos")

    return {
      success: true,
      data: updatedLevels,
      error: null,
    }
  } catch (error) {
    console.error("[bulkUpdateInventoryLevels] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to bulk update inventory levels",
      data: undefined,
    }
  }
}

export async function performStockAdjustment(adjustments: StockAdjustmentData[]): Promise<StockAdjustmentResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
        data: undefined,
      }
    }

    if (!adjustments || adjustments.length === 0) {
      return {
        success: false,
        error: "No adjustments provided",
        data: undefined,
      }
    }

    console.log(`[v0] [performStockAdjustment] Processing ${adjustments.length} adjustments`)

    const results: Array<{
      inventoryLevel: InventoryLevel
      transaction: InventoryTransaction
    }> = []

    await db.$transaction(async (tx) => {
      for (const adjustment of adjustments) {
        // Validate adjustment data
        if (!adjustment.itemId || !adjustment.locationId) {
          throw new Error("Item ID and Location ID are required for all adjustments")
        }

        if (adjustment.adjustmentQuantity === 0) {
          continue // Skip zero adjustments
        }

        // Create transaction
        const transactionType =
          adjustment.adjustmentQuantity > 0 ? TransactionType.ADJUSTMENT_IN : TransactionType.ADJUSTMENT_OUT

        const transactionResult = await createInventoryTransaction({
          type: transactionType,
          quantity: adjustment.adjustmentQuantity,
          unitCost: adjustment.unitCost || 0,
          notes: adjustment.notes,
          itemId: adjustment.itemId,
          locationId: adjustment.locationId,
          referenceType: adjustment.referenceType || TransactionReferenceType.STOCK_ADJUSTMENT,
          referenceNumber: adjustment.referenceNumber,
          batchNumber: adjustment.batchNumber,
          expiryDate: adjustment.expiryDate,
        })

        if (!transactionResult.success || !transactionResult.data) {
          throw new Error(`Failed to create transaction for adjustment: ${transactionResult.error}`)
        }

        // Get updated inventory level
        const inventoryResult = await getInventoryLevels(adjustment.locationId)
        if (inventoryResult.success && inventoryResult.data) {
          const updatedLevel = inventoryResult.data.find(
            (level) => level.itemId === adjustment.itemId && level.locationId === adjustment.locationId,
          )

          if (updatedLevel && transactionResult.data[0]) {
            results.push({
              inventoryLevel: updatedLevel,
              transaction: transactionResult.data[0],
            })
          }
        }
      }
    })

    revalidatePath("/dashboard/inventory")

    return {
      success: true,
      data: results,
      error: null,
    }
  } catch (error) {
    console.error("[performStockAdjustment] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to perform stock adjustment",
      data: undefined,
    }
  }
}

export async function createInventoryLevel(data: CreateInventoryLevelData): Promise<InventoryLevelResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
        data: undefined,
      }
    }

    // Validate input
    if (!data.itemId || !data.locationId) {
      return {
        success: false,
        error: "Item ID and Location ID are required",
        data: undefined,
      }
    }

    console.log(`[v0] [createInventoryLevel] Creating inventory level`, data)

    // Check if inventory level already exists
    const existing = await db.inventoryLevel.findFirst({
      where: {
        itemId: data.itemId,
        locationId: data.locationId,
      },
    })

    if (existing) {
      return {
        success: false,
        error: "Inventory level already exists for this item and location",
        data: undefined,
      }
    }

    const quantityReserved = data.quantityReserved || 0
    const averageCost = data.averageCost || 0
    const reorderPoint = data.reorderPoint || 0

    const inventoryLevel = await db.inventoryLevel.create({
      data: {
        itemId: data.itemId,
        locationId: data.locationId,
        quantityOnHand: data.quantityOnHand,
        quantityReserved,
        quantityAvailable: data.quantityOnHand - quantityReserved,
        quantityInTransit: 0,
        quantityOnOrder: 0,
        averageCost,
        totalValue: data.quantityOnHand * averageCost,
        reorderPoint,
        lastTransactionAt: new Date(),
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
            slug: true,
            costPrice: true,
            sellingPrice: true,
            imageUrls: true,
            thumbnail: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
      },
    })

    const mappedLevel: InventoryLevel = {
      id: inventoryLevel.id,
      itemId: inventoryLevel.itemId,
      locationId: inventoryLevel.locationId,
      quantityOnHand: inventoryLevel.quantityOnHand,
      quantityReserved: inventoryLevel.quantityReserved,
      quantityAvailable: inventoryLevel.quantityAvailable,
      quantityInTransit: inventoryLevel.quantityInTransit,
      quantityOnOrder: inventoryLevel.quantityOnOrder,
      averageCost: inventoryLevel.averageCost,
      totalValue: inventoryLevel.totalValue,
      reorderPoint: inventoryLevel.reorderPoint,
      lastCountDate: inventoryLevel.lastCountDate,
      lastTransactionAt: inventoryLevel.lastTransactionAt,
      createdAt: inventoryLevel.createdAt,
      updatedAt: inventoryLevel.updatedAt,
      item: inventoryLevel.item
        ? {
            id: inventoryLevel.item.id,
            name: inventoryLevel.item.name,
            sku: inventoryLevel.item.sku,
            slug: inventoryLevel.item.slug,
            costPrice: inventoryLevel.item.costPrice,
            sellingPrice: inventoryLevel.item.sellingPrice,
            imageUrls: inventoryLevel.item.imageUrls,
            thumbnail: inventoryLevel.item.thumbnail,
          }
        : undefined,
      location: inventoryLevel.location
        ? {
            id: inventoryLevel.location.id,
            name: inventoryLevel.location.name,
            code: inventoryLevel.location.code,
            type: inventoryLevel.location.type as LocationType,
          }
        : undefined,
    }

    revalidatePath("/dashboard/inventory")

    return {
      success: true,
      data: [mappedLevel],
      error: null,
    }
  } catch (error) {
    console.error("[createInventoryLevel] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create inventory level",
      data: undefined,
    }
  }
}
