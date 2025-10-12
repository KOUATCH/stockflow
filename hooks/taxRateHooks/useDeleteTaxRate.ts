import deleteTaxRate from "@/actions/taxRate/deleteTaxRate"
import { TaxRateKeys } from "@/types/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"

export function useDeleteTaxRate() {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTaxRate(id)

      if (!result.success) {
        throw new Error(result.error || "Failed to delete tax rate")
      }

      return result
    },
    onSuccess: (_, deletedId) => {
      success("Tax Rate Deleted", "Tax rate has been successfully removed");

      queryClient.removeQueries({ queryKey: TaxRateKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: TaxRateKeys.lists() })
    },
    onError: (err: Error) => {
      error(
        "Delete Failed",
        err.message || "Unknown error occurred",
        {
          category: "error",
          priority: "normal",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry delete tax rate")
          }
        }
      );
    },
  })
}
