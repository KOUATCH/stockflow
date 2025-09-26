// import type { PurchaseOrderFilters } from '@/types/purchase-orders'

import type { PurchaseOrderFilters } from "@/types/purchase-orders-system-types";

export const purchaseOrderModalKeys = {
  purchaseOrders: (filters?: Partial<PurchaseOrderFilters>) => ['purchase-orders', filters ?? {}] as const,
  purchaseOrder: (id: string | undefined) => ['purchase-order', id] as const,
  goodsReceiptsForPO: (poId: string | undefined) => ['goods-receipts', poId] as const,
  purchaseOrdersSummary: (orgId: string | undefined) => ['purchase-orders-summary', orgId] as const,
}

export const purchaseOrderKeys = {
  all: ["purchaseOrders"] as const,
  lists: () => [...purchaseOrderKeys.all, "list"] as const,
  list: (organizationId: string) => [...purchaseOrderKeys.lists(), organizationId] as const,
  purchaseOrders: (organizationId: string) => [...purchaseOrderKeys.all, "purchaseOrders", organizationId] as const,
  orgPurchaseOrders:(organizationId:string | undefined) => [...purchaseOrderKeys.all, "purchaseOrders", organizationId] as const,
  purchaseOrder: (id: string) => [...purchaseOrderKeys.all, "purchaseOrder", id] as const,
}
