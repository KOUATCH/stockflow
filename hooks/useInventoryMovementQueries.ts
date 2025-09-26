"use client"

import {
  getInventoryTransactions,
  getStockMovementSummary,
  reserveInventory,
} from "@/actions/inventory/inventoryMovementActions"
import type { TransactionType } from "@/types/inventoryMovementTypes"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// ============================================================================
// QUERY KEYS
// ============================================================================
export const InventoryMovementKeys = {
  all: ["inventoryMovements"] as const,
  transactions: (organizationId: string, filters?: any) =>
    [...InventoryMovementKeys.all, "transactions", organizationId, filters] as const,
  summary: (organizationId: string, filters?: any) =>
    [...InventoryMovementKeys.all, "summary", organizationId, filters] as const,
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch inventory transactions
 */
export function useInventoryTransactions(
  organizationId: string | undefined,
  filters?: {
    itemId?: string
    locationId?: string
    type?: TransactionType
    dateFrom?: string
    dateTo?: string
    limit?: number
  },
) {
  return useQuery({
    queryKey: InventoryMovementKeys.transactions(organizationId!, filters),
    queryFn: () => getInventoryTransactions(organizationId!, filters),
    enabled: !!organizationId,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Hook to fetch stock movement summary
 */
export function useStockMovementSummary(
  organizationId: string | undefined,
  filters?: {
    itemId?: string
    locationId?: string
    dateFrom?: string
    dateTo?: string
  },
) {
  return useQuery({
    queryKey: InventoryMovementKeys.summary(organizationId!, filters),
    queryFn: () =>
      getStockMovementSummary(
        organizationId!,
        filters?.itemId,
        filters?.locationId,
        filters?.dateFrom,
        filters?.dateTo,
      ),
    enabled: !!organizationId,
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to reserve inventory
 */
export function useInventoryReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      itemId,
      locationId,
      quantity,
      reason,
      organizationId,
      expiresAt,
    }: {
      itemId: string
      locationId: string
      quantity: number
      reason: string
      organizationId: string
      expiresAt?: Date
    }) => reserveInventory(itemId, locationId, quantity, reason, organizationId, expiresAt),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Inventory reserved successfully")
      queryClient.invalidateQueries({ queryKey: InventoryMovementKeys.all })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reserve inventory")
    },
  })
}
