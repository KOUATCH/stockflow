"use client"

import { useQuery } from "@tanstack/react-query"


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
  })
}
