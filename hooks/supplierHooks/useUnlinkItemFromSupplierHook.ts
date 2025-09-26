'use client'

import { SupplierKeys } from '@/actions/suppliers/supplierKeys'
import { unlinkItemFromSupplier } from '@/actions/suppliers/unlinkItemFromSupplier'
import { SupplierResponse, SupplierWithRelations, UnlinkItemFromSupplierDTO } from '@/types/supplier'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUnlinkItemFromSupplierHook() {
  const qc = useQueryClient()

  return useMutation<SupplierResponse<SupplierWithRelations>, Error, UnlinkItemFromSupplierDTO>({
    mutationFn: async (payload) => unlinkItemFromSupplier(payload),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      qc.invalidateQueries({ queryKey: ['suppliers-summary'] })
      qc.invalidateQueries({ queryKey: SupplierKeys.supplier(vars.supplierId) })
      if (res?.data?.id) {
        qc.invalidateQueries({ queryKey: SupplierKeys.supplier(res.data.id) })
      }
    },
  })
}
