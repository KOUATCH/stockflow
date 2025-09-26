import {
  closePosSession,
  getActiveSession,
  openPosSession,
  resumeSession,
  suspendSession,
  type CloseSessionData,
  type OpenSessionData,
} from "@/actions/posStation/pos-session-actions"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, CheckCircle, Clock, DollarSign, Store, XCircle } from "lucide-react"

export function useActiveSession(terminalId: string) {
  return useQuery({
    queryKey: ["active-session", terminalId],
    queryFn: () => getActiveSession(terminalId),
    enabled: !!terminalId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}

export function useOpenSession() {
  const queryClient = useQueryClient()
  const { addToast, updateToast } = useNotificationStore()

  return useMutation({
    mutationFn: async (data: OpenSessionData) => {
      // Show loading toast
      const loadingToastId = addToast({
        type: "loading",
        title: "Opening POS Session",
        description: `Initializing terminal with $${data.openingBalance.toFixed(2)} opening balance...`,
        icon: <Clock className="h-4 w-4" />,
        persistent: true,
      })

      try {
        const result = await openPosSession(data)

        // Update loading toast based on result
        if (result.success) {
          updateToast(loadingToastId, {
            type: "success",
            title: "Session Opened Successfully!",
            description: result.message || "POS session is now active",
            icon: <Store className="h-4 w-4" />,
            persistent: false,
            duration: 5000,
          })
        } else {
          updateToast(loadingToastId, {
            type: "error",
            title: "Failed to Open Session",
            description: result.error || "Unknown error occurred",
            icon: <XCircle className="h-4 w-4" />,
            persistent: false,
            duration: 6000,
            action:
              result.code === "SESSION_ALREADY_ACTIVE"
                ? {
                  label: "View Session",
                  onClick: () => console.log("Navigate to session"),
                }
                : undefined,
          })
        }

        return result
      } catch (error) {
        updateToast(loadingToastId, {
          type: "error",
          title: "Session Opening Failed",
          description: "Network error or server unavailable",
          icon: <XCircle className="h-4 w-4" />,
          persistent: false,
          duration: 6000,
        })
        throw error
      }
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate and refetch session queries
        queryClient.invalidateQueries({ queryKey: ["active-session", variables.terminalId] })
        queryClient.invalidateQueries({ queryKey: ["pos-sessions"] })
        queryClient.invalidateQueries({ queryKey: ["cash-drawer"] })
      }
    },
  })
}

export function useCloseSession() {
  const queryClient = useQueryClient()
  const { addToast, updateToast } = useNotificationStore()

  return useMutation({
    mutationFn: async (data: CloseSessionData) => {
      // Show loading toast
      const loadingToastId = addToast({
        type: "loading",
        title: "Closing POS Session",
        description: `Finalizing session with $${data.closingBalance.toFixed(2)} closing balance...`,
        icon: <Clock className="h-4 w-4" />,
        persistent: true,
      })

      try {
        const result = await closePosSession(data)

        if (result.success) {
          const variance = result.data?.summary.variance || 0
          const isBalanced = Math.abs(variance) < 0.01

          updateToast(loadingToastId, {
            type: isBalanced ? "success" : "warning",
            title: "Session Closed Successfully!",
            description: result.message || "Session has been finalized",
            icon: isBalanced ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />,
            persistent: false,
            duration: 8000,
            action: {
              label: "View Summary",
              onClick: () => console.log("Show session summary", result.data?.summary),
            },
          })

          // Show additional summary toast
          if (result.data?.summary) {
            const summary = result.data.summary
            setTimeout(() => {
              addToast({
                type: "info",
                title: "Session Summary",
                description: `${summary.transactionCount} transactions • $${summary.totalSales.toFixed(2)} total sales`,
                icon: <DollarSign className="h-4 w-4" />,
                duration: 6000,
              })
            }, 1000)
          }
        } else {
          updateToast(loadingToastId, {
            type: "error",
            title: "Failed to Close Session",
            description: result.error || "Unknown error occurred",
            icon: <XCircle className="h-4 w-4" />,
            persistent: false,
            duration: 6000,
          })
        }

        return result
      } catch (error) {
        updateToast(loadingToastId, {
          type: "error",
          title: "Session Closing Failed",
          description: "Network error or server unavailable",
          icon: <XCircle className="h-4 w-4" />,
          persistent: false,
          duration: 6000,
        })
        throw error
      }
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["active-session"] })
        queryClient.invalidateQueries({ queryKey: ["pos-sessions"] })
        queryClient.invalidateQueries({ queryKey: ["cash-drawer"] })
        queryClient.invalidateQueries({ queryKey: ["session-summary"] })
      }
    },
  })
}

export function useSuspendSession() {
  const queryClient = useQueryClient()
  const { addToast } = useNotificationStore()

  return useMutation({
    mutationFn: async ({ sessionId, userId, reason }: { sessionId: string; userId: string; reason?: string }) => {
      return suspendSession(sessionId, userId, reason)
    },
    onSuccess: (result) => {
      if (result.success) {
        addToast({
          type: "warning",
          title: "Session Suspended",
          description: result.message || "Session has been suspended",
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 4000,
        })
        queryClient.invalidateQueries({ queryKey: ["active-session"] })
      } else {
        addToast({
          type: "error",
          title: "Failed to Suspend Session",
          description: result.error || "Unknown error occurred",
          icon: <XCircle className="h-4 w-4" />,
          duration: 5000,
        })
      }
    },
  })
}

export function useResumeSession() {
  const queryClient = useQueryClient()
  const { addToast } = useNotificationStore()

  return useMutation({
    mutationFn: async ({ sessionId, userId }: { sessionId: string; userId: string }) => {
      return resumeSession(sessionId, userId)
    },
    onSuccess: (result) => {
      if (result.success) {
        addToast({
          type: "success",
          title: "Session Resumed",
          description: result.message || "Session is now active",
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 4000,
        })
        queryClient.invalidateQueries({ queryKey: ["active-session"] })
      } else {
        addToast({
          type: "error",
          title: "Failed to Resume Session",
          description: result.error || "Unknown error occurred",
          icon: <XCircle className="h-4 w-4" />,
          duration: 5000,
        })
      }
    },
  })
}
