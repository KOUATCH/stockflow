"use client"

import { closePOSSession, getCurrentSession, openPOSSession, forceCloseActiveSession } from "@/actions/newPOSSession/pos/session-actions"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface OpenSessionData {
  stationId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance: number
}

interface CloseSessionData {
  sessionId: string
  terminalId: string
  closingBalance: number
  userId: string
}

export function useSessionManagement(terminalId: string) {
  const notifications = useNotifications()
  const queryClient = useQueryClient()

  // Query to get current session
  const {
    data: currentSession,
    isLoading: sessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ["currentSession", terminalId],
    queryFn: () => getCurrentSession(terminalId),
    enabled: !!terminalId,
    refetchInterval: false, // Disable automatic refetching to prevent race conditions
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    retry: 1, // Reduce retry attempts to prevent issues
  })

  // Mutation to open session
  const openSessionMutation = useMutation({
    mutationFn: async (data: OpenSessionData) => {
      const result = await openPOSSession(data)
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

      // Delay query invalidation to ensure database changes are committed
      setTimeout(() => {
        console.log("[Session] Invalidating queries after session start")
        queryClient.invalidateQueries({ queryKey: ["currentSession", terminalId] })
        queryClient.invalidateQueries({ queryKey: ["cashDrawer"] })
        queryClient.invalidateQueries({ queryKey: ["realTimeBalance"] })
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
      queryClient.invalidateQueries({ queryKey: ["currentSession"] })
      queryClient.invalidateQueries({ queryKey: ["cashDrawer"] })
      queryClient.invalidateQueries({ queryKey: ["realTimeBalance"] })
      queryClient.invalidateQueries({ queryKey: ["sessionHistory"] })
    },
    onError: (error: Error) => {
      notifications.error(
        "Failed to Close Session",
        error.message || "An unexpected error occurred while closing the session."
      )
    },
  })

  const startSession = async (openingBalance: number, userId: string, locationId?: string, organizationId?: string) => {
    if (!terminalId) {
      throw new Error("Terminal ID is required to start a session")
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

    console.log("[Session] Starting session with:", { terminalId, userId, locationId, organizationId, openingBalance })

    // First, force close any existing active session for this terminal
    const forceCloseResult = await forceCloseActiveSession(terminalId, organizationId)
    if (!forceCloseResult.success) {
      console.warn("[Session] Could not force close existing session:", forceCloseResult.error)
    } else if (forceCloseResult.data) {
      console.log("[Session] Force closed existing session:", forceCloseResult.data.id)
      notifications.warning(
        "Previous Session Closed",
        "A previous active session was automatically closed before starting the new session."
      )
    }

    const sessionData: OpenSessionData = {
      stationId: terminalId,
      userId,
      locationId,
      organizationId,
      openingBalance,
    }

    return openSessionMutation.mutateAsync(sessionData)
  }

  const endSession = async (closingBalance?: number) => {
    if (!currentSession?.data?.id) {
      throw new Error("No active session to close")
    }

    const sessionData: CloseSessionData = {
      sessionId: currentSession.data.id,
      terminalId,
      closingBalance: closingBalance || currentSession.data.openingBalance || 0,
      userId: currentSession.data.userId || "",
    }

    return closeSessionMutation.mutateAsync(sessionData)
  }

  const isSessionActive = currentSession?.data?.status === "ACTIVE"
  const sessionDuration = currentSession?.data?.startTime
    ? Math.floor((Date.now() - new Date(currentSession.data.startTime).getTime()) / (1000 * 60 * 60))
    : 0

  // Debug session status
  if (currentSession?.data) {
    console.log("[Session] Current session data:", {
      id: currentSession.data.id,
      status: currentSession.data.status,
      isActive: isSessionActive,
      startTime: currentSession.data.startTime,
    })
  }

  return {
    // Session data
    currentSession: currentSession?.data,
    sessionLoading: sessionLoading || openSessionMutation.isPending || closeSessionMutation.isPending,
    sessionError,

    // Session actions
    startSession,
    endSession,
    refetchSession,

    // Mutation states
    isOpeningSession: openSessionMutation.isPending,
    isClosingSession: closeSessionMutation.isPending,

    // Helper properties
    isSessionActive,
    sessionDuration,

    // Raw mutations for advanced usage
    openSessionMutation,
    closeSessionMutation,
  }
}
