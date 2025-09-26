'use client'
import { getOrgPurchaseOrderById } from "@/actions/purchaseOrderWorkflow/purchaseOrderWorkflowActions"
import type { PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"
import { useQuery } from '@tanstack/react-query'
import { purchaseOrderModalKeys } from "./purchaseOrderKeys"


/**
 * Fetch a single supplier by ID (optionally scoped by organization) using TanStack Query.
 * Calls the Server Action directly from the client.
 */
export function useGetOrgPurchaseOrderHook(id?: string, organizationId?: string) {
  return useQuery<PurchaseOrderWithRelations, Error>({
    queryKey: purchaseOrderModalKeys.purchaseOrder(id),
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error('PurchaseOrder ID is required')
      const supplier = await getOrgPurchaseOrderById(id, organizationId)
      return supplier
    },
    // Tune as needed:
    staleTime: 60_000,
  })
}
