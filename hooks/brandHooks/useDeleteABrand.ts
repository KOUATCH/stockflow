import { brandAPI } from "@/services/brandAPI"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { BrandKeys } from "../../types/queryKeys"

export function useDeleteABrand() {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async (id: string) => {
      return await brandAPI.deleteABrand(id)
    },
    onSuccess: (_, deletedId) => {
      success("Brand Deleted", "Brand has been successfully removed");

      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: BrandKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: BrandKeys.lists() })
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
            onClick: () => console.log("Retry delete brand")
          }
        }
      );
    },
  })
}
