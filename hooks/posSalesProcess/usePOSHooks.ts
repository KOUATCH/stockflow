"use client"

import { useState, useEffect, useCallback } from "react"
import { mockCustomers } from "@/lib/cashSystem/db"
import type { Item } from "@/lib/cashSystem/types"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { getPosStations } from "@/actions/posSalesProcess/posActions"
import { useCustomers as useCustomerQueries } from "@/hooks/useCustomerQueries"

// ============================================================================
// SESSION MANAGEMENT HOOKS
// ============================================================================

interface SessionData {
  id: string
  startTime: string
  endTime?: string
  status: "active" | "paused" | "closed"
  totalSales: number
  transactionCount: number
  cashierName: string
  terminalId: string
}

export function useSessionManagement(terminalId?: string) {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("pos-session")
      if (savedSession) {
        setCurrentSession(JSON.parse(savedSession))
      }
    } catch (error) {
      console.error("Error loading session from localStorage:", error)
    }
  }, [])

  // Save session to localStorage whenever it changes
  useEffect(() => {
    try {
      if (currentSession) {
        localStorage.setItem("pos-session", JSON.stringify(currentSession))
      } else {
        localStorage.removeItem("pos-session")
      }
    } catch (error) {
      console.error("Error saving session to localStorage:", error)
    }
  }, [currentSession])

  const startSession = async (cashierName: string, terminalIdParam: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newSession: SessionData = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: new Date().toISOString(),
      status: "active",
      totalSales: 0,
      transactionCount: 0,
      cashierName,
      terminalId: terminalIdParam || terminalId || "",
    }

    setCurrentSession(newSession)
    setIsLoading(false)
    return newSession
  }

  const pauseSession = async () => {
    if (!currentSession) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    setCurrentSession((prev) => (prev ? { ...prev, status: "paused" } : null))
    setIsLoading(false)
  }

  const resumeSession = async () => {
    if (!currentSession) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    setCurrentSession((prev) => (prev ? { ...prev, status: "active" } : null))
    setIsLoading(false)
  }

  const endSession = async () => {
    if (!currentSession) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setCurrentSession((prev) =>
      prev
        ? {
            ...prev,
            status: "closed",
            endTime: new Date().toISOString(),
          }
        : null,
    )

    // Clear session after a delay
    setTimeout(() => {
      setCurrentSession(null)
    }, 2000)

    setIsLoading(false)
  }

  const updateSessionStats = (saleAmount: number) => {
    if (!currentSession || currentSession.status !== "active") return

    setCurrentSession((prev) =>
      prev
        ? {
            ...prev,
            totalSales: prev.totalSales + saleAmount,
            transactionCount: prev.transactionCount + 1,
          }
        : null,
    )
  }

  const sessionLoading = isLoading

  return {
    currentSession,
    isLoading,
    sessionLoading, // Added sessionLoading alias for compatibility
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    updateSessionStats,
  }
}

// ============================================================================
// POS TERMINAL HOOKS
// ============================================================================

interface POSTerminal {
  id: string
  name: string
  location: string
  status: "online" | "offline" | "maintenance"
  lastActivity: string
  currentSession?: {
    cashierName: string
    startTime: string
    transactionCount: number
  }
}

export function usePOSTerminals() {
  const [terminals, setTerminals] = useState<POSTerminal[]>([
    {
      id: "terminal-001",
      name: "Main Counter",
      location: "Front Store",
      status: "online",
      lastActivity: new Date().toISOString(),
      currentSession: {
        cashierName: "John Doe",
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        transactionCount: 15,
      },
    },
    {
      id: "terminal-002",
      name: "Express Lane",
      location: "Front Store",
      status: "online",
      lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "terminal-003",
      name: "Customer Service",
      location: "Back Office",
      status: "offline",
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ])

  const [isLoading, setIsLoading] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTerminals((prev) =>
        prev.map((terminal) => ({
          ...terminal,
          lastActivity: terminal.status === "online" ? new Date().toISOString() : terminal.lastActivity,
        })),
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const updateTerminalStatus = async (terminalId: string, status: POSTerminal["status"]) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setTerminals((prev) =>
      prev.map((terminal) =>
        terminal.id === terminalId ? { ...terminal, status, lastActivity: new Date().toISOString() } : terminal,
      ),
    )

    setIsLoading(false)
  }

  const getActiveTerminals = () => terminals.filter((t) => t.status === "online")
  const getOfflineTerminals = () => terminals.filter((t) => t.status === "offline")
  const getMaintenanceTerminals = () => terminals.filter((t) => t.status === "maintenance")

  return {
    terminals,
    isLoading,
    updateTerminalStatus,
    getActiveTerminals,
    getOfflineTerminals,
    getMaintenanceTerminals,
  }
}

export const usePosStations = (orgId: string) => {
  const result = usePOSTerminals()

  const mockTerminals = result.terminals.map((terminal) => ({
    ...terminal,
    locationId: orgId === "org_1" ? "loc_1" : "loc_2", // Mock location assignment
  }))

  return {
    data: mockTerminals || [],
    isLoading: result.isLoading || false,
    error: null,
    refetch: () => {},
  }
}

// ============================================================================
// CUSTOMER HOOKS
// ============================================================================

export function useCustomers(organizationId: string) {
  // Import the real useCustomers hook from useCustomerQueries
  const { data: realCustomers, isLoading, error } = useCustomerQueries()

  return {
    data: {
      success: !error,
      data: realCustomers || [],
      message: error ? "Failed to fetch customers" : "Customers fetched successfully",
    },
    isLoading,
    error,
  }
}

// Hook to get a specific customer
export function useCustomer(customerId: string) {
  const customer = mockCustomers.find(c => c.id === customerId)

  return {
    data: customer || null,
    isLoading: false,
    error: customer ? null : "Customer not found",
  }
}

// ============================================================================
// ITEM/INVENTORY HOOKS
// ============================================================================

// Mock items data
const mockItems: Item[] = [
  {
    id: "item-1",
    name: "Wireless Headphones",
    sku: "WH-001",
    description: "Premium wireless headphones with noise cancellation",
    sellingPrice: 199.99,
    costPrice: 120.0,
    categoryId: "cat-1",
    category: {
      id: "cat-1",
      title: "Electronics",
    },
    taxRate: {
      id: "tax-1",
      rate: 8.75,
    },
    inventoryLevels: [
      {
        id: "inv-1",
        itemId: "item-1",
        locationId: "loc_1",
        quantityAvailable: 25,
        quantityReserved: 2,
        quantityOnOrder: 10,
        minStockLevel: 5,
        maxStockLevel: 50,
      },
    ],
  },
  {
    id: "item-2",
    name: "Bluetooth Speaker",
    sku: "BS-002",
    description: "Portable bluetooth speaker with excellent sound quality",
    sellingPrice: 79.99,
    costPrice: 45.0,
    categoryId: "cat-1",
    category: {
      id: "cat-1",
      title: "Electronics",
    },
    taxRate: {
      id: "tax-1",
      rate: 8.75,
    },
    inventoryLevels: [
      {
        id: "inv-2",
        itemId: "item-2",
        locationId: "loc_1",
        quantityAvailable: 15,
        quantityReserved: 1,
        quantityOnOrder: 5,
        minStockLevel: 3,
        maxStockLevel: 30,
      },
    ],
  },
]

export function useAllItemQueries(organizationId: string) {
  return {
    data: {
      success: true,
      data: mockItems,
      message: "Items fetched successfully",
    },
    isLoading: false,
    error: null,
  }
}

export function useItem(itemId: string) {
  const item = mockItems.find(i => i.id === itemId)

  return {
    data: item || null,
    isLoading: false,
    error: item ? null : "Item not found",
  }
}

// ============================================================================
// LOCATION HOOKS
// ============================================================================

interface Location {
  id: string
  name: string
  address?: string
  organizationId: string
}

const mockLocations: Location[] = [
  {
    id: "loc_1",
    name: "Main Store",
    address: "123 Main St, City, State",
    organizationId: "org_1",
  },
  {
    id: "loc_2",
    name: "Branch Store",
    address: "456 Branch Ave, City, State",
    organizationId: "org_1",
  },
]

export function useAllLocationsQueries(organizationId: string) {
  const filteredLocations = mockLocations.filter(loc => loc.organizationId === organizationId)

  return {
    data: {
      success: true,
      data: filteredLocations,
      message: "Locations fetched successfully",
    },
    isLoading: false,
    error: null,
  }
}

// ============================================================================
// CATEGORY HOOKS
// ============================================================================

interface Category {
  id: string
  title: string
  description?: string
}

const mockCategories: Category[] = [
  {
    id: "cat-1",
    title: "Electronics",
    description: "Electronic devices and accessories",
  },
  {
    id: "cat-2",
    title: "Clothing",
    description: "Apparel and fashion items",
  },
  {
    id: "cat-3",
    title: "Books",
    description: "Books and publications",
  },
]

export function useAllCategoriesQueries(organizationId: string) {
  return {
    data: {
      success: true,
      data: mockCategories,
      message: "Categories fetched successfully",
    },
    isLoading: false,
    error: null,
  }
}

// ============================================================================
// CASH DRAWER HOOKS
// ============================================================================

interface CashDrawer {
  id: string
  name: string
  currentBalance: number
  expectedBalance: number
  isOpen: boolean
  lastActivity?: Date
}

export function useRealTimeTracking(terminalId: string) {
  const [cashDrawer, setCashDrawer] = useState<CashDrawer>({
    id: `drawer-${terminalId}`,
    name: `Cash Drawer ${terminalId}`,
    currentBalance: 200.0,
    expectedBalance: 200.0,
    isOpen: true,
    lastActivity: new Date(),
  })

  const [isLoading, setIsLoading] = useState(false)

  const updateBalance = async (amount: number, reason: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setCashDrawer(prev => ({
      ...prev,
      currentBalance: prev.currentBalance + amount,
      lastActivity: new Date(),
    }))

    setIsLoading(false)
  }

  const openDrawer = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 300))

    setCashDrawer(prev => ({
      ...prev,
      isOpen: true,
      lastActivity: new Date(),
    }))

    setIsLoading(false)
  }

  const closeDrawer = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 300))

    setCashDrawer(prev => ({
      ...prev,
      isOpen: false,
      lastActivity: new Date(),
    }))

    setIsLoading(false)
  }

  return {
    cashDrawer,
    isLoading,
    updateBalance,
    openDrawer,
    closeDrawer,
  }
}

// ============================================================================
// NOTIFICATION HOOKS
// ============================================================================

interface Notification {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    removeNotification,
    clearAll,
  }
}

// ============================================================================
// MOBILE DETECTION HOOK
// ============================================================================

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

// ============================================================================
// NOTIFICATION HOOKS (Already defined below)
// ============================================================================

// ============================================================================
// POS STATION HOOKS
// ============================================================================

interface POSStation {
  id: string
  name: string
  stationNumber: string
  isActive: boolean
  locationId: string
  organizationId: string
  location?: {
    id: string
    name: string
  }
  organization?: {
    id: string
    name: string
  }
  currentSession?: {
    id: string
    sessionNumber: string
    status: string
  }
}

export function usePOSStations(organizationId?: string) {
  const [stations, setStations] = useState<POSStation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStations = useCallback(async () => {
    if (!organizationId) {
      console.log("usePOSStations: No organizationId provided")
      return
    }

    console.log("usePOSStations: Fetching stations for organization:", organizationId)
    setLoading(true)
    setError(null)

    try {
      const result = await getPosStations(organizationId)
      console.log("usePOSStations: Result from getPosStations:", result)

      if (result.success) {
        console.log("usePOSStations: Setting stations:", result.data || [])
        setStations(result.data || [])
      } else {
        console.log("usePOSStations: Error from getPosStations:", result.error)
        setError(result.error || "Failed to fetch POS stations")
      }
    } catch (err) {
      console.error("usePOSStations: Exception:", err)
      setError("Error fetching POS stations")
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchStations()
  }, [fetchStations])

  const refreshStations = useCallback(() => {
    fetchStations()
  }, [fetchStations])

  return {
    stations,
    loading,
    error,
    refreshStations,
    refetch: refreshStations,
  }
}

export function usePOSStation(stationId: string) {
  const [station, setStation] = useState<POSStation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStation = useCallback(async () => {
    if (!stationId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pos-stations/${stationId}`)
      const data = await response.json()

      if (data.success) {
        setStation(data.data)
      } else {
        setError(data.error || "Failed to fetch POS station")
      }
    } catch (err) {
      setError("Error fetching POS station")
      console.error("Error fetching POS station:", err)
    } finally {
      setLoading(false)
    }
  }, [stationId])

  useEffect(() => {
    fetchStation()
  }, [fetchStation])

  return {
    station,
    loading,
    error,
    refetch: fetchStation,
  }
}

// ============================================================================
// CASH DRAWER HOOKS
// ============================================================================

interface CashDrawerStatus {
  id: string | null
  isOpen: boolean
  currentBalance: number
  expectedBalance: number
  lastActivity: Date | null
}

interface CashDrawerTransaction {
  id: string
  type: string
  amount: number
  reason: string
  balanceBefore: number
  balanceAfter: number
  createdAt: Date
  user?: {
    id: string
    name: string
  }
  session?: {
    id: string
    sessionNumber: string
  }
}

export function useCashDrawer(stationId: string) {
  const [status, setStatus] = useState<CashDrawerStatus>({
    id: null,
    isOpen: false,
    currentBalance: 0,
    expectedBalance: 0,
    lastActivity: null,
  })
  const [transactions, setTransactions] = useState<CashDrawerTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCashDrawerStatus = useCallback(async () => {
    if (!stationId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cash-drawer/status?stationId=${stationId}`)
      const data = await response.json()

      if (data.success) {
        setStatus(data.data)
      } else {
        setError(data.error || "Failed to fetch cash drawer status")
      }
    } catch (err) {
      setError("Error fetching cash drawer status")
      console.error("Error fetching cash drawer status:", err)
    } finally {
      setLoading(false)
    }
  }, [stationId])

  const fetchTransactions = useCallback(async () => {
    if (!stationId) return

    try {
      const response = await fetch(`/api/cash-drawer/transactions?stationId=${stationId}`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.data || [])
      }
    } catch (err) {
      console.error("Error fetching cash drawer transactions:", err)
    }
  }, [stationId])

  useEffect(() => {
    fetchCashDrawerStatus()
    fetchTransactions()
  }, [fetchCashDrawerStatus, fetchTransactions])

  const openDrawer = useCallback(async (openingBalance: number, userId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cash-drawer/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId, userId, openingBalance }),
      })
      const data = await response.json()

      if (data.success) {
        await fetchCashDrawerStatus()
        await fetchTransactions()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return { success: false, error: "Failed to open cash drawer" }
    } finally {
      setLoading(false)
    }
  }, [stationId, fetchCashDrawerStatus, fetchTransactions])

  const closeDrawer = useCallback(async (closingBalance: number, userId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cash-drawer/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId, userId, closingBalance }),
      })
      const data = await response.json()

      if (data.success) {
        await fetchCashDrawerStatus()
        await fetchTransactions()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return { success: false, error: "Failed to close cash drawer" }
    } finally {
      setLoading(false)
    }
  }, [stationId, fetchCashDrawerStatus, fetchTransactions])

  const addCash = useCallback(async (amount: number, reason: string, userId: string, sessionId?: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cash-drawer/add-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId, userId, amount, reason, sessionId }),
      })
      const data = await response.json()

      if (data.success) {
        await fetchCashDrawerStatus()
        await fetchTransactions()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return { success: false, error: "Failed to add cash" }
    } finally {
      setLoading(false)
    }
  }, [stationId, fetchCashDrawerStatus, fetchTransactions])

  const removeCash = useCallback(async (amount: number, reason: string, userId: string, sessionId?: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cash-drawer/remove-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId, userId, amount, reason, sessionId }),
      })
      const data = await response.json()

      if (data.success) {
        await fetchCashDrawerStatus()
        await fetchTransactions()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return { success: false, error: "Failed to remove cash" }
    } finally {
      setLoading(false)
    }
  }, [stationId, fetchCashDrawerStatus, fetchTransactions])

  const performCashCount = useCallback(async (countedAmount: number, userId: string, sessionId?: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cash-drawer/cash-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId, userId, countedAmount, sessionId }),
      })
      const data = await response.json()

      if (data.success) {
        await fetchCashDrawerStatus()
        await fetchTransactions()
        return { success: true, message: data.message, variance: data.data?.variance }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return { success: false, error: "Failed to perform cash count" }
    } finally {
      setLoading(false)
    }
  }, [stationId, fetchCashDrawerStatus, fetchTransactions])

  return {
    status,
    transactions,
    loading,
    error,
    openDrawer,
    closeDrawer,
    addCash,
    removeCash,
    performCashCount,
    refresh: fetchCashDrawerStatus,
    refreshTransactions: fetchTransactions,
  }
}