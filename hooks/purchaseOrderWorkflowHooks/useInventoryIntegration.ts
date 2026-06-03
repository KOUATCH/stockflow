"use client"

import {
  inventoryKeys,
  useCreateItem,
  useCreateStockAdjustment,
  useCreateStockTransfer,
  useInventoryHelpers,
  useInventoryLevels,
  useInventoryTransactions,
  useItems,
  useReleaseInventory,
  useReserveInventory,
  useStockAdjustments,
  useStockTransfers,
  useUpdateInventoryLevel,
} from "@/hooks/inventoryHooks/useInventoryHooks"
import type {
  CreateItemRequest,
  CreateStockAdjustmentRequest,
  CreateStockTransferRequest,
  ItemWithRelations,
  UpdateInventoryLevelRequest,
} from "@/types/inventoryTypes"
import { TransactionReferenceType } from '@prisma/client'
import { useQueryClient } from "@tanstack/react-query"

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
  lastTransactionAt?: Date | null | undefined
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
  notes?: string | null | undefined
  createdAt: Date
  itemId: string
  locationId: string
  referenceType?: TransactionReferenceType | null | undefined
  referenceId?: string | null | undefined
  referenceNumber?: string | null | undefined
  balanceAfter: number
}

export function useInventoryIntegration(organizationId?: string) {
  const queryClient = useQueryClient()

  const { data: items, isLoading: isLoadingItems } = useItems(organizationId)
  const { data: inventoryLevelsData, isLoading: isLoadingLevels } = useInventoryLevels(organizationId)
  const { data: transactionsData, isLoading: isLoadingTransactions } = useInventoryTransactions(organizationId)
  const { data: stockAdjustments, isLoading: isLoadingAdjustments } = useStockAdjustments(organizationId)
  const { data: stockTransfers, isLoading: isLoadingTransfers } = useStockTransfers(organizationId)

  const inventoryLevels: InventoryLevel[] =
    inventoryLevelsData?.map((level) => ({
      id: level.id,
      itemId: level.itemId,
      locationId: level.locationId,
      quantityOnHand: level.quantityOnHand,
      quantityReserved: level.quantityReserved,
      quantityAvailable: level.quantityAvailable,
      quantityInTransit: level.quantityInTransit,
      quantityOnOrder: level.quantityOnOrder,
      averageCost: level.averageCost,
      totalValue: level.totalValue,
      lastTransactionAt: level.lastTransactionAt,
      item: level.item
        ? {
            id: level.item.id,
            name: level.item.name,
            sku: level.item.sku,
            unit: "ea",
          }
        : undefined,
      location: level.location,
    })) || []

  const transactions: InventoryTransaction[] =
    transactionsData?.map((trans) => ({
      id: trans.id,
      type: trans.type,
      quantity: trans.quantity,
      unitCost: trans.unitCost,
      totalCost: trans.totalCost,
      notes: trans.notes,
      createdAt: trans.createdAt,
      itemId: trans.itemId,
      locationId: trans.locationId,
      referenceType: trans.referenceType,
      referenceId: trans.referenceId,
      referenceNumber: trans.referenceNumber,
      balanceAfter: trans.balanceAfter,
    })) || []

  const helpers = useInventoryHelpers(organizationId)

  const reserveInventoryMutation = useReserveInventory(organizationId || "")
  const releaseInventoryMutation = useReleaseInventory(organizationId || "")
  const updateInventoryMutation = useUpdateInventoryLevel(organizationId || "")
  const createItemMutation = useCreateItem(organizationId || "")
  const createAdjustmentMutation = useCreateStockAdjustment(organizationId || "")
  const createTransferMutation = useCreateStockTransfer(organizationId || "")

  const invalidateInventoryQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
  }

  const createNewItem = async (data: CreateItemRequest) => {
    return createItemMutation.mutateAsync(data)
  }

  const adjustInventory = async (data: CreateStockAdjustmentRequest) => {
    return createAdjustmentMutation.mutateAsync(data)
  }

  const transferStock = async (data: CreateStockTransferRequest) => {
    return createTransferMutation.mutateAsync(data)
  }

  const updateStock = async (data: UpdateInventoryLevelRequest) => {
    return updateInventoryMutation.mutateAsync(data)
  }

  const getOutOfStockItems = (): InventoryLevel[] => {
    return inventoryLevels.filter((level) => level.quantityAvailable <= 0)
  }

  const getItemsNeedingReorder = (): ItemWithRelations[] => {
    if (!items) return []
    return items.filter((item) => {
      const levels = inventoryLevels.filter((level) => level.itemId === item.id)
      const totalAvailable = levels.reduce((sum, level) => sum + level.quantityAvailable, 0)
      return totalAvailable <= item.reorderLevel
    })
  }

  const getInventoryValueByLocation = (locationId: string): number => {
    return inventoryLevels
      .filter((level) => level.locationId === locationId)
      .reduce((total, level) => total + level.totalValue, 0)
  }

  const getTopValueItems = (limit = 10): InventoryLevel[] => {
    return [...inventoryLevels].sort((a, b) => b.totalValue - a.totalValue).slice(0, limit)
  }

  return {
    inventoryLevels,
    transactions,
    items,
    stockAdjustments,
    stockTransfers,
    isLoadingLevels,
    isLoadingTransactions,
    isLoadingItems,
    isLoadingAdjustments,
    isLoadingTransfers,

    getInventoryLevel: helpers.getInventoryLevel,
    hasAvailableStock: helpers.hasAvailableStock,
    getLowStockItems: helpers.getLowStockItems,
    getTotalInventoryValue: helpers.getTotalInventoryValue,
    getOutOfStockItems,
    getItemsNeedingReorder,
    getInventoryValueByLocation,
    getTopValueItems,

    reserveInventory: reserveInventoryMutation,
    releaseInventory: releaseInventoryMutation,
    createItem: createNewItem,
    updateInventoryLevel: updateStock,
    createStockAdjustment: adjustInventory,
    createStockTransfer: transferStock,
    invalidateInventoryQueries,

    isReserving: reserveInventoryMutation.isPending,
    isReleasing: releaseInventoryMutation.isPending,
    isUpdatingInventory: updateInventoryMutation.isPending,
    isCreatingItem: createItemMutation.isPending,
    isCreatingAdjustment: createAdjustmentMutation.isPending,
    isCreatingTransfer: createTransferMutation.isPending,

    analytics: {
      totalItems: items?.length || 0,
      totalLocations: new Set(inventoryLevels.map((l) => l.locationId)).size,
      totalValue: helpers.getTotalInventoryValue(),
      lowStockCount: helpers.getLowStockItems().length,
      outOfStockCount: getOutOfStockItems().length,
      reorderNeededCount: getItemsNeedingReorder().length,
      totalTransactions: transactions.length,
      totalAdjustments: stockAdjustments?.length || 0,
      totalTransfers: stockTransfers?.length || 0,
    },
  }
}
