"use client"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

// Mock item data with inventory levels
const mockItemsWithInventory = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones",
    price: 99.99,
    sku: "WH001",
    categoryId: "1",
    isActive: true,
    organizationId: "1",
    inventory: {
      id: "1",
      itemId: "1",
      locationId: "1",
      quantity: 25,
      minQuantity: 5,
      maxQuantity: 100,
    },
  },
  {
    id: "2",
    name: "Coffee Mug",
    description: "Ceramic coffee mug",
    price: 12.99,
    sku: "MUG001",
    categoryId: "3",
    isActive: true,
    organizationId: "1",
    inventory: {
      id: "2",
      itemId: "2",
      locationId: "1",
      quantity: 50,
      minQuantity: 10,
      maxQuantity: 200,
    },
  },
  {
    id: "3",
    name: "T-Shirt",
    description: "Cotton t-shirt",
    price: 24.99,
    sku: "TS001",
    categoryId: "2",
    isActive: true,
    organizationId: "1",
    inventory: {
      id: "3",
      itemId: "3",
      locationId: "1",
      quantity: 15,
      minQuantity: 5,
      maxQuantity: 50,
    },
  },
]

export const useOrgItemsWithInventoryLevelsLocation = (locationId?: string) => {
  return useQuery({
    queryKey: ["org-items-with-inventory", locationId],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Filter by location if provided
      if (locationId) {
        return mockItemsWithInventory.filter((item) => item.inventory.locationId === locationId)
      }

      return mockItemsWithInventory
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    enabled: true,
    onError: (error: any) => {
      console.error("Failed to fetch items with inventory:", error)
      toast.error("Failed to load inventory items")
    },
  })
}
