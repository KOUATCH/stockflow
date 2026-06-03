import createTaxRate from "@/actions/taxRate/createTaxRate"
import { TaxRateKeys } from "@/types/queryKeys"
import type { TaxRateCreateDTO } from "@/types/taxRates"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"

export function useCreateTaxRate() {
  const queryClient = useQueryClient()
  const { formSuccess, formError } = useNotifications();

  return useMutation({
    meta: { operation: 'create', entity: 'Tax Rate' },
    mutationFn: async (data: TaxRateCreateDTO) => {
      const result = await createTaxRate(data)

      if (!result.success) {
        throw new Error(result.error || "Failed to create tax rate")
      }

      return result
    },
    onSuccess: (data) => {
      formSuccess("Tax Rate Creation", "Tax rate has been created successfully");

      // Invalidate and refetch tax rates list
      queryClient.invalidateQueries({ queryKey: TaxRateKeys.lists() })

      if (data?.data?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: TaxRateKeys.orgTaxRates(data?.data?.organizationId),
        })
      }
    },
    onError: (error: Error) => {
      formError(
        "Tax Rate Creation",
        error.message || "Unknown error occurred",
        "Failed to create tax rate"
      );
    },
  })
}
