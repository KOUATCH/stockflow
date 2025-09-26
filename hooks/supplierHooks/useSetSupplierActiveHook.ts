'use client'

import { setSupplierActive } from '@/actions/suppliers/setSupplierActive'
import { SupplierKeys } from '@/actions/suppliers/supplierKeys'
import type { SupplierResponse, SupplierWithRelations } from '@/types/supplier'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type Variables = { id: string; organizationId: string; isActive: boolean }

export function useSetSupplierActiveHook() {
  const qc = useQueryClient()

  return useMutation<SupplierResponse<SupplierWithRelations>, Error, Variables>({
    mutationFn: async ({ id, organizationId, isActive }) => setSupplierActive(id, organizationId, isActive),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      qc.invalidateQueries({ queryKey: ['suppliers-summary'] })
      if (res?.data?.id) {
        qc.invalidateQueries({ queryKey: SupplierKeys.supplier(res.data.id) })
      }
    },
  })
}
