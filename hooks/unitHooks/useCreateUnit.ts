import { unitAPI } from "@/services/unitAPI"
import { UnitKeys } from "@/types/queryKeys"
import { UnitCreateDTO } from "@/types/unit"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UnitCreateDTO) => {
      return await unitAPI.createUnit(data)
    },
    onSuccess: (newItem) => {
      toast.success("Item created successfully")

      // Invalidate and refetch items list
      queryClient.invalidateQueries({ queryKey: UnitKeys.lists() })

      if (newItem?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: UnitKeys.orgUnits(newItem.organizationId),
        })
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to create item", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}
