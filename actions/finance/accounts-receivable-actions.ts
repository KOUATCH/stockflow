"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { financialAction } from "@/lib/error-handling"
import type { ServerActionResult } from "@/lib/error-handling/types"

export interface CreateReceivableData {
  invoiceNumber: string
  customerId: string
  salesOrderId?: string
  amount: number
  dueDate: Date
  invoiceDate?: Date
  paymentTerms?: number
  discountTerms?: string
  discountAmount?: number
  taxAmount?: number
  description?: string
  notes?: string
  organizationId: string
  locationId?: string
}

export interface UpdateReceivableData extends Partial<CreateReceivableData> {
  id: string
  status?: "PENDING" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "DISPUTED" | "WRITTEN_OFF"
  outstandingAmount?: number
}

export interface ReceivablePaymentData {
  receivableId: string
  amount: number
  paymentDate?: Date
  paymentMethod: "CASH" | "DIGITAL" | "CARD"
  checkNumber?: string
  referenceNumber?: string
  notes?: string
  discountTaken?: number
  organizationId: string
}

export const createAccountsReceivable = financialAction(
  async (data: CreateReceivableData): Promise<ServerActionResult<any>> => {
    const totalAmount = data.amount + (data.taxAmount || 0) - (data.discountAmount || 0)

    const receivable = await db.accountsReceivable.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        customerId: data.customerId,
        salesOrderId: data.salesOrderId,
        amount: data.amount,
        dueDate: data.dueDate,
        invoiceDate: data.invoiceDate || new Date(),
        paymentTerms: data.paymentTerms || 30,
        discountTerms: data.discountTerms,
        discountAmount: data.discountAmount || 0,
        taxAmount: data.taxAmount || 0,
        totalAmount,
        outstandingAmount: totalAmount,
        description: data.description,
        notes: data.notes,
        organizationId: data.organizationId,
        locationId: data.locationId,
        status: "PENDING"
      },
      include: {
        customer: true,
        salesOrder: true,
      },
    })

    revalidatePath("/dashboard/finance")
    return { success: true, data: receivable }
  },
  {
    actionName: 'createAccountsReceivable',
    component: 'AccountsReceivableForm',
    businessContext: {
      domain: 'financial',
      operation: 'create',
      resourceType: 'accountsReceivable',
      criticalOperation: true
    }
  }
)

export const getAccountsReceivable = financialAction(
  async (params: { organizationId: string; filters?: {
    status?: string
    customerId?: string
    overdue?: boolean
    page?: number
    limit?: number
  } }): Promise<ServerActionResult<any>> => {
    const { organizationId, filters } = params
    const page = filters?.page || 1
    const limit = filters?.limit || 50
    const skip = (page - 1) * limit

    const where: any = { organizationId }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId
    }

    if (filters?.overdue) {
      where.dueDate = { lt: new Date() }
      where.status = { in: ["PENDING", "SENT", "PARTIALLY_PAID"] }
    }

    const [receivables, totalCount] = await Promise.all([
      db.accountsReceivable.findMany({
        where,
        include: {
          customer: true,
          salesOrder: true,
          payments: true,
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      db.accountsReceivable.count({ where }),
    ])

    return {
      success: true,
      data: {
        receivables,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        }
      }
    }
  },
  {
    actionName: 'getAccountsReceivable',
    component: 'AccountsReceivableList',
    businessContext: {
      domain: 'financial',
      operation: 'read',
      resourceType: 'accountsReceivable',
      criticalOperation: true
    }
  }
)

export async function validateReceivablePayment(data: ReceivablePaymentData) {
  try {
    console.log("Validating receivable payment:", {
      receivableId: data.receivableId,
      amount: data.amount,
      organizationId: data.organizationId
    })

    if (data.amount <= 0) {
      return { isValid: false, error: "Payment amount must be greater than zero" }
    }

    const receivable = await db.accountsReceivable.findUnique({
      where: { id: data.receivableId, organizationId: data.organizationId },
    })

    if (!receivable) {
      console.error("Receivable not found:", {
        receivableId: data.receivableId,
        organizationId: data.organizationId
      })
      return { isValid: false, error: "Receivable not found or access denied" }
    }

    console.log("Found receivable:", {
      id: receivable.id,
      status: receivable.status,
      outstandingAmount: receivable.outstandingAmount,
      totalAmount: receivable.totalAmount
    })

    if (receivable.status === "PAID") {
      return { isValid: false, error: "Receivable is already fully paid" }
    }

    if (receivable.status === "WRITTEN_OFF") {
      return { isValid: false, error: "Cannot make payment on written-off receivable" }
    }

    if (data.amount > receivable.outstandingAmount) {
      return { isValid: false, error: "Payment amount exceeds outstanding balance" }
    }

    if (data.discountTaken && data.discountTaken > receivable.discountAmount) {
      return { isValid: false, error: "Discount taken exceeds available discount" }
    }

    const totalPayment = data.amount + (data.discountTaken || 0)
    if (totalPayment > receivable.outstandingAmount) {
      return { isValid: false, error: "Total payment (amount + discount) exceeds outstanding balance" }
    }

    return { isValid: true, receivable }
  } catch (error) {
    console.error("Error validating receivable payment:", error)
    return { isValid: false, error: `Payment validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function recordReceivablePayment(data: ReceivablePaymentData) {
  try {
    const validation = await validateReceivablePayment(data)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const receivable = validation.receivable!

    // Generate unique payment number
    const paymentNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Get organization details for receipt
    const organization = await db.organization.findUnique({
      where: { id: data.organizationId },
      select: {
        name: true,
        address: true,
        country: true,
        state: true
      }
    })

    const result = await db.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.receivablePayment.create({
        data: {
          receivableId: data.receivableId,
          paymentNumber,
          amount: data.amount,
          paymentDate: data.paymentDate || new Date(),
          paymentMethod: data.paymentMethod,
          checkNumber: data.checkNumber,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
          discountTaken: data.discountTaken || 0,
          organizationId: data.organizationId,
        },
      })

      // Update receivable amounts and status
      const newPaidAmount = receivable.paidAmount + data.amount + (data.discountTaken || 0)
      const newOutstandingAmount = receivable.totalAmount - newPaidAmount

      let newStatus = receivable.status
      if (newOutstandingAmount <= 0) {
        newStatus = "PAID"
      } else if (newPaidAmount > 0) {
        newStatus = "PARTIALLY_PAID"
      }

      const updatedReceivable = await tx.accountsReceivable.update({
        where: { id: data.receivableId },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: Math.max(0, newOutstandingAmount),
          status: newStatus,
        },
        include: {
          customer: true,
          payments: true,
        },
      })

      return { payment, receivable: updatedReceivable }
    })

    revalidatePath("/dashboard/finance")

    // Generate receipt data for the payment
    const receiptData = {
      id: result.payment.id,
      paymentNumber: result.payment.paymentNumber,
      paymentDate: result.payment.paymentDate,
      amount: result.payment.amount,
      paymentMethod: result.payment.paymentMethod,
      referenceNumber: result.payment.referenceNumber,
      notes: result.payment.notes,
      discountTaken: result.payment.discountTaken,
      type: 'receivable' as const,
      organization: organization ? {
        name: organization.name,
        address: organization.address
          ? `${organization.address}${organization.state ? `, ${organization.state}` : ''}${organization.country ? `, ${organization.country}` : ''}`
          : undefined,
        phone: undefined,
        email: undefined,
        website: undefined
      } : {
        name: "Organization",
        address: undefined,
        phone: undefined,
        email: undefined,
        website: undefined
      },
      invoice: {
        invoiceNumber: result.receivable.invoiceNumber,
        totalAmount: result.receivable.totalAmount,
        outstandingAmount: receivable.outstandingAmount
      },
      payer: {
        name: result.receivable.customer.name,
        email: result.receivable.customer.email,
        phone: result.receivable.customer.phone,
        address: result.receivable.customer.address
      }
    }

    return { success: true, data: result, receiptData }
  } catch (error) {
    console.error("Error recording receivable payment:", error)
    return { success: false, error: "Failed to record payment" }
  }
}

export const updateAccountsReceivable = financialAction(
  async (data: UpdateReceivableData): Promise<ServerActionResult<any>> => {
    const { id, ...updateData } = data

    let totalAmount = updateData.amount
    if (updateData.amount !== undefined) {
      totalAmount = updateData.amount + (updateData.taxAmount || 0) - (updateData.discountAmount || 0)
      updateData.amount = totalAmount

      // Update outstanding amount if total changed
      const currentReceivable = await db.accountsReceivable.findUnique({
        where: { id },
      })

      if (currentReceivable) {
        updateData.outstandingAmount = totalAmount - currentReceivable.paidAmount
      }
    }

    const receivable = await db.accountsReceivable.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        salesOrder: true,
        payments: true,
      },
    })

    revalidatePath("/dashboard/finance")
    return { success: true, data: receivable }
  },
  {
    actionName: 'updateAccountsReceivable',
    component: 'AccountsReceivableEditForm',
    businessContext: {
      domain: 'financial',
      operation: 'update',
      resourceType: 'accountsReceivable',
      criticalOperation: true
    }
  }
)

export async function sendInvoiceReminder(receivableId: string) {
  try {
    const receivable = await db.accountsReceivable.update({
      where: { id: receivableId },
      data: {
        remindersSent: { increment: 1 },
        lastReminderDate: new Date(),
        status: "SENT"
      },
      include: {
        customer: true,
      },
    })

    // Here you would typically integrate with email service
    // For now, we'll just update the database

    revalidatePath("/dashboard/finance")
    return { success: true, data: receivable }
  } catch (error) {
    console.error("Error sending invoice reminder:", error)
    return { success: false, error: "Failed to send reminder" }
  }
}

export const writeOffReceivable = financialAction(
  async (params: { receivableId: string; reason?: string }): Promise<ServerActionResult<any>> => {
    const { receivableId, reason } = params
    const receivable = await db.accountsReceivable.update({
      where: { id: receivableId },
      data: {
        status: "WRITTEN_OFF",
        notes: reason ? `${reason} - Written off on ${new Date().toISOString()}` : `Written off on ${new Date().toISOString()}`
      },
      include: {
        customer: true,
      },
    })

    revalidatePath("/dashboard/finance")
    return { success: true, data: receivable }
  },
  {
    actionName: 'writeOffReceivable',
    component: 'WriteOffDialog',
    businessContext: {
      domain: 'financial',
      operation: 'update',
      resourceType: 'accountsReceivable',
      criticalOperation: true
    }
  }
)

export const deleteAccountsReceivable = financialAction(
  async (params: { id: string }): Promise<ServerActionResult<any>> => {
    const { id } = params
    await db.accountsReceivable.delete({
      where: { id },
    })

    revalidatePath("/dashboard/finance")
    return { success: true, data: { deleted: true } }
  },
  {
    actionName: 'deleteAccountsReceivable',
    component: 'AccountsReceivableDeleteDialog',
    businessContext: {
      domain: 'financial',
      operation: 'delete',
      resourceType: 'accountsReceivable',
      criticalOperation: true
    }
  }
)

export async function getReceivablePaymentHistory(receivableId: string, organizationId: string) {
  try {
    const payments = await db.receivablePayment.findMany({
      where: {
        receivableId,
        organizationId,
      },
      include: {
        receivable: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    })

    return { success: true, data: payments }
  } catch (error) {
    console.error("Error fetching receivable payment history:", error)
    return { success: false, error: "Failed to fetch payment history" }
  }
}

export async function getAllReceivablePaymentHistory(organizationId: string, filters?: {
  customerId?: string
  paymentMethod?: string
  startDate?: Date
  endDate?: Date
  page?: number
  limit?: number
}) {
  try {
    const page = filters?.page || 1
    const limit = filters?.limit || 50
    const skip = (page - 1) * limit

    const where: any = { organizationId }

    if (filters?.customerId) {
      where.receivable = { customerId: filters.customerId }
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod
    }

    if (filters?.startDate || filters?.endDate) {
      where.paymentDate = {}
      if (filters.startDate) where.paymentDate.gte = filters.startDate
      if (filters.endDate) where.paymentDate.lte = filters.endDate
    }

    const [payments, totalCount] = await Promise.all([
      db.receivablePayment.findMany({
        where,
        include: {
          receivable: {
            include: {
              customer: true,
            },
          },
        },
        orderBy: { paymentDate: 'desc' },
        skip,
        take: limit,
      }),
      db.receivablePayment.count({ where }),
    ])

    return {
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching all receivable payment history:", error)
    return { success: false, error: "Failed to fetch payment history" }
  }
}

export async function cancelReceivablePayment(paymentId: string, organizationId: string, reason?: string) {
  try {
    const payment = await db.receivablePayment.findUnique({
      where: { id: paymentId, organizationId },
      include: { receivable: true },
    })

    if (!payment) {
      return { success: false, error: "Payment not found" }
    }

    const result = await db.$transaction(async (tx) => {
      // Update payment status
      const cancelledPayment = await tx.receivablePayment.update({
        where: { id: paymentId },
        data: {
          notes: reason ? `CANCELLED: ${reason}` : `CANCELLED on ${new Date().toISOString()}`,
        },
      })

      // Reverse the payment amounts on the receivable
      const newPaidAmount = Math.max(0, payment.receivable.paidAmount - payment.amount - (payment.discountTaken || 0))
      const newOutstandingAmount = payment.receivable.totalAmount - newPaidAmount

      let newStatus = payment.receivable.status
      if (newOutstandingAmount >= payment.receivable.totalAmount) {
        newStatus = "PENDING"
      } else if (newOutstandingAmount > 0) {
        newStatus = "PARTIALLY_PAID"
      }

      const updatedReceivable = await tx.accountsReceivable.update({
        where: { id: payment.receivableId },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: newOutstandingAmount,
          status: newStatus,
        },
        include: {
          customer: true,
          payments: true,
        },
      })

      // Create a reversal record
      await tx.receivablePayment.create({
        data: {
          receivableId: payment.receivableId,
          paymentNumber: `REV-${payment.paymentNumber}`,
          amount: -payment.amount,
          paymentDate: new Date(),
          paymentMethod: payment.paymentMethod,
          notes: `Reversal of payment ${payment.paymentNumber}${reason ? ` - ${reason}` : ''}`,
          discountTaken: -(payment.discountTaken || 0),
          organizationId,
        },
      })

      return { payment: cancelledPayment, receivable: updatedReceivable }
    })

    revalidatePath("/dashboard/finance")
    return { success: true, data: result }
  } catch (error) {
    console.error("Error cancelling receivable payment:", error)
    return { success: false, error: "Failed to cancel payment" }
  }
}

export interface BulkReceivablePaymentData {
  receivableIds: string[]
  paymentDate?: Date
  paymentMethod: "CASH" | "DIGITAL" | "CARD"
  referenceNumber?: string
  notes?: string
  organizationId: string
}

export async function processBulkReceivablePayments(data: BulkReceivablePaymentData) {
  try {
    const receivables = await db.accountsReceivable.findMany({
      where: {
        id: { in: data.receivableIds },
        organizationId: data.organizationId,
        status: { in: ["PENDING", "SENT", "PARTIALLY_PAID"] },
      },
    })

    if (receivables.length === 0) {
      return { success: false, error: "No valid receivables found" }
    }

    const results = await db.$transaction(async (tx) => {
      const paymentResults = []

      for (const receivable of receivables) {
        if (receivable.outstandingAmount <= 0) continue

        const paymentAmount = receivable.outstandingAmount
        const paymentNumber = `BULK-REC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

        // Create payment record
        const payment = await tx.receivablePayment.create({
          data: {
            receivableId: receivable.id,
            paymentNumber,
            amount: paymentAmount,
            paymentDate: data.paymentDate || new Date(),
            paymentMethod: data.paymentMethod,
            referenceNumber: data.referenceNumber,
            notes: data.notes ? `BULK PAYMENT: ${data.notes}` : "BULK PAYMENT",
            organizationId: data.organizationId,
          },
        })

        // Update receivable
        const updatedReceivable = await tx.accountsReceivable.update({
          where: { id: receivable.id },
          data: {
            paidAmount: receivable.paidAmount + paymentAmount,
            outstandingAmount: 0,
            status: "PAID",
          },
        })

        paymentResults.push({ payment, receivable: updatedReceivable })
      }

      return paymentResults
    })

    revalidatePath("/dashboard/finance")
    return {
      success: true,
      data: {
        processedCount: results.length,
        totalAmount: results.reduce((sum, r) => sum + r.payment.amount, 0),
        payments: results,
      },
    }
  } catch (error) {
    console.error("Error processing bulk receivable payments:", error)
    return { success: false, error: "Failed to process bulk payments" }
  }
}

export const getReceivableSummary = financialAction(
  async (params: { organizationId: string }): Promise<ServerActionResult<any>> => {
    const { organizationId } = params
    const summary = await db.accountsReceivable.aggregate({
      where: { organizationId },
      _sum: {
        totalAmount: true,
        paidAmount: true,
        outstandingAmount: true,
      },
      _count: {
        id: true,
      },
    })

    const overdueSummary = await db.accountsReceivable.aggregate({
      where: {
        organizationId,
        dueDate: { lt: new Date() },
        status: { in: ["PENDING", "SENT", "PARTIALLY_PAID"] },
      },
      _sum: {
        outstandingAmount: true,
      },
      _count: {
        id: true,
      },
    })

    const dueSoonSummary = await db.accountsReceivable.aggregate({
      where: {
        organizationId,
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        status: { in: ["PENDING", "SENT", "PARTIALLY_PAID"] },
      },
      _sum: {
        outstandingAmount: true,
      },
      _count: {
        id: true,
      },
    })

    const agingSummary = await db.$queryRaw<{
      range: string
      amount: number
      count: number
    }[]>`
      SELECT
        CASE
          WHEN EXTRACT(days FROM NOW() - "dueDate") <= 0 THEN 'current'
          WHEN EXTRACT(days FROM NOW() - "dueDate") <= 30 THEN '1-30'
          WHEN EXTRACT(days FROM NOW() - "dueDate") <= 60 THEN '31-60'
          WHEN EXTRACT(days FROM NOW() - "dueDate") <= 90 THEN '61-90'
          ELSE '90+'
        END as range,
        COALESCE(SUM("outstandingAmount"), 0) as amount,
        COUNT(*) as count
      FROM "accounts_receivable"
      WHERE "organizationId" = ${organizationId}
        AND status IN ('PENDING', 'SENT', 'PARTIALLY_PAID')
      GROUP BY range
      ORDER BY
        CASE range
          WHEN 'current' THEN 1
          WHEN '1-30' THEN 2
          WHEN '31-60' THEN 3
          WHEN '61-90' THEN 4
          WHEN '90+' THEN 5
        END
    `

    return {
      success: true,
      data: {
        totalAmount: summary._sum.totalAmount || 0,
        paidAmount: summary._sum.paidAmount || 0,
        outstandingAmount: summary._sum.outstandingAmount || 0,
        totalCount: summary._count.id || 0,
        overdueAmount: overdueSummary._sum.outstandingAmount || 0,
        overdueCount: overdueSummary._count.id || 0,
        dueSoonAmount: dueSoonSummary._sum.outstandingAmount || 0,
        dueSoonCount: dueSoonSummary._count.id || 0,
        aging: agingSummary,
      }
    }
  },
  {
    actionName: 'getReceivableSummary',
    component: 'ReceivableSummaryDashboard',
    businessContext: {
      domain: 'financial',
      operation: 'read',
      resourceType: 'receivableSummary',
      criticalOperation: true
    }
  }
)