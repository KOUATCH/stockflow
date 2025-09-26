import createTaxRate from "@/actions/taxRate/createTaxRate"
import { TaxRateKeys } from "@/types/queryKeys"
import type { TaxRateCreateDTO } from "@/types/taxRates"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useCreateTaxRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TaxRateCreateDTO) => {
      const result = await createTaxRate(data)

      if (!result.success) {
        throw new Error(result.error || "Failed to create tax rate")
      }

      return result
    },
    onSuccess: (data) => {
      toast.success("Tax rate created successfully")

      // Invalidate and refetch tax rates list
      queryClient.invalidateQueries({ queryKey: TaxRateKeys.lists() })

      if (data?.data?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: TaxRateKeys.orgTaxRates(data?.data?.organizationId),
        })
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to create tax rate", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}
