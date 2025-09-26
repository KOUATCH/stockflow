// hooks/useBrandQueries.ts
import { brandAPI } from "@/services/brandAPI";
import { Brand, BrandCreateDTO, BriefBrandPayload, UpdateBrandPayload } from "@/types/brand";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for caching
export const BrandGreatKeys = {
  all: ["brands"] as const,
  lists: () => [...BrandGreatKeys.all, "list"] as const,
  list: (filters: any) => [...BrandGreatKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...BrandGreatKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...BrandGreatKeys.all, "detail"] as const,
  detail: (id: string) => [...BrandGreatKeys.details(), id] as const,

};

// Create centralized key factories:
// keys/BrandKeys.ts
// Define BrandFilters type if not already defined or import it from the correct module
type brandFilters = {
  // Add appropriate filter fields here, for example:
  [key: string]: any;
};

export const BrandKeys = {
  all: ['Brands'] as const,
  lists: () => [...BrandKeys.all, 'list'] as const,
  list: (filters: brandFilters) => [...BrandKeys.lists(), filters] as const,
  details: () => [...BrandKeys.all, 'detail'] as const,
  detail: (id: string) => [...BrandKeys.details(), id] as const,
  orgBrands: (orgId: string) => [...BrandKeys.all, 'organization', orgId] as const,
  briefOrgBrands: (orgId: string) => [...BrandKeys.orgBrands(orgId), 'brief'] as const,
      orgBrandList: (organizationId: string) => [...BrandKeys.lists(), organizationId] as const,
  
}

/**
 * Hook for fetching Brands with standard loading states
//  */
// export function useOrgBrands(organizationId: string, p0: { initialData: BriefBrandPayload[]; enabled: boolean; }) {
//   // Get all Brands  of an organization
//   const {
//     data: brands = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useSuspenseQuery({
//     queryKey: BrandKeys.briefOrgBrands(organizationId),
//     queryFn: () => brandAPI.getAllOrgBrands(organizationId), // Replace with actual organization ID
//   });

//   return {
//     brands,
//     isLoading,
//     isError,
//     error,
//     refetch,
//   };
// }

// hooks/useAllBrandQueries.ts
export const useOrgBrands = (
  organizationId: string, 
  options?: { initialData?: BriefBrandPayload[] }
) => {
  return useQuery({
    queryKey: ['orgBrands', organizationId],
    queryFn: () => brandAPI.getAllOrgBrands(organizationId),
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};


/**
 * Hook for fetching Brands with React Suspense
 * Use this when the component is wrapped in a Suspense boundary
 */
export function useSuspenseBrands() {
  // Get all Brands with Suspense (data is guaranteed to be defined)
  const { data: Brands, refetch } = useSuspenseQuery({
    queryKey: BrandKeys.lists(),
    queryFn: brandAPI.getBriefBrandsByOrgId.bind(null, "organizationId"), // Replace with actual organization ID
  });

  return {
    Brands,
    refetch,
  };
}

export function useBrand(id: string) {
  // Get a single Brand
  return useQuery({
    queryKey: BrandKeys.detail(id),
    queryFn: () => brandAPI.deleteBrand(id),
    enabled: Boolean(id), // Only run if ID is provided
  });
}

// Define or import the BrandPayload type
type BrandPayload = {
  // Add the appropriate fields for creating an Brand
  [key: string]: any;
};

export function useCreateABrand() {
  const queryClient = useQueryClient();

  // Create a new Brand
  return useMutation({
    mutationFn: (data: BrandCreateDTO) => brandAPI.createNewBrand(data),
    onSuccess: (_data, variables) => {
      toast.success("Brand added successfully");
      // Invalidate Brands list to trigger a refetch
      if (variables && (variables as any).organizationId) {
        queryClient.invalidateQueries({ queryKey: BrandKeys.briefOrgBrands((variables as any).organizationId) });
      } else {
        queryClient.invalidateQueries({ queryKey: BrandKeys.lists() });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to add Brand", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

export function useDeleteABrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandAPI.deleteBrand(id),
    
    onMutate: async (id) => {
      // Get all relevant query keys that might contain this Brand
      const queryKeys = [
        BrandKeys.lists(),
        // Add organization-specific keys if needed
        // You might need to pass organizationId as part of the mutation data
        // BrandKeys.briefOrgBrands(organizationId),
      ];

      // Cancel all outgoing queries
      await Promise.all(
        queryKeys.map(key => queryClient.cancelQueries({ queryKey: key }))
      );

      // Snapshot previous values for all query keys
      const previousData = new Map();
      queryKeys.forEach(key => {
        const data = queryClient.getQueryData(key);
        if (data) {
          previousData.set(JSON.stringify(key), data);
        }
      });

      // Helper function to remove Brand from different data structures
      const removeBrandFromData = (oldData: any) => {
        if (!oldData) return oldData;

        // Handle array structure
        if (Array.isArray(oldData)) {
          return oldData.filter(Brand => Brand.id !== id);
        }
        
        // Handle paginated structure with 'data' property
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((Brand: { id: string; }) => Brand.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1)
          };
        }
        
        // Handle structure with 'Brands' property
        if (oldData.Brands && Array.isArray(oldData.Brands)) {
          return {
            ...oldData,
            Brands: oldData.Brands.filter((Brand: { id: string }) => Brand.id !== id),
            total: Math.max(0, (oldData.total || oldData.Brands.length) - 1)
          };
        }

        return oldData;
      };

      // Optimistically update all relevant queries
      queryKeys.forEach(key => {
        queryClient.setQueryData(key, removeBrandFromData);
      });

      return { previousData, queryKeys };
    },

    onSuccess: async (data, id) => {
      toast.success("Brand deleted successfully");
      
      // Invalidate and refetch all related queries to ensure data consistency
      await Promise.all([
        // Invalidate main Brand lists
        queryClient.invalidateQueries({ queryKey: BrandKeys.lists() }),
        
        // Invalidate any specific Brand queries
        queryClient.invalidateQueries({ queryKey: BrandKeys.detail(id) }),
        
        // Invalidate organization-specific queries if applicable
        // queryClient.invalidateQueries({ queryKey: BrandKeys.briefOrgBrands(organizationId) }),
        
        // Remove the specific Brand from cache to prevent stale data
        queryClient.removeQueries({ queryKey: BrandKeys.detail(id) }),
      ]);

      // Optional: Refetch critical queries immediately for better UX
      // This ensures the table reflects the exact server state
      try {
        await queryClient.refetchQueries({ 
          queryKey: BrandKeys.lists(),
          type: 'active' // Only refetch active queries
        });
      } catch (refetchError) {
        console.warn('Failed to refetch after delete:', refetchError);
        // Don't show error to user as the delete was successful
      }
    },

    onError: (error: Error, id, context) => {
      toast.error("Failed to delete Brand", {
        description: error.message || "Unknown error occurred",
      });

      // Rollback all optimistic updates
      if (context?.previousData && context?.queryKeys) {
        context.queryKeys.forEach(key => {
          const keyString = JSON.stringify(key);
          const previousValue = context.previousData.get(keyString);
          if (previousValue) {
            queryClient.setQueryData(key, previousValue);
          }
        });
      }
    },

    onSettled: (data, error, id) => {
      // Final cleanup and consistency check
      if (!error) {
        // Ensure the deleted Brand is completely removed from all caches
        queryClient.removeQueries({ 
          queryKey: BrandKeys.detail(id),
          exact: true 
        });
        
        // Invalidate related queries one more time to catch any edge cases
        queryClient.invalidateQueries({ 
          queryKey: BrandKeys.lists(),
          refetchType: 'none' // Don't refetch, just mark as stale
        });
      }
    },
  });
}
export function useDeleteABrand2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandAPI.deleteBrand(id),
    
    onMutate: async (id) => {
      // Get all relevant query keys that might contain this Brand
      const queryKeys = [
        BrandKeys.lists(),
        // Add organization-specific keys if needed
        // You might need to pass organizationId as part of the mutation data
        // BrandKeys.briefOrgBrands(organizationId),
      ];

      // Cancel all outgoing queries
      await Promise.all(
        queryKeys.map(key => queryClient.cancelQueries({ queryKey: key }))
      );

      // Snapshot previous values for all query keys
      const previousData = new Map();
      queryKeys.forEach(key => {
        const data = queryClient.getQueryData(key);
        if (data) {
          previousData.set(JSON.stringify(key), data);
        }
      });

      // Helper function to remove Brand from different data structures
      const removeBrandFromData = (oldData: any) => {
        if (!oldData) return oldData;

        // Handle array structure
        if (Array.isArray(oldData)) {
          return oldData.filter(Brand => Brand.id !== id);
        }
        
        // Handle paginated structure with 'data' property
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((Brand: { id: string; }) => Brand.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1)
          };
        }
        
        // Handle structure with 'Brands' property
        if (oldData.Brands && Array.isArray(oldData.Brands)) {
          return {
            ...oldData,
            Brands: oldData.Brands.filter((Brand: { id: string }) => Brand.id !== id),
            total: Math.max(0, (oldData.total || oldData.Brands.length) - 1)
          };
        }

        return oldData;
      };

      // Optimistically update all relevant queries
      queryKeys.forEach(key => {
        queryClient.setQueryData(key, removeBrandFromData);
      });

      return { previousData, queryKeys };
    },

    onSuccess: () => {
      toast.success("Brand deleted successfully");
      // The optimistic update already happened in onMutate
      // No need to do anything else here for instant updates
    },

    onError: (error: Error, _id, context) => {
      toast.error("Failed to delete Brand", {
        description: error.message || "Unknown error occurred",
      });

      // Rollback all optimistic updates
      if (context?.previousData && context?.queryKeys) {
        context.queryKeys.forEach(key => {
          const keyString = JSON.stringify(key);
          const previousValue = context.previousData.get(keyString);
          if (previousValue) {
            queryClient.setQueryData(key, previousValue);
          }
        });
      }
    },

    onSettled: () => {
      // Optionally refetch to ensure consistency
      // This is less critical since the optimistic update should be accurate
      // but can be useful for syncing with server state
      queryClient.invalidateQueries({ queryKey: BrandKeys.lists() });
    },
  });
}

// Alternative version if you need to handle organization-specific queries
export function useDeleteABrandWithOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, organizationId }: { id: string; organizationId?: string }) => 
      brandAPI.deleteBrand(id),
    
    onMutate: async ({ id, organizationId }) => {
      // Build query keys based on available data
      const queryKeys: Array<readonly unknown[]> = [BrandKeys.lists()];
      if (organizationId) {
        queryKeys.push(BrandKeys.briefOrgBrands(organizationId));
      }

      // Cancel all outgoing queries
      await Promise.all(
        queryKeys.map(key => queryClient.cancelQueries({ queryKey: key }))
      );

      // Snapshot and update all relevant caches
      const previousData = new Map();
      
      const removeBrandFromData = (oldData: any) => {
        if (!oldData) return oldData;

        if (Array.isArray(oldData)) {
          return oldData.filter(Brand => Brand.id !== id);
        }
        
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((Brand: { id: string }) => Brand.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1)
          };
        }
        
        if (oldData.Brands && Array.isArray(oldData.Brands)) {
          return {
            ...oldData,
            Brands: oldData.Brands.filter((Brand: { id: string }) => Brand.id !== id),
            total: Math.max(0, (oldData.total || oldData.Brands.length) - 1)
          };
        }

        return oldData;
      };

      queryKeys.forEach(key => {
        const data = queryClient.getQueryData(key);
        if (data) {
          previousData.set(JSON.stringify(key), data);
          queryClient.setQueryData(key, removeBrandFromData);
        }
      });

      return { previousData, queryKeys };
    },

    onSuccess: () => {
      toast.success("Brand deleted successfully");
    },

    onError: (error: Error, _variables, context) => {
      toast.error("Failed to delete Brand", {
        description: error.message || "Unknown error occurred",
      });

      if (context?.previousData && context?.queryKeys) {
        context.queryKeys.forEach(key => {
          const keyString = JSON.stringify(key);
          const previousValue = context.previousData.get(keyString);
          if (previousValue) {
            queryClient.setQueryData(key, previousValue);
          }
        });
      }
    },

    onSettled: (_data, _error, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: BrandKeys.lists() });
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: BrandKeys.briefOrgBrands(organizationId) 
        });
      }
    },
  });
}


export function useUpdateBrand() {
  const queryClient = useQueryClient();

  // Update an existing Brand
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandPayload }) =>
      brandAPI.updateBrand(id, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: BrandKeys.detail(variables.id) });
      await queryClient.cancelQueries({ queryKey: BrandKeys.lists() });

      const previousBrandDetail = queryClient.getQueryData(BrandKeys.detail(variables.id));
      const previousBrandsList = queryClient.getQueryData(BrandKeys.lists());

      queryClient.setQueryData(BrandKeys.detail(variables.id), (oldData: Brand | undefined) => {
        return { ...oldData, ...variables.data };
      });

      queryClient.setQueryData(BrandKeys.lists(), (oldData: Brand[] | undefined) => {
        if (!oldData) return [variables.data];
        return oldData.map(Brand => (Brand.id === variables.id ? { ...Brand, ...variables.data } : Brand));
      });

      return { previousBrandDetail, previousBrandsList };
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update Brand", {
        description: error.message || "Unknown error occurred",
      });

      if (context?.previousBrandDetail) {
        queryClient.setQueryData(BrandKeys.detail(variables.id), context.previousBrandDetail);
      }

      if (context?.previousBrandsList) {
        queryClient.setQueryData(BrandKeys.lists(), context.previousBrandsList);
      }
    },
    onSuccess: (updatedBrand, variables) => {
      toast.success("Brand updated successfully");

      queryClient.setQueryData(BrandKeys.detail(variables.id), (oldData: Brand | undefined) => {
        return { ...oldData, ...updatedBrand };
      });

      queryClient.setQueryData(BrandKeys.lists(), (oldData: Brand[] | undefined) => {
        if (!oldData) return [updatedBrand];
        return oldData.map(Brand => (Brand.id === variables.id ? updatedBrand : Brand));
      });
    },
  });
}
