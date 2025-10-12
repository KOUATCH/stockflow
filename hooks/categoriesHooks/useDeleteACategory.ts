import { categoryAPI } from "@/services/categoryAPI"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { CategoryKeys } from "../../types/queryKeys"

export function useDeleteACategory() {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async (id: string) => {
      return await categoryAPI.deleteACategory(id)
    },
    onSuccess: (_, deletedId) => {
      success("Category Deleted", "Category has been successfully removed");

      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: CategoryKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: CategoryKeys.lists() })
    },
    onError: (err: Error) => {
      error(
        "Delete Failed",
        err.message || "Unknown error occurred",
        {
          category: "error",
          priority: "normal",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry delete category")
          }
        }
      );
    },
  })
}
