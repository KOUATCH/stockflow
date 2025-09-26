import { getPurchaseOrdersSummary } from "@/actions/purchaseOrderWorkflow/purchaseOrderWorkflowActions"
import { useQuery } from "@tanstack/react-query"
import { purchaseOrderModalKeys } from "./purchaseOrderKeys"

/**
 * Fetch Purchase Orders summary for an organization by calling the Server Action directly (no fetch).
 */
export function usePurchaseOrdersSummaryHook(organizationId: string | undefined) {
  return useQuery<PurchaseOrderSummary>({
    queryKey: purchaseOrderModalKeys.purchaseOrdersSummary(organizationId),
    queryFn: async () => {
      if (!organizationId) throw new Error('Organization ID is required')
      return await getPurchaseOrdersSummary(organizationId)
    },
    enabled: Boolean(organizationId),
    staleTime: 30_000,
    retry: 1,
  })
}