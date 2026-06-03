'use client'

import { updatePurchaseOrder } from '@/actions/purchaseOrderWorkflow/purchaseOrderSystemAction'
import type {
  PurchaseOrderResponse,
  PurchaseOrderWithRelations,
  UpdatePurchaseOrderDTO,
} from '@/types/purchase-orders-system-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseOrderKeys, purchaseOrderModalKeys } from './purchaseOrderKeys'

/**
 * Updates a purchase order by calling the Server Action directly (no fetch).
 * Requires updatePurchaseOrder to be exported from a "use server" module. [^1]
 */
export function useUpdatePurchaseOrderHook() {
  const qc = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Purchase Order' },
    mutationFn: async (payload: UpdatePurchaseOrderDTO) => {
      const res = await updatePurchaseOrder(payload)
      if (!res?.success) {
        throw new Error(res?.error || 'Failed to update purchase order')
      }
      return res as PurchaseOrderResponse<PurchaseOrderWithRelations>
    },
    onSuccess: (res, variables) => {
      const id = variables.id
      const orgId = variables.organizationId

      // Prime single PO cache
      if (res?.data && id) {
        qc.setQueryData(purchaseOrderKeys.purchaseOrder(id), res.data)
      }

      // Invalidate related queries
      if (orgId) {
        qc.invalidateQueries({ queryKey: purchaseOrderKeys.purchaseOrders(orgId) })
        qc.invalidateQueries({ queryKey: purchaseOrderModalKeys.purchaseOrdersSummary(orgId) })
      }
      if (id) {
        qc.invalidateQueries({ queryKey: purchaseOrderModalKeys.goodsReceiptsForPO(id) })
      }
    },
  })
}
