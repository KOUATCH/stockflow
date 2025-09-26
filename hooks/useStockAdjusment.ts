import {
  createStockAdjustment,
  deleteStockAdjustment,
  getStockAdjustmentById,
  getStockAdjustments,
} from "@/actions/stock/stockAdjusmentActions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
    mutationFn: createStockAdjustment,
    onSuccess: (data) => {
      // Invalidate and refetch adjustments
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] })

      toast.success("Stock adjustment created successfully", {
        description: `${data.adjustmentType} ${data.quantity} units for ${data.item?.name || "item"}`,
      })
    },
    onError: (error) => {
      toast.error("Failed to create stock adjustment", {
        description: error.message,
      })
    },
  })
}

export function useDeleteStockAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteStockAdjustment,
    onSuccess: () => {
      // Invalidate and refetch adjustments
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] })

      toast.success("Stock adjustment deleted successfully")
    },
    onError: (error) => {
      toast.error("Failed to delete stock adjustment", {
        description: error.message,
      })
    },
  })
}
