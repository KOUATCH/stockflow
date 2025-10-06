"use server"

import { getAuthenticatedUser } from "@/lib/auth-server"
import { db } from "@/prisma/db"
import type { CreateTransferPayload, TransactionType, TransferStatus } from "@/types/inventoryMovementTypes"
import type { Prisma } from "@prisma/client"
import { revalidatePath, revalidateTag } from "next/cache"

// Standard includes for transfers
const transferInclude = {
  fromLocation: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  toLocation: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  approvedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  lines: {
    select: {
      id: true,
      itemId: true,
      quantity: true,
      notes: true,
      serialNumbers: true,
      item: {
        select: {
          id: true,
          name: true,
          sku: true,
          description: true,
          costPrice: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
}

/**
 * Generate transfer number
 */
const generateTransferNumber = async (organizationId: string): Promise<string> => {
  const lastTransfer = await db.transfer.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: { transferNumber: true },
  })
  
  const nextNumber = lastTransfer ? Number.parseInt(lastTransfer.transferNumber.replace("TR-", "")) + 1 : 1
  return `TR-${nextNumber.toString().padStart(6, "0")}`
}

/**
 * Create inventory transaction record
 */
const createInventoryTransaction = async (
  tx: any,
  data: {
    itemId: string
    locationId?: string
    organizationId: string
    type: TransactionType
    quantity: number
    reservedQuantity?: number
    unitPrice: number
    reference: string
    notes: string
  },
) => {
  return await tx.inventoryTransaction.create({
    data: {
      itemId: data.itemId,
      locationId: data.locationId,
      organizationId: data.organizationId,
      type: data.type,
      quantity: data.quantity,
      reservedQuantity: data.reservedQuantity || 0,
      unitPrice: data.unitPrice,
      totalValue: data.quantity * data.unitPrice,
      reference: data.reference,
      notes: data.notes,
      createdAt: new Date(),
    },
  })
}

/**
 * Update inventory levels for transfers
 */
const updateInventoryForTransfer = async (
  tx: any,
  itemId: string,
  fromLocationId: string,
  toLocationId: string,
  quantity: number,
  organizationId: string,
  transferNumber: string,
) => {
  // Get source inventory
  const sourceInventory = await tx.inventoryTransaction.findFirst({
    where: {
      itemId,
      locationId: fromLocationId,
      organizationId,
    },
  })

  if (!sourceInventory) {
    throw new Error(`No inventory found for item at source location`)
  }

  if (sourceInventory.quantity < quantity) {
    throw new Error(
      `Insufficient inventory at source location. Available: ${sourceInventory.quantity}, Required: ${quantity}`,
    )
  }

  // Update source location inventory (decrease)
  await tx.inventory.update({
    where: { id: sourceInventory.id },
    data: {
      quantity: sourceInventory.quantity - quantity,
      totalValue: sourceInventory.totalValue - quantity * sourceInventory.averageCost,
      lastUpdated: new Date(),
    },
  })

  // Create outbound transaction for source
  await createInventoryTransaction(tx, {
    itemId,
    locationId: fromLocationId,
    organizationId,
    type: "TRANSFER_OUT",
    quantity,
    unitPrice: sourceInventory.averageCost,
    reference: transferNumber,
    notes: `Transfer out to location`,
  })

  // Get or create destination inventory
  const destInventory = await tx.inventory.findFirst({
    where: {
      itemId,
      locationId: toLocationId,
      organizationId,
    },
  })

  if (destInventory) {
    // Update existing destination inventory (increase)
    const newQuantity = destInventory.quantity + quantity
    const newTotalValue = destInventory.totalValue + quantity * sourceInventory.averageCost
    const newAverageCost = newTotalValue / newQuantity

    await tx.inventory.update({
      where: { id: destInventory.id },
      data: {
        quantity: newQuantity,
        totalValue: newTotalValue,
        averageCost: newAverageCost,
        lastUpdated: new Date(),
      },
    })
  } else {
    // Create new destination inventory
    await tx.inventory.create({
      data: {
        itemId,
        locationId: toLocationId,
        organizationId,
        quantity,
        totalValue: quantity * sourceInventory.averageCost,
        averageCost: sourceInventory.averageCost,
        reorderLevel: 0,
        maxLevel: 0,
        lastUpdated: new Date(),
      },
    })
  }

  // Create inbound transaction for destination
  await createInventoryTransaction(tx, {
    itemId,
    locationId: toLocationId,
    organizationId,
    type: "TRANSFER_IN",
    quantity,
    unitPrice: sourceInventory.averageCost,
    reference: transferNumber,
    notes: `Transfer in from location`,
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
}

/**
 * Create location transfer
 */
export async function createLocationTransfer(data: CreateTransferPayload) {
  try {
    const user = await getAuthenticatedUser()
    data.createdById = user?.id || data.createdById

    if (!data.fromLocationId) throw new Error("Source location is required")
    if (!data.toLocationId) throw new Error("Destination location is required")
    if (data.fromLocationId === data.toLocationId)
      throw new Error("Source and destination locations cannot be the same")
    if (!data.organizationId) throw new Error("Organization ID is required")
    if (!data.createdById) throw new Error("Created by user ID is required")
    if (!data.lines || data.lines.length === 0) throw new Error("At least one line item is required")

    // Validate locations exist
    const [fromLocation, toLocation] = await Promise.all([
      db.location.findFirst({
        where: { id: data.fromLocationId, organizationId: data.organizationId },
      }),
      db.location.findFirst({
        where: { id: data.toLocationId, organizationId: data.organizationId },
      }),
    ])

    if (!fromLocation) {
      throw new Error("Source location not found or does not belong to your organization")
    }

    if (!toLocation) {
      throw new Error("Destination location not found or does not belong to your organization")
    }

    // Validate items exist and have sufficient inventory
    const itemIds = data.lines.map((line) => line.itemId)
    const items = await db.item.findMany({
      where: { id: { in: itemIds }, organizationId: data.organizationId },
    })

    if (items.length !== itemIds.length) {
      throw new Error("One or more items not found or do not belong to your organization")
    }

    // Check inventory availability
    for (const line of data.lines) {
      const inventory = await db.inventory.findFirst({
        where: {
          itemId: line.itemId,
          locationId: data.fromLocationId,
          organizationId: data.organizationId,
        },
      })

      if (!inventory || inventory.quantity < line.requestedQuantity) {
        const item = items.find((i) => i.id === line.itemId)
        throw new Error(
          `Insufficient inventory for ${item?.name}. Available: ${inventory?.quantity || 0}, Required: ${line.requestedQuantity}`,
        )
      }
    }

    const transferNumber = await generateTransferNumber(data.organizationId)

    const transfer = await db.$transaction(async (tx) => {
      return await tx.transfer.create({
        data: {
          transferNumber,
          date: new Date(),
          fromLocationId: data.fromLocationId,
          toLocationId: data.toLocationId,
          status: "DRAFT",
          notes: data.notes || "",
          organizationId: data.organizationId,
          createdById: data.createdById,
          lines: {
            create: data.lines.map((line) => ({
              itemId: line.itemId,
              quantity: line.requestedQuantity,
              notes: line.notes || "",
              serialNumbers: line.serialNumbers || [],
              requestedQuantity:line.requestedQuantity
            })),
          },
        },
        include: transferInclude,
      })
    })

    revalidateTag("transfers")
    revalidateTag(`transfers-${data.organizationId}`)
    revalidatePath("/dashboard/inventory/transfers")

    return {
      success: true,
      data: transfer,
      message: `Transfer ${transferNumber} created successfully`,
    }
  } catch (error) {
    console.error("Error creating transfer:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create transfer")
  }
}

/**
 * Approve and execute transfer
 */
export async function approveTransfer(transferId: string, organizationId: string, approvedById: string) {
  try {
    if (!transferId) throw new Error("Transfer ID is required")
    if (!organizationId) throw new Error("Organization ID is required")
    if (!approvedById) throw new Error("Approved by user ID is required")

    const existingTransfer = await db.transfer.findFirst({
      where: { id: transferId, organizationId },
      include: {
        lines: {
          include: {
            item: true,
          },
        },
      },
    })

    if (!existingTransfer) {
      throw new Error("Transfer not found or you don't have permission to approve it")
    }

    if (existingTransfer.status !== "DRAFT") {
      throw new Error(`Cannot approve transfer with status: ${existingTransfer.status}`)
    }

    const result = await db.$transaction(async (tx) => {
      // Update inventory for each line item
      for (const line of existingTransfer.lines) {
        await updateInventoryForTransfer(
          tx,
          line.itemId,
          existingTransfer.fromLocationId,
          existingTransfer.toLocationId,
          line.requestedQuantity,
          organizationId,
          existingTransfer.transferNumber,
        )
      }

      // Update transfer status
      return await tx.transfer.update({
        where: { id: transferId },
        data: {
          status: "COMPLETED",
          approvedById,
          updatedAt: new Date(),
        },
        include: transferInclude,
      })
    })

    revalidateTag("transfers")
    revalidateTag(`transfers-${organizationId}`)
    revalidateTag(`transfer-${transferId}`)
    revalidateTag("inventory")
    revalidateTag(`inventory-${organizationId}`)
    revalidatePath("/dashboard/inventory/transfers")
    revalidatePath("/dashboard/inventory")

    return {
      success: true,
      data: result,
      message: `Transfer ${existingTransfer.transferNumber} approved and completed successfully`,
    }
  } catch (error) {
    console.error("Error approving transfer:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to approve transfer")
  }
}

/**
 * Get transfers with filters
 */
export async function getTransfers(
  organizationId: string,
  filters?: {
    search?: string
    status?: TransferStatus
    fromLocationId?: string
    toLocationId?: string
    page?: number
    limit?: number
  },
) {
  try {
    if (!organizationId) throw new Error("Organization ID is required")

    const page = Math.max(1, filters?.page || 1)
    const limit = Math.min(100, Math.max(1, filters?.limit || 20))
    const skip = (page - 1) * limit

    const where: Prisma.TransferWhereInput = {
      organizationId,
    }

    if (filters?.search?.trim()) {
      where.OR = [
        { transferNumber: { contains: filters.search.trim(), mode: "insensitive" } },
        { notes: { contains: filters.search.trim(), mode: "insensitive" } },
      ]
    }

    if (filters?.status) where.status = filters.status
    if (filters?.fromLocationId) where.fromLocationId = filters.fromLocationId
    if (filters?.toLocationId) where.toLocationId = filters.toLocationId

    const [transfers, totalCount] = await Promise.all([
      db.transfer.findMany({
        where,
        include: transferInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.transfer.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return {
      data: transfers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  } catch (error) {
    console.error("Error fetching transfers:", error)
    throw new Error("Failed to fetch transfers")
  }
}

/**
 * Get inventory transactions with enhanced filtering
 */
export async function getInventoryTransactions(
  organizationId: string,
  filters?: {
    itemId?: string
    locationId?: string
    type?: TransactionType
    dateFrom?: string
    dateTo?: string
    limit?: number
  },
) {
  try {
    if (!organizationId) throw new Error("Organization ID is required")

    const where: Prisma.InventoryTransactionWhereInput = {
      organizationId,
    }

    if (filters?.itemId) where.itemId = filters.itemId
    if (filters?.locationId) where.locationId = filters.locationId
    if (filters?.type) where.referenceType = filters.type

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom)
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    const transactions = await db.inventoryTransaction.findMany({
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
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 100,
    })

    return transactions
  } catch (error) {
    console.error("Error fetching inventory transactions:", error)
    throw new Error("Failed to fetch inventory transactions")
  }
}

/**
 * Reserve inventory for orders
 */
export async function reserveInventory(
  itemId: string,
  locationId: string,
  quantity: number,
  reason: string,
  organizationId: string,
  expiresAt?: Date,
) {
  try {
    if (!itemId) throw new Error("Item ID is required")
    if (!locationId) throw new Error("Location ID is required")
    if (!organizationId) throw new Error("Organization ID is required")
    if (quantity <= 0) throw new Error("Quantity must be greater than 0")

    const result = await db.$transaction(async (tx) => {
      // Check available inventory
      const inventory = await tx.inventory.findFirst({
        where: {
          itemId,
          locationId,
          organizationId,
        },
      })

      if (!inventory) {
        throw new Error("Inventory record not found")
      }

      // Get current reservations
      const currentReservations = await tx.inventoryTransaction.aggregate({
        where: {
          itemId,
          locationId,
          organizationId,
          type: "RESERVATION",
        },
        _sum: {
          quantity: true,
        },
      })

      const totalReserved = currentReservations?._sum?.quantity    || 0
      const availableQuantity = inventory.quantity - totalReserved

      if (availableQuantity < quantity) {
        throw new Error(`Insufficient available inventory. Available: ${availableQuantity}, Required: ${quantity}`)
      }

      // Create reservation transaction
      return await createInventoryTransaction(tx, {
        itemId,
        locationId,
        organizationId,
        type: "RESERVED",
        quantity: 0, // No actual quantity movement
        reservedQuantity: quantity,
        unitPrice: inventory.quantity,
        reference: "INVENTORY_RESERVATION",
        notes: reason,
      })
    })

    revalidateTag("inventory")
    revalidateTag(`inventory-${organizationId}`)

    return {
      success: true,
      data: result,
      message: "Inventory reserved successfully",
    }
  } catch (error) {
    console.error("Error reserving inventory:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to reserve inventory")
  }
}

/**
 * Get stock movement summary
 */
export async function getStockMovementSummary(
  organizationId: string,
  itemId?: string,
  locationId?: string,
  dateFrom?: string,
  dateTo?: string,
) {
  try {
    if (!organizationId) throw new Error("Organization ID is required")

    const where: Prisma.InventoryTransactionWhereInput = {
      organizationId,
    }

    if (itemId) where.itemId = itemId
    if (locationId) where.locationId = locationId

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) {
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    const [inbound, outbound, transfers, adjustments] = await Promise.all([
      db.inventoryTransaction.aggregate({
        where: {
          ...where,
          type: { in: ["TRANSFER_IN"] },
          // type: { in: ["INBOUND", "TRANSFER_IN", "ADJUSTMENT_IN"] },
        },
        _sum: {
          quantity: true,
          total: true,
        },
      }),
      db.inventoryTransaction.aggregate({
        where: {
          ...where,
          type: { in: ["TRANSFER_OUT"] },
          // type: { in: ["OUTBOUND", "TRANSFER_OUT", "ADJUSTMENT_OUT"] },
        },
        _sum: {
          quantity: true,
          total: true,
        },
      }),
      db.inventoryTransaction.aggregate({
        where: {
          ...where,
          type: { in: ["TRANSFER_IN", "TRANSFER_OUT"] },
        },
        _sum: {
          quantity: true,
        },
      }),
      db.inventoryTransaction.aggregate({
        where: {
          ...where,
          // type: { in: [ "ADJUSTMENT_OUT"] },
          type: { in: ["ADJUSTMENT_UP", "ADJUSTMENT_DOWN"] },
        },
        _sum: {
          quantity: true,
        },
      }),
    ])

    const totalInbound = inbound._sum?.quantity || 0
    const totalOutbound = outbound._sum?.quantity || 0
    const totalTransfers = transfers._sum.quantity || 0
    const totalAdjustments = adjustments._sum?.quantity || 0

    return {
      totalInbound,
      totalOutbound,
      totalTransfers,
      totalAdjustments,
      netMovement: totalInbound - totalOutbound,
      valueChange: (inbound._sum.totalValue || 0) - (outbound._sum.totalValue || 0),
    }
  } catch (error) {
    console.error("Error fetching stock movement summary:", error)
    throw new Error("Failed to fetch stock movement summary")
  }
}
