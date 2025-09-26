   "use server"
import { db } from "@/prisma/db";
import type { StockAdjustmentType } from "@/types/stockAdjustment"; // Adjust the import path as needed
import { AdjustmentStatus } from "@prisma/client";

                              
// Get low stock items
export async function getLowStockItems(organizationId: string, locationId?: string) {
  try {
    // First, fetch all inventory levels with their item's reorderLevel and minStockLevel
    const inventoryLevels = await db.inventoryLevel.findMany({
      where: {
        ...(locationId && { locationId }),
        item: { organizationId },
      },
      include: {
        item: {
          include: {
            category: true,
            brand: true,
          },
        },
        location: true,
      },
      orderBy: {
        quantityOnHand: "asc",
      },
    })

    // Filter in JS since Prisma can't compare fields across tables
    const lowStockItems = inventoryLevels.filter((level) => {
      const reorderLevel = level.item.reorderLevel ?? 0
      const minStockLevel = level.item.minStockLevel ?? 0
      return (
        level.quantityOnHand <= reorderLevel ||
        level.quantityOnHand <= minStockLevel
      )
    })

    return lowStockItems
  } catch (error) {
    console.error("Error fetching low stock items:", error)
    return []
  }
}

// Create stock adjustment
export async function createStockAdjustment(data: {
  type: StockAdjustmentType
  reason: string
  locationId: string
  organizationId: string
  lines: Array<{
    itemId: string
    currentQuantity: number
    adjustedQuantity: number
    reason?: string
  }>
}) {
  try {
    const adjustmentNumber = `ADJ-${Date.now()}`

    const adjustment = await db.stockAdjustment.create({
      data: {
        adjustmentNumber,
        type: data.type,
        reason: data.reason,
        locationId: data.locationId,
        organizationId: data.organizationId,
        status: "DRAFT",
        lines: {
          create: data.lines.map((line) => ({
            itemId: line.itemId,
            currentQuantity: line.currentQuantity,
            adjustedQuantity: line.adjustedQuantity,
            difference: line.adjustedQuantity - line.currentQuantity,
            reason: line.reason,
          })),
        },
      },
      include: {
        lines: {
          include: {
            item: true,
          },
        },
      },
    })

    revalidatePath("/dashboard/inventory")
    return { success: true, adjustment }
  } catch (error) {
    console.error("Error creating stock adjustment:", error)
    return { success: false, error: "Failed to create stock adjustment" }
  }
}

// Apply stock adjustment
export async function applyStockAdjustment(adjustmentId: string) {
  try {
    const adjustment = await db.stockAdjustment.findUnique({
      where: { id: adjustmentId },
      include: {
        lines: {
          include: {
            item: true,
          },
        },
      },
    })

    if (!adjustment) {
      return { success: false, error: "Adjustment not found" }
    }

    if (adjustment.status !== "APPROVED") {
      return { success: false, error: "Adjustment must be approved first" }
    }

    // Apply adjustments to inventory levels
    for (const line of adjustment.lines) {
      const difference = line.adjustedQuantity - line.actualQuantity;

      await db.inventoryLevel.upsert({
        where: {
          itemId_locationId: {
            itemId: line.itemId,
            locationId: adjustment.locationId,
          },
        },
        update: {
          quantityOnHand: line.adjustedQuantity,
          quantityAvailable: line.adjustedQuantity,
          totalValue: line.adjustedQuantity * line.item.costPrice,
          lastTransactionAt: new Date(),
        },
        create: {
          itemId: line.itemId,
          locationId: adjustment.locationId,
          quantityOnHand: line.adjustedQuantity,
          quantityAvailable: line.adjustedQuantity,
          averageCost: line.item.costPrice,
          totalValue: line.adjustedQuantity * line.item.costPrice,
        },
      })

      // Create inventory transaction
      await db.inventoryTransaction.create({
        data: {
          type: difference > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
          quantity: difference,
          unitCost: line.item.costPrice,
          totalCost: difference * line.item.costPrice,
          itemId: line.itemId,
          locationId: adjustment.locationId,
          organizationId: adjustment.organizationId,
          referenceType: "STOCK_ADJUSTMENT",
          referenceId: adjustmentId,
          referenceNumber: adjustment.adjustmentNumber,
          balanceAfter: line.adjustedQuantity,
          notes: `Stock adjustment: ${adjustment.reason}`,
        },
      })
    }

    // Update adjustment status
    await db.stockAdjustment.update({
      data: { status: AdjustmentStatus.APPLIED },
      data: { status: "APPLIED" },
    })

    revalidatePath("/dashboard/inventory")
    return { success: true }
  } catch (error) {
    console.error("Error applying stock adjustment:", error)
    return { success: false, error: "Failed to apply stock adjustment" }
  }
}

// Get stock adjustments
export async function getStockAdjustments(organizationId: string, locationId?: string, status?: StockAdjustmentStatus) {
  try {
    const adjustments = await db.stockAdjustment.findMany({
      where: {
        organizationId,
        ...(locationId && { locationId }),
        ...(status && { status }),
      },
      include: {
        location: true,
        lines: {
          include: {
            item: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return adjustments
  } catch (error) {
    console.error("Error fetching stock adjustments:", error)
    return []
  }
}
