// hooks/useItemSupplierQueries.ts
// import { itemSupplierAPI } from "@/services/itemSupplier/itemSupplierAPI";
// import { BriefItemSupplierDTO, ItemSupplier, ItemSupplierCreateDTO, UpdateItemSupplierDTO } from "@/types/ItemSupplier";
import { itemSupplierAPI } from "@/services/itemSupplierAPI";
import { BriefItemSupplierDTO, CreateItemSupplierDTO, UpdateItemSupplierDTO } from "@/types/itemSuppliers";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for caching
export const ItemSupplierGreatKeys = {
  all: ["ItemSuppliers"] as const,
  lists: () => [...ItemSupplierGreatKeys.all, "list"] as const,
  list: (filters: any) => [...ItemSupplierGreatKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...ItemSupplierGreatKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...ItemSupplierGreatKeys.all, "detail"] as const,
  detail: (id: string) => [...ItemSupplierGreatKeys.details(), id] as const,

};

// Create centralized key factories:
// keys/ItemSupplierKeys.ts
// Define ItemSupplierFilters type if not already defined or import it from the correct module
type ItemSupplierFilters = {
  // Add appropriate filter fields here, for example:
  [key: string]: any;
};

export const ItemSupplierKeys = {
  all: ['ItemSuppliers'] as const,
  lists: () => [...ItemSupplierKeys.all, 'list'] as const,
  list: (filters: ItemSupplierFilters) => [...ItemSupplierKeys.lists(), filters] as const,
  details: () => [...ItemSupplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...ItemSupplierKeys.details(), id] as const,
  orgItemSuppliers: (orgId: string) => [...ItemSupplierKeys.all, 'organization', orgId] as const,
  briefOrgItemSuppliers: (orgId: string) => [...ItemSupplierKeys.orgItemSuppliers(orgId), 'brief'] as const,
      orgItemSupplierList: (organizationId: string) => [...ItemSupplierKeys.lists(), organizationId] as const,
  
}

/**
 * Hook for fetching ItemSuppliers with standard loading states
//  */
// export function useOrgItemSuppliers(organizationId: string, p0: { initialData: BriefItemSupplierDTO[]; enabled: boolean; }) {
//   // Get all ItemSuppliers  of an organization
//   const {
//     data: ItemSuppliers = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useSuspenseQuery({
//     queryKey: ItemSupplierKeys.briefOrgItemSuppliers(organizationId),
//     queryFn: () => itemSupplierAPI.getAllOrgItemSuppliers(organizationId), // Replace with actual organization ID
//   });

//   return {
//     ItemSuppliers,
//     isLoading,
//     isError,
//     error,
//     refetch,
//   };
// }

// hooks/useAllItemSupplierQueries.ts
export const useOrgItemSuppliers = (
  organizationId: string, 
  options?: { initialData?: BriefItemSupplierDTO[] }
) => {
  return useQuery({
    queryKey: ['orgItemSuppliers', organizationId],
    queryFn: () => itemSupplierAPI.getAllOrgItemSuppliers(organizationId),
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};


/**
 * Hook for fetching ItemSuppliers with React Suspense
 * Use this when the component is wrapped in a Suspense boundary
 */
export function useSuspenseItemSuppliers() {
  // Get all ItemSuppliers with Suspense (data is guaranteed to be defined)
  const { data: ItemSuppliers, refetch } = useSuspenseQuery({
    queryKey: ItemSupplierKeys.lists(),
    queryFn: itemSupplierAPI.getAllOrgItemSuppliers.bind(null, "organizationId"), // Replace with actual organization ID
  });

  return {
    ItemSuppliers,
    refetch,
  };
}

export function useItemSupplier(id: string) {
  // Get a single ItemSupplier
  return useQuery({
    queryKey: ItemSupplierKeys.detail(id),
    queryFn: () => itemSupplierAPI.deleteItemSupplier(id),
    enabled: Boolean(id), // Only run if ID is provided
  });
}

// Define or import the ItemSupplierDTO type
type ItemSupplierDTO = {
  // Add the appropriate fields for creating an ItemSupplier
  [key: string]: any;
};

export function useCreateAItemSupplier() {
  const queryClient = useQueryClient();

  // Create a new ItemSupplier
  return useMutation({
    mutationFn: (data: CreateItemSupplierDTO) => itemSupplierAPI.createItemSupplier(data),
    onSuccess: (_data, variables) => {
      toast.success("ItemSupplier added successfully");
      // Invalidate ItemSuppliers list to trigger a refetch
      if (variables && (variables as any).organizationId) {
        queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.briefOrgItemSuppliers((variables as any).organizationId) });
      } else {
        queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.lists() });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to add ItemSupplier", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

export function useDeleteAItemSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemSupplierAPI.deleteItemSupplier(id),
    
    onMutate: async (id) => {
      // Get all relevant query keys that might contain this ItemSupplier
      const queryKeys = [
        ItemSupplierKeys.lists(),
        // Add organization-specific keys if needed
        // You might need to pass organizationId as part of the mutation data
        // ItemSupplierKeys.briefOrgItemSuppliers(organizationId),
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

      // Helper function to remove ItemSupplier from different data structures
      const removeItemSupplierFromData = (oldData: any) => {
        if (!oldData) return oldData;

        // Handle array structure
        if (Array.isArray(oldData)) {
          return oldData.filter(ItemSupplier => ItemSupplier.id !== id);
        }
        
        // Handle paginated structure with 'data' property
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((ItemSupplier: { id: string; }) => ItemSupplier.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1)
          };
        }
        
        // Handle structure with 'ItemSuppliers' property
        if (oldData.ItemSuppliers && Array.isArray(oldData.ItemSuppliers)) {
          return {
            ...oldData,
            ItemSuppliers: oldData.ItemSuppliers.filter((ItemSupplier: { id: string }) => ItemSupplier.id !== id),
            total: Math.max(0, (oldData.total || oldData.ItemSuppliers.length) - 1)
          };
        }

        return oldData;
      };

      // Optimistically update all relevant queries
      queryKeys.forEach(key => {
        queryClient.setQueryData(key, removeItemSupplierFromData);
      });

      return { previousData, queryKeys };
    },

    onSuccess: async (data, id) => {
      toast.success("ItemSupplier deleted successfully");
      
      // Invalidate and refetch all related queries to ensure data consistency
      await Promise.all([
        // Invalidate main ItemSupplier lists
        queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.lists() }),
        
        // Invalidate any specific ItemSupplier queries
        queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.detail(id) }),
        
        // Invalidate organization-specific queries if applicable
        // queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.briefOrgItemSuppliers(organizationId) }),
        
        // Remove the specific ItemSupplier from cache to prevent stale data
        queryClient.removeQueries({ queryKey: ItemSupplierKeys.detail(id) }),
      ]);

      // Optional: Refetch critical queries immediately for better UX
      // This ensures the table reflects the exact server state
      try {
        await queryClient.refetchQueries({ 
          queryKey: ItemSupplierKeys.lists(),
          type: 'active' // Only refetch active queries
        });
      } catch (refetchError) {
        console.warn('Failed to refetch after delete:', refetchError);
        // Don't show error to user as the delete was successful
      }
    },

    onError: (error: Error, id, context) => {
      toast.error("Failed to delete ItemSupplier", {
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
        // Ensure the deleted ItemSupplier is completely removed from all caches
        queryClient.removeQueries({ 
          queryKey: ItemSupplierKeys.detail(id),
          exact: true 
        });
        
        // Invalidate related queries one more time to catch any edge cases
        queryClient.invalidateQueries({ 
          queryKey: ItemSupplierKeys.lists(),
          refetchType: 'none' // Don't refetch, just mark as stale
        });
      }
    },
  });
}
export function useDeleteAItemSupplier2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemSupplierAPI.deleteItemSupplier(id),
    
    onMutate: async (id) => {
      // Get all relevant query keys that might contain this ItemSupplier
      const queryKeys = [
        ItemSupplierKeys.lists(),
        // Add organization-specific keys if needed
        // You might need to pass organizationId as part of the mutation data
        // ItemSupplierKeys.briefOrgItemSuppliers(organizationId),
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

      // Helper function to remove ItemSupplier from different data structures
      const removeItemSupplierFromData = (oldData: any) => {
        if (!oldData) return oldData;

        // Handle array structure
        if (Array.isArray(oldData)) {
          return oldData.filter(ItemSupplier => ItemSupplier.id !== id);
        }
        
        // Handle paginated structure with 'data' property
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((ItemSupplier: { id: string; }) => ItemSupplier.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1)
          };
        }
        
        // Handle structure with 'ItemSuppliers' property
        if (oldData.ItemSuppliers && Array.isArray(oldData.ItemSuppliers)) {
          return {
            ...oldData,
            ItemSuppliers: oldData.ItemSuppliers.filter((ItemSupplier: { id: string }) => ItemSupplier.id !== id),
            total: Math.max(0, (oldData.total || oldData.ItemSuppliers.length) - 1)
          };
        }

        return oldData;
      };

      // Optimistically update all relevant queries
      queryKeys.forEach(key => {
        queryClient.setQueryData(key, removeItemSupplierFromData);
      });

      return { previousData, queryKeys };
    },

    onSuccess: () => {
      toast.success("ItemSupplier deleted successfully");
      // The optimistic update already happened in onMutate
      // No need to do anything else here for instant updates
    },

    onError: (error: Error, _id, context) => {
      toast.error("Failed to delete ItemSupplier", {
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
      queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.lists() });
    },
  });
}

// Alternative version if you need to handle organization-specific queries
export function useDeleteAItemSupplierWithOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, organizationId }: { id: string; organizationId?: string }) => 
      itemSupplierAPI.deleteItemSupplier(id),
    
    onMutate: async ({ id, organizationId }) => {
      // Build query keys based on available data
      const queryKeys: Array<readonly unknown[]> = [ItemSupplierKeys.lists()];
      if (organizationId) {
        queryKeys.push(ItemSupplierKeys.briefOrgItemSuppliers(organizationId));
      }

      // Cancel all outgoing queries
      await Promise.all(
        queryKeys.map(key => queryClient.cancelQueries({ queryKey: key }))
      );

      // Snapshot and update all relevant caches
      const previousData = new Map();
      
      const removeItemSupplierFromData = (oldData: any) => {
        if (!oldData) return oldData;

        if (Array.isArray(oldData)) {
          return oldData.filter(ItemSupplier => ItemSupplier.id !== id);
        }
        
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((ItemSupplier: { id: string }) => ItemSupplier.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1)
          };
        }
        
        if (oldData.ItemSuppliers && Array.isArray(oldData.ItemSuppliers)) {
          return {
            ...oldData,
            ItemSuppliers: oldData.ItemSuppliers.filter((ItemSupplier: { id: string }) => ItemSupplier.id !== id),
            total: Math.max(0, (oldData.total || oldData.ItemSuppliers.length) - 1)
          };
        }

        return oldData;
      };

      queryKeys.forEach(key => {
        const data = queryClient.getQueryData(key);
        if (data) {
          previousData.set(JSON.stringify(key), data);
          queryClient.setQueryData(key, removeItemSupplierFromData);
        }
      });

      return { previousData, queryKeys };
    },

    onSuccess: () => {
      toast.success("ItemSupplier deleted successfully");
    },

    onError: (error: Error, _variables, context) => {
      toast.error("Failed to delete ItemSupplier", {
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
      queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.lists() });
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: ItemSupplierKeys.briefOrgItemSuppliers(organizationId) 
        });
      }
    },
  });
}


export function useUpdateItemSupplier() {
  const queryClient = useQueryClient();

  // Update an existing ItemSupplier
  return useMutation({
    mutationFn: ({ data }: { data: UpdateItemSupplierDTO }) =>
      itemSupplierAPI.updateItemSupplier( data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ItemSupplierKeys.detail(variables.data.id) });
      await queryClient.cancelQueries({ queryKey: ItemSupplierKeys.lists() });

      const previousItemSupplierDetail = queryClient.getQueryData(ItemSupplierKeys.detail(variables.data.id));
      const previousItemSuppliersList = queryClient.getQueryData(ItemSupplierKeys.lists());

      queryClient.setQueryData(ItemSupplierKeys.detail(variables.data.id), (oldData: UpdateItemSupplierDTO | undefined) => {
        return { ...oldData, ...variables.data };
      });

      queryClient.setQueryData(ItemSupplierKeys.lists(), (oldData: UpdateItemSupplierDTO[] | undefined) => {
        if (!oldData) return [variables.data];
        return oldData.map(ItemSupplier => (ItemSupplier.id === variables.data.id ? { ...ItemSupplier, ...variables.data } : ItemSupplier));
      });

      return { previousItemSupplierDetail, previousItemSuppliersList };
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update ItemSupplier", {
        description: error.message || "Unknown error occurred",
      });

      if (context?.previousItemSupplierDetail) {
        queryClient.setQueryData(ItemSupplierKeys.detail(variables.data.id), context.previousItemSupplierDetail);
      }

      if (context?.previousItemSuppliersList) {
        queryClient.setQueryData(ItemSupplierKeys.lists(), context.previousItemSuppliersList);
      }
    },
    onSuccess: (updatedItemSupplier, variables) => {
      toast.success("ItemSupplier updated successfully");

      queryClient.setQueryData(ItemSupplierKeys.detail(variables.data.id), (oldData: UpdateItemSupplierDTO | undefined) => {
        return { ...oldData, ...updatedItemSupplier };
      });

      queryClient.setQueryData(ItemSupplierKeys.lists(), (oldData: UpdateItemSupplierDTO[] | undefined) => {
        if (!oldData) return [updatedItemSupplier];
        return oldData.map(ItemSupplier => (ItemSupplier.id === variables.data.id ? updatedItemSupplier : ItemSupplier));
      });
    },
  });
}
