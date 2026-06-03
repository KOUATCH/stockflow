import { notify } from "@/lib/notifications/notify"
// hooks/useUnitQueries.ts
import { getOrgUnits } from "@/actions/units/getUnitsAction";
import createActionUnit from "@/actions/units/createActionUnit";
import deleteUnit from "@/actions/units/deleteUnit";
import getUnitById from "@/actions/units/getUnitById";
import updateUnitById from "@/actions/units/updateUnitById";
import { BriefUnitPayload, Unit, UnitCreateDTO, UpdateUnitPayload } from "@/types/unit";
// import { BriefUnitPayload, Unit, UnitCreateDTO, UpdateUnitPayload } from "@/types/unit;
import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
// Query keys for caching
export const UnitGreatKeys = {
  all: ["unit"] as const,
  lists: () => [...UnitGreatKeys.all, "list"] as const,
  list: (filters: any) => [...UnitGreatKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...UnitGreatKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...UnitGreatKeys.all, "detail"] as const,
  detail: (id: string) => [...UnitGreatKeys.details(), id] as const,

};

// Create centralized key factories:
// keys/UnitKeys.ts
// Define UnitFilters type if not already defined or import it from the correct module
type unitilters = {
  // Add appropriate filter fields here, for example:
  [key: string]: any;
};

// Define ItemFilters type if not already defined or import it from the correct module
type unitFilters = {
  [key: string]: any;
};

export const UnitKeys = {
  all: ['Units'] as const,
  lists: () => [...UnitKeys.all, 'list'] as const,
  list: (filters: unitFilters) => [...UnitKeys.lists(), filters] as const,
  details: () => [...UnitKeys.all, 'detail'] as const,
  detail: (id: string) => [...UnitKeys.details(), id] as const,
  orgUnits: (orgId: string) => [...UnitKeys.all, 'organization', orgId] as const,
  briefOrgUnits: (orgId: string) => [...UnitKeys.orgUnits(orgId), 'brief'] as const,
      orgUnitList: (organizationId: string) => [...UnitKeys.lists(), organizationId] as const,
  
}

/**
 * Hook for fetching Units with standard loading states  */


// hooks/useAllUnitQueries.ts
export const useOrgUnits = (
  organizationId: string, 
  options?: { initialData?: BriefUnitPayload[] }
) => {
  return useQuery({
    queryKey: ['orgUnits', organizationId],
    queryFn: async () => {
      const result = await getOrgUnits(organizationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch units');
      }
      return result.data || [];
    },
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};



export function useUnit(id: string) {
  // Get a single Unit
  return useQuery({
    queryKey: UnitKeys.detail(id),
    queryFn: () => getUnitById(id),
    enabled: Boolean(id), // Only run if ID is provided
  });
}

// Define or import the UnitPayload type
type UnitPayload = {
  // Add the appropriate fields for creating an Unit
  [key: string]: any;
};

export function useCreateUnit() {
  const queryClient = useQueryClient();

  // Create a new Unit
  return useMutation({
    meta: { operation: 'create', entity: 'Unit' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: (data: UnitCreateDTO) => createActionUnit(data),
    onSuccess: (_data, variables) => {
      notify.success("Unit added successfully");
      // Invalidate Units list to trigger a refetch
      if (variables && (variables as any).organizationId) {
        queryClient.invalidateQueries({ queryKey: UnitKeys.briefOrgUnits((variables as any).organizationId) });
      } else {
        queryClient.invalidateQueries({ queryKey: UnitKeys.lists() });
      }
    },
    onError: (error: Error) => {
      notify.error("Failed to add Unit", {
        description: error.message || "Unknown error occurred",
      });
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { operation: 'delete', entity: 'Unit' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: (id: string) => deleteUnit(id),
    
    onMutate: async (id) => {
      // Get all relevant query keys that might contain this Unit
      const queryKeys = [
        UnitKeys.lists(),
        // Add organization-specific keys if needed
        // You might need to pass organizationId as part of the mutation data
        // UnitKeys.briefOrgUnits(organizationId),
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

      // Helper function to remove Unit from different data structures
      const removeUnitFromData = (oldData: any) => {
        if (!oldData) return oldData;

        // Handle array structure
        if (Array.isArray(oldData)) {
          return oldData.filter(Unit => Unit.id !== id);
        }
        
        // Handle paginated structure with 'data' property
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((Unit: { id: string; }) => Unit.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1)
          };
        }
        
        // Handle structure with 'Units' property
        if (oldData.Units && Array.isArray(oldData.Units)) {
          return {
            ...oldData,
            Units: oldData.Units.filter((Unit: { id: string }) => Unit.id !== id),
            total: Math.max(0, (oldData.total || oldData.Units.length) - 1)
          };
        }

        return oldData;
      };

      // Optimistically update all relevant queries
      queryKeys.forEach(key => {
        queryClient.setQueryData(key, removeUnitFromData);
      });

      return { previousData, queryKeys };
    },

    onSuccess: async (data, id) => {
      notify.success("Unit deleted successfully");
      
      // Invalidate and refetch all related queries to ensure data consistency
      await Promise.all([
        // Invalidate main Unit lists
        queryClient.invalidateQueries({ queryKey: UnitKeys.lists() }),
        
        // Invalidate any specific Unit queries
        queryClient.invalidateQueries({ queryKey: UnitKeys.detail(id) }),
        
        // Invalidate organization-specific queries if applicable
        // queryClient.invalidateQueries({ queryKey: UnitKeys.briefOrgUnits(organizationId) }),
        
        // Remove the specific Unit from cache to prevent stale data
        queryClient.removeQueries({ queryKey: UnitKeys.detail(id) }),
      ]);

      // Optional: Refetch critical queries immediately for better UX
      // This ensures the table reflects the exact server state
      try {
        await queryClient.refetchQueries({ 
          queryKey: UnitKeys.lists(),
          type: 'active' // Only refetch active queries
        });
      } catch (refetchError) {
        console.warn('Failed to refetch after delete:', refetchError);
        // Don't show error to user as the delete was successful
      }
    },

    onError: (error: Error, id, context) => {
      notify.error("Failed to delete Unit", {
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
        // Ensure the deleted Unit is completely removed from all caches
        queryClient.removeQueries({ 
          queryKey: UnitKeys.detail(id),
          exact: true 
        });
        
        // Invalidate related queries one more time to catch any edge cases
        queryClient.invalidateQueries({ 
          queryKey: UnitKeys.lists(),
          refetchType: 'none' // Don't refetch, just mark as stale
        });
      }
    },
  });
}
export function useDeleteAUnit2() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { operation: 'delete', entity: 'Unit2' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: (id: string) => deleteUnit(id),
    
    onMutate: async (id) => {
      // Get all relevant query keys that might contain this Unit
      const queryKeys = [
        UnitKeys.lists(),
        // Add organization-specific keys if needed
        // You might need to pass organizationId as part of the mutation data
        // UnitKeys.briefOrgUnits(organizationId),
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

      // Helper function to remove Unit from different data structures
      const removeUnitFromData = (oldData: any) => {
        if (!oldData) return oldData;

        // Handle array structure
        if (Array.isArray(oldData)) {
          return oldData.filter(Unit => Unit.id !== id);
        }
        
        // Handle paginated structure with 'data' property
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((Unit: { id: string; }) => Unit.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1)
          };
        }
        
        // Handle structure with 'Units' property
        if (oldData.Units && Array.isArray(oldData.Units)) {
          return {
            ...oldData,
            Units: oldData.Units.filter((Unit: { id: string }) => Unit.id !== id),
            total: Math.max(0, (oldData.total || oldData.Units.length) - 1)
          };
        }

        return oldData;
      };

      // Optimistically update all relevant queries
      queryKeys.forEach(key => {
        queryClient.setQueryData(key, removeUnitFromData);
      });

      return { previousData, queryKeys };
    },

    onSuccess: () => {
      notify.success("Unit deleted successfully");
      // The optimistic update already happened in onMutate
      // No need to do anything else here for instant updates
    },

    onError: (error: Error, _id, context) => {
      notify.error("Failed to delete Unit", {
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
      queryClient.invalidateQueries({ queryKey: UnitKeys.lists() });
    },
  });
}

// Alternative version if you need to handle organization-specific queries
export function useDeleteAUnitWithOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { operation: 'delete', entity: 'Unit Org' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({ id, organizationId }: { id: string; organizationId?: string }) => 
      deleteUnit(id),
    
    onMutate: async ({ id, organizationId }) => {
      // Build query keys based on available data
      const queryKeys: Array<readonly unknown[]> = [UnitKeys.lists()];
      if (organizationId) {
        queryKeys.push(UnitKeys.briefOrgUnits(organizationId));
      }

      // Cancel all outgoing queries
      await Promise.all(
        queryKeys.map(key => queryClient.cancelQueries({ queryKey: key }))
      );

      // Snapshot and update all relevant caches
      const previousData = new Map();
      
      const removeUnitFromData = (oldData: any) => {
        if (!oldData) return oldData;

        if (Array.isArray(oldData)) {
          return oldData.filter(Unit => Unit.id !== id);
        }
        
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((Unit: { id: string }) => Unit.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1)
          };
        }
        
        if (oldData.Units && Array.isArray(oldData.Units)) {
          return {
            ...oldData,
            Units: oldData.Units.filter((Unit: { id: string }) => Unit.id !== id),
            total: Math.max(0, (oldData.total || oldData.Units.length) - 1)
          };
        }

        return oldData;
      };

      queryKeys.forEach(key => {
        const data = queryClient.getQueryData(key);
        if (data) {
          previousData.set(JSON.stringify(key), data);
          queryClient.setQueryData(key, removeUnitFromData);
        }
      });

      return { previousData, queryKeys };
    },

    onSuccess: () => {
      notify.success("Unit deleted successfully");
    },

    onError: (error: Error, _variables, context) => {
      notify.error("Failed to delete Unit", {
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
      queryClient.invalidateQueries({ queryKey: UnitKeys.lists() });
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: UnitKeys.briefOrgUnits(organizationId) 
        });
      }
    },
  });
}


export function useUpdateUnit() {
  const queryClient = useQueryClient();

  // Update an existing Unit
  return useMutation({
    meta: { operation: 'update', entity: 'Unit' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({ id, data }: { id: string; data: UpdateUnitPayload }) =>
      updateUnitById(id, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: UnitKeys.detail(variables.id) });
      await queryClient.cancelQueries({ queryKey: UnitKeys.lists() });

      const previousUnitDetail = queryClient.getQueryData(UnitKeys.detail(variables.id));
      const previousUnitsList = queryClient.getQueryData(UnitKeys.lists());

      queryClient.setQueryData(UnitKeys.detail(variables.id), (oldData: Unit | undefined) => {
        return { ...oldData, ...variables.data };
      });

      queryClient.setQueryData(UnitKeys.lists(), (oldData: Unit[] | undefined) => {
        if (!oldData) return [variables.data];
        return oldData.map(Unit => (Unit.id === variables.id ? { ...Unit, ...variables.data } : Unit));
      });

      return { previousUnitDetail, previousUnitsList };
    },
    onError: (error, variables, context) => {
      notify.error("Failed to update Unit", {
        description: error.message || "Unknown error occurred",
      });

      if (context?.previousUnitDetail) {
        queryClient.setQueryData(UnitKeys.detail(variables.id), context.previousUnitDetail);
      }

      if (context?.previousUnitsList) {
        queryClient.setQueryData(UnitKeys.lists(), context.previousUnitsList);
      }
    },
    onSuccess: (updatedUnit, variables) => {
      notify.success("Unit updated successfully");

      queryClient.setQueryData(UnitKeys.detail(variables.id), (oldData: Unit | undefined) => {
        return { ...oldData, ...updatedUnit };
      });

      queryClient.setQueryData(UnitKeys.lists(), (oldData: Unit[] | undefined) => {
        if (!oldData) return [updatedUnit];
        return oldData.map(Unit => (Unit.id === variables.id ? updatedUnit : Unit));
      });
    },
  });
}
