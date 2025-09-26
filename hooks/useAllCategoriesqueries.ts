
import { categoryAPI, getOrgCategories } from "@/services/categoryAPI";
import { BriefCategoryPayload, Category, UpdateCategoryPayload } from "@/types/category";
import { CategoryKeys } from "@/types/queryKeys";
import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { toast } from "sonner";
export const useOrgCategories = (
  organizationId: string, 
  options?: { initialData?: BriefCategoryPayload[] }
) => {
  return useQuery({
    queryKey: ['orgCategories', organizationId],
    queryFn:async () => await getOrgCategories(organizationId),
    // initialData: options?.initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};


export function useUpdateACategory() {
  const queryClient = useQueryClient();

  // Update an existing Category
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      categoryAPI.updateCategory(id, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: CategoryKeys.detail(variables.id) });
      await queryClient.cancelQueries({ queryKey: CategoryKeys.lists() });

      const previousCategoryDetail = queryClient.getQueryData(CategoryKeys.detail(variables.id));
      const previousCategorysList = queryClient.getQueryData(CategoryKeys.lists());

      queryClient.setQueryData(CategoryKeys.detail(variables.id), (oldData: Category | undefined) => {
        return { ...oldData, ...variables.data };
      });

      queryClient.setQueryData(CategoryKeys.lists(), (oldData: Category[] | undefined) => {
        if (!oldData) return [variables.data];
        return oldData.map(Category => (Category.id === variables.id ? { ...Category, ...variables.data } : Category));
      });

      return { previousCategoryDetail, previousCategorysList };
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update Category", {
        description: error.message || "Unknown error occurred",
      });

      if (context?.previousCategoryDetail) {
        queryClient.setQueryData(CategoryKeys.detail(variables.id), context.previousCategoryDetail);
      }

      if (context?.previousCategorysList) {
        queryClient.setQueryData(CategoryKeys.lists(), context.previousCategorysList);
      }
    },
    onSuccess: (updatedCategory, variables) => {
      toast.success("Category updated successfully");

      queryClient.setQueryData(CategoryKeys.detail(variables.id), (oldData: Category | undefined) => {
        return { ...oldData, ...updatedCategory };
      });

      queryClient.setQueryData(CategoryKeys.lists(), (oldData: Category[] | undefined) => {
        if (!oldData) return [updatedCategory];
        return oldData.map(Category => (Category.id === variables.id ? updatedCategory : Category));
      });
    },
  });
}
