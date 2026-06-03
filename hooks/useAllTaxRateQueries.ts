import { notify } from "@/lib/notifications/notify"
import { getOrgTaxRates, createTaxRate, updateTaxRate, deleteTaxRate } from "@/actions/taxes/getTaxRatesAction";
import { BriefTaxRatePayload, TaxRate, UpdateTaxRatePayload } from "@/types/taxRates";

import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
// Query keys for caching
export const TaxRateGreatKeys = {
  all: ["TaxRate"] as const,
  lists: () => [...TaxRateGreatKeys.all, "list"] as const,
  list: (filters: any) => [...TaxRateGreatKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...TaxRateGreatKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...TaxRateGreatKeys.all, "detail"] as const,
  detail: (id: string) => [...TaxRateGreatKeys.details(), id] as const,

};

// Create centralized key factories:
// keys/TaxRateKeys.ts
// Define TaxRateFilters type if not already defined or import it from the correct module
type TaxRateFilters = {
  // Add appropriate filter fields here, for example:
  [key: string]: any;
};

export const TaxRateKeys = {
  all: ['TaxRates'] as const,
  lists: () => [...TaxRateKeys.all, 'list'] as const,
  list: (filters: TaxRateFilters) => [...TaxRateKeys.lists(), filters] as const,
  details: () => [...TaxRateKeys.all, 'detail'] as const,
  detail: (id: string) => [...TaxRateKeys.details(), id] as const,
  orgTaxRates: (orgId: string) => [...TaxRateKeys.all, 'organization', orgId] as const,
  briefOrgTaxRates: (orgId: string) => [...TaxRateKeys.orgTaxRates(orgId), 'brief'] as const,
      orgTaxRateList: (organizationId: string) => [...TaxRateKeys.lists(), organizationId] as const,
  
}

// hooks/useAllTaxRateQueries.ts
export const useOrgTaxRates = (
  organizationId: string,
  options?: { initialData?: BriefTaxRatePayload[] }
) => {
  return useQuery({
    queryKey: ['orgTaxRates', organizationId],
    queryFn: async () => {
      const result = await getOrgTaxRates(organizationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch tax rates');
      }
      return result.data || [];
    },
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};



export function useTaxRate(id: string, organizationId: string) {
  // Get a single TaxRate (Note: Server actions don't have individual fetch, using org list)
  return useQuery({
    queryKey: TaxRateKeys.detail(id),
    queryFn: async () => {
      const result = await getOrgTaxRates(organizationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch tax rate');
      }
      const taxRate = result.data?.find(tr => tr.id === id);
      if (!taxRate) {
        throw new Error('Tax rate not found');
      }
      return taxRate;
    },
    enabled: Boolean(id) && Boolean(organizationId), // Only run if both IDs are provided
  });
}

// Define or import the TaxRatePayload type
type TaxRatePayload = {
  // Add the appropriate fields for creating an TaxRate
  [key: string]: any;
};

// Alternative version if you need to handle organization-specific queries
export function useDeleteATaxRateWithOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { operation: 'delete', entity: 'Tax Rate Org' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const result = await deleteTaxRate({ id, organizationId });
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete tax rate');
      }
      return result;
    },
    
    onMutate: async ({ id, organizationId }) => {
      // Build query keys based on available data
      const queryKeys: Array<readonly unknown[]> = [TaxRateKeys.lists()];
      if (organizationId) {
        queryKeys.push(TaxRateKeys.briefOrgTaxRates(organizationId));
      }

      // Cancel all outgoing queries
      await Promise.all(
        queryKeys.map(key => queryClient.cancelQueries({ queryKey: key }))
      );

      // Snapshot and update all relevant caches
      const previousData = new Map();
      
      const removeTaxRateFromData = (oldData: any) => {
        if (!oldData) return oldData;

        if (Array.isArray(oldData)) {
          return oldData.filter(TaxRate => TaxRate.id !== id);
        }
        
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((TaxRate: { id: string }) => TaxRate.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1)
          };
        }
        
        if (oldData.TaxRates && Array.isArray(oldData.TaxRates)) {
          return {
            ...oldData,
            TaxRates: oldData.TaxRates.filter((TaxRate: { id: string }) => TaxRate.id !== id),
            total: Math.max(0, (oldData.total || oldData.TaxRates.length) - 1)
          };
        }

        return oldData;
      };

      queryKeys.forEach(key => {
        const data = queryClient.getQueryData(key);
        if (data) {
          previousData.set(JSON.stringify(key), data);
          queryClient.setQueryData(key, removeTaxRateFromData);
        }
      });

      return { previousData, queryKeys };
    },

    onSuccess: () => {
      notify.success("TaxRate deleted successfully");
    },

    onError: (error: Error, _variables, context) => {
      notify.error("Failed to delete TaxRate", {
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
      queryClient.invalidateQueries({ queryKey: TaxRateKeys.lists() });
      if (organizationId) {
        queryClient.invalidateQueries({ 
          queryKey: TaxRateKeys.briefOrgTaxRates(organizationId) 
        });
      }
    },
  });
}


export function useUpdateATaxRate() {
  const queryClient = useQueryClient();

  // Update an existing TaxRate
  return useMutation({
    meta: { operation: 'update', entity: 'Tax Rate' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaxRatePayload & { organizationId: string } }) => {
      const { organizationId, ...payload } = data;
      const result = await updateTaxRate({ id, organizationId, ...payload });
      if (!result.success) {
        throw new Error(result.error || 'Failed to update tax rate');
      }
      return result.data;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: TaxRateKeys.detail(variables.id) });
      await queryClient.cancelQueries({ queryKey: TaxRateKeys.lists() });

      const previousTaxRateDetail = queryClient.getQueryData(TaxRateKeys.detail(variables.id));
      const previousTaxRatesList = queryClient.getQueryData(TaxRateKeys.lists());

      queryClient.setQueryData(TaxRateKeys.detail(variables.id), (oldData: TaxRate | undefined) => {
        return { ...oldData, ...variables.data };
      });

      queryClient.setQueryData(TaxRateKeys.lists(), (oldData: TaxRate[] | undefined) => {
        if (!oldData) return [variables.data];
        return oldData.map(TaxRate => (TaxRate.id === variables.id ? { ...TaxRate, ...variables.data } : TaxRate));
      });

      return { previousTaxRateDetail, previousTaxRatesList };
    },
    onError: (error, variables, context) => {
      notify.error("Failed to update TaxRate", {
        description: error.message || "Unknown error occurred",
      });

      if (context?.previousTaxRateDetail) {
        queryClient.setQueryData(TaxRateKeys.detail(variables.id), context.previousTaxRateDetail);
      }

      if (context?.previousTaxRatesList) {
        queryClient.setQueryData(TaxRateKeys.lists(), context.previousTaxRatesList);
      }
    },
    onSuccess: (updatedTaxRate, variables) => {
      notify.success("TaxRate updated successfully");

      queryClient.setQueryData(TaxRateKeys.detail(variables.id), (oldData: TaxRate | undefined) => {
        return { ...oldData, ...updatedTaxRate };
      });

      queryClient.setQueryData(TaxRateKeys.lists(), (oldData: TaxRate[] | undefined) => {
        if (!oldData) return [updatedTaxRate];
        return oldData.map(TaxRate => (TaxRate.id === variables.id ? updatedTaxRate : TaxRate));
      });
    },
  });
}
