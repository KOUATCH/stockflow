"use client"

import { useQuery } from '@tanstack/react-query'
import { getAvailableProducts, getItem, type AvailableProduct } from '@/actions/items/itemActions'

// Query hooks
export function useAvailableProducts(activeOnly: boolean = true) {
  return useQuery({
    queryKey: ['availableProducts', activeOnly],
    queryFn: () => getAvailableProducts(activeOnly),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => getItem(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}

// Utility hooks
export function useActiveProducts() {
  return useAvailableProducts(true)
}

export function useAllProducts() {
  return useAvailableProducts(false)
}

export function useProductsInStock() {
  const { data: products, ...rest } = useAvailableProducts(true)

  return {
    ...rest,
    data: products?.filter(product => product.stockQuantity > 0) || []
  }
}

export function useProductsByCategory(category?: string) {
  const { data: products, ...rest } = useAvailableProducts(true)

  return {
    ...rest,
    data: products?.filter(product =>
      !category || product.category?.toLowerCase().includes(category.toLowerCase())
    ) || []
  }
}

export function useProductSearch(searchTerm: string) {
  const { data: products, ...rest } = useAvailableProducts(true)

  return {
    ...rest,
    data: products?.filter(product => {
      if (!searchTerm) return true

      const term = searchTerm.toLowerCase()
      return (
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term)
      )
    }) || []
  }
}