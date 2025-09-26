"use client"

import { useState, useEffect } from "react"

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
