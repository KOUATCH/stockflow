'use client'
'use client'

import { getSuppliersSummary } from '@/actions/suppliers/getSuppliersSummary'
import { SupplierKeys } from '@/actions/suppliers/supplierKeys'
import { useQuery } from '@tanstack/react-query'


type SuppliersSummary = {
  total: number
  active: number
  inactive: number
  withPreferredItems: number
  withOpenPurchaseOrders: number
}

export function useSuppliersSummaryHook(organizationId?: string, enabled: boolean = true) {
  const isEnabled = enabled && !!organizationId

  return useQuery<SuppliersSummary, Error>({
    queryKey: SupplierKeys.suppliersSummary(organizationId),
    queryFn: () => getSuppliersSummary(organizationId as string),
    enabled: isEnabled,
  })
}
