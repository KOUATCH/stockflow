"use client"

import { notify } from "@/lib/notifications/notify"
import { useQuery } from "@tanstack/react-query"
// Mock category data
const mockCategories = [
  {
    id: "1",
    name: "Electronics",
    description: "Electronic devices and accessories",
    isActive: true,
    organizationId: "1",
  },
  {
    id: "2",
    name: "Clothing",
    description: "Apparel and fashion items",
    isActive: true,
    organizationId: "1",
  },
  {
    id: "3",
    name: "Food & Beverages",
    description: "Food items and drinks",
    isActive: true,
    organizationId: "1",
  },
]

export const useOrgCategories = () => {
  return useQuery({
    queryKey: ["org-categories"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockCategories
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error: any) => {
      console.error("Failed to fetch categories:", error)
      notify.error("Failed to load categories")
    },
  })
}
