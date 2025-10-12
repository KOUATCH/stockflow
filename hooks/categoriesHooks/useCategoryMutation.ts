import { Category } from "@/types/category";
import { CategoryKeys } from "@/types/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/components/notifications/NotificationProvider";
type CategoryMutationContext = {
  previousCategoryDetail?: Category;
  previousCategoriesList?: Category[];
};
function useCategoryMutation<T>(
  mutationFn: (params: { id: string; data: T }) => Promise<Category | null>,
  successMessage: string,
  errorMessage: string,
) {
  const queryClient = useQueryClient()
  const { formSuccess, formError } = useNotifications();

  return useMutation<Category | null, Error, { id: string; data: T }, CategoryMutationContext>({
    mutationFn,
    onMutate: async (variables): Promise<CategoryMutationContext> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: CategoryKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: CategoryKeys.lists() })

      // Snapshot previous values
      const previousCategoryDetail = queryClient.getQueryData<Category>(CategoryKeys.detail(variables.id))
      const previousCategoriesList = queryClient.getQueryData<Category[]>(CategoryKeys.lists())

      // Optimistically update category detail
      queryClient.setQueryData(CategoryKeys.detail(variables.id), (oldData: Category | undefined) => {
        return oldData ? { ...oldData, ...variables.data } : undefined
      })

      // Optimistically update categories list
      queryClient.setQueryData(CategoryKeys.lists(), (oldData: Category[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((category) => (category.id === variables.id ? { ...category, ...variables.data } : category))
      })

      return { previousCategoryDetail, previousCategoriesList }
    },

    onError: (error: Error, variables, context) => {
      formError(
        "Category Operation",
        error.message || "Unknown error occurred",
        errorMessage
      );

      // Rollback optimistic updates
      if (context?.previousCategoryDetail) {
        queryClient.setQueryData(CategoryKeys.detail(variables.id), context.previousCategoryDetail)
      }
      if (context?.previousCategoriesList) {
        queryClient.setQueryData(CategoryKeys.lists(), context.previousCategoriesList)
      }
    },

    onSuccess: (updatedCategory, variables) => {
      formSuccess("Category Operation", successMessage);

      if (!updatedCategory) return

      // Update with actual server response
      queryClient.setQueryData(CategoryKeys.detail(variables.id), updatedCategory)
      queryClient.setQueryData(CategoryKeys.lists(), (oldData: Category[] | undefined) => {
        if (!oldData) return [updatedCategory]
        return oldData.map((category) => (category.id === variables.id ? updatedCategory : category))
      })

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: CategoryKeys.orgCategories(updatedCategory.organizationId || ""),
      })
    },
  })
}

export { useCategoryMutation };

