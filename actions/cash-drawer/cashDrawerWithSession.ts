"use server"

import { db } from "@/prisma/db";
import type { CashDrawerTransactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined

function toNumber(value: DecimalLike): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value.toString()) || 0
}

export interface CashDrawerSession {
  id: string
  sessionNumber: string
  terminalId: string
  userId: string
  locationId: string
  organizationId: string
  status: "ACTIVE" | "CLOSED" | "SUSPENDED"
  openedAt: Date
  closedAt?: Date
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  actualBalance?: number
  variance?: number
  notes?: string
  terminal: {
    id: string
    name: string
    terminalNumber: string
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  cashDrawer: {
    id: string
    currentBalance: number
    expectedBalance: number
    status: string
  }
}

export interface cashDrawerTransaction {
  id: string
  drawerId: string
  sessionId: string
  userId: string
  type: CashDrawerTransactionType
  amount: number
  reason?: string
  description?: string
  referenceNumber?: string
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
  transactionCount: number
  lastTransaction?: Date
}

// Open a new POS session with cash drawer
export async function openPosSession(
  terminalId: string,
  userId: string,
  locationId: string,
  organizationId: string,
  openingBalance: number,
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    // Check if there's already an active session for this terminal
    const existingSession = await db.pOSSession.findFirst({
      where: {
        terminalId,
        status: "ACTIVE",
      },
    })

    if (existingSession) {
      return { success: false, error: "Terminal already has an active session" }
    }

    // Generate session number
    const sessionNumber = `SES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create new session
    const session = await db.pOSSession.create({
      data: {
        sessionNumber,
        terminalId,
        userId,
        locationId,
        organizationId,
        status: "ACTIVE",
        openingBalance: openingBalance,
        expectedBalance: openingBalance,
        startTime: new Date(),
      },
    })

    // Get or create cash drawer for this terminal
    let cashDrawer = await db.cashDrawer.findFirst({
      where: { terminalId },
    })

    if (!cashDrawer) {
      cashDrawer = await db.cashDrawer.create({
        data: {
          drawerNumber: `DRAWER-${terminalId}`,
          name: `Drawer for Terminal ${terminalId}`,
          terminalId,
          locationId,
          currentBalance: openingBalance,
          expectedBalance: openingBalance,
          isOpen: true,
        },
      })
    } else {
      // Update cash drawer
      await db.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: openingBalance,
          expectedBalance: openingBalance,
          isOpen: true,
        },
      })
    }

    // Record opening transaction
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

    revalidatePath("/pos")
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
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: { 
        cashDrawerTransactions: {
          select: { 
            id: true,
            cashDrawerId: true 
          }
        }
      },
    })

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    if (session.status !== "ACTIVE") {
      return { success: false, error: "Session is not active" }
    }

    // Get cash drawer from the first event (most reliable way)
    let cashDrawer = null
    if (session.cashDrawerTransactions.length > 0) {
      const cashDrawerId = session.cashDrawerTransactions[0].cashDrawerId
      cashDrawer = await db.cashDrawer.findUnique({
        where: { id: cashDrawerId }
      })
    }

    const expectedBalance = toNumber(session.expectedBalance)
    const variance = actualBalance - expectedBalance

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

    // Update cash drawer
    if (cashDrawer) {
      await db.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          isOpen: false,
          currentBalance: actualBalance,
          expectedBalance: actualBalance,
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
          notes: notes,
          balanceBefore: expectedBalance,
          balanceAfter: actualBalance,
        },
      })
    }

    revalidatePath("/pos")
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
  description?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        cashDrawerTransactions: {
          select: {
            cashDrawerId: true
          },
          take: 1
        }
      }
    })

    if (!session || session.cashDrawerTransactions.length === 0) {
      return { success: false, error: "Session or cash drawer not found" }
    }

    const cashDrawerId = session.cashDrawerTransactions[0].cashDrawerId

    // Get current cash drawer balance
    const cashDrawer = await db.cashDrawer.findUnique({
      where: { id: cashDrawerId }
    })

    if (!cashDrawer) {
      return { success: false, error: "Cash drawer not found" }
    }

    const currentBalance = toNumber(cashDrawer.currentBalance)
    const newBalance = currentBalance + amount

    // Update cash drawer balance
    await db.cashDrawer.update({
      where: { id: cashDrawerId },
      data: {
        currentBalance: newBalance,
        expectedBalance: newBalance,
      },
    })

    // Update session expected balance
    await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        expectedBalance: newBalance,
      },
    })

    // Record transaction
    await db.cashDrawerTransaction.create({
      data: {
        cashDrawerId,
        sessionId,
        userId: session.userId,
        type: "CASH_IN",
        amount,
        reason,
        notes: description,
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

// Remove cash from drawer
export async function removeCashFromDrawer(
  sessionId: string,
  amount: number,
  reason: string,
  description?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        cashDrawerTransactions: {
          select: {
            cashDrawerId: true
          },
          take: 1
        }
      }
    })

    if (!session || session.cashDrawerTransactions.length === 0) {
      return { success: false, error: "Session or cash drawer not found" }
    }

    const cashDrawerId = session.cashDrawerTransactions[0].cashDrawerId

    // Get current cash drawer balance
    const cashDrawer = await db.cashDrawer.findUnique({
      where: { id: cashDrawerId }
    })

    if (!cashDrawer) {
      return { success: false, error: "Cash drawer not found" }
    }

    const currentBalance = toNumber(cashDrawer.currentBalance)
    const newBalance = currentBalance - amount

    if (newBalance < 0) {
      return { success: false, error: "Insufficient cash in drawer" }
    }

    // Update cash drawer balance
    await db.cashDrawer.update({
      where: { id: cashDrawerId },
      data: {
        currentBalance: newBalance,
        expectedBalance: newBalance,
      },
    })

    // Update session expected balance
    await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        expectedBalance: newBalance,
      },
    })

    // Record transaction
    await db.cashDrawerTransaction.create({
      data: {
        cashDrawerId,
        sessionId,
        userId: session.userId,
        type: "CASH_OUT",
        amount,
        reason,
        notes: description,
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

// Get current session
export async function getCurrentSession(terminalId: string): Promise<CashDrawerSession | null> {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        terminalId,
        status: "ACTIVE",
      },
      include: {
        terminal: {
          select: {
            id: true,
            name: true,
            terminalNumber: true,
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
        cashDrawerTransactions: {
          include: {
            cashDrawer: {
              select: {
                id: true,
                currentBalance: true,
                expectedBalance: true,
                isOpen: true,
              }
            }
          },
          take: 1
        }
      },
    })

    return session as unknown as CashDrawerSession | null
  } catch (error) {
    console.error("Error getting current session:", error)
    return null
  }
}

// Get cash drawer transactions
export async function getcashDrawerTransactions(sessionId: string, limit = 50): Promise<cashDrawerTransaction[]> {
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

    // Map cashDrawerId to drawerId to match cashDrawerTransaction interface
    return transactions.map((t) => ({
      id: t.id,
      drawerId: t.cashDrawerId,
      sessionId: t.sessionId ?? "",
      userId: t.userId,
      type: t.type,
      amount: toNumber(t.amount),
      reason: t.reason ?? undefined,
      description: t.notes ?? undefined,
      balanceBefore: toNumber(t.balanceBefore),
      balanceAfter: toNumber(t.balanceAfter),
      createdAt: t.createdAt,
      // Ensure user fields are not null
      user: {
        firstName: t.user.firstName ?? "",
        lastName: t.user.lastName ?? "",
      },
    }))
  } catch (error) {
    console.error("Error getting cash drawer transactions:", error)
    return []
  }
}

// Get cash drawer summary
export async function getCashDrawerSummary(sessionId: string): Promise<CashDrawerSummary | null> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        cashDrawerTransactions: {
          select: {
            cashDrawerId: true
          },
          take: 1
        }
      }
    })

    if (!session || session.cashDrawerTransactions.length === 0) {
      return null
    }

    const cashDrawerId = session.cashDrawerTransactions[0].cashDrawerId

    // Get current cash drawer
    const cashDrawer = await db.cashDrawer.findUnique({
      where: { id: cashDrawerId }
    })

    if (!cashDrawer) {
      return null
    }

    // Get all transactions for this session
    const transactions = await db.cashDrawerTransaction.findMany({
      where: { sessionId },
    })

    const totalSales = transactions
      .filter((t) => t.type === "SALE")
      .reduce((sum, t) => sum + toNumber(t.amount), 0)

    const totalCashIn = transactions
      .filter((t) => t.type === "CASH_IN")
      .reduce((sum, t) => sum + toNumber(t.amount), 0)

    const totalCashOut = transactions
      .filter((t) => t.type === "CASH_OUT")
      .reduce((sum, t) => sum + toNumber(t.amount), 0)

    const lastTransaction = transactions.length > 0
      ? transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
      : undefined

    return {
      currentBalance: toNumber(cashDrawer.currentBalance),
      expectedBalance: toNumber(session.expectedBalance),
      variance: toNumber(cashDrawer.currentBalance) - toNumber(session.expectedBalance),
      totalSales,
      totalCashIn,
      totalCashOut,
      transactionCount: transactions.length,
      lastTransaction,
    }
  } catch (error) {
    console.error("Error getting cash drawer summary:", error)
    return null
  }
}
