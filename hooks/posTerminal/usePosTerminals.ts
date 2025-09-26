"use client"

import { useEffect, useState } from "react"

interface POSStation {
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

export function usePOSStations() {
  const [stations, setStations] = useState<POSStation[]>([
    {
      id: "Station-001",
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
      id: "Station-002",
      name: "Express Lane",
      location: "Front Store",
      status: "online",
      lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "Station-003",
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
      setStations((prev) =>
        prev.map((station) => ({
          ...station,
          lastActivity: station.status === "online" ? new Date().toISOString() : station.lastActivity,
        })),
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const updateStationStatus = async (stationId: string, status: POSStation["status"]) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setStations((prev) =>
      prev.map((station) =>
        station.id === stationId ? { ...station, status, lastActivity: new Date().toISOString() } : station,
      ),
    )

    setIsLoading(false)
  }

  const getActiveStations = () => stations.filter((t) => t.status === "online")
  const getOfflineStations = () => stations.filter((t) => t.status === "offline")
  const getMaintenanceStations = () => stations.filter((t) => t.status === "maintenance")

  return {
    stations,
    isLoading,
    updateStationStatus,
    getActiveStations,
    getOfflineStations,
    getMaintenanceStations,
  }
}

export const usePosStations = (orgId: string) => {
  const result = usePOSStations()

  // Always return a consistent structure, even during loading
  const mockStations = result.stations.map((Station) => ({
    ...Station,
    locationId: orgId === "org_1" ? "loc_1" : "loc_2", // Mock location assignment
  }))

  return {
    data: {
      data: mockStations || [],
    },
    isLoading: result.isLoading || false,
    error: null,
    refetch: () => {},
  }
}
