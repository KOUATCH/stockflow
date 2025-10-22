"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

const POSSessionStatus = {
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
  SUSPENDED: "SUSPENDED",
  RECONCILED: "RECONCILED",
} as const

const cashDrawerTransactionType = {
  OPENING_BALANCE: "OPENING_BALANCE",
  SALE: "SALE",
  RETURN: "RETURN",
  CASH_IN: "CASH_IN",
  CASH_OUT: "CASH_OUT",
  CLOSING_BALANCE: "CLOSING_BALANCE",
  RECONCILIATION: "RECONCILIATION",
} as const

export interface OpenSessionData {
  stationId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance: number
  notes?: string
}

export interface CloseSessionData {
  sessionId: string
  userId: string
  closingBalance: number
  notes?: string
}

export interface SessionSummary {
  sessionNumber: string
  startTime: Date
  endTime?: Date
  openingBalance: number
  closingBalance?: number
  totalSales: number
  transactionCount: number
  variance?: number
  paymentBreakdown: {
    cash: number
    card: number
    digital: number
  }
}

export async function openPosSession(data: OpenSessionData) {
  try {
    // Validate terminal exists and is active
    const terminal = await db.pOSStation.findUnique({
      where: { id: data.stationId },
      include: {
        location: true,
        organization: true,
      },
    })

    if (!terminal) {
      return {
        success: false,
        error: "Terminal not found",
        code: "TERMINAL_NOT_FOUND",
      }
    }

    if (!terminal.isActive) {
      return {
        success: false,
        error: "Terminal is not active",
        code: "TERMINAL_INACTIVE",
      }
    }

    // Check for existing active session
    const existingSession = await db.pOSSession.findFirst({
      where: {
        stationId: data.stationId,
        status: POSSessionStatus.ACTIVE,
      },
    })

    if (existingSession) {
      return {
        success: false,
        error: `Terminal already has an active session: ${existingSession.sessionNumber}`,
        code: "SESSION_ALREADY_ACTIVE",
        existingSession,
      }
    }

    // Validate user permissions
    const user = await db.user.findUnique({
      where: { id: data.userId },
    })

    if (!user) {
      return {
        success: false,
        error: "User not found",
        code: "USER_NOT_FOUND",
      }
    }

    // Generate session number
    const today = new Date().toISOString().slice(0, 10)
    const sessionCount = await db.pOSSession.count({
      where: {
        stationId: data.stationId,
        startTime: {
          gte: new Date(today + "T00:00:00.000Z"),
          lt: new Date(today + "T23:59:59.999Z"),
        },
      },
    })

    const sessionNumber = `SES-${today}-${data.stationId.slice(-4)}-${String(sessionCount + 1).padStart(3, "0")}`

    // Create session and cash drawer in transaction
    const result = await db.$transaction(async (tx) => {
      // Create POS session
      const session = await tx.pOSSession.create({
        data: {
          sessionNumber,
          stationId: data.stationId,
          userId: data.userId,
          locationId: data.locationId,
          status: POSSessionStatus.ACTIVE,
          startTime: new Date(),
          openingBalance: data.openingBalance,
          expectedBalance: data.openingBalance,
          notes: data.notes,
          totalSales: 0,
          totalTax: 0,
          totalDiscount: 0,
          transactionCount: 0,
          cashTotal: 0,
          cardTotal: 0,
          digitalTotal: 0,
        },
      })

      // Create or update cash drawer
      const drawerNumber = `DRW-${data.stationId}-${Date.now()}`
      const cashDrawer = await tx.cashDrawer.upsert({
        where: { stationId: data.stationId },
        update: {
          currentBalance: data.openingBalance,
          expectedBalance: data.openingBalance,
          isOpen: true,
        },
        create: {
          name: `Cash Drawer - ${terminal.name}`,
          drawerNumber,
          stationId: data.stationId,
          locationId: data.locationId,
          organizationId: data.organizationId,
          currentBalance: data.openingBalance,
          expectedBalance: data.openingBalance,
          isOpen: true,
        },
      })

      // Create opening balance event
      await tx.cashDrawerTransaction.create({
        data: {
          cashDrawerId: cashDrawer.id,
          sessionId: session.id,
          userId: data.userId,
          type: cashDrawerTransactionType.OPENING_BALANCE,
          amount: data.openingBalance,
          reason: `Session ${sessionNumber} opened`,
          notes: data.notes,
          balanceBefore: 0,
          balanceAfter: data.openingBalance,
        },
      })

      return { session, cashDrawer }
    })

    revalidatePath("/pos")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: {
        session: result.session,
        cashDrawer: result.cashDrawer,
        terminal: terminal.name,
        location: terminal.location.name,
      },
      message: `Session ${sessionNumber} opened successfully with $${data.openingBalance.toFixed(2)} opening balance`,
    }
  } catch (error) {
    console.error("Failed to open POS session:", error)
    return {
      success: false,
      error: "Failed to open POS session",
      code: "INTERNAL_ERROR",
    }
  }
}

export async function closePosSession(data: CloseSessionData) {
  try {
    // Get session with all related data
    const session = await db.pOSSession.findUnique({
      where: { id: data.sessionId },
      include: {
        station: true,
        user: true,
        cashDrawerTransactions: {
          include: { cashDrawer: true },
        },
      },
    })

    if (!session) {
      return {
        success: false,
        error: "Session not found",
        code: "SESSION_NOT_FOUND",
      }
    }

    if (session.status !== POSSessionStatus.ACTIVE) {
      return {
        success: false,
        error: `Session is already ${session.status.toLowerCase()}`,
        code: "SESSION_NOT_ACTIVE",
      }
    }

    // Calculate session totals
    const expectedBalance = Number(session.expectedBalance) || Number(session.openingBalance)
    const variance = data.closingBalance - expectedBalance
    const endTime = new Date()

    // Close session and update cash drawer in transaction
    const result = await db.$transaction(async (tx) => {
      // Update session
      const closedSession = await tx.pOSSession.update({
        where: { id: data.sessionId },
        data: {
          status: POSSessionStatus.CLOSED,
          endTime,
          closingBalance: data.closingBalance,
          variance,
          notes: data.notes,
        },
      })

      // Update cash drawer
      const cashDrawer = session.cashDrawerTransactions[0]?.cashDrawer
      if (cashDrawer) {
        await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            currentBalance: data.closingBalance,
            isOpen: false,
          },
        })

        // Create closing balance event
        await tx.cashDrawerTransaction.create({
          data: {
            cashDrawerId: cashDrawer.id,
            sessionId: data.sessionId,
            userId: data.userId,
            type: cashDrawerTransactionType.CLOSING_BALANCE,
            amount: data.closingBalance,
            reason: `Session ${session.sessionNumber} closed`,
            notes: data.notes,
            balanceBefore: Number(cashDrawer.currentBalance),
            balanceAfter: data.closingBalance,
          },
        })
      }

      return closedSession
    })

    revalidatePath("/pos")
    revalidatePath("/dashboard")

    // Calculate session summary
    const sessionDuration = (endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60) // hours
    const summary: SessionSummary = {
      sessionNumber: session.sessionNumber,
      startTime: session.startTime,
      endTime,
      openingBalance: Number(session.openingBalance),
      closingBalance: data.closingBalance,
      totalSales: Number(session.totalSales),
      transactionCount: session.transactionCount,
      variance,
      paymentBreakdown: {
        cash: Number(session.cashTotal),
        card: Number(session.cardTotal),
        digital: Number(session.digitalTotal),
      },
    }

    return {
      success: true,
      data: {
        session: result,
        summary,
        duration: sessionDuration,
      },
      message: `Session ${session.sessionNumber} closed successfully. ${Math.abs(variance) < 0.01 ? "Perfect balance!" : `Variance: ${variance >= 0 ? "+" : ""}$${variance.toFixed(2)}`}`,
    }
  } catch (error) {
    console.error("Failed to close POS session:", error)
    return {
      success: false,
      error: "Failed to close POS session",
      code: "INTERNAL_ERROR",
    }
  }
}

export async function getActiveSession(stationId: string) {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        stationId,
        status: POSSessionStatus.ACTIVE,
      },
      include: {
        station: true,
        user: true,
        cashDrawerTransactions: {
          include: { cashDrawer: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("Failed to get active session:", error)
    return {
      success: false,
      error: "Failed to get active session",
    }
  }
}

export async function suspendSession(sessionId: string, userId: string, reason?: string) {
  try {
    const session = await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        status: POSSessionStatus.SUSPENDED,
        notes: reason,
      },
    })

    revalidatePath("/pos")

    return {
      success: true,
      data: session,
      message: `Session ${session.sessionNumber} suspended`,
    }
  } catch (error) {
    console.error("Failed to suspend session:", error)
    return {
      success: false,
      error: "Failed to suspend session",
    }
  }
}

export async function resumeSession(sessionId: string, userId: string) {
  try {
    const session = await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        status: POSSessionStatus.ACTIVE,
      },
    })

    revalidatePath("/pos")

    return {
      success: true,
      data: session,
      message: `Session ${session.sessionNumber} resumed`,
    }
  } catch (error) {
    console.error("Failed to resume session:", error)
    return {
      success: false,
      error: "Failed to resume session",
    }
  }
}
