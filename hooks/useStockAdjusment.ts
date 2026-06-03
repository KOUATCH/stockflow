import { notify } from "@/lib/notifications/notify"
import {
  createStockAdjustment,
  deleteStockAdjustment,
  getStockAdjustmentById,
  getStockAdjustments,
} from "@/actions/stock/stockAdjusmentActions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
export function useStockAdjustments(locationId?: string) {
  return useQuery({
    queryKey: ["stock-adjustments", locationId],
    queryFn: () => getStockAdjustments(locationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export function useStockAdjustment(id: string) {
  return useQuery({
    queryKey: ["stock-adjustment", id],
    queryFn: () => getStockAdjustmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Stock Adjustment' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: createStockAdjustment,
    onSuccess: (data) => {
      // Invalidate and refetch adjustments
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] })

      notify.success("Stock adjustment created successfully", {
        description: `${data.adjustmentType} ${data.quantity} units for ${data.item?.name || "item"}`,
      })
    },
    onError: (error) => {
      notify.error("Failed to create stock adjustment", {
        description: error.message,
      })
    },
  })
}

export function useDeleteStockAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'delete', entity: 'Stock Adjustment' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: deleteStockAdjustment,
    onSuccess: () => {
      // Invalidate and refetch adjustments
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] })

      notify.success("Stock adjustment deleted successfully")
    },
    onError: (error) => {
      notify.error("Failed to delete stock adjustment", {
        description: error.message,
      })
    },
  })
}
