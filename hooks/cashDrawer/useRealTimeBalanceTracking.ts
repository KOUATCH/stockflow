  "use client"

import { useEffect, useState } from "react"

interface RealTimeState {
  balance: number
  lastUpdated: Date
  isOnline: boolean
}

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskSpace: number
  networkLatency: number
}

interface SystemHealth {
  status: "healthy" | "warning" | "critical"
  uptime: number
  lastBackup: Date
}

interface LowStockItem {
  id: string
  name: string
  currentStock: number
  minStock: number
  category: string
}

export function useRealTimeBalanceTracking(terminalId: string, sessionId: string) {
  const [realTimeState, setRealTimeState] = useState<RealTimeState>({
    balance: 250.0,
    lastUpdated: new Date(),
    isOnline: true,
  })

  const [session, setSession] = useState(null)
  const [summary, setSummary] = useState({
    totalSales: 2847.5,
    transactionCount: 127,
    averageTransaction: 22.44,
  })

  useEffect(() => {
    if (!terminalId || !sessionId) return

    const interval = setInterval(() => {
      // Simulate real-time updates
      setRealTimeState((prev) => ({
        ...prev,
        balance: prev.balance + (Math.random() - 0.5) * 10,
        lastUpdated: new Date(),
      }))

      setSummary((prev) => ({
        ...prev,
        totalSales: prev.totalSales + Math.random() * 50,
        transactionCount: prev.transactionCount + (Math.random() > 0.8 ? 1 : 0),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [terminalId, sessionId])

  return { realTimeState, session, summary }
}

export function useLowStockMonitoring(locationId: string, orgId: string) {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [lowStockCount, setLowStockCount] = useState(0)
  const [criticalStockCount, setCriticalStockCount] = useState(0)

  useEffect(() => {
    if (!locationId || !orgId) return

    // Simulate stock monitoring
    const mockItems: LowStockItem[] = [
      { id: "1", name: "Coffee Beans", currentStock: 5, minStock: 10, category: "Beverages" },
      { id: "2", name: "Paper Cups", currentStock: 2, minStock: 20, category: "Supplies" },
    ]

    setLowStockItems(mockItems)
    setLowStockCount(mockItems.length)
    setCriticalStockCount(mockItems.filter((item) => item.currentStock <= item.minStock / 2).length)
  }, [locationId, orgId])

  return { lowStockCount, criticalStockCount, lowStockItems }
}

export function useSystemMonitoring(orgId: string, locationId: string) {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    diskSpace: 78,
    networkLatency: 12,
  })

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: "healthy",
    uptime: 99.8,
    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  })

  useEffect(() => {
    if (!orgId || !locationId) return

    const interval = setInterval(() => {
      setSystemMetrics((prev) => ({
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        diskSpace: Math.max(0, Math.min(100, prev.diskSpace + (Math.random() - 0.5) * 2)),
        networkLatency: Math.max(0, prev.networkLatency + (Math.random() - 0.5) * 5),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [orgId, locationId])

  return { systemMetrics, systemHealth }
}
