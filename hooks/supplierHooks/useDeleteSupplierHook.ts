'use client'

import { deleteSupplier } from '@/actions/suppliers/deleteSupplier';
import { SupplierKeys2 } from '@/actions/suppliers/supplierKeys';
import type { SupplierResponse } from '@/types/supplier';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Variables = {
  id: string
  organizationId: string
}

type Data = SupplierResponse<null>
type ErrorType = Error

/**
 * useDeleteSupplierHook
 * - Calls the deleteSupplier server action
 * - Invalidates supplier list and detail queries on success
 * - Forwards any mutation options provided
 */

export function useDeleteSupplierHook() {
  const qc = useQueryClient()
  return useMutation({
    meta: { operation: 'delete', entity: 'Supplier' },
    mutationFn: async (args: { id: string; organizationId: string }) => {
      const res = await deleteSupplier(args.id, args.organizationId)
      return res as SupplierResponse<null>
    },
    onSuccess: async (_res, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: SupplierKeys2.suppliers.root }),
        qc.invalidateQueries({ queryKey: SupplierKeys2.suppliers.summary(variables.organizationId) }),
      ])
    },
  })
}
