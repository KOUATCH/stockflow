import {
  type FetchItemsParams,
  type FetchItemsResponse,
  fetchItemsWithInventoryLevels,
  fetchItemWithInventoryLevel,
  type ItemWithInventory,
} from "@/actions/inventory/fetchItemsWithInventoryLevels"
import { useInfiniteQuery, type UseInfiniteQueryOptions, useQuery, type UseQueryOptions } from "@tanstack/react-query"

// Query keys factory for better cache management
export const itemsQueryKeys = {
  all: ["items"] as const,
  lists: () => [...itemsQueryKeys.all, "list"] as const,
  list: (params: Partial<FetchItemsParams>) => [...itemsQueryKeys.lists(), params] as const,
  details: () => [...itemsQueryKeys.all, "detail"] as const,
  detail: (id: string, locationId: string, organizationId: string) =>
    [...itemsQueryKeys.details(), id, locationId, organizationId] as const,
  search: (searchTerm: string, locationId: string, organizationId: string) =>
    [...itemsQueryKeys.all, "search", searchTerm, locationId, organizationId] as const,
}

// Hook for fetching items with inventory levels (paginated)
export function useItemsWithInventory(
  params: FetchItemsParams,
  options?: Omit<UseQueryOptions<FetchItemsResponse, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: itemsQueryKeys.list(params),
    queryFn: () => fetchItemsWithInventoryLevels(params),
    enabled: Boolean(params.locationId && params.organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
    ...options,
  })
}

// Hook for infinite query (useful for infinite scroll)
export function useInfiniteItemsWithInventory(
  baseParams: Omit<FetchItemsParams, "skip" | "take">,
  pageSize = 50,
  options?: Omit<
    UseInfiniteQueryOptions<FetchItemsResponse, Error>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >,
) {
  return useInfiniteQuery({
    queryKey: itemsQueryKeys.list({ ...baseParams, take: pageSize }),
    queryFn: ({ pageParam = 0 }) =>
      fetchItemsWithInventoryLevels({
        ...baseParams,
        skip: pageParam as number,
        take: pageSize,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length * pageSize : undefined
    },
    initialPageParam: 0,
    enabled: Boolean(baseParams.locationId && baseParams.organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  })
}

// Hook for fetching a single item with inventory
export function useItemWithInventory(
  itemId: string | undefined,
  locationId: string | undefined,
  organizationId: string | undefined,
  options?: Omit<UseQueryOptions<ItemWithInventory | null, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: itemsQueryKeys.detail(itemId!, locationId!, organizationId!),
    queryFn: () => fetchItemWithInventoryLevel(itemId!, locationId!, organizationId!),
    enabled: Boolean(itemId && locationId && organizationId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  })
}

// Hook for searching items with debouncing
export function useSearchItemsWithInventory(
  searchTerm: string,
  locationId: string | undefined,
  organizationId: string | undefined,
  additionalParams: Partial<FetchItemsParams> = {},
  debounceMs = 300,
  options?: Omit<UseQueryOptions<FetchItemsResponse, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: itemsQueryKeys.search(searchTerm, locationId!, organizationId!),
    queryFn: () =>
      fetchItemsWithInventoryLevels({
        locationId: locationId!,
        organizationId: organizationId!,
        search: searchTerm,
        take: 20, // Smaller page size for search
        ...additionalParams,
      }),
    enabled: Boolean(searchTerm.trim().length >= 2 && locationId && organizationId),
    staleTime: 1000 * 60 * 1, // 1 minute for search results
    gcTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

// Hook for low stock items
export function useLowStockItems(
  locationId: string | undefined,
  organizationId: string | undefined,
  options?: Omit<UseQueryOptions<ItemWithInventory[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [...itemsQueryKeys.lists(), "low-stock", locationId, organizationId],
    queryFn: async () => {
      const result = await fetchItemsWithInventoryLevels({
        locationId: locationId!,
        organizationId: organizationId!,
        trackInventory: true,
        take: 100,
        orderBy: "quantityOnHand",
        orderDirection: "asc",
      })

      // Filter for items where quantity is below reorder level
      return result.items.filter((item) => {
        const inventory = item.inventoryLevel
        return inventory && inventory.quantityOnHand <= Math.max(item.reorderLevel, inventory.reorderPoint)
      })
    },
    enabled: Boolean(locationId && organizationId),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    ...options,
  })
}

// Hook for out of stock items
export function useOutOfStockItems(
  locationId: string | undefined,
  organizationId: string | undefined,
  options?: Omit<UseQueryOptions<ItemWithInventory[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: [...itemsQueryKeys.lists(), "out-of-stock", locationId, organizationId],
    queryFn: async () => {
      const result = await fetchItemsWithInventoryLevels({
        locationId: locationId!,
        organizationId: organizationId!,
        trackInventory: true,
        take: 100,
        orderBy: "name",
        orderDirection: "asc",
      })

      // Filter for items with zero or negative quantity
      return result.items.filter((item) => {
        const inventory = item.inventoryLevel
        return inventory && inventory.quantityOnHand <= 0
      })
    },
    enabled: Boolean(locationId && organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  })
}

// Hook for items by category with inventory
export function useItemsByCategory(
  categoryId: string | undefined,
  locationId: string | undefined,
  organizationId: string | undefined,
  additionalParams: Partial<FetchItemsParams> = {},
  options?: Omit<UseQueryOptions<FetchItemsResponse, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: itemsQueryKeys.list({
      categoryId,
      locationId,
      organizationId,
      ...additionalParams,
    }),
    queryFn: () =>
      fetchItemsWithInventoryLevels({
        locationId: locationId!,
        organizationId: organizationId!,
        categoryId,
        ...additionalParams,
      }),
    enabled: Boolean(categoryId && locationId && organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  })
}

// Hook for items by brand with inventory
export function useItemsByBrand(
  brandId: string | undefined,
  locationId: string | undefined,
  organizationId: string | undefined,
  additionalParams: Partial<FetchItemsParams> = {},
  options?: Omit<UseQueryOptions<FetchItemsResponse, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: itemsQueryKeys.list({
      brandId,
      locationId,
      organizationId,
      ...additionalParams,
    }),
    queryFn: () =>
      fetchItemsWithInventoryLevels({
        locationId: locationId!,
        organizationId: organizationId!,
        brandId,
        ...additionalParams,
      }),
    enabled: Boolean(brandId && locationId && organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  })
}

// Utility hook for inventory summary statistics
export function useInventorySummary(
  locationId: string | undefined,
  organizationId: string | undefined,
  options?: Omit<
    UseQueryOptions<
      {
        totalItems: number
        totalValue: number
        lowStockCount: number
        outOfStockCount: number
        averageValue: number
      },
      Error
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...itemsQueryKeys.all, "summary", locationId, organizationId],
    queryFn: async () => {
      const result = await fetchItemsWithInventoryLevels({
        locationId: locationId!,
        organizationId: organizationId!,
        trackInventory: true,
        take: 1000, // Get more items for accurate summary
        orderBy: "name",
        orderDirection: "asc",
      })

      const itemsWithInventory = result.items.filter((item) => item.inventoryLevel)

      return {
        totalItems: itemsWithInventory.length,
        totalValue: itemsWithInventory.reduce((sum, item) => sum + (item.inventoryLevel?.totalValue || 0), 0),
        lowStockCount: itemsWithInventory.filter((item) => {
          const inventory = item.inventoryLevel!
          return inventory.quantityOnHand <= Math.max(item.reorderLevel, inventory.reorderPoint)
        }).length,
        outOfStockCount: itemsWithInventory.filter((item) => item.inventoryLevel!.quantityOnHand <= 0).length,
        averageValue:
          itemsWithInventory.length > 0
            ? itemsWithInventory.reduce((sum, item) => sum + (item.inventoryLevel?.totalValue || 0), 0) /
              itemsWithInventory.length
            : 0,
      }
    },
    enabled: Boolean(locationId && organizationId),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    ...options,
  })
}
