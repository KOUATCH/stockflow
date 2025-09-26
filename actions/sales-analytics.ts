"use server"

import { db } from "@/prisma/db"
import { POSSessionStatus, PaymentStatus, SalesOrderStatus } from "@prisma/client"
import { endOfDay, startOfDay, startOfMonth, startOfWeek, subDays } from "date-fns"

export interface SalesAnalytics {
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  totalItems: number
  topSellingItems: {
    itemId: string
    itemName: string
    itemSku: string
    quantitySold: number
    totalRevenue: number
  }[]
  salesByHour: {
    hour: number
    sales: number
    transactions: number
  }[]
  salesByDay: {
    date: string
    sales: number
    transactions: number
  }[]
  paymentMethods: {
    method: string
    amount: number
    count: number
    percentage: number
  }[]
}

export interface CashReconciliationReport {
  sessionId: string
  sessionNumber: string
  terminalName: string
  userName: string
  startTime: Date
  endTime?: Date
  openingBalance: number
  expectedBalance: number
  closingBalance?: number
  variance?: number
  totalSales: number
  totalCashIn: number
  totalCashOut: number
  transactionCount: number
  status: string
}

export interface ProductPerformance {
  itemId: string
  itemName: string
  itemSku: string
  category: string
  quantitySold: number
  totalRevenue: number
  averagePrice: number
  profitMargin: number
  currentStock: number
  stockStatus: "in_stock" | "low_stock" | "out_of_stock"
}

export interface UserPerformance {
  userId: string
  userName: string
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  sessionsCount: number
  totalHours: number
  averageVariance: number
  performanceScore: number
}

export async function getSalesAnalytics(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date,
): Promise<SalesAnalytics> {
  try {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

    // Get sales orders with their lines and payments using proper Prisma queries
    const salesOrders = await db.salesOrder.findMany({
      where: {
        organizationId,
        locationId,
        orderDate: {
          gte: start,
          lte: end,
        },
        status: {
          not: SalesOrderStatus.CANCELLED,
        },
      },
      include: {
        lines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          where: {
            status: PaymentStatus.COMPLETED,
          },
        },
      },
    })

    const totalSales = salesOrders.reduce((sum, order) => sum + order.total, 0)
    const totalTransactions = salesOrders.length
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0

    // Calculate total items from order lines
    const totalItems = salesOrders.reduce(
      (sum, order) => sum + order.lines.reduce((lineSum, line) => lineSum + line.quantity, 0),
      0,
    )

    // Calculate top selling items
    const itemSales = new Map<string, { name: string; sku: string; quantity: number; revenue: number }>()

    salesOrders.forEach((order) => {
      order.lines.forEach((line) => {
        const key = line.itemId
        const existing = itemSales.get(key) || {
          name: line.item.name,
          sku: line.item.sku,
          quantity: 0,
          revenue: 0,
        }
        existing.quantity += line.quantity
        existing.revenue += line.lineTotal
        itemSales.set(key, existing)
      })
    })

    const topSellingItems = Array.from(itemSales.entries())
      .map(([itemId, data]) => ({
        itemId,
        itemName: data.name,
        itemSku: data.sku,
        quantitySold: data.quantity,
        totalRevenue: data.revenue,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10)

    // Sales by hour
    const salesByHour = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = salesOrders.filter((order) => new Date(order.orderDate).getHours() === hour)
      return {
        hour,
        sales: hourOrders.reduce((sum, order) => sum + order.total, 0),
        transactions: hourOrders.length,
      }
    })

    // Sales by day
    const salesByDay: { date: string; sales: number; transactions: number }[] = []
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dayStart = startOfDay(currentDate)
      const dayEnd = endOfDay(currentDate)
      const dayOrders = salesOrders.filter((order) => order.orderDate >= dayStart && order.orderDate <= dayEnd)

      salesByDay.push({
        date: currentDate.toISOString().split("T")[0],
        sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
        transactions: dayOrders.length,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Payment methods analysis
    const paymentMethodMap = new Map<string, { amount: number; count: number }>()
    salesOrders.forEach((order) => {
      order.payments.forEach((payment) => {
        const method = payment.method
        const existing = paymentMethodMap.get(method) || { amount: 0, count: 0 }
        existing.amount += payment.amount
        existing.count += 1
        paymentMethodMap.set(method, existing)
      })
    })

    const paymentMethods = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: totalSales > 0 ? (data.amount / totalSales) * 100 : 0,
    }))

    return {
      totalSales,
      totalTransactions,
      averageTransaction,
      totalItems,
      topSellingItems,
      salesByHour,
      salesByDay,
      paymentMethods,
    }
  } catch (error) {
    console.error("Error getting sales analytics:", error)
    throw new Error("Failed to get sales analytics")
  }
}

export async function getCashReconciliationReports(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date,
): Promise<CashReconciliationReport[]> {
  try {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

    const sessions = await db.pOSSession.findMany({
      where: {
        locationId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        terminal: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        salesOrders: {
          where: {
            status: {
              not: SalesOrderStatus.CANCELLED,
            },
          },
          select: {
            total: true,
          },
        },
        cashDrawerTransactions: {
          select: {
            eventType: true,
            amount: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    })

    return sessions.map((session) => {
      const totalSales = session.salesOrders.reduce((sum, order) => sum + order.total, 0)

      const cashInEvents = session.cashDrawerTransactions.filter((event) => event.eventType === "CASH_IN")
      const cashOutEvents = session.cashDrawerTransactions.filter((event) => event.eventType === "CASH_OUT")

      const totalCashIn = cashInEvents.reduce((sum, event) => sum + event.amount, 0)
      const totalCashOut = cashOutEvents.reduce((sum, event) => sum + event.amount, 0)

      return {
        sessionId: session.id,
        sessionNumber: session.sessionNumber,
        terminalName: session.terminal.name,
        userName: `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim(),
        startTime: session.startTime,
        endTime: session.endTime || undefined,
        openingBalance: session.openingBalance,
        expectedBalance: session.expectedBalance || 0,
        closingBalance: session.closingBalance || undefined,
        variance: session.variance || undefined,
        totalSales,
        totalCashIn,
        totalCashOut,
        transactionCount: session.salesOrders.length,
        status: session.status,
      }
    })
  } catch (error) {
    console.error("Error getting cash reconciliation reports:", error)
    throw new Error("Failed to get cash reconciliation reports")
  }
}

export async function getProductPerformance(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date,
): Promise<ProductPerformance[]> {
  try {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

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
        inventoryLevels: {
          where: {
            locationId,
          },
          select: {
            quantityOnHand: true,
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
                not: SalesOrderStatus.CANCELLED,
              },
            },
          },
          select: {
            quantity: true,
            lineTotal: true,
          },
        },
      },
    })

    return items.map((item) => {
      const quantitySold = item.salesOrderLines.reduce((sum, line) => sum + line.quantity, 0)
      const totalRevenue = item.salesOrderLines.reduce((sum, line) => sum + line.lineTotal, 0)
      const averagePrice = quantitySold > 0 ? totalRevenue / quantitySold : item.sellingPrice
      const profitMargin = item.sellingPrice > 0 ? ((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100 : 0

      const currentStock = item.inventoryLevels[0]?.quantityOnHand || 0

      let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock"
      if (currentStock === 0) {
        stockStatus = "out_of_stock"
      } else if (currentStock <= item.reorderLevel) {
        stockStatus = "low_stock"
      }

      return {
        itemId: item.id,
        itemName: item.name,
        itemSku: item.sku,
        category: item.category?.title || "Uncategorized",
        quantitySold,
        totalRevenue,
        averagePrice,
        profitMargin,
        currentStock,
        stockStatus,
      }
    })
  } catch (error) {
    console.error("Error getting product performance:", error)
    throw new Error("Failed to get product performance")
  }
}

export async function getUserPerformance(
  organizationId: string,
  locationId: string,
  startDate: Date,
  endDate: Date,
): Promise<UserPerformance[]> {
  try {
    const start = startOfDay(startDate)
    const end = endOfDay(endDate)

    const users = await db.user.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        posSessions: {
          where: {
            locationId,
            startTime: {
              gte: start,
              lte: end,
            },
          },
          include: {
            salesOrders: {
              where: {
                status: {
                  not: SalesOrderStatus.CANCELLED,
                },
              },
              select: {
                total: true,
              },
            },
          },
        },
      },
    })

    return users
      .map((user) => {
        const sessions = user.posSessions
        const allSalesOrders = sessions.flatMap((session) => session.salesOrders)

        const totalSales = allSalesOrders.reduce((sum, order) => sum + order.total, 0)
        const totalTransactions = allSalesOrders.length
        const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0
        const sessionsCount = sessions.length

        // Calculate total hours worked
        const totalHours = sessions.reduce((sum, session) => {
          if (session.endTime) {
            const hours = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60)
            return sum + hours
          }
          return sum
        }, 0)

        // Calculate average variance
        const sessionsWithVariance = sessions.filter((s) => s.variance !== null)
        const averageVariance =
          sessionsWithVariance.length > 0
            ? sessionsWithVariance.reduce((sum, s) => sum + Math.abs(s.variance || 0), 0) /
              sessionsWithVariance.length
            : 0

        // Calculate performance score (0-100)
        let performanceScore = 100
        if (averageVariance > 10) performanceScore -= 20
        else if (averageVariance > 5) performanceScore -= 10
        if (totalTransactions < 10) performanceScore -= 10
        if (averageTransaction < 20) performanceScore -= 10

        return {
          userId: user.id,
          userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          totalSales,
          totalTransactions,
          averageTransaction,
          sessionsCount,
          totalHours,
          averageVariance,
          performanceScore: Math.max(0, performanceScore),
        }
      })
      .filter((user) => user.sessionsCount > 0)
      .sort((a, b) => b.totalSales - a.totalSales)
  } catch (error) {
    console.error("Error getting user performance:", error)
    throw new Error("Failed to get user performance")
  }
}

export async function getDashboardSummary(organizationId: string, locationId: string) {
  try {
    const today = new Date()
    const yesterday = subDays(today, 1)
    const thisWeek = startOfWeek(today)
    const thisMonth = startOfMonth(today)

    // Get analytics for different time periods
    const [todayStats, yesterdayStats, weekStats, monthStats] = await Promise.all([
      getSalesAnalytics(organizationId, locationId, today, today),
      getSalesAnalytics(organizationId, locationId, yesterday, yesterday),
      getSalesAnalytics(organizationId, locationId, thisWeek, today),
      getSalesAnalytics(organizationId, locationId, thisMonth, today),
    ])

    // Get active sessions count
    const activeSessions = await db.pOSSession.count({
      where: {
        locationId,
        status: POSSessionStatus.ACTIVE,
      },
    })

    // Get low stock items count
    const lowStockItems = await db.inventoryLevel.count({
      where: {
        locationId,
        quantityOnHand: {
          lte: 10,
        },
        item: {
          organizationId,
          isActive: true,
        },
      },
    })

    return {
      today: {
        sales: todayStats.totalSales,
        transactions: todayStats.totalTransactions,
        averageTransaction: todayStats.averageTransaction,
        salesChange: todayStats.totalSales - yesterdayStats.totalSales,
        transactionsChange: todayStats.totalTransactions - yesterdayStats.totalTransactions,
      },
      week: {
        sales: weekStats.totalSales,
        transactions: weekStats.totalTransactions,
        averageTransaction: weekStats.averageTransaction,
      },
      month: {
        sales: monthStats.totalSales,
        transactions: monthStats.totalTransactions,
        averageTransaction: monthStats.averageTransaction,
      },
      activeSessions,
      lowStockItems,
      topSellingItems: todayStats.topSellingItems.slice(0, 5),
    }
  } catch (error) {
    console.error("Error getting dashboard summary:", error)
    throw new Error("Failed to get dashboard summary")
  }
}
