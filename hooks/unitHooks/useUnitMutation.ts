import { UnitKeys } from "@/types/queryKeys";
import { Unit } from "@/types/unit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/components/notifications/NotificationProvider";
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
  const { formSuccess, formError } = useNotifications();

  return useMutation<Unit | null, Error, { id: string; data: T }, UnitMutationContext>({
    mutationFn,
    onMutate: async (variables): Promise<UnitMutationContext> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: UnitKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: UnitKeys.lists() })

      // Snapshot previous values
      const previousUnitDetail = queryClient.getQueryData<Unit>(UnitKeys.detail(variables.id))
      const previousUnitsList = queryClient.getQueryData<Unit[]>(UnitKeys.lists())

      // Optimistically update unit detail
      queryClient.setQueryData(UnitKeys.detail(variables.id), (oldData: Unit | undefined) => {
        return oldData ? { ...oldData, ...variables.data } : undefined
      })

      // Optimistically update units list
      queryClient.setQueryData(UnitKeys.lists(), (oldData: Unit[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((unit) => (unit.id === variables.id ? { ...unit, ...variables.data } : unit))
      })

      return { previousUnitDetail, previousUnitsList }
    },

    onError: (error: Error, variables, context) => {
      formError(
        "Unit Operation",
        error.message || "Unknown error occurred",
        errorMessage
      );

      // Rollback optimistic updates
      if (context?.previousUnitDetail) {
        queryClient.setQueryData(UnitKeys.detail(variables.id), context.previousUnitDetail)
      }
      if (context?.previousUnitsList) {
        queryClient.setQueryData(UnitKeys.lists(), context.previousUnitsList)
      }
    },

    onSuccess: (updatedUnit, variables) => {
      formSuccess("Unit Operation", successMessage);

      if (!updatedUnit) return

      // Update with actual server response
      queryClient.setQueryData(UnitKeys.detail(variables.id), updatedUnit)
      queryClient.setQueryData(UnitKeys.lists(), (oldData: Unit[] | undefined) => {
        if (!oldData) return [updatedUnit]
        return oldData.map((unit) => (unit.id === variables.id ? updatedUnit : unit))
      })

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: UnitKeys.orgUnits(updatedUnit.organizationId || ""),
      })
    },
  })
}

export { useUnitMutation };

