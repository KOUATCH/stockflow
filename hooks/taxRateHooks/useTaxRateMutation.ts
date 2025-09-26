import { TaxRateKeys } from "@/types/queryKeys";
import { TaxRate } from "@/types/taxRates";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// import { TaxRateKeys } from "../useAllTaxRateQueries";
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

  return useMutation<TaxRate | null, Error, { id: string; data: T }, TaxRateMutationContext>({
    mutationFn,
    onMutate: async (variables): Promise<TaxRateMutationContext> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TaxRateKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: TaxRateKeys.lists() })

      // Snapshot previous values
      const previousTaxRateDetail = queryClient.getQueryData<TaxRate>(TaxRateKeys.detail(variables.id))
      const previousTaxRatesList = queryClient.getQueryData<TaxRate[]>(TaxRateKeys.lists())

      // Optimistically update brand detail
      queryClient.setQueryData(TaxRateKeys.detail(variables.id), (oldData: TaxRate | undefined) => {
        return oldData ? { ...oldData, ...variables.data } : undefined
      })

      // Optimistically update brands list
      queryClient.setQueryData(TaxRateKeys.lists(), (oldData: TaxRate[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((brand) => (brand.id === variables.id ? { ...brand, ...variables.data } : brand))
      })

      return { previousTaxRateDetail, previousTaxRatesList }
    },

    onError: (error: Error, variables, context) => {
      toast.error(errorMessage, {
        description: error.message || "Unknown error occurred",
      })

      // Rollback optimistic updates
      if (context?.previousTaxRateDetail) {
        queryClient.setQueryData(TaxRateKeys.detail(variables.id), context.previousTaxRateDetail)
      }
      if (context?.previousTaxRatesList) {
        queryClient.setQueryData(TaxRateKeys.lists(), context.previousTaxRatesList)
      }
    },

    onSuccess: (updatedTaxRate, variables) => {
      toast.success(successMessage)

      if (!updatedTaxRate) return

      // Update with actual server response
      queryClient.setQueryData(TaxRateKeys.detail(variables.id), updatedTaxRate)
      queryClient.setQueryData(TaxRateKeys.lists(), (oldData: TaxRate[] | undefined) => {
        if (!oldData) return [updatedTaxRate]
        return oldData.map((brand) => (brand.id === variables.id ? updatedTaxRate : brand))
      })

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: TaxRateKeys.orgTaxRates(updatedTaxRate.organizationId || ""),
      })
    },
  })
}

export { useTaxRateMutation };

