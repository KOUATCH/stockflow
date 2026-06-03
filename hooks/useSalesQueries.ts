"use client"

import { notify } from "@/lib/notifications/notify"
import {
  completeSalesOrder,
  createSalesOrder,
  getSalesOrder,
  getSalesOrders,
  getSalesSummary,
  updatePaymentStatus,
  updateSalesOrderStatus,
} from "@/actions/sales-analyses/salesActions"
import type { PaymentStatus, SalesOrderFilters, SalesOrderStatus } from "@/types/salesTypes"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
// ============================================================================
// QUERY KEYS
// ============================================================================
export const SalesKeys = {
  all: ["sales"] as const,
  orders: () => [...SalesKeys.all, "orders"] as const,
  order: (id: string) => [...SalesKeys.orders(), id] as const,
  list: (filters: SalesOrderFilters) => [...SalesKeys.orders(), "list", filters] as const,
  summary: (organizationId: string) => [...SalesKeys.all, "summary", organizationId] as const,
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch sales orders with filters
 */
export function useSalesOrders(filters: SalesOrderFilters) {
  return useQuery({
    queryKey: SalesKeys.list(filters),
    queryFn: () => getSalesOrders(filters),
    enabled: !!filters.organizationId,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook to fetch single sales order by ID
 */
export function useSalesOrder(id: string | undefined, organizationId?: string) {
  return useQuery({
    queryKey: SalesKeys.order(id!),
    queryFn: () => getSalesOrder(id!, organizationId),
    enabled: !!id,
  })
}

/**
 * Hook to fetch sales summary
 */
export function useSalesSummary(organizationId: string | undefined) {
  return useQuery({
    queryKey: SalesKeys.summary(organizationId!),
    queryFn: () => getSalesSummary(organizationId!),
    enabled: !!organizationId,
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Base mutation options for invalidating sales queries
 */
const getBaseMutationOptions = (queryClient: ReturnType<typeof useQueryClient>) => ({
  onSuccess: (data: any, variables: any) => {
    if (data.message) {
      notify.success(data.message)
    }
    queryClient.invalidateQueries({ queryKey: SalesKeys.all })
    const organizationId = variables.organizationId || data.data?.organizationId
    if (organizationId) {
      queryClient.invalidateQueries({ queryKey: SalesKeys.summary(organizationId) })
    }
    if (data.data?.id) {
      queryClient.invalidateQueries({ queryKey: SalesKeys.order(data.data.id) })
    }
  },
  onError: (error: Error) => {
    notify.error(error.message || "An unexpected error occurred.")
  },
})

/**
 * Hook to create a new sales order
 */
export function useCreateSalesOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { operation: 'create', entity: 'Sales Order' },
    mutationFn: createSalesOrder,
    ...getBaseMutationOptions(queryClient),
  })
}

/**
 * Hook to complete a sales order
 */
export function useCompleteSalesOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { operation: 'complete', entity: 'Sales Order', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({ id, organizationId }: { id: string; organizationId: string }) =>
      completeSalesOrder(id, organizationId),
    ...getBaseMutationOptions(queryClient),
  })
}

/**
 * Hook to update sales order status
 */   
export function useUpdateSalesOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { operation: 'update', entity: 'Sales Order Status' },
    mutationFn: ({
      id,
      status,
      organizationId,
    }: {
      id: string
      status: SalesOrderStatus
      organizationId: string
    }) => updateSalesOrderStatus(id, status, organizationId),
    ...getBaseMutationOptions(queryClient),
  })
}

/**
 * Hook to update payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { operation: 'update', entity: 'Payment Status' },
    mutationFn: ({
      id,
      paymentStatus,
      paymentMethod,
      organizationId,
    }: {
      id: string
      paymentStatus: PaymentStatus
      paymentMethod?: string
      organizationId?: string
    }) => updatePaymentStatus(id, paymentStatus, paymentMethod, organizationId),
    ...getBaseMutationOptions(queryClient),
  })
}

// ============================================================================
// COMBINED SALES ACTIONS HOOK
// ============================================================================
export function useSalesActions() {
  const { mutate: createSalesOrder, isPending: isCreating, error: createError } = useCreateSalesOrder()
  const { mutate: completeSalesOrder, isPending: isCompleting, error: completeError } = useCompleteSalesOrder()
  const { mutate: updateStatus, isPending: isUpdatingStatus, error: updateStatusError } = useUpdateSalesOrderStatus()
  const { mutate: updatePayment, isPending: isUpdatingPayment, error: updatePaymentError } = useUpdatePaymentStatus()

  const isLoading = isCreating || isCompleting || isUpdatingStatus || isUpdatingPayment

  const error = createError || completeError || updateStatusError || updatePaymentError

  return {
    // Actions
    createSalesOrder,
    completeSalesOrder,
    updateStatus,
    updatePayment,
    // Loading states
    isCreating,
    isCompleting,
    isUpdatingStatus,
    isUpdatingPayment,
    isLoading,
    // Errors
    createError,
    completeError,
    updateStatusError,
    updatePaymentError,
    error,
  }
}
