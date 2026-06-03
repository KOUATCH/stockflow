"use client"

import { notify } from "@/lib/notifications/notify"
import { useQuery } from "@tanstack/react-query"
// Mock inventory data
const mockInventoryItems = [
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
      lastUpdated: new Date(),
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
      lastUpdated: new Date(),
    },
  },
]

export const useItemsWithInventory = () => {
  return useQuery({
    queryKey: ["items-with-inventory"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 700))
      return mockInventoryItems
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 3,
    onError: (error: any) => {
      console.error("Failed to fetch inventory items:", error)
      notify.error("Failed to load inventory")
    },
  })
}
