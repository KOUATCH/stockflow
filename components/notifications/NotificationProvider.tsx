"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { NotificationData, NotificationSystem } from "./NotificationSystem"

interface NotificationContextType {
  notifications: NotificationData[]
  soundEnabled: boolean
  addNotification: (notification: Omit<NotificationData, "id">) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  toggleSound: () => void
  // Convenience methods
  success: (title: string, message: string, options?: Partial<NotificationData>) => string
  error: (title: string, message: string, options?: Partial<NotificationData>) => string
  warning: (title: string, message: string, options?: Partial<NotificationData>) => string
  info: (title: string, message: string, options?: Partial<NotificationData>) => string
  // Enhanced methods for forms and operations
  formSuccess: (operation: string, details?: string) => string
  formError: (operation: string, error: string, details?: string) => string
  operationStart: (operation: string) => string
  operationComplete: (operation: string, result?: string) => string
  cashOperation: (type: "add" | "remove", amount: number, drawer: string) => string
  reconciliationResult: (variance: number, drawer: string) => string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
  maxNotifications?: number
  defaultSoundEnabled?: boolean
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
  defaultSoundEnabled = true
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [soundEnabled, setSoundEnabled] = useState(defaultSoundEnabled)
  const notificationCounter = useRef(0)

  // Load sound preference from localStorage
  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem("notification-sound-enabled")
    if (savedSoundEnabled !== null) {
      setSoundEnabled(JSON.parse(savedSoundEnabled))
    }
  }, [])

  // Save sound preference to localStorage
  useEffect(() => {
    localStorage.setItem("notification-sound-enabled", JSON.stringify(soundEnabled))
  }, [soundEnabled])

  const addNotification = useCallback((notification: Omit<NotificationData, "id">) => {
    const id = `notification-${Date.now()}-${++notificationCounter.current}`
    const newNotification: NotificationData = {
      id,
      sound: true,
      duration: 5000,
      priority: "normal",
      ...notification,
    }

    setNotifications((prev) => {
      const updated = [...prev, newNotification]
      // Keep only the most recent notifications
      if (updated.length > maxNotifications) {
        return updated.slice(-maxNotifications)
      }
      return updated
    })

    return id
  }, [maxNotifications])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev)
  }, [])

  // Convenience methods for different notification types
  const success = useCallback(
    (title: string, message: string, options?: Partial<NotificationData>) => {
      return addNotification({
        type: "success",
        title,
        message,
        priority: "normal",
        category: "general",
        ...options
      })
    },
    [addNotification],
  )

  const error = useCallback(
    (title: string, message: string, options?: Partial<NotificationData>) => {
      return addNotification({
        type: "error",
        title,
        message,
        priority: "high",
        category: "error",
        duration: 8000, // Errors stay longer
        ...options
      })
    },
    [addNotification],
  )

  const warning = useCallback(
    (title: string, message: string, options?: Partial<NotificationData>) => {
      return addNotification({
        type: "warning",
        title,
        message,
        priority: "normal",
        category: "warning",
        duration: 6000,
        ...options
      })
    },
    [addNotification],
  )

  const info = useCallback(
    (title: string, message: string, options?: Partial<NotificationData>) => {
      return addNotification({
        type: "info",
        title,
        message,
        priority: "low",
        category: "info",
        ...options
      })
    },
    [addNotification],
  )

  // Enhanced methods for forms and operations
  const formSuccess = useCallback(
    (operation: string, details?: string) => {
      return success(
        `${operation} Successful`,
        details || `${operation} has been completed successfully`,
        {
          category: "form",
          action: {
            label: "View Details",
            onClick: () => console.log(`${operation} completed`)
          }
        }
      )
    },
    [success]
  )

  const formError = useCallback(
    (operation: string, error: string, details?: string) => {
      return addNotification({
        type: "error",
        title: `${operation} Failed`,
        message: details || error,
        priority: "high",
        category: "form",
        duration: 10000,
        action: {
          label: "Try Again",
          onClick: () => console.log(`Retry ${operation}`)
        }
      })
    },
    [addNotification]
  )

  const operationStart = useCallback(
    (operation: string) => {
      return info(
        `${operation} Started`,
        `${operation} is now in progress...`,
        {
          category: "operation",
          duration: 3000,
          showProgress: true
        }
      )
    },
    [info]
  )

  const operationComplete = useCallback(
    (operation: string, result?: string) => {
      return success(
        `${operation} Complete`,
        result || `${operation} has been completed successfully`,
        {
          category: "operation",
          priority: "normal"
        }
      )
    },
    [success]
  )

  const cashOperation = useCallback(
    (type: "add" | "remove", amount: number, drawer: string) => {
      const operation = type === "add" ? "Cash Added" : "Cash Removed"
      const actionText = type === "add" ? "added to" : "removed from"

      return success(
        operation,
        `$${amount.toFixed(2)} has been ${actionText} ${drawer}`,
        {
          category: "cash",
          priority: "normal",
          action: {
            label: "View Transaction",
            onClick: () => console.log(`View cash ${type} transaction`)
          }
        }
      )
    },
    [success]
  )

  const reconciliationResult = useCallback(
    (variance: number, drawer: string) => {
      if (variance === 0) {
        return success(
          "Perfect Reconciliation",
          `${drawer} has been reconciled with no variance`,
          {
            category: "reconciliation",
            priority: "normal"
          }
        )
      } else if (Math.abs(variance) <= 10) {
        return warning(
          "Minor Variance Detected",
          `${drawer} has a variance of $${Math.abs(variance).toFixed(2)} ${variance > 0 ? "(overage)" : "(shortage)"}`,
          {
            category: "reconciliation",
            priority: "normal",
            action: {
              label: "Review Details",
              onClick: () => console.log("Review reconciliation details")
            }
          }
        )
      } else {
        return error(
          "Significant Variance",
          `${drawer} has a ${variance > 0 ? "overage" : "shortage"} of $${Math.abs(variance).toFixed(2)}`,
          {
            category: "reconciliation",
            priority: "high",
            action: {
              label: "Investigate",
              onClick: () => console.log("Investigate variance")
            }
          }
        )
      }
    },
    [success, warning, error]
  )

  const contextValue: NotificationContextType = {
    notifications,
    soundEnabled,
    addNotification,
    removeNotification,
    clearAll,
    toggleSound,
    success,
    error,
    warning,
    info,
    formSuccess,
    formError,
    operationStart,
    operationComplete,
    cashOperation,
    reconciliationResult,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />
    </NotificationContext.Provider>
  )
}