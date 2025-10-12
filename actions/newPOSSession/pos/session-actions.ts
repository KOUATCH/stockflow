"use server"

import { db } from "@/prisma/db";
// import { POSSessionStatus } from "@/types"

export async function openPOSSession(data: {
  stationId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance: number
}) {
  try {
    console.log("[v0] Opening POS session with data:", data)

    // Validate required fields
    if (!data.stationId) {
      return {
        success: false,
        error: "Station ID is required",
      }
    }

    if (!data.userId) {
      return {
        success: false,
        error: "User ID is required",
      }
    }

    if (!data.locationId) {
      return {
        success: false,
        error: "Location ID is required",
      }
    }

    // Check if there's already an active session for this station
    const existingSession = await db.pOSSession.findFirst({
      where: {
        stationId: data.stationId,
        status:"ACTIVE",
      },
    })

    if (existingSession) {
      return {
        success: false,
        error: "station already has an active session",
      }
    }

    // Generate session number
    const sessionNumber = `SES-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`

    // Create new session with proper session totals initialization
    const session = await db.pOSSession.create({
      data: {
        sessionNumber,
        stationId: data.stationId,
        userId: data.userId,
        locationId: data.locationId,
        status: "ACTIVE",
        startTime: new Date(),
        openingBalance: data.openingBalance,
        totalSales: 0,
        totalTax: 0,
        totalDiscount: 0,
        transactionCount: 0,
        cashTotal: 0,
        cardTotal: 0,
        digitalTotal: 0,
      },
    })

    // Create or find existing cash drawer for this station
    let cashDrawer = await db.cashDrawer.findFirst({
      where: {
        stationId: data.stationId,
        locationId: data.locationId,
      },
    })

    if (!cashDrawer) {
      cashDrawer = await db.cashDrawer.create({
        data: {
          stationId: data.stationId,
          locationId: data.locationId,
          name: `Drawer-${data.stationId}`,
          drawerNumber: "1",
          currentBalance: data.openingBalance,
          expectedBalance: data.openingBalance,
          isOpen: true,
        },
      })
    } else {
      // Update existing cash drawer
      await db.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: data.openingBalance,
          expectedBalance: data.openingBalance,
          isOpen: true,
        },
      })
    }

    // Create opening balance transaction with proper relations
    await db.cashDrawerTransaction.create({
      data: {
        cashDrawer: {
          connect: { id: cashDrawer.id }
        },
        session: {
          connect: { id: session.id }
        },
        user: {
          connect: { id: data.userId }
        },
        type: "OPENING_BALANCE",
        amount: data.openingBalance,
        reason: "Session opened",
        balanceBefore: 0,
        balanceAfter: data.openingBalance,
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
  stationId: string
  closingBalance: number
  userId: string
}) {
  try {
    console.log("[v0] Closing POS session:", data.sessionId)

    // Get the current session with all data
    const currentSession = await db.pOSSession.findUnique({
      where: { id: data.sessionId },
      include: {
        cashDrawerTransactions: {
          include: { cashDrawer: true },
        },
      },
    })

    if (!currentSession) {
      throw new Error("Session not found")
    }

    // Calculate session variance
    const expectedBalance = currentSession.openingBalance + currentSession.totalSales
    const variance = data.closingBalance - expectedBalance

    // Update session with closing information
    const session = await db.pOSSession.update({
      where: { id: data.sessionId },
      data: {
        status: "CLOSED",
        endTime: new Date(),
        closingBalance: data.closingBalance,
        expectedBalance: expectedBalance,
        variance: variance,
      },
    })

    // Find the open cash drawer for this station
    const cashDrawer = await db.cashDrawer.findFirst({
      where: {
        stationId: data.stationId,
        isOpen: true,
      },
    })

    if (!cashDrawer) {
      throw new Error("Open cash drawer not found for this station")
    }

    // Update cash drawer to closed state
    await db.cashDrawer.update({
      where: { id: cashDrawer.id },
      data: {
        isOpen: false,
        currentBalance: data.closingBalance,
      },
    })

    // Create closing balance transaction with proper relations
    await db.cashDrawerTransaction.create({
      data: {
        cashDrawer: {
          connect: { id: cashDrawer.id }
        },
        session: {
          connect: { id: data.sessionId }
        },
        user: {
          connect: { id: data.userId }
        },
        type: "CLOSING_BALANCE",
        amount: data.closingBalance,
        reason: "Session closed",
        balanceBefore: cashDrawer.currentBalance,
        balanceAfter: data.closingBalance,
        notes: variance !== 0 ? `Variance: $${variance.toFixed(2)}` : undefined,
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

export async function getCurrentSession(stationId: string) {
  try {
    console.log("[v0] Getting current session for station:", stationId)

    const session = await db.pOSSession.findFirst({
      where: {
        stationId,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          },
        },
        Location: {
          select: {
            id: true,
            name: true,
          },
        },
        cashDrawerTransactions: {
          include: {
            cashDrawer: {
              select: {
                id: true,
                name: true,
                currentBalance: true,
                expectedBalance: true,
                isOpen: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    console.log("[v0] Found session:", session ? session.id : "none")

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
