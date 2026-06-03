"use server"

import { db } from "@/prisma/db"
import type { CategoryProfit, FinancialFilters, ProductProfit, ProfitableItem } from "@/types/retailFinance"
import { endOfDay, format, startOfDay, subDays } from "date-fns"

export class ProfitabilityAnalytics {

  /**
   * Get comprehensive profitability analysis
   */
  static async getProfitabilityAnalysis(organizationId: string, filters: FinancialFilters) {
    try {
      const { startDate, endDate } = filters.dateRange

      // Get sales and cost data
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
          lines: {
            include: {
              item: {
                include: {
                  category: true,
                  brand: true
                }
              }
            }
          }
        }
      })

      const analysis = this.calculateProfitabilityMetrics(salesOrders)

      return {
        summary: analysis.summary,
        profitByCategory: analysis.profitByCategory,
        profitByProduct: analysis.profitByProduct,
        mostProfitableItems: analysis.mostProfitableItems,
        leastProfitableItems: analysis.leastProfitableItems,
        profitTrends: await this.getProfitTrends(organizationId, filters),
        marginAnalysis: analysis.marginAnalysis
      }

    } catch (error) {
      console.error('Error getting profitability analysis:', error)
      throw error
    }
  }

  /**
   * Calculate detailed profitability metrics from sales data
   */
  private static calculateProfitabilityMetrics(salesOrders: any[]) {
    let totalRevenue = 0
    let totalCost = 0
    let totalProfit = 0

    const categoryProfits = new Map<string, {
      categoryId: string
      categoryName: string
      revenue: number
      cost: number
      profit: number
      margin: number
      transactions: number
    }>()

    const productProfits = new Map<string, {
      productId: string
      productName: string
      sku: string
      revenue: number
      cost: number
      profit: number
      margin: number
      unitsSold: number
    }>()

    // Process each sales order
    for (const order of salesOrders) {
      for (const line of order.salesOrderLines) {
        const lineRevenue = line.lineTotal
        const unitCost = line.item.costPrice || (line.unitPrice * 0.6) // Fallback to 60% cost estimate
        const lineCost = unitCost * line.quantity
        const lineProfit = lineRevenue - lineCost

        totalRevenue += lineRevenue
        totalCost += lineCost
        totalProfit += lineProfit

        // Category analysis
        const categoryId = line.item.categoryId || 'uncategorized'
        const categoryName = line.item.category?.title || 'Uncategorized'

        if (!categoryProfits.has(categoryId)) {
          categoryProfits.set(categoryId, {
            categoryId,
            categoryName,
            revenue: 0,
            cost: 0,
            profit: 0,
            margin: 0,
            transactions: 0
          })
        }

        const categoryData = categoryProfits.get(categoryId)!
        categoryData.revenue += lineRevenue
        categoryData.cost += lineCost
        categoryData.profit += lineProfit
        categoryData.transactions += 1

        // Product analysis
        const productId = line.itemId
        const productName = line.item.name
        const sku = line.item.sku

        if (!productProfits.has(productId)) {
          productProfits.set(productId, {
            productId,
            productName,
            sku,
            revenue: 0,
            cost: 0,
            profit: 0,
            margin: 0,
            unitsSold: 0
          })
        }

        const productData = productProfits.get(productId)!
        productData.revenue += lineRevenue
        productData.cost += lineCost
        productData.profit += lineProfit
        productData.unitsSold += line.quantity
      }
    }

    // Calculate margins
    categoryProfits.forEach(category => {
      category.margin = category.revenue > 0 ? (category.profit / category.revenue) * 100 : 0
    })

    productProfits.forEach(product => {
      product.margin = product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0
    })

    // Convert to arrays and sort
    const profitByCategory: CategoryProfit[] = Array.from(categoryProfits.values())
      .sort((a, b) => b.profit - a.profit)

    const profitByProduct: ProductProfit[] = Array.from(productProfits.values())
      .sort((a, b) => b.profit - a.profit)

    // Get most/least profitable items
    const mostProfitableItems: ProfitableItem[] = profitByProduct
      .slice(0, 10)
      .map((item, index) => ({
        productId: item.productId,
        productName: item.productName,
        profit: item.profit,
        margin: item.margin,
        rank: index + 1
      }))

    const leastProfitableItems: ProfitableItem[] = profitByProduct
      .filter(item => item.profit < 0)
      .sort((a, b) => a.profit - b.profit)
      .slice(0, 10)
      .map((item, index) => ({
        productId: item.productId,
        productName: item.productName,
        profit: item.profit,
        margin: item.margin,
        rank: index + 1
      }))

    // Calculate overall metrics
    const grossMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    const averageMarginPerTransaction = salesOrders.length > 0 ? grossMargin / salesOrders.length : 0

    return {
      summary: {
        totalRevenue,
        totalCost,
        totalProfit,
        grossMargin,
        averageMarginPerTransaction,
        totalTransactions: salesOrders.length
      },
      profitByCategory,
      profitByProduct,
      mostProfitableItems,
      leastProfitableItems,
      marginAnalysis: {
        highMarginProducts: profitByProduct.filter(p => p.margin > 50).length,
        mediumMarginProducts: profitByProduct.filter(p => p.margin > 20 && p.margin <= 50).length,
        lowMarginProducts: profitByProduct.filter(p => p.margin > 0 && p.margin <= 20).length,
        lossProducts: profitByProduct.filter(p => p.margin <= 0).length
      }
    }
  }

  /**
   * Get profit trends over time
   */
  private static async getProfitTrends(organizationId: string, filters: FinancialFilters) {
    const { startDate, endDate } = filters.dateRange
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Get daily profit data
    const dailyProfits = []
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)

      const salesOrders = await db.salesOrder.findMany({
        where: {
          organizationId,
          orderDate: {
            gte: startOfDay(currentDate),
            lte: endOfDay(currentDate)
          },
          status: { not: 'CANCELLED' }
        },
        include: {
          lines: {
            include: {
              item: true
            }
          }
        }
      })

      let dayRevenue = 0
      let dayCost = 0
      let dayProfit = 0

      for (const order of salesOrders) {
        for (const line of order.lines) {
          const lineRevenue = line.lineTotal
          const lineCost = (line.item.costPrice || line.unitPrice * 0.6) * line.quantity

          dayRevenue += lineRevenue
          dayCost += lineCost
          dayProfit += (lineRevenue - lineCost)
        }
      }

      dailyProfits.push({
        date: format(currentDate, 'MMM dd'),
        revenue: dayRevenue,
        cost: dayCost,
        profit: dayProfit,
        margin: dayRevenue > 0 ? (dayProfit / dayRevenue) * 100 : 0,
        transactions: salesOrders.length
      })
    }

    return dailyProfits
  }

  /**
   * Get profit analysis by time periods
   */
  static async getProfitByTimePeriod(organizationId: string, period: 'daily' | 'weekly' | 'monthly', days: number = 30) {
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
      },
      include: {
        lines: {
          include: {
            item: true
          }
        }
      }
    })

    // Group by time period
    const periods = new Map<string, {
      period: string
      revenue: number
      cost: number
      profit: number
      margin: number
      transactions: number
    }>()

    for (const order of salesOrders) {
      let periodKey: string

      switch (period) {
        case 'weekly':
          periodKey = format(order.orderDate, 'yyyy-\'W\'ww')
          break
        case 'monthly':
          periodKey = format(order.orderDate, 'yyyy-MM')
          break
        default:
          periodKey = format(order.orderDate, 'yyyy-MM-dd')
      }

      if (!periods.has(periodKey)) {
        periods.set(periodKey, {
          period: periodKey,
          revenue: 0,
          cost: 0,
          profit: 0,
          margin: 0,
          transactions: 0
        })
      }

      const periodData = periods.get(periodKey)!
      periodData.transactions += 1

      for (const line of order.lines) {
        const lineRevenue = line.lineTotal
        const lineCost = (line.item.costPrice || line.unitPrice * 0.6) * line.quantity

        periodData.revenue += lineRevenue
        periodData.cost += lineCost
        periodData.profit += (lineRevenue - lineCost)
      }
    }

    // Calculate margins
    periods.forEach(periodData => {
      periodData.margin = periodData.revenue > 0 ? (periodData.profit / periodData.revenue) * 100 : 0
    })

    return Array.from(periods.values()).sort((a, b) => a.period.localeCompare(b.period))
  }

  /**
   * Get profit analysis by customer segments
   */
  static async getProfitByCustomerSegment(organizationId: string, filters: FinancialFilters) {
    const { startDate, endDate } = filters.dateRange

    const salesOrders = await db.salesOrder.findMany({
      where: {
        organizationId,
        orderDate: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        },
        status: { not: 'CANCELLED' }
      },
      include: {
        customer: true,
        lines: {
          include: {
            item: true
          }
        }
      }
    })

    const customerProfits = new Map<string, {
      customerId: string
      customerName: string
      revenue: number
      cost: number
      profit: number
      margin: number
      transactions: number
      averageOrderValue: number
    }>()

    for (const order of salesOrders) {
      const customerId = order.customerId || 'walk-in'
      const customerName = order.customer?.name || 'Walk-in Customer'

      if (!customerProfits.has(customerId)) {
        customerProfits.set(customerId, {
          customerId,
          customerName,
          revenue: 0,
          cost: 0,
          profit: 0,
          margin: 0,
          transactions: 0,
          averageOrderValue: 0
        })
      }

      const customerData = customerProfits.get(customerId)!
      customerData.transactions += 1

      for (const line of order.lines) {
        const lineRevenue = line.lineTotal
        const lineCost = (line.item.costPrice || line.unitPrice * 0.6) * line.quantity

        customerData.revenue += lineRevenue
        customerData.cost += lineCost
        customerData.profit += (lineRevenue - lineCost)
      }
    }

    // Calculate margins and averages
    customerProfits.forEach(customer => {
      customer.margin = customer.revenue > 0 ? (customer.profit / customer.revenue) * 100 : 0
      customer.averageOrderValue = customer.transactions > 0 ? customer.revenue / customer.transactions : 0
    })

    // Segment customers
    const sortedCustomers = Array.from(customerProfits.values())
      .sort((a, b) => b.profit - a.profit)

    const totalCustomers = sortedCustomers.length
    const topTierCount = Math.ceil(totalCustomers * 0.2) // Top 20%
    const midTierCount = Math.ceil(totalCustomers * 0.3) // Next 30%

    return {
      topTier: sortedCustomers.slice(0, topTierCount),
      midTier: sortedCustomers.slice(topTierCount, topTierCount + midTierCount),
      bottomTier: sortedCustomers.slice(topTierCount + midTierCount),
      summary: {
        topTierRevenue: sortedCustomers.slice(0, topTierCount).reduce((sum, c) => sum + c.revenue, 0),
        topTierProfit: sortedCustomers.slice(0, topTierCount).reduce((sum, c) => sum + c.profit, 0),
        totalRevenue: sortedCustomers.reduce((sum, c) => sum + c.revenue, 0),
        totalProfit: sortedCustomers.reduce((sum, c) => sum + c.profit, 0)
      }
    }
  }

  /**
   * Generate margin optimization recommendations
   */
  static async getMarginOptimizationRecommendations(organizationId: string, filters: FinancialFilters) {
    const analysis = await this.getProfitabilityAnalysis(organizationId, filters)
    const recommendations = []

    // Low margin products
    const lowMarginProducts = analysis.profitByProduct.filter(p => p.margin < 15 && p.margin > 0)
    if (lowMarginProducts.length > 0) {
      recommendations.push({
        type: 'LOW_MARGIN',
        priority: 'HIGH',
        title: 'Low Margin Products Identified',
        description: `${lowMarginProducts.length} products have margins below 15%`,
        action: 'Consider price increases or find alternative suppliers',
        products: lowMarginProducts.slice(0, 5)
      })
    }

    // Loss-making products
    const lossProducts = analysis.profitByProduct.filter(p => p.margin <= 0)
    if (lossProducts.length > 0) {
      recommendations.push({
        type: 'LOSS_PRODUCTS',
        priority: 'CRITICAL',
        title: 'Loss-Making Products',
        description: `${lossProducts.length} products are selling at a loss`,
        action: 'Immediate review of pricing or discontinue these products',
        products: lossProducts.slice(0, 5)
      })
    }

    // High performing categories
    const topCategory = analysis.profitByCategory[0]
    if (topCategory && topCategory.margin > 30) {
      recommendations.push({
        type: 'EXPAND_CATEGORY',
        priority: 'MEDIUM',
        title: 'Expand High-Margin Category',
        description: `${topCategory.categoryName} has excellent margins (${topCategory.margin.toFixed(1)}%)`,
        action: 'Consider expanding inventory in this category',
        category: topCategory
      })
    }

    return recommendations
  }

  /**
   * Calculate break-even analysis for products
   */
  static async getBreakEvenAnalysis(organizationId: string, productIds?: string[]) {
    const whereClause = productIds?.length
      ? { id: { in: productIds }, organizationId }
      : { organizationId }

    const items = await db.item.findMany({
      where: whereClause,
      include: {
        salesOrderLines: {
          where: {
            salesOrder: {
              status: { not: 'CANCELLED' }
            }
          }
        }
      }
    })

    const breakEvenAnalysis = items.map(item => {
      const totalRevenue = item.salesOrderLines.reduce((sum, line) => sum + line.lineTotal, 0)
      const totalQuantitySold = item.salesOrderLines.reduce((sum, line) => sum + line.quantity, 0)
      const averageSellingPrice = totalQuantitySold > 0 ? totalRevenue / totalQuantitySold : item.sellingPrice

      const variableCost = item.costPrice || 0
      const contributionMargin = averageSellingPrice - variableCost
      const contributionMarginRatio = averageSellingPrice > 0 ? (contributionMargin / averageSellingPrice) * 100 : 0

      // Assuming fixed costs (would need to be configured per business)
      const estimatedFixedCostPerUnit = 5 // This should be calculated from actual overhead
      const breakEvenQuantity = contributionMargin > 0 ? Math.ceil(estimatedFixedCostPerUnit / contributionMargin) : 0

      return {
        productId: item.id,
        productName: item.name,
        sku: item.sku,
        sellingPrice: averageSellingPrice,
        variableCost,
        contributionMargin,
        contributionMarginRatio,
        breakEvenQuantity,
        currentQuantitySold: totalQuantitySold,
        isAboveBreakEven: totalQuantitySold >= breakEvenQuantity
      }
    })

    return breakEvenAnalysis.sort((a, b) => b.contributionMargin - a.contributionMargin)
  }
}