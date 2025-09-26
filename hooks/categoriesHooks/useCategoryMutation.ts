import { Category } from "@/types/category";
import { CategoryKeys } from "@/types/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

  return useMutation<Category | null, Error, { id: string; data: T }, CategoryMutationContext>({
    mutationFn,
    onMutate: async (variables): Promise<CategoryMutationContext> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: CategoryKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: CategoryKeys.lists() })

      // Snapshot previous values
      const previousCategoryDetail = queryClient.getQueryData<Category>(CategoryKeys.detail(variables.id))
      const previousCategoriesList = queryClient.getQueryData<Category[]>(CategoryKeys.lists())

      // Optimistically update brand detail
      queryClient.setQueryData(CategoryKeys.detail(variables.id), (oldData: Category | undefined) => {
        return oldData ? { ...oldData, ...variables.data } : undefined
      })

      // Optimistically update brands list
      queryClient.setQueryData(CategoryKeys.lists(), (oldData: Category[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((brand) => (brand.id === variables.id ? { ...brand, ...variables.data } : brand))
      })

      return { previousCategoryDetail, previousCategoriesList }
    },

    onError: (error: Error, variables, context) => {
      toast.error(errorMessage, {
        description: error.message || "Unknown error occurred",
      })

      // Rollback optimistic updates
      if (context?.previousCategoryDetail) {
        queryClient.setQueryData(CategoryKeys.detail(variables.id), context.previousCategoryDetail)
      }
      if (context?.previousCategoriesList) {
        queryClient.setQueryData(CategoryKeys.lists(), context.previousCategoriesList)
      }
    },

    onSuccess: (updatedCategory, variables) => {
      toast.success(successMessage)

      if (!updatedCategory) return

      // Update with actual server response
      queryClient.setQueryData(CategoryKeys.detail(variables.id), updatedCategory)
      queryClient.setQueryData(CategoryKeys.lists(), (oldData: Category[] | undefined) => {
        if (!oldData) return [updatedCategory]
        return oldData.map((brand) => (brand.id === variables.id ? updatedCategory : brand))
      })

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: CategoryKeys.orgCategories(updatedCategory.organizationId || ""),
      })
    },
  })
}

export { useCategoryMutation };

