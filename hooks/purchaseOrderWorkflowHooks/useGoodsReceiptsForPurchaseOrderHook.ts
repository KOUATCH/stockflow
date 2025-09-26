'use client'

// import { getGoodsReceiptsForPurchaseOrder, getPurchaseOrdersSummary, GoodsReceiptWithRelations } from "@/actions/purchaseOrders/GoodsReceiptAndSummary"
// import { PurchaseOrderSummary } from "@/types/purchase-orders-system-types"
import { getGoodsReceiptsForPurchaseOrder, GoodsReceiptWithRelations, PurchaseOrderSummary } from "@/actions/purchaseOrderWorkflow/GoodsReceiptAndSummary"
import { getPurchaseOrdersSummary } from "@/actions/purchaseOrderWorkflow/purchaseOrderWorkflowActions"
import { useQuery } from "@tanstack/react-query"
import { purchaseOrderModalKeys } from "./purchaseOrderKeys"

/**
 * Fetch Goods Receipts for a Purchase Order by calling the Server Action directly (no fetch).
 * Requires both purchaseOrderId and organizationId.
 */
export function useGoodsReceiptsForPurchaseOrderHook(
  purchaseOrderId: string | undefined,
  organizationId?: string
) {
  return useQuery<GoodsReceiptWithRelations[]>({
    queryKey: purchaseOrderModalKeys.goodsReceiptsForPO(purchaseOrderId),
    queryFn: async () => {
      if (!purchaseOrderId || !organizationId) throw new Error('Missing purchaseOrderId or organizationId')
      return await getGoodsReceiptsForPurchaseOrder(purchaseOrderId, organizationId)
    },
    enabled: Boolean(purchaseOrderId && organizationId),
    staleTime: 30_000,
    retry: 1,
  })
}
/**
 * Fetch Purchase Orders summary for an organization by calling the Server Action directly (no fetch).
 */
export function usePurchaseOrdersSummaryHook(organizationId: string) {
  return useQuery<PurchaseOrderSummary>({
    queryKey: purchaseOrderModalKeys.purchaseOrdersSummary(organizationId),
    queryFn: async () => {
      if (!organizationId) throw new Error('Organization ID is required')
      
      const result = await getPurchaseOrdersSummary(organizationId)
      
      // Transform the data to match our expected type
      return {
        ...result,
        statusBreakdown: {
          ...result.statusBreakdown,
          closed: result.statusBreakdown.completed, // Map completed to closed
          completed: undefined, // Remove the completed property
        }
      } as PurchaseOrderSummary
    },
    enabled: Boolean(organizationId),
    staleTime: 30_000,
    retry: 1,
  })
}