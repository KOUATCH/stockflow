import { categoryAPI } from "@/services/categoryAPI"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ItemKeys } from "../../types/queryKeys"
// import { itemAPI } from "../api/itemAPI"
// import { ItemKeys } from "../keys/itemKeys"

export function useDeleteACategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await categoryAPI.deleteACategory(id)
    },
    onSuccess: (_, deletedId) => {
      toast.success("Category deleted successfully")

      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: ItemKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: ItemKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error("Failed to delete item", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}
