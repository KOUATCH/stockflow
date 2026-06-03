'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
// import { qk } from '@/lib/query-keys'
// import { createSupplier } from '@/app/actions/suppliers'

import { createSupplier } from '@/actions/suppliers/createSupplier'
import { SupplierKeys2 } from '@/actions/suppliers/supplierKeys'
import type {
  CreateSupplierDTO,
  SupplierResponse,
  SupplierWithRelations,
} from '@/types/supplier'
// import { SupplierKeys } from '@/types/queryKeys'

/**
 * Creates a supplier by calling the Server Action directly (no fetch).
 * Requires the server action module to have "use server" at the top.
 */


export function useCreateSupplierHook() {
  const qc = useQueryClient()
  return useMutation({
    meta: { operation: 'create', entity: 'Supplier' },
    mutationFn: async (payload: CreateSupplierDTO) => {
      const res = await createSupplier(payload)
       if (!res?.success) {
        throw new Error(res?.error || 'Failed to create supplier')
      }
      return res as SupplierResponse<SupplierWithRelations>
    },
    onSuccess: async (_res, variables) => {
      // Invalidate all suppliers-related queries for the org
      await Promise.all([
        qc.invalidateQueries({ queryKey: SupplierKeys2.suppliers.root }),
        qc.invalidateQueries({ queryKey: SupplierKeys2.suppliers.summary(variables.organizationId) }),
      ])
    },
  })
}
