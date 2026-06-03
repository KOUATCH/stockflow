"use server"

import { getAuthenticatedUser } from "@/lib/auth-server"
import { db } from "@/prisma/db"
import { AdjustmentStatus, type InventoryLevel, type StockAdjustment } from "@/types/inventoryTypes"
import { revalidatePath } from "next/cache"

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value) || 0
}

function mapInventoryLevel(level: any): InventoryLevel {
  return {
    id: level.id,
    itemId: level.itemId,
    locationId: level.locationId,
    reorderPoint: toNumber(level.reorderPoint),
    location: {
      id: level.location?.id ?? level.locationId,
      name: level.location?.name ?? "",
    },
    quantityOnHand: toNumber(level.quantityOnHand),
    quantityReserved: toNumber(level.quantityReserved),
    quantityAvailable: toNumber(level.quantityAvailable),
    quantityInTransit: toNumber(level.quantityInTransit),
    quantityOnOrder: toNumber(level.quantityOnOrder),
    averageCost: toNumber(level.averageCost),
    totalValue: toNumber(level.totalValue),
    lastCountDate: level.lastCountDate,
    lastTransactionAt: level.lastTransactionAt,
    createdAt: level.createdAt,
    updatedAt: level.updatedAt,
  }
}

function mapStockAdjustment(adjustment: any): StockAdjustment {
  return {
    id: adjustment.id,
    adjustmentNumber: adjustment.adjustmentNumber,
    type: adjustment.type,
    reason: adjustment.reason,
    status: adjustment.status,
    adjustmentDate: adjustment.adjustmentDate,
    notes: adjustment.notes,
    locationId: adjustment.locationId,
    organizationId: adjustment.organizationId,
    createdById: adjustment.createdById,
    approvedById: adjustment.approvedById,
    approvedAt: adjustment.approvedAt,
    createdAt: adjustment.createdAt,
    updatedAt: adjustment.updatedAt,
  }
}

export async function getInventoryLevels(locationId: string): Promise<InventoryLevel[]> {
  try {
    const user = await getAuthenticatedUser()
    const levels = await db.inventoryLevel.findMany({
      where: {
        locationId,
        item: {
          organizationId: user.organizationId,
          deletedAt: null,
        },
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return levels.map(mapInventoryLevel)
  } catch (error) {
    console.error("Error fetching inventory levels:", error)
    return []
  }
}

export async function updateInventoryLevel(
  itemId: string,
  locationId: string,
  data: Partial<InventoryLevel>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: Record<string, number | Date> = {}

    if (data.quantityOnHand !== undefined) updateData.quantityOnHand = data.quantityOnHand
    if (data.quantityReserved !== undefined) updateData.quantityReserved = data.quantityReserved
    if (data.quantityAvailable !== undefined) updateData.quantityAvailable = data.quantityAvailable
    if (data.quantityInTransit !== undefined) updateData.quantityInTransit = data.quantityInTransit
    if (data.quantityOnOrder !== undefined) updateData.quantityOnOrder = data.quantityOnOrder
    if (data.reorderPoint !== undefined) updateData.reorderPoint = data.reorderPoint
    if (data.averageCost !== undefined) updateData.averageCost = data.averageCost
    if (data.totalValue !== undefined) updateData.totalValue = data.totalValue

    updateData.lastTransactionAt = new Date()

    await db.inventoryLevel.update({
      where: {
        itemId_locationId: {
          itemId,
          locationId,
        },
      },
      data: updateData,
    })

    revalidatePath("/inventory/levels")
    revalidatePath("/dashboard/inventory")
    return { success: true }
  } catch (error) {
    console.error("Error updating inventory level:", error)
    return { success: false, error: "Failed to update inventory level" }
  }
}

export async function createStockAdjustment(
  data: Omit<StockAdjustment, "id" | "adjustmentNumber">,
): Promise<{ success: boolean; adjustment?: StockAdjustment; error?: string }> {
  try {
    const user = await getAuthenticatedUser()
    const adjustment = await db.stockAdjustment.create({
      data: {
        adjustmentNumber: `ADJ-${Date.now()}`,
        type: data.type as any,
        reason: data.reason,
        status: (data.status ?? AdjustmentStatus.DRAFT) as any,
        adjustmentDate: data.adjustmentDate ?? new Date(),
        notes: data.notes,
        locationId: data.locationId,
        organizationId: data.organizationId || user.organizationId,
        createdById: data.createdById ?? user.id,
        approvedById: data.approvedById,
        approvedAt: data.approvedAt,
      },
    })

    revalidatePath("/inventory/adjustments")
    revalidatePath("/dashboard/inventory")

    return { success: true, adjustment: mapStockAdjustment(adjustment) }
  } catch (error) {
    console.error("Error creating stock adjustment:", error)
    return { success: false, error: "Failed to create stock adjustment" }
  }
}

export async function approveStockAdjustment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthenticatedUser()
    await db.stockAdjustment.update({
      where: { id },
      data: {
        status: AdjustmentStatus.APPROVED as any,
        approvedById: user.id,
        approvedAt: new Date(),
      },
    })

    revalidatePath("/inventory/adjustments")
    revalidatePath("/dashboard/inventory")

    return { success: true }
  } catch (error) {
    console.error("Error approving stock adjustment:", error)
    return { success: false, error: "Failed to approve stock adjustment" }
  }
}

export async function getStockAdjustments(organizationId: string): Promise<StockAdjustment[]> {
  try {
    const adjustments = await db.stockAdjustment.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: {
        adjustmentDate: "desc",
      },
    })

    return adjustments.map(mapStockAdjustment)
  } catch (error) {
    console.error("Error fetching stock adjustments:", error)
    return []
  }
}
