"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, AlertTriangle, Bell, CheckCircle, Clock, ExternalLink, Wifi, WifiOff, X } from "lucide-react"
import { useEffect, useState } from "react"

interface Alert {
  id: string
  type: "info" | "warning" | "error" | "success"
  message: string
  timestamp: Date
  action?: {
    label: string
    onClick: () => void
  }
}

interface RealTimeStatusBarProps {
  terminalId: string
  sessionId: string
  locationId: string
  organizationId: string
}

export function RealTimeStatusBar({ terminalId, sessionId, locationId, organizationId }: RealTimeStatusBarProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState(new Date())

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random alerts for demo
      if (Math.random() > 0.95) {
        const alertTypes = ["info", "warning", "success"] as const
        const messages = [
          "Cash drawer balance updated",
          "Low stock alert: Coffee Beans (5 remaining)",
          "Transaction completed successfully",
          "Network connection restored",
          "Daily backup completed",
        ]

        const newAlert: Alert = {
          id: Date.now().toString(),
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date(),
          action:
            Math.random() > 0.7
              ? {
                label: "View Details",
                onClick: () => console.log("Alert action clicked"),
              }
              : undefined,
        }

        setAlerts((prev) => [newAlert, ...prev.slice(0, 4)])
      }

      setLastSync(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Simulate network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4" />
      case "warning":
        return <AlertTriangle className="w-4 h-4" />
      case "success":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "error":
        return "bg-destructive/10 border-destructive/20 text-destructive"
      case "warning":
        return "bg-accent/10 border-accent/20 text-accent-foreground"
      case "success":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
      default:
        return "bg-primary/10 border-primary/20 text-primary"
    }
  }

  return (
    <div className="bg-muted/30 border-b border-border">
      {/* System Status Bar */}
      <div className="px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-destructive" />
                  <span className="text-destructive font-medium">Offline</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last sync: {lastSync.toLocaleTimeString()}</span>
            </div>

            {sessionId && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Session Active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => window.open("/system-status", "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              System Status
            </Button>

            {alerts.length > 0 && (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                <Bell className="w-3 h-3 mr-1" />
                {alerts.length}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="px-6 py-2 space-y-2">
          <div className="max-w-7xl mx-auto">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getAlertStyles(alert.type)}`}
              >
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs opacity-75">{alert.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {alert.action && (
                    <Button variant="ghost" size="sm" onClick={alert.action.onClick} className="text-xs h-7">
                      {alert.action.label}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-7 w-7 p-0 opacity-70 hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
