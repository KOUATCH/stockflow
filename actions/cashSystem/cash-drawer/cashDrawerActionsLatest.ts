"use server"

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export interface CashDrawerSession {
  id: string
  sessionNumber: string
  terminalId: string
  userId: string
  locationId: string
  organizationId: string
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
  transactionCount: number
  // success: boolean
  // error?: string
}


export interface POSSessionTypes {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: "ACTIVE" | "CLOSED" | "SUSPENDED" | "RECONCILED";
  notes: string | null;
  locationId: string;
  terminalId: string;
  variance: number | null;
  sessionNumber: string;
  startTime: Date;
  endTime: Date | null;
  openingBalance: number;
  closingBalance: number | null;
  expectedBalance: number | null;
  totalSales: number;
  totalTax: number;
  totalDiscount: number;
  transactionCount: number;
  cashTotal: number;
  cardTotal: number;
  digitalTotal: number;
  cashDrawerTransactions: {
    id: string;
    drawerId: string;
    sessionId: string;
    userId: string;
    type: "OPENING_BALANCE" | "SALE" | "CASH_IN" | "CASH_OUT" | "CLOSING_BALANCE" | "RECONCILIATION" | "RETURN" | "REFUND" | "PAYOUT";
    amount: number;
    reason?: string;
    notes?: string;
    balanceBefore: number;
    balanceAfter: number;
    createdAt: Date;
    user: {
      firstName: string;
      lastName: string;
    }
    cashDrawer: {
      id: string;
      currentBalance: number;
      expectedBalance: number;
      isOpen: boolean
    }[];
    POSStation: {
      id: string;
      terminalNumber: string;
      name: string;
    }
    Location: {
      id: string;
    }


  }
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
      include: { cashDrawerTransactions: true },
    }) as (POSSessionTypes & { cashDrawerTransactions: { id: string; drawerId: string; sessionId: string; }[] }) | null

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    // Fetch the cash drawer separately if needed
    let cashDrawer = null
    if (session?.cashDrawerTransactions[0]?.drawerId) {
      cashDrawer = await db.cashDrawer.findUnique({
        where: { id: session?.cashDrawerTransactions[0]?.drawerId },
      })
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

    if (session?.cashDrawerTransactions[0]?.drawerId) {
      await db.cashDrawer.update({
        where: { id: session?.cashDrawerTransactions[0]?.drawerId },
        data: {
          currentBalance: actualBalance,
        },
      })

      // Record closing transaction
      await db.cashDrawerTransaction.create({
        data: {
          cashDrawerId: session?.cashDrawerTransactions[0]?.drawerId as string,
          sessionId,
          userId: session.userId,
          type: "CLOSING_BALANCE",
          amount: actualBalance,
          reason: "Session closing balance",
          notes: notes,
          balanceBefore: session.expectedBalance || 0,
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
      include: { cashDrawerTransactions: true },
    }) as (POSSessionTypes & { cashDrawerTransactions: { id: string; drawerId: string; sessionId: string; CashDrawer: { id: string; currentBalance: number , expectedBalance: number; } }[] }) | null

    if (!session || !session.cashDrawerTransactions[0]) {
      return { success: false, error: "Session or cash drawer not found" }
    }

    const currentBalance = session.cashDrawerTransactions[0].CashDrawer.currentBalance || 0
    const newBalance = currentBalance + amount

    // Update cash drawer balance
    await db.cashDrawer.update({
      where: { id: session.cashDrawerTransactions[0].drawerId },
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
        cashDrawerId: session.cashDrawerTransactions[0].drawerId,
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
      include: { cashDrawerTransactions: true },
    }) as (POSSessionTypes & { cashDrawerTransactions: { id: string; drawerId: string; sessionId: string; CashDrawer: { id: string; currentBalance: number , expectedBalance: number; } }[] }) | null

    if (!session || !session.cashDrawerTransactions[0]) {
      return { success: false, error: "Session or cash drawer not found" }
    }

    const currentBalance = session.cashDrawerTransactions[0].CashDrawer.currentBalance || 0
    const newBalance = currentBalance - amount

    if (newBalance < 0) {
      return { success: false, error: "Insufficient cash in drawer" }
    }

    // Update cash drawer balance
    await db.cashDrawer.update({
      where: { id: session.cashDrawerTransactions[0].drawerId },
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
        cashDrawerId: session.cashDrawerTransactions[0].drawerId,
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
          select: {
            id: true,
            cashDrawerId: true,
            cashDrawer: {
              select: {
                id: true,
                currentBalance: true,
                expectedBalance: true,
                isOpen: true,
              },
            },
          },
        },
      },
    });

    return session as CashDrawerSession | null;
  } catch (error) {
    console.error("Error getting current session:", error);
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

    return transactions as cashDrawerTransaction[]
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
      include: { cashDrawerTransactions: true },
    }) as (POSSessionTypes & { cashDrawerTransactions: { id: string; drawerId: string; sessionId: string; cashDrawer: { id: string; currentBalance: number , expectedBalance: number; } }[] }) | null

    if (!session || !session.cashDrawerTransactions[0]) {
      return  null
    }

    const transactions = await db.cashDrawerTransaction.findMany({
      where: { sessionId },
    })

    const totalSales = transactions.filter((t) => t.type === "SALE").reduce((sum, t) => sum + t.amount, 0)

    const totalCashIn = transactions
      .filter((t) => t.type === "CASH_IN")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalCashOut = transactions
      .filter((t) => t.type === "CASH_OUT")
      .reduce((sum, t) => sum + t.amount, 0)

    const lastTransaction =
      transactions.length > 0
        ? transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : undefined

    return {
      currentBalance: session.cashDrawerTransactions[0].cashDrawer.currentBalance,
      expectedBalance: session.cashDrawerTransactions[0].cashDrawer?.expectedBalance,
      variance: session.cashDrawerTransactions[0].cashDrawer.currentBalance - session.cashDrawerTransactions[0].cashDrawer.expectedBalance,
      totalSales,
      totalCashIn,
      totalCashOut,
      transactionCount: transactions.length,
      eventCount: transactions.length,
      lastEvent: lastTransaction,
    } as CashDrawerSummary
  } catch (error) {
    console.error("Error getting cash drawer summary:", error)
    return null
  }
}
