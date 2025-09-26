


"use server"

import { InventoryLevel } from "@/types/inventoryTypes";

// ===== INVENTORY LEVELS =====
export async function getInventoryLevels(locationId: string): Promise<InventoryLevel[]> {
  try {
    // Mock data - replace with actual database query
    return [
      {
        id: "1",
        itemId: "1",
        locationId,
        quantityOnHand: 25,
        quantityReserved: 5,
        quantityAvailable: 20,
        reorderPoint: 10,
        averageCost: 12.5,
        totalValue: 312.5,
      },
      {
        id: "2",
        itemId: "2",
        locationId,
        quantityOnHand: 30,
        quantityReserved: 8,
        quantityAvailable: 22,
        reorderPoint: 15,
        averageCost: 8.0,
        totalValue: 240.0,
      },
    ]
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
    // Mock implementation - replace with actual database update
    revalidatePath("/inventory/levels")
    return { success: true }
  } catch (error) {
    console.error("Error updating inventory level:", error)
    return { success: false, error: "Failed to update inventory level" }
  }
}

// ===== STOCK ADJUSTMENTS =====
export async function createStockAdjustment(
  data: Omit<StockAdjustment, "id" | "adjustmentNumber">,
): Promise<{ success: boolean; adjustment?: StockAdjustment; error?: string }> {
  try {
    const adjustment: StockAdjustment = {
      id: `adj_${Date.now()}`,
      adjustmentNumber: `ADJ-${Date.now()}`,
      ...data,
    }

    mockDb.stockAdjustments.push(adjustment)
    revalidatePath("/inventory/adjustments")

    return { success: true, adjustment }
  } catch (error) {
    console.error("Error creating stock adjustment:", error)
    return { success: false, error: "Failed to create stock adjustment" }
  }
}

export async function approveStockAdjustment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const adjustmentIndex = mockDb.stockAdjustments.findIndex((adj) => adj.id === id)
    if (adjustmentIndex === -1) {
      return { success: false, error: "Stock adjustment not found" }
    }

    mockDb.stockAdjustments[adjustmentIndex].status = "APPROVED"
    revalidatePath("/inventory/adjustments")

    return { success: true }
  } catch (error) {
    console.error("Error approving stock adjustment:", error)
    return { success: false, error: "Failed to approve stock adjustment" }
  }
}

export async function getStockAdjustments(organizationId: string): Promise<StockAdjustment[]> {
  try {
    // Mock data - replace with actual database query
    return []
  } catch (error) {
    console.error("Error fetching stock adjustments:", error)
    return []
  }
}