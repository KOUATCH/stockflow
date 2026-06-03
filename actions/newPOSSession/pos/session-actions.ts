"use server"

import { db } from "@/prisma/db";
// import { POSSessionStatus } from "@/types"

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined

function toNumber(value: DecimalLike): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value.toString()) || 0
}

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

    if (!data.organizationId) {
      return {
        success: false,
        error: "Organization ID is required",
      }
    }

    console.log("[Session] Validation passed, checking for existing sessions")

    // Check if there's already an active session for this station in this organization
    const existingSession = await db.pOSSession.findFirst({
      where: {
        terminalId: data.stationId,
        status:"ACTIVE",
        location: {
          organizationId: data.organizationId
        }
      },
      include: {
        location: true
      }
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
    console.log("[Session] Creating new session with number:", sessionNumber)
    const session = await db.pOSSession.create({
      data: {
        sessionNumber,
        terminalId: data.stationId,
        userId: data.userId,
        locationId: data.locationId,
        organizationId: data.organizationId,
        status: "ACTIVE",
        startTime: new Date(),
        openingBalance: data.openingBalance,
        totalSales: 0,
        totalTax: 0,
        totalDiscount: 0,
        transactionCount: 0,
        cashTotal: 0,
        cardTotal: 0,
        mobileMoneyTotal: 0,
        bankTransferTotal: 0,
      },
    })

    console.log("[Session] Session created successfully with ID:", session.id)

    // Create or find existing cash drawer for this station
    console.log("[Session] Looking for existing cash drawer for station:", data.stationId)
    let cashDrawer = await db.cashDrawer.findFirst({
      where: {
        terminalId: data.stationId,
        locationId: data.locationId,
      },
    })

    if (!cashDrawer) {
      console.log("[Session] Creating new cash drawer")
      cashDrawer = await db.cashDrawer.create({
        data: {
          terminalId: data.stationId,
          locationId: data.locationId,
          name: `Drawer-${data.stationId}`,
          drawerNumber: "1",
          currentBalance: data.openingBalance,
          expectedBalance: data.openingBalance,
          isOpen: true,
        },
      })
      console.log("[Session] Cash drawer created with ID:", cashDrawer.id)
    } else {
      console.log("[Session] Updating existing cash drawer with ID:", cashDrawer.id)
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
    console.error("[Session] Error opening session:", error)

    // More detailed error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return {
      success: false,
      error: `Failed to open session: ${errorMessage}`,
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
    const expectedBalance = toNumber(currentSession.openingBalance) + toNumber(currentSession.totalSales)
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
        terminalId: data.stationId,
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
        balanceBefore: toNumber(cashDrawer.currentBalance),
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

export async function forceCloseActiveSession(stationId: string, organizationId: string) {
  try {
    console.log("[Session] Force closing active session for station:", stationId)

    // Find any active session for this station
    const activeSession = await db.pOSSession.findFirst({
      where: {
        terminalId: stationId,
        status: "ACTIVE",
        location: {
          organizationId: organizationId
        }
      },
      include: {
        location: true
      }
    })

    if (activeSession) {
      // Close the session with current balance as closing balance
      await db.pOSSession.update({
        where: { id: activeSession.id },
        data: {
          status: "CLOSED",
          endTime: new Date(),
          closingBalance: activeSession.openingBalance,
          expectedBalance: activeSession.openingBalance,
          variance: 0,
        },
      })

      // Close any open cash drawers for this station
      await db.cashDrawer.updateMany({
        where: {
          terminalId: stationId,
          isOpen: true,
        },
        data: {
          isOpen: false,
        },
      })

      console.log("[Session] Force closed session:", activeSession.id)
      return {
        success: true,
        data: activeSession,
      }
    }

    return {
      success: true,
      data: null,
    }
  } catch (error) {
    console.error("[Session] Error force closing session:", error)
    return {
      success: false,
      error: "Failed to force close session",
    }
  }
}

export async function getCurrentSession(stationId: string) {
  try {
    console.log("[v0] Getting current session for station:", stationId)

    const session = await db.pOSSession.findFirst({
      where: {
        terminalId: stationId,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            organizationId: true,
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
