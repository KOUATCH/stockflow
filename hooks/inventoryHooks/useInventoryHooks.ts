"use client"

import {
  getInventoryLevels,
  getInventoryTransactions,
} from "@/actions/inventory/get-inventory-data"
import {
  createItem,
  createStockAdjustment,
  createStockTransfer,
  getItem,
  getItems,
  getStockAdjustments,
  getStockTransfers,
  releaseInventory,
  reserveInventory,
  updateInventoryLevel,
} from "@/actions/inventory/inventoryActions"
import type {
  CreateItemRequest,
  CreateStockAdjustmentRequest,
  CreateStockTransferRequest,
  InventoryFilters,
  InventoryLevelWithRelations,
  ItemWithRelations,
  ReserveInventoryRequest,
  TransactionFilters,
  UpdateInventoryLevelRequest,
} from "@/types/inventoryTypes"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// ===== QUERY KEYS =====
export const inventoryKeys = {
  all: ["inventory"] as const,
  items: (organizationId?: string) => [...inventoryKeys.all, "items", organizationId] as const,
  item: (id?: string) => [...inventoryKeys.all, "item", id] as const,
  levels: (organizationId?: string, filters?: InventoryFilters) =>
    [...inventoryKeys.all, "levels", organizationId, filters] as const,
  transactions: (organizationId?: string, filters?: TransactionFilters) =>
    [...inventoryKeys.all, "transactions", organizationId, filters] as const,
  adjustments: (organizationId?: string) => [...inventoryKeys.all, "adjustments", organizationId] as const,
  transfers: (organizationId?: string) => [...inventoryKeys.all, "transfers", organizationId] as const,
}

// ===== ITEMS HOOKS =====
export function useItems(organizationId?: string, filters?: InventoryFilters) {
  return useQuery({
    queryKey: inventoryKeys.items(organizationId),
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required")
      const result = await getItems(organizationId, filters)
      if (!result.success) throw new Error(result.error || "Failed to fetch items")
      return result.data
    },
    enabled: Boolean(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export function useItem(id?: string) {
  return useQuery({
    queryKey: inventoryKeys.item(id),
    queryFn: async () => {
      if (!id) throw new Error("Item ID is required")
      const result = await getItem(id)
      if (!result.success) throw new Error(result.error || "Failed to fetch item")
      return result.data
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export function useCreateItem(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateItemRequest) => {
      const result = await createItem(organizationId, data)
      if (!result.success) throw new Error(result.error || "Failed to create item")
      return result.data
    },
    onSuccess: (newItem) => {
      // Invalidate and refetch items list
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items(organizationId) })

      // Add the new item to the cache
      queryClient.setQueryData(inventoryKeys.item(newItem.id), newItem)

      toast.success("Item created successfully")
    },
    onError: (error) => {
      toast.error(`Failed to create item: ${error.message}`)
    },
  })
}

// ===== INVENTORY LEVELS HOOKS =====
export function useInventoryLevels(organizationId?: string, locationId?: string) {
  return useQuery({
    queryKey: inventoryKeys.levels(organizationId, { locationId }),
    queryFn: async () => {
      const result = await getInventoryLevels(locationId)
      if (!result.success) throw new Error(result.error || "Failed to fetch inventory levels")
      return result.data
    },
    enabled: Boolean(organizationId),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for inventory)
    retry: 2,
  })
}

export function useUpdateInventoryLevel(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateInventoryLevelRequest) => {
      const result = await updateInventoryLevel(data)
      if (!result.success) throw new Error(result.error || "Failed to update inventory level")
      return result.data
    },
    onSuccess: () => {
      // Invalidate inventory levels and transactions
      queryClient.invalidateQueries({ queryKey: inventoryKeys.levels(organizationId) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(organizationId) })

      toast.success("Inventory level updated successfully")
    },
    onError: (error) => {
      toast.error(`Failed to update inventory level: ${error.message}`)
    },
  })
}

// ===== INVENTORY TRANSACTIONS HOOKS =====
export function useInventoryTransactions(organizationId?: string, itemId?: string, locationId?: string) {
  return useQuery({
    queryKey: inventoryKeys.transactions(organizationId, { itemId, locationId }),
    queryFn: async () => {
      const result = await getInventoryTransactions(itemId, locationId, 50)
      if (!result.success) throw new Error(result.error || "Failed to fetch inventory transactions")
      return result.data
    },
    enabled: Boolean(organizationId),
    staleTime: 1 * 60 * 1000, // 1 minute (frequent updates for transactions)
    retry: 2,
  })
}

// ===== RESERVATION HOOKS =====
export function useReserveInventory(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ReserveInventoryRequest) => {
      const result = await reserveInventory(data)
      if (!result.success) throw new Error(result.error || "Failed to reserve inventory")
      return result.data
    },
    onSuccess: () => {
      // Invalidate inventory levels and transactions
      queryClient.invalidateQueries({ queryKey: inventoryKeys.levels(organizationId) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(organizationId) })

      toast.success("Inventory reserved successfully")
    },
    onError: (error) => {
      toast.error(`Failed to reserve inventory: ${error.message}`)
    },
  })
}

export function useReleaseInventory(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ReserveInventoryRequest) => {
      const result = await releaseInventory(data)
      if (!result.success) throw new Error(result.error || "Failed to release inventory")
      return result.data
    },
    onSuccess: () => {
      // Invalidate inventory levels and transactions
      queryClient.invalidateQueries({ queryKey: inventoryKeys.levels(organizationId) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(organizationId) })

      toast.success("Inventory reservations released successfully")
    },
    onError: (error) => {
      toast.error(`Failed to release inventory: ${error.message}`)
    },
  })
}

// ===== STOCK ADJUSTMENTS HOOKS =====
export function useStockAdjustments(organizationId?: string) {
  return useQuery({
    queryKey: inventoryKeys.adjustments(organizationId),
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required")
      const result = await getStockAdjustments(organizationId)
      if (!result.success) throw new Error(result.error || "Failed to fetch stock adjustments")
      return result.data
    },
    enabled: Boolean(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export function useCreateStockAdjustment(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateStockAdjustmentRequest) => {
      const result = await createStockAdjustment(data)
      if (!result.success) throw new Error(result.error || "Failed to create stock adjustment")
      return result.data
    },
    onSuccess: () => {
      // Invalidate adjustments, levels, and transactions
      queryClient.invalidateQueries({ queryKey: inventoryKeys.adjustments(organizationId) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.levels(organizationId) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(organizationId) })

      toast.success("Stock adjustment created successfully")
    },
    onError: (error) => {
      toast.error(`Failed to create stock adjustment: ${error.message}`)
    },
  })
}

// ===== STOCK TRANSFERS HOOKS =====
export function useStockTransfers(organizationId?: string) {
  return useQuery({
    queryKey: inventoryKeys.transfers(organizationId),
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID is required")
      const result = await getStockTransfers(organizationId)
      if (!result.success) throw new Error(result.error || "Failed to fetch stock transfers")
      return result.data
    },
    enabled: Boolean(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

export function useCreateStockTransfer(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateStockTransferRequest) => {
      const result = await createStockTransfer(data)
      if (!result.success) throw new Error(result.error || "Failed to create stock transfer")
      return result.data
    },
    onSuccess: () => {
      // Invalidate transfers, levels, and transactions
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers(organizationId) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.levels(organizationId) })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(organizationId) })

      toast.success("Stock transfer created successfully")
    },
    onError: (error) => {
      toast.error(`Failed to create stock transfer: ${error.message}`)
    },
  })
}

// ===== UTILITY HOOKS =====
export function useInventoryHelpers(organizationId?: string) {
  const { data: inventoryLevels } = useInventoryLevels(organizationId)
  const { data: items } = useItems(organizationId)

  // Get inventory level for specific item/location
  const getInventoryLevel = (itemId: string, locationId: string): InventoryLevelWithRelations | undefined => {
    const level = inventoryLevels?.find((level) => level.itemId === itemId && level.locationId === locationId)
    if (!level) return undefined
    return {
      ...level,
      location: level.location
        ? { id: level.location.id, name: level.location.name }
        : { id: "", name: "" },
    }
  }

  // Check if item has sufficient stock
  const hasAvailableStock = (itemId: string, locationId: string, requiredQuantity: number): boolean => {
    const level = getInventoryLevel(itemId, locationId)
    return (level?.quantityAvailable || 0) >= requiredQuantity
  }

  // Get low stock items (below minimum threshold)
  const getLowStockItems = (minimumThreshold = 10): InventoryLevelWithRelations[] => {
    return (
      inventoryLevels
        ?.filter((level) => level.quantityAvailable <= minimumThreshold)
        .map((level) => ({
          ...level,
          location: level.location
            ? { id: level.location.id, name: level.location.name }
            : { id: "", name: "" },
        })) || []
    )
  }

  // Get out of stock items
  const getOutOfStockItems = (): InventoryLevelWithRelations[] => {
    return (
      inventoryLevels
        ?.filter((level) => level.quantityAvailable <= 0)
        .map((level) => ({
          ...level,
          location: level.location
            ? { id: level.location.id, name: level.location.name }
            : { id: "", name: "" },
        })) || []
    )
  }

  // Calculate total inventory value
  const getTotalInventoryValue = (): number => {
    return inventoryLevels?.reduce((total, level) => total + level.totalValue, 0) || 0
  }

  // Get items that need reordering
  const getItemsNeedingReorder = (): ItemWithRelations[] => {
    if (!items || !inventoryLevels) return []

    return items.filter((item) => {
      const levels = inventoryLevels.filter((level) => level.itemId === item.id)
      const totalAvailable = levels.reduce((sum, level) => sum + level.quantityAvailable, 0)
      return totalAvailable <= item.reorderLevel
    })
  }

  return {
    getInventoryLevel,
    hasAvailableStock,
    getLowStockItems,
    getOutOfStockItems,
    getTotalInventoryValue,
    getItemsNeedingReorder,
  }
}

// ===== INVALIDATION HELPERS =====
export function useInventoryInvalidation(organizationId: string) {
  const queryClient = useQueryClient()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
  }

  const invalidateItems = async () => {
    await queryClient.invalidateQueries({ queryKey: inventoryKeys.items(organizationId) })
  }

  const invalidateLevels = async () => {
    await queryClient.invalidateQueries({ queryKey: inventoryKeys.levels(organizationId) })
  }

  const invalidateTransactions = async () => {
    await queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(organizationId) })
  }

  const invalidateAdjustments = async () => {
    await queryClient.invalidateQueries({ queryKey: inventoryKeys.adjustments(organizationId) })
  }

  const invalidateTransfers = async () => {
    await queryClient.invalidateQueries({ queryKey: inventoryKeys.transfers(organizationId) })
  }

  return {
    invalidateAll,
    invalidateItems,
    invalidateLevels,
    invalidateTransactions,
    invalidateAdjustments,
    invalidateTransfers,
  }
}
