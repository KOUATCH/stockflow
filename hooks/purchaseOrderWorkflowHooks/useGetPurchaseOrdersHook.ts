"use client"
import { getOrgPurchaseOrders } from "@/actions/purchaseOrderWorkflow/purchaseOrderWorkflowActions"
import type { PurchaseOrderResponse, PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { purchaseOrderKeys } from "./purchaseOrderKeys"

/**
 * Hook to fetch purchase orders with optional filters
 * Handles undefined filters gracefully by disabling the query
 */
const useGetPurchaseOrdersHook = (organizationId: string) => {
  // Stabilize the filters object to prevent unnecessary re-renders
  // Only stringify if filters exists to avoid JSON.stringify(undefined)
  // const stableFilters = useMemo(() => organizationId, [JSON.stringify(organizationId) ])

  return useQuery<PurchaseOrderResponse<PurchaseOrderWithRelations[]>>({
    queryKey: purchaseOrderKeys.purchaseOrders(organizationId),
    queryFn: async () => await getOrgPurchaseOrders(organizationId),
    // Only enable query when we have valid filters with organizationId
    enabled: Boolean(organizationId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      // Don't retry if it's a validation error (missing organizationId)
      if (error.message.includes("Organization ID is required")) {
        return false
      }
      return failureCount < 2
    },
  })
}

export default useGetPurchaseOrdersHook
