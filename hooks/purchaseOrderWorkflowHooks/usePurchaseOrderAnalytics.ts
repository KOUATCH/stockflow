"use client"

import {
  getPurchaseOrderAnalytics,
  getPurchaseOrdersRequiringAttention,
  getPurchaseOrdersSummary
} from "@/actions/purchaseOrderWorkflow/purchaseOrderWorkflowActions"
import { useQuery } from "@tanstack/react-query"

export interface PurchaseOrderAnalytics {
  totalOrders: number
  pendingApproval: number
  overdue: number
  totalValue: number
  statusDistribution: Record<string, number>
  topSuppliers: Array<{ name: string; value: number; count: number }>
  monthlyTrends: Record<string, { total: number; count: number }>
  avgApprovalTime: number
  attentionItems: {
    overdue: any[]
    pendingApproval: any[]
    pendingReceipt: any[]
  }
}

export function usePurchaseOrderAnalytics(organizationId: string, dateRange?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["purchase-order-analytics", organizationId, dateRange],
    queryFn: async (): Promise<PurchaseOrderAnalytics> => {
      const [summary, analytics, attention] = await Promise.all([
        getPurchaseOrdersSummary(organizationId),
        getPurchaseOrderAnalytics({
          organizationId,
          from: dateRange?.from,
          to: dateRange?.to,
        }),
        getPurchaseOrdersRequiringAttention({ organizationId, limit: 10 }),
      ])

      return {
        totalOrders: summary.totalOrders,
        pendingApproval: summary.statusBreakdown.submitted + summary.statusBreakdown.draft,
        overdue: summary.overdueOrders,
        totalValue: summary.totalValue,
        statusDistribution: summary.statusBreakdown,
        topSuppliers: analytics.topSuppliers.map((s) => ({
          name: s.name,
          value: s.total,
          count: s.orders,
        })),
        monthlyTrends: analytics.monthly,
        avgApprovalTime: analytics.avgApprovalMs,
        attentionItems: {
          overdue: attention.overdue,
          pendingApproval: attention.pendingApproval,
          pendingReceipt: attention.pendingReceipt,
        },
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!organizationId,
  })
}

export function usePurchaseOrderSummary(organizationId: string) {
  return useQuery({
    queryKey: ["purchase-orders-summary", organizationId],
    queryFn: () => getPurchaseOrdersSummary(organizationId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!organizationId,
  })
}

export function usePurchaseOrderAttention(organizationId: string, limit = 10) {
  return useQuery({
    queryKey: ["purchase-orders-attention", organizationId, limit],
    queryFn: () => getPurchaseOrdersRequiringAttention({ organizationId, limit }),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!organizationId,
  })
}
