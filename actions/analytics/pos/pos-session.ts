"use server"

import { randomUUID } from "crypto"

import { db } from "@/prisma/db"

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined

function toNumber(value: DecimalLike): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value.toString()) || 0
}

function nextSessionNumber(): string {
  return `SES-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`
}

function drawerNumber(terminalId: string): string {
  return `DRAWER-${terminalId.slice(0, 8)}`
}

export async function openPOSSession(data: {
  stationId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance: number
}) {
  try {
    const terminalId = data.stationId
    const existingSession = await db.pOSSession.findFirst({
      where: {
        terminalId,
        organizationId: data.organizationId,
        status: "ACTIVE",
      },
    })

    if (existingSession) {
      return {
        success: false,
        error: "Terminal already has an active session",
      }
    }

    const now = new Date()
    const session = await db.pOSSession.create({
      data: {
        id: randomUUID(),
        terminalId,
        userId: data.userId,
        locationId: data.locationId,
        organizationId: data.organizationId,
        openingBalance: data.openingBalance,
        expectedBalance: data.openingBalance,
        status: "ACTIVE",
        startTime: now,
        sessionNumber: nextSessionNumber(),
        updatedAt: now,
      },
    })

    await db.pOSStation.updateMany({
      where: {
        id: terminalId,
        organizationId: data.organizationId,
      },
      data: {
        currentSessionId: session.id,
        updatedAt: now,
      },
    })

    const cashDrawer = await db.cashDrawer.upsert({
      where: {
        id: `drawer-${terminalId}`,
      },
      update: {
        currentBalance: data.openingBalance,
        expectedBalance: data.openingBalance,
        isOpen: true,
        updatedAt: now,
      },
      create: {
        id: `drawer-${terminalId}`,
        terminalId,
        locationId: data.locationId,
        name: `Drawer-${terminalId}`,
        drawerNumber: drawerNumber(terminalId),
        currentBalance: data.openingBalance,
        expectedBalance: data.openingBalance,
        isOpen: true,
        updatedAt: now,
      },
    })

    await db.cashDrawerTransaction.create({
      data: {
        id: randomUUID(),
        sessionId: session.id,
        cashDrawerId: cashDrawer.id,
        type: "OPENING_BALANCE",
        amount: data.openingBalance,
        balanceBefore: 0,
        balanceAfter: data.openingBalance,
        reason: "Opening balance",
        notes: "Opening cash",
        userId: data.userId,
      },
    })

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("[pos-session] Error opening session:", error)
    return {
      success: false,
      error: "Failed to open session",
    }
  }
}

export async function closePOSSession(data: {
  sessionId: string
  stationId: string
  closingBalance: number
  userId: string
}) {
  try {
    const terminalId = data.stationId
    const now = new Date()

    const session = await db.pOSSession.update({
      where: { id: data.sessionId },
      data: {
        status: "CLOSED",
        endTime: now,
        closingBalance: data.closingBalance,
        updatedAt: now,
      },
    })

    const cashDrawer = await db.cashDrawer.findFirst({
      where: {
        terminalId,
        isOpen: true,
      },
    })

    if (!cashDrawer) {
      throw new Error("Open cash drawer not found for this terminal")
    }

    await db.cashDrawer.update({
      where: { id: cashDrawer.id },
      data: {
        isOpen: false,
        currentBalance: 0,
        updatedAt: now,
      },
    })

    await db.pOSStation.updateMany({
      where: {
        id: terminalId,
      },
      data: {
        currentSessionId: null,
        updatedAt: now,
      },
    })

    await db.cashDrawerTransaction.create({
      data: {
        id: randomUUID(),
        sessionId: data.sessionId,
        cashDrawerId: cashDrawer.id,
        type: "CLOSING_BALANCE",
        amount: data.closingBalance,
        balanceBefore: toNumber(cashDrawer.currentBalance),
        balanceAfter: 0,
        reason: "Closing balance",
        notes: "Closing cash",
        userId: data.userId,
      },
    })

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("[pos-session] Error closing session:", error)
    return {
      success: false,
      error: "Failed to close session",
    }
  }
}

export async function getCurrentSession(stationId: string) {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        terminalId: stationId,
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
    console.error("[pos-session] Error getting current session:", error)
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

    const totalSales = session.salesOrders.reduce((sum, sale) => sum + toNumber(sale.total), 0)
    const totalTransactions = session.salesOrders.length
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0

    const totalItemsSold = session.salesOrders.reduce((sum, sale) => {
      return sum + sale.lines.reduce((lineSum, line) => lineSum + toNumber(line.quantity), 0)
    }, 0)

    const payments = session.salesOrders.flatMap((sale) => sale.payments)
    const cashTotal = payments.filter((payment) => payment.method === "CASH").reduce((sum, payment) => sum + toNumber(payment.amount), 0)
    const cardTotal = payments.filter((payment) => payment.method === "CARD").reduce((sum, payment) => sum + toNumber(payment.amount), 0)
    const digitalTotal = payments
      .filter((payment) => payment.method === "MOBILE_MONEY" || payment.method === "BANK_TRANSFER")
      .reduce((sum, payment) => sum + toNumber(payment.amount), 0)

    const cashIn = session.cashDrawerTransactions
      .filter((transaction) => ["SALE", "CASH_IN", "OPENING_BALANCE"].includes(transaction.type))
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0)

    const cashOut = session.cashDrawerTransactions
      .filter((transaction) => ["REFUND", "CASH_OUT", "PAYOUT", "CLOSING_BALANCE"].includes(transaction.type))
      .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0)

    const itemSales = new Map<string, { name: string; sku: string; quantity: number; revenue: number }>()

    session.salesOrders.forEach((sale) => {
      sale.lines.forEach((line) => {
        const key = line.itemId
        const existing = itemSales.get(key) || {
          name: line.item.nameEn || line.item.nameFr || "Unknown Item",
          sku: line.item.sku,
          quantity: 0,
          revenue: 0,
        }
        existing.quantity += toNumber(line.quantity)
        existing.revenue += toNumber(line.lineTotal)
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
          cashierName: `${session.user.firstName ?? ""} ${session.user.lastName ?? ""}`.trim() || "Unknown Cashier",
          stationName: session.terminal?.name || "Unknown Terminal",
        },
        metrics: {
          totalSales,
          totalTransactions,
          averageTransaction,
          totalItemsSold,
          cashTotal,
          cardTotal,
          digitalTotal,
          openingBalance: toNumber(session.openingBalance),
          closingBalance: toNumber(session.closingBalance),
          expectedBalance: toNumber(session.expectedBalance),
          variance: toNumber(session.variance),
          cashIn,
          cashOut,
        },
        topItems,
      },
    }
  } catch (error) {
    console.error("[pos-session] Error getting session analytics:", error)
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
    const session = await db.pOSSession.findUnique({
      where: { id: data.sessionId },
      include: {
        cashDrawerTransactions: {
          include: {
            cashDrawer: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    const expectedBalance = toNumber(session.expectedBalance)
    const variance = data.actualClosingBalance - expectedBalance
    const now = new Date()

    const updatedSession = await db.pOSSession.update({
      where: { id: data.sessionId },
      data: {
        closingBalance: data.actualClosingBalance,
        variance,
        status: "RECONCILED",
        notes: data.notes,
        updatedAt: now,
      },
    })

    const cashDrawer = session.cashDrawerTransactions[0]?.cashDrawer
    if (cashDrawer) {
      await db.cashDrawerTransaction.create({
        data: {
          id: randomUUID(),
          sessionId: data.sessionId,
          cashDrawerId: cashDrawer.id,
          type: "RECONCILIATION",
          amount: variance,
          balanceBefore: expectedBalance,
          balanceAfter: data.actualClosingBalance,
          reason: "Session reconciliation",
          notes: `Reconciliation: ${data.notes || "No notes"}`,
          userId: data.userId,
        },
      })
    }

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
    console.error("[pos-session] Error reconciling session:", error)
    return {
      success: false,
      error: "Failed to reconcile session",
    }
  }
}
