import { Location } from "@/types/location";
import { LocationKeys } from "@/types/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// import { LocationKeys } from "../useAllLocationQueries";
type LocationMutationContext = {
  previousLocationDetail?: Location;
  previousLocationsList?: Location[];
};
function useLocationMutation<T>(
  mutationFn: (params: { id: string; data: T }) => Promise<Location | null>,
  successMessage: string,
  errorMessage: string,
) {
  const queryClient = useQueryClient()

  return useMutation<Location | null, Error, { id: string; data: T }, LocationMutationContext>({
    mutationFn,
    onMutate: async (variables): Promise<LocationMutationContext> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: LocationKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: LocationKeys.lists() })

      // Snapshot previous values
      const previousLocationDetail = queryClient.getQueryData<Location>(LocationKeys.detail(variables.id))
      const previousLocationsList = queryClient.getQueryData<Location[]>(LocationKeys.lists())

      // Optimistically update location detail
      queryClient.setQueryData(LocationKeys.detail(variables.id), (oldData: Location | undefined) => {
        return oldData ? { ...oldData, ...variables.data } : undefined
      })

      // Optimistically update locations list
      queryClient.setQueryData(LocationKeys.lists(), (oldData: Location[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((location) => (location.id === variables.id ? { ...location, ...variables.data } : location))
      })

      return { previousLocationDetail, previousLocationsList }
    },

    onError: (error: Error, variables, context) => {
      toast.error(errorMessage, {
        description: error.message || "Unknown error occurred",
      })

      // Rollback optimistic updates
      if (context?.previousLocationDetail) {
        queryClient.setQueryData(LocationKeys.detail(variables.id), context.previousLocationDetail)
      }
      if (context?.previousLocationsList) {
        queryClient.setQueryData(LocationKeys.lists(), context.previousLocationsList)
      }
    },

    onSuccess: (updatedLocation, variables) => {
      toast.success(successMessage)

      if (!updatedLocation) return

      // Update with actual server response
      queryClient.setQueryData(LocationKeys.detail(variables.id), updatedLocation)
      queryClient.setQueryData(LocationKeys.lists(), (oldData: Location[] | undefined) => {
        if (!oldData) return [updatedLocation]
        return oldData.map((location) => (location.id === variables.id ? updatedLocation : location))
      })

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: LocationKeys.orgLocations(updatedLocation.organizationId || ""),
      })
    },
  })
}

export { useLocationMutation };

