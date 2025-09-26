"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
  const { data: inventoryLevels, isLoading: isLoadingLevels } = useQuery({
    queryKey: ["inventory", "levels", organizationId],
    queryFn: async () => {
      // This would call your inventory server action
      const response = await fetch(`/api/inventory/levels?organizationId=${organizationId}`)
      if (!response.ok) throw new Error("Failed to fetch inventory levels")
      return response.json() as unknown as InventoryLevel[]
    },
    enabled: !!organizationId,
  })

  // Get inventory transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["inventory", "transactions", organizationId],
    queryFn: async () => {
      const response = await fetch(`/api/inventory/transactions?organizationId=${organizationId}`)
      if (!response.ok) throw new Error("Failed to fetch inventory transactions")
      return response.json() as unknown as InventoryTransaction[]
    },
    enabled: !!organizationId,
  })

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
      const response = await fetch("/api/inventory/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservations, organizationId }),
      })
      if (!response.ok) throw new Error("Failed to reserve inventory")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Inventory reserved successfully")
      invalidateInventoryQueries()
    },
    onError: (error) => {
      toast.error(`Failed to reserve inventory: ${error.message}`)
    },
  })

  // Release inventory reservations
  const releaseInventoryMutation = useMutation({
    mutationFn: async (reservations: { itemId: string; locationId: string; quantity: number }[]) => {
      const response = await fetch("/api/inventory/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservations, organizationId }),
      })
      if (!response.ok) throw new Error("Failed to release inventory")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Inventory reservations released")
      invalidateInventoryQueries()
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
