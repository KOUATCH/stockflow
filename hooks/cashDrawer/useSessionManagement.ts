"use client"

import { db } from "@/prisma/db"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { useEffect, useState } from "react"

interface Session {
  id: string
  terminalId: string
  userId: string
  status: "active" | "inactive" | "paused"
  openingBalance: number
  currentBalance: number
  startTime: Date
  endTime?: Date
  transactions: Transaction[]
}

interface Transaction {
  id: string
  amount: number
  type: "sale" | "refund" | "cash_in" | "cash_out"
  timestamp: Date
  description?: string
}

export function useSessionManagement(terminalId: string) {
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { success, error: notifyError, operationStart, operationComplete, cashOperation } = useNotifications()

  // Load existing session on mount
  useEffect(() => {
    if (terminalId) {
      loadSession()
    }
  }, [terminalId])

  const loadSession = async () => {
    setSessionLoading(true)
    try {
      // Simulate API call to load existing session
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check if there's an active session in localStorage (for demo)
      const savedSession = localStorage.getItem(`session_${terminalId}`)
      if (savedSession) {
        const session = JSON.parse(savedSession)
        // Convert date strings back to Date objects
        session.startTime = new Date(session.startTime)
        if (session.endTime) session.endTime = new Date(session.endTime)
        session.transactions = session.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }))
        setCurrentSession(session)
      }
    } catch (err) {
      const errorMessage = "Failed to load session"
      setError(errorMessage)
      notifyError("Session Load Failed", errorMessage, { category: "error", priority: "high" })
    } finally {
      setSessionLoading(false)
    }
  }

  const startSession = async (openingBalance: number, userId: string) => {
    setSessionLoading(true)
    setError(null)

    operationStart("Session Creation")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newSession: Session = {
        id: `session_${Date.now()}`,
        terminalId,
        userId,
        status: "active",
        openingBalance,
        currentBalance: openingBalance,
        startTime: new Date(),
        transactions: [],
      }

      setCurrentSession(newSession)
      const  createdSession= await db.pOSSession.create({
        data:{
        ...newSession
      }})


      // Save to localStorage for demo persistence
      localStorage.setItem(`session_${terminalId}`, JSON.stringify(newSession))

      operationComplete("Session Creation", `Session ${newSession.id} started with opening balance ${openingBalance}`)

      return createdSession
    } catch (err) {
      const errorMessage = "Failed to start session"
      setError(errorMessage)
      notifyError("Session Start Failed", errorMessage, { category: "error", priority: "high" })
      throw err
    } finally {
      setSessionLoading(false)
    }
  }

  const endSession = async () => {
    if (!currentSession) return

    setSessionLoading(true)
    setError(null)

    operationStart("Session Closure")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedSession = {
        ...currentSession,
        status: "inactive" as const,
        endTime: new Date(),
      }

      setCurrentSession(updatedSession)

      // Update localStorage
      localStorage.setItem(`session_${terminalId}`, JSON.stringify(updatedSession))

      // Clear current session after a delay
      setTimeout(() => {
        setCurrentSession(null)
        localStorage.removeItem(`session_${terminalId}`)
      }, 2000)

      operationComplete("Session Closure", `Session ${currentSession.id} ended successfully`)

      return updatedSession
    } catch (err) {
      const errorMessage = "Failed to end session"
      setError(errorMessage)
      notifyError("Session End Failed", errorMessage, { category: "error", priority: "high" })
      throw err
    } finally {
      setSessionLoading(false)
    }
  }

  const addTransaction = async (transaction: Omit<Transaction, "id" | "timestamp">) => {
    if (!currentSession) return

    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}`,
      timestamp: new Date(),
    }

    const updatedSession = {
      ...currentSession,
      transactions: [...currentSession.transactions, newTransaction],
      currentBalance:
        currentSession.currentBalance +
        (transaction.type === "sale" || transaction.type === "cash_in" ? transaction.amount : -transaction.amount),
    }

    setCurrentSession(updatedSession)
    localStorage.setItem(`session_${terminalId}`, JSON.stringify(updatedSession))

    // Notify about cash operations
    if (transaction.type === "cash_in" || transaction.type === "cash_out") {
      cashOperation(
        transaction.type === "cash_in" ? "add" : "remove",
        transaction.amount,
        `Cash Drawer ${terminalId}`
      )
    } else if (transaction.type === "sale") {
      success("Sale Recorded", `Transaction ${newTransaction.id} added to session`, {
        category: "operation"
      })
    }

    return newTransaction
  }

  return {
    currentSession,
    sessionLoading,
    error,
    startSession,
    endSession,
    addTransaction,
    refreshSession: loadSession,
  }
}
