import { TaxRateKeys } from "@/types/queryKeys";
import { TaxRate } from "@/types/taxRates";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/components/notifications/NotificationProvider";
type TaxRateMutationContext = {
  previousTaxRateDetail?: TaxRate;
  previousTaxRatesList?: TaxRate[];
};
function useTaxRateMutation<T>(
  mutationFn: (params: { id: string; data: T }) => Promise<TaxRate | null>,
  successMessage: string,
  errorMessage: string,
) {
  const queryClient = useQueryClient()
  const { formSuccess, formError } = useNotifications();

  return useMutation<TaxRate | null, Error, { id: string; data: T }, TaxRateMutationContext>({
    mutationFn,
    onMutate: async (variables): Promise<TaxRateMutationContext> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TaxRateKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: TaxRateKeys.lists() })

      // Snapshot previous values
      const previousTaxRateDetail = queryClient.getQueryData<TaxRate>(TaxRateKeys.detail(variables.id))
      const previousTaxRatesList = queryClient.getQueryData<TaxRate[]>(TaxRateKeys.lists())

      // Optimistically update tax rate detail
      queryClient.setQueryData(TaxRateKeys.detail(variables.id), (oldData: TaxRate | undefined) => {
        return oldData ? { ...oldData, ...variables.data } : undefined
      })

      // Optimistically update tax rates list
      queryClient.setQueryData(TaxRateKeys.lists(), (oldData: TaxRate[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((taxRate) => (taxRate.id === variables.id ? { ...taxRate, ...variables.data } : taxRate))
      })

      return { previousTaxRateDetail, previousTaxRatesList }
    },

    onError: (error: Error, variables, context) => {
      formError(
        "Tax Rate Operation",
        error.message || "Unknown error occurred",
        errorMessage
      );

      // Rollback optimistic updates
      if (context?.previousTaxRateDetail) {
        queryClient.setQueryData(TaxRateKeys.detail(variables.id), context.previousTaxRateDetail)
      }
      if (context?.previousTaxRatesList) {
        queryClient.setQueryData(TaxRateKeys.lists(), context.previousTaxRatesList)
      }
    },

    onSuccess: (updatedTaxRate, variables) => {
      formSuccess("Tax Rate Operation", successMessage);

      if (!updatedTaxRate) return

      // Update with actual server response
      queryClient.setQueryData(TaxRateKeys.detail(variables.id), updatedTaxRate)
      queryClient.setQueryData(TaxRateKeys.lists(), (oldData: TaxRate[] | undefined) => {
        if (!oldData) return [updatedTaxRate]
        return oldData.map((taxRate) => (taxRate.id === variables.id ? updatedTaxRate : taxRate))
      })

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: TaxRateKeys.orgTaxRates(updatedTaxRate.organizationId || ""),
      })
    },
  })
}

export { useTaxRateMutation };

