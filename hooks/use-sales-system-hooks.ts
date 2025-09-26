"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createSalesOrder, updateSalesOrderStatus, processPayment, getSalesOrders } from "@/lib/actions/sales"
import type { SalesOrderStatus, PaymentStatus } from "@prisma/client"

// Get sales orders hook
export function useSalesOrders(params: {
  organizationId: string
  locationId?: string
  customerId?: string
  status?: SalesOrderStatus
  paymentStatus?: PaymentStatus
  page?: number
  limit?: number
  startDate?: Date
  endDate?: Date
}) {
  return useQuery({
    queryKey: ["sales-orders", params],
    queryFn: () => getSalesOrders(params),
  })
}

// Create sales order mutation
export function useCreateSalesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSalesOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] })
    },
  })
}

// Update sales order status mutation
export function useUpdateSalesOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SalesOrderStatus }) => updateSalesOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
    },
  })
}

// Process payment mutation
export function useProcessPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: processPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      queryClient.invalidateQueries({ queryKey: ["payments"] })
    },
  })
}
