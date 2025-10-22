"use server"

import { auth } from "@/auth"
import { checkAnyPermission, checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import { prisma } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import type { POSSession, SessionStatus } from "../types/pos-system-types"

export interface CreateSessionData {
  stationId: string
  locationId: string
  openingCash: number
  notes?: string
}

export interface SessionAnalytics {
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  cashSales: number
  cardSales: number
  hourlyBreakdown: Array<{
    hour: number
    sales: number
    transactions: number
  }>
  topItems: Array<{
    itemId: string
    itemName: string
    quantity: number
    revenue: number
  }>
}

export async function getActiveSession(stationId: string): Promise<POSSession | null> {
  try {
    // Check permissions
    await checkAnyPermission([
      PERMISSIONS.OPERATE_POS,
      PERMISSIONS.MANAGE_POS_SESSIONS,
      PERMISSIONS.VIEW_POS_REPORTS
    ])

    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Find active session for the terminal
    const activeSession = await prisma.pOSSession.findFirst({
      where: {
        stationId: stationId,
        status: 'ACTIVE',
        Location: {
          organizationId: session.user.organizationId
        }
      },
      include: {
        Location: true,
        station: true,
        user: true
      }
    })

    if (!activeSession) {
      return null
    }

    // Convert database session to our expected format
    return {
      id: activeSession.id,
      sessionNumber: activeSession.sessionNumber,
      stationId: activeSession.stationId,
      locationId: activeSession.locationId,
      organizationId: activeSession.Location.organizationId,
      userId: activeSession.userId,
      status: activeSession.status as SessionStatus,
      startTime: activeSession.startTime,
      endTime: activeSession.endTime ?? undefined,
      openingCash: activeSession.openingBalance,
      closingCash: activeSession.closingBalance ?? undefined,
      totalSales: activeSession.totalSales,
      totalTransactions: activeSession.transactionCount,
      notes: activeSession.notes ?? undefined,
      station: {
        id: activeSession.station.id,
        stationNumber: activeSession.station.stationNumber,
        stationName: activeSession.station.name,
        locationId: activeSession.station.locationId,
        organizationId: activeSession.station.organizationId,
        status: activeSession.station.isActive ? 'ACTIVE' : 'INACTIVE',
        configuration: {}, // Will be populated when needed
        version: (activeSession.station as any).version ?? 1,
        capabilities: activeSession.station.hasCashDrawer
          ? ["RECEIPT_PRINTER", "CASH_DRAWER", "BARCODE_SCANNER"]
          : ["RECEIPT_PRINTER", "BARCODE_SCANNER"],
        location: {
          id: activeSession.Location.id,
          name: activeSession.Location.name,
          address: activeSession.Location.address || ''
        },
        sessions: [] as any[]
      },
      location: {
        id: activeSession.Location.id,
        name: activeSession.Location.name,
        address: activeSession.Location.address ?? '',
       
      },
      user: {
        id: activeSession.user.id,
        firstName: activeSession.user.firstName ?? '',
        lastName: activeSession.user.lastName ?? '',
        email: activeSession.user.email ?? ''
      },
      transactions: [] // Will be populated when needed
    } as unknown as POSSession
  } catch (error) {
    console.error("Error fetching active session:", error)
    throw new Error("Failed to fetch active session")
  }
}

export async function startSession(data: CreateSessionData): Promise<POSSession> {
  try {
    // Check permissions
    await checkPermission(PERMISSIONS.OPERATE_POS)

    const session = await auth()
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Check if terminal exists and is available
    const terminal = await prisma.pOSStation.findFirst({
      where: {
        id: data.stationId,
        organizationId: session.user.organizationId,
        isActive: true
      },
      include: {
        location: true
      }
    })

    if (!terminal) {
      throw new Error("Terminal not found or not available")
    }

    // Check if terminal is at the specified location
    if (terminal.locationId !== data.locationId) {
      throw new Error("Terminal is not available at the specified location")
    }

    // Check if there's already an active session for this terminal
    const existingSession = await prisma.pOSSession.findFirst({
      where: {
        stationId: data.stationId,
        status: 'ACTIVE'
      }
    })

    if (existingSession) {
      throw new Error("Terminal already has an active session")
    }

    // Generate session number
    const sessionNumber = `POS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Create new session
    const newSession = await prisma.pOSSession.create({
      data: {
        sessionNumber,
        stationId: data.stationId,
        locationId: data.locationId,
        userId: session.user.id,
        status: 'ACTIVE',
        openingBalance: data.openingCash,
        notes: data.notes,
        startTime: new Date()
      },
      include: {
        Location: true,
        station: true,
        user: true
      }
    })

    const posSession: POSSession = {
      id: newSession.id,
      sessionNumber: newSession.sessionNumber,
      stationId: newSession.stationId,
      locationId: newSession.locationId,
      organizationId: newSession.Location.organizationId,
      userId: newSession.userId,
      status: newSession.status as SessionStatus,
      startTime: newSession.startTime,
      endTime: newSession.endTime ?? undefined,
      openingCash: newSession.openingBalance,
      closingCash: newSession.closingBalance ?? undefined,
      totalSales: newSession.totalSales,
      totalTransactions: newSession.transactionCount,
      notes: newSession.notes ?? undefined,
      station: {
        id: newSession.station.id,
        stationNumber: newSession.station.stationNumber,
        stationName: newSession.station.name,
        locationId: newSession.station.locationId,
        organizationId: newSession.station.organizationId,
        status: newSession.station.isActive ? 'ACTIVE' : 'INACTIVE',
        configuration: {},
        version: (newSession.station as any).version ?? 1,
        capabilities: newSession.station.hasCashDrawer
          ? ["RECEIPT_PRINTER", "CASH_DRAWER", "BARCODE_SCANNER"]
          : ["RECEIPT_PRINTER", "BARCODE_SCANNER"],
        location: {
          id: newSession.Location.id,
          name: newSession.Location.name,
          address: newSession.Location.address || ''
        },
        sessions: [] as any[]
      },
      location: {
        id: newSession.Location.id,
        name: newSession.Location.name,
        address: newSession.Location.address ?? '',
        city: "",
        state: "",
        zipCode: "",
        timezone: ""
      },
      user: {
        id: newSession.user.id,
        firstName: newSession.user.firstName ?? '',
        lastName: newSession.user.lastName ?? '',
        email: newSession.user.email ?? ''
      },
      transactions: []
    }

    revalidatePath("/dashboard/pos-system")
    return posSession
  } catch (error) {
    console.error("Error starting session:", error)
    throw new Error("Failed to start session")
  }
}

export async function endSession(sessionId: string, closingCash: number): Promise<boolean> {
  try {
    // Check permissions
    await checkPermission(PERMISSIONS.MANAGE_POS_SESSIONS)

    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Verify session exists and belongs to user's organization
    const posSession = await prisma.pOSSession.findFirst({
      where: {
        id: sessionId,
        Location: {
          organizationId: session.user.organizationId
        }
      }
    })

    if (!posSession) {
      throw new Error("Session not found")
    }

    // Update session with closing details
    await prisma.pOSSession.update({
      where: { id: sessionId },
      data: {
        status: 'CLOSED',
        endTime: new Date(),
        closingBalance: closingCash,
        variance: closingCash - (posSession.openingBalance + posSession.totalSales)
      }
    })

    // Clear the current session from the terminal
    await prisma.pOSStation.updateMany({
      where: { currentSessionId: sessionId },
      data: { currentSessionId: null }
    })

    revalidatePath("/dashboard/pos-system")
    return true
  } catch (error) {
    console.error("Error ending session:", error)
    throw new Error("Failed to end session")
  }
}

export async function suspendSession(sessionId: string): Promise<POSSession | null> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Mock implementation - will be replaced with actual database call
    console.log(`Suspending session ${sessionId}`)

    revalidatePath("/dashboard/pos-system")
    return null
  } catch (error) {
    console.error("Error suspending session:", error)
    throw new Error("Failed to suspend session")
  }
}

export async function resumeSession(sessionId: string): Promise<POSSession | null> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Mock implementation - will be replaced with actual database call
    console.log(`Resuming session ${sessionId}`)

    revalidatePath("/dashboard/pos-system")
    return null
  } catch (error) {
    console.error("Error resuming session:", error)
    throw new Error("Failed to resume session")
  }
}

export async function getSessionAnalytics(sessionId: string): Promise<SessionAnalytics | null> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Mock analytics data for now
    const mockAnalytics: SessionAnalytics = {
      totalSales: 0,
      totalTransactions: 0,
      averageTransaction: 0,
      cashSales: 0,
      cardSales: 0,
      hourlyBreakdown: [],
      topItems: []
    }

    return mockAnalytics
  } catch (error) {
    console.error("Error fetching session analytics:", error)
    return null
  }
}

export async function getAvailableLocations() {
  try {
    // Check permissions
    await checkAnyPermission([
      PERMISSIONS.READ_LOCATIONS,
      PERMISSIONS.OPERATE_POS
    ])

    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Get all active locations for the organization
    const locations = await prisma.location.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return locations.map(location => ({
      id: location.id,
      name: location.name,
      address: location.address || '',
      city: '', // Not in current schema
      state: '', // Not in current schema
      zipCode: '', // Not in current schema
      timezone: 'UTC' // Default
    }))
  } catch (error) {
    console.error("Error fetching locations:", error)
    throw new Error("Failed to fetch locations")
  }
}

export async function getTerminalsByLocation(locationId: string) {
  try {
    // Check permissions
    await checkAnyPermission([
      PERMISSIONS.READ_LOCATIONS,
      PERMISSIONS.OPERATE_POS,
      PERMISSIONS.MANAGE_POS_SESSIONS
    ])

    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Get all terminals for the specified location
    const terminals = await prisma.pOSStation.findMany({
      where: {
        organizationId: session.user.organizationId,
        locationId: locationId
      },
      include: {
        currentSession: true
      },
      orderBy: {
        stationNumber: 'asc'
      }
    })

    return terminals.map(terminal => ({
      id: terminal.id,
      stationNumber: terminal.stationNumber,
      terminalName: terminal.name,
      locationId: terminal.locationId,
      organizationId: terminal.organizationId,
      status: terminal.isActive ?
        (terminal.currentSession ? 'ACTIVE' : 'AVAILABLE') :
        'MAINTENANCE' as const,
      capabilities: terminal.hasCashDrawer ?
        ["RECEIPT_PRINTER", "CASH_DRAWER", "BARCODE_SCANNER"] :
        ["RECEIPT_PRINTER", "BARCODE_SCANNER"],
      currentSessionId: terminal.currentSessionId,
      hasActiveSession: !!terminal.currentSession
    }))
  } catch (error) {
    console.error("Error fetching terminals:", error)
    throw new Error("Failed to fetch terminals")
  }
}

export async function sessionHeartbeat(sessionId: string): Promise<void> {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      throw new Error("Unauthorized")
    }

    // Mock heartbeat - will be replaced with actual database call
    console.log(`Heartbeat for session ${sessionId}`)
  } catch (error) {
    console.error("Error sending heartbeat:", error)
    throw new Error("Failed to send heartbeat")
  }
}