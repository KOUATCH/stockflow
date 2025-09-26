import deleteTaxRate from "@/actions/taxRate/deleteTaxRate"
import { TaxRateKeys } from "@/types/queryKeys"; // Use TaxRateKeys instead of ItemKeys
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useDeleteTaxRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTaxRate(id)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete tax rate")
      }

      return result
    },
    onSuccess: (_, deletedId) => {
      toast.success("Tax rate deleted successfully")

      queryClient.removeQueries({ queryKey: TaxRateKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: TaxRateKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error("Failed to delete tax rate", {
        description: error.message || "Unknown error occurred",
      })
    },
  })
}
