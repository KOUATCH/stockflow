'use client'

import { getSupplierById } from '@/actions/suppliers/getSupplierById'
import { SupplierKeys } from '@/actions/suppliers/supplierKeys'
import type { SupplierWithRelations } from '@/types/supplier'
import { useQuery } from '@tanstack/react-query'

/**
 * Fetch a single supplier by ID (optionally scoped by organization) using TanStack Query.
 * Calls the Server Action directly from the client.
 */
export function useGetSupplierHook(id?: string, organizationId?: string) {
  return useQuery<SupplierWithRelations, Error>({
    queryKey: SupplierKeys.supplier(id),
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error('Supplier ID is required')
      const supplier = await getSupplierById(id, organizationId)
      return supplier
    },
    // Tune as needed:
    staleTime: 60_000,
  })
}
