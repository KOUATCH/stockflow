"use server"

import type { CreateStockTransferForm, StockTransfer } from "@/types/stockTransferTypes"
import { revalidatePath } from "next/cache"

// Mock data for demonstration
const mockTransfers: StockTransfer[] = [
  {
    id: "1",
    fromLocationId: "1",
    toLocationId: "2",
    status: "PENDING",
    transferNumber: "TRF-001",
    notes: "Urgent transfer for Store A restocking",
    requestedBy: "user1",
    requestedAt: new Date("2024-01-15T09:00:00Z"),
    createdAt: new Date("2024-01-15T09:00:00Z"),
    updatedAt: new Date("2024-01-15T09:00:00Z"),
    fromLocation: { id: "1", name: "Main Warehouse", code: "MW01", type: "WAREHOUSE", isActive: true },
    toLocation: { id: "2", name: "Store A", code: "SA01", type: "STORE", isActive: true },
    requestedByUser: { id: "user1", name: "John Doe", email: "john@example.com" },
    items: [
      {
        id: "1",
        transferId: "1",
        itemId: "1",
        quantityRequested: 20,
        item: {
          id: "1",
          name: "Wireless Headphones",
          sku: "WH-001",
          unitId: "pcs",
          costPrice: 50,
          sellingPrice: 99.99,
          isActive: true,
        },
      },
      {
        id: "2",
        transferId: "1",
        itemId: "2",
        quantityRequested: 15,
        item: {
          id: "2",
          name: "Bluetooth Speaker",
          sku: "BS-001",
          unitId: "pcs",
          costPrice: 30,
          sellingPrice: 79.99,
          isActive: true,
        },
      },
    ],
  },
  {
    id: "2",
    fromLocationId: "2",
    toLocationId: "3",
    status: "COMPLETED",
    transferNumber: "TRF-002",
    notes: "Regular weekly transfer",
    requestedBy: "user2",
    approvedBy: "user1",
    completedBy: "user3",
    requestedAt: new Date("2024-01-10T08:00:00Z"),
    approvedAt: new Date("2024-01-10T10:00:00Z"),
    completedAt: new Date("2024-01-12T16:00:00Z"),
    createdAt: new Date("2024-01-10T08:00:00Z"),
    updatedAt: new Date("2024-01-12T16:00:00Z"),
    fromLocation: { id: "2", name: "Store A", code: "SA01", type: "STORE", isActive: true },
    toLocation: { id: "3", name: "Store B", code: "SB01", type: "STORE", isActive: true },
    requestedByUser: { id: "user2", name: "Jane Smith", email: "jane@example.com" },
    approvedByUser: { id: "user1", name: "John Doe", email: "john@example.com" },
    completedByUser: { id: "user3", name: "Mike Johnson", email: "mike@example.com" },
    items: [
      {
        id: "3",
        transferId: "2",
        itemId: "3",
        quantityRequested: 10,
        quantityTransferred: 10,
        item: {
          id: "3",
          name: "Smart Watch",
          sku: "SW-001",
          unitId: "pcs",
          costPrice: 120,
          sellingPrice: 249.99,
          isActive: true,
        },
      },
    ],
  },
]

export async function getStockTransfers(locationId?: string, status?: string): Promise<StockTransfer[]> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let transfers = mockTransfers
    if (locationId) {
      transfers = transfers.filter((t) => t.fromLocationId === locationId || t.toLocationId === locationId)
    }
    if (status) {
      transfers = transfers.filter((t) => t.status === status)
    }

    return transfers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error fetching stock transfers:", error)
    throw new Error("Failed to fetch stock transfers")
  }
}

export async function createStockTransfer(data: CreateStockTransferForm): Promise<StockTransfer> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const transferNumber = `TRF-${String(mockTransfers.length + 1).padStart(3, "0")}`

    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      fromLocationId: data.fromLocationId,
      toLocationId: data.toLocationId,
      status: "PENDING",
      transferNumber,
      notes: data.notes,
      requestedBy: "current-user",
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      fromLocation: mockTransfers[0].fromLocation,
      toLocation: mockTransfers[0].toLocation,
      requestedByUser: { id: "current-user", name: "Current User", email: "current@example.com" },
      items: data.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        transferId: `trf-${Date.now()}`,
        itemId: item.itemId,
        quantityRequested: item.quantityRequested,
        notes: item.notes,
        item: mockTransfers[0].items[0].item, // Mock item data
      })),
    }

    mockTransfers.unshift(newTransfer)

    revalidatePath("/stock-management")
    return newTransfer
  } catch (error) {
    console.error("Error creating stock transfer:", error)
    throw new Error("Failed to create stock transfer")
  }
}

export async function updateTransferStatus(
  id: string,
  status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED",
  notes?: string,
): Promise<StockTransfer> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const transfer = mockTransfers.find((t) => t.id === id)
    if (!transfer) {
      throw new Error("Transfer not found")
    }

    transfer.status = status
    transfer.updatedAt = new Date()

    if (status === "IN_TRANSIT" && !transfer.approvedBy) {
      transfer.approvedBy = "current-user"
      transfer.approvedAt = new Date()
    }

    if (status === "COMPLETED" && !transfer.completedBy) {
      transfer.completedBy = "current-user"
      transfer.completedAt = new Date()
      // Set transferred quantities to requested quantities
      transfer.items.forEach((item) => {
        item.quantityTransferred = item.quantityRequested
      })
    }

    if (notes) {
      transfer.notes = notes
    }

    revalidatePath("/stock-management")
    return transfer
  } catch (error) {
    console.error("Error updating transfer status:", error)
    throw new Error("Failed to update transfer status")
  }
}

export async function deleteStockTransfer(id: string): Promise<void> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockTransfers.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error("Stock transfer not found")
    }

    mockTransfers.splice(index, 1)

    revalidatePath("/stock-management")
  } catch (error) {
    console.error("Error deleting stock transfer:", error)
    throw new Error("Failed to delete stock transfer")
  }
}

export async function getStockTransferById(id: string): Promise<StockTransfer | null> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200))

    return mockTransfers.find((t) => t.id === id) || null
  } catch (error) {
    console.error("Error fetching stock transfer:", error)
    throw new Error("Failed to fetch stock transfer")
  }
}
  