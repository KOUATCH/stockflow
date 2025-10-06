"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getInventoryLevels,
  getInventoryTransactions,
  reserveInventory,
  releaseInventory
} from "@/actions/inventory"

export type InventoryLevel = {
  id: string
  itemId: string
  locationId: string
  quantityOnHand: number
  quantityReserved: number
  quantityAvailable: number
  quantityInTransit: number
  quantityOnOrder: number
  averageCost: number
  totalValue: number
  lastTransactionAt?: Date
  item?: {
    id: string
    name: string
    sku: string
    unit: string
  }
  location?: {
    id: string
    name: string
  }
}

export type InventoryTransaction = {
  id: string
  type: string
  quantity: number
  unitCost: number
  totalCost: number
  notes?: string
  createdAt: Date
  itemId: string
  locationId: string
  referenceType?: string
  referenceId?: string
  referenceNumber?: string
  balanceAfter: number
}

export function useInventoryIntegration(organizationId?: string) {
  const queryClient = useQueryClient()

  // Get inventory levels for organization
  const { data: inventoryLevelsResult, isLoading: isLoadingLevels } = useQuery({
    queryKey: ["inventory", "levels", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required")
      return await getInventoryLevels(organizationId)
    },
    enabled: !!organizationId,
  })

  const inventoryLevels = inventoryLevelsResult?.data

  // Get inventory transactions
  const { data: transactionsResult, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["inventory", "transactions", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required")
      return await getInventoryTransactions(organizationId)
    },
    enabled: !!organizationId,
  })

  const transactions = transactionsResult?.data

  // Get inventory level for specific item/location
  const getInventoryLevel = (itemId: string, locationId: string): InventoryLevel | undefined => {
    return inventoryLevels?.find((level) => level.itemId === itemId && level.locationId === locationId)
  }

  // Check if item has sufficient stock
  const hasAvailableStock = (itemId: string, locationId: string, requiredQuantity: number): boolean => {
    const level = getInventoryLevel(itemId, locationId)
    return (level?.quantityAvailable || 0) >= requiredQuantity
  }

  // Get low stock items (below minimum threshold)
  const getLowStockItems = (minimumThreshold = 10): InventoryLevel[] => {
    return inventoryLevels?.filter((level) => level.quantityAvailable <= minimumThreshold) || []
  }

  // Calculate total inventory value
  const getTotalInventoryValue = (): number => {
    return inventoryLevels?.reduce((total, level) => total + level.totalValue, 0) || 0
  }

  // Invalidate inventory queries
  const invalidateInventoryQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["inventory", organizationId] })
  }

  // Reserve inventory for purchase order
  const reserveInventoryMutation = useMutation({
    mutationFn: async (reservations: { itemId: string; locationId: string; quantity: number }[]) => {
      return await reserveInventory(reservations)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Inventory reserved successfully")
        invalidateInventoryQueries()
      } else {
        toast.error(`Failed to reserve inventory: ${result.error}`)
      }
    },
    onError: (error) => {
      toast.error(`Failed to reserve inventory: ${error.message}`)
    },
  })

  // Release inventory reservations
  const releaseInventoryMutation = useMutation({
    mutationFn: async (reservations: { itemId: string; locationId: string; quantity: number }[]) => {
      return await releaseInventory(reservations)
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Inventory reservations released")
        invalidateInventoryQueries()
      } else {
        toast.error(`Failed to release inventory: ${result.error}`)
      }
    },
    onError: (error) => {
      toast.error(`Failed to release inventory: ${error.message}`)
    },
  })

  return {
    // Data
    inventoryLevels,
    transactions,
    isLoadingLevels,
    isLoadingTransactions,

    // Helpers
    getInventoryLevel,
    hasAvailableStock,
    getLowStockItems,
    getTotalInventoryValue,

    // Actions
    reserveInventory: reserveInventoryMutation,
    releaseInventory: releaseInventoryMutation,
    invalidateInventoryQueries,

    // Status
    isReserving: reserveInventoryMutation.isPending,
    isReleasing: releaseInventoryMutation.isPending,
  }
}
