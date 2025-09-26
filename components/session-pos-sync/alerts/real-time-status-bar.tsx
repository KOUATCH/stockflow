"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Activity, Wifi, WifiOff, Clock, DollarSign } from "lucide-react"

interface RealTimeStatusBarProps {
  terminalId: string
  sessionId: string
  locationId: string
  organizationId: string
}

interface SystemStatus {
  isOnline: boolean
  lastSync: Date
  sessionDuration: number
  currentBalance: number
  transactionCount: number
  systemHealth: "excellent" | "good" | "warning" | "critical"
}

export function RealTimeStatusBar({ terminalId, sessionId, locationId, organizationId }: RealTimeStatusBarProps) {
  const [status, setStatus] = useState<SystemStatus>({
    isOnline: true,
    lastSync: new Date(),
    sessionDuration: 2.5,
    currentBalance: 847.25,
    transactionCount: 23,
    systemHealth: "excellent",
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      // Simulate real-time updates
      setStatus((prev) => ({
        ...prev,
        sessionDuration: prev.sessionDuration + 0.001,
        lastSync: new Date(),
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getHealthColor = (health: SystemStatus["systemHealth"]) => {
    switch (health) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {status.isOnline ? (
              <Wifi className="w-3 h-3 text-green-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400" />
            )}
            <span className={status.isOnline ? "text-green-400" : "text-red-400"}>
              {status.isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-blue-400" />
            <span className="text-gray-300">Health:</span>
            <Badge variant="outline" className={`text-xs ${getHealthColor(status.systemHealth)}`}>
              {status.systemHealth.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-purple-400" />
            <span className="text-gray-300">Session:</span>
            <span className="text-white font-medium">{status.sessionDuration.toFixed(1)}h</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span className="text-gray-300">Balance:</span>
            <span className="text-white font-medium">${status.currentBalance.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-gray-300">
            Transactions: <span className="text-white font-medium">{status.transactionCount}</span>
          </div>

          <div className="text-gray-300">
            Last Sync: <span className="text-white font-medium">{status.lastSync.toLocaleTimeString()}</span>
          </div>

          <div className="text-gray-300">{currentTime.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
