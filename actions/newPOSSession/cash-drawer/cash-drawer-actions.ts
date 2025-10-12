"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export interface CashDrawerSession {
  id: string
  sessionNumber: string
  stationId: string
  userId: string
  locationId: string
  organizationId: string
  status: "active" | "closed" | "suspended"
  openedAt: Date
  closedAt?: Date
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  actualBalance?: number
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
  cashDrawer: {
    id: string
    currentBalance: number
    expectedBalance: number
    status: string
  }
}

export interface CashDrawerTransaction {
  id: string
  drawerId: string
  sessionId: string
  userId: string
  type: "opening" | "sale" | "cash_in" | "cash_out" | "closing"
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
  stationId: string,
  userId: string,
  locationId: string,
  organizationId: string,
  openingBalance: number,
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    // Check if there's already an active session for this station
    const existingSession = await db.pOSSession.findFirst({
      where: {
        stationId,
        status: "ACTIVE",
      },
    })

    if (existingSession) {
      return { success: false, error: "station already has an active session" }
    }

    // Generate session number
    const sessionNumber = `SES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create new session
    const session = await db.pOSSession.create({
      data: {
        sessionNumber,
        stationId,
        userId,
        locationId,
        status: "ACTIVE",
        openingBalance,
        expectedBalance: openingBalance,
      },
    })

    // Get or create cash drawer for this station
    let cashDrawer = await db.cashDrawer.findFirst({
      where: { stationId },
    })

    if (!cashDrawer) {
      cashDrawer = await db.cashDrawer.create({
        data: {
          drawerNumber: `DRAWER-${stationId}`,
          name: `Drawer for station ${stationId}`,
          stationId,
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
        userId: session.userId,
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
        
        cashDrawerTransactions:{
          include: {
            cashDrawer: {
              select: {
                id: true,
                currentBalance: true,
                expectedBalance: true,
              },
        },
        },
       },
    },})

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
        closingBalance: actualBalance,
        endTime: new Date(),
        notes,
      },
    })

    // Update cash drawer
    if (session.cashDrawerTransactions && session.cashDrawerTransactions.length > 0 && session.cashDrawerTransactions[0].cashDrawer) {
      await db.cashDrawer.update({
        where: { id: session.cashDrawerTransactions[0].cashDrawerId },
        data: {
          isOpen: false,
          currentBalance: actualBalance,
          // lastReconciledAt: new Date(),
        },
      })

      // Record closing transaction
      await db.cashDrawerTransaction.create({
        data: {
          cashDrawerId: session?.cashDrawerTransactions[0]?.cashDrawerId,
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
      include: { 
        cashDrawerTransactions:{
          include: { 
            cashDrawer: {
            select: {
              id: true,
              currentBalance: true,
              expectedBalance: true,
            }
          } 
        },
    },}})

    if (!session || !session.cashDrawerTransactions || session.cashDrawerTransactions.length === 0) {
      return { success: false, error: "Session or cash drawer not found" }
    }

    const currentBalance = session.cashDrawerTransactions[0]?.cashDrawer?.currentBalance ?? 0
    const newBalance = currentBalance + amount

    // Update cash drawer balance
    await db.cashDrawer.update({
      where: { id: session.cashDrawerTransactions[0]?.cashDrawerId },
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
        cashDrawerId: session?.cashDrawerTransactions[0]?.cashDrawerId,
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
              include: {
                cashDrawer: {
                  select: {
                    id: true,
                    currentBalance: true,
                    expectedBalance: true,
                  }
                }
              }
            }
          },
        },)
 if (!session || !session.cashDrawerTransactions || session.cashDrawerTransactions.length === 0 || !session.cashDrawerTransactions[0].cashDrawer) {
   
     return { success: false, error: "Session or cash drawer not found" }
    }
  

    const currentBalance = session.cashDrawerTransactions[0]?.cashDrawer?.currentBalance ?? 0
    const newBalance = currentBalance - amount

    if (newBalance < 0) {
      return { success: false, error: "Insufficient cash in drawer" }
    }

    // Update cash drawer balance
    await db.cashDrawer.update({
      where: { id: session.cashDrawerTransactions[0]?.cashDrawerId },
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
        cashDrawerId: session.cashDrawerTransactions[0]?.cashDrawerId,
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

    revalidatePath("/dashboard/app/sales/pos")
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
        stationId,
        status: "ACTIVE",
      },
      include: {
        station: {
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
        cashDrawerTransactions: {
          include: {
            cashDrawer: {
              select: {
                id: true,
                currentBalance: true,
                expectedBalance: true,
                isOpen  : true,
              },
            },
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

// Get cash drawer transactions
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

    // Map cashDrawerId to drawerId to match the interface
    // Only include transactions with allowed types
    const allowedTypes = ["opening", "sale", "cash_in", "cash_out", "closing"] as const
    return transactions
      .filter((t) => allowedTypes.includes(t.type.toLowerCase() as any))
      .map((t) => ({
        ...t,
        drawerId: (t as any).cashDrawerId,
        type: t.type.toLowerCase() as CashDrawerTransaction["type"],
        user: {
          firstName: t.user?.firstName ?? "",
          lastName: t.user?.lastName ?? "",
        },
      })) as CashDrawerTransaction[]
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
          include: {
            cashDrawer: {
              select: {
                id: true,
                currentBalance: true,
                expectedBalance: true,
                isOpen  : true,
              },
            },
          },
        },
      },})

    if (!session || !session?.cashDrawerTransactions[0]?.cashDrawerId) {
      return null
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
      currentBalance: session?.cashDrawerTransactions[0]?.cashDrawer.currentBalance,
      expectedBalance: session?.cashDrawerTransactions[0]?.cashDrawer.expectedBalance,
      variance: session?.cashDrawerTransactions[0]?.cashDrawer.currentBalance - session?.cashDrawerTransactions[0]?.cashDrawer.expectedBalance,
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
