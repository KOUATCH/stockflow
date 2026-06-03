"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createInventoryTransaction,
  getInventoryLevels,
  getInventoryTransactions,
  adjustInventory,
} from "@/lib/actions/inventory"
import type { TransactionType } from "@prisma/client"

// Get inventory levels hook
export function useInventoryLevels(params: {
  organizationId: string
  locationId?: string
  itemId?: string
  lowStock?: boolean
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ["inventory-levels", params],
    queryFn: () => getInventoryLevels(params),
  })
}

// Get inventory transactions hook
export function useInventoryTransactions(params: {
  organizationId: string
  itemId?: string
  locationId?: string
  type?: TransactionType
  page?: number
  limit?: number
  startDate?: Date
  endDate?: Date
}) {
  return useQuery({
    queryKey: ["inventory-transactions", params],
    queryFn: () => getInventoryTransactions(params),
  })
}

// Create inventory transaction mutation
export function useCreateInventoryTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Inventory Transaction' },
    mutationFn: createInventoryTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] })
    },
  })
}

// Adjust inventory mutation
export function useAdjustInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Inventory' },
    mutationFn: adjustInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-levels"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-transactions"] })
    },
  })
}
