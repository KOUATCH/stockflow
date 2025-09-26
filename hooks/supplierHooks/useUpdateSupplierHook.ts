'use client'

import { SupplierKeys2 } from '@/actions/suppliers/supplierKeys'
import { updateSupplier } from '@/actions/suppliers/updateSupplier'
import type { SupplierResponse, SupplierWithRelations, UpdateSupplierDTO } from '@/types/supplier'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateSupplierHook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateSupplierDTO) => {
      const res = await updateSupplier(payload)
      return res as SupplierResponse<SupplierWithRelations>
    },
    onSuccess: async (_res, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: SupplierKeys2.suppliers.detail(variables.id) }),
        qc.invalidateQueries({ queryKey: SupplierKeys2.suppliers.root }),
        qc.invalidateQueries({ queryKey: SupplierKeys2.suppliers.summary(variables.organizationId) }),
      ])
    },
  })
}

