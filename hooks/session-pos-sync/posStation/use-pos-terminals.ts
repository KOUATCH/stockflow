"use client"

import { useState, useEffect } from "react"

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
