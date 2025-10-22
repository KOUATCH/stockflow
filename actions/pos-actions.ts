"use server"

import { db } from "@/prisma/db"
import type { cashDrawerTransactionType, POSSessionStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export interface CashDrawerSession {
  id: string
  sessionNumber: string
  stationId: string
  userId: string
  locationId: string
  status: POSSessionStatus
  startTime: Date
  endTime?: Date
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  variance?: number
  totalSales: number
  totalTax: number
  totalDiscount: number
  transactionCount: number
  cashTotal: number
  cardTotal: number
  digitalTotal: number
  notes?: string
  terminal: {
    id: string
    name: string
    stationNumber: string
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface CashDrawerTransaction {
  id: string
  type: cashDrawerTransactionType
  amount: number
  reason?: string
  notes?: string
  cashDrawerId: string
  sessionId?: string
  userId: string
  balanceBefore: number
  balanceAfter: number
  createdAt: Date
  user: {
    firstName: string
    lastName: string
  }
}

export interface CashDrawerSummary {
  currentBalance: number
  totalSales: number
  totalCashIn: number
  totalCashOut: number
  transactionCount: number
  lastTransaction?: Date
}

export async function openPosSession(
  stationId: string,
  userId: string,
  locationId: string,
  openingBalance: number,
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const terminal = await db.pOSStation.findUnique({
      where: { id: stationId },
    })

    if (!terminal) {
      return { success: false, error: "Terminal not found. Please ensure the terminal is properly configured." }
    }

    if (!terminal.isActive) {
      return { success: false, error: "Terminal is not active. Please activate the terminal first." }
    }

    // Check if there's already an active session for this terminal
    const existingSession = await db.pOSSession.findFirst({
      where: {
       stationId,
        status: "ACTIVE",
      },
    })

    if (existingSession) {
      return { success: false, error: "Terminal already has an active session" }
    }

    // Generate session number
    const sessionNumber = `SES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const session = await db.pOSSession.create({
      data: {
        sessionNumber,
        stationId,
        userId,
        locationId,
        status: "ACTIVE",
        openingBalance: openingBalance,
        expectedBalance: openingBalance,
      },
    })

    // Get cash drawer for this location
    let cashDrawer = await db.cashDrawer.findFirst({
      where: { locationId },
    })

    if (!cashDrawer) {
      cashDrawer = await db.cashDrawer.create({
        data: {
          name: `Cash Drawer - Terminal ${stationId}`,
          locationId,
          currentBalance: openingBalance,
          isOpen: true,
        },
      })
    } else {
      // Update cash drawer
      await db.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: openingBalance,
          isOpen: true,
        },
      })
    }

    await db.cashDrawerTransaction.create({
      data: {
        cashDrawerId: cashDrawer.id,
        sessionId: session.id,
        userId,
        type: "OPENING_BALANCE",
        amount: openingBalance,
        reason: "Session opening balance",
        balanceBefore: 0,
        balanceAfter: openingBalance,
      },
    })

    // Update terminal's current session
    await db.pOSStation.update({
      where: { id: stationId },
      data: { currentSessionId: session.id },
    })

    revalidatePath("/pos")
    return { success: true, sessionId: session.id }
  } catch (error) {
    console.error("Error opening POS session:", error)
    return { success: false, error: "Failed to open session" }
  }
}

export async function closePosSession(
  sessionId: string,
  actualBalance: number,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    if (session.status !== "ACTIVE") {
      return { success: false, error: "Session is not active" }
    }

    const variance = actualBalance - (session.expectedBalance || 0)

    // Update session
    await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        status: "CLOSED",
        endTime: new Date(),
        closingBalance: actualBalance,
        variance: variance,
        notes,
      },
    })

    // Get cash drawer for this location
    const cashDrawer = await db.cashDrawer.findFirst({
      where: { locationId: session.locationId },
    })

    if (cashDrawer) {
      await db.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          isOpen: false,
          currentBalance: actualBalance,
        },
      })

      // Record closing transaction
      await db.cashDrawerTransaction.create({
        data: {
          cashDrawerId: cashDrawer.id,
          sessionId,
          userId: session.userId,
          type: "CLOSING_BALANCE",
          amount: actualBalance,
          reason: "Session closing balance",
          notes,
          balanceBefore: session.expectedBalance || 0,
          balanceAfter: actualBalance,
        },
      })
    }

    // Clear terminal's current session
    await db.pOSStation.update({
      where: { id: session.stationId },
      data: { currentSessionId: null },
    })

    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Error closing POS session:", error)
    return { success: false, error: "Failed to close session" }
  }
}

export async function addCashToDrawer(
  sessionId: string,
  amount: number,
  reason: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    const cashDrawer = await db.cashDrawer.findFirst({
      where: { locationId: session.locationId },
    })

    if (!cashDrawer) {
      return { success: false, error: "Cash drawer not found" }
    }

    const currentBalance = cashDrawer.currentBalance
    const newBalance = currentBalance + amount

    // Update cash drawer balance
    await db.cashDrawer.update({
      where: { id: cashDrawer.id },
      data: {
        currentBalance: newBalance,
      },
    })

    // Update session expected cash
    await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        expectedBalance: newBalance,
      },
    })

    // Record transaction
    await db.cashDrawerTransaction.create({
      data: {
        cashDrawerId: cashDrawer.id,
        sessionId,
        userId: session.userId,
        type: "CASH_IN",
        amount,
        reason,
        notes,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      },
    })

    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Error adding cash to drawer:", error)
    return { success: false, error: "Failed to add cash" }
  }
}

export async function removeCashFromDrawer(
  sessionId: string,
  amount: number,
  reason: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    const cashDrawer = await db.cashDrawer.findFirst({
      where: { locationId: session.locationId },
    })

    if (!cashDrawer) {
      return { success: false, error: "Cash drawer not found" }
    }

    const currentBalance = cashDrawer.currentBalance
    const newBalance = currentBalance - amount

    if (newBalance < 0) {
      return { success: false, error: "Insufficient cash in drawer" }
    }

    // Update cash drawer balance
    await db.cashDrawer.update({
      where: { id: cashDrawer.id },
      data: {
        currentBalance: newBalance,
      },
    })

    // Update session expected cash
    await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        expectedBalance: newBalance,
      },
    })

    // Record transaction
    await db.cashDrawerTransaction.create({
      data: {
        cashDrawerId: cashDrawer.id,
        sessionId,
        userId: session.userId,
        type: "CASH_OUT",
        amount,
        reason,
        notes,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      },
    })

    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Error removing cash from drawer:", error)
    return { success: false, error: "Failed to remove cash" }
  }
}

export async function getCurrentSession(stationId: string): Promise<CashDrawerSession | null> {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        stationId,
        status: "ACTIVE",
      },
      include: {
        terminal: {
          select: {
            id: true,
            name: true,
            stationNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return session as CashDrawerSession | null
  } catch (error) {
    console.error("Error getting current session:", error)
    return null
  }
}

export async function getCashDrawerTransactions(sessionId: string, limit = 50): Promise<CashDrawerTransaction[]> {
  try {
    const transactions = await db.cashDrawerTransaction.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return transactions as CashDrawerTransaction[]
  } catch (error) {
    console.error("Error getting cash drawer transactions:", error)
    return []
  }
}

export async function getCashDrawerSummary(sessionId: string): Promise<CashDrawerSummary | null> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return null
    }

    const cashDrawer = await db.cashDrawer.findFirst({
      where: { locationId: session.locationId },
    })

    if (!cashDrawer) {
      return null
    }

    const events = await db.cashDrawerTransaction.findMany({
      where: { sessionId },
    })

    const totalSales = events.filter((e) => e.type === "SALE").reduce((sum, e) => sum + e.amount, 0)

    const totalCashIn = events.filter((e) => e.type === "CASH_IN").reduce((sum, e) => sum + e.amount, 0)

    const totalCashOut = events.filter((e) => e.type === "CASH_OUT").reduce((sum, e) => sum + e.amount, 0)

    const lastTransaction =
      events.length > 0 ? events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt : undefined

    return {
      currentBalance: cashDrawer.currentBalance,
      totalSales: session.totalSales,
      totalCashIn,
      totalCashOut,
      transactionCount: events.length,
      lastTransaction,
    }
  } catch (error) {
    console.error("Error getting cash drawer summary:", error)
    return null
  }
}
