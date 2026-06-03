import {
  createStockTransfer,
  deleteStockTransfer,
  getStockTransferById,
  getStockTransfers,
  updateTransferStatus,
} from "@/actions/stock/stockTransferActions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"

export function useStockTransfers(locationId?: string, status?: string) {
  return useQuery({
    queryKey: ["stock-transfers", locationId, status],
    queryFn: () => getStockTransfers(locationId, status),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export function useStockTransfer(id: string) {
  return useQuery({
    queryKey: ["stock-transfer", id],
    queryFn: () => getStockTransferById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications()

  return useMutation({
    meta: { operation: 'create', entity: 'Stock Transfer' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: createStockTransfer,
    onSuccess: (data) => {
      // Invalidate and refetch transfers
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] })

      success(
        "Stock Transfer Created",
        `Transfer ${data.transferNumber} from ${data.fromLocation?.name} to ${data.toLocation?.name} has been created successfully`,
        {
          category: "inventory",
          priority: "normal",
          action: {
            label: "View Transfer",
            onClick: () => console.log("View transfer", data.id)
          }
        }
      )
    },
    onError: (err) => {
      error(
        "Transfer Creation Failed",
        err.message || "Unable to create stock transfer",
        {
          category: "inventory",
          priority: "high",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry transfer creation")
          }
        }
      )
    },
  })
}

export function useUpdateTransferStatus() {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications()

  return useMutation({
    meta: { operation: 'update', entity: 'Transfer Status' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string
      status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED"
      notes?: string
    }) => updateTransferStatus(id, status, notes),
    onSuccess: (data) => {
      // Invalidate and refetch transfers
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] })
      queryClient.invalidateQueries({ queryKey: ["stock-transfer", data.id] })

      const statusLabel = data.status.replace('_', ' ').toLowerCase()
      const statusColor = data.status === 'COMPLETED' ? 'success' :
                         data.status === 'CANCELLED' ? 'warning' : 'info'

      success(
        "Transfer Status Updated",
        `Transfer ${data.transferNumber} is now ${statusLabel}`,
        {
          category: "inventory",
          priority: "normal",
          action: {
            label: "View Details",
            onClick: () => console.log("View transfer details", data.id)
          }
        }
      )
    },
    onError: (err) => {
      error(
        "Status Update Failed",
        err.message || "Unable to update transfer status",
        {
          category: "inventory",
          priority: "normal",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry status update")
          }
        }
      )
    },
  })
}

export function useDeleteStockTransfer() {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications()

  return useMutation({
    meta: { operation: 'delete', entity: 'Stock Transfer' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: deleteStockTransfer,
    onSuccess: () => {
      // Invalidate and refetch transfers
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] })

      success(
        "Transfer Deleted",
        "The stock transfer has been permanently removed from the system",
        {
          category: "inventory",
          priority: "normal"
        }
      )
    },
    onError: (err) => {
      error(
        "Delete Failed",
        err.message || "Unable to delete the stock transfer",
        {
          category: "inventory",
          priority: "normal",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry delete transfer")
          }
        }
      )
    },
  })
}
