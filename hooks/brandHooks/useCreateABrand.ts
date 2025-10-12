import { brandAPI } from "@/services/brandAPI"
import { BrandCreateDTO } from "@/types/brand"
import { BrandKeys } from "@/types/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"

export function useCreateABrand() {
  const queryClient = useQueryClient()
  const { formSuccess, formError } = useNotifications();

  return useMutation({
    mutationFn: async (data: BrandCreateDTO) => {
      return await brandAPI.createNewBrand(data)
    },
    onSuccess: (newBrand) => {
      formSuccess("Brand Creation", "Brand has been created successfully");

      // Invalidate and refetch brand list
      queryClient.invalidateQueries({ queryKey: BrandKeys.lists() })

      if (newBrand?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: BrandKeys.orgBrands(newBrand.organizationId),
        })
      }
    },
    onError: (error: Error) => {
      formError(
        "Brand Creation",
        error.message || "Unknown error occurred",
        "Failed to create brand"
      );
    },
  })
}
