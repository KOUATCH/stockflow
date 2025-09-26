import updateTaxRateByIdNew from "@/actions/taxRate/updateTaxRateByIdNew"
import { TaxRateKeys } from "@/types/queryKeys"
import type { UpdateTaxRatePayload } from "@/types/taxRates"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useUpdateTaxRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaxRatePayload }) => {
      const result = await updateTaxRateByIdNew(id, data)

      if (!result.success) {
        throw new Error(result.error || "Failed to update tax rate")
      }

      return result
    },
    onSuccess: (data, variables) => {
      toast.success("Tax rate updated successfully")

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
      toast.error("Failed to update tax rate", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}
