"use server"

import { db } from "@/prisma/db"
// import { POSSessionStatus } from "@/types"

export async function openPOSSession(data: {
  terminalId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance: number
}) {
  try {
    console.log("[v0] Opening POS session with data:", data)

    // Check if there's already an active session for this terminal
    const existingSession = await db.pOSSession.findFirst({
      where: {
        terminalId: data.terminalId,
        status: "ACTIVE",
      },
    })

    if (existingSession) {
      return {
        success: false,
        error: "Terminal already has an active session",
      }
    }

    // Create new session
    const session = await db.pOSSession.create({
      data: {
        terminalId: data.terminalId,
        userId: data.userId,
        locationId: data.locationId,
        openingBalance: data.openingBalance,
        status: "ACTIVE",
        startTime: new Date(),
        sessionNumber: `SES-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
      },
    })

    // Create cash drawer entry
    await db.cashDrawer.create({
      data: {
        terminalId: data.terminalId,
        locationId: data.locationId,
        name: `Drawer-${data.terminalId}`,
        drawerNumber: " 1",
        currentBalance: data.openingBalance,
        expectedBalance: data.openingBalance,
        isOpen: true,
      },
    })

    // Find the cash drawer for this terminal and location
    const cashDrawer = await db.cashDrawer.findFirst({
      where: {
        terminalId: data.terminalId,
        locationId: data.locationId,
        isOpen: true,
      },
    })

    if (!cashDrawer) {
      throw new Error("Cash drawer not found for this terminal and location")
    }

    // Create opening cash transaction
    await db.cashDrawerTransaction.create({
      data: {
        sessionId: session.id,
        cashDrawerId: cashDrawer.id,
        type: "CASH_IN",
        amount: data.openingBalance,
        balanceBefore: data.openingBalance,
        balanceAfter: data.openingBalance,
        notes: "Opening cash",
        userId: data.userId,
      },
    })

    console.log("[v0] Session opened successfully:", session.id)
    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("[v0] Error opening session:", error)
    return {
      success: false,
      error: "Failed to open session",
    }
  }
}

export async function closePOSSession(data: {
  sessionId: string
  terminalId: string
  closingBalance: number
  userId: string
}) {
  try {
    console.log("[v0] Closing POS session:", data.sessionId)

    // Update session status
    const session = await db.pOSSession.update({
      where: { id: data.sessionId },
      data: {
        status: "SUSPENDED",
        endTime: new Date(),
        closingBalance: data.closingBalance,
      },
    })

    // Find the open cash drawer for this terminal
    const cashDrawer = await db.cashDrawer.findFirst({
      where: {
        terminalId: data.terminalId,
        isOpen: true,
      },
    })

    if (!cashDrawer) {
      throw new Error("Open cash drawer not found for this terminal")
    }

    // Update cash drawer
    await db.cashDrawer.update({
      where: { id: cashDrawer.id },
      data: {
        isOpen: false,
        currentBalance: 0,
      },
    })

    // Create closing cash transaction
    await db.cashDrawerTransaction.create({
      data: {
        sessionId: data.sessionId,
        cashDrawerId: cashDrawer.id,
        type: "CASH_OUT",
        amount: data.closingBalance,
        balanceBefore: cashDrawer.currentBalance,
        balanceAfter: 0,
        notes: "Closing cash",
        userId: data.userId,
      },
    })

    console.log("[v0] Session closed successfully")
    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("[v0] Error closing session:", error)
    return {
      success: false,
      error: "Failed to close session",
    }
  }
}

export async function getCurrentSession(terminalId: string) {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        terminalId,
        status: "ACTIVE",
      },
      include: {
        terminal: true,
        user: true,
        cashDrawerTransactions: {
          include: {
            cashDrawer: true,
          },
        },
      },
    })

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("[v0] Error getting current session:", error)
    return {
      success: false,
      error: "Failed to get current session",
    }
  }
}

export async function getSessionAnalytics(sessionId: string) {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        salesOrders: {
          include: {
            lines: {
              include: {
                item: true,
              },
            },
            payments: true,
          },
        },
        cashDrawerTransactions: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        terminal: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    // Calculate session metrics
    const totalSales = session.salesOrders.reduce((sum, sale) => sum + sale.total, 0)
    const totalTransactions = session.salesOrders.length
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0

    const totalItemsSold = session.salesOrders.reduce((sum, sale) => {
      return sum + sale.lines.reduce((lineSum, line) => lineSum + line.quantity, 0)
    }, 0)

    // Payment method breakdown
    const payments = session.salesOrders.flatMap((sale) => sale.payments)
    const cashTotal = payments.filter((p) => p.method === "CASH").reduce((sum, p) => sum + p.amount, 0)
    const cardTotal = payments.filter((p) => p.method === "CARD").reduce((sum, p) => sum + p.amount, 0)
    const digitalTotal = payments.filter((p) => p.method === "DIGITAL").reduce((sum, p) => sum + p.amount, 0)

    // Cash drawer summary
    const cashIn = session.cashDrawerTransactions
      .filter((t) => ["SALE", "CASH_IN", "OPENING_BALANCE"].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0)

    const cashOut = session.cashDrawerTransactions
      .filter((t) => ["REFUND", "CASH_OUT", "PAYOUT"].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0)

    const variance = session.variance || 0

    // Top selling items
    const itemSales = new Map<string, { name: string; sku: string; quantity: number; revenue: number }>()

    session.salesOrders.forEach((sale) => {
      sale.lines.forEach((line) => {
        const key = line.itemId
        const existing = itemSales.get(key) || {
          name: line.item.name,
          sku: line.item.sku,
          quantity: 0,
          revenue: 0,
        }
        existing.quantity += line.quantity
        existing.revenue += line.lineTotal
        itemSales.set(key, existing)
      })
    })

    const topItems = Array.from(itemSales.entries())
      .map(([itemId, data]) => ({
        itemId,
        name: data.name,
        sku: data.sku,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return {
      success: true,
      data: {
        session: {
          id: session.id,
          sessionNumber: session.sessionNumber,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status,
          cashierName: `${session.user.firstName} ${session.user.lastName}`,
          terminalName: session.terminal?.name || "Unknown Terminal",
        },
        metrics: {
          totalSales,
          totalTransactions,
          averageTransaction,
          totalItemsSold,
          cashTotal,
          cardTotal,
          digitalTotal,
          openingBalance: session.openingBalance,
          closingBalance: session.closingBalance,
          expectedBalance: session.expectedBalance,
          variance,
          cashIn,
          cashOut,
        },
        topItems,
      },
    }
  } catch (error) {
    console.error("[v0] Error getting session analytics:", error)
    return {
      success: false,
      error: "Failed to get session analytics",
    }
  }
}

export async function reconcileSession(data: {
  sessionId: string
  actualClosingBalance: number
  userId: string
  notes?: string
}) {
  try {
    console.log("[v0] Reconciling session:", data.sessionId)

    const session = await db.pOSSession.findUnique({
      where: { id: data.sessionId },
      include: {
        cashDrawerTransactions: {
          include: {
            cashDrawer: true,
          },
        },
      },
    })

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    // Calculate expected balance
    const expectedBalance = session.expectedBalance || 0
    const variance = data.actualClosingBalance - expectedBalance

    // Update session with reconciliation data
    const updatedSession = await db.pOSSession.update({
      where: { id: data.sessionId },
      data: {
        closingBalance: data.actualClosingBalance,
        variance,
        status: "RECONCILED",
        notes: data.notes,
      },
    })

    // Create reconciliation transaction
    const cashDrawer = session.cashDrawerTransactions[0]?.cashDrawer
    if (cashDrawer) {
      await db.cashDrawerTransaction.create({
        data: {
          sessionId: data.sessionId,
          cashDrawerId: cashDrawer.id,
          type: "RECONCILIATION",
          amount: variance,
          balanceBefore: expectedBalance,
          balanceAfter: data.actualClosingBalance,
          notes: `Reconciliation: ${data.notes || "No notes"}`,
          userId: data.userId,
        },
      })
    }

    console.log("[v0] Session reconciled successfully")
    return {
      success: true,
      data: {
        session: updatedSession,
        variance,
        expectedBalance,
        actualBalance: data.actualClosingBalance,
      },
    }
  } catch (error) {
    console.error("[v0] Error reconciling session:", error)
    return {
      success: false,
      error: "Failed to reconcile session",
    }
  }
}
