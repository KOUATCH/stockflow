// ===== SERVER ACTIONS =====
// File: lib/actions/pos-terminal-actions.ts
"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined

function toNumber(value: DecimalLike): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value.toString()) || 0
}

export interface TerminalInfo {
  id: string
  name: string
  stationNumber: string
  isActive: boolean
  hasCashDrawer: boolean
  locationId: string
  location: {
    name: string
    code: string
  }
  currentSessionId?: string
  currentSession?: {
    id: string
    sessionNumber: string
    userId: string
    user: {
      firstName: string
      lastName: string
    }
    status: string
    startTime: Date
    openingBalance: number
  }
}

export interface SessionInfo {
  id: string
  sessionNumber: string
  status: "ACTIVE" | "SUSPENDED" | "CLOSED" | "RECONCILED"
  startTime: Date
  endTime?: Date
  stationId: string
  station: {
    name: string
    stationNumber: string
  }
  userId: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  variance?: number
  totalSales: number
  transactionCount: number
}

// Get all terminals for a location
export async function getTerminals(
  locationId: string,
  organizationId: string
): Promise<TerminalInfo[]> {
  const terminals = await db.pOSStation.findMany({
    where: {
      locationId,
      organizationId,
    },
    include: {
      location: {
        select: {
          name: true,
          code: true,
        },
      },
      currentSession: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  const terminalInfo: TerminalInfo[] = terminals.map(terminal => ({
    id: terminal.id,
    name: terminal.name,
    stationNumber: terminal.terminalNumber,
    isActive: terminal.isActive,
    hasCashDrawer: terminal.hasCashDrawer,
    locationId: terminal.locationId,
    location: terminal.location,
    currentSessionId: terminal.currentSessionId ?? undefined,
    currentSession: terminal.currentSession ? {
      id: terminal.currentSession.id,
      sessionNumber: terminal.currentSession.sessionNumber,
      userId: terminal.currentSession.userId,
      user: {
        firstName: terminal.currentSession.user.firstName !== null ? terminal.currentSession.user.firstName : "",
        lastName: terminal.currentSession.user.lastName !== null ? terminal.currentSession.user.lastName : "",
      },
      status: terminal.currentSession.status,
      startTime: terminal.currentSession.startTime,
      openingBalance: toNumber(terminal.currentSession.openingBalance),
    } : undefined,
  }))

  return terminalInfo
}

// Get available terminals (not in use)
export async function getAvailableTerminals(
  locationId: string,
  organizationId: string
): Promise<{ success: boolean; terminals?: TerminalInfo[]; error?: string }> {
  try {
    const terminals = await db.pOSStation.findMany({
      where: {
        locationId,
        organizationId,
        isActive: true,
        currentSessionId: null,
      },
      include: {
        location: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const terminalInfo: TerminalInfo[] = terminals.map(terminal => ({
      id: terminal.id,
      name: terminal.name,
      stationNumber: terminal.terminalNumber,
      isActive: terminal.isActive,
      hasCashDrawer: terminal.hasCashDrawer,
      locationId: terminal.locationId,
      location: terminal.location,
    }))

    return { success: true, terminals: terminalInfo }
  } catch (error) {
    console.error("Error fetching available terminals:", error)
    return { success: false, error: "Failed to fetch available terminals" }
  }
}

// Auto-detect terminal by hostname/IP (for hardware-bound setups)
export async function detectTerminal(
  locationId: string,
  organizationId: string,
  identifier: string // hostname, IP, or device ID
): Promise<{ success: boolean; terminal?: TerminalInfo; error?: string }> {
  try {
    // For this example, we'll match by terminal name containing the identifier
    const terminal = await db.pOSStation.findFirst({
      where: {
        locationId,
        organizationId,
        isActive: true,
        OR: [
          { name: { contains: identifier, mode: 'insensitive' } },
          { terminalNumber: { contains: identifier, mode: 'insensitive' } },
        ],
      },
      include: {
        location: {
          select: {
            name: true,
            code: true,
          },
        },
        currentSession: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!terminal) {
      return { success: false, error: "Terminal not found for this device" }
    }

    const terminalInfo: TerminalInfo = {
      id: terminal.id,
      name: terminal.name,
      stationNumber: terminal.terminalNumber,
      isActive: terminal.isActive,
      hasCashDrawer: terminal.hasCashDrawer,
      locationId: terminal.locationId,
      location: terminal.location,
      currentSessionId: terminal.currentSessionId ?? undefined,
      currentSession: terminal.currentSession ? {
        id: terminal.currentSession.id,
        sessionNumber: terminal.currentSession.sessionNumber,
        userId: terminal.currentSession.userId,
        user: {
          firstName: terminal.currentSession.user.firstName !== null ? terminal.currentSession.user.firstName : "",
          lastName: terminal.currentSession.user.lastName !== null ? terminal.currentSession.user.lastName : "",
        },
        status: terminal.currentSession.status,
        startTime: terminal.currentSession.startTime,
        openingBalance: toNumber(terminal.currentSession.openingBalance),
      } : undefined,
    }

    return { success: true, terminal: terminalInfo }
  } catch (error) {
    console.error("Error detecting terminal:", error)
    return { success: false, error: "Failed to detect terminal" }
  }
}

// Get current user's active session
export async function getUserActiveSession(
  userId: string
): Promise<{ success: boolean; session?: SessionInfo; error?: string }> {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        terminal: {
          select: {
            name: true,
            terminalNumber: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!session) {
      return { success: true, session: undefined }
    }

    const sessionInfo: SessionInfo = {
      id: session.id,
      sessionNumber: session.sessionNumber,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime ?? undefined,
      stationId: session.terminalId,
      station: {
        name: session.terminal.name,
        stationNumber: session.terminal.terminalNumber,
      },
      userId: session.userId,
      user: {
        firstName: session.user.firstName ?? "",
        lastName: session.user.lastName ?? "",
        email: session.user.email,
      },
      openingBalance: toNumber(session.openingBalance),
      closingBalance: session.closingBalance !== null ? toNumber(session.closingBalance) : undefined,
      expectedBalance: session.expectedBalance !== null ? toNumber(session.expectedBalance) : undefined,
      variance: session.variance !== null ? toNumber(session.variance) : undefined,
      totalSales: toNumber(session.totalSales),
      transactionCount: session.transactionCount,
    }

    return { success: true, session: sessionInfo }
  } catch (error) {
    console.error("Error fetching user active session:", error)
    return { success: false, error: "Failed to fetch active session" }
  }
}

// Get terminal status
export async function getTerminalStatus(
  terminalId: string
): Promise<{ success: boolean; terminal?: TerminalInfo; error?: string }> {
  try {
    const terminal = await db.pOSStation.findUnique({
      where: { id: terminalId },
      include: {
        location: {
          select: {
            name: true,
            code: true,
          },
        },
        currentSession: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!terminal) {
      return { success: false, error: "Terminal not found" }
    }

    const terminalInfo: TerminalInfo = {
      id: terminal.id,
      name: terminal.name,
      stationNumber: terminal.terminalNumber,
      isActive: terminal.isActive,
      hasCashDrawer: terminal.hasCashDrawer,
      locationId: terminal.locationId,
      location: terminal.location,
      currentSessionId: terminal.currentSessionId ?? undefined,
      currentSession: terminal.currentSession ? {
        id: terminal.currentSession.id,
        sessionNumber: terminal.currentSession.sessionNumber,
        userId: terminal.currentSession.userId,
        user: {
          firstName: terminal.currentSession.user.firstName !== null ? terminal.currentSession.user.firstName : "",
          lastName: terminal.currentSession.user.lastName !== null ? terminal.currentSession.user.lastName : "",
        },
        status: terminal.currentSession.status,
        startTime: terminal.currentSession.startTime,
        openingBalance: toNumber(terminal.currentSession.openingBalance),
      } : undefined,
    }

    return { success: true, terminal: terminalInfo }
  } catch (error) {
    console.error("Error fetching terminal status:", error)
    return { success: false, error: "Failed to fetch terminal status" }
  }
}

// Force close session (admin function)
export async function forceCloseSession(
  sessionId: string,
  adminUserId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        terminal: true,
      },
    })

    if (!session) {
      return { success: false, error: "Session not found" }
    }

    await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        status: "CLOSED",
        endTime: new Date(),
        notes: `Force closed by admin: ${reason}`,
      },
    })

    // Clear station's current session
    await db.pOSStation.update({
      where: { id: session.terminalId },
      data: {
        currentSessionId: null,
      },
    })

    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Error force closing session:", error)
    return { success: false, error: "Failed to force close session" }
  }
}
