import { GoodsReceiptPayload, receiveItems } from "@/actions/purchaseOrderWorkflow/purchaseOrderSystemAction"
// import { GoodsReceiptPayload } from "@/types/goods-receipts"
import { PurchaseOrderResponse, PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"
import { useQueryClient } from "@tanstack/react-query"
'use client'

import { useMutation, type UseMutationOptions } from '@tanstack/react-query'

export type ReceiveItemsVariables = GoodsReceiptPayload
export type ReceiveItemsResult = PurchaseOrderResponse<PurchaseOrderWithRelations>

export function useReceiveItemsHook(
  options?: Omit<
    UseMutationOptions<ReceiveItemsResult, Error, ReceiveItemsVariables, unknown>,
    'mutationFn' | 'mutationKey'
  >,
) {
  const queryClient = useQueryClient()

  return useMutation<ReceiveItemsResult, Error, ReceiveItemsVariables>({
    mutationKey: ['purchaseOrders', 'receive-items'],
    mutationFn: async (payload: ReceiveItemsVariables) => {
      // Call the Server Action directly
      return await receiveItems(payload)
    },
    onSuccess: async (data, variables, ctx) => {
      // Invalidate common PO and inventory-related queries in the client cache
      // Adjust keys to match your project's query keys if different.
      const poId = variables.id
      const orgId = variables.organizationId

      // Lists
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] }),
        queryClient.invalidateQueries({ queryKey: ['purchaseOrders', orgId] }),
        // Detail
        queryClient.invalidateQueries({ queryKey: ['purchaseOrder', poId] }),
        // Goods receipts
        queryClient.invalidateQueries({ queryKey: ['goodsReceipts', poId] }),
        // Inventory and items
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory', orgId] }),
        queryClient.invalidateQueries({ queryKey: ['items'] }),
        queryClient.invalidateQueries({ queryKey: ['items', orgId] }),
      ])

      // Forward to consumer if provided
      options?.onSuccess?.(data, variables, ctx)
    },
    onError: (error, variables, ctx) => {
      options?.onError?.(error, variables, ctx)
    },
    onSettled: (data, error, variables, ctx) => {
      options?.onSettled?.(data, error, variables, ctx)
    },
  })
}
