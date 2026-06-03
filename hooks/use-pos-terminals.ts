"use client"

import { notify } from "@/lib/notifications/notify"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"import {
  getTerminals,
  getAvailableTerminals,
  detectTerminal,
  getUserActiveSession,
  getTerminalStatus,
  forceCloseSession
} from "@/actions/sessions and terminals/sessions&TerminalsActions"
import { closePosSession, openPosSession } from "@/actions/cashSystem/cash-drawer/cashDrawerAllActions"

// Get all terminals for location
export function useTerminals(locationId: string, organizationId: string) {
  return useQuery({
    queryKey: ["terminals", locationId, organizationId],
    queryFn: async () => {
      return await getTerminals(locationId, organizationId)
    },
    enabled: !!locationId && !!organizationId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })
}

// Get available terminals
export function useAvailableTerminals(locationId: string, organizationId: string) {
  return useQuery({
    queryKey: ["available-terminals", locationId, organizationId],
    queryFn: async () => {
      const result = await getAvailableTerminals(locationId, organizationId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.terminals!
    },
    enabled: !!locationId && !!organizationId,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Auto-detect terminal
export function useDetectTerminal(
  locationId: string,
  organizationId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["detect-terminal", locationId, organizationId],
    queryFn: async () => {
      // Get device identifier (hostname, IP, etc.)
      const identifier = window?.location?.hostname || "unknown"

      const result = await detectTerminal(locationId, organizationId, identifier)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.terminal!
    },
    enabled: enabled && !!locationId && !!organizationId,
    retry: 1,
    staleTime: 300000, // 5 minutes (terminals don't change often)
  })
}

// Get user's active session
export function useActiveSession(userId: string) {
  return useQuery({
    queryKey: ["active-session", userId],
    queryFn: async () => {
      const result = await getUserActiveSession(userId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.session
    },
    enabled: !!userId,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

// Get terminal status
export function useTerminalStatus(terminalId: string) {
  return useQuery({
    queryKey: ["terminal-status", terminalId],
    queryFn: async () => {
      const result = await getTerminalStatus(terminalId)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.terminal!
    },
    enabled: !!terminalId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })
}

// Start POS session mutation
export function useStartSession() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'start', entity: 'POS Session', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (data: {
      terminalId: string
      userId: string
      locationId: string
      organizationId: string
      openingBalance: number
    }) => {
      const result = await openPosSession(
        data.terminalId,
        data.userId,
        data.locationId,
        data.organizationId,
        data.openingBalance
      )
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.sessionId!
    },
    onSuccess: (sessionId, variables) => {
      notify.success("Session started successfully")

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["terminals"] })
      queryClient.invalidateQueries({ queryKey: ["available-terminals"] })
      queryClient.invalidateQueries({ queryKey: ["active-session", variables.userId] })
      queryClient.invalidateQueries({ queryKey: ["terminal-status", variables.terminalId] })
    },
    onError: (error) => {
      notify.error(`Failed to start session: ${error.message}`)
    },
  })
}

// Close POS session mutation
export function useCloseSession() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'close', entity: 'Session' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (data: {
      sessionId: string
      actualBalance: number
      notes?: string
    }) => {
      const result = await closePosSession(
        data.sessionId,
        data.actualBalance,
        data.notes
      )
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      notify.success("Session closed successfully")

      // Invalidate all session-related queries
      queryClient.invalidateQueries({ queryKey: ["terminals"] })
      queryClient.invalidateQueries({ queryKey: ["available-terminals"] })
      queryClient.invalidateQueries({ queryKey: ["active-session"] })
      queryClient.invalidateQueries({ queryKey: ["terminal-status"] })
    },
    onError: (error) => {
      notify.error(`Failed to close session: ${error.message}`)
    },
  })
}

// Force close session (admin)
export function useForceCloseSession() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { operation: 'close', entity: 'Force Session' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (data: {
      sessionId: string
      adminUserId: string
      reason: string
    }) => {
      const result = await forceCloseSession(
        data.sessionId,
        data.adminUserId,
        data.reason
      )
      if (!result.success) {
        throw new Error(result.error)
      }
      return result
    },
    onSuccess: () => {
      notify.success("Session force closed")

      // Invalidate all queries
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      notify.error(`Failed to force close session: ${error.message}`)
    },
  })
}
