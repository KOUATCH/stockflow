import { locationAPI } from "@/services/locationAPI"
import { LocationDTO } from "@/types/location"
import { LocationKeys } from "@/types/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useCreateALocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LocationDTO) => {
      return await locationAPI.createNewLocation(data)
    },
    onSuccess: (newItem) => {
      toast.success("Item created successfully")

      // Invalidate and refetch items list
      queryClient.invalidateQueries({ queryKey: LocationKeys.lists() })

      if (newItem?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: LocationKeys.orgLocations(newItem.organizationId),
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
