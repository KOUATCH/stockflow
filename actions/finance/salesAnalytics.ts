"use server"

import { db } from "@/prisma/db"
import type { CategorySales, ProductSales, LocationSales, FinancialFilters } from "@/types/retailFinance"
import { startOfDay, endOfDay, startOfMonth, startOfYear, subMonths, subDays, format } from "date-fns"

export class SalesAnalytics {

  /**
   * Get comprehensive sales summary for a period
   */
  static async getSalesSummary(organizationId: string, filters: FinancialFilters) {
    try {
      const { startDate, endDate } = filters.dateRange

      // Get all sales orders for the period
      const salesOrders = await db.salesOrder.findMany({
        where: {
          organizationId,
          orderDate: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate)
          },
          status: { not: 'CANCELLED' },
          ...(filters.locations?.length && { locationId: { in: filters.locations } }),
          ...(filters.customers?.length && { customerId: { in: filters.customers } })
        },
        include: {
          salesOrderLines: {
            include: {
              item: {
                include: {
                  category: true,
                  brand: true
                }
              }
            }
          },
          customer: true,
          location: true,
          payments: true
        }
      })

      // Calculate basic metrics
      const totalRevenue = salesOrders.reduce((sum, order) => sum + order.total, 0)
      const totalTransactions = salesOrders.length
      const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

      // Calculate growth compared to previous period
      const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const previousPeriodStart = subDays(startDate, periodLength)
      const previousPeriodEnd = subDays(endDate, periodLength)

      const previousPeriodOrders = await db.salesOrder.findMany({
        where: {
          organizationId,
          orderDate: {
            gte: startOfDay(previousPeriodStart),
            lte: endOfDay(previousPeriodEnd)
          },
          status: { not: 'CANCELLED' }
        }
      })

      const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0)
      const salesGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

      // Daily average
      const dailyAverage = totalRevenue / Math.max(1, periodLength)

      return {
        totalRevenue,
        totalTransactions,
        averageTransactionValue,
        salesGrowth,
        dailyAverage,
        topSellingCategories: await this.getTopSellingCategories(salesOrders, filters),
        topSellingProducts: await this.getTopSellingProducts(salesOrders),
        salesByLocation: await this.getSalesByLocation(salesOrders)
      }

    } catch (error) {
      console.error('Error getting sales summary:', error)
      throw error
    }
  }

  /**
   * Get sales performance by category
   */
  static async getTopSellingCategories(salesOrders: any[], filters: FinancialFilters): Promise<CategorySales[]> {
    const categoryStats = new Map<string, {
      categoryId: string
      categoryName: string
      totalSales: number
      quantity: number
      revenue: number
    }>()

    for (const order of salesOrders) {
      for (const line of order.salesOrderLines) {
        if (filters.categories?.length && !filters.categories.includes(line.item.categoryId)) {
          continue
        }

        const categoryId = line.item.categoryId
        const categoryName = line.item.category?.title || 'Uncategorized'

        if (!categoryStats.has(categoryId)) {
          categoryStats.set(categoryId, {
            categoryId,
            categoryName,
            totalSales: 0,
            quantity: 0,
            revenue: 0
          })
        }

        const stats = categoryStats.get(categoryId)!
        stats.totalSales += line.lineTotal
        stats.quantity += line.quantity
        stats.revenue += line.lineTotal
      }
    }

    // Calculate growth and margins for each category
    const categorySales: CategorySales[] = []
    for (const [categoryId, stats] of categoryStats) {
      // Calculate margin (would need cost data for accurate calculation)
      const estimatedCost = stats.revenue * 0.6 // Assume 60% cost ratio
      const margin = ((stats.revenue - estimatedCost) / stats.revenue) * 100

      categorySales.push({
        categoryId: stats.categoryId,
        categoryName: stats.categoryName,
        totalSales: stats.totalSales,
        quantity: stats.quantity,
        growth: 0, // Would calculate from previous period comparison
        margin
      })
    }

    return categorySales.sort((a, b) => b.totalSales - a.totalSales).slice(0, 10)
  }

  /**
   * Get top selling products
   */
  static async getTopSellingProducts(salesOrders: any[]): Promise<ProductSales[]> {
    const productStats = new Map<string, {
      productId: string
      productName: string
      sku: string
      unitsSold: number
      revenue: number
      totalRevenue: number
    }>()

    for (const order of salesOrders) {
      for (const line of order.salesOrderLines) {
        const productId = line.itemId
        const productName = line.item.name
        const sku = line.item.sku

        if (!productStats.has(productId)) {
          productStats.set(productId, {
            productId,
            productName,
            sku,
            unitsSold: 0,
            revenue: 0,
            totalRevenue: 0
          })
        }

        const stats = productStats.get(productId)!
        stats.unitsSold += line.quantity
        stats.revenue += line.lineTotal
        stats.totalRevenue += line.lineTotal
      }
    }

    return Array.from(productStats.values())
      .map(stats => ({
        productId: stats.productId,
        productName: stats.productName,
        sku: stats.sku,
        unitsSold: stats.unitsSold,
        revenue: stats.revenue,
        averagePrice: stats.unitsSold > 0 ? stats.revenue / stats.unitsSold : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20)
  }

  /**
   * Get sales breakdown by location
   */
  static async getSalesByLocation(salesOrders: any[]): Promise<LocationSales[]> {
    const locationStats = new Map<string, {
      locationId: string
      locationName: string
      totalSales: number
      transactions: number
    }>()

    for (const order of salesOrders) {
      const locationId = order.locationId || 'unknown'
      const locationName = order.location?.name || 'Unknown Location'

      if (!locationStats.has(locationId)) {
        locationStats.set(locationId, {
          locationId,
          locationName,
          totalSales: 0,
          transactions: 0
        })
      }

      const stats = locationStats.get(locationId)!
      stats.totalSales += order.total
      stats.transactions += 1
    }

    return Array.from(locationStats.values())
      .map(stats => ({
        ...stats,
        averageTransaction: stats.transactions > 0 ? stats.totalSales / stats.transactions : 0
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
  }

  /**
   * Get hourly sales pattern
   */
  static async getHourlySalesPattern(organizationId: string, dateRange: { startDate: Date, endDate: Date }) {
    const salesOrders = await db.salesOrder.findMany({
      where: {
        organizationId,
        orderDate: {
          gte: startOfDay(dateRange.startDate),
          lte: endOfDay(dateRange.endDate)
        },
        status: { not: 'CANCELLED' }
      }
    })

    const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      transactions: 0,
      revenue: 0,
      averageTransaction: 0
    }))

    for (const order of salesOrders) {
      const hour = order.orderDate.getHours()
      hourlyStats[hour].transactions += 1
      hourlyStats[hour].revenue += order.total
    }

    // Calculate averages
    hourlyStats.forEach(stat => {
      stat.averageTransaction = stat.transactions > 0 ? stat.revenue / stat.transactions : 0
    })

    return hourlyStats
  }

  /**
   * Get daily sales trend for a period
   */
  static async getDailySalesTrend(organizationId: string, days: number = 30) {
    const endDate = new Date()
    const startDate = subDays(endDate, days - 1)

    const salesOrders = await db.salesOrder.findMany({
      where: {
        organizationId,
        orderDate: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        },
        status: { not: 'CANCELLED' }
      }
    })

    // Group by date
    const dailyStats = new Map<string, { date: Date, revenue: number, transactions: number }>()

    // Initialize all dates with zero values
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i)
      const dateKey = format(date, 'yyyy-MM-dd')
      dailyStats.set(dateKey, {
        date,
        revenue: 0,
        transactions: 0
      })
    }

    // Populate with actual data
    for (const order of salesOrders) {
      const dateKey = format(order.orderDate, 'yyyy-MM-dd')
      if (dailyStats.has(dateKey)) {
        const stats = dailyStats.get(dateKey)!
        stats.revenue += order.total
        stats.transactions += 1
      }
    }

    return Array.from(dailyStats.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(stat => ({
        date: format(stat.date, 'MMM dd'),
        revenue: stat.revenue,
        transactions: stat.transactions,
        averageTransaction: stat.transactions > 0 ? stat.revenue / stat.transactions : 0
      }))
  }

  /**
   * Get sales comparison between periods
   */
  static async getSalesComparison(organizationId: string, currentPeriod: { startDate: Date, endDate: Date }, previousPeriod: { startDate: Date, endDate: Date }) {
    const [currentSales, previousSales] = await Promise.all([
      this.getSalesSummary(organizationId, { dateRange: currentPeriod, includeReturns: false, includeTax: true }),
      this.getSalesSummary(organizationId, { dateRange: previousPeriod, includeReturns: false, includeTax: true })
    ])

    return {
      current: currentSales,
      previous: previousSales,
      comparison: {
        revenueChange: previousSales.totalRevenue > 0 ?
          ((currentSales.totalRevenue - previousSales.totalRevenue) / previousSales.totalRevenue) * 100 : 0,
        transactionChange: previousSales.totalTransactions > 0 ?
          ((currentSales.totalTransactions - previousSales.totalTransactions) / previousSales.totalTransactions) * 100 : 0,
        avgTransactionChange: previousSales.averageTransactionValue > 0 ?
          ((currentSales.averageTransactionValue - previousSales.averageTransactionValue) / previousSales.averageTransactionValue) * 100 : 0
      }
    }
  }

  /**
   * Get monthly sales summary for the year
   */
  static async getMonthlySalesSummary(organizationId: string, year: number = new Date().getFullYear()) {
    const startDate = startOfYear(new Date(year, 0, 1))
    const endDate = endOfDay(new Date(year, 11, 31))

    const salesOrders = await db.salesOrder.findMany({
      where: {
        organizationId,
        orderDate: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      }
    })

    const monthlyStats = Array.from({ length: 12 }, (_, month) => ({
      month: month + 1,
      monthName: format(new Date(year, month, 1), 'MMM'),
      revenue: 0,
      transactions: 0,
      averageTransaction: 0
    }))

    for (const order of salesOrders) {
      const month = order.orderDate.getMonth()
      monthlyStats[month].revenue += order.total
      monthlyStats[month].transactions += 1
    }

    // Calculate averages
    monthlyStats.forEach(stat => {
      stat.averageTransaction = stat.transactions > 0 ? stat.revenue / stat.transactions : 0
    })

    return monthlyStats
  }
}