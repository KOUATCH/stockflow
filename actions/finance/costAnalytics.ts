"use server"

import { db } from "@/prisma/db"
import type { SupplierPurchases, UpcomingPayment, SupplierPaymentSummary, FinancialFilters } from "@/types/retailFinance"
import { startOfDay, endOfDay, addDays, differenceInDays, format } from "date-fns"

export class CostAnalytics {

  /**
   * Get comprehensive cost summary for a period
   */
  static async getCostSummary(organizationId: string, filters: FinancialFilters) {
    try {
      const { startDate, endDate } = filters.dateRange

      // Get purchase orders for the period
      const purchaseOrders = await db.purchaseOrder.findMany({
        where: {
          organizationId,
          orderDate: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate)
          },
          status: { not: 'CANCELLED' },
          ...(filters.suppliers?.length && { supplierId: { in: filters.suppliers } }),
          ...(filters.locations?.length && { locationId: { in: filters.locations } })
        },
        include: {
          purchaseOrderLines: {
            include: {
              item: {
                include: {
                  category: true,
                  brand: true
                }
              }
            }
          },
          supplier: true,
          location: true
        }
      })

      // Get sales data to calculate COGS
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
          salesOrderLines: {
            include: {
              item: true
            }
          }
        }
      })

      // Calculate metrics
      const totalPurchases = purchaseOrders.reduce((sum, po) => sum + po.total, 0)
      const costOfGoodsSold = this.calculateCOGS(salesOrders)
      const inventoryValue = await this.getInventoryValue(organizationId, filters)

      return {
        totalPurchases,
        costOfGoodsSold,
        inventoryValue,
        purchasesBySupplier: await this.getPurchasesBySupplier(purchaseOrders),
        pendingPurchaseOrders: await this.getPendingPurchaseOrdersValue(organizationId),
        purchaseTrends: await this.getPurchaseTrends(organizationId, filters),
        topExpenseCategories: await this.getTopExpenseCategories(purchaseOrders),
        costVarianceAnalysis: await this.getCostVarianceAnalysis(organizationId, filters)
      }

    } catch (error) {
      console.error('Error getting cost summary:', error)
      throw error
    }
  }

  /**
   * Calculate Cost of Goods Sold (COGS) from sales data
   */
  private static calculateCOGS(salesOrders: any[]): number {
    let totalCOGS = 0

    for (const order of salesOrders) {
      for (const line of order.salesOrderLines) {
        // Use item cost price or estimate if not available
        const itemCost = line.item.costPrice || (line.unitPrice * 0.6) // Assume 60% cost if not available
        totalCOGS += itemCost * line.quantity
      }
    }

    return totalCOGS
  }

  /**
   * Get current inventory value
   */
  private static async getInventoryValue(organizationId: string, filters: FinancialFilters): Promise<number> {
    const inventoryLevels = await db.inventoryLevel.findMany({
      where: {
        item: { organizationId },
        ...(filters.locations?.length && { locationId: { in: filters.locations } })
      },
      include: {
        item: true
      }
    })

    return inventoryLevels.reduce((total, level) => {
      const avgCost = level.averageCost || level.item.costPrice || 0
      return total + (level.quantityOnHand * avgCost)
    }, 0)
  }

  /**
   * Get purchases breakdown by supplier
   */
  private static async getPurchasesBySupplier(purchaseOrders: any[]): Promise<SupplierPurchases[]> {
    const supplierStats = new Map<string, {
      supplierId: string
      supplierName: string
      totalPurchases: number
      pendingAmount: number
      lastPurchase: Date
      orderCount: number
    }>()

    for (const po of purchaseOrders) {
      const supplierId = po.supplierId
      const supplierName = po.supplier?.name || 'Unknown Supplier'

      if (!supplierStats.has(supplierId)) {
        supplierStats.set(supplierId, {
          supplierId,
          supplierName,
          totalPurchases: 0,
          pendingAmount: 0,
          lastPurchase: po.orderDate,
          orderCount: 0
        })
      }

      const stats = supplierStats.get(supplierId)!
      stats.totalPurchases += po.total
      stats.orderCount += 1

      if (po.orderDate > stats.lastPurchase) {
        stats.lastPurchase = po.orderDate
      }

      // Add to pending if not completed
      if (['SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED'].includes(po.status)) {
        stats.pendingAmount += po.total
      }
    }

    return Array.from(supplierStats.values())
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
  }

  /**
   * Get total value of pending purchase orders
   */
  private static async getPendingPurchaseOrdersValue(organizationId: string): Promise<number> {
    const pendingPOs = await db.purchaseOrder.findMany({
      where: {
        organizationId,
        status: { in: ['SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED'] }
      }
    })

    return pendingPOs.reduce((sum, po) => sum + po.total, 0)
  }

  /**
   * Get purchase trends over time
   */
  private static async getPurchaseTrends(organizationId: string, filters: FinancialFilters) {
    const { startDate, endDate } = filters.dateRange
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        organizationId,
        orderDate: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate)
        }
      }
    })

    // Group by week or day depending on period length
    const groupBy = days > 30 ? 'week' : 'day'
    const trends = new Map<string, { date: string, purchases: number, orderCount: number }>()

    for (const po of purchaseOrders) {
      const key = groupBy === 'week' ?
        format(po.orderDate, 'yyyy-\'W\'ww') :
        format(po.orderDate, 'yyyy-MM-dd')

      if (!trends.has(key)) {
        trends.set(key, {
          date: key,
          purchases: 0,
          orderCount: 0
        })
      }

      const trend = trends.get(key)!
      trend.purchases += po.total
      trend.orderCount += 1
    }

    return Array.from(trends.values()).sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Get top expense categories
   */
  private static async getTopExpenseCategories(purchaseOrders: any[]) {
    const categoryStats = new Map<string, {
      categoryId: string
      categoryName: string
      totalSpent: number
      orderCount: number
    }>()

    for (const po of purchaseOrders) {
      for (const line of po.purchaseOrderLines) {
        const categoryId = line.item.categoryId || 'uncategorized'
        const categoryName = line.item.category?.title || 'Uncategorized'

        if (!categoryStats.has(categoryId)) {
          categoryStats.set(categoryId, {
            categoryId,
            categoryName,
            totalSpent: 0,
            orderCount: 0
          })
        }

        const stats = categoryStats.get(categoryId)!
        stats.totalSpent += line.lineTotal
        stats.orderCount += 1
      }
    }

    return Array.from(categoryStats.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
  }

  /**
   * Analyze cost variance (actual vs planned/budgeted costs)
   */
  private static async getCostVarianceAnalysis(organizationId: string, filters: FinancialFilters) {
    // This would compare actual costs against budgets/plans
    // For now, we'll provide a simple analysis comparing current vs previous period

    const { startDate, endDate } = filters.dateRange
    const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const previousStart = new Date(startDate.getTime() - periodLength * 24 * 60 * 60 * 1000)
    const previousEnd = new Date(endDate.getTime() - periodLength * 24 * 60 * 60 * 1000)

    const [currentPeriodPOs, previousPeriodPOs] = await Promise.all([
      db.purchaseOrder.findMany({
        where: {
          organizationId,
          orderDate: { gte: startOfDay(startDate), lte: endOfDay(endDate) }
        }
      }),
      db.purchaseOrder.findMany({
        where: {
          organizationId,
          orderDate: { gte: startOfDay(previousStart), lte: endOfDay(previousEnd) }
        }
      })
    ])

    const currentTotal = currentPeriodPOs.reduce((sum, po) => sum + po.total, 0)
    const previousTotal = previousPeriodPOs.reduce((sum, po) => sum + po.total, 0)

    const variance = currentTotal - previousTotal
    const variancePercent = previousTotal > 0 ? (variance / previousTotal) * 100 : 0

    return {
      currentPeriodCosts: currentTotal,
      previousPeriodCosts: previousTotal,
      variance,
      variancePercent,
      trend: variance > 0 ? 'INCREASING' : variance < 0 ? 'DECREASING' : 'STABLE'
    }
  }

  /**
   * Get supplier payment tracking
   */
  static async getSupplierPaymentSummary(organizationId: string): Promise<{
    totalPayables: number
    overduePayables: number
    upcomingPayments: UpcomingPayment[]
    paymentHistory: SupplierPaymentSummary[]
  }> {
    try {
      // Get all purchase orders with payment information
      const purchaseOrders = await db.purchaseOrder.findMany({
        where: {
          organizationId,
          status: { in: ['APPROVED', 'RECEIVED', 'COMPLETED'] }
        },
        include: {
          supplier: true,
          payments: true
        }
      })

      let totalPayables = 0
      let overduePayables = 0
      const upcomingPayments: UpcomingPayment[] = []
      const paymentSummaryMap = new Map<string, {
        supplierId: string
        supplierName: string
        totalPaid: number
        pendingAmount: number
        lastPayment: Date | null
      }>()

      const today = new Date()

      for (const po of purchaseOrders) {
        const totalPaid = po.payments.reduce((sum, payment) => sum + payment.amount, 0)
        const pendingAmount = po.total - totalPaid

        if (pendingAmount > 0) {
          totalPayables += pendingAmount

          // Determine if overdue (assuming 30-day terms if not specified)
          const paymentTermsDays = this.parsePaymentTerms(po.paymentTerms || 'Net 30')
          const dueDate = addDays(po.orderDate, paymentTermsDays)

          if (dueDate < today) {
            overduePayables += pendingAmount
          }

          // Add to upcoming payments if due within next 30 days
          const daysUntilDue = differenceInDays(dueDate, today)
          if (daysUntilDue >= 0 && daysUntilDue <= 30) {
            upcomingPayments.push({
              supplierId: po.supplierId,
              supplierName: po.supplier?.name || 'Unknown',
              amount: pendingAmount,
              dueDate,
              purchaseOrderId: po.id
            })
          }
        }

        // Track payment summary by supplier
        if (!paymentSummaryMap.has(po.supplierId)) {
          paymentSummaryMap.set(po.supplierId, {
            supplierId: po.supplierId,
            supplierName: po.supplier?.name || 'Unknown',
            totalPaid: 0,
            pendingAmount: 0,
            lastPayment: null
          })
        }

        const summary = paymentSummaryMap.get(po.supplierId)!
        summary.totalPaid += totalPaid
        summary.pendingAmount += pendingAmount

        // Find latest payment
        const latestPayment = po.payments.reduce((latest, payment) =>
          !latest || payment.processedAt > latest ? payment.processedAt : latest, null as Date | null)

        if (latestPayment && (!summary.lastPayment || latestPayment > summary.lastPayment)) {
          summary.lastPayment = latestPayment
        }
      }

      return {
        totalPayables,
        overduePayables,
        upcomingPayments: upcomingPayments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
        paymentHistory: Array.from(paymentSummaryMap.values())
          .sort((a, b) => b.totalPaid - a.totalPaid)
      }

    } catch (error) {
      console.error('Error getting supplier payment summary:', error)
      throw error
    }
  }

  /**
   * Get inventory cost analysis
   */
  static async getInventoryCostAnalysis(organizationId: string) {
    try {
      const inventoryLevels = await db.inventoryLevel.findMany({
        where: {
          item: { organizationId }
        },
        include: {
          item: {
            include: {
              category: true,
              brand: true
            }
          }
        }
      })

      const analysis = {
        totalInventoryValue: 0,
        slowMovingInventoryValue: 0,
        excessInventoryValue: 0,
        categoryBreakdown: new Map<string, {
          categoryId: string
          categoryName: string
          totalValue: number
          totalQuantity: number
          averageCost: number
        }>(),
        brandBreakdown: new Map<string, {
          brandId: string
          brandName: string
          totalValue: number
          totalQuantity: number
          averageCost: number
        }>()
      }

      for (const level of inventoryLevels) {
        const avgCost = level.averageCost || level.item.costPrice || 0
        const totalValue = level.quantityOnHand * avgCost

        analysis.totalInventoryValue += totalValue

        // Identify slow-moving inventory (no transactions in 90+ days)
        const daysSinceLastTransaction = level.lastTransactionAt ?
          differenceInDays(new Date(), level.lastTransactionAt) : 999

        if (daysSinceLastTransaction > 90) {
          analysis.slowMovingInventoryValue += totalValue
        }

        // Identify excess inventory (above reorder point + safety stock)
        const excessQuantity = Math.max(0, level.quantityOnHand - (level.reorderPoint * 2))
        if (excessQuantity > 0) {
          analysis.excessInventoryValue += excessQuantity * avgCost
        }

        // Category breakdown
        const categoryId = level.item.categoryId || 'uncategorized'
        const categoryName = level.item.category?.title || 'Uncategorized'

        if (!analysis.categoryBreakdown.has(categoryId)) {
          analysis.categoryBreakdown.set(categoryId, {
            categoryId,
            categoryName,
            totalValue: 0,
            totalQuantity: 0,
            averageCost: 0
          })
        }

        const categoryStats = analysis.categoryBreakdown.get(categoryId)!
        categoryStats.totalValue += totalValue
        categoryStats.totalQuantity += level.quantityOnHand

        // Brand breakdown
        const brandId = level.item.brandId || 'unbranded'
        const brandName = level.item.brand?.brandName || 'Unbranded'

        if (!analysis.brandBreakdown.has(brandId)) {
          analysis.brandBreakdown.set(brandId, {
            brandId,
            brandName,
            totalValue: 0,
            totalQuantity: 0,
            averageCost: 0
          })
        }

        const brandStats = analysis.brandBreakdown.get(brandId)!
        brandStats.totalValue += totalValue
        brandStats.totalQuantity += level.quantityOnHand
      }

      // Calculate average costs
      analysis.categoryBreakdown.forEach(cat => {
        cat.averageCost = cat.totalQuantity > 0 ? cat.totalValue / cat.totalQuantity : 0
      })

      analysis.brandBreakdown.forEach(brand => {
        brand.averageCost = brand.totalQuantity > 0 ? brand.totalValue / brand.totalQuantity : 0
      })

      return {
        ...analysis,
        categoryBreakdown: Array.from(analysis.categoryBreakdown.values())
          .sort((a, b) => b.totalValue - a.totalValue),
        brandBreakdown: Array.from(analysis.brandBreakdown.values())
          .sort((a, b) => b.totalValue - a.totalValue)
      }

    } catch (error) {
      console.error('Error getting inventory cost analysis:', error)
      throw error
    }
  }

  /**
   * Parse payment terms to get number of days
   */
  private static parsePaymentTerms(terms: string): number {
    const match = terms.match(/(\d+)/)
    return match ? parseInt(match[1]) : 30
  }
}