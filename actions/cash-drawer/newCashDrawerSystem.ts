"use server"

import { db } from "@/prisma/db"
import { CashDrawerTransactionType, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Types for cash drawer operations
export interface CashDrawerOperation {
  drawerId: string
  sessionId?: string
  userId: string
  type: CashDrawerTransactionType
  amount: number
  reason: string
  notes?: string
}

export interface CashDrawerSummary {
  id: string
  name: string
  drawerNumber: string
  currentBalance: number
  expectedBalance: number
  isOpen: boolean
  locationId: string
  terminalId: string
  lastTransaction?: {
    id: string
    type: CashDrawerTransactionType
    amount: number
    createdAt: Date
    reason: string
  }
  todayTransactions: number
  todayTotal: number
  variance: number
}

export interface CashDrawerReport {
  drawerId: string
  drawerName: string
  date: Date
  openingBalance: number
  closingBalance: number
  totalCashIn: number
  totalCashOut: number
  totalSales: number
  totalReturns: number
  netCashFlow: number
  variance: number
  transactionCount: number
  transactions: {
    id: string
    type: CashDrawerTransactionType
    amount: number
    reason: string
    notes?: string
    createdAt: Date
    balanceBefore: number
    balanceAfter: number
    user: {
      name: string | null
      firstName: string | null
      lastName: string | null
    }
  }[]
}

// Get all cash drawers for an organization
export async function getCashDrawers(organizationId: string) {
  try {
    const cashDrawers = await db.cashDrawer.findMany({
      where: {
        location: {
          organizationId: organizationId
        }
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        terminal: {
          select: {
            id: true,
            name: true,
            terminalNumber: true
          }
        },
        transactions: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            type: true,
            amount: true,
            createdAt: true,
            reason: true
          }
        }
      }
    })

    // Calculate summary data for each drawer
    const summaries: CashDrawerSummary[] = await Promise.all(
      cashDrawers.map(async (drawer) => {
        // Get today's transactions
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayTransactions = await db.cashDrawerTransaction.findMany({
          where: {
            cashDrawerId: drawer.id,
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        })

        const todayTotal = todayTransactions.reduce((sum, tx) => {
          return tx.type === 'CASH_IN' || tx.type === 'SALE' 
            ? sum + tx.amount 
            : sum - tx.amount
        }, 0)

        return {
          id: drawer.id,
          name: drawer.name,
          drawerNumber: drawer.drawerNumber,
          currentBalance: drawer.currentBalance,
          expectedBalance: drawer.expectedBalance,
          isOpen: drawer.isOpen,
          locationId: drawer.locationId,
          terminalId: drawer.terminalId,
          lastTransaction: drawer.transactions[0]
            ? {
                ...drawer.transactions[0],
                reason: drawer.transactions[0].reason ?? ""
              }
            : undefined,
          todayTransactions: todayTransactions.length,
          todayTotal,
          variance: drawer.currentBalance - drawer.expectedBalance
        }
      })
    )

    return { success: true, data: summaries }
  } catch (error) {
    console.error("Failed to get cash drawers:", error)
    return { success: false, error: "Failed to fetch cash drawers" }
  }
}

// Get detailed cash drawer report
export async function getCashDrawerReport(
  drawerId: string, 
  startDate: Date, 
  endDate: Date
): Promise<{ success: boolean; data?: CashDrawerReport; error?: string }> {
  try {
    const drawer = await db.cashDrawer.findUnique({
      where: { id: drawerId },
      select: {
        id: true,
        name: true,
        drawerNumber: true
      }
    })

    if (!drawer) {
      return { success: false, error: "Cash drawer not found" }
    }

    // Get transactions for the period
    const transactions = await db.cashDrawerTransaction.findMany({
      where: {
        cashDrawerId: drawerId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: {
          select: {
            name: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Calculate report metrics
    const openingBalance = transactions.find(tx => tx.type === 'OPENING_BALANCE')?.balanceAfter || 0
    const closingBalance = transactions.length > 0 
      ? transactions[transactions.length - 1].balanceAfter 
      : openingBalance

    const salesTransactions = transactions.filter(tx => tx.type === 'SALE')
    const cashInTransactions = transactions.filter(tx => tx.type === 'CASH_IN')
    const cashOutTransactions = transactions.filter(tx => tx.type === 'CASH_OUT' || tx.type === 'PAYOUT')
    const returnTransactions = transactions.filter(tx => tx.type === 'RETURN' || tx.type === 'REFUND')

    const totalSales = salesTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalCashIn = cashInTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalCashOut = cashOutTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalReturns = returnTransactions.reduce((sum, tx) => sum + tx.amount, 0)

    const netCashFlow = totalCashIn + totalSales - totalCashOut - totalReturns
    const expectedClosing = openingBalance + netCashFlow
    const variance = closingBalance - expectedClosing

    const report: CashDrawerReport = {
      drawerId: drawer.id,
      drawerName: drawer.name,
      date: startDate,
      openingBalance,
      closingBalance,
      totalCashIn,
      totalCashOut,
      totalSales,
      totalReturns,
      netCashFlow,
      variance,
      transactionCount: transactions.length,
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        reason: tx.reason || '',
        notes: tx.notes || undefined,
        createdAt: tx.createdAt,
        balanceBefore: tx.balanceBefore,
        balanceAfter: tx.balanceAfter,
        user: tx.user
      }))
    }

    return { success: true, data: report }
  } catch (error) {
    console.error("Failed to generate cash drawer report:", error)
    return { success: false, error: "Failed to generate report" }
  }
}

// Add cash to drawer
export async function addCashToDrawer(operation: CashDrawerOperation) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Get current drawer state
      const drawer = await tx.cashDrawer.findUnique({
        where: { id: operation.drawerId }
      })

      if (!drawer) {
        throw new Error("Cash drawer not found")
      }

      const newBalance = drawer.currentBalance + operation.amount

      // Update drawer balance
      await tx.cashDrawer.update({
        where: { id: operation.drawerId },
        data: {
          currentBalance: newBalance,
          expectedBalance: newBalance
        }
      })

      // Create transaction record
      const transaction = await tx.cashDrawerTransaction.create({
        data: {
          cashDrawer: {
            connect: { id: operation.drawerId }
          },
          session: operation.sessionId ? {
            connect: { id: operation.sessionId }
          } : undefined,
          user: {
            connect: { id: operation.userId }
          },
          type: operation.type,
          amount: operation.amount,
          reason: operation.reason,
          notes: operation.notes,
          balanceBefore: drawer.currentBalance,
          balanceAfter: newBalance
        }
      })

      return transaction
    })

    revalidatePath("/cash-drawer")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to add cash to drawer:", error)
    return { success: false, error: "Failed to add cash to drawer" }
  }
}

// Remove cash from drawer
export async function removeCashFromDrawer(operation: CashDrawerOperation) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Get current drawer state
      const drawer = await tx.cashDrawer.findUnique({
        where: { id: operation.drawerId }
      })

      if (!drawer) {
        throw new Error("Cash drawer not found")
      }

      if (drawer.currentBalance < operation.amount) {
        throw new Error("Insufficient cash in drawer")
      }

      const newBalance = drawer.currentBalance - operation.amount

      // Update drawer balance
      await tx.cashDrawer.update({
        where: { id: operation.drawerId },
        data: {
          currentBalance: newBalance,
          expectedBalance: newBalance
        }
      })

      // Create transaction record
      const transaction = await tx.cashDrawerTransaction.create({
        data: {
          cashDrawer: {
            connect: { id: operation.drawerId }
          },
          session: operation.sessionId ? {
            connect: { id: operation.sessionId }
          } : undefined,
          user: {
            connect: { id: operation.userId }
          },
          type: operation.type,
          amount: operation.amount,
          reason: operation.reason,
          notes: operation.notes,
          balanceBefore: drawer.currentBalance,
          balanceAfter: newBalance
        }
      })

      return transaction
    })

    revalidatePath("/cash-drawer")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to remove cash from drawer:", error)
    return { success: false, error: "Failed to remove cash from drawer" }
  }
}

// Reconcile cash drawer
export async function reconcileCashDrawer(
  drawerId: string,
  countedAmount: number,
  userId: string,
  notes?: string
) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Get current drawer state
      const drawer = await tx.cashDrawer.findUnique({
        where: { id: drawerId }
      })

      if (!drawer) {
        throw new Error("Cash drawer not found")
      }

      const variance = countedAmount - drawer.currentBalance
      const reconciliationType: CashDrawerTransactionType = variance === 0 
        ? 'RECONCILIATION' 
        : variance > 0 
        ? 'CASH_IN' 
        : 'CASH_OUT'

      // Update drawer to reconciled amount
      await tx.cashDrawer.update({
        where: { id: drawerId },
        data: {
          currentBalance: countedAmount,
          expectedBalance: countedAmount
        }
      })

      // Create reconciliation transaction
      const transaction = await tx.cashDrawerTransaction.create({
        data: {
          cashDrawer: {
            connect: { id: drawerId }
          },
          user: {
            connect: { id: userId }
          },
          type: reconciliationType,
          amount: Math.abs(variance),
          reason: variance === 0 
            ? 'Cash drawer reconciled - no variance'
            : `Cash drawer reconciled - ${variance > 0 ? 'overage' : 'shortage'} of $${Math.abs(variance).toFixed(2)}`,
          notes: notes || `Physical count: $${countedAmount.toFixed(2)}, System: $${drawer.currentBalance.toFixed(2)}`,
          balanceBefore: drawer.currentBalance,
          balanceAfter: countedAmount
        }
      })

      return {
        transaction,
        variance,
        reconciliationType
      }
    })

    revalidatePath("/cash-drawer")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to reconcile cash drawer:", error)
    return { success: false, error: "Failed to reconcile cash drawer" }
  }
}

// Get cash drawer transactions with pagination
export async function getCashDrawerTransactions(
  drawerId: string,
  page: number = 1,
  limit: number = 50,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const skip = (page - 1) * limit

    const whereClause: Prisma.CashDrawerTransactionWhereInput = {
      cashDrawerId: drawerId,
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    const [transactions, totalCount] = await Promise.all([
      db.cashDrawerTransaction.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              firstName: true,
              lastName: true
            }
          },
          session: {
            select: {
              id: true,
              sessionNumber: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.cashDrawerTransaction.count({
        where: whereClause
      })
    ])

    return {
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    }
  } catch (error) {
    console.error("Failed to get cash drawer transactions:", error)
    return { success: false, error: "Failed to fetch transactions" }
  }
}

// Create new cash drawer
export async function createCashDrawer(data: {
  name: string
  drawerNumber: string
  locationId: string
  terminalId: string
  initialBalance?: number
}) {
  try {
    const cashDrawer = await db.cashDrawer.create({
      data: {
        name: data.name,
        drawerNumber: data.drawerNumber,
        locationId: data.locationId,
        terminalId: data.terminalId,
        currentBalance: data.initialBalance || 0,
        expectedBalance: data.initialBalance || 0,
        isOpen: false
      }
    })

    revalidatePath("/cash-drawer")
    return { success: true, data: cashDrawer }
  } catch (error) {
    console.error("Failed to create cash drawer:", error)
    return { success: false, error: "Failed to create cash drawer" }
  }
}