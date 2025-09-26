"use client"

import { useEffect, useState } from "react"

interface CashDrawerState {
  isOpen: boolean
  lastOpenedAt: string | null
  cashBalance: number
  transactions: Array<{
    id: string
    type: "sale" | "refund" | "cash_in" | "cash_out"
    amount: number
    timestamp: string
  }>
}

interface LowStockItem {
  id: string
  name: string
  currentStock: number
  minStock: number
  category: string
}

interface RealTimeState {
  currentBalance: number
  expectedBalance: number
  variance: number
  isOnline: boolean
  systemHealth: "excellent" | "good" | "warning" | "critical"
  sessionDuration: number
  alerts: Array<{
    id: string
    title: string
    message: string
    severity: "low" | "medium" | "high" | "critical"
    actionRequired: boolean
  }>
}

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
  uptime: number
}

export function useLowStockMonitoring(locationId: string, organizationId: string) {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([
    { id: "1", name: "Coffee Beans", currentStock: 5, minStock: 10, category: "Beverages" },
    { id: "2", name: "Paper Cups", currentStock: 15, minStock: 50, category: "Supplies" },
    { id: "3", name: "Sugar Packets", currentStock: 8, minStock: 25, category: "Condiments" },
  ])

  const lowStockCount = lowStockItems.filter(
    (item) => item.currentStock <= item.minStock && item.currentStock > 0,
  ).length
  const criticalStockCount = lowStockItems.filter((item) => item.currentStock === 0).length

  // Simulate real-time updates for low stock items
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate stock updates
      setLowStockItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          currentStock: Math.max(0, Math.min(item.minStock * 2, item.currentStock + (Math.random() - 0.5) * 5)),
        })),
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return {
    lowStockItems,
    lowStockCount,
    criticalStockCount,
  }
}

export function useRealTimeBalanceTracking(terminalId: string, sessionId: string) {
  const [realTimeState, setRealTimeState] = useState<RealTimeState>({
    currentBalance: 250.0,
    expectedBalance: 250.0,
    variance: 0.0,
    isOnline: true,
    systemHealth: "excellent" as "excellent" | "good" | "warning" | "critical",
    sessionDuration: 2.5,
    alerts: [] as Array<{
      id: string
      title: string
      message: string
      severity: "low" | "medium" | "high" | "critical"
      actionRequired: boolean
    }>,
  })

  // Simulate real-time updates for balance tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeState((prev) => ({
        ...prev,
        sessionDuration: prev.sessionDuration + 1 / 3600, // Add 1 second in hours
        currentBalance: prev.currentBalance + (Math.random() - 0.5) * 2, // Small random fluctuations
        variance: prev.currentBalance - prev.expectedBalance,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const session = {
    id: sessionId,
    startTime: new Date(Date.now() - realTimeState.sessionDuration * 60 * 60 * 1000).toISOString(),
    status: "active" as const,
  }

  const summary = {
    totalSales: realTimeState.currentBalance - 200, // Starting balance was 200
    transactionCount: Math.floor(realTimeState.sessionDuration * 10),
    averageTransaction:
      (realTimeState.currentBalance - 200) / Math.max(1, Math.floor(realTimeState.sessionDuration * 10)),
  }

  return {
    realTimeState,
    session,
    summary,
  }
}

export function useSystemMonitoring(organizationId: string, locationId: string) {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    networkLatency: 12,
    uptime: 99.8,
  })

  const [systemHealth, setSystemHealth] = useState<"excellent" | "good" | "warning" | "critical">("excellent")

  // Simulate metric updates for system monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics((prev) => ({
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        diskUsage: prev.diskUsage,
        networkLatency: Math.max(1, prev.networkLatency + (Math.random() - 0.5) * 5),
        uptime: prev.uptime,
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Update system health based on metrics
  useEffect(() => {
    const avgMetric = (systemMetrics.cpuUsage + systemMetrics.memoryUsage) / 2
    if (avgMetric < 50) setSystemHealth("excellent")
    else if (avgMetric < 70) setSystemHealth("good")
    else if (avgMetric < 85) setSystemHealth("warning")
    else setSystemHealth("critical")
  }, [systemMetrics])

  return {
    systemMetrics,
    systemHealth,
  }
}

// Original useRealTimeTracking function for cash drawer operations
export function useRealTimeTracking() {
  const [drawerState, setDrawerState] = useState<CashDrawerState>({
    isOpen: false,
    lastOpenedAt: null,
    cashBalance: 200.0, // Starting cash
    transactions: [],
  })

  const [isConnected, setIsConnected] = useState(true)

  // Simulate real-time updates for drawer state
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate occasional status updates
      if (Math.random() > 0.95) {
        setDrawerState((prev) => ({
          ...prev,
          lastOpenedAt: new Date().toISOString(),
        }))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const openDrawer = () => {
    setDrawerState((prev) => ({
      ...prev,
      isOpen: true,
      lastOpenedAt: new Date().toISOString(),
    }))
  }

  const closeDrawer = () => {
    setDrawerState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  const addTransaction = (transaction: Omit<CashDrawerState["transactions"][0], "id" | "timestamp">) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    }

    setDrawerState((prev) => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
      cashBalance:
        prev.cashBalance +
        (transaction.type === "sale" || transaction.type === "cash_in" ? transaction.amount : -transaction.amount),
    }))
  }

  return {
    drawerState,
    isConnected,
    openDrawer,
    closeDrawer,
    addTransaction,
  }
}
