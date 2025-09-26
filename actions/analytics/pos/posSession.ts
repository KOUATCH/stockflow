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
