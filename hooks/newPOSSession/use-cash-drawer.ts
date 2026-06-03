import {
  addCashToDrawer,
  closePosSession,
  getCashDrawerSummary,
  getCashDrawerTransactions,
  getCurrentSession,
  openPosSession,
  removeCashFromDrawer,
} from "@/actions/newPOSSession/cash-drawer/cash-drawer-actions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Query keys for cash drawer operations
export const cashDrawerQueryKeys = {
  all: ["cash-drawer"] as const,
  sessions: () => [...cashDrawerQueryKeys.all, "sessions"] as const,
  session: (terminalId: string) => [...cashDrawerQueryKeys.sessions(), terminalId] as const,
  transactions: (sessionId: string) => [...cashDrawerQueryKeys.all, "transactions", sessionId] as const,
  summary: (sessionId: string) => [...cashDrawerQueryKeys.all, "summary", sessionId] as const,
}

// Hook for getting current session
export function useCurrentSession(terminalId: string | undefined) {
  return useQuery({
    queryKey: cashDrawerQueryKeys.session(terminalId!),
    queryFn: () => getCurrentSession(terminalId!),
    enabled: Boolean(terminalId),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

// Hook for getting cash drawer transactions
export function useCashDrawerTransactions(sessionId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: cashDrawerQueryKeys.transactions(sessionId!),
    queryFn: () => getCashDrawerTransactions(sessionId!, limit),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 30, // 30 seconds
  })
}

// Hook for getting cash drawer summary
export function useCashDrawerSummary(sessionId: string | undefined) {
  return useQuery({
    queryKey: cashDrawerQueryKeys.summary(sessionId!),
    queryFn: () => getCashDrawerSummary(sessionId!),
    enabled: Boolean(sessionId),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

// Hook for opening POS session
export function useOpenSession() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'open', entity: 'Session' },
    mutationFn: ({
      terminalId,
      userId,
      locationId,
      organizationId,
      openingBalance,
    }: {
      terminalId: string
      userId: string
      locationId: string
      organizationId: string
      openingBalance: number
    }) => openPosSession(terminalId, userId, locationId, organizationId, openingBalance),
    onSuccess: (data, variables) => {
      // Invalidate and refetch session data
      queryClient.invalidateQueries({
        queryKey: cashDrawerQueryKeys.session(variables.terminalId),
      })
      queryClient.invalidateQueries({
        queryKey: cashDrawerQueryKeys.all,
      })
    },
  })
}

// Hook for closing POS session
export function useCloseSession() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'close', entity: 'Session' },
    mutationFn: ({
      sessionId,
      actualBalance,
      notes,
    }: {
      sessionId: string
      actualBalance: number
      notes?: string
    }) => closePosSession(sessionId, actualBalance, notes),
    onSuccess: () => {
      // Invalidate all cash drawer queries
      queryClient.invalidateQueries({
        queryKey: cashDrawerQueryKeys.all,
      })
    },
  })
}

// Hook for adding cash to drawer
export function useAddCash() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'add', entity: 'Cash' },
    mutationFn: ({
      sessionId,
      amount,
      reason,
      description,
    }: {
      sessionId: string
      amount: number
      reason: string
      description?: string
    }) => addCashToDrawer(sessionId, amount, reason, description),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: cashDrawerQueryKeys.transactions(variables.sessionId),
      })
      queryClient.invalidateQueries({
        queryKey: cashDrawerQueryKeys.summary(variables.sessionId),
      })
      queryClient.invalidateQueries({
        queryKey: cashDrawerQueryKeys.sessions(),
      })
    },
  })
}

// Hook for removing cash from drawer
export function useRemoveCash() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'delete', entity: 'Cash' },
    mutationFn: ({
      sessionId,
      amount,
      reason,
      description,
    }: {
      sessionId: string
      amount: number
      reason: string
      description?: string
    }) => removeCashFromDrawer(sessionId, amount, reason, description),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: cashDrawerQueryKeys.transactions(variables.sessionId),
      })
      queryClient.invalidateQueries({
        queryKey: cashDrawerQueryKeys.summary(variables.sessionId),
      })
      queryClient.invalidateQueries({
        queryKey: cashDrawerQueryKeys.sessions(),
      })
    },
  })
}
