'use client'

import { createPurchaseOrder } from '@/actions/purchaseOrderWorkflow/purchaseOrderSystemAction'
import type {
  CreatePurchaseOrderPayload
} from '@/types/purchase-orders-system-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseOrderKeys, purchaseOrderModalKeys } from './purchaseOrderKeys'
// import { purchaseOrderKeys, purchaseOrderModalKeys } from './purchaseOrderKeys'

/**
 * Creates a purchase order by calling the Server Action directly (no fetch).
 * Requires createPurchaseOrder to be exported from a file with "use server". [^1][^2][^3]
 */
export function useCreatePurchaseOrderHook() {
  const qc = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Purchase Order' },
    mutationFn: async (payload: CreatePurchaseOrderPayload) => {
      const res = await createPurchaseOrder(payload)
      if (!res?.success) {
        throw new Error(res.error || 'Failed to create purchase order')
      }
      return res
    },
    onSuccess: (res, variables) => {
      // Prime the individual PO cache if needed
      if (res?.data?.id) {
        qc.setQueryData(purchaseOrderKeys.purchaseOrder(res.data.id), res.data)
      }
      // Invalidate the list and summary for the org
      qc.invalidateQueries({ queryKey: purchaseOrderKeys.purchaseOrders(variables.organizationId) })
      qc.invalidateQueries({ queryKey: purchaseOrderModalKeys.purchaseOrdersSummary(variables.organizationId) })
    },
  })
}
