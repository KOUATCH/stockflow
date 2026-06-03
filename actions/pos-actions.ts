"use server"

import { db } from "@/prisma/db"
import type { CashDrawerTransactionType, POSSessionStatus, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import {
  financialAction,
  type ServerActionResult,
  ErrorCategory,
  ErrorSeverity,
  executeFinancialOperation,
  FinancialTransactionType
} from '@/lib/error-handling'

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined

function toNumber(value: DecimalLike): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value.toString()) || 0
}

async function runPosFinancialOperation<T>(input: {
  type: FinancialTransactionType
  amount: number
  reference: string
  description: string
  organizationId: string
  userId: string
  locationId?: string
  sessionId?: string
  metadata?: Record<string, unknown>
  operation: (tx: Prisma.TransactionClient, transactionId: string) => Promise<T>
}) {
  return executeFinancialOperation(
    {
      type: input.type,
      amount: input.amount,
      currency: "USD",
      reference: input.reference,
      description: input.description,
      organizationId: input.organizationId,
      userId: input.userId,
      locationId: input.locationId,
      sessionId: input.sessionId,
      metadata: input.metadata,
    },
    input.operation
  )
}

export interface CashDrawerSession {
  id: string
  sessionNumber: string
  terminalId: string
  stationId: string
  userId: string
  locationId: string
  status: POSSessionStatus
  startTime: Date
  endTime?: Date
  openingBalance: number
  closingBalance?: number
  expectedBalance?: number
  variance?: number
  totalSales: number
  totalTax: number
  totalDiscount: number
  transactionCount: number
  cashTotal: number
  cardTotal: number
  digitalTotal: number
  notes?: string
  terminal: {
    id: string
    name: string
    stationNumber: string
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface CashDrawerTransaction {
  id: string
  type: CashDrawerTransactionType
  amount: number
  reason?: string
  notes?: string
  cashDrawerId: string
  sessionId?: string
  userId: string
  balanceBefore: number
  balanceAfter: number
  createdAt: Date
  user: {
    firstName: string
    lastName: string
  }
}

export interface CashDrawerSummary {
  currentBalance: number
  totalSales: number
  totalCashIn: number
  totalCashOut: number
  transactionCount: number
  lastTransaction?: Date
}

export const openPosSession = financialAction(
  async (input: {
    stationId: string;
    userId: string;
    locationId: string;
    openingBalance: number;
  }): Promise<ServerActionResult<{ sessionId: string }>> => {
    const { stationId, userId, locationId, openingBalance } = input;

    const terminalSnapshot = await db.pOSStation.findUnique({
      where: { id: stationId },
      select: { organizationId: true },
    })

    if (!terminalSnapshot) {
      return {
        success: false,
        error: {
          id: `terminal_not_found_${Date.now()}`,
          code: 'TERMINAL_NOT_FOUND',
          message: 'Terminal not found',
          userMessage: 'Terminal not found. Please ensure the terminal is properly configured.',
          category: ErrorCategory.BUSINESS_RULE,
          severity: ErrorSeverity.HIGH,
          recoverable: true,
          retryable: false,
          context: { stationId }
        }
      }
    }

    return await runPosFinancialOperation({
      type: FinancialTransactionType.DEPOSIT,
      amount: openingBalance,
      reference: `POS Session Opening - Terminal ${stationId}`,
      description: "POS session opening balance",
      organizationId: terminalSnapshot.organizationId,
      userId,
      locationId,
      operation: async (tx) => {
        const terminal = await tx.pOSStation.findUnique({
          where: { id: stationId },
        })

        if (!terminal) {
          return {
            success: false,
            error: {
              id: `terminal_not_found_${Date.now()}`,
              code: 'TERMINAL_NOT_FOUND',
              message: 'Terminal not found',
              userMessage: 'Terminal not found. Please ensure the terminal is properly configured.',
              category: ErrorCategory.BUSINESS_RULE,
              severity: ErrorSeverity.HIGH,
              recoverable: true,
              retryable: false,
              context: { stationId }
            }
          }
        }

        if (!terminal.isActive) {
          return {
            success: false,
            error: {
              id: `terminal_inactive_${Date.now()}`,
              code: 'TERMINAL_INACTIVE',
              message: 'Terminal is not active',
              userMessage: 'Terminal is not active. Please activate the terminal first.',
              category: ErrorCategory.BUSINESS_RULE,
              severity: ErrorSeverity.HIGH,
              recoverable: true,
              retryable: false,
              context: { stationId, isActive: terminal.isActive }
            }
          }
        }

        // Check if there's already an active session for this terminal
        const existingSession = await tx.pOSSession.findFirst({
          where: {
            terminalId: stationId,
            status: "ACTIVE",
          },
        })

        if (existingSession) {
          return {
            success: false,
            error: {
              id: `session_already_active_${Date.now()}`,
              code: 'SESSION_ALREADY_ACTIVE',
              message: 'Terminal already has an active session',
              userMessage: 'This terminal already has an active session. Please close the existing session first.',
              category: ErrorCategory.BUSINESS_RULE,
              severity: ErrorSeverity.MEDIUM,
              recoverable: true,
              retryable: false,
              context: { stationId, existingSessionId: existingSession.id }
            }
          }
        }

        // Generate session number
        const sessionNumber = `SES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const session = await tx.pOSSession.create({
          data: {
            sessionNumber,
            terminalId: stationId,
            userId,
            locationId,
            organizationId: terminal.organizationId,
            status: "ACTIVE",
            openingBalance: openingBalance,
            expectedBalance: openingBalance,
          },
        })

        // Get cash drawer for this location
        let cashDrawer = await tx.cashDrawer.findFirst({
          where: { terminalId: stationId },
        })

        if (!cashDrawer) {
          cashDrawer = await tx.cashDrawer.create({
            data: {
              name: `Cash Drawer - Terminal ${stationId}`,
              drawerNumber: `DRW-${stationId}-${Date.now()}`,
              terminalId: stationId,
              locationId,
              currentBalance: openingBalance,
              expectedBalance: openingBalance,
              isOpen: true,
            },
          })
        } else {
          // Update cash drawer
          await tx.cashDrawer.update({
            where: { id: cashDrawer.id },
            data: {
              currentBalance: openingBalance,
              isOpen: true,
            },
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

        // Update terminal's current session
        await tx.pOSStation.update({
          where: { id: stationId },
          data: { currentSessionId: session.id },
        })

        revalidatePath("/pos")
        return {
          success: true,
          data: { sessionId: session.id }
        }
      },
      metadata: {
        terminalId: stationId,
        operationType: 'POS_SESSION_OPEN',
        businessContext: 'Opening POS session with cash drawer initialization'
      }
    });
  },
  {
    actionName: 'openPosSession',
    component: 'POSManagement',
    notifyUser: true,
    notifyAdmin: false,
    autoRetry: false,
    businessContext: {
      domain: 'pos',
      operation: 'session_open',
      resourceType: 'pos_session'
    },
    affectedResources: ['pos_sessions', 'cash_drawers', 'pos_terminals'],
    customUserMessages: {
      [ErrorCategory.BUSINESS_RULE]: 'Unable to open POS session. Please check terminal status and existing sessions.',
      [ErrorCategory.DATABASE]: 'Unable to initialize POS session. Please try again in a moment.',
      [ErrorCategory.FINANCIAL]: 'Cash drawer initialization failed. Please contact support if this persists.'
    }
  }
)

export const closePosSession = financialAction(
  async (input: {
    sessionId: string;
    actualBalance: number;
    notes?: string;
  }): Promise<ServerActionResult<{ variance: number }>> => {
    const { sessionId, actualBalance, notes } = input;

    const sessionSnapshot = await db.pOSSession.findUnique({
      where: { id: sessionId },
      select: {
        userId: true,
        locationId: true,
        organizationId: true,
        expectedBalance: true,
      },
    })

    if (!sessionSnapshot) {
      return {
        success: false,
        error: {
          id: `session_not_found_${Date.now()}`,
          code: 'SESSION_NOT_FOUND',
          message: 'POS session not found',
          userMessage: 'Session not found. Please verify the session exists.',
          category: ErrorCategory.BUSINESS_RULE,
          severity: ErrorSeverity.HIGH,
          recoverable: false,
          retryable: false,
          context: { sessionId }
        }
      }
    }

    return await runPosFinancialOperation({
      type: FinancialTransactionType.ADJUSTMENT,
      amount: actualBalance,
      reference: `POS Session Closing - Session ${sessionId}`,
      description: "POS session closing reconciliation",
      organizationId: sessionSnapshot.organizationId,
      userId: sessionSnapshot.userId,
      locationId: sessionSnapshot.locationId,
      sessionId,
      operation: async (tx) => {
        const session = await tx.pOSSession.findUnique({
          where: { id: sessionId },
        })

        if (!session) {
          return {
            success: false,
            error: {
              id: `session_not_found_${Date.now()}`,
              code: 'SESSION_NOT_FOUND',
              message: 'POS session not found',
              userMessage: 'Session not found. Please verify the session exists.',
              category: ErrorCategory.BUSINESS_RULE,
              severity: ErrorSeverity.HIGH,
              recoverable: false,
              retryable: false,
              context: { sessionId }
            }
          }
        }

        if (session.status !== "ACTIVE") {
          return {
            success: false,
            error: {
              id: `session_not_active_${Date.now()}`,
              code: 'SESSION_NOT_ACTIVE',
              message: 'Session is not active',
              userMessage: 'Session is not active and cannot be closed.',
              category: ErrorCategory.BUSINESS_RULE,
              severity: ErrorSeverity.MEDIUM,
              recoverable: false,
              retryable: false,
              context: { sessionId, status: session.status }
            }
          }
        }

        const expectedBalance = toNumber(session.expectedBalance)
        const variance = actualBalance - expectedBalance

        // Update session
        await tx.pOSSession.update({
          where: { id: sessionId },
          data: {
            status: "CLOSED",
            endTime: new Date(),
            closingBalance: actualBalance,
            variance: variance,
            notes,
          },
        })

        // Get cash drawer for this location
        const cashDrawer = await tx.cashDrawer.findFirst({
          where: { terminalId: session.terminalId },
        })

        if (cashDrawer) {
          await tx.cashDrawer.update({
            where: { id: cashDrawer.id },
            data: {
              isOpen: false,
              currentBalance: actualBalance,
            },
          })

          // Record closing transaction
          await tx.cashDrawerTransaction.create({
            data: {
              cashDrawerId: cashDrawer.id,
              sessionId,
              userId: session.userId,
              type: "CLOSING_BALANCE",
              amount: actualBalance,
              reason: "Session closing balance",
              notes,
              balanceBefore: expectedBalance,
              balanceAfter: actualBalance,
            },
          })
        }

        // Clear terminal's current session
        await tx.pOSStation.update({
          where: { id: session.terminalId },
          data: { currentSessionId: null },
        })

        revalidatePath("/pos")
        return {
          success: true,
          data: { variance }
        }
      },
      metadata: {
        operationType: 'POS_SESSION_CLOSE',
        businessContext: `Closing POS session with variance: ${actualBalance - toNumber(sessionSnapshot.expectedBalance)}`
      }
    });
  },
  {
    actionName: 'closePosSession',
    component: 'POSManagement',
    notifyUser: true,
    notifyAdmin: true, // Admin notification for variance alerts
    autoRetry: false,
    businessContext: {
      domain: 'pos',
      operation: 'session_close',
      resourceType: 'pos_session'
    },
    affectedResources: ['pos_sessions', 'cash_drawers', 'pos_terminals'],
    customUserMessages: {
      [ErrorCategory.BUSINESS_RULE]: 'Unable to close POS session. Please verify the session status.',
      [ErrorCategory.DATABASE]: 'Unable to finalize session closure. Please try again in a moment.',
      [ErrorCategory.FINANCIAL]: 'Cash reconciliation failed. Please contact support immediately.'
    }
  }
)

export const addCashToDrawer = financialAction(
  async (input: {
    sessionId: string;
    amount: number;
    reason: string;
    notes?: string;
  }): Promise<ServerActionResult<{ newBalance: number }>> => {
    const { sessionId, amount, reason, notes } = input;

    if (amount <= 0) {
      return {
        success: false,
        error: {
          id: `invalid_amount_${Date.now()}`,
          code: 'INVALID_AMOUNT',
          message: 'Amount must be greater than zero',
          userMessage: 'Please enter a valid amount greater than zero.',
          category: ErrorCategory.FORM_VALIDATION,
          severity: ErrorSeverity.LOW,
          recoverable: true,
          retryable: false,
          context: { amount, sessionId }
        }
      }
    }

    const sessionSnapshot = await db.pOSSession.findUnique({
      where: { id: sessionId },
      select: { userId: true, locationId: true, organizationId: true },
    })

    if (!sessionSnapshot) {
      return {
        success: false,
        error: {
          id: `session_not_found_${Date.now()}`,
          code: 'SESSION_NOT_FOUND',
          message: 'POS session not found',
          userMessage: 'Session not found. Please verify the session exists.',
          category: ErrorCategory.BUSINESS_RULE,
          severity: ErrorSeverity.HIGH,
          recoverable: false,
          retryable: false,
          context: { sessionId }
        }
      }
    }

    return await runPosFinancialOperation({
      type: FinancialTransactionType.DEPOSIT,
      amount,
      reference: `Cash In: ${reason}`,
      description: `Adding cash to drawer: ${reason}`,
      organizationId: sessionSnapshot.organizationId,
      userId: sessionSnapshot.userId,
      locationId: sessionSnapshot.locationId,
      sessionId,
      operation: async (tx) => {
        const session = await tx.pOSSession.findUnique({
          where: { id: sessionId },
        })

        if (!session) {
          return {
            success: false,
            error: {
              id: `session_not_found_${Date.now()}`,
              code: 'SESSION_NOT_FOUND',
              message: 'POS session not found',
              userMessage: 'Session not found. Please verify the session exists.',
              category: ErrorCategory.BUSINESS_RULE,
              severity: ErrorSeverity.HIGH,
              recoverable: false,
              retryable: false,
              context: { sessionId }
            }
          }
        }

        const cashDrawer = await tx.cashDrawer.findFirst({
          where: { terminalId: session.terminalId },
        })

        if (!cashDrawer) {
          return {
            success: false,
            error: {
              id: `cash_drawer_not_found_${Date.now()}`,
              code: 'CASH_DRAWER_NOT_FOUND',
              message: 'Cash drawer not found',
              userMessage: 'Cash drawer not found for this location.',
              category: ErrorCategory.BUSINESS_RULE,
              severity: ErrorSeverity.HIGH,
              recoverable: false,
              retryable: false,
              context: { sessionId, locationId: session.locationId }
            }
          }
        }

        const currentBalance = toNumber(cashDrawer.currentBalance)
        const newBalance = currentBalance + amount

        // Update cash drawer balance
        await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            currentBalance: newBalance,
          },
        })

        // Update session expected cash
        await tx.pOSSession.update({
          where: { id: sessionId },
          data: {
            expectedBalance: newBalance,
          },
        })

        // Record transaction
        await tx.cashDrawerTransaction.create({
          data: {
            cashDrawerId: cashDrawer.id,
            sessionId,
            userId: session.userId,
            type: "CASH_IN",
            amount,
            reason,
            notes,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
          },
        })

        revalidatePath("/pos")
        return {
          success: true,
          data: { newBalance }
        }
      },
      metadata: {
        operationType: 'CASH_DRAWER_ADD',
        businessContext: `Adding cash to drawer: ${reason}`
      }
    });
  },
  {
    actionName: 'addCashToDrawer',
    component: 'POSCashManagement',
    notifyUser: true,
    notifyAdmin: false,
    autoRetry: false,
    businessContext: {
      domain: 'pos',
      operation: 'cash_add',
      resourceType: 'cash_drawer'
    },
    affectedResources: ['cash_drawers', 'pos_sessions', 'cash_transactions'],
    customUserMessages: {
      [ErrorCategory.FORM_VALIDATION]: 'Please enter a valid amount.',
      [ErrorCategory.BUSINESS_RULE]: 'Unable to add cash to drawer. Please check session and drawer status.',
      [ErrorCategory.DATABASE]: 'Unable to record cash transaction. Please try again in a moment.',
      [ErrorCategory.FINANCIAL]: 'Cash transaction failed. Please contact support if this persists.'
    }
  }
)

export const removeCashFromDrawer = financialAction(
  async (input: {
    sessionId: string;
    amount: number;
    reason: string;
    notes?: string;
  }): Promise<ServerActionResult<{ newBalance: number }>> => {
    const { sessionId, amount, reason, notes } = input;

    if (amount <= 0) {
      return {
        success: false,
        error: {
          id: `invalid_amount_${Date.now()}`,
          code: 'INVALID_AMOUNT',
          message: 'Amount must be greater than zero',
          userMessage: 'Please enter a valid amount greater than zero.',
          category: ErrorCategory.FORM_VALIDATION,
          severity: ErrorSeverity.LOW,
          recoverable: true,
          retryable: false,
          context: { amount, sessionId }
        }
      }
    }

    const sessionSnapshot = await db.pOSSession.findUnique({
      where: { id: sessionId },
      select: { userId: true, locationId: true, organizationId: true },
    })

    if (!sessionSnapshot) {
      return {
        success: false,
        error: {
          id: `session_not_found_${Date.now()}`,
          code: 'SESSION_NOT_FOUND',
          message: 'POS session not found',
          userMessage: 'Session not found. Please verify the session exists.',
          category: ErrorCategory.BUSINESS_RULE,
          severity: ErrorSeverity.HIGH,
          recoverable: false,
          retryable: false,
          context: { sessionId }
        }
      }
    }

    return await runPosFinancialOperation({
      type: FinancialTransactionType.WITHDRAWAL,
      amount,
      reference: `Cash Out: ${reason}`,
      description: `Removing cash from drawer: ${reason}`,
      organizationId: sessionSnapshot.organizationId,
      userId: sessionSnapshot.userId,
      locationId: sessionSnapshot.locationId,
      sessionId,
      operation: async (tx) => {
        const session = await tx.pOSSession.findUnique({
          where: { id: sessionId },
        })

        if (!session) {
          return {
            success: false,
            error: {
              id: `session_not_found_${Date.now()}`,
              code: 'SESSION_NOT_FOUND',
              message: 'POS session not found',
              userMessage: 'Session not found. Please verify the session exists.',
              category: ErrorCategory.BUSINESS_RULE,
              severity: ErrorSeverity.HIGH,
              recoverable: false,
              retryable: false,
              context: { sessionId }
            }
          }
        }

        const cashDrawer = await tx.cashDrawer.findFirst({
          where: { terminalId: session.terminalId },
        })

        if (!cashDrawer) {
          return {
            success: false,
            error: {
              id: `cash_drawer_not_found_${Date.now()}`,
              code: 'CASH_DRAWER_NOT_FOUND',
              message: 'Cash drawer not found',
              userMessage: 'Cash drawer not found for this location.',
              category: ErrorCategory.BUSINESS_RULE,
              severity: ErrorSeverity.HIGH,
              recoverable: false,
              retryable: false,
              context: { sessionId, locationId: session.locationId }
            }
          }
        }

        const currentBalance = toNumber(cashDrawer.currentBalance)
        const newBalance = currentBalance - amount

        if (newBalance < 0) {
          return {
            success: false,
            error: {
              id: `insufficient_funds_${Date.now()}`,
              code: 'INSUFFICIENT_CASH',
              message: 'Insufficient cash in drawer',
              userMessage: `Cannot remove $${amount}. Current balance: $${currentBalance}. Insufficient funds.`,
              category: ErrorCategory.BUSINESS_RULE,
              severity: ErrorSeverity.MEDIUM,
              recoverable: true,
              retryable: false,
              context: {
                requestedAmount: amount,
                currentBalance,
                shortfall: Math.abs(newBalance),
                sessionId
              }
            }
          }
        }

        // Update cash drawer balance
        await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            currentBalance: newBalance,
          },
        })

        // Update session expected cash
        await tx.pOSSession.update({
          where: { id: sessionId },
          data: {
            expectedBalance: newBalance,
          },
        })

        // Record transaction
        await tx.cashDrawerTransaction.create({
          data: {
            cashDrawerId: cashDrawer.id,
            sessionId,
            userId: session.userId,
            type: "CASH_OUT",
            amount,
            reason,
            notes,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
          },
        })

        revalidatePath("/pos")
        return {
          success: true,
          data: { newBalance }
        }
      },
      metadata: {
        operationType: 'CASH_DRAWER_REMOVE',
        businessContext: `Removing cash from drawer: ${reason}`
      }
    });
  },
  {
    actionName: 'removeCashFromDrawer',
    component: 'POSCashManagement',
    notifyUser: true,
    notifyAdmin: true, // Admin notification for cash removal
    autoRetry: false,
    businessContext: {
      domain: 'pos',
      operation: 'cash_remove',
      resourceType: 'cash_drawer'
    },
    affectedResources: ['cash_drawers', 'pos_sessions', 'cash_transactions'],
    customUserMessages: {
      [ErrorCategory.FORM_VALIDATION]: 'Please enter a valid amount.',
      [ErrorCategory.BUSINESS_RULE]: 'Unable to remove cash. Please check available balance and try again.',
      [ErrorCategory.DATABASE]: 'Unable to record cash transaction. Please try again in a moment.',
      [ErrorCategory.FINANCIAL]: 'Cash transaction failed. Please contact support immediately.'
    }
  }
)

export async function getCurrentSession(stationId: string): Promise<CashDrawerSession | null> {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        terminalId: stationId,
        status: "ACTIVE",
      },
      include: {
        terminal: {
          select: {
            id: true,
            name: true,
            terminalNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!session) return null

    return {
      ...session,
      stationId: session.terminalId,
      endTime: session.endTime ?? undefined,
      openingBalance: toNumber(session.openingBalance),
      closingBalance: session.closingBalance == null ? undefined : toNumber(session.closingBalance),
      expectedBalance: session.expectedBalance == null ? undefined : toNumber(session.expectedBalance),
      variance: session.variance == null ? undefined : toNumber(session.variance),
      totalSales: toNumber(session.totalSales),
      totalTax: toNumber(session.totalTax),
      totalDiscount: toNumber(session.totalDiscount),
      cashTotal: toNumber(session.cashTotal),
      cardTotal: toNumber(session.cardTotal),
      digitalTotal: toNumber(session.mobileMoneyTotal),
      notes: session.notes ?? undefined,
      terminal: {
        ...session.terminal,
        stationNumber: session.terminal.terminalNumber,
      },
      user: {
        ...session.user,
        firstName: session.user.firstName ?? "",
        lastName: session.user.lastName ?? "",
      },
    }
  } catch (error) {
    console.error("Error getting current session:", error)
    return null
  }
}

export async function getCashDrawerTransactions(sessionId: string, limit = 50): Promise<CashDrawerTransaction[]> {
  try {
    const transactions = await db.cashDrawerTransaction.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return transactions.map((transaction) => ({
      ...transaction,
      amount: toNumber(transaction.amount),
      balanceBefore: toNumber(transaction.balanceBefore),
      balanceAfter: toNumber(transaction.balanceAfter),
      sessionId: transaction.sessionId ?? undefined,
      reason: transaction.reason ?? undefined,
      notes: transaction.notes ?? undefined,
      user: {
        firstName: transaction.user.firstName ?? "",
        lastName: transaction.user.lastName ?? "",
      },
    }))
  } catch (error) {
    console.error("Error getting cash drawer transactions:", error)
    return []
  }
}

export async function getCashDrawerSummary(sessionId: string): Promise<CashDrawerSummary | null> {
  try {
    const session = await db.pOSSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return null
    }

    const cashDrawer = await db.cashDrawer.findFirst({
      where: { terminalId: session.terminalId },
    })

    if (!cashDrawer) {
      return null
    }

    const events = await db.cashDrawerTransaction.findMany({
      where: { sessionId },
    })

    const totalSales = events.filter((e) => e.type === "SALE").reduce((sum, e) => sum + toNumber(e.amount), 0)

    const totalCashIn = events.filter((e) => e.type === "CASH_IN").reduce((sum, e) => sum + toNumber(e.amount), 0)

    const totalCashOut = events.filter((e) => e.type === "CASH_OUT").reduce((sum, e) => sum + toNumber(e.amount), 0)

    const lastTransaction =
      events.length > 0 ? events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt : undefined

    return {
      currentBalance: toNumber(cashDrawer.currentBalance),
      totalSales: toNumber(session.totalSales),
      totalCashIn,
      totalCashOut,
      transactionCount: events.length,
      lastTransaction,
    }
  } catch (error) {
    console.error("Error getting cash drawer summary:", error)
    return null
  }
}
