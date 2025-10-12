import updateTaxRateByIdNew from "@/actions/taxRate/updateTaxRateByIdNew"
import { TaxRateKeys } from "@/types/queryKeys"
import type { UpdateTaxRatePayload } from "@/types/taxRates"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"

export function useUpdateTaxRate() {
  const queryClient = useQueryClient()
  const { formSuccess, formError } = useNotifications();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaxRatePayload }) => {
      const result = await updateTaxRateByIdNew(id, data)

      if (!result.success) {
        throw new Error(result.error || "Failed to update tax rate")
      }

      return result
    },
    onSuccess: (data, variables) => {
      formSuccess("Tax Rate Update", "Tax rate has been updated successfully");

      // Invalidate and refetch tax rates
      queryClient.invalidateQueries({ queryKey: TaxRateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: TaxRateKeys.detail(variables.id) })

      if (data?.data?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: TaxRateKeys.orgTaxRates(data?.data?.organizationId),
        })
      }
    },
    onError: (error: Error) => {
      formError(
        "Tax Rate Update",
        error.message || "Unknown error occurred",
        "Failed to update tax rate"
      );
    },
  })
}
