"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import {
  createPOSSession,
  closePOSSession,
  getCurrentSession,
  forceCloseActiveSession,
  getSessionHistory
} from "@/actions/sessions/pos-session-actions"
import type {
  SessionData,
  CloseSessionData,
  SessionWithDetails,
  UseSessionManagement,
  SessionState,
  SessionFilters,
  Pagination
} from "@/actions/sessions/types"
import { SESSION_QUERY_KEYS } from "@/actions/sessions/types"

interface UseSessionManagementProps {
  stationId: string
  organizationId?: string
  enableAutoRefetch?: boolean
  refetchInterval?: number
}

export function useSessionManagement({
  stationId,
  organizationId,
  enableAutoRefetch = false,
  refetchInterval = 30000 // 30 seconds
}: UseSessionManagementProps): UseSessionManagement {
  const notifications = useNotifications()
  const queryClient = useQueryClient()

  // Query to get current session
  const {
    data: currentSessionResponse,
    isLoading: sessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useQuery({
    queryKey: SESSION_QUERY_KEYS.currentSession(stationId),
    queryFn: () => getCurrentSession(stationId, organizationId),
    enabled: !!stationId,
    refetchInterval: enableAutoRefetch ? refetchInterval : false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })

  // Mutation to open session
  const openSessionMutation = useMutation({
    mutationFn: async (data: SessionData) => {
      const result = await createPOSSession(data)
      if (!result.success) {
        throw new Error(result.error || "Failed to open session")
      }
      return result
    },
    onSuccess: (data) => {
      console.log("[Session] Session opened successfully:", data)
      notifications.success(
        "Session Opened Successfully",
        `POS session has been opened with $${data.data?.openingBalance || 0} opening balance.`
      )

      // Invalidate related queries
      setTimeout(() => {
        console.log("[Session] Invalidating queries after session start")
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.currentSession(stationId) })
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.cashDrawer(stationId) })
        if (data.data?.id) {
          queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.realTimeBalance(data.data.id) })
        }
      }, 500)
    },
    onError: (error: Error) => {
      notifications.error(
        "Failed to Open Session",
        error.message || "An unexpected error occurred while opening the session."
      )
    },
  })

  // Mutation to close session
  const closeSessionMutation = useMutation({
    mutationFn: async (data: CloseSessionData) => {
      const result = await closePOSSession(data)
      if (!result.success) {
        throw new Error(result.error || "Failed to close session")
      }
      return result
    },
    onSuccess: (data) => {
      notifications.success(
        "Session Closed Successfully",
        `POS session has been closed. Final balance: $${data.data?.closingBalance || 0}.`
      )

      // Invalidate all session-related queries
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.currentSession(stationId) })
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.cashDrawer(stationId) })
      queryClient.invalidateQueries({ queryKey: ['sessionHistory'] })
      if (data.data?.id) {
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.realTimeBalance(data.data.id) })
      }
    },
    onError: (error: Error) => {
      notifications.error(
        "Failed to Close Session",
        error.message || "An unexpected error occurred while closing the session."
      )
    },
  })

  // Mutation to force close session
  const forceCloseSessionMutation = useMutation({
    mutationFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required to force close session")
      }
      const result = await forceCloseActiveSession(stationId, organizationId)
      if (!result.success) {
        throw new Error(result.error || "Failed to force close session")
      }
      return result
    },
    onSuccess: (data) => {
      if (data.data) {
        notifications.warning(
          "Session Force Closed",
          "The active session has been forcefully closed."
        )
      } else {
        notifications.info(
          "No Active Session",
          "No active session found to close."
        )
      }

      // Invalidate session queries
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.currentSession(stationId) })
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.cashDrawer(stationId) })
    },
    onError: (error: Error) => {
      notifications.error(
        "Failed to Force Close Session",
        error.message || "An unexpected error occurred while force closing the session."
      )
    },
  })

  // Helper functions
  const startSession = async (
    openingBalance: number,
    userId: string,
    locationId: string,
    organizationId: string
  ) => {
    if (!stationId) {
      throw new Error("Station ID is required to start a session")
    }

    if (!userId) {
      throw new Error("User ID is required to start a session")
    }

    if (!locationId) {
      throw new Error("Location ID is required to start a session")
    }

    if (!organizationId) {
      throw new Error("Organization ID is required to start a session")
    }

    console.log("[Session] Starting session with:", { stationId, userId, locationId, organizationId, openingBalance })

    const sessionData: SessionData = {
      stationId,
      userId,
      locationId,
      organizationId,
      openingBalance,
    }

    return openSessionMutation.mutateAsync(sessionData)
  }

  const endSession = async (closingBalance?: number) => {
    const currentSession = currentSessionResponse?.data

    if (!currentSession?.id) {
      throw new Error("No active session to close")
    }

    const sessionData: CloseSessionData = {
      sessionId: currentSession.id,
      stationId,
      closingBalance: closingBalance || currentSession.openingBalance || 0,
      userId: currentSession.userId || "",
    }

    return closeSessionMutation.mutateAsync(sessionData)
  }

  const forceCloseSession = async () => {
    return forceCloseSessionMutation.mutateAsync()
  }

  // Computed properties
  const currentSession = currentSessionResponse?.data as SessionWithDetails | null
  const isSessionActive = currentSession?.status === "ACTIVE"

  const sessionDuration = currentSession?.startTime
    ? Math.floor((Date.now() - new Date(currentSession.startTime).getTime()) / (1000 * 60 * 60))
    : 0

  const sessionState: SessionState = sessionLoading
    ? 'loading'
    : sessionError
    ? 'error'
    : isSessionActive
    ? 'active'
    : 'inactive'

  // Debug logging
  if (currentSession) {
    console.log("[Session] Current session data:", {
      id: currentSession.id,
      status: currentSession.status,
      isActive: isSessionActive,
      startTime: currentSession.startTime,
    })
  }

  return {
    // Session data
    currentSession,
    sessionLoading: sessionLoading || openSessionMutation.isPending || closeSessionMutation.isPending,
    sessionError,

    // Session actions
    startSession,
    endSession,
    refetchSession,
    forceCloseSession,

    // Mutation states
    isOpeningSession: openSessionMutation.isPending,
    isClosingSession: closeSessionMutation.isPending,

    // Helper properties
    isSessionActive,
    sessionDuration,
    sessionState,
  }
}

// Hook for session history
export function useSessionHistory(
  filters: SessionFilters = {},
  pagination: Pagination = { skip: 0, take: 50 }
) {
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.sessionHistory({ ...filters, ...pagination }),
    queryFn: () => getSessionHistory(filters, pagination),
    enabled: !!(filters.organizationId || filters.stationId || filters.locationId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Legacy hooks for backward compatibility
export const useSessionManagementModern = useSessionManagement
export const usePOSSession = useSessionManagement

export default useSessionManagement