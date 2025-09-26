"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export interface CashDrawerSession {
  id: string
  sessionNumber: string
  terminalId: string
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





// export interface  POSSession {
//   sessionNumber:string
//   status:string
//   startTime:string
//   endTime:string

//   terminalId:string
//   terminal:string
//   locationId:string
//   currentStation:string

//   userId:string
//   user:string

//   openingBalance:string
//   closingBalance:string
//   expectedBalance:string
//   variance:string

//   totalSales:string
//   totalTax:string
//   totalDiscount:string
//   transactionCount:string

//   cashTotal:string
//   cardTotal:string
//   digitalTotal:string

//   salesOrders:string
//   cashDrawerTransactions:string

//   notes:string

//   createdAt:string
//   updatedAt:string
//   POSStation:string
//   Location:string

// }
// Open a new POS session with cash drawer
export async function openPosSession(
  terminalId: string, userId: string, locationId: string, organizationId: string, openingBalance: number): Promise<{ success: boolean; sessionId?: string; error?: string }> {
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

    // Verify terminal exists and is active
    const terminal = await db.pOSStation.findFirst({
      where: {
        id: terminalId,
        isActive: true,
      },
    })

    if (!terminal) {
      return { success: false, error: "Terminal not found or inactive" }
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
        status: "ACTIVE",
        openingBalance: openingBalance,
        expectedBalance: openingBalance,
      },
    })

    // Get or create cash drawer for this terminal
    let cashDrawer = await db.cashDrawer.findFirst({
      where: { terminalId },
    })

    if (!cashDrawer) {
      cashDrawer = await db.cashDrawer.create({
        data: {
          name: `Cash Drawer - ${terminal.name}`,
          drawerNumber: `DRAWER-${terminal.terminalNumber}`,
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

    // Update terminal's current session
    await db.pOSStation.update({
      where: { id: terminalId },
      data: {
        currentSessionId: session.id,
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
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        terminal: {
          include: {
            CashDrawer: true,
          },
        },
      },
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

    // Update cash drawer
    const cashDrawer = session.terminal.CashDrawer[0]
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
      where: { id: session.terminalId },
      data: {
        currentSessionId: null,
      },
    })

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
  description?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        terminal: {
          include: {
            CashDrawer: true,
          },
        },
      },
    })

    if (!session || session.status !== "ACTIVE") {
      return { success: false, error: "Active session not found" }
    }

    const cashDrawer = session.terminal.CashDrawer[0]
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
        cashDrawerId: cashDrawer.id,
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
  description?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        terminal: {
          include: {
            CashDrawer: true,
          },
        },
      },
    })

    if (!session || session.status !== "ACTIVE") {
      return { success: false, error: "Active session not found" }
    }

    const cashDrawer = session.terminal.CashDrawer[0]
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
        cashDrawerId: cashDrawer.id,
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
            CashDrawer: {
              select: {
                id: true,
                currentBalance: true,
                expectedBalance: true,
                isOpen: true,
              },
            },
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

    if (!session) return null

    return {
      id: session.id,
      sessionNumber: session.sessionNumber,
      terminalId: session.terminalId,
      userId: session.userId,
      locationId: session.locationId,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime ?? undefined,
      openingBalance: session.openingBalance,
      closingBalance: session.closingBalance ?? undefined,
      expectedBalance: session.expectedBalance ?? undefined,
      variance: session.variance ?? undefined,
      notes: session.notes ?? undefined,
      terminal: session.terminal,
      user: {
        id: session.user.id,
        firstName: session.user.firstName ?? "",
        lastName: session.user.lastName ?? "",
        email: session.user.email,
      },
      cashDrawer: session.terminal.CashDrawer[0] || undefined,
    }
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

    return events.map(event => ({
      id: event.id,
      cashDrawerId: event.cashDrawerId,
      sessionId: event.sessionId ?? undefined,
      userId: event.userId,
      type: event.type,
      amount: event.amount,
      reason: event.reason ?? undefined,
      notes: event.notes ?? undefined,
      balanceBefore: event.balanceBefore ?? undefined,
      balanceAfter: event.balanceAfter ?? undefined,
      createdAt: event.createdAt ?? undefined,
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
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        terminal: {
          include: {
            CashDrawer: true,
          },
        },
      },
    })

    if (!session) return null

    const cashDrawer = session.terminal.CashDrawer[0]
    if (!cashDrawer) return null

    const events = await db.cashDrawerTransaction.findMany({
      where: { sessionId },
    })

    const totalSales = events
      .filter((e) => e.type === "SALE")
      .reduce((sum, e) => sum + e.amount, 0)

    const totalCashIn = events
      .filter((e) => e.type === "CASH_IN")
      .reduce((sum, e) => sum + e.amount, 0)

    const totalCashOut = events
      .filter((e) => e.type === "CASH_OUT" || e.type === "PAYOUT")
      .reduce((sum, e) => sum + e.amount, 0)

    const lastEvent = events.length > 0
      ? events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
      : undefined

    return {
      currentBalance: cashDrawer.currentBalance,
      expectedBalance: cashDrawer.expectedBalance,
      variance: cashDrawer.currentBalance - cashDrawer.expectedBalance,
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
      // For non-cash payments, we don't need to update cash drawer
      return { success: true }
    }

    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        terminal: {
          include: {
            CashDrawer: true,
          },
        },
      },
    })

    if (!session || session.status !== "ACTIVE") {
      return { success: false, error: "Active session not found" }
    }

    const cashDrawer = session.terminal.CashDrawer[0]
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

    // Record sale event
    await db.cashDrawerTransaction.create({
      data: {
        cashDrawerId: cashDrawer.id,
        sessionId,
        userId: session.userId,
        type: "SALE",
        amount,
        reason: "Sale transaction",
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      },
    })

    // Update session totals
    await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        totalSales: { increment: amount },
        transactionCount: { increment: 1 },
        cashTotal: paymentMethod === "CASH" ? { increment: amount } : undefined,
        // cardTotal: paymentMethod === "CARD" ? { increment: amount } : undefined,
        // digitalTotal: paymentMethod === "DIGITAL" ? { increment: amount } : undefined,
      },
    })

    revalidatePath("/pos")
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
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        terminal: {
          include: {
            CashDrawer: true,
          },
        },
      },
    })

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    if (session.status !== "ACTIVE") {
      return { success: false, error: "Session is not active" }
    }

    const expectedBalance = session.expectedBalance || 0
    const variance = actualCash - expectedBalance

    // Update session
    await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        status: "RECONCILED",
        closingBalance: actualCash,
        variance: variance,
        notes,
      },
    })

    const cashDrawer = session.terminal.CashDrawer[0]
    if (cashDrawer) {
      // Record reconciliation event
      await db.cashDrawerTransaction.create({
        data: {
          cashDrawerId: cashDrawer.id,
          sessionId,
          userId: session.userId,
          type: "RECONCILIATION",
          amount: actualCash,
          reason: "Session reconciliation",
          notes: variance !== 0 ? `Variance: ${variance}` : undefined,
          balanceBefore: expectedBalance,
          balanceAfter: actualCash,
        },
      })
    }

    revalidatePath("/pos")
    return { success: true, variance }
  } catch (error) {
    console.error("Error reconciling session:", error)
    return { success: false, error: "Failed to reconcile session" }
  }
}