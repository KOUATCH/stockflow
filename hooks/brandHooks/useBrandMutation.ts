import { Brand, BrandDTO } from "@/types/brand";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BrandKeys } from "../useAllBrandQueries";

type BrandMutationContext = {
  previousBrandDetail?: Brand;
  previousBrandsList?: Brand[];
};

function useBrandMutation<T>(
  mutationFn: (params: { id: string; data: T }) => Promise<BrandDTO | null>,
  successMessage: string,
  errorMessage: string
) {
  const queryClient = useQueryClient();

  return useMutation<Brand | null, Error, { id: string; data: T }, BrandMutationContext>({
    mutationFn,

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: BrandKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: BrandKeys.lists() });

      const previousBrandDetail = queryClient.getQueryData<Brand>(BrandKeys.detail(id));
      const previousBrandsList = queryClient.getQueryData<Brand[]>(BrandKeys.lists());

      queryClient.setQueryData<Brand>(BrandKeys.detail(id), (old) =>
        old ? { ...old, ...data } : undefined
      );

      queryClient.setQueryData<Brand[]>(BrandKeys.lists(), (oldList) =>
        oldList?.map((brand) => (brand.id === id ? { ...brand, ...data } : brand))
      );

      return { previousBrandDetail, previousBrandsList };
    },

    onError: (error, { id }, context) => {
      toast.error(errorMessage, {
        description: error.message || "Unknown error occurred",
      });

      if (context?.previousBrandDetail) {
        queryClient.setQueryData(BrandKeys.detail(id), context.previousBrandDetail);
      }

      if (context?.previousBrandsList) {
        queryClient.setQueryData(BrandKeys.lists(), context.previousBrandsList);
      }
    },

    onSuccess: (updatedBrand, { id }) => {
      toast.success(successMessage);

      if (!updatedBrand) return;

      queryClient.setQueryData(BrandKeys.detail(id), updatedBrand);

      queryClient.setQueryData<Brand[]>(BrandKeys.lists(), (oldList) =>
        oldList?.map((brand) => (brand.id === id ? updatedBrand : brand)) ?? [updatedBrand]
      );

      queryClient.invalidateQueries({
        queryKey: BrandKeys.orgBrands(updatedBrand.organizationId || ""),
      });
    },
  });
}

export { useBrandMutation };

