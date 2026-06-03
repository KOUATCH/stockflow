"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPurchaseOrder,
  updatePurchaseOrder,
  addItemToPurchaseOrder,
  removeItemFromPurchaseOrder,
  type PurchaseOrderDetails
} from '@/actions/purchaseOrders/purchaseOrderActions'
import { receiveItems } from '@/actions/purchaseOrderWorkflow/purchaseOrderSystemAction'

// Query hooks
export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: () => getPurchaseOrder(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

// Mutation hooks
export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Purchase Order' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({
      id,
      data
    }: {
      id: string
      data: Parameters<typeof updatePurchaseOrder>[1]
    }) => updatePurchaseOrder(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch the specific purchase order
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', id] })
      // Invalidate purchase orders list if it exists
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
    }
  })
}

export function useAddItemToPurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'add', entity: 'Purchase Order Item' },
    mutationFn: ({
      orderId,
      itemId,
      quantity,
      unitPrice
    }: {
      orderId: string
      itemId: string
      quantity: number
      unitPrice: number
    }) => addItemToPurchaseOrder(orderId, itemId, quantity, unitPrice),
    onSuccess: (_, { orderId }) => {
      // Invalidate and refetch the specific purchase order
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', orderId] })
      // Invalidate items queries in case stock levels changed
      queryClient.invalidateQueries({ queryKey: ['availableProducts'] })
    }
  })
}

export function useRemoveItemFromPurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'delete', entity: 'Item From Purchase Order' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({
      orderId,
      itemId
    }: {
      orderId: string
      itemId: string
    }) => removeItemFromPurchaseOrder(orderId, itemId),
    onSuccess: (_, { orderId }) => {
      // Invalidate and refetch the specific purchase order
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', orderId] })
    }
  })
}

export function useReceiveItems() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'receive', entity: 'Items' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async ({
      purchaseOrderId,
      locationId,
      lines,
      organizationId,
      receivedBy,
      notes
    }: {
      purchaseOrderId: string
      locationId: string
      lines: {
        lineId: string
        quantity: number
        batchNumber?: string
        expiryDate?: string
        serialNumbers?: string[]
        notes?: string
      }[]
      organizationId: string
      receivedBy: string
      notes?: string
    }) => {
      const payload = {
        id: purchaseOrderId,
        organizationId,
        receivedBy,
        locationId,
        notes,
        items: lines.map(line => ({
          lineId: line.lineId,
          receivedQuantity: line.quantity,
          batchNumber: line.batchNumber,
          expiryDate: line.expiryDate,
          serialNumbers: line.serialNumbers,
          notes: line.notes
        }))
      };
      const result = await receiveItems(payload);
      if (!result.success) {
        throw new Error(result.error || 'Failed to receive items')
      }
      return result;
    },
    onSuccess: (_, { purchaseOrderId }) => {
      // Invalidate and refetch the specific purchase order
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', purchaseOrderId] })
      // Invalidate purchase orders list
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
      // Invalidate inventory-related queries
      queryClient.invalidateQueries({ queryKey: ['availableProducts'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    }
  })
}

// Optimistic update helpers
export function useOptimisticPurchaseOrderUpdate() {
  const queryClient = useQueryClient()

  const optimisticUpdate = (
    orderId: string,
    updater: (old: PurchaseOrderDetails | undefined) => PurchaseOrderDetails
  ) => {
    queryClient.setQueryData(['purchaseOrder', orderId], updater)
  }

  const revertOptimisticUpdate = (orderId: string) => {
    queryClient.invalidateQueries({ queryKey: ['purchaseOrder', orderId] })
  }

  return { optimisticUpdate, revertOptimisticUpdate }
}
