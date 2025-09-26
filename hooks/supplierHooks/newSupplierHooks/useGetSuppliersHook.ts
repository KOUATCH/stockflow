'use client'

import { getSuppliers } from '@/actions/suppliers/supplierActions'
import { SupplierKeys2 } from '@/actions/suppliers/supplierKeys'
import type { PaginatedSuppliersResponse, SupplierFilters } from '@/types/supplier'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

type Options = {
  enabled?: boolean
  initialData?: PaginatedSuppliersResponse
}

export function       useGetSuppliersHook(filters: SupplierFilters, options?: Options) {
  return useQuery({
    queryKey: SupplierKeys2.suppliers.list(filters),
    queryFn: async (): Promise<PaginatedSuppliersResponse> => {
      return await getSuppliers(filters)
    },
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
  })
}

