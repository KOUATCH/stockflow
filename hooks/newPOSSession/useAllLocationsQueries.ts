"use client"

import { notify } from "@/lib/notifications/notify"
import { useQuery } from "@tanstack/react-query"
// Mock location data
const mockLocations = [
  {
    id: "1",
    name: "Main Store",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    phone: "(555) 123-4567",
    isActive: true,
    organizationId: "1",
  },
  {
    id: "2",
    name: "Downtown Branch",
    address: "456 Broadway",
    city: "New York",
    state: "NY",
    zipCode: "10002",
    phone: "(555) 987-6543",
    isActive: true,
    organizationId: "1",
  },
]

export const useOrgLocationsNew = () => {
  return useQuery({
    queryKey: ["org-locations"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      return mockLocations
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: any) => {
      console.error("Failed to fetch locations:", error)
      notify.error("Failed to load locations")
    },
  })
}
