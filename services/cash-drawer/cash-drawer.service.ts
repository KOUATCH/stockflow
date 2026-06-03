import { db } from "@/prisma/db"
import { logger } from "@/lib/logger"
import type { Decimal } from "@prisma/client/runtime/library"

const toN = (v: Decimal | number | string | null | undefined): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === "number") return v
  if (typeof v === "string") return Number(v) || 0
  return Number(v.toString()) || 0
}

export type CashMovementInput = {
  sessionId: string
  userId: string
  amount: number
  reason: string
  notes?: string
}

export type CashDrawerSummary = {
  currentBalance: number
  expectedBalance: number
  variance: number
  totalSales: number
  totalCashIn: number
  totalCashOut: number
  eventCount: number
  lastEvent?: Date
}

async function getActiveDrawerForSession(sessionId: string) {
  const session = await db.pOSSession.findUnique({
    where: { id: sessionId },
    include: { terminal: { include: { CashDrawer: true } } },
  })
  if (!session || session.status !== "ACTIVE") throw new Error("Active session not found")
  const cashDrawer = session.terminal.CashDrawer[0]
  if (!cashDrawer) throw new Error("No cash drawer linked to this session")
  return { session, cashDrawer }
}

export async function addCash(input: CashMovementInput): Promise<void> {
  logger.info("cash-drawer.add", { sessionId: input.sessionId, amount: input.amount })
  const { session, cashDrawer } = await getActiveDrawerForSession(input.sessionId)

  const balanceBefore = cashDrawer.currentBalance
  const balanceAfter = balanceBefore + input.amount

  await db.$transaction(async (tx) => {
    await tx.cashDrawer.update({
      where: { id: cashDrawer.id },
      data: { currentBalance: balanceAfter, expectedBalance: balanceAfter },
    })
    await tx.cashDrawerTransaction.create({
      data: {
        cashDrawerId: cashDrawer.id,
        sessionId: input.sessionId,
        userId: input.userId,
        type: "CASH_IN",
        amount: input.amount,
        reason: input.reason,
        notes: input.notes,
        balanceBefore,
        balanceAfter,
      },
    })
    await tx.pOSSession.update({
      where: { id: input.sessionId },
      data: { expectedBalance: { increment: input.amount } },
    })
  })
}

export async function removeCash(input: CashMovementInput): Promise<void> {
  logger.info("cash-drawer.remove", { sessionId: input.sessionId, amount: input.amount })
  const { cashDrawer } = await getActiveDrawerForSession(input.sessionId)

  if (cashDrawer.currentBalance < input.amount) {
    throw new Error(`Insufficient balance. Available: ${cashDrawer.currentBalance.toFixed(2)}`)
  }

  const balanceBefore = cashDrawer.currentBalance
  const balanceAfter = balanceBefore - input.amount

  await db.$transaction(async (tx) => {
    await tx.cashDrawer.update({
      where: { id: cashDrawer.id },
      data: { currentBalance: balanceAfter, expectedBalance: balanceAfter },
    })
    await tx.cashDrawerTransaction.create({
      data: {
        cashDrawerId: cashDrawer.id,
        sessionId: input.sessionId,
        userId: input.userId,
        type: "CASH_OUT",
        amount: input.amount,
        reason: input.reason,
        notes: input.notes,
        balanceBefore,
        balanceAfter,
      },
    })
    await tx.pOSSession.update({
      where: { id: input.sessionId },
      data: { expectedBalance: { decrement: input.amount } },
    })
  })
}

export async function getSummary(sessionId: string): Promise<CashDrawerSummary> {
  const { cashDrawer } = await getActiveDrawerForSession(sessionId)

  const events = await db.cashDrawerTransaction.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
  })

  const totalSales  = events.filter(e => e.type === "SALE").reduce((s, e) => s + toN(e.amount), 0)
  const totalCashIn = events.filter(e => e.type === "CASH_IN").reduce((s, e) => s + toN(e.amount), 0)
  const totalCashOut = events.filter(e => e.type === "CASH_OUT").reduce((s, e) => s + toN(e.amount), 0)

  return {
    currentBalance: toN(cashDrawer.currentBalance),
    expectedBalance: toN(cashDrawer.expectedBalance),
    variance: toN(cashDrawer.currentBalance) - toN(cashDrawer.expectedBalance),
    totalSales,
    totalCashIn,
    totalCashOut,
    eventCount: events.length,
    lastEvent: events[0]?.createdAt,
  }
}
