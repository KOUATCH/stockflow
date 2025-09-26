import { brandAPI } from "@/services/brandAPI"
import { BrandCreateDTO } from "@/types/brand"
import { BrandKeys } from "@/types/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useCreateABrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BrandCreateDTO) => {
      return await brandAPI.createNewBrand(data)
    },
    onSuccess: (newItem) => {
      toast.success("Item created successfully")

      // Invalidate and refetch items list
      queryClient.invalidateQueries({ queryKey: BrandKeys.lists() })

      if (newItem?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: BrandKeys.orgBrands(newItem.organizationId),
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
