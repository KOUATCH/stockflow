"use server"

import { randomUUID } from "crypto"

import { db } from "@/prisma/db"
import {
  CashDrawerTransactionType,
  POSSessionStatus,
  Prisma,
} from "@prisma/client"
import { revalidatePath } from "next/cache"

export interface CashDrawerSession {
  id: string
  sessionNumber: string
  stationId: string
  userId: string
  locationId: string
  status: "ACTIVE" | "CLOSED" | "SUSPENDED" | "RECONCILED"
  startTime: Date
  endTime?: Date
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  variance?: number
  notes?: string
  station: {
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
  cashDrawer?: {
    id: string
    currentBalance: number
    expectedBalance: number
    isOpen: boolean
  }
}

export interface cashDrawerTransaction {
  id: string
  cashDrawerId: string
  sessionId?: string
  userId: string
  type: "OPENING_BALANCE" | "SALE" | "CASH_IN" | "CASH_OUT" | "CLOSING_BALANCE" | "RECONCILIATION" | "RETURN" | "REFUND" | "PAYOUT"
  amount: number
  reason?: string
  notes?: string
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
  expectedBalance: number
  variance: number
  totalSales: number
  totalCashIn: number
  totalCashOut: number
  eventCount: number
  lastEvent?: Date
}

const CASH_REVALIDATION_PATHS = [
  "/[locale]/dashboard/cashSystem",
  "/[locale]/dashboard/session-pos-sync",
  "/[locale]/dashboard/pos-system",
] as const

function createId() {
  return randomUUID()
}

function revalidateCashDrawerPaths() {
  for (const path of CASH_REVALIDATION_PATHS) {
    revalidatePath(path, "page")
  }
}

function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0
  }

  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    return Number(value) || 0
  }

  return value.toNumber()
}

function generateNumber(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function mapSessionForClient(session: any, cashDrawer: any): CashDrawerSession {
  return {
    id: session.id,
    sessionNumber: session.sessionNumber,
    stationId: session.terminalId,
    userId: session.userId,
    locationId: session.locationId,
    status: session.status,
    startTime: session.startTime,
    endTime: session.endTime ?? undefined,
    openingBalance: toNumber(session.openingBalance),
    closingBalance: session.closingBalance === null ? undefined : toNumber(session.closingBalance),
    expectedBalance: session.expectedBalance === null ? undefined : toNumber(session.expectedBalance),
    variance: session.variance === null ? undefined : toNumber(session.variance),
    notes: session.notes ?? undefined,
    station: {
      id: session.terminal.id,
      name: session.terminal.name,
      stationNumber: session.terminal.terminalNumber,
    },
    user: {
      id: session.user.id,
      firstName: session.user.firstName ?? "",
      lastName: session.user.lastName ?? "",
      email: session.user.email ?? "",
    },
    cashDrawer: cashDrawer
      ? {
          id: cashDrawer.id,
          currentBalance: toNumber(cashDrawer.currentBalance),
          expectedBalance: toNumber(cashDrawer.expectedBalance),
          isOpen: cashDrawer.isOpen,
        }
      : undefined,
  }
}

async function getSessionAndDrawer(sessionId: string) {
  const session = await db.pOSSession.findUnique({
    where: { id: sessionId },
    include: {
      terminal: true,
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

  if (!session) {
    return { session: null, cashDrawer: null }
  }

  const cashDrawer = await db.cashDrawer.findFirst({
    where: {
      terminalId: session.terminalId,
      locationId: session.locationId,
    },
  })

  return { session, cashDrawer }
}

async function getOpenDrawerForSession(sessionId: string) {
  const { session, cashDrawer } = await getSessionAndDrawer(sessionId)

  if (!session || session.status !== POSSessionStatus.ACTIVE) {
    return { session: null, cashDrawer: null, error: "Active session not found" }
  }

  if (!cashDrawer || !cashDrawer.isOpen) {
    return { session, cashDrawer: null, error: "Cash drawer not found" }
  }

  return { session, cashDrawer, error: undefined }
}

// Open a new POS session with cash drawer
export async function openPosSession(
  stationId: string,
  userId: string,
  locationId: string,
  organizationId: string,
  openingBalance: number
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const existingSession = await db.pOSSession.findFirst({
      where: {
        terminalId: stationId,
        status: POSSessionStatus.ACTIVE,
      },
    })

    if (existingSession) {
      return { success: false, error: "Terminal already has an active session" }
    }

    const station = await db.pOSStation.findFirst({
      where: {
        id: stationId,
        isActive: true,
      },
    })

    if (!station) {
      return { success: false, error: "Terminal not found or inactive" }
    }

    const session = await db.$transaction(async (tx) => {
      const now = new Date()
      const createdSession = await tx.pOSSession.create({
        data: {
          id: createId(),
          sessionNumber: generateNumber("SES"),
          terminalId: stationId,
          userId,
          locationId,
          organizationId,
          status: POSSessionStatus.ACTIVE,
          startTime: now,
          openingBalance,
          expectedBalance: openingBalance,
          totalSales: 0,
          totalTax: 0,
          totalDiscount: 0,
          transactionCount: 0,
          cashTotal: 0,
          cardTotal: 0,
          mobileMoneyTotal: 0,
          bankTransferTotal: 0,
          creditTotal: 0,
          updatedAt: now,
        },
      })

      let cashDrawer = await tx.cashDrawer.findFirst({
        where: {
          terminalId: stationId,
          locationId,
        },
      })

      if (!cashDrawer) {
        cashDrawer = await tx.cashDrawer.create({
          data: {
            id: createId(),
            name: `Cash Drawer - ${station.name}`,
            drawerNumber: `DRAWER-${station.terminalNumber}`,
            terminalId: stationId,
            locationId,
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
            updatedAt: now,
          },
        })
      } else {
        cashDrawer = await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
            updatedAt: now,
          },
        })
      }

      await tx.cashDrawerTransaction.create({
        data: {
          id: createId(),
          cashDrawerId: cashDrawer.id,
          sessionId: createdSession.id,
          userId,
          type: CashDrawerTransactionType.OPENING_BALANCE,
          amount: openingBalance,
          reason: "Session opening balance",
          balanceBefore: 0,
          balanceAfter: openingBalance,
        },
      })

      await tx.pOSStation.update({
        where: { id: stationId },
        data: {
          currentSessionId: createdSession.id,
          updatedAt: now,
        },
      })

      return createdSession
    })

    revalidateCashDrawerPaths()
    return { success: true, sessionId: session.id }
  } catch (error) {
    console.error("Error opening POS session:", error)
    return { success: false, error: "Failed to open session" }
  }
}

// Close POS session
export async function closePosSession(
  sessionId: string,
  actualBalance: number,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { session, cashDrawer } = await getSessionAndDrawer(sessionId)

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    if (session.status !== POSSessionStatus.ACTIVE) {
      return { success: false, error: "Session is not active" }
    }

    const expectedBalance = toNumber(session.expectedBalance)
    const variance = actualBalance - expectedBalance

    await db.$transaction(async (tx) => {
      const now = new Date()
      await tx.pOSSession.update({
        where: { id: sessionId },
        data: {
          status: POSSessionStatus.CLOSED,
          endTime: now,
          closingBalance: actualBalance,
          variance,
          notes,
          updatedAt: now,
        },
      })

      if (cashDrawer) {
        await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            isOpen: false,
            currentBalance: actualBalance,
            updatedAt: now,
          },
        })

        await tx.cashDrawerTransaction.create({
          data: {
            id: createId(),
            cashDrawerId: cashDrawer.id,
            sessionId,
            userId: session.userId,
            type: CashDrawerTransactionType.CLOSING_BALANCE,
            amount: actualBalance,
            reason: "Session closing balance",
            notes,
            balanceBefore: expectedBalance,
            balanceAfter: actualBalance,
          },
        })
      }

      await tx.pOSStation.update({
        where: { id: session.terminalId },
        data: {
          currentSessionId: null,
          updatedAt: now,
        },
      })
    })

    revalidateCashDrawerPaths()
    return { success: true }
  } catch (error) {
    console.error("Error closing POS session:", error)
    return { success: false, error: "Failed to close session" }
  }
}

// Add cash to drawer
export async function addCashToDrawer(
  sessionId: string,
  amount: number,
  reason: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { session, cashDrawer, error } = await getOpenDrawerForSession(sessionId)

    if (!session || !cashDrawer) {
      return { success: false, error }
    }

    const currentBalance = toNumber(cashDrawer.currentBalance)
    const newBalance = currentBalance + amount

    await db.$transaction(async (tx) => {
      const now = new Date()
      await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: newBalance,
          expectedBalance: newBalance,
          updatedAt: now,
        },
      })

      await tx.pOSSession.update({
        where: { id: sessionId },
        data: {
          expectedBalance: newBalance,
          updatedAt: now,
        },
      })

      await tx.cashDrawerTransaction.create({
        data: {
          id: createId(),
          cashDrawerId: cashDrawer.id,
          sessionId,
          userId: session.userId,
          type: CashDrawerTransactionType.CASH_IN,
          amount,
          reason,
          notes: description,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
        },
      })
    })

    revalidateCashDrawerPaths()
    return { success: true }
  } catch (error) {
    console.error("Error adding cash to drawer:", error)
    return { success: false, error: "Failed to add cash" }
  }
}

// Remove cash from drawer
export async function removeCashFromDrawer(
  sessionId: string,
  amount: number,
  reason: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { session, cashDrawer, error } = await getOpenDrawerForSession(sessionId)

    if (!session || !cashDrawer) {
      return { success: false, error }
    }

    const currentBalance = toNumber(cashDrawer.currentBalance)
    const newBalance = currentBalance - amount

    if (newBalance < 0) {
      return { success: false, error: "Insufficient cash in drawer" }
    }

    await db.$transaction(async (tx) => {
      const now = new Date()
      await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: newBalance,
          expectedBalance: newBalance,
          updatedAt: now,
        },
      })

      await tx.pOSSession.update({
        where: { id: sessionId },
        data: {
          expectedBalance: newBalance,
          updatedAt: now,
        },
      })

      await tx.cashDrawerTransaction.create({
        data: {
          id: createId(),
          cashDrawerId: cashDrawer.id,
          sessionId,
          userId: session.userId,
          type: CashDrawerTransactionType.CASH_OUT,
          amount: -amount,
          reason,
          notes: description,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
        },
      })
    })

    revalidateCashDrawerPaths()
    return { success: true }
  } catch (error) {
    console.error("Error removing cash from drawer:", error)
    return { success: false, error: "Failed to remove cash" }
  }
}

// Get current session
export async function getCurrentSession(stationId: string): Promise<CashDrawerSession | null> {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        terminalId: stationId,
        status: POSSessionStatus.ACTIVE,
      },
      include: {
        terminal: true,
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

    if (!session) return null

    const cashDrawer = await db.cashDrawer.findFirst({
      where: {
        terminalId: stationId,
        locationId: session.locationId,
      },
    })

    return mapSessionForClient(session, cashDrawer)
  } catch (error) {
    console.error("Error getting current session:", error)
    return null
  }
}

// Get cash drawer events
export async function getcashDrawerTransactions(sessionId: string, limit = 50): Promise<cashDrawerTransaction[]> {
  try {
    const events = await db.cashDrawerTransaction.findMany({
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

    return events.map((event) => ({
      id: event.id,
      cashDrawerId: event.cashDrawerId,
      sessionId: event.sessionId ?? undefined,
      userId: event.userId,
      type: event.type,
      amount: toNumber(event.amount),
      reason: event.reason ?? undefined,
      notes: event.notes ?? undefined,
      balanceBefore: toNumber(event.balanceBefore),
      balanceAfter: toNumber(event.balanceAfter),
      createdAt: event.createdAt,
      user: {
        firstName: event.user?.firstName ?? "",
        lastName: event.user?.lastName ?? "",
      },
    }))
  } catch (error) {
    console.error("Error getting cash drawer events:", error)
    return []
  }
}

// Get cash drawer summary
export async function getCashDrawerSummary(sessionId: string): Promise<CashDrawerSummary | null> {
  try {
    const { session, cashDrawer } = await getSessionAndDrawer(sessionId)

    if (!session || !cashDrawer) return null

    const events = await db.cashDrawerTransaction.findMany({
      where: { sessionId },
    })

    const totalSales = events
      .filter((event) => event.type === CashDrawerTransactionType.SALE)
      .reduce((sum, event) => sum + toNumber(event.amount), 0)

    const totalCashIn = events
      .filter((event) => event.type === CashDrawerTransactionType.CASH_IN)
      .reduce((sum, event) => sum + toNumber(event.amount), 0)

    const totalCashOut = events
      .filter((event) => event.type === CashDrawerTransactionType.CASH_OUT || event.type === CashDrawerTransactionType.PAYOUT)
      .reduce((sum, event) => sum + Math.abs(toNumber(event.amount)), 0)

    const lastEvent = events.length > 0
      ? [...events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
      : undefined

    const currentBalance = toNumber(cashDrawer.currentBalance)
    const expectedBalance = toNumber(cashDrawer.expectedBalance)

    return {
      currentBalance,
      expectedBalance,
      variance: currentBalance - expectedBalance,
      totalSales,
      totalCashIn,
      totalCashOut,
      eventCount: events.length,
      lastEvent,
    }
  } catch (error) {
    console.error("Error getting cash drawer summary:", error)
    return null
  }
}

// Record a sale transaction
export async function recordSaleTransaction(
  sessionId: string,
  amount: number,
  paymentMethod: "CASH" | "CARD" | "DIGITAL" = "CASH"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (paymentMethod !== "CASH") {
      return { success: true }
    }

    const { session, cashDrawer, error } = await getOpenDrawerForSession(sessionId)

    if (!session || !cashDrawer) {
      return { success: false, error }
    }

    const currentBalance = toNumber(cashDrawer.currentBalance)
    const newBalance = currentBalance + amount

    await db.$transaction(async (tx) => {
      const now = new Date()
      await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: newBalance,
          expectedBalance: newBalance,
          updatedAt: now,
        },
      })

      await tx.cashDrawerTransaction.create({
        data: {
          id: createId(),
          cashDrawerId: cashDrawer.id,
          sessionId,
          userId: session.userId,
          type: CashDrawerTransactionType.SALE,
          amount,
          reason: "Sale transaction",
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
        },
      })

      await tx.pOSSession.update({
        where: { id: sessionId },
        data: {
          totalSales: { increment: amount },
          transactionCount: { increment: 1 },
          cashTotal: { increment: amount },
          expectedBalance: newBalance,
          updatedAt: now,
        },
      })
    })

    revalidateCashDrawerPaths()
    return { success: true }
  } catch (error) {
    console.error("Error recording sale transaction:", error)
    return { success: false, error: "Failed to record sale" }
  }
}

// Reconcile session (final step before closing)
export async function reconcileSession(
  sessionId: string,
  actualCash: number,
  notes?: string
): Promise<{ success: boolean; variance?: number; error?: string }> {
  try {
    const { session, cashDrawer } = await getSessionAndDrawer(sessionId)

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    if (session.status !== POSSessionStatus.ACTIVE) {
      return { success: false, error: "Session is not active" }
    }

    const expectedBalance = toNumber(session.expectedBalance)
    const variance = actualCash - expectedBalance

    await db.$transaction(async (tx) => {
      const now = new Date()
      await tx.pOSSession.update({
        where: { id: sessionId },
        data: {
          status: POSSessionStatus.RECONCILED,
          closingBalance: actualCash,
          variance,
          notes,
          updatedAt: now,
        },
      })

      if (cashDrawer) {
        await tx.cashDrawerTransaction.create({
          data: {
            id: createId(),
            cashDrawerId: cashDrawer.id,
            sessionId,
            userId: session.userId,
            type: CashDrawerTransactionType.RECONCILIATION,
            amount: variance,
            reason: "Session reconciliation",
            notes: variance !== 0 ? `Variance: ${variance}` : notes,
            balanceBefore: expectedBalance,
            balanceAfter: actualCash,
          },
        })
      }
    })

    revalidateCashDrawerPaths()
    return { success: true, variance }
  } catch (error) {
    console.error("Error reconciling session:", error)
    return { success: false, error: "Failed to reconcile session" }
  }
}
