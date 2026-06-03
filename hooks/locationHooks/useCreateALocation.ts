import { notify } from "@/lib/notifications/notify"
import { createLocation, CreateLocationData } from "@/actions/locations/locationActions"
import { LocationKeys } from "@/types/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
export function useCreateALocation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Location' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (data: CreateLocationData) => {
      const result = await createLocation(data)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (newLocation) => {
      notify.success("Location created successfully")

      // Invalidate and refetch location queries
      queryClient.invalidateQueries({ queryKey: LocationKeys.lists() })

      if (newLocation?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: LocationKeys.orgLocations(newLocation.organizationId),
        })
      }
    },
    onError: (error: Error) => {
      notify.error("Failed to create location", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}
