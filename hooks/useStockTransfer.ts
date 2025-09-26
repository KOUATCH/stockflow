import {
  createStockTransfer,
  deleteStockTransfer,
  getStockTransferById,
  getStockTransfers,
  updateTransferStatus,
} from "@/actions/stock/stockTransferActions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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

  return useMutation({
    mutationFn: createStockTransfer,
    onSuccess: (data) => {
      // Invalidate and refetch transfers
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] })

      toast.success("Stock transfer created successfully", {
        description: `Transfer ${data.transferNumber} from ${data.fromLocation?.name} to ${data.toLocation?.name}`,
      })
    },
    onError: (error) => {
      toast.error("Failed to create stock transfer", {
        description: error.message,
      })
    },
  })
}

export function useUpdateTransferStatus() {
  const queryClient = useQueryClient()

  return useMutation({
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

      toast.success("Transfer status updated successfully", {
        description: `Transfer ${data.transferNumber} is now ${data.status.toLowerCase()}`,
      })
    },
    onError: (error) => {
      toast.error("Failed to update transfer status", {
        description: error.message,
      })
    },
  })
}

export function useDeleteStockTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteStockTransfer,
    onSuccess: () => {
      // Invalidate and refetch transfers
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] })

      toast.success("Stock transfer deleted successfully")
    },
    onError: (error) => {
      toast.error("Failed to delete stock transfer", {
        description: error.message,
      })
    },
  })
}
