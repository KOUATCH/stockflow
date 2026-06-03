'use client'

import { deletePurchaseOrder } from '@/actions/purchaseOrderWorkflow/purchaseOrderSystemAction';
import type {
  PaginatedPurchaseOrdersResponse,
  PurchaseOrderResponse,
} from '@/types/purchase-orders-system-types';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { purchaseOrderKeys, purchaseOrderModalKeys } from './purchaseOrderKeys';

type Variables = { id: string; organizationId: string }

type Context = {
  previousPO?: unknown
  snapshots?: { key: QueryKey; data: unknown }[]
}

/**
 * Delete a purchase order by calling the Server Action directly (no fetch).
 * - Performs optimistic updates on any cached purchase-orders lists and the single purchase-order cache.
 * - Rolls back on error, and invalidates on settle to ensure fresh data.
 */
export function useDeletePurchaseOrderHook() {
  const qc = useQueryClient()

  return useMutation<PurchaseOrderResponse<null>, Error, Variables, Context>({
    meta: { operation: 'delete', entity: 'Purchase Order' },
    mutationFn: async ({ id, organizationId }) => {
      const res = await deletePurchaseOrder(id, organizationId)
      if (!res?.success) throw new Error(res?.error || res?.message || 'Failed to delete purchase order')
      return res
    },

    // Optimistic update
    onMutate: async (vars) => {
      await qc.cancelQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'purchase-orders' })
      await qc.cancelQueries({ queryKey: purchaseOrderKeys.purchaseOrder(vars.id) })

      // Snapshot individual PO
      const previousPO = qc.getQueryData(purchaseOrderKeys.purchaseOrder(vars.id))

      // Remove individual PO from cache
      qc.setQueryData(purchaseOrderKeys.purchaseOrder(vars.id), undefined)

      // Snapshot and optimistically update all purchase-orders lists
      const listQueries = qc.getQueryCache().findAll({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'purchase-orders',
      })

      const snapshots: { key: QueryKey; data: unknown }[] = listQueries.map((q) => ({
        key: q.queryKey,
        data: qc.getQueryData(q.queryKey),
      }))

      for (const q of listQueries) {
        const current = qc.getQueryData<PaginatedPurchaseOrdersResponse>(q.queryKey)
        if (!current?.data) continue
        const filtered = current.data.filter((po) => po.id !== vars.id)
        const newTotal = Math.max(0, (current.pagination?.total ?? filtered.length) - 1)
        qc.setQueryData(q.queryKey, {
          ...current,
          data: filtered,
          pagination: current.pagination
            ? {
                ...current.pagination,
                total: newTotal,
                pageEnd:
                  current.pagination.pageStart === 0
                    ? 0
                    : Math.min(current.pagination.pageStart + filtered.length - 1, newTotal),
                totalPages:
                  current.pagination.limit > 0 ? Math.max(1, Math.ceil(newTotal / current.pagination.limit)) : 1,
              }
            : current.pagination,
        } as PaginatedPurchaseOrdersResponse)
      }

      return { previousPO, snapshots }
    },

    // Rollback on error
    onError: (_err, vars, ctx) => {
      if (ctx?.previousPO !== undefined) {
        qc.setQueryData(purchaseOrderKeys.purchaseOrder(vars.id), ctx.previousPO)
      }
      if (ctx?.snapshots) {
        for (const snap of ctx.snapshots) {
          qc.setQueryData(snap.key, snap.data)
        }
      }
    },

    // Invalidate on success
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: purchaseOrderKeys.purchaseOrder(vars.id) })
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'purchase-orders' })
      qc.invalidateQueries({ queryKey: purchaseOrderModalKeys.purchaseOrdersSummary(vars.organizationId) })
    },

    // Always refetch to be safe
    onSettled: (_data, _error, vars) => {
      qc.invalidateQueries({ queryKey: purchaseOrderKeys.purchaseOrder(vars.id) })
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'purchase-orders' })
      qc.invalidateQueries({ queryKey: purchaseOrderModalKeys.purchaseOrdersSummary(vars.organizationId) })
    },
  })
}
