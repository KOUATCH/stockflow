'use client'

import { linkItemsToSupplier } from '@/actions/suppliers/linkItemsToSupplier'
// import { db } from '@/lib/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import {
  LinkItemsToSupplierDTO,
  type SupplierResponse,
  type SupplierWithRelations
} from '@/types/supplier'
import { useMutation, useQueryClient } from '@tanstack/react-query'
// import { db } from '@/lib/db'
// import { supplierInclude } from '@/lib/suppliers/includes'
import { SupplierKeys } from '@/actions/suppliers/supplierKeys'


export function useLinkItemsToSupplierHook() {
  const qc = useQueryClient()

  return useMutation<SupplierResponse<SupplierWithRelations>, Error, LinkItemsToSupplierDTO>({
    mutationFn: async (payload) => linkItemsToSupplier(payload),
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
