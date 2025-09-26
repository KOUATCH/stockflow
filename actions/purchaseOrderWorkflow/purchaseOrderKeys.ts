
import { PurchaseOrderFilters } from "@/types/purchase-orders-system-types";

export const purchaseOrderKeys = {
  purchaseOrders: (filters?: Partial<PurchaseOrderFilters>) => ['purchase-orders', filters ?? {}] as const,
  purchaseOrder: (id: string | undefined) => ['purchase-order', id] as const,
  goodsReceiptsForPO: (poId: string | undefined) => ['goods-receipts', poId] as const,
  purchaseOrdersSummary: (orgId: string | undefined) => ['purchase-orders-summary', orgId] as const,
}
