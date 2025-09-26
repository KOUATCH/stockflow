// import { categoryAPI } from "@/services/categoryAPI"
import { categoryAPI } from "@/services/categoryAPI"
import { CategoryCreateDTO } from "@/types/category"
import { CategoryKeys } from "@/types/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useCreateACategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CategoryCreateDTO) => {
      return await categoryAPI.createCategory(data)
    },
    onSuccess: (newItem) => {
      toast.success("Item created successfully")

      // Invalidate and refetch items list
      queryClient.invalidateQueries({ queryKey: CategoryKeys.lists() })

      if (newItem?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: CategoryKeys.orgCategories(newItem.organizationId),
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
