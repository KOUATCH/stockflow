"use server"

import { db } from "@/prisma/db"
import type { CashFlowData, FinancialAlert, FinancialFilters, RetailFinancialSummary } from "@/types/retailFinance"
import { differenceInDays, endOfDay, endOfMonth, format, startOfDay, startOfMonth, subMonths } from "date-fns"
import { CostAnalytics } from "./costAnalytics"
import { CustomerFinancialManager } from "./customerFinancialManager"
import { ProfitabilityAnalytics } from "./profitabilityAnalytics"
import { SalesAnalytics } from "./salesAnalytics"

export class RetailFinancialAnalytics {

  /**
   * Get comprehensive financial summary for retail business
   */
  static async getRetailFinancialSummary(
    organizationId: string,
    filters: FinancialFilters
  ): Promise<RetailFinancialSummary> {
    try {
      const { startDate, endDate } = filters.dateRange

      // Get data from all analytics modules
      const [
        salesSummary,
        costSummary,
        profitabilityAnalysis,
        customerFinances,
        supplierPaymentSummary,
        cashFlowData
      ] = await Promise.all([
        SalesAnalytics.getSalesSummary(organizationId, filters),
        CostAnalytics.getCostSummary(organizationId, filters),
        ProfitabilityAnalytics.getProfitabilityAnalysis(organizationId, filters),
        this.getCustomerFinancialSummary(organizationId),
        CostAnalytics.getSupplierPaymentSummary(organizationId),
        this.getCashFlowSummary(organizationId, filters)
      ])

      const supplierFinances = {
        ...supplierPaymentSummary,
        supplierCreditBalance: 0 // Add the missing property - would be calculated from actual supplier credit system
      }

      return {
        period: {
          startDate,
          endDate,
          label: this.formatPeriodLabel(startDate, endDate)
        },

        sales: salesSummary,

        costs: {
          totalPurchases: costSummary.totalPurchases,
          costOfGoodsSold: costSummary.costOfGoodsSold,
          inventoryValue: costSummary.inventoryValue,
          purchasesBySupplier: costSummary.purchasesBySupplier,
          pendingPurchaseOrders: costSummary.pendingPurchaseOrders
        },

        profitability: {
          grossProfit: profitabilityAnalysis.summary.totalProfit,
          grossMargin: profitabilityAnalysis.summary.grossMargin,
          netProfit: profitabilityAnalysis.summary.totalProfit, // Simplified - would subtract operating expenses
          profitByCategory: profitabilityAnalysis.profitByCategory,
          profitByProduct: profitabilityAnalysis.profitByProduct,
          mostProfitableItems: profitabilityAnalysis.mostProfitableItems
        },

        customerFinances,
         supplierFinances,
        cashFlow: cashFlowData,
        payroll: {
          totalPayrollExpense: 0,
          totalEmployees: 0,
          averageSalary: 0,
          payrollGrowth: 0,
          departmentBreakdown: [],
          benefitsCost: 0,
          payrollTaxes: 0,
          overtimeCost: 0,
          overtimePercentage: 0
        }
      }

    } catch (error) {
      console.error('Error getting retail financial summary:', error)
      throw error
    }
  }

  /**
   * Get customer financial summary
   */
  private static async getCustomerFinancialSummary(organizationId: string) {
    try {
      const customers = await CustomerFinancialManager.getCustomersWithBalances(organizationId)
      const agingReport = await CustomerFinancialManager.generateAgingReport(organizationId)

      const totalReceivables = customers.reduce((sum, customer) => sum + customer.totalOwed, 0)
      const overdueReceivables = customers.reduce((sum, customer) => sum + customer.overdueAmount, 0)

      // Get store credits (simplified - would need proper implementation)
      const customerCredits = 0 // Would calculate from actual store credit system

      // Get top debtors
      const topDebtors = customers.slice(0, 10)

      // Get payment history summary
      const customerPaymentSummary = await Promise.all(
        customers.slice(0, 20).map(async customer => {
          const account = await CustomerFinancialManager.getCustomerFinancialAccount(customer.customerId)
          return {
            customerId: customer.customerId,
            customerName: customer.customerName,
            totalPaid: account?.summary.totalPayments || 0,
            lastPayment: account?.payments[0]?.date || new Date(),
            paymentMethod: account?.payments[0]?.method || 'UNKNOWN'
          }
        })
      )

      return {
        totalReceivables,
        overdueReceivables,
        customerCredits,
        topDebtors,
        paymentHistory: customerPaymentSummary,
        creditUtilization: 0 // Would calculate based on credit limits vs outstanding balances
      }

    } catch (error) {
      console.error('Error getting customer financial summary:', error)
      return {
        totalReceivables: 0,
        overdueReceivables: 0,
        customerCredits: 0,
        topDebtors: [],
        paymentHistory: [],
        creditUtilization: 0
      }
    }
  }

  /**
   * Get cash flow summary and projections
   */
  private static async getCashFlowSummary(organizationId: string, filters: FinancialFilters) {
    try {
      const { startDate, endDate } = filters.dateRange

      // Calculate cash inflows (payments received)
      const payments = await db.payment.findMany({
        where: {
          processedAt: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate)
          },
          status: 'PAID',
          salesOrder: {
            organizationId
          }
        }
      })

      const cashIn = payments.reduce((sum, payment) => sum + payment.amount, 0)

      // Calculate cash outflows (supplier payments, expenses)
      const supplierPayments = await db.payment.findMany({
        where: {
          processedAt: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate)
          },
          purchaseOrder: {
            organizationId
          }
        }
      })

      const cashOut = supplierPayments.reduce((sum, payment) => sum + payment.amount, 0)

      // Calculate net cash flow
      const netCashFlow = cashIn - cashOut

      // Get current cash position (simplified - would integrate with actual accounting system)
      const currentCashPosition = await this.getCurrentCashPosition(organizationId)

      // Generate cash flow trend
      const cashFlowTrend = await this.getCashFlowTrend(organizationId, filters)

      // Project future cash flow (simplified projection)
      const projectedCashFlow = this.projectCashFlow(cashFlowTrend)

      return {
        currentCashPosition,
        cashIn,
        cashOut,
        netCashFlow,
        projectedCashFlow,
        cashFlowTrend
      }

    } catch (error) {
      console.error('Error getting cash flow summary:', error)
      return {
        currentCashPosition: 0,
        cashIn: 0,
        cashOut: 0,
        netCashFlow: 0,
        projectedCashFlow: 0,
        cashFlowTrend: []
      }
    }
  }

  /**
   * Get current cash position
   */
  private static async getCurrentCashPosition(organizationId: string): Promise<number> {
    try {
      // This would typically integrate with your accounting system or bank API
      // For now, we'll estimate based on recent cash flows

      const recentPayments = await db.payment.findMany({
        where: {
          processedAt: {
            gte: startOfMonth(new Date())
          },
          OR: [
            { salesOrder: { organizationId } },
            { purchaseOrder: { organizationId } }
          ]
        }
      })

      const totalCashIn = recentPayments
        .filter(p => p.amount > 0 && p.salesOrderId)
        .reduce((sum, p) => sum + p.amount, 0)

      const totalCashOut = recentPayments
        .filter(p => p.amount > 0 && p.purchaseOrderId)
        .reduce((sum, p) => sum + p.amount, 0)

      // Estimate current position (would be replaced with actual bank balance)
      return totalCashIn - totalCashOut

    } catch (error) {
      console.error('Error getting current cash position:', error)
      return 0
    }
  }

  /**
   * Get cash flow trend over time
   */
  private static async getCashFlowTrend(organizationId: string, filters: FinancialFilters): Promise<CashFlowData[]> {
    const { startDate, endDate } = filters.dateRange
    const days = differenceInDays(endDate, startDate) + 1

    const trends: CashFlowData[] = []
    let runningBalance = await this.getCurrentCashPosition(organizationId)

    for (let i = 0; i < Math.min(days, 30); i++) { // Limit to 30 days for performance
      const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)

      // Get payments for the day
      const dayPayments = await db.payment.findMany({
        where: {
          processedAt: {
            gte: startOfDay(currentDate),
            lte: endOfDay(currentDate)
          },
          OR: [
            { salesOrder: { organizationId } },
            { purchaseOrder: { organizationId } }
          ]
        },
        include: {
          salesOrder: true,
          purchaseOrder: true
        }
      })

      const cashIn = dayPayments
        .filter(p => p.salesOrder)
        .reduce((sum, p) => sum + p.amount, 0)

      const cashOut = dayPayments
        .filter(p => p.purchaseOrder)
        .reduce((sum, p) => sum + p.amount, 0)

      const netFlow = cashIn - cashOut
      runningBalance += netFlow

      trends.push({
        date: currentDate,
        cashIn,
        cashOut,
        netFlow,
        balance: runningBalance
      })
    }

    return trends
  }

  /**
   * Project future cash flow
   */
  private static projectCashFlow(historicalTrends: CashFlowData[]): number {
    if (historicalTrends.length === 0) return 0

    // Simple projection based on average daily cash flow
    const avgDailyFlow = historicalTrends.reduce((sum, day) => sum + day.netFlow, 0) / historicalTrends.length
    const daysToProject = 30

    const currentBalance = historicalTrends[historicalTrends.length - 1]?.balance || 0
    return currentBalance + (avgDailyFlow * daysToProject)
  }

  /**
   * Generate financial alerts
   */
  static async generateFinancialAlerts(organizationId: string): Promise<FinancialAlert[]> {
    const alerts: FinancialAlert[] = []

    try {
      // Check for overdue receivables
      const overdueCustomers = await CustomerFinancialManager.getCustomersWithBalances(organizationId)
      const criticalOverdue = overdueCustomers.filter(c => c.overdueAmount > 1000 && c.daysPastDue > 60)

      for (const customer of criticalOverdue.slice(0, 5)) {
        alerts.push({
          id: `overdue_${customer.customerId}`,
          type: 'OVERDUE_RECEIVABLE',
          severity: customer.daysPastDue > 90 ? 'CRITICAL' : 'HIGH',
          title: 'Overdue Customer Payment',
          description: `${customer.customerName} has $${customer.overdueAmount.toLocaleString()} overdue for ${customer.daysPastDue} days`,
          amount: customer.overdueAmount,
          relatedEntity: {
            id: customer.customerId,
            type: 'customer',
            name: customer.customerName
          },
          actionRequired: 'Contact customer for payment arrangement',
          createdAt: new Date()
        })
      }

      // Check for low cash position
      const currentCash = await this.getCurrentCashPosition(organizationId)
      if (currentCash < 10000) { // Configurable threshold
        alerts.push({
          id: 'low_cash',
          type: 'LOW_CASH',
          severity: currentCash < 5000 ? 'CRITICAL' : 'HIGH',
          title: 'Low Cash Position',
          description: `Current cash position is $${currentCash.toLocaleString()}`,
          amount: currentCash,
          actionRequired: 'Review cash flow and consider financing options',
          createdAt: new Date()
        })
      }

      // Check for high inventory costs
      const inventoryAnalysis = await CostAnalytics.getInventoryCostAnalysis(organizationId)
      if (inventoryAnalysis.slowMovingInventoryValue > 50000) {
        alerts.push({
          id: 'high_inventory_cost',
          type: 'HIGH_INVENTORY_COST',
          severity: 'MEDIUM',
          title: 'High Slow-Moving Inventory',
          description: `$${inventoryAnalysis.slowMovingInventoryValue.toLocaleString()} in slow-moving inventory`,
          amount: inventoryAnalysis.slowMovingInventoryValue,
          actionRequired: 'Review inventory levels and consider promotions',
          createdAt: new Date()
        })
      }

      // Check for margin drops
      const currentMonth = { startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }
      const previousMonth = { startDate: startOfMonth(subMonths(new Date(), 1)), endDate: endOfMonth(subMonths(new Date(), 1)) }

      const [currentAnalysis, previousAnalysis] = await Promise.all([
        ProfitabilityAnalytics.getProfitabilityAnalysis(organizationId, {
          dateRange: currentMonth,
          includeReturns: false,
          includeTax: true
        }),
        ProfitabilityAnalytics.getProfitabilityAnalysis(organizationId, {
          dateRange: previousMonth,
          includeReturns: false,
          includeTax: true
        })
      ])

      const marginDrop = previousAnalysis.summary.grossMargin - currentAnalysis.summary.grossMargin
      if (marginDrop > 5) { // 5% margin drop
        alerts.push({
          id: 'margin_drop',
          type: 'MARGIN_DROP',
          severity: 'MEDIUM',
          title: 'Gross Margin Decline',
          description: `Gross margin dropped ${marginDrop.toFixed(1)}% from last month`,
          actionRequired: 'Review pricing strategy and cost management',
          createdAt: new Date()
        })
      }

      // Check for upcoming supplier payments
      const supplierPayments = await CostAnalytics.getSupplierPaymentSummary(organizationId)
      const urgentPayments = supplierPayments.upcomingPayments.filter(p =>
        differenceInDays(p.dueDate, new Date()) <= 7
      )

      for (const payment of urgentPayments.slice(0, 3)) {
        alerts.push({
          id: `payment_due_${payment.supplierId}`,
          type: 'PAYMENT_DUE',
          severity: 'MEDIUM',
          title: 'Supplier Payment Due Soon',
          description: `Payment of $${payment.amount.toLocaleString()} due to ${payment.supplierName} in ${differenceInDays(payment.dueDate, new Date())} days`,
          amount: payment.amount,
          relatedEntity: {
            id: payment.supplierId,
            type: 'supplier',
            name: payment.supplierName
          },
          actionRequired: 'Prepare payment or contact supplier for payment arrangement',
          createdAt: new Date()
        })
      }

      return alerts.sort((a, b) => {
        const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        return severityOrder[a.severity] - severityOrder[b.severity]
      })

    } catch (error) {
      console.error('Error generating financial alerts:', error)
      return alerts
    }
  }

  /**
   * Get financial KPIs for dashboard
   */
  static async getFinancialKPIs(organizationId: string) {
    try {
      const currentMonth = { startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }
      const previousMonth = { startDate: startOfMonth(subMonths(new Date(), 1)), endDate: endOfMonth(subMonths(new Date(), 1)) }

      const filters = {
        dateRange: currentMonth,
        includeReturns: false,
        includeTax: true
      }

      const [
        currentSummary,
        previousSummary,
        customerBalances,
        supplierPayments,
        cashPosition
      ] = await Promise.all([
        this.getRetailFinancialSummary(organizationId, filters),
        this.getRetailFinancialSummary(organizationId, { ...filters, dateRange: previousMonth }),
        CustomerFinancialManager.getCustomersWithBalances(organizationId),
        CostAnalytics.getSupplierPaymentSummary(organizationId),
        this.getCurrentCashPosition(organizationId)
      ])

      // Calculate growth rates
      const revenueGrowth = previousSummary.sales.totalRevenue > 0 ?
        ((currentSummary.sales.totalRevenue - previousSummary.sales.totalRevenue) / previousSummary.sales.totalRevenue) * 100 : 0

      const profitGrowth = previousSummary.profitability.grossProfit > 0 ?
        ((currentSummary.profitability.grossProfit - previousSummary.profitability.grossProfit) / previousSummary.profitability.grossProfit) * 100 : 0

      return {
        revenue: {
          current: currentSummary.sales.totalRevenue,
          growth: revenueGrowth,
          trend: revenueGrowth > 0 ? 'UP' : revenueGrowth < 0 ? 'DOWN' : 'STABLE'
        },
        profit: {
          current: currentSummary.profitability.grossProfit,
          margin: currentSummary.profitability.grossMargin,
          growth: profitGrowth,
          trend: profitGrowth > 0 ? 'UP' : profitGrowth < 0 ? 'DOWN' : 'STABLE'
        },
        cashFlow: {
          current: cashPosition,
          netFlow: currentSummary.cashFlow.netCashFlow,
          projected: currentSummary.cashFlow.projectedCashFlow,
          trend: currentSummary.cashFlow.netCashFlow > 0 ? 'POSITIVE' : 'NEGATIVE'
        },
        receivables: {
          total: currentSummary.customerFinances.totalReceivables,
          overdue: currentSummary.customerFinances.overdueReceivables,
          overduePercentage: currentSummary.customerFinances.totalReceivables > 0 ?
            (currentSummary.customerFinances.overdueReceivables / currentSummary.customerFinances.totalReceivables) * 100 : 0
        },
        payables: {
          total: supplierPayments.totalPayables,
          overdue: supplierPayments.overduePayables,
          upcomingInWeek: supplierPayments.upcomingPayments.filter(p =>
            differenceInDays(p.dueDate, new Date()) <= 7
          ).length
        }
      }

    } catch (error) {
      console.error('Error getting financial KPIs:', error)
      throw error
    }
  }

  /**
   * Format period label for display
   */
  private static formatPeriodLabel(startDate: Date, endDate: Date): string {
    const start = format(startDate, 'MMM dd, yyyy')
    const end = format(endDate, 'MMM dd, yyyy')

    if (start === end) {
      return start
    }

    return `${start} - ${end}`
  }
}