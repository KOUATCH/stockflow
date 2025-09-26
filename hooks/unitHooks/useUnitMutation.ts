import { UnitKeys } from "@/types/queryKeys";
import { Unit } from "@/types/unit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// import { UnitKeys } from "../useAllUnitQueries";
type UnitMutationContext = {
  previousUnitDetail?: Unit;
  previousUnitsList?: Unit[];
};
function useUnitMutation<T>(
  mutationFn: (params: { id: string; data: T }) => Promise<Unit | null>,
  successMessage: string,
  errorMessage: string,
) {
  const queryClient = useQueryClient()

  return useMutation<Unit | null, Error, { id: string; data: T }, UnitMutationContext>({
    mutationFn,
    onMutate: async (variables): Promise<UnitMutationContext> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: UnitKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: UnitKeys.lists() })

      // Snapshot previous values
      const previousUnitDetail = queryClient.getQueryData<Unit>(UnitKeys.detail(variables.id))
      const previousUnitsList = queryClient.getQueryData<Unit[]>(UnitKeys.lists())

      // Optimistically update brand detail
      queryClient.setQueryData(UnitKeys.detail(variables.id), (oldData: Unit | undefined) => {
        return oldData ? { ...oldData, ...variables.data } : undefined
      })

      // Optimistically update brands list
      queryClient.setQueryData(UnitKeys.lists(), (oldData: Unit[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((brand) => (brand.id === variables.id ? { ...brand, ...variables.data } : brand))
      })

      return { previousUnitDetail, previousUnitsList }
    },

    onError: (error: Error, variables, context) => {
      toast.error(errorMessage, {
        description: error.message || "Unknown error occurred",
      })

      // Rollback optimistic updates
      if (context?.previousUnitDetail) {
        queryClient.setQueryData(UnitKeys.detail(variables.id), context.previousUnitDetail)
      }
      if (context?.previousUnitsList) {
        queryClient.setQueryData(UnitKeys.lists(), context.previousUnitsList)
      }
    },

    onSuccess: (updatedUnit, variables) => {
      toast.success(successMessage)

      if (!updatedUnit) return

      // Update with actual server response
      queryClient.setQueryData(UnitKeys.detail(variables.id), updatedUnit)
      queryClient.setQueryData(UnitKeys.lists(), (oldData: Unit[] | undefined) => {
        if (!oldData) return [updatedUnit]
        return oldData.map((brand) => (brand.id === variables.id ? updatedUnit : brand))
      })

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: UnitKeys.orgUnits(updatedUnit.organizationId || ""),
      })
    },
  })
}

export { useUnitMutation };

