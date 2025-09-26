"use server"

import { db } from "@/prisma/db"
import type { cashDrawerTransactionType } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Types for cash drawer operations
interface CreateCashDrawerData {
  name: string
  locationId: string
  currentBalance?: number
}

interface cashDrawerTransactionData {
  cashDrawerId: string
  type: cashDrawerTransactionType
  amount: number
  reason?: string
  notes?: string
  userId: string
  sessionId?: string
}

interface OpenCashDrawerData {
  cashDrawerId: string
  userId: string
  sessionId?: string
  openingBalance: number
  notes?: string
}

interface CloseCashDrawerData {
  cashDrawerId: string
  userId: string
  sessionId?: string
  closingBalance: number
  notes?: string
}

// Create a new cash drawer
export async function createCashDrawer(data: CreateCashDrawerData) {
  try {
    const cashDrawer = await db.cashDrawer.create({
      data: {
        name: data.name,
        locationId: data.locationId,
        currentBalance: data.currentBalance || 0,
        isOpen: false,
        drawerNumber: "1", // Set this appropriately or generate as needed
        terminalId: "default-terminal", // Set this appropriately or get from data
      },
    })

    revalidatePath("/pos")
    return { success: true, data: cashDrawer }
  } catch (error) {
    console.error("Failed to create cash drawer:", error)
    return { success: false, error: "Failed to create cash drawer" }
  }
}

// Get cash drawer by ID with recent events
export async function getCashDrawer(cashDrawerId: string) {
  try {
    const cashDrawer = await db.cashDrawer.findUnique({
      where: { id: cashDrawerId },
      include: {
        events: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            session: {
              select: { id: true, sessionNumber: true },
            },
          },
        },
        location: {
          select: { id: true, name: true },
        },
      },
    })

    return { success: true, data: cashDrawer }
  } catch (error) {
    console.error("Failed to get cash drawer:", error)
    return { success: false, error: "Failed to get cash drawer" }
  }
}

// Get all cash drawers for a location
export async function getCashDrawersByLocation(locationId: string) {
  try {
    const cashDrawers = await db.cashDrawer.findMany({
      where: { locationId },
      include: {
        events: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: cashDrawers }
  } catch (error) {
    console.error("Failed to get cash drawers:", error)
    return { success: false, error: "Failed to get cash drawers" }
  }
}

// Open cash drawer
export async function openCashDrawer(data: OpenCashDrawerData) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Update cash drawer status
      const cashDrawer = await tx.cashDrawer.update({
        where: { id: data.cashDrawerId },
        data: {
          isOpen: true,
          currentBalance: data.openingBalance,
        },
      })

      // Create opening event
      const event = await tx.cashDrawerTransaction.create({
        data: {
          cashDrawerId: data.cashDrawerId,
          type: "OPENING_BALANCE",
          amount: data.openingBalance,
          reason: "Cash drawer opened",
          notes: data.notes,
          userId: data.userId,
          sessionId: data.sessionId,
          balanceBefore: 0,
          balanceAfter: data.openingBalance,
        },
      })

      return { cashDrawer, event }
    })

    revalidatePath("/pos")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to open cash drawer:", error)
    return { success: false, error: "Failed to open cash drawer" }
  }
}

// Close cash drawer
export async function closeCashDrawer(data: CloseCashDrawerData) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Get current balance
      const currentDrawer = await tx.cashDrawer.findUnique({
        where: { id: data.cashDrawerId },
      })

      if (!currentDrawer) {
        throw new Error("Cash drawer not found")
      }

      const variance = data.closingBalance - currentDrawer.currentBalance

      // Update cash drawer status
      const cashDrawer = await tx.cashDrawer.update({
        where: { id: data.cashDrawerId },
        data: {
          isOpen: false,
          currentBalance: data.closingBalance,
        },
      })

      // Create closing event
      const event = await tx.cashDrawerTransaction.create({
        data: {
          cashDrawerId: data.cashDrawerId,
          type: "CLOSING_BALANCE",
          amount: data.closingBalance,
          reason: variance !== 0 ? `Cash drawer closed with variance: $${variance.toFixed(2)}` : "Cash drawer closed",
          notes: data.notes,
          userId: data.userId,
          sessionId: data.sessionId,
          balanceBefore: currentDrawer.currentBalance,
          balanceAfter: data.closingBalance,
        },
      })

      return { cashDrawer, event, variance }
    })

    revalidatePath("/pos")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to close cash drawer:", error)
    return { success: false, error: "Failed to close cash drawer" }
  }
}

// Add cash to drawer
export async function addCashToDrawer(data: cashDrawerTransactionData) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Get current balance
      const currentDrawer = await tx.cashDrawer.findUnique({
        where: { id: data.cashDrawerId },
      })

      if (!currentDrawer) {
        throw new Error("Cash drawer not found")
      }

      const newBalance = currentDrawer.currentBalance + data.amount

      // Update cash drawer balance
      const cashDrawer = await tx.cashDrawer.update({
        where: { id: data.cashDrawerId },
        data: { currentBalance: newBalance },
      })

      // Create event
      const event = await tx.cashDrawerTransaction.create({
        data: {
          cashDrawerId: data.cashDrawerId,
          type: data.type,
          amount: data.amount,
          reason: data.reason || "Cash added to drawer",
          notes: data.notes,
          userId: data.userId,
          sessionId: data.sessionId,
          balanceBefore: currentDrawer.currentBalance,
          balanceAfter: newBalance,
        },
      })

      return { cashDrawer, event }
    })

    revalidatePath("/pos")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to add cash to drawer:", error)
    return { success: false, error: "Failed to add cash to drawer" }
  }
}

// Remove cash from drawer
export async function removeCashFromDrawer(data: cashDrawerTransactionData) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Get current balance
      const currentDrawer = await tx.cashDrawer.findUnique({
        where: { id: data.cashDrawerId },
      })

      if (!currentDrawer) {
        throw new Error("Cash drawer not found")
      }

      if (currentDrawer.currentBalance < data.amount) {
        throw new Error("Insufficient funds in cash drawer")
      }

      const newBalance = currentDrawer.currentBalance - data.amount

      // Update cash drawer balance
      const cashDrawer = await tx.cashDrawer.update({
        where: { id: data.cashDrawerId },
        data: { currentBalance: newBalance },
      })

      // Create event
      const event = await tx.cashDrawerTransaction.create({
        data: {
          cashDrawerId: data.cashDrawerId,
          type: data.type,
          amount: -data.amount, // Negative for removal
          reason: data.reason || "Cash removed from drawer",
          notes: data.notes,
          userId: data.userId,
          sessionId: data.sessionId,
          balanceBefore: currentDrawer.currentBalance,
          balanceAfter: newBalance,
        },
      })

      return { cashDrawer, event }
    })

    revalidatePath("/pos")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to remove cash from drawer:", error)
    return { success: false, error: "Failed to remove cash from drawer" }
  }
}

// Get cash drawer events with pagination
export async function getcashDrawerTransactions(cashDrawerId: string, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit

    const [events, total] = await Promise.all([
      db.cashDrawerTransaction.findMany({
        where: { cashDrawerId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          session: {
            select: { id: true, sessionNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.cashDrawerTransaction.count({
        where: { cashDrawerId },
      }),
    ])

    return {
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    }
  } catch (error) {
    console.error("Failed to get cash drawer events:", error)
    return { success: false, error: "Failed to get cash drawer events" }
  }
}

// Get cash drawer summary for a date range
export async function getCashDrawerSummary(cashDrawerId: string, startDate: Date, endDate: Date) {
  try {
    const events = await db.cashDrawerTransaction.findMany({
      where: {
        cashDrawerId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "asc" },
    })

    const summary = {
      totalCashIn: 0,
      totalCashOut: 0,
      totalSales: 0,
      totalRefunds: 0,
      totalPayouts: 0,
      eventCount: events.length,
      openingBalance: 0,
      closingBalance: 0,
    }

    events.forEach((event) => {
      switch (event.type) {
        case "OPENING_BALANCE":
          summary.openingBalance = event.amount
          break
        case "CLOSING_BALANCE":
          summary.closingBalance = event.amount
          break
        case "SALE":
          summary.totalSales += event.amount
          summary.totalCashIn += event.amount
          break
        case "REFUND":
          summary.totalRefunds += Math.abs(event.amount)
          summary.totalCashOut += Math.abs(event.amount)
          break
        case "PAYOUT":
          summary.totalPayouts += Math.abs(event.amount)
          summary.totalCashOut += Math.abs(event.amount)
          break
        case "CASH_IN":
          summary.totalCashIn += event.amount
          break
        case "CASH_OUT":
          summary.totalCashOut += Math.abs(event.amount)
          break
      }
    })

    return { success: true, data: summary }
  } catch (error) {
    console.error("Failed to get cash drawer summary:", error)
    return { success: false, error: "Failed to get cash drawer summary" }
  }
}
