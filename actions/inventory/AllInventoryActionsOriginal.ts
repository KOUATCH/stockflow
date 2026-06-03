"use server"
import { getAuthenticatedUser } from "@/lib/auth-server";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export interface InventoryLevel {
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
  averageCost:number,
 createdAt:Date,
 updatedAt:Date,
  
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

export interface InventoryTransaction {
  inventoryLevels: InventoryLevel[];
  id: string
  // inventoryLevelId: string
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

export interface InventoryStats {
  totalItems: number | undefined;
  totalValue: number | undefined;
  lowStockItems: number | undefined;
  outOfStockItems: number | undefined;
  totalTransactions: any;
  recentTransactions: InventoryTransaction[]
}

export interface InventoryTransactionResponse {
  success: boolean
  data?: InventoryTransaction[]
  error?: string | null
}

export interface InventoryLevelsResponse {
  success: boolean
  data?: InventoryLevel[]
  error?: string | null
}

export interface InventoryStatsResponse {
  success: boolean
  data?: InventoryStats
  error?: string | null
}

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value) || 0
}

function localizedName(entity: any): string {
  if (!entity) return ""
  return entity.nameEn ?? entity.nameFr ?? entity.titleEn ?? entity.titleFr ?? entity.name ?? entity.title ?? ""
}

function mapInventoryLevel(level: any): InventoryLevel {
  const itemName = localizedName(level.item) || level.item?.sku || ""
  const categoryName = localizedName(level.item?.category) || level.item?.categoryId || ""
  const unitName = localizedName(level.item?.unit) || level.item?.unit?.symbol || level.item?.unitId || ""

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
    averageCost: toNumber(level.averageCost),
    createdAt: level.createdAt ?? new Date(),
    updatedAt: level.updatedAt ?? new Date(),
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

export async function getInventoryLevels(locationId?: string): Promise<InventoryLevelsResponse> {
  try {
    const user = await getAuthenticatedUser()
    const getOrgInventoryLevels = await db.inventoryLevel.findMany({
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
      }
    })
    console.log("[v0] Found inventory levels:", getOrgInventoryLevels.length)
    const mappedInventoryLevels = getOrgInventoryLevels.map(mapInventoryLevel)
    return {
      data: mappedInventoryLevels,
      error: null,
      success: true
    }

  } catch (error) {
    console.error("Error fetching inventory levels:", error)
    throw error
  }
}

export async function getInventoryStats(): Promise<InventoryStatsResponse> {
  try {
    const user = await getAuthenticatedUser()
    const userOrgId = user.organizationId
    console.log(`[v0] Getting inventory stats for org:", ${userOrgId}`)

    const inventoryLevels = await getInventoryLevels()
    const invenLevelData = inventoryLevels.data
    const totalItems = invenLevelData?.length
    const totalValue = invenLevelData?.reduce((sum, level) => sum + level.totalValue, 0)
    const lowStockItems = invenLevelData?.filter(
      (level) => level.quantityAvailable <= level.quantityReserved && level.quantityAvailable > 0,
    ).length
    const outOfStockItems = invenLevelData?.filter((level) => level.quantityAvailable === 0).length

    const stats = {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      totalTransactions: 0, // or provide actual value if available
      recentTransactions: [], // or provide actual recent transactions if available
    }

    console.log("[v0] Calculated inventory stats:", stats)
    return {
      data: stats,
      success: true,
      error: null
    }
  } catch (error) {
    console.error("Error fetching inventory stats:", error)
    throw error
  }
}


export async function getInventoryTransactions(
  // organizationId: string, 
  limit: number,
  options: {
    limit?: number;
    itemId?: string;
    locationId?: string;
    type?: string;
  } = {},
): Promise<InventoryTransaction[]> {
  try {
    const user = await getAuthenticatedUser()
    const userOrgId = user.organizationId

    console.log("[v0] Getting inventory transactions for org:", userOrgId, "with options:", options)

    const { limit: queryLimit = 10, itemId, locationId, type } = options

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const invenTranx = await db.inventoryTransaction.findMany({
      where: {
        organizationId: userOrgId,
        ...(itemId && { itemId }),
        ...(locationId && { locationId }),
        ...(type && { type: type as any }),
      },
      take: queryLimit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        item: {
          include: {
            inventoryLevels: {
              where: locationId ? { locationId } : {},
              select: {
                id: true,
                quantityOnHand: true,
                quantityAvailable: true,
                quantityReserved: true,
                locationId: true
              }
            }
          }
        },
        location: true,
        organization: true,
        createdBy: true,
      }
    })

    let filteredTransactions = invenTranx
    // Apply filters
    if (itemId) {
      const inventoryLevel = invenTranx.find((inv) => inv?.item?.id === itemId)
      if (inventoryLevel) {
        filteredTransactions = invenTranx.filter((txn) =>
          Array.isArray(txn.item.inventoryLevels) &&
          txn.item.inventoryLevels.some((level: any) => level.id === inventoryLevel.id)
        )
      }
    }

    if (locationId) {
      const inventoryLevels = invenTranx.filter((inv) => inv.locationId === locationId)
      const levelIds = inventoryLevels.map((inv) => inv.id)
      filteredTransactions = filteredTransactions.filter((txn) =>
        Array.isArray(txn.item.inventoryLevels) &&
        txn.item.inventoryLevels.some((level: any) => levelIds.includes(level.id))
      )
    }

    // if (type) {
    //   filteredTransactions = filteredTransactions.filter((txn) => txn.type === type)
    // }
    console.log("[v0] Found transactions:", invenTranx.length)
    // Map DB results to InventoryTransaction type, ensuring referenceType and referenceId are strings
    const mappedTransactions: InventoryTransaction[] = filteredTransactions.map((txn) => {
      const unitCost = toNumber(txn.unitCost)
      const quantity = toNumber(txn.quantity)
      const totalCost = toNumber(txn.totalCost)

      return {
      inventoryLevels: Array.isArray(txn.item?.inventoryLevels)
        ? txn.item.inventoryLevels.map((level: any) => ({
            id: level.id,
            itemId: txn.itemId,
            locationId: level.locationId,
            quantityOnHand: toNumber(level.quantityOnHand),
            quantityReserved: toNumber(level.quantityReserved),
            quantityAvailable: toNumber(level.quantityAvailable),
            quantityInTransit: 0,
            quantityOnOrder: 0,
            unitCost,
            totalValue: toNumber(level.quantityOnHand) * unitCost,
            reorderPoint: 0,
            maxStockLevel: 0,
            averageCost: unitCost,
            createdAt: txn.createdAt,
            updatedAt: txn.createdAt,
            item: {
              id: txn.itemId,
              name: localizedName(txn.item) || txn.item?.sku || "",
              sku: txn.item?.sku ?? "",
              category: txn.item?.brandId ?? "",
              unit: txn.item?.unitId  ?? "",
            },
            location: {
              id: level.locationId,
              name: txn.location?.name ?? "",
              type: txn.location?.type ?? "",
            },
          }))
        : [],
      id: txn.id,
      // inventoryLevelId: txn.inventoryLevelId, // Uncomment if needed in your type
      type: txn.type,
      quantity,
      unitCost,
      totalCost,
      referenceType: txn.referenceType ?? "",
      referenceId: txn.referenceId ?? "",
      itemId: txn.itemId,
      createdAt: txn.createdAt,
      item: {
        name: localizedName(txn.item) || txn.item?.sku || "",
      },
    }});
    return mappedTransactions
  } catch (error) {
    console.error("Error fetching inventory transactions:", error)
    throw error
  }
}


// export async function updateInventoryLevel(
//   inventoryLevelId: string,
//   updates: {
//     onHandQuantity?: number
//     reservedQuantity?: number
//     unitCost?: number
//     reorderPoint?: number
//     maxStockLevel?: number
//   },
// ): Promise<InventoryLevel> {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 400))

//   // In real implementation:
//   const updated = await db.inventoryLevel.update({
//     where: { id: inventoryLevelId },
//     data: {
//       ...updates,
//       quantityAvailable: updates.onHandQuantity !== undefined
//         ? updates.onHandQuantity - (updates.reservedQuantity ?? 0)
//         : undefined,
//       totalValue: updates.onHandQuantity !== undefined && updates.unitCost !== undefined
//         ? updates.onHandQuantity * updates.unitCost
//         : undefined
//     },
//     include: {
//       item: true,
//       location: true
//     }
//   })

//   const inventeoryLevelItem = updated.((level:any) => level.id === inventoryLevelId)
//   if (!inventeoryLevelItem) {
//     throw new Error("Inventory level not found")
//   }

//   const updatedItem = {
//     ...inventeoryLevelItem,
//     ...updates,
//     availableQuantity:
//       (updates.onHandQuantity ?? inventeoryLevelItem.onHandQuantity) - (updates.reservedQuantity ?? inventeoryLevelItem.reservedQuantity),
//     totalValue: (updates.onHandQuantity ?? inventeoryLevelItem.onHandQuantity) * (updates.unitCost ?? inventeoryLevelItem.unitCost),
//   }

//   // Ensure all required InventoryLevel fields are present
//   const inventoryLevel: InventoryLevel = {
//     id: updatedItem.id,
//     itemId: updatedItem.itemId,
//     locationId: updatedItem.locationId,
//     quantityOnHand: updates.onHandQuantity ?? inventeoryLevelItem.onHandQuantity,
//     quantityReserved: updates.reservedQuantity ?? inventeoryLevelItem.reservedQuantity,
//     quantityAvailable:
//       (updates.onHandQuantity ?? inventeoryLevelItem.onHandQuantity) - (updates.reservedQuantity ?? inventeoryLevelItem.reservedQuantity),
//     quantityInTransit: inventeoryLevelItem?.reservedQuantity ?? 0,
//     quantityOnOrder: inventeoryLevelItem.reservedQuantity ?? 0,
//     unitCost: updates.unitCost ?? inventeoryLevelItem.unitCost,
//     totalValue: (updates.onHandQuantity ?? inventeoryLevelItem.onHandQuantity) * (updates.unitCost ?? inventeoryLevelItem.unitCost),
//     reorderPoint: updates.reorderPoint ?? inventeoryLevelItem.reorderPoint,
//     maxStockLevel: updates.maxStockLevel ?? inventeoryLevelItem.maxStockLevel,
//     averageCost: updates.unitCost ?? inventeoryLevelItem.unitCost, // or provide a better calculation if available
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     item: updatedItem.item,
//     location: updatedItem.location,
//   }

//   revalidatePath("/dashboard/inventory")
//   revalidatePath("/")

//   return inventoryLevel
// }

// export async function createInventoryTransaction(
//   inventoryLevelId: string,
//   transaction: {
//     type: string
//     quantity: number
//     unitCost: number
//     referenceType?: string
//     referenceId?: string
//     notes?: string
//   },
// ): Promise<InventoryTransaction> {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 300))

//   // In real implementation:
//   const newTransaction = await db.inventoryTransaction.create({
//     data: {
//       inventoryLevelId,
//       ...transaction,
//       totalCost: transaction.quantity * transaction.unitCost
//     },
//     include: {
//       inventoryLevel: {
//         include: { item: true }
//       }
//     }
//   })

//   const inventeoryLevelItem = mockInventoryData.find((item) => item.id === inventoryLevelId)
//   if (!inventeoryLevelItem) {
//     throw new Error("Inventory level not found")
//   }

//   const newTransaction: InventoryTransaction = {
//     id: `txn-${Date.now()}`,
//     type: transaction.type,
//     quantity: transaction.quantity,
//     unitCost: transaction.unitCost,
//     referenceType: transaction.referenceType ?? "",
//     referenceId: transaction.referenceId ?? "",
//     totalCost: transaction.quantity * transaction.unitCost,
//     itemId: inventeoryLevelItem.itemId,
//     createdAt: new Date(),
//     item: {
//       name: inventeoryLevelItem.item.name,
//     },
//   }

//   revalidatePath("/dashboard/inventory")
//   revalidatePath("/")

//   return newTransaction
// }

// export async function getLowStockItems(threshold = 10): Promise<InventoryLevelsResponse> {
//   try {
//     const user = await getAuthenticatedUser()
//     if (!user) {
//       throw new Error("User not authenticated")
//     }
//     const userOrgId = user.organizationId

//     // Simulate API delay
//     await new Promise((resolve) => setTimeout(resolve, 300))

//     const lowStockItems = mockInventoryData.filter(
//       (item) => item?.availableQuantity <= threshold && item?.availableQuantity > 0,
//     )

//     // Map to InventoryLevel type
//     const mappedLowStockItems: InventoryLevel[] = lowStockItems.map((item) => ({
//       id: item.id,
//       itemId: item.itemId,
//       locationId: item.locationId,
//       quantityOnHand: item.onHandQuantity,
//       quantityReserved: item.reservedQuantity,
//       quantityAvailable: item.availableQuantity,
//       quantityInTransit: 0,
//       quantityOnOrder: 0,
//       unitCost: item.unitCost,
//       totalValue: item.totalValue,
//       reorderPoint: item.reorderPoint,
//       maxStockLevel: item.maxStockLevel,
//       item: item.item,
//       location: item.location,
//     }))

//     return {
//       success: true,
//       data: mappedLowStockItems,
//       error: null,
//     }
//   } catch (error) {
//     console.error("Error fetching low stock items:", error)
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error",
//     }
//   }
// }

export async function updateInventoryLevel(
  inventoryLevelId: string,
  updates: {
    onHandQuantity?: number
    reservedQuantity?: number
    unitCost?: number
    reorderPoint?: number
    maxStockLevel?: number
  },
): Promise<InventoryLevel> {
  const existingLevel = await db.inventoryLevel.findUnique({
    where: { id: inventoryLevelId },
    include: { item: true },
  })

  if (!existingLevel) {
    throw new Error("Inventory level not found")
  }

  const nextQuantityOnHand = updates.onHandQuantity ?? toNumber(existingLevel.quantityOnHand)
  const nextQuantityReserved = updates.reservedQuantity ?? toNumber(existingLevel.quantityReserved)
  const nextUnitCost = updates.unitCost ?? toNumber(existingLevel.averageCost)
  const nextQuantityAvailable = Math.max(0, nextQuantityOnHand - nextQuantityReserved)

  const updated = await db.$transaction(async (tx) => {
    if (updates.maxStockLevel !== undefined) {
      await tx.item.update({
        where: { id: existingLevel.itemId },
        data: {
          maxStockLevel: updates.maxStockLevel,
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

  revalidatePath("/dashboard/inventory")
  revalidatePath("/")

  return mapInventoryLevel(updated)
}

export async function bulkUpdateInventoryLevels(
  updates: Array<{
    inventoryLevelId: string
    updates: {
      onHandQuantity?: number
      reservedQuantity?: number
      unitCost?: number
      reorderPoint?: number
      maxStockLevel?: number
    }
  }>,
): Promise<InventoryLevel[]> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      throw new Error("User not authenticated")
    }
    const userOrgId = user.organizationId

    const invLevels = await getInventoryLevels(userOrgId)

    const updatedItems: InventoryLevel[] = []

    for (const { inventoryLevelId, updates: itemUpdates } of updates) {
      const updated = await updateInventoryLevel(inventoryLevelId, itemUpdates)
      updatedItems.push(updated)
    }

    revalidatePath("/dashboard/inventory")
    revalidatePath("/")

    return updatedItems
  } catch (error) {
    console.error("Error bulk updating inventory levels:", error)
    throw error
  }
}

export async function getInventoryAlerts(): Promise<{
  lowStock: InventoryLevel[] | undefined
  outOfStock: InventoryLevel[] | undefined
  overStock: InventoryLevel[] | undefined
}> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      throw new Error("User not authenticated")
    }
    const userOrgId = user.organizationId

    const inventoryLevels = await getInventoryLevels(userOrgId)
    const invLevelData = inventoryLevels.data

    // Map the returned data to match the local InventoryLevel type
    const mapToLocalInventoryLevel = (level: any): InventoryLevel => ({
      id: level.id,
      itemId: level.itemId,
      locationId: level.locationId,
      quantityOnHand: level.quantityOnHand,
      quantityReserved: level.quantityReserved,
      quantityAvailable: level.quantityAvailable,
      quantityInTransit: level.quantityInTransit ?? 0,
      quantityOnOrder: level.quantityOnOrder ?? 0,
      unitCost: level.unitCost ?? 0,
      totalValue: level.totalValue ?? 0,
      reorderPoint: level.reorderPoint ?? 0,
      maxStockLevel: level.maxStockLevel ?? 0,
      averageCost: level.averageCost ?? 0,
      createdAt: level.createdAt ?? new Date(),
      updatedAt: level.updatedAt ?? new Date(),
      item: level.item
        ? {
            id: level.item.id,
            name: level.item.name,
            sku: level.item.sku,
            category: level.item.category,
            unit: level.item.unit,
          }
        : { id: "", name: "", sku: "", category: "", unit: "" },
      location: level.location
        ? {
            id: level.location.id,
            name: level.location.name,
            type: level.location.type,
          }
        : { id: "", name: "", type: "" },
    }); 
    
    const lowStock = invLevelData
      ?.filter((level) => level.quantityAvailable <= level.reorderPoint && level.quantityAvailable > 0)
      .map(mapToLocalInventoryLevel);

    const outOfStock = invLevelData
      ?.filter((level) => level.quantityAvailable === 0)
      .map(mapToLocalInventoryLevel);

    const overStock = invLevelData
      ?.filter((level) => level.quantityAvailable > level.unitCost * level.reorderPoint)
      .map(mapToLocalInventoryLevel);

    return { lowStock, outOfStock, overStock }
  } catch (error) {
    console.error("Error fetching inventory alerts:", error)
    throw error
  }
}
