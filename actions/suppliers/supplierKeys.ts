import { SupplierFilters } from '@/types/supplier'

export const SupplierKeys = {
  suppliers: (filters?: Partial<SupplierFilters>) => ['suppliers', filters ?? {}] as const,
  // root: ['suppliers'] as const,
  supplier: (id: string | undefined) => ['supplier', id] as const,
  goodsReceiptsForPO: (poId: string | undefined) => ['goods-receipts', poId] as const,
  suppliersSummary: (orgId: string | undefined) => ['suppliers-summary', orgId] as const,
  list: (filters: unknown) => ['suppliers', 'list', filters] as const,
  detail: (id: string) => ['suppliers', 'detail', id] as const,
  summary: (organizationId: string) => ['suppliers', 'summary', organizationId] as const,
}
export const SupplierKeys2 = {
  suppliers: {
    root: ['suppliers'] as const,
    list: (filters: unknown) => ['suppliers', 'list', filters] as const,
    detail: (id: string) => ['suppliers', 'detail', id] as const,
    summary: (organizationId: string) => ['suppliers', 'summary', organizationId] as const,
  },
}
