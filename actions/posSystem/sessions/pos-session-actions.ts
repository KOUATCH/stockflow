"use server"

import { randomUUID } from "crypto"

import { auth } from "@/auth"
import { checkAnyPermission, checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import { prisma } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export type SessionStatus = "ACTIVE" | "SUSPENDED" | "CLOSED" | "RECONCILED"

export interface POSSession {
  id: string
  sessionNumber: string
  stationId: string
  locationId: string
  organizationId: string
  userId: string
  status: SessionStatus
  startTime: Date
  endTime?: Date
  openingCash: number
  closingCash?: number
  totalSales: number
  totalTransactions: number
  notes?: string
  station: {
    id: string
    stationNumber: string
    stationName: string
    locationId: string
    organizationId: string
    status: "ACTIVE" | "INACTIVE"
    configuration: Record<string, unknown>
    version: number
    capabilities: string[]
    location: {
      id: string
      name: string
      address: string
    }
    sessions: POSSession[]
  }
  location: {
    id: string
    name: string
    address: string
    city?: string
    state?: string
    zipCode?: string
    timezone?: string
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  transactions: unknown[]
}

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

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined

function toNumber(value: DecimalLike): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value.toString()) || 0
}

function revalidatePOSSystem(): void {
  revalidatePath("/[locale]/dashboard/pos-system", "page")
}

async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id || !session.user.organizationId) {
    throw new Error("Unauthorized")
  }

  return session.user
}

type POSSessionRecord = Awaited<ReturnType<typeof prisma.pOSSession.findFirst>> & {
  location?: {
    id: string
    name: string
    address: string | null
  }
  terminal?: {
    id: string
    terminalNumber: string
    name: string
    locationId: string
    organizationId: string
    isActive: boolean
    hasCashDrawer: boolean
  }
  user?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
}

function mapSession(session: NonNullable<POSSessionRecord>): POSSession {
  const location = session.location
  const terminal = session.terminal
  const user = session.user

  return {
    id: session.id,
    sessionNumber: session.sessionNumber,
    stationId: session.terminalId,
    locationId: session.locationId,
    organizationId: session.organizationId,
    userId: session.userId,
    status: session.status as SessionStatus,
    startTime: session.startTime,
    endTime: session.endTime ?? undefined,
    openingCash: toNumber(session.openingBalance),
    closingCash: session.closingBalance == null ? undefined : toNumber(session.closingBalance),
    totalSales: toNumber(session.totalSales),
    totalTransactions: session.transactionCount,
    notes: session.notes ?? undefined,
    station: {
      id: terminal?.id ?? session.terminalId,
      stationNumber: terminal?.terminalNumber ?? "",
      stationName: terminal?.name ?? "Unknown Terminal",
      locationId: terminal?.locationId ?? session.locationId,
      organizationId: terminal?.organizationId ?? session.organizationId,
      status: terminal?.isActive ? "ACTIVE" : "INACTIVE",
      configuration: {},
      version: 1,
      capabilities: terminal?.hasCashDrawer
        ? ["RECEIPT_PRINTER", "CASH_DRAWER", "BARCODE_SCANNER"]
        : ["RECEIPT_PRINTER", "BARCODE_SCANNER"],
      location: {
        id: location?.id ?? session.locationId,
        name: location?.name ?? "Unknown Location",
        address: location?.address ?? "",
      },
      sessions: [],
    },
    location: {
      id: location?.id ?? session.locationId,
      name: location?.name ?? "Unknown Location",
      address: location?.address ?? "",
      city: "",
      state: "",
      zipCode: "",
      timezone: "UTC",
    },
    user: {
      id: user?.id ?? session.userId,
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    },
    transactions: [],
  }
}

async function findSessionWithRelations(id: string) {
  return prisma.pOSSession.findFirst({
    where: { id },
    include: {
      location: true,
      terminal: true,
      user: true,
    },
  })
}

export async function getActiveSession(stationId: string): Promise<POSSession | null> {
  await checkAnyPermission([
    PERMISSIONS.OPERATE_POS,
    PERMISSIONS.MANAGE_POS_SESSIONS,
    PERMISSIONS.VIEW_POS_REPORTS,
  ])

  const user = await getCurrentUser()
  const activeSession = await prisma.pOSSession.findFirst({
    where: {
      terminalId: stationId,
      organizationId: user.organizationId,
      status: "ACTIVE",
    },
    include: {
      location: true,
      terminal: true,
      user: true,
    },
  })

  return activeSession ? mapSession(activeSession) : null
}

export async function startSession(data: CreateSessionData): Promise<POSSession> {
  await checkPermission(PERMISSIONS.OPERATE_POS)

  const user = await getCurrentUser()
  const terminal = await prisma.pOSStation.findFirst({
    where: {
      id: data.stationId,
      organizationId: user.organizationId,
      isActive: true,
    },
    include: {
      location: true,
    },
  })

  if (!terminal) {
    throw new Error("Terminal not found or not available")
  }

  if (terminal.locationId !== data.locationId) {
    throw new Error("Terminal is not available at the specified location")
  }

  const existingSession = await prisma.pOSSession.findFirst({
    where: {
      terminalId: data.stationId,
      organizationId: user.organizationId,
      status: "ACTIVE",
    },
  })

  if (existingSession) {
    throw new Error("Terminal already has an active session")
  }

  const now = new Date()
  const newSession = await prisma.pOSSession.create({
    data: {
      id: randomUUID(),
      sessionNumber: `POS-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      terminalId: data.stationId,
      locationId: data.locationId,
      organizationId: user.organizationId,
      userId: user.id,
      status: "ACTIVE",
      openingBalance: data.openingCash,
      expectedBalance: data.openingCash,
      notes: data.notes,
      startTime: now,
      updatedAt: now,
    },
  })

  await prisma.pOSStation.updateMany({
    where: { id: data.stationId, organizationId: user.organizationId },
    data: {
      currentSessionId: newSession.id,
      updatedAt: now,
    },
  })

  const hydratedSession = await findSessionWithRelations(newSession.id)
  if (!hydratedSession) {
    throw new Error("Failed to load created session")
  }

  revalidatePOSSystem()
  return mapSession(hydratedSession)
}

export async function endSession(sessionId: string, closingCash: number): Promise<boolean> {
  await checkPermission(PERMISSIONS.MANAGE_POS_SESSIONS)

  const user = await getCurrentUser()
  const posSession = await prisma.pOSSession.findFirst({
    where: {
      id: sessionId,
      organizationId: user.organizationId,
    },
  })

  if (!posSession) {
    throw new Error("Session not found")
  }

  const expectedBalance = toNumber(posSession.openingBalance) + toNumber(posSession.totalSales)
  const now = new Date()

  await prisma.pOSSession.update({
    where: { id: sessionId },
    data: {
      status: "CLOSED",
      endTime: now,
      closingBalance: closingCash,
      variance: closingCash - expectedBalance,
      updatedAt: now,
    },
  })

  await prisma.pOSStation.updateMany({
    where: { currentSessionId: sessionId },
    data: {
      currentSessionId: null,
      updatedAt: now,
    },
  })

  revalidatePOSSystem()
  return true
}

export async function suspendSession(sessionId: string): Promise<POSSession | null> {
  const user = await getCurrentUser()
  const updated = await prisma.pOSSession.updateMany({
    where: {
      id: sessionId,
      organizationId: user.organizationId,
      status: "ACTIVE",
    },
    data: {
      status: "SUSPENDED",
      updatedAt: new Date(),
    },
  })

  if (updated.count === 0) return null
  const session = await findSessionWithRelations(sessionId)

  revalidatePOSSystem()
  return session ? mapSession(session) : null
}

export async function resumeSession(sessionId: string): Promise<POSSession | null> {
  const user = await getCurrentUser()
  const updated = await prisma.pOSSession.updateMany({
    where: {
      id: sessionId,
      organizationId: user.organizationId,
      status: "SUSPENDED",
    },
    data: {
      status: "ACTIVE",
      updatedAt: new Date(),
    },
  })

  if (updated.count === 0) return null
  const session = await findSessionWithRelations(sessionId)

  revalidatePOSSystem()
  return session ? mapSession(session) : null
}

export async function getSessionAnalytics(sessionId: string): Promise<SessionAnalytics | null> {
  const user = await getCurrentUser()
  const session = await prisma.pOSSession.findFirst({
    where: {
      id: sessionId,
      organizationId: user.organizationId,
    },
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
    },
  })

  if (!session) return null

  const totalSales = session.salesOrders.reduce((sum, order) => sum + toNumber(order.total), 0)
  const totalTransactions = session.salesOrders.length
  const payments = session.salesOrders.flatMap((order) => order.payments)
  const cashSales = payments.filter((payment) => payment.method === "CASH").reduce((sum, payment) => sum + toNumber(payment.amount), 0)
  const cardSales = payments.filter((payment) => payment.method === "CARD").reduce((sum, payment) => sum + toNumber(payment.amount), 0)
  const itemSales = new Map<string, { itemName: string; quantity: number; revenue: number }>()

  session.salesOrders.forEach((order) => {
    order.lines.forEach((line) => {
      const item = itemSales.get(line.itemId) ?? {
        itemName: line.item.nameEn || line.item.nameFr || "Unknown Item",
        quantity: 0,
        revenue: 0,
      }
      item.quantity += toNumber(line.quantity)
      item.revenue += toNumber(line.lineTotal)
      itemSales.set(line.itemId, item)
    })
  })

  return {
    totalSales,
    totalTransactions,
    averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
    cashSales,
    cardSales,
    hourlyBreakdown: [],
    topItems: Array.from(itemSales.entries())
      .map(([itemId, item]) => ({ itemId, ...item }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
  }
}

export async function getAvailableLocations() {
  await checkAnyPermission([
    PERMISSIONS.READ_LOCATIONS,
    PERMISSIONS.OPERATE_POS,
  ])

  const user = await getCurrentUser()
  const locations = await prisma.location.findMany({
    where: {
      organizationId: user.organizationId,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return locations.map((location) => ({
    id: location.id,
    name: location.name,
    address: location.address || "",
    city: "",
    state: "",
    zipCode: "",
    timezone: "UTC",
  }))
}

export async function getTerminalsByLocation(locationId: string) {
  await checkAnyPermission([
    PERMISSIONS.READ_LOCATIONS,
    PERMISSIONS.OPERATE_POS,
    PERMISSIONS.MANAGE_POS_SESSIONS,
  ])

  const user = await getCurrentUser()
  const terminals = await prisma.pOSStation.findMany({
    where: {
      organizationId: user.organizationId,
      locationId,
    },
    include: {
      currentSession: true,
    },
    orderBy: {
      terminalNumber: "asc",
    },
  })

  return terminals.map((terminal) => ({
    id: terminal.id,
    stationNumber: terminal.terminalNumber,
    terminalName: terminal.name,
    locationId: terminal.locationId,
    organizationId: terminal.organizationId,
    status: terminal.isActive
      ? (terminal.currentSession ? "ACTIVE" : "AVAILABLE")
      : "MAINTENANCE",
    capabilities: terminal.hasCashDrawer
      ? ["RECEIPT_PRINTER", "CASH_DRAWER", "BARCODE_SCANNER"]
      : ["RECEIPT_PRINTER", "BARCODE_SCANNER"],
    currentSessionId: terminal.currentSessionId,
    hasActiveSession: !!terminal.currentSession,
  }))
}

export async function sessionHeartbeat(sessionId: string): Promise<void> {
  const user = await getCurrentUser()

  await prisma.pOSSession.updateMany({
    where: {
      id: sessionId,
      organizationId: user.organizationId,
    },
    data: {
      updatedAt: new Date(),
    },
  })
}
