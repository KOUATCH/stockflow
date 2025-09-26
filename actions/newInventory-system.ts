"use server"

import { db } from "@/prisma/db"
import type { TransactionReferenceType, TransactionType } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Create inventory transaction
export async function createInventoryTransaction(data: {
  itemId: string
  locationId: string
  organizationId: string
  type: TransactionType
  quantity: number
  unitCost?: number
  notes?: string
  createdById?: string
  referenceType?: TransactionReferenceType
  referenceId?: string
  referenceNumber?: string
  batchNumber?: string
  serialNumbers?: string[]
  expiryDate?: Date
}) {
  try {
    // Get current inventory level
    const currentLevel = await db.inventoryLevel.findUnique({
      where: {
        itemId_locationId: {
          itemId: data.itemId,
          locationId: data.locationId,
        },
      },
    })

    const currentQuantity = currentLevel?.quantityOnHand || 0
    const newQuantity = currentQuantity + data.quantity
    const totalCost = (data.unitCost || 0) * Math.abs(data.quantity)

    // Create transaction
    const transaction = await db.inventoryTransaction.create({
      data: {
        ...data,
        totalCost,
        balanceAfter: newQuantity,
      },
      include: {
        item: true,
        location: true,
        createdBy: true,
      },
    })

    revalidatePath("/inventory")
    revalidatePath("/inventory/transactions")
    return { success: true, data: transaction }
  } catch (error) {
    console.error("Error creating inventory transaction:", error)
    return { success: false, error: "Failed to create inventory transaction" }
  }
}

// Get inventory levels
export async function getInventoryLevels(params: {
  organizationId: string
  locationId?: string
  itemId?: string
  lowStock?: boolean
  page?: number
  limit?: number
}) {
  try {
    const { organizationId, locationId, itemId, lowStock, page = 1, limit = 20 } = params

    const where = {
      item: { organizationId },
      ...(locationId && { locationId }),
      ...(itemId && { itemId }),
      ...(lowStock && {
        OR: [{ quantityOnHand: { lte: db.inventoryLevel.fields.reorderPoint } }, { quantityAvailable: { lte: 5 } }],
      }),
    }

    const [levels, total] = await Promise.all([
      db.inventoryLevel.findMany({
        where,
        include: {
          item: {
            include: {
              category: true,
              brand: true,
              unit: true,
            },
          },
          location: true,
        },
        orderBy: [{ quantityAvailable: "asc" }, { item: { name: "asc" } }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.inventoryLevel.count({ where }),
    ])

    return {
      success: true,
      data: levels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching inventory levels:", error)
    return { success: false, error: "Failed to fetch inventory levels" }
  }
}

// Get inventory transactions
export async function getInventoryTransactions(params: {
  organizationId: string
  itemId?: string
  locationId?: string
  type?: TransactionType
  page?: number
  limit?: number
  startDate?: Date
  endDate?: Date
}) {
  try {
    const { organizationId, itemId, locationId, type, page = 1, limit = 20, startDate, endDate } = params

    const where = {
      organizationId,
      ...(itemId && { itemId }),
      ...(locationId && { locationId }),
      ...(type && { type }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
    }

    const [transactions, total] = await Promise.all([
      db.inventoryTransaction.findMany({
        where,
        include: {
          item: true,
          location: true,
          createdBy: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.inventoryTransaction.count({ where }),
    ])

    return {
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching inventory transactions:", error)
    return { success: false, error: "Failed to fetch inventory transactions" }
  }
}

// Adjust inventory
export async function adjustInventory(data: {
  itemId: string
  locationId: string
  organizationId: string
  newQuantity: number
  reason: string
  notes?: string
  createdById?: string
}) {
  try {
    // Get current inventory level
    const currentLevel = await db.inventoryLevel.findUnique({
      where: {
        itemId_locationId: {
          itemId: data.itemId,
          locationId: data.locationId,
        },
      },
    })

    const currentQuantity = currentLevel?.quantityOnHand || 0
    const adjustmentQuantity = data.newQuantity - currentQuantity

    if (adjustmentQuantity === 0) {
      return { success: false, error: "No adjustment needed" }
    }

    // Create adjustment transaction
    const transaction = await createInventoryTransaction({
      itemId: data.itemId,
      locationId: data.locationId,
      organizationId: data.organizationId,
      type: adjustmentQuantity > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
      quantity: adjustmentQuantity,
      notes: `${data.reason}: ${data.notes || ""}`,
      createdById: data.createdById,
      referenceType: "MANUAL",
    })

    return transaction
  } catch (error) {
    console.error("Error adjusting inventory:", error)
    return { success: false, error: "Failed to adjust inventory" }
  }
}
