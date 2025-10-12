import { categoryAPI } from "@/services/categoryAPI"
import { CategoryCreateDTO } from "@/types/category"
import { CategoryKeys } from "@/types/queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"

export function useCreateACategory() {
  const queryClient = useQueryClient()
  const { formSuccess, formError } = useNotifications();

  return useMutation({
    mutationFn: async (data: CategoryCreateDTO) => {
      return await categoryAPI.createCategory(data)
    },
    onSuccess: (newCategory) => {
      formSuccess("Category Creation", "Category has been created successfully");

      // Invalidate and refetch category list
      queryClient.invalidateQueries({ queryKey: CategoryKeys.lists() })

      if (newCategory?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: CategoryKeys.orgCategories(newCategory.organizationId),
        })
      }
    },
    onError: (error: Error) => {
      formError(
        "Category Creation",
        error.message || "Unknown error occurred",
        "Failed to create category"
      );
    },
  })
}
