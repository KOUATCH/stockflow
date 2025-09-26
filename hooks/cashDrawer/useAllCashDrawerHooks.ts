// hooks/cash-drawer/useCashDrawerHooks.ts
"use client"

import {
  addCashToDrawer,
  createCashDrawer,
  getCashDrawerReport,
  getCashDrawers,
  getCashDrawerTransactions,
  reconcileCashDrawer,
  removeCashFromDrawer,
  type CashDrawerOperation
} from "@/actions/cash-drawer/newCashDrawerSystem"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
// Query Keys
export const cashDrawerKeys = {
  all: ['cash-drawers'] as const,
  lists: () => [...cashDrawerKeys.all, 'list'] as const,
  list: (orgId: string) => [...cashDrawerKeys.lists(), orgId] as const,
  details: () => [...cashDrawerKeys.all, 'detail'] as const,
  detail: (id: string) => [...cashDrawerKeys.details(), id] as const,
  reports: () => [...cashDrawerKeys.all, 'reports'] as const,
  report: (drawerId: string, startDate: string, endDate: string) => 
    [...cashDrawerKeys.reports(), drawerId, startDate, endDate] as const,
  transactions: () => [...cashDrawerKeys.all, 'transactions'] as const,
  transaction: (drawerId: string, page: number, startDate?: string, endDate?: string) => 
    [...cashDrawerKeys.transactions(), drawerId, page, startDate, endDate] as const,
}

// Get all cash drawers for organization
export function useCashDrawers(organizationId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: cashDrawerKeys.list(organizationId),
    queryFn: () => getCashDrawers(organizationId),
    enabled: !!organizationId && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 30, // 30 seconds for real-time updates
  })
}

// Get cash drawer report
export function useCashDrawerReport(
  drawerId: string,
  startDate: Date,
  endDate: Date,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: cashDrawerKeys.report(drawerId, startDate.toISOString(), endDate.toISOString()),
    queryFn: () => getCashDrawerReport(drawerId, startDate, endDate),
    enabled: !!drawerId && !!startDate && !!endDate && (options.enabled !== false),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get cash drawer transactions
export function useCashDrawerTransactions(
  drawerId: string,
  page: number = 1,
  limit: number = 50,
  startDate?: Date,
  endDate?: Date,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: cashDrawerKeys.transaction(
      drawerId, 
      page, 
      startDate?.toISOString(), 
      endDate?.toISOString()
    ),
    queryFn: () => getCashDrawerTransactions(drawerId, page, limit, startDate, endDate),
    enabled: !!drawerId && (options.enabled !== false),
    staleTime: 1000 * 60, // 1 minute
    // keepPreviousData: true, // For pagination
  })
}

// Add cash to drawer mutation
export function useAddCashToDrawer() {
  const queryClient = useQueryClient()
  const { cashOperation, formError, operationStart } = useNotifications()

  return useMutation({
    mutationFn: (operation: CashDrawerOperation) => {
      operationStart("Adding Cash")
      return addCashToDrawer(operation)
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: cashDrawerKeys.all })
        queryClient.invalidateQueries({
          queryKey: cashDrawerKeys.transaction(variables.drawerId, 1)
        })

        cashOperation("add", variables.amount, `Drawer #${variables.drawerId}`)
      } else {
        formError("Add Cash", result.error || "An unknown error occurred")
      }
    },
    onError: (error) => {
      console.error("Add cash mutation failed:", error)
      formError("Add Cash", "Failed to add cash to drawer", error.message)
    },
  })
}

// Remove cash from drawer mutation
export function useRemoveCashFromDrawer() {
  const queryClient = useQueryClient()
  const { cashOperation, formError, operationStart } = useNotifications()

  return useMutation({
    mutationFn: (operation: CashDrawerOperation) => {
      operationStart("Removing Cash")
      return removeCashFromDrawer(operation)
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: cashDrawerKeys.all })
        queryClient.invalidateQueries({
          queryKey: cashDrawerKeys.transaction(variables.drawerId, 1)
        })

        cashOperation("remove", variables.amount, `Drawer #${variables.drawerId}`)
      } else {
        formError("Remove Cash", result.error || "An unknown error occurred")
      }
    },
    onError: (error) => {
      console.error("Remove cash mutation failed:", error)
      formError("Remove Cash", "Failed to remove cash from drawer", error.message)
    },
  })
}

// Reconcile cash drawer mutation
export function useReconcileCashDrawer() {
  const queryClient = useQueryClient()
  const { reconciliationResult, formError, operationStart } = useNotifications()

  return useMutation({
    mutationFn: (params: {
      drawerId: string
      countedAmount: number
      userId: string
      notes?: string
    }) => {
      operationStart("Reconciling Drawer")
      return reconcileCashDrawer(params.drawerId, params.countedAmount, params.userId, params.notes)
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: cashDrawerKeys.all })
        queryClient.invalidateQueries({
          queryKey: cashDrawerKeys.transaction(variables.drawerId, 1)
        })

        const variance = result.data?.variance || 0
        reconciliationResult(variance, `Drawer #${variables.drawerId}`)
      } else {
        formError("Reconciliation", result.error || "An unknown error occurred")
      }
    },
    onError: (error) => {
      console.error("Reconciliation mutation failed:", error)
      formError("Reconciliation", "Failed to reconcile cash drawer", error.message)
    },
  })
}

// Create cash drawer mutation
export function useCreateCashDrawer() {
  const queryClient = useQueryClient()
  const { formSuccess, formError, operationStart } = useNotifications()

  return useMutation({
    mutationFn: (data: {
      name: string
      drawerNumber: string
      locationId: string
      terminalId: string
      initialBalance?: number
    }) => {
      operationStart("Creating Cash Drawer")
      return createCashDrawer(data)
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: cashDrawerKeys.all })

        formSuccess("Create Cash Drawer", `Cash drawer "${variables.name}" has been created successfully`)
      } else {
        formError("Create Cash Drawer", result.error || "An unknown error occurred")
      }
    },
    onError: (error) => {
      console.error("Create cash drawer mutation failed:", error)
      formError("Create Cash Drawer", "Failed to create cash drawer", error.message)
    },
  })
}

// Real-time cash drawer status hook
export function useCashDrawerStatus(organizationId: string) {
  const { data, isLoading, error, refetch } = useCashDrawers(organizationId)

  // Calculate aggregate statistics
  const stats = useMemo(() => {
    if (!data?.success || !data.data) {
      return {
        totalDrawers: 0,
        activeDrawers: 0,
        totalBalance: 0,
        totalVariance: 0,
        averageBalance: 0,
      }
    }

    const drawers = data.data
    const activeDrawers = drawers.filter(d => d.isOpen).length
    const totalBalance = drawers.reduce((sum, d) => sum + d.currentBalance, 0)
    const totalVariance = drawers.reduce((sum, d) => sum + d.variance, 0)

    return {
      totalDrawers: drawers.length,
      activeDrawers,
      totalBalance,
      totalVariance,
      averageBalance: drawers.length > 0 ? totalBalance / drawers.length : 0,
    }
  }, [data])

  return {
    drawers: data?.success ? data.data : [],
    stats,
    isLoading,
    error: error || (!data?.success ? data?.error : undefined),
    refetch,
  }
}

// Hook for cash drawer analytics
export function useCashDrawerAnalytics(
  organizationId: string,
  dateRange: { start: Date; end: Date }
) {
  const { data: drawersData } = useCashDrawers(organizationId)

  return useQuery({
    queryKey: ['cash-drawer-analytics', organizationId, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async () => {
      if (!drawersData?.success || !drawersData.data) {
        return { reports: [], summary: null }
      }

      // Generate reports for all drawers
      const reports = await Promise.all(
        drawersData.data.map(drawer => 
          getCashDrawerReport(drawer.id, dateRange.start, dateRange.end)
        )
      )

      const successfulReports = reports
        .filter(r => r.success && r.data)
        .map(r => r.data!)

      // Calculate summary analytics
      const summary = {
        totalTransactions: successfulReports.reduce((sum, r) => sum + r.transactionCount, 0),
        totalSales: successfulReports.reduce((sum, r) => sum + r.totalSales, 0),
        totalCashFlow: successfulReports.reduce((sum, r) => sum + r.netCashFlow, 0),
        totalVariance: successfulReports.reduce((sum, r) => sum + r.variance, 0),
        averageVariance: successfulReports.length > 0 
          ? successfulReports.reduce((sum, r) => sum + r.variance, 0) / successfulReports.length 
          : 0,
        drawerCount: successfulReports.length,
      }

      return { reports: successfulReports, summary }
    },
    enabled: !!drawersData?.success && !!dateRange.start && !!dateRange.end,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}