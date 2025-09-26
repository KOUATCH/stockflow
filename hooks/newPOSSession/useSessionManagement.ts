"use client"

import { closePOSSession, getCurrentSession, openPOSSession } from "@/actions/newPOSSession/pos/session-actions"
import { useToast } from "@/hooks/use-toast"
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
  const { toast } = useToast()
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
      toast({
        title: "Session Opened",
        description: "POS session has been successfully opened.",
      })
      // Invalidate and refetch session data
      queryClient.invalidateQueries({ queryKey: ["currentSession", terminalId] })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Open Session",
        description: error.message,
      })
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
      toast({
        title: "Session Closed",
        description: "POS session has been successfully closed.",
      })
      // Invalidate and refetch session data
      queryClient.invalidateQueries({ queryKey: ["currentSession", terminalId] })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Close Session",
        description: error.message,
      })
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
