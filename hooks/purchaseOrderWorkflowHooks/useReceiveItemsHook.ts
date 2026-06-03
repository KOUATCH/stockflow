'use client'

import { GoodsReceiptPayload, receiveItems } from "@/actions/purchaseOrderWorkflow/purchaseOrderSystemAction"
// import { GoodsReceiptPayload } from "@/types/goods-receipts"
import { PurchaseOrderResponse, PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'

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
    meta: { operation: 'receive', entity: 'Items' },
    mutationKey: ['purchaseOrders', 'receive-items'],
    mutationFn: async (payload: ReceiveItemsVariables) => {
      const result = await receiveItems(payload)
      if (!result.success) {
        throw new Error(result.error || 'Failed to receive items')
      }
      return result
    },
    onSuccess: async (data, variables, ctx, context) => {
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
      options?.onSuccess?.(data, variables, ctx, context)
    },
    onError: (error, variables, ctx, context) => {
      options?.onError?.(error, variables, ctx, context)
    },
    onSettled: (data, error, variables, ctx, context) => {
      options?.onSettled?.(data, error, variables, ctx, context)
    },
  })
}
