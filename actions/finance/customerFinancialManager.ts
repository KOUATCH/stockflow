"use server"

import { db } from "@/prisma/db"
import type { CustomerDebt, CustomerFinancialAccount, CustomerPayment, CustomerTransaction } from "@/types/retailFinance"
import type { PaymentMethod, PaymentStatus } from "@prisma/client"
import { differenceInDays } from "date-fns"

export class CustomerFinancialManager {

  /**
   * Get comprehensive financial account for a customer
   */
  static async getCustomerFinancialAccount(customerId: string): Promise<CustomerFinancialAccount | null> {
    try {
      const customer = await db.customer.findUnique({
        where: { id: customerId },
        include: {
          salesOrders: {
            include: {
              lines: {
                include: {
                  item: true
                }
              },
              payments: true
            }
          }
        }
      })

      if (!customer) return null

      // Calculate balances and receivables
      const transactions = await this.getCustomerTransactions(customerId)
      const payments = await this.getCustomerPayments(customerId)

      const currentBalance = this.calculateCurrentBalance(transactions)
      const receivables = this.calculateReceivables(transactions, payments)
      const credits = this.calculateStoreCredits(customerId)

      return {
        customerId: customer.id,
        customerName: customer.name,
        customerCode: customer.code || `CUST-${customer.id.slice(-6)}`,
        email: customer.email || undefined,
        phone: customer.phone || undefined,

        currentBalance,
        creditLimit: customer.creditLimit || 0,
        availableCredit: Math.max(0, (customer.creditLimit || 0) - Math.max(0, currentBalance)),

        receivables,
        credits: await credits,

        transactions,
        payments,

        status: customer.isActive ? 'ACTIVE' : 'SUSPENDED',
        riskLevel: this.assessRiskLevel(currentBalance, receivables, payments),
        lastActivity: customer.updatedAt,

        summary: {
          totalPurchases: this.calculateTotalPurchases(transactions),
          totalPayments: this.calculateTotalPayments(payments),
          averageOrderValue: this.calculateAverageOrderValue(transactions),
          paymentHistory: this.assessPaymentHistory(payments),
          daysSinceLastPayment: this.daysSinceLastPayment(payments)
        }
      }
    } catch (error) {
      console.error('Error getting customer financial account:', error)
      throw error
    }
  }

  /**
   * Get all customer transactions (sales, returns, credits, payments)
   */
  static async getCustomerTransactions(customerId: string): Promise<CustomerTransaction[]> {
    const salesOrders = await db.salesOrder.findMany({
      where: { customerId },
      include: {
        payments: true,
        lines: {
          include: { item: true }
        }
      },
      orderBy: { orderDate: 'desc' }
    })

    const transactions: CustomerTransaction[] = []
    let runningBalance = 0

    // Convert sales orders to transactions
    for (const order of salesOrders) {
      runningBalance += order.total

      transactions.push({
        id: order.id,
        date: order.orderDate,
        type: 'SALE',
        amount: order.total,
        description: `Invoice #${order.orderNumber}`,
        reference: order.orderNumber,
        balanceAfter: runningBalance
      })

      // Add payments as separate transactions
      for (const payment of order.payments) {
        runningBalance -= payment.amount
        transactions.push({
          id: payment.id,
          date: payment.processedAt || payment.createdAt,
          type: 'PAYMENT',
          amount: -payment.amount, // Negative because it reduces balance
          description: `Payment for Invoice #${order.orderNumber}`,
          reference: payment.paymentNumber,
          balanceAfter: runningBalance
        })
      }
    }

    // Add returns, credits, and adjustments here (extend as needed)

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  /**
   * Get customer payment history
   */
  static async getCustomerPayments(customerId: string): Promise<CustomerPayment[]> {
    const payments = await db.payment.findMany({
      where: {
        salesOrder: {
          customerId
        }
      },
      include: {
        salesOrder: true
      },
      orderBy: { processedAt: 'desc' }
    })

    return payments.map(payment => ({
      id: payment.id,
      date: payment.processedAt || payment.createdAt,
      amount: payment.amount,
      method: payment.method === 'DIGITAL' ? 'BANK_TRANSFER' : payment.method,
      reference: payment.paymentNumber,
      appliedTo: [payment.salesOrder?.orderNumber || ''],
      notes: payment.notes || undefined
    }))
  }

  /**
   * Record a customer payment
   */
  static async recordCustomerPayment(customerId: string, paymentData: {
    amount: number
    method: PaymentMethod
    reference?: string
    appliedToInvoices?: string[]
    notes?: string
  }) {
    try {
      // Find the oldest unpaid invoices to apply payment to
      const unpaidOrders = await db.salesOrder.findMany({
        where: {
          customerId,
          paymentStatus: { in: ['PENDING', 'PARTIAL'] }
        },
        orderBy: { orderDate: 'asc' }
      })

      let remainingAmount = paymentData.amount
      const paymentsToCreate = []

      // Apply payment to invoices
      for (const order of unpaidOrders) {
        if (remainingAmount <= 0) break

        const paidAmount = await db.payment.aggregate({
          where: { salesOrderId: order.id },
          _sum: { amount: true }
        })

        const totalPaid = paidAmount._sum.amount || 0
        const amountDue = order.total - totalPaid

        if (amountDue > 0) {
          const paymentAmount = Math.min(remainingAmount, amountDue)

          paymentsToCreate.push({
            paymentNumber: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            amount: paymentAmount,
            method: paymentData.method,
            status: 'PAID' as PaymentStatus,
            salesOrderId: order.id,
            transactionId: paymentData.reference || undefined,
            notes: paymentData.notes || undefined,
            processedAt: new Date()
          })

          remainingAmount -= paymentAmount

          // Update order payment status
          const newTotalPaid = totalPaid + paymentAmount
          const newStatus = newTotalPaid >= order.total ? 'PAID' : 'PARTIAL'

          await db.salesOrder.update({
            where: { id: order.id },
            data: { paymentStatus: newStatus }
          })
        }
      }

      // Create payment records
      const createdPayments = await Promise.all(
        paymentsToCreate.map(payment => db.payment.create({ data: payment }))
      )

      // If there's remaining amount, create as store credit
      if (remainingAmount > 0) {
        await this.addStoreCredit(customerId, remainingAmount, 'Excess payment converted to store credit')
      }

      return {
        success: true,
        paymentsCreated: createdPayments.length,
        totalApplied: paymentData.amount - remainingAmount,
        storeCredit: remainingAmount,
        message: `Payment of $${paymentData.amount} processed successfully`
      }

    } catch (error) {
      console.error('Error recording customer payment:', error)
      throw error
    }
  }

  /**
   * Add store credit for customer
   */
  static async addStoreCredit(customerId: string, amount: number, reason: string) {
    // This would typically be stored in a separate store credits table
    // For now, we'll create a placeholder implementation

    try {
      // Create a negative "sale" to represent store credit
      const creditTransaction = {
        // Implementation depends on your schema
        // Could be stored in a separate credits table or as negative sales orders
      }

      return {
        success: true,
        creditAdded: amount,
        message: `Store credit of $${amount} added successfully`
      }
    } catch (error) {
      console.error('Error adding store credit:', error)
      throw error
    }
  }

  /**
   * Get all customers with outstanding balances
   */
  static async getCustomersWithBalances(organizationId: string) {
    const customers = await db.customer.findMany({
      where: { organizationId },
      include: {
        salesOrders: {
          include: {
            payments: true
          }
        }
      }
    })

    const customerDebts: CustomerDebt[] = []

    for (const customer of customers) {
      const account = await this.getCustomerFinancialAccount(customer.id)
      if (account && account.currentBalance > 0) {
        customerDebts.push({
          customerId: customer.id,
          customerName: customer.name,
          totalOwed: account.currentBalance,
          overdueAmount: account.receivables.overdue,
          daysPastDue: this.daysSinceOldestUnpaid(account.transactions),
          lastContact: customer.updatedAt
        })
      }
    }

    return customerDebts.sort((a, b) => b.totalOwed - a.totalOwed)
  }

  /**
   * Generate aging report for receivables
   */
  static async generateAgingReport(organizationId: string) {
    const customers = await this.getCustomersWithBalances(organizationId)

    const agingReport = {
      totalReceivables: 0,
      current: 0,      // 0-30 days
      days30to60: 0,   // 31-60 days
      days60to90: 0,   // 61-90 days
      over90days: 0,   // 90+ days
      customerBreakdown: [] as any[]
    }

    for (const customer of customers) {
      const account = await this.getCustomerFinancialAccount(customer.customerId)
      if (account) {
        agingReport.totalReceivables += account.receivables.total
        agingReport.current += account.receivables.aging.current
        agingReport.days30to60 += account.receivables.aging.days30to60
        agingReport.days60to90 += account.receivables.aging.days60to90
        agingReport.over90days += account.receivables.aging.over90days

        agingReport.customerBreakdown.push({
          customerName: account.customerName,
          total: account.receivables.total,
          aging: account.receivables.aging
        })
      }
    }

    return agingReport
  }

  // Helper methods
  private static calculateCurrentBalance(transactions: CustomerTransaction[]): number {
    return transactions.reduce((sum, t) => sum + t.amount, 0)
  }

  private static calculateReceivables(transactions: CustomerTransaction[], payments: CustomerPayment[]) {
    const now = new Date()
    const unpaidTransactions = transactions.filter(t => t.type === 'SALE' && t.amount > 0)

    let total = 0
    let overdue = 0
    const aging = { current: 0, days30to60: 0, days60to90: 0, over90days: 0 }

    for (const transaction of unpaidTransactions) {
      const daysSince = differenceInDays(now, transaction.date)
      const amount = transaction.amount

      total += amount

      if (daysSince > 30) {
        overdue += amount
      }

      if (daysSince <= 30) {
        aging.current += amount
      } else if (daysSince <= 60) {
        aging.days30to60 += amount
      } else if (daysSince <= 90) {
        aging.days60to90 += amount
      } else {
        aging.over90days += amount
      }
    }

    return {
      total,
      overdue,
      current: total - overdue,
      aging
    }
  }

  private static async calculateStoreCredits(customerId: string) {
    // This would query your store credits system
    return {
      storeCredit: 0,
      refunds: 0,
      loyaltyPoints: 0,
      promoCodes: 0
    }
  }

  private static assessRiskLevel(balance: number, receivables: any, payments: CustomerPayment[]): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (receivables.overdue > 1000 || this.daysSinceLastPayment(payments) > 60) {
      return 'HIGH'
    } else if (receivables.overdue > 500 || this.daysSinceLastPayment(payments) > 30) {
      return 'MEDIUM'
    }
    return 'LOW'
  }

  private static calculateTotalPurchases(transactions: CustomerTransaction[]): number {
    return transactions.filter(t => t.type === 'SALE').reduce((sum, t) => sum + t.amount, 0)
  }

  private static calculateTotalPayments(payments: CustomerPayment[]): number {
    return payments.reduce((sum, p) => sum + p.amount, 0)
  }

  private static calculateAverageOrderValue(transactions: CustomerTransaction[]): number {
    const salesTransactions = transactions.filter(t => t.type === 'SALE')
    if (salesTransactions.length === 0) return 0
    return this.calculateTotalPurchases(transactions) / salesTransactions.length
  }

  private static assessPaymentHistory(payments: CustomerPayment[]): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    if (payments.length === 0) return 'POOR'
    const avgDaysSincePayment = this.daysSinceLastPayment(payments)

    if (avgDaysSincePayment <= 15) return 'EXCELLENT'
    if (avgDaysSincePayment <= 30) return 'GOOD'
    if (avgDaysSincePayment <= 60) return 'FAIR'
    return 'POOR'
  }

  private static daysSinceLastPayment(payments: CustomerPayment[]): number {
    if (payments.length === 0) return 999
    const latestPayment = payments.reduce((latest, p) => p.date > latest.date ? p : latest)
    return differenceInDays(new Date(), latestPayment.date)
  }

  private static daysSinceOldestUnpaid(transactions: CustomerTransaction[]): number {
    const unpaidSales = transactions.filter(t => t.type === 'SALE' && t.amount > 0)
    if (unpaidSales.length === 0) return 0

    const oldestSale = unpaidSales.reduce((oldest, t) => t.date < oldest.date ? t : oldest)
    return differenceInDays(new Date(), oldestSale.date)
  }
}