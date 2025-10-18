"use server"

import { db } from "@/prisma/db"
import { startOfDay, endOfDay, startOfHour, endOfHour, subDays, format } from "date-fns"
import type {
  POSAnalytics,
  HourlySales,
  CategorySales,
  PaymentMethodSales,
  EmployeePerformance,
  TopSellingItem,
  LowStockItem,
  LoyaltyStats
} from "../types/pos-system-types"

export class POSAnalyticsEngine {

  /**
   * Generate comprehensive POS analytics for a location and period
   */
  static async generateAnalytics(
    locationId: string,
    startDate: Date,
    endDate: Date,
    organizationId: string
  ): Promise<{
    success: boolean
    data?: POSAnalytics
    error?: string
  }> {
    try {
      // Get all transactions for the period
      const transactions = await db.posTransaction.findMany({
        where: {
          locationId,
          organizationId,
          createdAt: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate)
          },
          status: 'COMPLETED'
        },
        include: {
          items: {
            include: {
              item: {
                include: {
                  category: true,
                  brand: true
                }
              }
            }
          },
          payments: true,
          user: true,
          customer: true
        }
      })

      // Calculate basic sales metrics
      const salesMetrics = this.calculateSalesMetrics(transactions)

      // Generate hourly breakdown
      const hourlyBreakdown = this.generateHourlyBreakdown(transactions, startDate, endDate)

      // Generate category breakdown
      const categoryBreakdown = this.generateCategoryBreakdown(transactions)

      // Generate payment method breakdown
      const paymentMethodBreakdown = this.generatePaymentMethodBreakdown(transactions)

      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(transactions, startDate, endDate)

      // Get employee performance
      const employeePerformance = this.calculateEmployeePerformance(transactions)

      // Get inventory metrics
      const inventoryMetrics = await this.getInventoryMetrics(locationId, transactions)

      // Get customer metrics
      const customerMetrics = await this.getCustomerMetrics(organizationId, transactions, startDate, endDate)

      const analytics: POSAnalytics = {
        locationId,
        period: {
          startDate,
          endDate
        },
        sales: {
          totalSales: salesMetrics.totalSales,
          totalTransactions: salesMetrics.totalTransactions,
          averageTransaction: salesMetrics.averageTransaction,
          salesGrowth: await this.calculateSalesGrowth(locationId, organizationId, startDate, endDate, salesMetrics.totalSales),
          hourlyBreakdown,
          categoryBreakdown,
          paymentMethodBreakdown
        },
        performance: {
          transactionsPerHour: performanceMetrics.transactionsPerHour,
          averageServiceTime: performanceMetrics.averageServiceTime,
          peakHours: performanceMetrics.peakHours,
          employeePerformance
        },
        inventory: {
          topSellingItems: inventoryMetrics.topSellingItems,
          lowStockItems: inventoryMetrics.lowStockItems,
          inventoryTurnover: inventoryMetrics.inventoryTurnover
        },
        customers: {
          totalCustomers: customerMetrics.totalCustomers,
          newCustomers: customerMetrics.newCustomers,
          returningCustomers: customerMetrics.returningCustomers,
          loyaltyProgram: customerMetrics.loyaltyProgram
        }
      }

      return {
        success: true,
        data: analytics
      }

    } catch (error) {
      console.error('Error generating POS analytics:', error)
      return {
        success: false,
        error: 'Failed to generate analytics'
      }
    }
  }

  /**
   * Calculate basic sales metrics
   */
  private static calculateSalesMetrics(transactions: any[]) {
    const totalSales = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0)
    const totalTransactions = transactions.length
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0

    return {
      totalSales,
      totalTransactions,
      averageTransaction
    }
  }

  /**
   * Generate hourly sales breakdown
   */
  private static generateHourlyBreakdown(transactions: any[], startDate: Date, endDate: Date): HourlySales[] {
    const hourlyData: Record<number, { sales: number; transactions: number }> = {}

    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = { sales: 0, transactions: 0 }
    }

    // Aggregate transaction data by hour
    transactions.forEach(tx => {
      const hour = new Date(tx.createdAt).getHours()
      hourlyData[hour].sales += tx.totalAmount
      hourlyData[hour].transactions += 1
    })

    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour: parseInt(hour),
      sales: data.sales,
      transactions: data.transactions,
      averageTransaction: data.transactions > 0 ? data.sales / data.transactions : 0
    }))
  }

  /**
   * Generate category sales breakdown
   */
  private static generateCategoryBreakdown(transactions: any[]): CategorySales[] {
    const categoryData: Record<string, { sales: number; transactions: Set<string> }> = {}

    transactions.forEach(tx => {
      tx.items.forEach((item: any) => {
        const categoryId = item.item.categoryId
        const categoryName = item.item.category?.name || 'Uncategorized'

        if (!categoryData[categoryId]) {
          categoryData[categoryId] = {
            sales: 0,
            transactions: new Set()
          }
        }

        categoryData[categoryId].sales += item.lineTotal
        categoryData[categoryId].transactions.add(tx.id)
      })
    })

    const totalSales = Object.values(categoryData).reduce((sum, data) => sum + data.sales, 0)

    return Object.entries(categoryData).map(([categoryId, data]) => ({
      categoryId,
      categoryName: categoryId, // This should be resolved to actual category name
      sales: data.sales,
      transactions: data.transactions.size,
      percentage: totalSales > 0 ? (data.sales / totalSales) * 100 : 0
    }))
  }

  /**
   * Generate payment method breakdown
   */
  private static generatePaymentMethodBreakdown(transactions: any[]): PaymentMethodSales[] {
    const paymentData: Record<string, { amount: number; count: number }> = {}

    transactions.forEach(tx => {
      tx.payments.forEach((payment: any) => {
        if (!paymentData[payment.method]) {
          paymentData[payment.method] = { amount: 0, count: 0 }
        }

        paymentData[payment.method].amount += payment.amount
        paymentData[payment.method].count += 1
      })
    })

    const totalAmount = Object.values(paymentData).reduce((sum, data) => sum + data.amount, 0)

    return Object.entries(paymentData).map(([method, data]) => ({
      method: method as any,
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
    }))
  }

  /**
   * Calculate performance metrics
   */
  private static calculatePerformanceMetrics(transactions: any[], startDate: Date, endDate: Date) {
    const totalHours = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
    const transactionsPerHour = transactions.length / totalHours

    // Calculate average service time (mock calculation)
    const averageServiceTime = 3.5 // minutes (this would be calculated from actual timing data)

    // Find peak hours
    const hourlyTransactions: Record<number, number> = {}
    transactions.forEach(tx => {
      const hour = new Date(tx.createdAt).getHours()
      hourlyTransactions[hour] = (hourlyTransactions[hour] || 0) + 1
    })

    const peakHours = Object.entries(hourlyTransactions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`)

    return {
      transactionsPerHour,
      averageServiceTime,
      peakHours
    }
  }

  /**
   * Calculate employee performance
   */
  private static calculateEmployeePerformance(transactions: any[]): EmployeePerformance[] {
    const employeeData: Record<string, {
      totalSales: number
      totalTransactions: number
      user: any
    }> = {}

    transactions.forEach(tx => {
      const userId = tx.userId
      const user = tx.user

      if (!employeeData[userId]) {
        employeeData[userId] = {
          totalSales: 0,
          totalTransactions: 0,
          user
        }
      }

      employeeData[userId].totalSales += tx.totalAmount
      employeeData[userId].totalTransactions += 1
    })

    return Object.entries(employeeData).map(([userId, data]) => ({
      userId,
      userName: `${data.user.firstName} ${data.user.lastName}`,
      totalSales: data.totalSales,
      totalTransactions: data.totalTransactions,
      averageTransaction: data.totalTransactions > 0 ? data.totalSales / data.totalTransactions : 0,
      hoursWorked: 8, // This would come from time tracking
      salesPerHour: data.totalSales / 8
    }))
  }

  /**
   * Get inventory metrics
   */
  private static async getInventoryMetrics(locationId: string, transactions: any[]) {
    // Calculate top selling items
    const itemSales: Record<string, {
      quantitySold: number
      revenue: number
      item: any
    }> = {}

    transactions.forEach(tx => {
      tx.items.forEach((item: any) => {
        const itemId = item.itemId

        if (!itemSales[itemId]) {
          itemSales[itemId] = {
            quantitySold: 0,
            revenue: 0,
            item: item.item
          }
        }

        itemSales[itemId].quantitySold += item.quantity
        itemSales[itemId].revenue += item.lineTotal
      })
    })

    const topSellingItems: TopSellingItem[] = Object.entries(itemSales)
      .sort(([, a], [, b]) => b.quantitySold - a.quantitySold)
      .slice(0, 10)
      .map(([itemId, data]) => ({
        itemId,
        itemName: data.item.name,
        quantitySold: data.quantitySold,
        revenue: data.revenue,
        profit: data.revenue * 0.3 // Mock profit calculation
      }))

    // Get low stock items
    const lowStockItems = await db.inventoryLevel.findMany({
      where: {
        locationId,
        currentLevel: {
          lte: db.inventoryLevel.fields.reorderPoint
        }
      },
      include: {
        item: true
      },
      take: 10
    })

    const lowStockItemsFormatted: LowStockItem[] = lowStockItems.map(inventory => ({
      itemId: inventory.itemId,
      itemName: inventory.item.name,
      currentStock: inventory.currentLevel,
      reorderPoint: inventory.reorderPoint || 0,
      daysUntilStockout: Math.max(1, Math.floor(inventory.currentLevel / 5)) // Mock calculation
    }))

    return {
      topSellingItems,
      lowStockItems: lowStockItemsFormatted,
      inventoryTurnover: 4.2 // Mock calculation
    }
  }

  /**
   * Get customer metrics
   */
  private static async getCustomerMetrics(
    organizationId: string,
    transactions: any[],
    startDate: Date,
    endDate: Date
  ) {
    const uniqueCustomers = new Set(
      transactions
        .filter(tx => tx.customerId)
        .map(tx => tx.customerId)
    )

    // Get new customers in period
    const newCustomers = await db.customer.count({
      where: {
        organizationId,
        createdAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      }
    })

    const totalCustomers = uniqueCustomers.size
    const returningCustomers = totalCustomers - newCustomers

    // Mock loyalty stats
    const loyaltyProgram: LoyaltyStats = {
      totalMembers: 1250,
      activeMembers: 890,
      pointsIssued: 15000,
      pointsRedeemed: 8500,
      averagePointsPerMember: 120
    }

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      loyaltyProgram
    }
  }

  /**
   * Calculate sales growth compared to previous period
   */
  private static async calculateSalesGrowth(
    locationId: string,
    organizationId: string,
    startDate: Date,
    endDate: Date,
    currentSales: number
  ): Promise<number> {
    try {
      const periodLength = endDate.getTime() - startDate.getTime()
      const previousStartDate = new Date(startDate.getTime() - periodLength)
      const previousEndDate = new Date(endDate.getTime() - periodLength)

      const previousTransactions = await db.posTransaction.findMany({
        where: {
          locationId,
          organizationId,
          createdAt: {
            gte: startOfDay(previousStartDate),
            lte: endOfDay(previousEndDate)
          },
          status: 'COMPLETED'
        }
      })

      const previousSales = previousTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0)

      if (previousSales === 0) return 0

      return ((currentSales - previousSales) / previousSales) * 100

    } catch (error) {
      console.error('Error calculating sales growth:', error)
      return 0
    }
  }

  /**
   * Generate real-time analytics dashboard data
   */
  static async generateRealTimeAnalytics(locationId: string, organizationId: string): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      const today = new Date()
      const startOfToday = startOfDay(today)

      // Get today's transactions
      const todayTransactions = await db.posTransaction.findMany({
        where: {
          locationId,
          organizationId,
          createdAt: {
            gte: startOfToday,
            lte: today
          },
          status: 'COMPLETED'
        },
        include: {
          items: {
            include: {
              item: true
            }
          },
          payments: true
        }
      })

      // Calculate real-time metrics
      const totalSales = todayTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0)
      const totalTransactions = todayTransactions.length
      const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0

      // Current hour sales
      const currentHour = today.getHours()
      const currentHourStart = startOfHour(today)
      const currentHourTransactions = todayTransactions.filter(tx =>
        new Date(tx.createdAt) >= currentHourStart
      )
      const currentHourSales = currentHourTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0)

      // Last hour comparison
      const lastHourStart = new Date(currentHourStart.getTime() - 60 * 60 * 1000)
      const lastHourEnd = currentHourStart
      const lastHourTransactions = todayTransactions.filter(tx => {
        const txTime = new Date(tx.createdAt)
        return txTime >= lastHourStart && txTime < lastHourEnd
      })
      const lastHourSales = lastHourTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0)

      // Payment method breakdown
      const paymentBreakdown: Record<string, number> = {}
      todayTransactions.forEach(tx => {
        tx.payments.forEach((payment: any) => {
          paymentBreakdown[payment.method] = (paymentBreakdown[payment.method] || 0) + payment.amount
        })
      })

      return {
        success: true,
        data: {
          totalSales,
          totalTransactions,
          averageTransaction,
          currentHourSales,
          lastHourSales,
          hourlyGrowth: lastHourSales > 0 ? ((currentHourSales - lastHourSales) / lastHourSales) * 100 : 0,
          paymentBreakdown,
          lastUpdated: new Date()
        }
      }

    } catch (error) {
      console.error('Error generating real-time analytics:', error)
      return {
        success: false,
        error: 'Failed to generate real-time analytics'
      }
    }
  }

  /**
   * Generate analytics comparison between locations
   */
  static async generateLocationComparison(
    locationIds: string[],
    startDate: Date,
    endDate: Date,
    organizationId: string
  ): Promise<{
    success: boolean
    data?: any[]
    error?: string
  }> {
    try {
      const locationAnalytics = await Promise.all(
        locationIds.map(async (locationId) => {
          const result = await this.generateAnalytics(locationId, startDate, endDate, organizationId)
          return {
            locationId,
            analytics: result.data
          }
        })
      )

      return {
        success: true,
        data: locationAnalytics
      }

    } catch (error) {
      console.error('Error generating location comparison:', error)
      return {
        success: false,
        error: 'Failed to generate location comparison'
      }
    }
  }
}