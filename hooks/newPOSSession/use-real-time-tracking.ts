"use client"

import { getCashDrawerSummary, getCurrentSession } from "@/actions/newPOSSession/cash-drawer/cash-drawer-actions"
import { useInventorySummary, useLowStockItems } from "@/hooks/newPOSSession/use-items-with-inventory"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useState } from "react"

export interface Alert {
  id: string
  type:
    | "variance"
    | "low_stock"
    | "session_timeout"
    | "system"
    | "error"
    | "inventory_critical"
    | "payment_failure"
    | "security"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  message: string
  timestamp: Date
  acknowledged: boolean
  data?: any
  category?: "cash_drawer" | "inventory" | "session" | "system" | "security"
  actionRequired?: boolean
  autoResolve?: boolean
}

export interface RealTimeState {
  currentBalance: number
  expectedBalance: number
  variance: number
  lastUpdate: Date
  isOnline: boolean
  alerts: Alert[]
  systemHealth: "excellent" | "good" | "warning" | "critical"
  activeTransactions: number
  sessionDuration: number
}

export interface SystemMetrics {
  totalSessions: number
  activeSessions: number
  totalVariance: number
  averageVariance: number
  lowStockItems: number
  criticalStockItems: number
  systemUptime: number
  lastBackup?: Date
}

// Enhanced real-time balance tracking hook
export function useRealTimeBalanceTracking(
  terminalId: string | undefined,
  sessionId: string | undefined,
  options: {
    pollingInterval?: number
    varianceThreshold?: number
    criticalVarianceThreshold?: number
    enabled?: boolean
    enableAudioAlerts?: boolean
  } = {},
) {
  const {
    pollingInterval = 15000, // More frequent updates
    varianceThreshold = 5,
    criticalVarianceThreshold = 20,
    enabled = true,
    enableAudioAlerts = true,
  } = options

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [lastVariance, setLastVariance] = useState<number>(0)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalSessions: 0,
    activeSessions: 0,
    totalVariance: 0,
    averageVariance: 0,
    lowStockItems: 0,
    criticalStockItems: 0,
    systemUptime: 0,
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Get current session with enhanced error handling
  const { data: session, error: sessionError } = useQuery({
    queryKey: ["current-session", terminalId],
    queryFn: () => getCurrentSession(terminalId!),
    enabled: Boolean(terminalId && enabled),
    refetchInterval: pollingInterval,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Get cash drawer summary with enhanced error handling
  const { data: summary, error: summaryError } = useQuery({
    queryKey: ["cash-drawer-summary", sessionId],
    queryFn: () => getCashDrawerSummary(sessionId!),
    enabled: Boolean(sessionId && enabled),
    refetchInterval: pollingInterval,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const addAlert = useCallback(
    (alert: Omit<Alert, "id" | "timestamp" | "acknowledged">) => {
      const newAlert: Alert = {
        ...alert,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        acknowledged: false,
        category: alert.category || "system",
        actionRequired: alert.actionRequired || false,
        autoResolve: alert.autoResolve || false,
      }

      setAlerts((prev) => {
        // Prevent duplicate alerts of the same type within 5 minutes
        const recentSimilar = prev.find(
          (existingAlert) =>
            existingAlert.type === alert.type &&
            existingAlert.severity === alert.severity &&
            new Date().getTime() - existingAlert.timestamp.getTime() < 5 * 60 * 1000,
        )

        if (recentSimilar) return prev

        return [newAlert, ...prev.slice(0, 99)] // Keep last 100 alerts
      })

      // Enhanced toast notification with action buttons
      toast({
        variant: alert.severity === "critical" || alert.severity === "high" ? "destructive" : "default",
        title: alert.title,
        description: alert.message,
        duration: alert.severity === "critical" ? 0 : 5000, // Critical alerts don't auto-dismiss
      })

      // Audio alert for critical issues
      if (enableAudioAlerts && (alert.severity === "critical" || alert.severity === "high")) {
        try {
          const audio = new Audio("/alert-sound.mp3") // You'd need to add this file
          audio.volume = 0.3
          audio.play().catch(() => {
            // Fallback to system beep if audio file not available
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance("Alert")
              utterance.volume = 0.1
              utterance.rate = 2
              speechSynthesis.speak(utterance)
            }
          })
        } catch (error) {
          console.warn("Audio alert failed:", error)
        }
      }

      return newAlert.id
    },
    [toast, enableAudioAlerts],
  )

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  useEffect(() => {
    if (summary && summary.variance !== undefined) {
      const currentVariance = Math.abs(summary.variance)
      const varianceIncrease = currentVariance - Math.abs(lastVariance)

      // Critical variance alert
      if (currentVariance > criticalVarianceThreshold) {
        addAlert({
          type: "variance",
          severity: "critical",
          title: "Critical Cash Drawer Variance",
          message: `URGENT: Cash drawer variance of $${summary.variance.toFixed(2)} requires immediate attention. Expected: $${summary.expectedBalance.toFixed(2)}, Current: $${summary.currentBalance.toFixed(2)}`,
          category: "cash_drawer",
          actionRequired: true,
          data: {
            variance: summary.variance,
            expectedBalance: summary.expectedBalance,
            currentBalance: summary.currentBalance,
            threshold: criticalVarianceThreshold,
          },
        })
      }
      // High variance alert
      else if (currentVariance > varianceThreshold && varianceIncrease > 2) {
        addAlert({
          type: "variance",
          severity: currentVariance > 10 ? "high" : "medium",
          title: "Cash Drawer Variance Detected",
          message: `Cash drawer variance of $${summary.variance.toFixed(2)} detected. Please verify cash counts and recent transactions.`,
          category: "cash_drawer",
          actionRequired: currentVariance > 10,
          data: {
            variance: summary.variance,
            expectedBalance: summary.expectedBalance,
            currentBalance: summary.currentBalance,
            increase: varianceIncrease,
          },
        })
      }

      setLastVariance(summary.variance)
    }
  }, [summary, lastVariance, varianceThreshold, criticalVarianceThreshold, addAlert])

  useEffect(() => {
    if (sessionError || summaryError) {
      addAlert({
        type: "system",
        severity: "high",
        title: "System Connection Error",
        message: "Unable to connect to cash drawer system. Please check your connection.",
        category: "system",
        actionRequired: true,
        data: {
          sessionError: sessionError?.message,
          summaryError: summaryError?.message,
        },
      })
    }
  }, [sessionError, summaryError, addAlert])

  useEffect(() => {
    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.autoResolve && alert.type === "variance" && summary) {
          const currentVariance = Math.abs(summary.variance)
          if (currentVariance < varianceThreshold) {
            return { ...alert, acknowledged: true }
          }
        }
        return alert
      }),
    )
  }, [summary, varianceThreshold])

  // Calculate system health
  const getSystemHealth = (): "excellent" | "good" | "warning" | "critical" => {
    const currentVariance = Math.abs(summary?.variance || 0)
    const unacknowledgedCritical = alerts.filter((a) => !a.acknowledged && a.severity === "critical").length
    const unacknowledgedHigh = alerts.filter((a) => !a.acknowledged && a.severity === "high").length

    if (unacknowledgedCritical > 0 || currentVariance > criticalVarianceThreshold) return "critical"
    if (unacknowledgedHigh > 0 || currentVariance > varianceThreshold) return "warning"
    if (alerts.filter((a) => !a.acknowledged).length > 5) return "good"
    return "excellent"
  }

  const realTimeState: RealTimeState = {
    currentBalance: summary?.currentBalance || 0,
    expectedBalance: summary?.expectedBalance || 0,
    variance: summary?.variance || 0,
    lastUpdate: new Date(),
    isOnline: !sessionError && !summaryError,
    alerts: alerts.filter((alert) => !alert.acknowledged),
    systemHealth: getSystemHealth(),
    activeTransactions: 0, // This would come from real transaction monitoring
    sessionDuration: session ? (new Date().getTime() - new Date(session.openedAt).getTime()) / (1000 * 60 * 60) : 0,
  }

  return {
    realTimeState,
    alerts,
    systemMetrics,
    addAlert,
    acknowledgeAlert,
    clearAlerts,
    session,
    summary,
  }
}

export function useLowStockMonitoring(
  locationId: string | undefined,
  organizationId: string | undefined,
  options: {
    pollingInterval?: number
    lowStockThreshold?: number
    criticalStockThreshold?: number
    enabled?: boolean
  } = {},
) {
  const { pollingInterval = 60000, lowStockThreshold = 10, criticalStockThreshold = 2, enabled = true } = options
  const [previousLowStockCount, setPreviousLowStockCount] = useState<number>(0)
  const [previousCriticalStockCount, setPreviousCriticalStockCount] = useState<number>(0)
  const { toast } = useToast()

  const { data: lowStockItems } = useLowStockItems(locationId, organizationId, {
    enabled: Boolean(locationId && organizationId && enabled),
    refetchInterval: pollingInterval,
  })

  const { data: inventorySummary } = useInventorySummary(locationId, organizationId, {
    enabled: Boolean(locationId && organizationId && enabled),
    refetchInterval: pollingInterval,
  })

  useEffect(() => {
    if (lowStockItems) {
      const criticalStockItems = lowStockItems.filter(
        (item) => item.inventoryLevel && item.inventoryLevel.quantityOnHand <= criticalStockThreshold,
      )

      const newCriticalItems = criticalStockItems.length - previousCriticalStockCount
      const newLowStockItems = lowStockItems.length - previousLowStockCount

      // Critical stock alert
      if (newCriticalItems > 0) {
        toast({
          variant: "destructive",
          title: "Critical Stock Alert",
          description: `${newCriticalItems} item(s) are critically low on stock (≤${criticalStockThreshold} units)`,
          duration: 0, // Don't auto-dismiss critical alerts
        })
      }
      // Low stock alert
      else if (newLowStockItems > 0) {
        toast({
          title: "Low Stock Alert",
          description: `${newLowStockItems} item(s) are running low on stock`,
        })
      }

      setPreviousLowStockCount(lowStockItems.length)
      setPreviousCriticalStockCount(criticalStockItems.length)
    }
  }, [lowStockItems, previousLowStockCount, previousCriticalStockCount, criticalStockThreshold, toast])

  return {
    lowStockItems: lowStockItems || [],
    criticalStockItems:
      lowStockItems?.filter(
        (item) => item.inventoryLevel && item.inventoryLevel.quantityOnHand <= criticalStockThreshold,
      ) || [],
    inventorySummary,
    lowStockCount: lowStockItems?.length || 0,
    criticalStockCount:
      lowStockItems?.filter(
        (item) => item.inventoryLevel && item.inventoryLevel.quantityOnHand <= criticalStockThreshold,
      ).length || 0,
  }
}

export function useSessionTimeoutMonitoring(
  sessionId: string | undefined,
  options: {
    warningIntervals?: number[] // Hours before timeout to show warnings
    maxSessionHours?: number
    enabled?: boolean
  } = {},
) {
  const { warningIntervals = [1, 0.5, 0.25], maxSessionHours = 12, enabled = true } = options
  const [warningsShown, setWarningsShown] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const { data: session } = useQuery({
    queryKey: ["session-timeout", sessionId],
    queryFn: () => getCurrentSession(""), // This would need proper implementation
    enabled: Boolean(sessionId && enabled),
    refetchInterval: 60000, // Check every minute
  })

  useEffect(() => {
    if (session && session.status === "active") {
      const sessionStart = new Date(session.openedAt)
      const now = new Date()
      const sessionDurationHours = (now.getTime() - sessionStart.getTime()) / (1000 * 60 * 60)

      // Check each warning interval
      warningIntervals.forEach((warningHours) => {
        const warningThreshold = maxSessionHours - warningHours

        if (sessionDurationHours >= warningThreshold && !warningsShown.has(warningHours)) {
          const severity = warningHours <= 0.25 ? "critical" : warningHours <= 0.5 ? "high" : "medium"

          toast({
            variant: severity === "critical" ? "destructive" : "default",
            title: "Session Timeout Warning",
            description: `Your session has been active for ${sessionDurationHours.toFixed(1)} hours. ${warningHours <= 0.25 ? "URGENT: " : ""}Please consider closing and reconciling ${warningHours <= 0.5 ? "immediately" : "soon"}.`,
            duration: severity === "critical" ? 0 : 8000,
          })

          setWarningsShown((prev) => new Set([...prev, warningHours]))
        }
      })

      // Reset warnings if session duration decreases (new session)
      if (sessionDurationHours < maxSessionHours - Math.max(...warningIntervals)) {
        setWarningsShown(new Set())
      }
    }
  }, [session, maxSessionHours, warningIntervals, warningsShown, toast])

  return {
    session,
    sessionDurationHours: session
      ? (new Date().getTime() - new Date(session.openedAt).getTime()) / (1000 * 60 * 60)
      : 0,
    isApproachingTimeout: session
      ? (new Date().getTime() - new Date(session.openedAt).getTime()) / (1000 * 60 * 60) >=
        maxSessionHours - Math.min(...warningIntervals)
      : false,
    timeUntilTimeout: session
      ? Math.max(0, maxSessionHours - (new Date().getTime() - new Date(session.openedAt).getTime()) / (1000 * 60 * 60))
      : 0,
  }
}

export function useSystemMonitoring(
  organizationId: string | undefined,
  locationId: string | undefined,
  options: {
    pollingInterval?: number
    enabled?: boolean
  } = {},
) {
  const { pollingInterval = 30000, enabled = true } = options
  const [systemAlerts, setSystemAlerts] = useState<Alert[]>([])
  const { toast } = useToast()

  // Monitor overall system health
  const { data: systemMetrics } = useQuery({
    queryKey: ["system-metrics", organizationId, locationId],
    queryFn: async () => {
      // This would fetch comprehensive system metrics
      return {
        totalSessions: 0,
        activeSessions: 0,
        totalVariance: 0,
        averageVariance: 0,
        lowStockItems: 0,
        criticalStockItems: 0,
        systemUptime: Date.now() - (Date.now() - 24 * 60 * 60 * 1000), // Mock 24h uptime
        lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000), // Mock 6h ago
      }
    },
    enabled: Boolean(organizationId && locationId && enabled),
    refetchInterval: pollingInterval,
  })

  return {
    systemMetrics,
    systemAlerts,
    systemHealth: "excellent" as const,
  }
}
