"use client"

import { useState, useEffect } from "react"

interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  manager: string
  status: "active" | "inactive" | "maintenance"
  openingHours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
}

export function useAllLocationsQueries() {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: "loc-001",
      name: "Downtown Store",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      phone: "(555) 123-4567",
      email: "downtown@store.com",
      manager: "Sarah Johnson",
      status: "active",
      openingHours: {
        monday: "9:00 AM - 9:00 PM",
        tuesday: "9:00 AM - 9:00 PM",
        wednesday: "9:00 AM - 9:00 PM",
        thursday: "9:00 AM - 9:00 PM",
        friday: "9:00 AM - 10:00 PM",
        saturday: "8:00 AM - 10:00 PM",
        sunday: "10:00 AM - 8:00 PM",
      },
    },
    {
      id: "loc-002",
      name: "Mall Location",
      address: "456 Shopping Center Blvd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      phone: "(555) 987-6543",
      email: "mall@store.com",
      manager: "Mike Chen",
      status: "active",
      openingHours: {
        monday: "10:00 AM - 9:00 PM",
        tuesday: "10:00 AM - 9:00 PM",
        wednesday: "10:00 AM - 9:00 PM",
        thursday: "10:00 AM - 9:00 PM",
        friday: "10:00 AM - 10:00 PM",
        saturday: "9:00 AM - 10:00 PM",
        sunday: "11:00 AM - 7:00 PM",
      },
    },
    {
      id: "loc-003",
      name: "Airport Terminal",
      address: "789 Airport Way",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      phone: "(555) 456-7890",
      email: "airport@store.com",
      manager: "Lisa Rodriguez",
      status: "maintenance",
      openingHours: {
        monday: "6:00 AM - 11:00 PM",
        tuesday: "6:00 AM - 11:00 PM",
        wednesday: "6:00 AM - 11:00 PM",
        thursday: "6:00 AM - 11:00 PM",
        friday: "6:00 AM - 11:00 PM",
        saturday: "6:00 AM - 11:00 PM",
        sunday: "6:00 AM - 11:00 PM",
      },
    },
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simulate data fetching
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getLocationById = (id: string) => locations.find((loc) => loc.id === id)
  const getActiveLocations = () => locations.filter((loc) => loc.status === "active")
  const getLocationsByState = (state: string) => locations.filter((loc) => loc.state === state)

  const updateLocationStatus = async (locationId: string, status: Location["status"]) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setLocations((prev) => prev.map((loc) => (loc.id === locationId ? { ...loc, status } : loc)))
    } catch (err) {
      setError("Failed to update location status")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    data: locations,
    isLoading,
    error,
    getLocationById,
    getActiveLocations,
    getLocationsByState,
    updateLocationStatus,
    refetch: () => {
      setIsLoading(true)
      setTimeout(() => setIsLoading(false), 500)
    },
  }
}

export const useOrgLocationsNew = (orgId: string, options?: { enabled?: boolean }) => {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const result = useAllLocationsQueries()

  useEffect(() => {
    if (options?.enabled) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        if (!result || !result.data) {
          setError("Failed to fetch locations")
        } else {
          const mockLocations = result.data.map((location) => ({
            ...location,
            type: "retail", // Mock location type
            organization: {
              name: "Demo Organization",
            },
          }))
          setLocations(mockLocations)
        }
        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [orgId, options])

  return {
    data: locations,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true)
      setTimeout(() => setIsLoading(false), 500)
    },
  }
}
