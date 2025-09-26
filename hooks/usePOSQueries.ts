"use client"

import type {
    CashDrawerOperationPayload,
    ClosePOSSessionPayload,
    CreatePOSSessionPayload,
    POSFilters,
    ProcessPaymentPayload
} from '@/types/posTypes'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// API functions (these would typically be in a separate API service file)
const posAPI = {
  // POS Sessions
  getSessions: async (filters: POSFilters) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()))
        } else {
          params.append(key, value.toString())
        }
      }
    })
    
    const response = await fetch(`/api/pos/sessions?${params}`)
    if (!response.ok) throw new Error('Failed to fetch POS sessions')
    return response.json()
  },

  getSession: async (id: string) => {
    const response = await fetch(`/api/pos/sessions/${id}`)
    if (!response.ok) throw new Error('Failed to fetch POS session')
    return response.json()
  },

  startSession: async (data: CreatePOSSessionPayload) => {
    const response = await fetch('/api/pos/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to start POS session')
    return response.json()
  },

  closeSession: async (data: ClosePOSSessionPayload) => {
    const response = await fetch('/api/pos/sessions/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to close POS session')
    return response.json()
  },

  // Terminals
  getTerminals: async (organizationId: string, locationId?: string) => {
    const params = new URLSearchParams({ organizationId })
    if (locationId) params.append('locationId', locationId)
    
    const response = await fetch(`/api/pos/terminals?${params}`)
    if (!response.ok) throw new Error('Failed to fetch POS terminals')
    return response.json()
  },

  getTerminal: async (id: string) => {
    const response = await fetch(`/api/pos/terminals/${id}`)
    if (!response.ok) throw new Error('Failed to fetch POS terminal')
    return response.json()
  },

  // Cash Drawer
  getCashDrawer: async (locationId: string) => {
    const response = await fetch(`/api/pos/cash-drawer/${locationId}`)
    if (!response.ok) throw new Error('Failed to fetch cash drawer')
    return response.json()
  },

  performCashDrawerOperation: async (data: CashDrawerOperationPayload) => {
    const response = await fetch('/api/pos/cash-drawer/operation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to perform cash drawer operation')
    return response.json()
  },

  // Payments
  processPayment: async (data: ProcessPaymentPayload) => {
    const response = await fetch('/api/pos/payments/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to process payment')
    return response.json()
  },

  getPayments: async (salesOrderId: string) => {
    const response = await fetch(`/api/pos/payments?salesOrderId=${salesOrderId}`)
    if (!response.ok) throw new Error('Failed to fetch payments')
    return response.json()
  },

  // Summary and Reports
  getSummary: async (organizationId: string, locationId?: string) => {
    const params = new URLSearchParams({ organizationId })
    if (locationId) params.append('locationId', locationId)
    
    const response = await fetch(`/api/pos/summary?${params}`)
    if (!response.ok) throw new Error('Failed to fetch POS summary')
    return response.json()
  },

  generateDailyReport: async (locationId: string, date: string) => {
    const response = await fetch('/api/pos/reports/daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationId, date }),
    })
    if (!response.ok) throw new Error('Failed to generate daily report')
    return response.json()
  },

  getDailyReports: async (organizationId: string, locationId?: string, dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams({ organizationId })
    if (locationId) params.append('locationId', locationId)
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)
    
    const response = await fetch(`/api/pos/reports/daily?${params}`)
    if (!response.ok) throw new Error('Failed to fetch daily reports')
    return response.json()
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
