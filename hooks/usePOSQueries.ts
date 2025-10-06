"use client"

import type {
    CashDrawerOperationPayload,
    ClosePOSSessionPayload,
    CreatePOSSessionPayload,
    POSFilters,
    ProcessPaymentPayload
} from '@/types/posTypes'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPOSSessions,
  getPOSSessionById,
  startPOSSession,
  closePOSSession,
  getPOSTerminals,
  getPOSTerminalById,
  getCashDrawer,
  processCashDrawerOperation,
  processPayment,
  getPayments,
  getPOSSummary,
  generateDailyReport,
  getDailyReports
} from "@/actions/pos"
import { useNotifications } from "@/components/notifications/NotificationProvider"

// Server action wrappers for POS API
const posAPI = {
  // POS Sessions
  getSessions: async (filters: POSFilters) => {
    return await getPOSSessions({
      locationId: filters.locationId,
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate
    })
  },

  getSession: async (id: string) => {
    return await getPOSSessionById(id)
  },

  startSession: async (data: CreatePOSSessionPayload) => {
    return await startPOSSession({
      locationId: data.locationId,
      initialCash: data.initialCash,
      notes: data.notes
    })
  },

  closeSession: async (data: ClosePOSSessionPayload) => {
    return await closePOSSession({
      sessionId: data.sessionId,
      finalCash: data.finalCash,
      notes: data.notes
    })
  },

  // Terminals
  getTerminals: async (organizationId: string, locationId?: string) => {
    return await getPOSTerminals({
      locationId: locationId,
      status: 'ACTIVE'
    })
  },

  getTerminal: async (id: string) => {
    return await getPOSTerminalById(id)
  },

  // Cash Drawer
  getCashDrawer: async (locationId: string) => {
    return await getCashDrawer(locationId)
  },

  performCashDrawerOperation: async (data: CashDrawerOperationPayload) => {
    return await processCashDrawerOperation({
      sessionId: data.sessionId,
      type: data.type,
      amount: data.amount,
      reason: data.reason,
      notes: data.notes
    })
  },

  // Payments
  processPayment: async (data: ProcessPaymentPayload) => {
    return await processPayment({
      salesOrderId: data.salesOrderId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      notes: data.notes
    })
  },

  getPayments: async (salesOrderId: string) => {
    return await getPayments(salesOrderId)
  },

  // Summary and Reports
  getSummary: async (organizationId: string, locationId?: string) => {
    return await getPOSSummary(organizationId, locationId)
  },

  generateDailyReport: async (locationId: string, date: string) => {
    return await generateDailyReport(locationId, date)
  },

  getDailyReports: async (organizationId: string, locationId?: string, dateFrom?: string, dateTo?: string) => {
    return await getDailyReports(organizationId, locationId, dateFrom, dateTo)
  },
}

// Query Keys
export const posQueryKeys = {
  all: ['pos'] as const,
  sessions: () => [...posQueryKeys.all, 'sessions'] as const,
  session: (id: string) => [...posQueryKeys.sessions(), id] as const,
  terminals: () => [...posQueryKeys.all, 'terminals'] as const,
  terminal: (id: string) => [...posQueryKeys.terminals(), id] as const,
  cashDrawer: (locationId: string) => [...posQueryKeys.all, 'cashDrawer', locationId] as const,
  payments: (salesOrderId: string) => [...posQueryKeys.all, 'payments', salesOrderId] as const,
  summary: (organizationId: string, locationId?: string) => 
    [...posQueryKeys.all, 'summary', organizationId, locationId] as const,
  dailyReports: (organizationId: string, locationId?: string) => 
    [...posQueryKeys.all, 'dailyReports', organizationId, locationId] as const,
}

// Custom Hooks

/**
 * Hook to fetch POS sessions with filters
 */
export function usePOSSessions(filters: POSFilters) {
  return useQuery({
    queryKey: [...posQueryKeys.sessions(), filters],
    queryFn: () => posAPI.getSessions(filters),
    enabled: !!filters.organizationId,
  })
}

/**
 * Hook to fetch a single POS session
 */
export function usePOSSession(id: string) {
  return useQuery({
    queryKey: posQueryKeys.session(id),
    queryFn: () => posAPI.getSession(id),
    enabled: !!id,
  })
}

/**
 * Hook to start a POS session
 */
export function useStartPOSSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: posAPI.startSession,
    onSuccess: (data) => {
      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: posQueryKeys.sessions() })
      // Update terminal data
      queryClient.invalidateQueries({ queryKey: posQueryKeys.terminal(data.data.terminalId) })
    },
  })
}

/**
 * Hook to close a POS session
 */
export function useClosePOSSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: posAPI.closeSession,
    onSuccess: (data) => {
      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: posQueryKeys.sessions() })
      // Update specific session
      queryClient.invalidateQueries({ queryKey: posQueryKeys.session(data.data.id) })
      // Update terminal data
      queryClient.invalidateQueries({ queryKey: posQueryKeys.terminal(data.data.terminalId) })
    },
  })
}

/**
 * Hook to fetch POS terminals
 */
export function usepOSStations(organizationId: string, locationId?: string) {
  return useQuery({
    queryKey: [...posQueryKeys.terminals(), organizationId, locationId],
    queryFn: () => posAPI.getTerminals(organizationId, locationId),
    enabled: !!organizationId,
  })
}

/**
 * Hook to fetch a single POS terminal
 */
export function usepOSStation(id: string) {
  return useQuery({
    queryKey: posQueryKeys.terminal(id),
    queryFn: () => posAPI.getTerminal(id),
    enabled: !!id,
  })
}

/**
 * Hook to fetch cash drawer
 */
export function useCashDrawer(locationId: string) {
  return useQuery({
    queryKey: posQueryKeys.cashDrawer(locationId),
    queryFn: () => posAPI.getCashDrawer(locationId),
    enabled: !!locationId,
  })
}

/**
 * Hook to perform cash drawer operations
 */
export function useCashDrawerOperation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: posAPI.performCashDrawerOperation,
    onSuccess: (data, variables) => {
      // Invalidate cash drawer data
      queryClient.invalidateQueries({ queryKey: posQueryKeys.cashDrawer(variables.cashDrawerId) })
      // Invalidate session data if applicable
      if (variables.sessionId) {
        queryClient.invalidateQueries({ queryKey: posQueryKeys.session(variables.sessionId) })
      }
    },
  })
}

/**
 * Hook to process payments
 */
export function useProcessPayment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: posAPI.processPayment,
    onSuccess: (data, variables) => {
      // Invalidate payments for the sales order
      queryClient.invalidateQueries({ queryKey: posQueryKeys.payments(variables.salesOrderId) })
      // Invalidate sales order data
      queryClient.invalidateQueries({ queryKey: ['salesOrders', variables.salesOrderId] })
      // Invalidate POS summary
      queryClient.invalidateQueries({ queryKey: posQueryKeys.summary })
    },
  })
}

/**
 * Hook to fetch payments for a sales order
 */
export function usePayments(salesOrderId: string) {
  return useQuery({
    queryKey: posQueryKeys.payments(salesOrderId),
    queryFn: () => posAPI.getPayments(salesOrderId),
    enabled: !!salesOrderId,
  })
}

/**
 * Hook to fetch POS summary
 */
export function usePOSSummary(organizationId: string, locationId?: string) {
  return useQuery({
    queryKey: posQueryKeys.summary(organizationId, locationId),
    queryFn: () => posAPI.getSummary(organizationId, locationId),
    enabled: !!organizationId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time data
  })
}

/**
 * Hook to generate daily sales report
 */
export function useGenerateDailyReport() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ locationId, date }: { locationId: string; date: string }) =>
      posAPI.generateDailyReport(locationId, date),
    onSuccess: () => {
      // Invalidate daily reports
      queryClient.invalidateQueries({ queryKey: posQueryKeys.dailyReports })
    },
  })
}

/**
 * Hook to fetch daily sales reports
 */
export function useDailyReports(
  organizationId: string, 
  locationId?: string, 
  dateFrom?: string, 
  dateTo?: string
) {
  return useQuery({
    queryKey: [...posQueryKeys.dailyReports(organizationId, locationId), dateFrom, dateTo],
    queryFn: () => posAPI.getDailyReports(organizationId, locationId, dateFrom, dateTo),
    enabled: !!organizationId,
  })
}

/**
 * Hook to get active session for a terminal
 */
export function useActiveSession(terminalId: string) {
  const { data: terminal } = usepOSStation(terminalId)
  const { data: session } = usePOSSession(terminal?.currentSessionId || '')
  
  return {
    activeSession: session,
    hasActiveSession: !!terminal?.currentSessionId,
    isLoading: !terminal && !session,
  }
}

/**
 * Hook to get real-time POS metrics
 */
export function usePOSMetrics(organizationId: string, locationId?: string) {
  const { data: summary, isLoading, error } = usePOSSummary(organizationId, locationId)
  
  return {
    metrics: summary ? {
      activeSessions: summary.activeSessions,
      totalSalesToday: summary.totalSalesToday,
      transactionsToday: summary.transactionsToday,
      averageTransactionValue: summary.averageTransactionValue,
      cashInDrawer: summary.cashInDrawer,
      topSellingItems: summary.topSellingItems,
      paymentMethodBreakdown: summary.paymentMethodBreakdown,
      hourlyStats: summary.hourlyStats,
    } : null,
    isLoading,
    error,
  }
}
