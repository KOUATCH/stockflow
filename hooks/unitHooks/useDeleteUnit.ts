import { unitAPI } from "@/services/unitAPI"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { UnitKeys } from "../../types/queryKeys"

export function useDeleteUnit() {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async (id: string) => {
      return await unitAPI.deleteUnit(id)
    },
    onSuccess: (_, deletedId) => {
      success("Unit Deleted", "Unit has been successfully removed");

      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: UnitKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: UnitKeys.lists() })
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
            onClick: () => console.log("Retry delete unit")
          }
        }
      );
    },
  })
}
