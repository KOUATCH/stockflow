"use server"

import { db } from "@/prisma/db"
import { startOfDay, endOfDay, format } from "date-fns"

export interface FinancialSummaryReport {
  period: string
  totalRevenue: number
  totalCost: number
  grossProfit: number
  grossMargin: number
  totalTransactions: number
  averageTransactionValue: number
  totalItemsSold: number

  // Payment method breakdown
  cashSales: number
  cardSales: number
  digitalSales: number

  // Comparisons
  revenueChange: number
  transactionChange: number
  profitChange: number

  // Top performers
  topSellingItems: Array<{
    itemId: string
    itemName: string
    itemSku: string
    quantitySold: number
    revenue: number
    profit: number
  }>

  // Hourly breakdown
  hourlyBreakdown: Array<{
    hour: number
    revenue: number
    transactions: number
  }>
}

export interface CashierPerformanceReport {
  cashierId: string
  cashierName: string
  totalSales: number
  totalTransactions: number
  averageTransactionValue: number
  sessionsWorked: number
  totalHoursWorked: number
  salesPerHour: number

  // Cash handling
  totalCashHandled: number
  cashVariance: number
  averageVariance: number
  variancePercentage: number

  // Performance metrics
  transactionsPerHour: number
  performanceScore: number

  // Session details
  sessions: Array<{
    sessionId: string
    sessionNumber: string
    startTime: Date
    endTime: Date | null
    openingBalance: number
    closingBalance: number | null
    variance: number | null
    totalSales: number
    transactionCount: number
  }>
}

export interface ItemPerformanceReport {
  itemId: string
  itemName: string
  itemSku: string
  category: string
  brand: string

  // Sales metrics
  quantitySold: number
  totalRevenue: number
  totalCost: number
  grossProfit: number
  profitMargin: number
  averageSellingPrice: number

  // Inventory metrics
  currentStock: number
  stockValue: number
  turnoverRate: number
  daysOfStock: number
  stockStatus: "in_stock" | "low_stock" | "out_of_stock"

  // Trends
  salesTrend: "increasing" | "decreasing" | "stable"
  revenueChange: number
  quantityChange: number
}

export interface CashFlowReport {
  period: string

  // Cash inflows
  totalCashSales: number
  cashFromReturns: number
  otherCashIn: number
  totalCashIn: number

  // Cash outflows
  cashRefunds: number
  cashPayouts: number
  otherCashOut: number
  totalCashOut: number

  // Net cash flow
  netCashFlow: number

  // Daily breakdown
  dailyBreakdown: Array<{
    date: string
    cashIn: number
    cashOut: number
    netFlow: number
    runningBalance: number
  }>

  // Cash drawer reconciliation
  drawerReconciliation: Array<{
    sessionId: string
    sessionNumber: string
    terminalName: string
    cashierName: string
    openingBalance: number
    expectedClosing: number
    actualClosing: number | null
    variance: number | null
    status: string
  }>
}

// Get Financial Summary Report
export async function getFinancialSummaryReport(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date,
): Promise<FinancialSummaryReport> {
  try {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

    // Get sales orders for the period
    const salesOrders = await db.salesOrder.findMany({
      where: {
        organizationId,
        locationId,
        orderDate: {
          gte: start,
          lte: end,
        },
        status: {
          in: ["COMPLETED", "DELIVERED"],
        },
      },
      include: {
        lines: {
          include: {
            item: {
              select: {
                name: true,
                sku: true,
                costPrice: true,
              },
            },
          },
        },
        payments: true,
      },
    })

    // Calculate totals
    const totalRevenue = salesOrders.reduce((sum, order) => sum + order.total, 0)
    const totalCost = salesOrders.reduce((sum, order) => {
      return (
        sum +
        order.lines.reduce((lineSum, line) => {
          return lineSum + line.item.costPrice * line.quantity
        }, 0)
      )
    }, 0)

    const grossProfit = totalRevenue - totalCost
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const totalTransactions = salesOrders.length
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    const totalItemsSold = salesOrders.reduce((sum, order) => {
      return sum + order.lines.reduce((lineSum, line) => lineSum + line.quantity, 0)
    }, 0)

    // Payment method breakdown
    const payments = salesOrders.flatMap((order) => order.payments)
    const cashSales = payments.filter((p) => p.method === "CASH").reduce((sum, p) => sum + p.amount, 0)
    const cardSales = payments.filter((p) => p.method === "CARD").reduce((sum, p) => sum + p.amount, 0)
    const digitalSales = payments.filter((p) => p.method === "DIGITAL").reduce((sum, p) => sum + p.amount, 0)

    // Get comparison period (same length, previous period)
    const periodLength = end.getTime() - start.getTime()
    const comparisonStart = new Date(start.getTime() - periodLength)
    const comparisonEnd = new Date(end.getTime() - periodLength)

    const comparisonOrders = await db.salesOrder.findMany({
      where: {
        organizationId,
        locationId,
        orderDate: {
          gte: comparisonStart,
          lte: comparisonEnd,
        },
        status: {
          in: ["COMPLETED", "DELIVERED"],
        },
      },
    })

    const comparisonRevenue = comparisonOrders.reduce((sum, order) => sum + order.total, 0)
    const comparisonTransactions = comparisonOrders.length
    const comparisonProfit = comparisonRevenue * (grossMargin / 100) // Approximate

    const revenueChange = comparisonRevenue > 0 ? ((totalRevenue - comparisonRevenue) / comparisonRevenue) * 100 : 0
    const transactionChange =
      comparisonTransactions > 0 ? ((totalTransactions - comparisonTransactions) / comparisonTransactions) * 100 : 0
    const profitChange = comparisonProfit > 0 ? ((grossProfit - comparisonProfit) / comparisonProfit) * 100 : 0

    // Top selling items
    const itemSales = new Map<string, { name: string; sku: string; quantity: number; revenue: number; cost: number }>()

    salesOrders.forEach((order) => {
      order.lines.forEach((line) => {
        const key = line.itemId
        const existing = itemSales.get(key) || {
          name: line.item.name,
          sku: line.item.sku,
          quantity: 0,
          revenue: 0,
          cost: 0,
        }
        existing.quantity += line.quantity
        existing.revenue += line.lineTotal
        existing.cost += line.item.costPrice * line.quantity
        itemSales.set(key, existing)
      })
    })

    const topSellingItems = Array.from(itemSales.entries())
      .map(([itemId, data]) => ({
        itemId,
        itemName: data.name,
        itemSku: data.sku,
        quantitySold: data.quantity,
        revenue: data.revenue,
        profit: data.revenue - data.cost,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Hourly breakdown
    const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = salesOrders.filter((order) => new Date(order.orderDate).getHours() === hour)
      return {
        hour,
        revenue: hourOrders.reduce((sum, order) => sum + order.total, 0),
        transactions: hourOrders.length,
      }
    })

    return {
      period: `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`,
      totalRevenue,
      totalCost,
      grossProfit,
      grossMargin,
      totalTransactions,
      averageTransactionValue,
      totalItemsSold,
      cashSales,
      cardSales,
      digitalSales,
      revenueChange,
      transactionChange,
      profitChange,
      topSellingItems,
      hourlyBreakdown,
    }
  } catch (error) {
    console.error("Error generating financial summary report:", error)
    throw new Error("Failed to generate financial summary report")
  }
}

// Get Cashier Performance Report
export async function getCashierPerformanceReport(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date,
): Promise<CashierPerformanceReport[]> {
  try {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

    // Get all POS sessions for the period
    const sessions = await db.pOSSession.findMany({
      where: {
        locationId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        salesOrders: {
          where: {
            status: {
              in: ["COMPLETED", "DELIVERED"],
            },
          },
        },
        cashDrawerTransactions: true,
        terminal: {
          select: {
            name: true,
          },
        },
      },
    })

    // Group sessions by user
    const userSessions = new Map<string, typeof sessions>()
    sessions.forEach((session) => {
      const userId = session.userId
      if (!userSessions.has(userId)) {
        userSessions.set(userId, [])
      }
      userSessions.get(userId)!.push(session)
    })

    const reports: CashierPerformanceReport[] = []

    for (const [userId, userSessionList] of userSessions) {
      const user = userSessionList[0].user

      // Calculate totals
      const totalSales = userSessionList.reduce((sum, session) => {
        return sum + session.salesOrders.reduce((orderSum, order) => orderSum + order.total, 0)
      }, 0)

      const totalTransactions = userSessionList.reduce((sum, session) => {
        return sum + session.salesOrders.length
      }, 0)

      const averageTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0
      const sessionsWorked = userSessionList.length

      // Calculate hours worked
      const totalHoursWorked = userSessionList.reduce((sum, session) => {
        if (session.endTime) {
          const hours = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60)
          return sum + hours
        }
        return sum
      }, 0)

      const salesPerHour = totalHoursWorked > 0 ? totalSales / totalHoursWorked : 0
      const transactionsPerHour = totalHoursWorked > 0 ? totalTransactions / totalHoursWorked : 0

      // Cash handling metrics
      const cashTransactions = userSessionList.flatMap((session) =>
        session.cashDrawerTransactions.filter((t) => t.type === "SALE"),
      )
      const totalCashHandled = cashTransactions.reduce((sum, t) => sum + t.amount, 0)

      const sessionsWithVariance = userSessionList.filter((s) => s.variance !== null)
      const totalVariance = sessionsWithVariance.reduce((sum, s) => sum + Math.abs(s.variance || 0), 0)
      const averageVariance = sessionsWithVariance.length > 0 ? totalVariance / sessionsWithVariance.length : 0
      const variancePercentage = totalCashHandled > 0 ? (totalVariance / totalCashHandled) * 100 : 0

      // Performance score calculation
      let performanceScore = 100
      if (averageVariance > 20) performanceScore -= 30
      else if (averageVariance > 10) performanceScore -= 20
      else if (averageVariance > 5) performanceScore -= 10

      if (transactionsPerHour < 5) performanceScore -= 15
      else if (transactionsPerHour < 10) performanceScore -= 10

      if (averageTransactionValue < 15) performanceScore -= 10

      performanceScore = Math.max(0, performanceScore)

      // Session details
      const sessionDetails = userSessionList.map((session) => ({
        sessionId: session.id,
        sessionNumber: session.sessionNumber,
        startTime: session.startTime,
        endTime: session.endTime,
        openingBalance: session.openingBalance,
        closingBalance: session.closingBalance,
        variance: session.variance,
        totalSales: session.salesOrders.reduce((sum, order) => sum + order.total, 0),
        transactionCount: session.salesOrders.length,
      }))

      reports.push({
        cashierId: userId,
        cashierName: `${user.firstName} ${user.lastName}`,
        totalSales,
        totalTransactions,
        averageTransactionValue,
        sessionsWorked,
        totalHoursWorked,
        salesPerHour,
        totalCashHandled,
        cashVariance: totalVariance,
        averageVariance,
        variancePercentage,
        transactionsPerHour,
        performanceScore,
        sessions: sessionDetails,
      })
    }

    return reports.sort((a, b) => b.totalSales - a.totalSales)
  } catch (error) {
    console.error("Error generating cashier performance report:", error)
    throw new Error("Failed to generate cashier performance report")
  }
}

// Get Item Performance Report
export async function getItemPerformanceReport(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date,
): Promise<ItemPerformanceReport[]> {
  try {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

    // Get all items for the organization
    const items = await db.item.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        category: {
          select: {
            title: true,
          },
        },
        brand: {
          select: {
            brandName: true,
          },
        },
        inventoryLevels: {
          where: {
            locationId,
          },
        },
        salesOrderLines: {
          where: {
            salesOrder: {
              locationId,
              orderDate: {
                gte: start,
                lte: end,
              },
              status: {
                in: ["COMPLETED", "DELIVERED"],
              },
            },
          },
          include: {
            salesOrder: true,
          },
        },
      },
    })

    // Get comparison period data
    const periodLength = end.getTime() - start.getTime()
    const comparisonStart = new Date(start.getTime() - periodLength)
    const comparisonEnd = new Date(end.getTime() - periodLength)

    const comparisonSales = await db.salesOrderLine.findMany({
      where: {
        salesOrder: {
          locationId,
          organizationId,
          orderDate: {
            gte: comparisonStart,
            lte: comparisonEnd,
          },
          status: {
            in: ["COMPLETED", "DELIVERED"],
          },
        },
      },
      include: {
        item: {
          select: {
            id: true,
          },
        },
      },
    })

    const comparisonMap = new Map<string, { quantity: number; revenue: number }>()
    comparisonSales.forEach((line) => {
      const existing = comparisonMap.get(line.itemId) || { quantity: 0, revenue: 0 }
      existing.quantity += line.quantity
      existing.revenue += line.lineTotal
      comparisonMap.set(line.itemId, existing)
    })

    const reports: ItemPerformanceReport[] = items.map((item) => {
      const inventoryLevel = item.inventoryLevels[0]
      const currentStock = inventoryLevel?.quantityOnHand || 0
      const stockValue = currentStock * item.costPrice

      // Sales metrics
      const quantitySold = item.salesOrderLines.reduce((sum, line) => sum + line.quantity, 0)
      const totalRevenue = item.salesOrderLines.reduce((sum, line) => sum + line.lineTotal, 0)
      const totalCost = quantitySold * item.costPrice
      const grossProfit = totalRevenue - totalCost
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
      const averageSellingPrice = quantitySold > 0 ? totalRevenue / quantitySold : item.sellingPrice

      // Inventory metrics
      const daysInPeriod = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      const turnoverRate = totalCost > 0 && stockValue > 0 ? (totalCost / stockValue) * (365 / daysInPeriod) : 0
      const daysOfStock = turnoverRate > 0 ? 365 / turnoverRate : 999

      let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock"
      if (currentStock === 0) {
        stockStatus = "out_of_stock"
      } else if (currentStock <= item.reorderLevel) {
        stockStatus = "low_stock"
      }

      // Trends
      const comparison = comparisonMap.get(item.id) || { quantity: 0, revenue: 0 }
      const revenueChange =
        comparison.revenue > 0 ? ((totalRevenue - comparison.revenue) / comparison.revenue) * 100 : 0
      const quantityChange =
        comparison.quantity > 0 ? ((quantitySold - comparison.quantity) / comparison.quantity) * 100 : 0

      let salesTrend: "increasing" | "decreasing" | "stable" = "stable"
      if (revenueChange > 10) salesTrend = "increasing"
      else if (revenueChange < -10) salesTrend = "decreasing"

      return {
        itemId: item.id,
        itemName: item.name,
        itemSku: item.sku,
        category: item.category?.title || "Uncategorized",
        brand: item.brand?.brandName || "No Brand",
        quantitySold,
        totalRevenue,
        totalCost,
        grossProfit,
        profitMargin,
        averageSellingPrice,
        currentStock,
        stockValue,
        turnoverRate,
        daysOfStock,
        stockStatus,
        salesTrend,
        revenueChange,
        quantityChange,
      }
    })

    return reports.sort((a, b) => b.totalRevenue - a.totalRevenue)
  } catch (error) {
    console.error("Error generating item performance report:", error)
    throw new Error("Failed to generate item performance report")
  }
}

// Get Cash Flow Report
export async function getCashFlowReport(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date,
): Promise<CashFlowReport> {
  try {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

    // Get all cash drawer transactions for the period
    const cashTransactions = await db.cashDrawerTransaction.findMany({
      where: {
        cashDrawer: {
          locationId,
        },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        session: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            terminal: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // Calculate cash flows
    const cashInTransactions = cashTransactions.filter((t) => ["SALE", "CASH_IN", "OPENING_BALANCE"].includes(t.type))
    const cashOutTransactions = cashTransactions.filter((t) =>
      ["REFUND", "CASH_OUT", "PAYOUT", "CLOSING_BALANCE"].includes(t.type),
    )

    const totalCashSales = cashInTransactions.filter((t) => t.type === "SALE").reduce((sum, t) => sum + t.amount, 0)

    const cashFromReturns = cashInTransactions.filter((t) => t.type === "RETURN").reduce((sum, t) => sum + t.amount, 0)

    const otherCashIn = cashInTransactions.filter((t) => t.type === "CASH_IN").reduce((sum, t) => sum + t.amount, 0)

    const totalCashIn = totalCashSales + cashFromReturns + otherCashIn

    const cashRefunds = cashOutTransactions.filter((t) => t.type === "REFUND").reduce((sum, t) => sum + t.amount, 0)

    const cashPayouts = cashOutTransactions.filter((t) => t.type === "PAYOUT").reduce((sum, t) => sum + t.amount, 0)

    const otherCashOut = cashOutTransactions.filter((t) => t.type === "CASH_OUT").reduce((sum, t) => sum + t.amount, 0)

    const totalCashOut = cashRefunds + cashPayouts + otherCashOut
    const netCashFlow = totalCashIn - totalCashOut

    // Daily breakdown
    const dailyBreakdown: Array<{
      date: string
      cashIn: number
      cashOut: number
      netFlow: number
      runningBalance: number
    }> = []

    let runningBalance = 0
    const currentDate = new Date(start)

    while (currentDate <= end) {
      const dayStart = startOfDay(currentDate)
      const dayEnd = endOfDay(currentDate)

      const dayTransactions = cashTransactions.filter((t) => t.createdAt >= dayStart && t.createdAt <= dayEnd)

      const dayCashIn = dayTransactions
        .filter((t) => ["SALE", "CASH_IN", "RETURN"].includes(t.type))
        .reduce((sum, t) => sum + t.amount, 0)

      const dayCashOut = dayTransactions
        .filter((t) => ["REFUND", "CASH_OUT", "PAYOUT"].includes(t.type))
        .reduce((sum, t) => sum + t.amount, 0)

      const dayNetFlow = dayCashIn - dayCashOut
      runningBalance += dayNetFlow

      dailyBreakdown.push({
        date: format(currentDate, "yyyy-MM-dd"),
        cashIn: dayCashIn,
        cashOut: dayCashOut,
        netFlow: dayNetFlow,
        runningBalance,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Cash drawer reconciliation
    const sessions = await db.pOSSession.findMany({
      where: {
        locationId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        terminal: {
          select: {
            name: true,
          },
        },
      },
    })

    const drawerReconciliation = sessions.map((session) => ({
      sessionId: session.id,
      sessionNumber: session.sessionNumber,
      terminalName: session.terminal?.name || "Unknown Terminal",
      cashierName: `${session.user.firstName} ${session.user.lastName}`,
      openingBalance: session.openingBalance,
      expectedClosing: session.expectedBalance || 0,
      actualClosing: session.closingBalance,
      variance: session.variance,
      status: session.status,
    }))

    return {
      period: `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`,
      totalCashSales,
      cashFromReturns,
      otherCashIn,
      totalCashIn,
      cashRefunds,
      cashPayouts,
      otherCashOut,
      totalCashOut,
      netCashFlow,
      dailyBreakdown,
      drawerReconciliation,
    }
  } catch (error) {
    console.error("Error generating cash flow report:", error)
    throw new Error("Failed to generate cash flow report")
  }
}
