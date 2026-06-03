import { db } from "@/prisma/db"
import { logger } from "@/lib/logger"
import type { Decimal } from "@prisma/client/runtime/library"

const toN = (v: Decimal | number | string | null | undefined): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === "number") return v
  if (typeof v === "string") return Number(v) || 0
  return Number(v.toString()) || 0
}

export type OpenSessionInput = {
  terminalId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance?: number
}

export type CloseSessionInput = {
  sessionId: string
  userId: string
  actualBalance: number
  notes?: string
}

export type POSSessionResult = {
  id: string
  sessionNumber: string
  status: string
  openingBalance: number
  expectedBalance: number
  totalSales: number
  transactionCount: number
  terminalId: string
  userId: string
  locationId: string
  startTime: Date
}

function generateSessionNumber(): string {
  const date = new Date().toISOString().slice(0, 10)
  const rand = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `SES-${date}-${rand}`
}

export async function openSession(input: OpenSessionInput): Promise<POSSessionResult> {
  const { terminalId, userId, locationId, organizationId, openingBalance = 0 } = input

  logger.info("pos-session.open", { terminalId, userId, locationId })

  const existing = await db.pOSSession.findFirst({
    where: { terminalId, status: "ACTIVE" },
  })
  if (existing) throw new Error("Terminal already has an active session")

  const terminal = await db.pOSStation.findFirst({
    where: { id: terminalId, isActive: true },
  })
  if (!terminal) throw new Error("Terminal not found or inactive")

  return db.$transaction(async (tx) => {
    const session = await tx.pOSSession.create({
      data: {
        sessionNumber: generateSessionNumber(),
        terminalId,
        userId,
        locationId,
        status: "ACTIVE",
        openingBalance,
        expectedBalance: openingBalance,
        totalSales: 0,
        transactionCount: 0,
        startTime: new Date(),
      },
    })

    // Reuse existing drawer or create one
    let cashDrawer = await tx.cashDrawer.findFirst({ where: { terminalId } })
    if (!cashDrawer) {
      cashDrawer = await tx.cashDrawer.create({
        data: {
          name: `Cash Drawer — ${terminal.name}`,
          drawerNumber: `DRAWER-${terminal.terminalNumber}`,
          terminalId,
          locationId,
          currentBalance: openingBalance,
          expectedBalance: openingBalance,
          isOpen: true,
        },
      })
    } else {
      await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: { currentBalance: openingBalance, expectedBalance: openingBalance, isOpen: true },
      })
    }

    await tx.cashDrawerTransaction.create({
      data: {
        cashDrawerId: cashDrawer.id,
        sessionId: session.id,
        userId,
        type: "OPENING_BALANCE",
        amount: openingBalance,
        reason: "Session opening balance",
        balanceBefore: 0,
        balanceAfter: openingBalance,
      },
    })

    await tx.pOSStation.update({
      where: { id: terminalId },
      data: { currentSessionId: session.id },
    })

    return session as unknown as POSSessionResult
  })
}

export async function closeSession(input: CloseSessionInput): Promise<{ variance: number }> {
  const { sessionId, userId, actualBalance, notes } = input

  logger.info("pos-session.close", { sessionId, userId, actualBalance })

  const session = await db.pOSSession.findUnique({
    where: { id: sessionId },
    include: { terminal: { include: { CashDrawer: true } } },
  })
  if (!session) throw new Error("Session not found")
  if (session.status !== "ACTIVE") throw new Error("Session is not active")

  const variance = actualBalance - toN(session.expectedBalance)

  await db.$transaction(async (tx) => {
    await tx.pOSSession.update({
      where: { id: sessionId },
      data: { status: "CLOSED", endTime: new Date(), closingBalance: actualBalance, variance, notes },
    })

    const cashDrawer = session.terminal.CashDrawer[0]
    if (cashDrawer) {
      await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: { isOpen: false, currentBalance: actualBalance },
      })

      await tx.cashDrawerTransaction.create({
        data: {
          cashDrawerId: cashDrawer.id,
          sessionId,
          userId,
          type: "CLOSING_BALANCE",
          amount: actualBalance,
          reason: "Session closing balance",
          notes,
          balanceBefore: session.expectedBalance ?? 0,
          balanceAfter: actualBalance,
        },
      })
    }

    await tx.pOSStation.update({
      where: { id: session.terminalId },
      data: { currentSessionId: null },
    })
  })

  return { variance }
}

export async function getActiveSession(terminalId: string) {
  return db.pOSSession.findFirst({
    where: { terminalId, status: "ACTIVE" },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      terminal: { select: { id: true, name: true, terminalNumber: true } },
      cashDrawerTransactions: {
        include: { cashDrawer: { select: { id: true, currentBalance: true, expectedBalance: true, isOpen: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })
}
