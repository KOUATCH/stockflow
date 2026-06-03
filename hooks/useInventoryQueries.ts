"use client"

import { notify } from "@/lib/notifications/notify"
import {
  getInventory,
  getInventorySummary,
  getInventoryTransactions,
  updateReorderLevels,
  createInventoryAdjustment,
} from "@/actions/inventory/inventoryActions"
import type { InventoryFilters, InventoryTransaction } from "@/actions/inventory/inventoryActions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
// ============================================================================
// QUERY KEYS
// ============================================================================
export const InventoryKeys = {
  all: ["inventory"] as const,
  lists: () => [...InventoryKeys.all, "list"] as const,
  list: (filters: InventoryFilters) => [...InventoryKeys.lists(), filters] as const,
  summary: (organizationId: string) => [...InventoryKeys.all, "summary", organizationId] as const,
  transactions: (organizationId: string, itemId?: string, locationId?: string) =>
    [...InventoryKeys.all, "transactions", organizationId, itemId, locationId] as const,
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch inventory data with filters
 */
export function useInventory(filters: InventoryFilters) {
  return useQuery({
    queryKey: InventoryKeys.list(filters),
    queryFn: () => getInventory(filters),
    enabled: !!filters.organizationId,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook to fetch inventory summary statistics
 */
export function useInventorySummary(organizationId: string | undefined) {
  return useQuery({
    queryKey: InventoryKeys.summary(organizationId!),
    queryFn: () => getInventorySummary(organizationId!),
    enabled: !!organizationId,
  })
}

/**
 * Hook to fetch inventory transactions
 */
export function useInventoryTransactions(
  organizationId: string | undefined,
  itemId?: string,
  locationId?: string,
  limit = 50,
) {
  return useQuery<InventoryTransaction[], Error>({
    queryKey: InventoryKeys.transactions(organizationId!, itemId, locationId),
    queryFn: () => getInventoryTransactions(organizationId!, itemId, locationId, limit),
    enabled: !!organizationId,
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to update reorder levels
 */
export function useUpdateReorderLevels() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Reorder Levels' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({
      inventoryId,
      reorderLevel,
      maxLevel,
      organizationId,
    }: {
      inventoryId: string
      reorderLevel: number
      maxLevel: number
      organizationId: string
    }) => updateReorderLevels(inventoryId, reorderLevel, maxLevel, organizationId),
    onSuccess: (data, variables) => {
      notify.success("Reorder levels updated successfully")
      queryClient.invalidateQueries({ queryKey: InventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: InventoryKeys.summary(variables.organizationId) })
    },
    onError: (error: Error) => {
      notify.error(error.message || "Failed to update reorder levels")
    },
  })
}

/**
 * Hook to create inventory adjustment
 */
export function useInventoryAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Inventory Adjustment', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: ({
      itemId,
      locationId,
      adjustmentQuantity,
      reason,
      organizationId,
      userId,
    }: {
      itemId: string
      locationId: string
      adjustmentQuantity: number
      reason: string
      organizationId: string
      userId: string
    }) => createInventoryAdjustment(itemId, locationId, adjustmentQuantity, reason, organizationId, userId),
    onSuccess: (data, variables) => {
      notify.success("Inventory adjustment completed successfully")
      queryClient.invalidateQueries({ queryKey: InventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: InventoryKeys.summary(variables.organizationId) })
      queryClient.invalidateQueries({
        queryKey: InventoryKeys.transactions(variables.organizationId, variables.itemId, variables.locationId),
      })
    },
    onError: (error: Error) => {
      notify.error(error.message || "Failed to create inventory adjustment")
    },
  })
}
