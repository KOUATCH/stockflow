"use server"

import type { CreateStockAdjustmentForm, StockAdjustment } from "@/types/stockTransferTypes"
import { revalidatePath } from "next/cache"

// Mock data for demonstration - replace with actual database calls
const mockAdjustments: StockAdjustment[] = [
  {
    id: "1",
    locationId: "1",
    itemId: "1",
    adjustmentType: "DECREASE",
    quantity: 5,
    reason: "Damaged goods",
    notes: "Water damage during storage",
    referenceNumber: "ADJ-001",
    userId: "user1",
    createdAt: new Date("2024-01-15T10:30:00Z"),
    updatedAt: new Date("2024-01-15T10:30:00Z"),
    location: { id: "1", name: "Main Warehouse", code: "MW01", type: "WAREHOUSE", isActive: true },
    item: {
      id: "1",
      name: "Wireless Headphones",
      sku: "WH-001",
      unitId: "pcs",
      costPrice: 50,
      sellingPrice: 99.99,
      isActive: true,
    },
    user: { id: "user1", name: "John Doe", email: "john@example.com" },
  },
  {
    id: "2",
    locationId: "2",
    itemId: "2",
    adjustmentType: "INCREASE",
    quantity: 10,
    reason: "Stock count correction",
    notes: "Found additional stock during audit",
    referenceNumber: "ADJ-002",
    userId: "user2",
    createdAt: new Date("2024-01-14T14:20:00Z"),
    updatedAt: new Date("2024-01-14T14:20:00Z"),
    location: { id: "2", name: "Store A", code: "SA01", type: "STORE", isActive: true },
    item: {
      id: "2",
      name: "Bluetooth Speaker",
      sku: "BS-001",
      unitId: "pcs",
      costPrice: 30,
      sellingPrice: 79.99,
      isActive: true,
    },
    user: { id: "user2", name: "Jane Smith", email: "jane@example.com" },
  },
]

export async function getStockAdjustments(locationId?: string): Promise<StockAdjustment[]> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let adjustments = mockAdjustments
    if (locationId) {
      adjustments = adjustments.filter((adj) => adj.locationId === locationId)
    }

    return adjustments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error fetching stock adjustments:", error)
    throw new Error("Failed to fetch stock adjustments")
  }
}

export async function createStockAdjustment(data: CreateStockAdjustmentForm): Promise<StockAdjustment> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newAdjustment: StockAdjustment = {
      id: `adj-${Date.now()}`,
      ...data,
      userId: "current-user", // In real app, get from session
      createdAt: new Date(),
      updatedAt: new Date(),
      // Mock relations - in real app, fetch from database
      location: mockAdjustments[0].location,
      item: mockAdjustments[0].item,
      user: { id: "current-user", name: "Current User", email: "current@example.com" },
    }

    mockAdjustments.unshift(newAdjustment)

    revalidatePath("/stock-management")
    return newAdjustment
  } catch (error) {
    console.error("Error creating stock adjustment:", error)
    throw new Error("Failed to create stock adjustment")
  }
}

export async function deleteStockAdjustment(id: string): Promise<void> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockAdjustments.findIndex((adj) => adj.id === id)
    if (index === -1) {
      throw new Error("Stock adjustment not found")
    }

    mockAdjustments.splice(index, 1)

    revalidatePath("/stock-management")
  } catch (error) {
    console.error("Error deleting stock adjustment:", error)
    throw new Error("Failed to delete stock adjustment")
  }
}

export async function getStockAdjustmentById(id: string): Promise<StockAdjustment | null> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return mockAdjustments.find((adj) => adj.id === id) || null
  } catch (error) {
    console.error("Error fetching stock adjustment:", error)
    throw new Error("Failed to fetch stock adjustment")
  }
}