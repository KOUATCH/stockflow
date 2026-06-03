"use server"

import { db } from "@/prisma/db"
import type { POSSessionStatus } from "@prisma/client"

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined

function toNumber(value: DecimalLike): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value.toString()) || 0
}

// Unified types for session management
export interface SessionData {
  stationId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance: number
}

export interface CloseSessionData {
  sessionId: string
  stationId: string
  closingBalance: number
  userId: string
}

export interface SessionResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Force close any active session for a terminal in an organization
 * This ensures clean session state before starting new sessions
 */
export async function forceCloseActiveSession(
  stationId: string,
  organizationId: string
): Promise<SessionResponse> {
  try {
    console.log("[Session] Force closing active session for station:", stationId)

    const activeSession = await db.pOSSession.findFirst({
      where: {
        terminalId: stationId,
        status: "ACTIVE",
        location: {
          organizationId
        }
      },
      include: {
        location: true
      }
    })

    if (activeSession) {
      // Close the session gracefully
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

/**
 * Create a new POS session with proper validation and cleanup
 */
export async function createPOSSession(data: SessionData): Promise<SessionResponse> {
  try {
    console.log("[Session] Creating POS session with data:", data)

    // Validate required fields
    const requiredFields = ['stationId', 'userId', 'locationId', 'organizationId']
    for (const field of requiredFields) {
      if (!data[field as keyof SessionData]) {
        return {
          success: false,
          error: `${field} is required`,
        }
      }
    }

    console.log("[Session] Validation passed, checking for existing sessions")

    // Verify the station exists and belongs to the organization
    const station = await db.pOSStation.findFirst({
      where: {
        id: data.stationId,
        organizationId: data.organizationId,
        isActive: true,
      },
      include: {
        location: true
      }
    })

    if (!station) {
      return {
        success: false,
        error: "Station not found or not active in this organization",
      }
    }

    // Verify location belongs to organization
    if (station.location?.organizationId !== data.organizationId) {
      return {
        success: false,
        error: "Station location does not belong to the specified organization",
      }
    }

    // Force close any existing active session before creating new one
    const forceCloseResult = await forceCloseActiveSession(data.stationId, data.organizationId)
    if (!forceCloseResult.success) {
      console.warn("[Session] Could not force close existing session:", forceCloseResult.error)
    }

    // Generate unique session number
    const sessionNumber = `SES-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`

    // Create new session
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

    // Handle cash drawer setup
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
      await db.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: data.openingBalance,
          expectedBalance: data.openingBalance,
          isOpen: true,
        },
      })
    }

    // Create opening balance transaction
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

    console.log("[Session] Session opened successfully:", session.id)
    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("[Session] Error opening session:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      error: `Failed to open session: ${errorMessage}`,
    }
  }
}

/**
 * Close an active POS session
 */
export async function closePOSSession(data: CloseSessionData): Promise<SessionResponse> {
  try {
    console.log("[Session] Closing POS session:", data.sessionId)

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

    if (currentSession.status !== "ACTIVE") {
      throw new Error("Session is not active")
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

    // Find and close the cash drawer for this station
    const cashDrawer = await db.cashDrawer.findFirst({
      where: {
        terminalId: data.stationId,
        isOpen: true,
      },
    })

    if (cashDrawer) {
      // Update cash drawer to closed state
      await db.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          isOpen: false,
          currentBalance: data.closingBalance,
        },
      })

      // Create closing balance transaction
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
    }

    console.log("[Session] Session closed successfully")
    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("[Session] Error closing session:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      error: `Failed to close session: ${errorMessage}`,
    }
  }
}

/**
 * Get current active session for a station
 */
export async function getCurrentSession(stationId: string, organizationId?: string): Promise<SessionResponse> {
  try {
    console.log("[Session] Getting current session for station:", stationId)

    const whereClause: any = {
      terminalId: stationId,
      status: "ACTIVE" as POSSessionStatus,
    }

    // Add organization filter if provided
    if (organizationId) {
      whereClause.location = {
        organizationId
      }
    }

    const session = await db.pOSSession.findFirst({
      where: whereClause,
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

    console.log("[Session] Found session:", session ? session.id : "none")

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("[Session] Error getting current session:", error)
    return {
      success: false,
      error: "Failed to get current session",
    }
  }
}

/**
 * Get session history for a station or organization
 */
export async function getSessionHistory(
  filters: {
    stationId?: string
    organizationId?: string
    locationId?: string
    userId?: string
    status?: POSSessionStatus[]
    startDate?: Date
    endDate?: Date
  },
  pagination: {
    skip?: number
    take?: number
  } = {}
): Promise<SessionResponse> {
  try {
    const whereClause: any = {}

    if (filters.stationId) whereClause.terminalId = filters.stationId
    if (filters.userId) whereClause.userId = filters.userId
    if (filters.locationId) whereClause.locationId = filters.locationId
    if (filters.status) whereClause.status = { in: filters.status }

    if (filters.organizationId) {
      whereClause.location = {
        organizationId: filters.organizationId
      }
    }

    if (filters.startDate || filters.endDate) {
      whereClause.startTime = {}
      if (filters.startDate) whereClause.startTime.gte = filters.startDate
      if (filters.endDate) whereClause.startTime.lte = filters.endDate
    }

    const [sessions, total] = await Promise.all([
      db.pOSSession.findMany({
        where: whereClause,
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
            },
          },
        },
        orderBy: {
          startTime: 'desc',
        },
        skip: pagination.skip || 0,
        take: pagination.take || 50,
      }),
      db.pOSSession.count({ where: whereClause })
    ])

    return {
      success: true,
      data: {
        sessions,
        total,
        pagination: {
          skip: pagination.skip || 0,
          take: pagination.take || 50,
        }
      },
    }
  } catch (error) {
    console.error("[Session] Error getting session history:", error)
    return {
      success: false,
      error: "Failed to get session history",
    }
  }
}

// Helper functions for UI components
export async function getAvailableLocations() {
  try {
    const locations = await db.location.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return locations.map(location => ({
      id: location.id,
      name: location.name,
      code: location.code,
      address: location.address || '',
      organizationId: location.organizationId
    }))
  } catch (error) {
    console.error("[Session] Error fetching locations:", error)
    throw new Error("Failed to fetch locations")
  }
}

export async function getTerminalsByLocation(locationId: string, organizationId: string) {
  try {
    const terminals = await db.pOSStation.findMany({
      where: {
        organizationId,
        locationId,
        isActive: true
      },
      include: {
        sessions: {
          where: {
            status: 'ACTIVE'
          },
          take: 1
        }
      },
      orderBy: {
        terminalNumber: 'asc'
      }
    })

    return terminals.map(terminal => ({
      id: terminal.id,
      stationNumber: terminal.terminalNumber,
      name: terminal.name,
      locationId: terminal.locationId,
      organizationId: terminal.organizationId,
      isActive: terminal.isActive,
      hasCashDrawer: terminal.hasCashDrawer,
      hasActiveSession: terminal.sessions.length > 0,
      currentSessionId: terminal.sessions[0]?.id || null
    }))
  } catch (error) {
    console.error("[Session] Error fetching terminals:", error)
    throw new Error("Failed to fetch terminals")
  }
}

// Legacy function aliases for backward compatibility
export const openPOSSession = createPOSSession
export const startSession = createPOSSession
export const endSession = closePOSSession
