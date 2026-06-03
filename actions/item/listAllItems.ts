"use server"
import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";

export type ItemWithRelations = {
  id: string
  name: string
  sku: string
  costPrice: number
  sellingPrice: number
  quantity: number
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export type PaginatedItems = {
  data: ItemWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Mock data for demonstration - replace with actual database calls
const mockItems: ItemWithRelations[] = [
  {
    id: "1",
    name: "Sample Item 1",
    sku: "ITEM-001",
    costPrice: 10.0,
    sellingPrice: 15.0,
    quantity: 100,
    organizationId: "org-1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Sample Item 2",
    sku: "ITEM-002",
    costPrice: 20.0,
    sellingPrice: 30.0,
    quantity: 50,
    organizationId: "org-1",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "3",
    name: "Premium Widget",
    sku: "WIDGET-001",
    costPrice: 25.0,
    sellingPrice: 40.0,
    quantity: 75,
    organizationId: "org-1",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
  },
]

/**
 * Lists Items with search, filters, sorting, and pagination.
 * Simplified version for basic functionality.
 */
export const listAllItems = inventoryAction(
  async (
    organizationId: string,
    q?: string,
    page = 1,
    pageSize = 25,
  ): Promise<ServerActionResult<PaginatedItems>> => {
    // Filter items by organization and search query
    let filteredItems = mockItems.filter((item) => item.organizationId === organizationId)

    if (q) {
      const searchTerm = q.toLowerCase()
      filteredItems = filteredItems.filter(
        (item) => item.name.toLowerCase().includes(searchTerm) || item.sku.toLowerCase().includes(searchTerm),
      )
    }

    const total = filteredItems.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const startIndex = (page - 1) * pageSize
    const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize)

    return {
      success: true,
      data: {
        data: paginatedItems,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  },
  {
    actionName: 'listAllItems',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'read',
      resourceType: 'item'
    }
  }
)
