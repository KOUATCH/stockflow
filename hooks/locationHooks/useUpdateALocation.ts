import { notify } from "@/lib/notifications/notify"
import { updateLocation, CreateLocationData } from "@/actions/locations/locationActions"
import { UpdateModelData } from "@/types/location"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LocationKeys } from "@/types/queryKeys"

export function useUpdateALocation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Location' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async ({ id, data }: UpdateModelData<Partial<CreateLocationData>>) => {
      const result = await updateLocation(id, data)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (updatedLocation) => {
      notify.success("Location updated successfully")

      // Invalidate and refetch location queries
      queryClient.invalidateQueries({ queryKey: LocationKeys.lists() })
      if (!updatedLocation) return

      queryClient.invalidateQueries({ queryKey: LocationKeys.detail(updatedLocation.id) })

      if (updatedLocation?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: LocationKeys.orgLocations(updatedLocation.organizationId),
        })
      }
    },
    onError: (error: Error) => {
      notify.error("Failed to update location", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}
