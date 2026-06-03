import { notify } from "@/lib/notifications/notify"
import { deleteLocation } from "@/actions/locations/locationActions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LocationKeys } from "../../types/queryKeys"

export function useDeleteALocation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'delete', entity: 'Location' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (id: string) => {
      const result = await deleteLocation(id)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (_, deletedId) => {
      notify.success("Location deleted successfully")

      // Remove from cache and invalidate related queries
      queryClient.removeQueries({ queryKey: LocationKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: LocationKeys.lists() })
    },
    onError: (error: Error) => {
      notify.error("Failed to delete location", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}
