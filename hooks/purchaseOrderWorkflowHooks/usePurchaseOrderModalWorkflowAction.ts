"use client"

import {
  approvePurchaseOrder,
  bulkUpdatePurchaseOrderStatus,
  cancelPurchaseOrder,
  closePurchaseOrder,
  getOrgPurchaseOrderById,
  receiveItems,
  submitPurchaseOrder,
} from "@/actions/purchaseOrderWorkflow/purchaseOrderSystemAction"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
export type PurchaseOrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "COMPLETED"
  | "CANCELLED"

export type WorkflowAction = {
  id: string
  label: string
  status: PurchaseOrderStatus
  variant: "default" | "destructive" | "outline" | "secondary"
  requiresConfirmation?: boolean
  requiresInput?: boolean
  disabled?: boolean
}

// Define workflow transitions and available actions per status
const WORKFLOW_ACTIONS: Record<PurchaseOrderStatus, WorkflowAction[]> = {
  DRAFT: [
    { id: "submit", label: "Submit for Approval", status: "SUBMITTED", variant: "default" },
    { id: "cancel", label: "Cancel", status: "CANCELLED", variant: "destructive", requiresConfirmation: true },
  ],
  SUBMITTED: [
    { id: "approve", label: "Approve", status: "APPROVED", variant: "default" },
    {
      id: "cancel",
      label: "Cancel",
      status: "CANCELLED",
      variant: "destructive",
      requiresConfirmation: true,
      requiresInput: true,
    },
  ],
  APPROVED: [
    { id: "receive", label: "Receive Items", status: "PARTIALLY_RECEIVED", variant: "default" },
    {
      id: "cancel",
      label: "Cancel",
      status: "CANCELLED",
      variant: "destructive",
      requiresConfirmation: true,
      requiresInput: true,
    },
  ],
  PARTIALLY_RECEIVED: [
    { id: "receive", label: "Receive More Items", status: "PARTIALLY_RECEIVED", variant: "default" },
    { id: "complete", label: "Mark as Received", status: "RECEIVED", variant: "default" },
    {
      id: "cancel",
      label: "Cancel",
      status: "CANCELLED",
      variant: "destructive",
      requiresConfirmation: true,
      requiresInput: true,
    },
  ],
  RECEIVED: [{ id: "close", label: "Close Order", status: "COMPLETED", variant: "default" }],
  COMPLETED: [],
  CANCELLED: [],
}

export function usePurchaseOrderModalWorkflowAction(id: string, organizationId?: string) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  // Mock user data if no session (for development)
  const user = session?.user || {
    id: "system-user-001",
    name: "System User",
    email: "system@example.com",
  }

  // Get current purchase order data
  const { data: purchaseOrder, isLoading } = useQuery({
    queryKey: ["purchase-order", id, organizationId],
    queryFn: () => getOrgPurchaseOrderById(id, organizationId),
    enabled: !!id,
  })

  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["purchase-order", id, organizationId],
    })
    await queryClient.invalidateQueries({
      queryKey: ["purchase-orders", organizationId],
    })
    // Also invalidate inventory queries if they exist
    await queryClient.invalidateQueries({
      queryKey: ["inventory", organizationId],
    })
  }

  // Submit purchase order
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await submitPurchaseOrder(id, organizationId!)
      if (!res.success) throw new Error(res.error || "Failed to submit purchase order")
      return res.data!
    },
    onSuccess: () => {
      toast.success("Purchase order submitted successfully")
      invalidateQueries()
    },
    onError: (error) => {
      toast.error(`Failed to submit: ${error.message}`)
    },
  })

  // Approve purchase order
  const approveMutation = useMutation({
    mutationFn: async (approvedById: string) => {
      const res = await approvePurchaseOrder(id, organizationId!, approvedById)
      if (!res.success) throw new Error(res.error || "Failed to approve purchase order")
      return res.data!
    },
    onSuccess: () => {
      toast.success("Purchase order approved successfully")
      invalidateQueries()
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`)
    },
  })

  // Cancel purchase order
  const cancelMutation = useMutation({
    mutationFn: async (reason?: string) => {
      const res = await cancelPurchaseOrder(id, organizationId!, reason)
      if (!res.success) throw new Error(res.error || "Failed to cancel purchase order")
      return res.data!
    },
    onSuccess: () => {
      toast.success("Purchase order cancelled successfully")
      invalidateQueries()
    },
    onError: (error) => {
      toast.error(`Failed to cancel: ${error.message}`)
    },
  })

  // Close purchase order
  const closeMutation = useMutation({
    mutationFn: async () => {
      const res = await closePurchaseOrder(id)
      if (!res.success) throw new Error(res.error || "Failed to close purchase order")
      return res.data!
    },
    onSuccess: () => {
      toast.success("Purchase order closed successfully")
      invalidateQueries()
    },
    onError: (error) => {
      toast.error(`Failed to close: ${error.message}`)
    },
  })

  // Receive items (with inventory integration)
  const receiveMutation = useMutation({
    mutationFn: async (lines: { lineId: string; quantity: number }[]) => {
      const payload = {
        id,
        organizationId: organizationId!,
        receivedById: user.id, // Now properly references user from session
        receivedBy: user.name, // Now properly references user name from session
        items: lines.map((line) => ({
          lineId: line.lineId,
          receivedQuantity: line.quantity,
        })),
      }
      const res = await receiveItems(payload)
      if (!res.success) throw new Error(res.error || "Failed to receive items")
      return res.data!
    },
    onSuccess: (data) => {
      const receivedCount = data.lines?.filter((line: any) => line.receivedQuantity > 0).length || 0
      toast.success(`Successfully received ${receivedCount} item(s) and updated inventory`)
      invalidateQueries()
    },
    onError: (error) => {
      toast.error(`Failed to receive items: ${error.message}`)
    },
  })

  // Bulk status update
  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: PurchaseOrderStatus }) => {
      const res = await bulkUpdatePurchaseOrderStatus({
        organizationId: organizationId!,
        purchaseOrderIds: ids,
        toStatus: status,
      })
      if (!res.success) throw new Error(res.error || "Failed to update status")
      return res.data!
    },
    onSuccess: (data) => {
      const successCount = data.updated?.length || 0
      const failedCount = data.failed?.length || 0

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} purchase order(s)`)
      }
      if (failedCount > 0) {
        toast.error(`Failed to update ${failedCount} purchase order(s)`)
      }

      invalidateQueries()
    },
    onError: (error) => {
      toast.error(`Bulk update failed: ${error.message}`)
    },
  })

  // Get available actions for current status
  const getAvailableActions = (): WorkflowAction[] => {
    if (!purchaseOrder?.status) return []
    return WORKFLOW_ACTIONS[purchaseOrder.status as PurchaseOrderStatus] || []
  }

  // Check if specific action is available
  const canPerformAction = (actionId: string): boolean => {
    return getAvailableActions().some((action) => action.id === actionId)
  }

  // Execute workflow action
  const executeAction = async (actionId: string, params?: any) => {
    switch (actionId) {
      case "submit":
        return submitMutation.mutateAsync()
      case "approve":
        return approveMutation.mutateAsync(params.approvedById)
      case "cancel":
        return cancelMutation.mutateAsync(params.reason)
      case "close":
        return closeMutation.mutateAsync()
      case "receive":
        return receiveMutation.mutateAsync(params.lines)
      case "complete":
        return closeMutation.mutateAsync()
      default:
        throw new Error(`Unknown action: ${actionId}`)
    }
  }

  return {
    // Data
    purchaseOrder,
    isLoading,

    // Actions
    submit: submitMutation,
    approve: approveMutation,
    cancel: cancelMutation,
    close: closeMutation,
    receive: receiveMutation,
    bulkStatusUpdate: bulkStatusMutation,

    // Workflow helpers
    availableActions: getAvailableActions(),
    canPerformAction,
    executeAction,

    // Status
    isSubmitting: submitMutation.isPending,
    isApproving: approveMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isClosing: closeMutation.isPending,
    isReceiving: receiveMutation.isPending,
    isBulkUpdating: bulkStatusMutation.isPending,

    // Any action in progress
    isProcessing: [
      submitMutation.isPending,
      approveMutation.isPending,
      cancelMutation.isPending,
      closeMutation.isPending,
      receiveMutation.isPending,
      bulkStatusMutation.isPending,
    ].some(Boolean),
  }
}
