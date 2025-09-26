"use client"

import { db } from "@/prisma/db"
import { useQuery } from "@tanstack/react-query"

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      // Simulate API delay
      const customers = await db.customer.findMany({
        where: { organizationId: "1" },
        orderBy: { createdAt: "desc" },
      })
      console.log("Fetched customers from DB:", customers)
      await new Promise((resolve) => setTimeout(resolve, 600))
      return customers  
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}
