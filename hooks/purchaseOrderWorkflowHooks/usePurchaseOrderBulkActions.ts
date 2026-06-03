"use client"

import { notify } from "@/lib/notifications/notify"
import { bulkUpdatePurchaseOrderStatus } from "@/actions/purchaseOrderWorkflow/purchaseOrderWorkflowActions"
import { PurchaseOrderStatus } from "@prisma/client"
// import { bulkUpdatePurchaseOrderStatus } from "@/actions/purchase-order-actions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
export type BulkActionType = "approve" | "cancel" | "submit"

export function usePurchaseOrderBulkActions(organizationId: string) {
  const queryClient = useQueryClient()

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["purchase-orders", organizationId] })
    queryClient.invalidateQueries({ queryKey: ["purchase-order-analytics", organizationId] })
  }

  const bulkUpdate = useMutation({
    meta: { operation: 'update', entity: 'bulk' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (params: {
      purchaseOrderIds: string[]
      toStatus: PurchaseOrderStatus
      reason?: string
    }) => {
      const res = await bulkUpdatePurchaseOrderStatus({
        organizationId,
        ...params,
      })
      if (!res.success) throw new Error(res.error || "Bulk update failed")
      return res.data!
    },
    onSuccess: (result) => {
      const { updated, failed } = result
      if (updated.length > 0) {
        notify.success(`Successfully updated ${updated.length} purchase order(s)`)
      }
      if (failed.length > 0) {
        notify.error(`Failed to update ${failed.length} purchase order(s)`)
      }
      invalidateQueries()
    },
    onError: (error) => {
      notify.error(`Bulk update failed: ${error.message}`)
    },
  })

  const bulkApprove = (purchaseOrderIds: string[], approvedById: string) =>
    bulkUpdate.mutate({
      purchaseOrderIds,
      toStatus: "APPROVED",
      reason: `Bulk approved by ${approvedById}`,
    })

  const bulkCancel = (purchaseOrderIds: string[], reason?: string) =>
    bulkUpdate.mutate({
      purchaseOrderIds,
      toStatus: "CANCELLED",
      reason: reason || "Bulk cancellation",
    })

  const bulkSubmit = (purchaseOrderIds: string[]) =>
    bulkUpdate.mutate({
      purchaseOrderIds,
      toStatus: "SUBMITTED",
      reason: "Bulk submission",
    })

  return {
    bulkApprove,
    bulkCancel,
    bulkSubmit,
    isLoading: bulkUpdate.isPending,
  }
}
