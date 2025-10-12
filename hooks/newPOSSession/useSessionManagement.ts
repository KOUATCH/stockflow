"use client"

import { closePOSSession, getCurrentSession, openPOSSession } from "@/actions/newPOSSession/pos/session-actions"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface OpenSessionData {
  terminalId: string
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
  } = useQuery({
    queryKey: ["currentSession", terminalId],
    queryFn: () => getCurrentSession(terminalId),
    enabled: !!terminalId,
    refetchInterval: 5000, // Refetch every 5 seconds to keep session status updated
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
      notifications.success(
        "Session Opened",
        "POS session has been successfully opened."
      )
      // Invalidate and refetch session data
      queryClient.invalidateQueries({ queryKey: ["currentSession", terminalId] })
    },
    onError: (error: Error) => {
      notifications.error(
        "Failed to Open Session",
        error.message
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
    onSuccess: () => {
      notifications.success(
        "Session Closed",
        "POS session has been successfully closed."
      )
      // Invalidate and refetch session data
      queryClient.invalidateQueries({ queryKey: ["currentSession", terminalId] })
    },
    onError: (error: Error) => {
      notifications.error(
        "Failed to Close Session",
        error.message
      )
    },
  })

  return {
    currentSession: currentSession?.data,
    sessionLoading,
    sessionError,
    openSession: openSessionMutation.mutate,
    closeSession: closeSessionMutation.mutate,
    isOpeningSession: openSessionMutation.isPending,
    isClosingSession: closeSessionMutation.isPending,
  }
}
