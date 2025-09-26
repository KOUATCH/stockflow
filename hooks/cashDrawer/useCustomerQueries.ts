"use client"

import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

// Mock customer data
const mockCustomers = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    address: "123 Customer St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    isActive: true,
    organizationId: "1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@email.com",
    phone: "(555) 987-6543",
    address: "456 Client Ave",
    city: "New York",
    state: "NY",
    zipCode: "10002",
    isActive: true,
    organizationId: "1",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
]

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600))
      return mockCustomers
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error: any) => {
      console.error("Failed to fetch customers:", error)
      toast.error("Failed to load customers")
    },
  })
}
