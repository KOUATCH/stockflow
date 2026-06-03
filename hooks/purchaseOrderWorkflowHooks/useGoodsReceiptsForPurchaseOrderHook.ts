"use client"

import {
  getGoodsReceiptsForPurchaseOrder,
  getPurchaseOrdersSummary,
  GoodsReceiptWithRelations,
  PurchaseOrderSummary,
} from "@/actions/purchaseOrderWorkflow/GoodsReceiptAndSummary"
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
      
      return getPurchaseOrdersSummary(organizationId)
    },
    enabled: Boolean(organizationId),
    staleTime: 30_000,
    retry: 1,
  })
}
