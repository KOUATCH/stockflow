"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useLowStockMonitoring, useRealTimeBalanceTracking, useSystemMonitoring } from "@/hooks/cashDrawer/use-real-time-tracking"
import { format } from "date-fns"
import { Activity, AlertTriangle, CheckCircle, Clock, DollarSign, Package, Shield, Wifi, WifiOff } from "lucide-react"

interface RealTimeStatusBarProps {
  terminalId?: string
  sessionId?: string
  locationId?: string
  organizationId?: string
  compact?: boolean
}

export function RealTimeStatusBar({
  terminalId,
  sessionId,
  locationId,
  organizationId,
  compact = false,
}: RealTimeStatusBarProps) {
  const { realTimeState, session } = useRealTimeBalanceTracking(terminalId, sessionId)
  const { lowStockCount, inventorySummary } = useLowStockMonitoring(locationId, organizationId)
  const outOfStockCount = inventorySummary?.outOfStockCount ?? 0
  const { systemMetrics, systemHealth } = useSystemMonitoring(organizationId, locationId)

  const variancePercentage =
    realTimeState.expectedBalance > 0 ? Math.abs(realTimeState.variance / realTimeState.expectedBalance) * 100 : 0

  const getVarianceStatus = () => {
    const absVariance = Math.abs(realTimeState.variance)
    if (absVariance < 0.01)
      return { status: "perfect", color: "text-green-600", icon: CheckCircle, bgColor: "bg-green-50" }
    if (absVariance < 5)
      return { status: "good", color: "text-yellow-600", icon: AlertTriangle, bgColor: "bg-yellow-50" }
    if (absVariance < 20)
      return { status: "warning", color: "text-orange-600", icon: AlertTriangle, bgColor: "bg-orange-50" }
    return { status: "critical", color: "text-red-600", icon: AlertTriangle, bgColor: "bg-red-50" }
  }

  const getSystemHealthColor = () => {
    switch (realTimeState.systemHealth) {
      case "excellent":
        return "text-green-600 bg-green-50"
      case "good":
        return "text-blue-600 bg-blue-50"
      case "warning":
        return "text-yellow-600 bg-yellow-50"
      case "critical":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const varianceStatus = getVarianceStatus()
  const VarianceIcon = varianceStatus.icon

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-2 bg-muted/30 rounded-lg">
        {/* Connection Status */}
        <div className="flex items-center gap-1">
          {realTimeState.isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <span className="text-xs">{realTimeState.isOnline ? "Online" : "Offline"}</span>
        </div>

        {/* Balance & Variance */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">${realTimeState.currentBalance.toFixed(2)}</span>
          {Math.abs(realTimeState.variance) > 0.01 && (
            <Badge variant="outline" className={`text-xs ${varianceStatus.color}`}>
              {realTimeState.variance >= 0 ? "+" : ""}${realTimeState.variance.toFixed(2)}
            </Badge>
          )}
        </div>

        {/* Alerts */}
        {realTimeState.alerts.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {realTimeState.alerts.length} alert{realTimeState.alerts.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card
      className={`border-t-4 ${realTimeState.systemHealth === "excellent"
        ? "border-t-green-500"
        : realTimeState.systemHealth === "good"
          ? "border-t-blue-500"
          : realTimeState.systemHealth === "warning"
            ? "border-t-yellow-500"
            : "border-t-red-500"
        }`}
    >
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
          System Health
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${getSystemHealthColor()}`}>
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-medium capitalize">{realTimeState.systemHealth}</div>
              <div className="text-xs text-muted-foreground">System</div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {realTimeState.isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-xs font-medium">{realTimeState.isOnline ? "Online" : "Offline"}</span>
            </div>
            <div className="text-xs text-muted-foreground">{format(realTimeState.lastUpdate, "HH:mm:ss")}</div>
          </div>

          {/* Current Balance */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-sm font-medium">${realTimeState.currentBalance.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
          </div>

          {/* Expected Balance */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <div>
              <div className="text-sm font-medium">${realTimeState.expectedBalance.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Expected</div>
            </div>
          </div>

          {/* Variance */}
          <div className="flex items-center gap-2">
            <VarianceIcon className={`h-4 w-4 ${varianceStatus.color}`} />
            <div>
              <div className={`text-sm font-medium ${varianceStatus.color}`}>
                {realTimeState.variance >= 0 ? "+" : ""}${realTimeState.variance.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Variance</div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <Package
              className={`h-4 w-4 ${outOfStockCount > 0 ? "text-red-600" : lowStockCount > 0 ? "text-orange-600" : "text-green-600"
                }`}
            />
            <div>
              <div
                className={`text-sm font-medium ${outOfStockCount > 0 ? "text-red-600" : lowStockCount > 0 ? "text-orange-600" : "text-green-600"
                  }`}
              >
                {outOfStockCount > 0 ? outOfStockCount : lowStockCount}
              </div>
              <div className="text-xs text-muted-foreground">{outOfStockCount > 0 ? "Critical" : "Low Stock"}</div>
            </div>
          </div>

          {/* Session Duration */}
          {session && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm font-medium">{realTimeState.sessionDuration.toFixed(1)}h</div>
                <div className="text-xs text-muted-foreground">Session</div>
              </div>
            </div>
          )}

          {/* Active Alerts */}
          <div className="flex items-center gap-2">
            {realTimeState.alerts.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            ) : (
              <Shield className="h-4 w-4 text-green-600" />
            )}
            <div>
              <div
                className={`text-sm font-medium ${realTimeState.alerts.length > 0 ? "text-orange-600" : "text-green-600"
                  }`}
              >
                {realTimeState.alerts.length}
              </div>
              <div className="text-xs text-muted-foreground">Alerts</div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Indicators */}
        {(Math.abs(realTimeState.variance) > 0.01 || realTimeState.sessionDuration > 8) && (
          <div className="mt-4 space-y-2">
            {/* Variance Progress Bar */}
            {Math.abs(realTimeState.variance) > 0.01 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Variance Level</span>
                  <span className={varianceStatus.color}>{variancePercentage.toFixed(1)}% of expected balance</span>
                </div>
                <Progress value={Math.min(variancePercentage * 2, 100)} className={`h-2 ${varianceStatus.bgColor}`} />
              </div>
            )}

            {/* Session Duration Progress */}
            {realTimeState.sessionDuration > 8 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Session Duration</span>
                  <span className={realTimeState.sessionDuration > 10 ? "text-orange-600" : "text-blue-600"}>
                    {realTimeState.sessionDuration.toFixed(1)} / 12 hours
                  </span>
                </div>
                <Progress value={(realTimeState.sessionDuration / 12) * 100} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Active Alerts Summary */}
        {realTimeState.alerts.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-xs text-muted-foreground">
              {realTimeState.alerts.length} active alert{realTimeState.alerts.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-1">
              {realTimeState.alerts.slice(0, 3).map((alert) => (
                <Badge key={alert.id} variant="outline" className="text-xs">
                  {alert.type.replace("_", " ")}
                </Badge>
              ))}
              {realTimeState.alerts.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{realTimeState.alerts.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
