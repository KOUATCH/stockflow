"use client"

import { itemSupplierAPI } from "@/services/itemSupplierAPI"
import type {
  ItemSupplierDTO,
  UpdateItemSupplierDTO,
  CreateItemSupplierDTO,
  BriefItemSupplierDTO,
} from "@/types/itemSuppliers"
import {
  useMutation,
  useQuery,
  useSuspenseQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query"
import { toast } from "sonner"

// Types
interface ItemSupplierFilters {
  organizationId?: string
  itemId?: string
  supplierId?: string
  isPreferred?: boolean
  dateFrom?: Date
  dateTo?: Date
  searchQuery?: string
  [key: string]: any
}

interface DeleteItemSupplierParams {
  id: string
  organizationId?: string
}

// Centralized Query Keys
export const ItemSupplierKeys = {
  all: ["itemSuppliers"] as const,
  lists: () => [...ItemSupplierKeys.all, "list"] as const,
  list: (filters: ItemSupplierFilters) => [...ItemSupplierKeys.lists(), filters] as const,
  details: () => [...ItemSupplierKeys.all, "detail"] as const,
  detail: (id: string) => [...ItemSupplierKeys.details(), id] as const,
  orgItemSuppliers: (orgId: string) => [...ItemSupplierKeys.all, "organization", orgId] as const,
  briefOrgItemSuppliers: (orgId: string) => [...ItemSupplierKeys.orgItemSuppliers(orgId), "brief"] as const,
  itemSuppliers: (itemId: string) => [...ItemSupplierKeys.all, "item", itemId] as const,
  supplierItems: (supplierId: string) => [...ItemSupplierKeys.all, "supplier", supplierId] as const,
}

// Query Hooks
export function useItemSuppliers(
  filters: ItemSupplierFilters = {},
  options?: Omit<UseQueryOptions<ItemSupplierDTO[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ItemSupplierKeys.list(filters),
    queryFn: () => itemSupplierAPI.getItemSuppliers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useItemSupplier(id: string, options?: Omit<UseQueryOptions<ItemSupplierDTO>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: ItemSupplierKeys.detail(id),
    queryFn: () => itemSupplierAPI.getItemSupplier(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useOrgItemSuppliers(
  organizationId: string,
  options?: {
    initialData?: BriefItemSupplierDTO[]
    enabled?: boolean
  },
) {
  return useQuery({
    queryKey: ItemSupplierKeys.briefOrgItemSuppliers(organizationId),
    queryFn: () => itemSupplierAPI.getAllOrgItemSuppliers(organizationId),
    enabled: Boolean(organizationId) && (options?.enabled ?? true),
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSuspenseItemSuppliers(organizationId: string) {
  return useSuspenseQuery({
    queryKey: ItemSupplierKeys.briefOrgItemSuppliers(organizationId),
    queryFn: () => itemSupplierAPI.getAllOrgItemSuppliers(organizationId),
  })
}

export function useItemSuppliersForItem(itemId: string) {
  return useQuery({
    queryKey: ItemSupplierKeys.itemSuppliers(itemId),
    queryFn: () => itemSupplierAPI.getItemSuppliersByItemId(itemId),
    enabled: Boolean(itemId),
    staleTime: 5 * 60 * 1000,
  })
}

// Mutation Hooks
export function useCreateItemSupplier(options?: UseMutationOptions<ItemSupplierDTO, Error, CreateItemSupplierDTO>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateItemSupplierDTO) => itemSupplierAPI.createItemSupplier(data),
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ItemSupplierKeys.lists() })

      if (variables.organizationId) {
        await queryClient.cancelQueries({
          queryKey: ItemSupplierKeys.briefOrgItemSuppliers(variables.organizationId),
        })
      }

      // Snapshot previous values
      const previousLists = queryClient.getQueryData(ItemSupplierKeys.lists())
      const previousOrgData = variables.organizationId
        ? queryClient.getQueryData(ItemSupplierKeys.briefOrgItemSuppliers(variables.organizationId))
        : undefined

      // Optimistically update
      const tempId = `temp-${Date.now()}`
      const optimisticItemSupplier = { ...variables, id: tempId } as ItemSupplierDTO

      queryClient.setQueryData(ItemSupplierKeys.lists(), (old: ItemSupplierDTO[] = []) => [
        optimisticItemSupplier,
        ...old,
      ])

      if (variables.organizationId) {
        queryClient.setQueryData(
          ItemSupplierKeys.briefOrgItemSuppliers(variables.organizationId),
          (old: BriefItemSupplierDTO[] = []) => [optimisticItemSupplier as BriefItemSupplierDTO, ...old],
        )
      }

      return { previousLists, previousOrgData, tempId }
    },
    onSuccess: (data, variables, context) => {
      toast.success("Item supplier created successfully", {
        description: `Supplier relationship has been established`,
      })

      // Update with real data
      queryClient.setQueryData(ItemSupplierKeys.detail(data.id), data)

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.lists() })

      if (variables.organizationId) {
        queryClient.invalidateQueries({
          queryKey: ItemSupplierKeys.briefOrgItemSuppliers(variables.organizationId),
        })
      }
    },
    onError: (error, variables, context) => {
      toast.error("Failed to create item supplier", {
        description: error.message || "Unknown error occurred",
      })

      // Rollback optimistic updates
      if (context?.previousLists) {
        queryClient.setQueryData(ItemSupplierKeys.lists(), context.previousLists)
      }
      if (context?.previousOrgData && variables.organizationId) {
        queryClient.setQueryData(
          ItemSupplierKeys.briefOrgItemSuppliers(variables.organizationId),
          context.previousOrgData,
        )
      }
    },
    ...options,
  })
}

export function useUpdateItemSupplier(options?: UseMutationOptions<ItemSupplierDTO, Error, UpdateItemSupplierDTO>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateItemSupplierDTO) => itemSupplierAPI.updateItemSupplier(data),
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ItemSupplierKeys.detail(variables.id) })
      await queryClient.cancelQueries({ queryKey: ItemSupplierKeys.lists() })

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData(ItemSupplierKeys.detail(variables.id))
      const previousLists = queryClient.getQueryData(ItemSupplierKeys.lists())

      // Optimistically update detail
      queryClient.setQueryData(ItemSupplierKeys.detail(variables.id), (old: ItemSupplierDTO | undefined) =>
        old ? { ...old, ...variables } : (variables as ItemSupplierDTO),
      )

      // Optimistically update lists
      queryClient.setQueryData(ItemSupplierKeys.lists(), (old: ItemSupplierDTO[] = []) =>
        old.map((item) => (item.id === variables.id ? { ...item, ...variables } : item)),
      )

      return { previousDetail, previousLists }
    },
    onSuccess: (data, variables) => {
      toast.success("Item supplier updated successfully", {
        description: "Supplier information has been updated",
      })

      // Update with server response
      queryClient.setQueryData(ItemSupplierKeys.detail(variables.id), data)

      // Update in lists
      queryClient.setQueryData(ItemSupplierKeys.lists(), (old: ItemSupplierDTO[] = []) =>
        old.map((item) => (item.id === variables.id ? data : item)),
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.itemSuppliers(data.itemId) })
      queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.supplierItems(data.supplierId) })
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update item supplier", {
        description: error.message || "Unknown error occurred",
      })

      // Rollback optimistic updates
      if (context?.previousDetail) {
        queryClient.setQueryData(ItemSupplierKeys.detail(variables.id), context.previousDetail)
      }
      if (context?.previousLists) {
        queryClient.setQueryData(ItemSupplierKeys.lists(), context.previousLists)
      }
    },
    ...options,
  })
}

export function useDeleteItemSupplier(options?: UseMutationOptions<void, Error, DeleteItemSupplierParams>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: DeleteItemSupplierParams) => itemSupplierAPI.deleteItemSupplier(id),
    onMutate: async ({ id, organizationId }) => {
      // Build query keys based on available data
      const queryKeys = [
        ItemSupplierKeys.lists(),
        ItemSupplierKeys.detail(id),
        ...(organizationId ? [ItemSupplierKeys.briefOrgItemSuppliers(organizationId)] : []),
      ]

      // Cancel outgoing queries
      await Promise.all(queryKeys.map((key) => queryClient.cancelQueries({ queryKey: key })))

      // Snapshot previous values
      const previousData = new Map()
      queryKeys.forEach((key) => {
        const data = queryClient.getQueryData(key)
        if (data) {
          previousData.set(JSON.stringify(key), data)
        }
      })

      // Helper function to remove item supplier from different data structures
      const removeItemSupplierFromData = (oldData: any) => {
        if (!oldData) return oldData

        if (Array.isArray(oldData)) {
          return oldData.filter((item) => item.id !== id)
        }

        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((item: { id: string }) => item.id !== id),
            total: Math.max(0, (oldData.total || oldData.data.length) - 1),
          }
        }

        if (oldData.itemSuppliers && Array.isArray(oldData.itemSuppliers)) {
          return {
            ...oldData,
            itemSuppliers: oldData.itemSuppliers.filter((item: { id: string }) => item.id !== id),
            total: Math.max(0, (oldData.total || oldData.itemSuppliers.length) - 1),
          }
        }

        return oldData
      }

      // Optimistically update all relevant queries
      queryKeys.forEach((key) => {
        queryClient.setQueryData(key, removeItemSupplierFromData)
      })

      return { previousData, queryKeys }
    },
    onSuccess: (_, { id }) => {
      toast.success("Item supplier deleted successfully", {
        description: "Supplier relationship has been removed",
      })

      // Remove from cache completely
      queryClient.removeQueries({ queryKey: ItemSupplierKeys.detail(id) })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.lists() })
    },
    onError: (error, { id }, context) => {
      toast.error("Failed to delete item supplier", {
        description: error.message || "Unknown error occurred",
      })

      // Rollback all optimistic updates
      if (context?.previousData && context?.queryKeys) {
        context.queryKeys.forEach((key) => {
          const keyString = JSON.stringify(key)
          const previousValue = context.previousData.get(keyString)
          if (previousValue) {
            queryClient.setQueryData(key, previousValue)
          }
        })
      }
    },
    onSettled: (_, error, { id, organizationId }) => {
      if (!error) {
        // Final cleanup
        queryClient.removeQueries({ queryKey: ItemSupplierKeys.detail(id), exact: true })

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.lists(), refetchType: "none" })

        if (organizationId) {
          queryClient.invalidateQueries({
            queryKey: ItemSupplierKeys.briefOrgItemSuppliers(organizationId),
            refetchType: "none",
          })
        }
      }
    },
    ...options,
  })
}

// Utility hooks
export function useInvalidateItemSuppliers() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.all }),
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.lists() }),
    invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.detail(id) }),
    invalidateOrg: (orgId: string) =>
      queryClient.invalidateQueries({ queryKey: ItemSupplierKeys.briefOrgItemSuppliers(orgId) }),
  }
}

export function usePrefetchItemSupplier() {
  const queryClient = useQueryClient()

  return {
    prefetchDetail: (id: string) =>
      queryClient.prefetchQuery({
        queryKey: ItemSupplierKeys.detail(id),
        queryFn: () => itemSupplierAPI.getItemSupplier(id),
        staleTime: 5 * 60 * 1000,
      }),
    prefetchList: (filters: ItemSupplierFilters = {}) =>
      queryClient.prefetchQuery({
        queryKey: ItemSupplierKeys.list(filters),
        queryFn: () => itemSupplierAPI.getItemSuppliers(filters),
        staleTime: 5 * 60 * 1000,
      }),
  }
}
