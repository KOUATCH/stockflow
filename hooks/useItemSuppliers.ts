"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateItemSupplierDTO,
  UpdateItemSupplierDTO,
} from '@/types/itemSuppliers'

// Import server actions
import addItemSuppliers from "@/actions/item-suppliers/addItemSuppliers"
import getItemWithSuppliersById from "@/actions/item-suppliers/getItemWithSuppliers"
import { updateItemSupplier } from "@/actions/item-suppliers/updateItemSupplier"

// Query hooks
export function useItemSuppliers(itemId: string) {
  return useQuery({
    queryKey: ['itemSuppliers', itemId],
    queryFn: async () => {
      const response = await getItemWithSuppliersById(itemId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch item suppliers')
      }
      return response.data
    },
    enabled: !!itemId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

export function useItemWithSuppliers(itemId: string) {
  return useItemSuppliers(itemId)
}

// Mutation hooks
export function useAddItemSuppliers() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'add', entity: 'Item Suppliers' },
    mutationFn: async ({ itemId, supplierIds }: { itemId: string; supplierIds: string[] }) => {
      const response = await addItemSuppliers(itemId, supplierIds)
      if (!response.success) {
        throw new Error('Failed to add suppliers to item')
      }
      return response
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch item suppliers
      queryClient.invalidateQueries({ queryKey: ['itemSuppliers', variables.itemId] })
      queryClient.invalidateQueries({ queryKey: ['item', variables.itemId] })
    }
  })
}

export function useUpdateItemSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'update', entity: 'Item Supplier' },
    mutationFn: async (data: UpdateItemSupplierDTO) => {
      const response = await updateItemSupplier(data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update item supplier')
      }
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch item suppliers
      queryClient.invalidateQueries({ queryKey: ['itemSuppliers', variables.itemId] })
      queryClient.invalidateQueries({ queryKey: ['item', variables.itemId] })
    }
  })
}

export function useCreateItemSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'create', entity: 'Item Supplier' },
    mutationFn: async (data: CreateItemSupplierDTO) => {
      // For now, we use addItemSuppliers which takes itemId and supplierIds array
      // This would need a proper createItemSupplier action for full functionality
      const response = await addItemSuppliers(data.itemId, [data.supplierId])
      if (!response.success) {
        throw new Error('Failed to create item supplier relationship')
      }
      return response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['itemSuppliers', variables.itemId] })
      queryClient.invalidateQueries({ queryKey: ['item', variables.itemId] })
    }
  })
}

// Utility hooks
export function useItemSuppliersByItemId(itemId: string) {
  return useItemSuppliers(itemId)
}

export function usePreferredSupplier(itemId: string) {
  const { data: suppliers, ...rest } = useItemSuppliers(itemId)

  return {
    ...rest,
    data: suppliers?.find(supplier => supplier.isPreferred) || null
  }
}

export function useSuppliersByItem(itemId: string) {
  return useItemSuppliers(itemId)
}