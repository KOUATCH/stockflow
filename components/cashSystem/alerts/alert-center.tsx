"use client"

import { useState } from "react"
//  "
// import type { Alert } from "@/hooks/use-real-time-tracking"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellRing,
  Check,
  Clock,
  DollarSign,
  Filter,
  Info,
  Package,
  Settings,
} from "lucide-react"
// Extend the tracking alert type with the legacy display fields used here.
import {
  type Alert as TrackingAlert,
  useLowStockMonitoring,
  useRealTimeBalanceTracking,
  useSessionTimeoutMonitoring,
} from "@/hooks/cashDrawer/use-real-time-tracking"

type Alert = TrackingAlert & {
  isRead?: boolean
  isAcknowledged?: boolean
  createdAt: Date
  acknowledgedBy?: string
}

interface AlertCenterProps {
  terminalId?: string
  sessionId?: string
  locationId?: string
  organizationId?: string
}

export function AlertCenter({ terminalId, sessionId, locationId, organizationId }: AlertCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [filterType, setFilterType] = useState<string>("all")

  // Real-time tracking hooks
  const { realTimeState, alerts, acknowledgeAlert, clearAlerts } = useRealTimeBalanceTracking(terminalId, sessionId)
  const { lowStockItems, lowStockCount } = useLowStockMonitoring(locationId, organizationId)
  const { isApproachingTimeout, sessionDurationHours } = useSessionTimeoutMonitoring(sessionId)

  // Combine all alerts
  const trackedAlerts: Alert[] = alerts.map((alert) => ({
    ...alert,
    isRead: false,
    isAcknowledged: alert.acknowledged,
    createdAt: alert.timestamp,
  }))

  const allAlerts: Alert[] = [
    ...trackedAlerts,
    // Add low stock alerts
    ...(lowStockCount > 0
      ? [
        {
          id: "low_stock_alert",
          type: "low_stock" as const,
          severity: "medium" as const,
          title: "Low Stock Alert",
          message: `${lowStockCount} item(s) are running low on stock`,
          timestamp: new Date(),
          acknowledged: false,
          isRead: false,
          isAcknowledged: false,
          createdAt: new Date(),
          data: { count: lowStockCount, items: lowStockItems },
        },
      ]
      : []),
    // Add session timeout alerts
    ...(isApproachingTimeout
      ? [
        {
          id: "session_timeout_alert",
          type: "session_timeout" as const,
          severity: "high" as const,
          title: "Session Timeout Warning",
          message: `Session has been active for ${sessionDurationHours.toFixed(1)} hours`,
          timestamp: new Date(),
          acknowledged: false,
          isRead: false,
          isAcknowledged: false,
          createdAt: new Date(),
          data: { sessionDurationHours },
        },
      ]
      : []),
  ]

  const filteredAlerts = filterType === "all" ? allAlerts : allAlerts.filter((alert) => alert.type === filterType)
  const unacknowledgedCount = allAlerts.filter((alert) => !alert.acknowledged).length

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "low":
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "variance":
        return <DollarSign className="h-4 w-4" />
      case "low_stock":
        return <Package className="h-4 w-4" />
      case "session_timeout":
        return <Clock className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative bg-transparent">
            {unacknowledgedCount > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {unacknowledgedCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                {unacknowledgedCount > 99 ? "99+" : unacknowledgedCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Alerts & Notifications</span>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {allAlerts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2 p-2">
                {allAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${alert.acknowledged ? "opacity-60" : ""
                      }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{alert.title}</p>
                          <Badge variant="outline" className={`text-xs ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{format(alert.timestamp, "MMM dd, HH:mm")}</p>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            acknowledgeAlert(alert.id)
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {allAlerts.length > 5 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsOpen(true)}>View all alerts ({allAlerts.length})</DropdownMenuItem>
            </>
          )}

          {allAlerts.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearAlerts}>Clear all alerts</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && getSeverityIcon(selectedAlert.severity)}
              {selectedAlert?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedAlert && format(selectedAlert.createdAt, "MMM dd, yyyy HH:mm:ss")}
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getSeverityColor(selectedAlert.severity)}>
                  {selectedAlert.severity}
                </Badge>
                <Badge variant="outline">{selectedAlert.type.replace("_", " ")}</Badge>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm">{selectedAlert.message}</p>
              </div>

              {selectedAlert.data && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Additional Details:</h4>
                  <div className="p-3 rounded-lg bg-muted/30 font-mono text-xs">
                    <pre>{JSON.stringify(selectedAlert.data, null, 2)}</pre>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setSelectedAlert(null)}>
                  Close
                </Button>
                {!selectedAlert?.acknowledgedBy && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      acknowledgeAlert(selectedAlert.id)
                      setSelectedAlert(null)
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Acknowledge
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Alert Center Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert Center
            </DialogTitle>
            <DialogDescription>Monitor and manage system alerts and notifications</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-1">
                {["all", "variance", "low_stock", "session_timeout", "system"].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type === "all" ? "All" : type.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>

            {/* Alerts List */}
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No alerts found</p>
                    <p className="text-sm">Alerts will appear here when system events occur</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <Card key={alert.id} className={alert.acknowledged ? "opacity-60" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">{getTypeIcon(alert.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{alert.title}</h4>
                                <Badge variant="outline" className={`text-xs ${getSeverityColor(alert.severity)}`}>
                                  {alert.severity}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {alert.type.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(alert.timestamp, "MMM dd, yyyy HH:mm:ss")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {!alert.acknowledged && (
                              <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setSelectedAlert(alert)}>
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={clearAlerts}>
                Clear All Alerts
              </Button>
              <Button onClick={() => setIsOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
