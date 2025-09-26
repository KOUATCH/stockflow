"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertTriangle, Bell, CheckCircle, Info, X } from "lucide-react"

interface Alert {
  id: string
  title: string
  message: string
  severity: "low" | "medium" | "high" | "critical"
  timestamp: Date
  actionRequired: boolean
  dismissed: boolean
}

interface AlertCenterProps {
  terminalId: string
  sessionId: string
  locationId: string
  organizationId: string
}

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    title: "Low Stock Warning",
    message: "Coffee Beans inventory is running low (5 units remaining)",
    severity: "medium",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    actionRequired: true,
    dismissed: false,
  },
  {
    id: "alert-2",
    title: "Cash Drawer Variance",
    message: "Cash drawer has a variance of $2.50",
    severity: "low",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    actionRequired: false,
    dismissed: false,
  },
]

export function AlertCenter({ terminalId, sessionId, locationId, organizationId }: AlertCenterProps) {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [isOpen, setIsOpen] = useState(false)

  const activeAlerts = alerts.filter((alert) => !alert.dismissed)
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === "critical")
  const highAlerts = activeAlerts.filter((alert) => alert.severity === "high")

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, dismissed: true } : alert)))
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
      case "high":
        return <AlertTriangle className="w-4 h-4" />
      case "medium":
        return <Info className="w-4 h-4" />
      case "low":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative bg-transparent">
          <Bell className="w-4 h-4" />
          {activeAlerts.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeAlerts.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>System Alerts</span>
          {activeAlerts.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {activeAlerts.length} active
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {activeAlerts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active alerts</p>
            <p className="text-xs">System is running smoothly</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {activeAlerts.map((alert) => (
              <DropdownMenuItem key={alert.id} className="p-0">
                <div className={`w-full p-3 border-l-4 ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">{alert.timestamp.toLocaleTimeString()}</span>
                          {alert.actionRequired && (
                            <Badge variant="outline" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        dismissAlert(alert.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {activeAlerts.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <Button variant="ghost" size="sm" className="text-xs">
                View All Alerts
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
