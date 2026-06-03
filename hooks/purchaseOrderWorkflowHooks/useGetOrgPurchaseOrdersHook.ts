"use client"

import { notify } from "@/lib/notifications/notify"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
// Import Server Actions from a "use server" module
// import { getOrgPurchaseOrders } from "@/actions/newPOActions/getOrgPurchaseOrders"
import { getOrgPurchaseOrders } from "@/actions/purchaseOrderWorkflow/purchaseOrderWorkflowActions"
import type { PurchaseOrderResponse, PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"
import { purchaseOrderKeys } from "./purchaseOrderKeys"

/**
 * Hook to fetch purchase orders with optional filters
 * Handles undefined filters gracefully by disabling the query
 */
const useGetOrgPurchaseOrdersHook = (organizationId: string, options?: { enabled?: boolean }) => {
  return useQuery<PurchaseOrderResponse<PurchaseOrderWithRelations[]>>({
    queryKey: purchaseOrderKeys.orgPurchaseOrders(organizationId),
    queryFn: async () => {
       if (!organizationId) { 
        throw new Error("Organization ID is required")
      }
      const result = await getOrgPurchaseOrders(organizationId)

      if (!result.success) {
        notify.error(result.error || "Failed to load Purchase Orders. Please try again.")
        throw new Error(result.error || "Failed to load Purchase Orders. Please try again.")
      }

      return result
    },
    // enabled: Boolean(organizationId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: !!organizationId && (options?.enabled ?? true),

    retry: (failureCount, error) => {
      // Don't retry if it's a validation error (missing organizationId)
      if (error.message.includes("Organization ID is required")) {
        return false
      }
      return failureCount < 2
    },
  })
}

export default useGetOrgPurchaseOrdersHook
