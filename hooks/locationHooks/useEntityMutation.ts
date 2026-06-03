import { notify } from "@/lib/notifications/notify"
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
type MutationContext<T> = {
  previousDetail?: T;
  previousList?: T[];
};

function useEntityMutation<T extends { id: string; organizationId?: string }>(
  mutationFn: (params: { id: string; data: Partial<T> }) => Promise<T | null>,
  queryKeys: {
    detail: (id: string) => QueryKey;
    list: () => QueryKey;
    orgList?: (orgId: string) => QueryKey;
  },
  successMessage: string,
  errorMessage: string
) {
  const queryClient = useQueryClient();

  return useMutation<T | null, Error, { id: string; data: Partial<T> }, MutationContext<T>>({
    mutationFn,

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.detail(variables.id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.list() });

      const previousDetail = queryClient.getQueryData<T>(queryKeys.detail(variables.id));
      const previousList = queryClient.getQueryData<T[]>(queryKeys.list());

      queryClient.setQueryData(queryKeys.detail(variables.id), (oldData?: T) =>
        oldData ? { ...oldData, ...variables.data } : undefined
      );

      queryClient.setQueryData(queryKeys.list(), (oldData?: T[]) =>
        oldData?.map((item) => (item.id === variables.id ? { ...item, ...variables.data } : item))
      );

      return { previousDetail, previousList };
    },

    onError: (error, variables, context) => {
      notify.error(errorMessage, {
        description: error.message || "Unknown error occurred",
      });

      if (context?.previousDetail) {
        queryClient.setQueryData(queryKeys.detail(variables.id), context.previousDetail);
      }
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.list(), context.previousList);
      }
    },

    onSuccess: (updatedItem, variables) => {
      notify.success(successMessage);

      if (!updatedItem) return;

      queryClient.setQueryData(queryKeys.detail(variables.id), updatedItem);
      queryClient.setQueryData(queryKeys.list(), (oldData?: T[]) => {
        if (!oldData) return [updatedItem];
        return oldData.map((item) => (item.id === variables.id ? updatedItem : item));
      });

      if (queryKeys.orgList && updatedItem.organizationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.orgList(updatedItem.organizationId),
        });
      }
    },
  });
}

export { useEntityMutation };

