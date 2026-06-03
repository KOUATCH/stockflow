"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { financialAction } from "@/lib/error-handling"
import type { ServerActionResult } from "@/lib/error-handling/types"

export interface CreatePayableData {
  invoiceNumber: string
  supplierInvoiceNumber?: string
  supplierId: string
  purchaseOrderId?: string
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

export interface UpdatePayableData extends Partial<CreatePayableData> {
  id: string
  status?: "PENDING" | "APPROVED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "DISPUTED" | "CANCELLED"
}

export interface PayablePaymentData {
  payableId: string
  amount: number
  paymentDate?: Date
  paymentMethod: "CASH" | "DIGITAL" | "CARD"
  checkNumber?: string
  referenceNumber?: string
  notes?: string
  discountTaken?: number
  organizationId: string
}

export const createAccountsPayable = financialAction(
  async (data: CreatePayableData): Promise<ServerActionResult<any>> => {
    const totalAmount = data.amount + (data.taxAmount || 0) - (data.discountAmount || 0)

    const payable = await db.accountsPayable.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        supplierInvoiceNumber: data.supplierInvoiceNumber,
        supplierId: data.supplierId,
        purchaseOrderId: data.purchaseOrderId,
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
      },
      include: {
        supplier: true,
        purchaseOrder: true,
      },
    })

    revalidatePath("/dashboard/finance")
    return { success: true, data: payable }
  },
  {
    actionName: 'createAccountsPayable',
    component: 'AccountsPayableForm',
    businessContext: {
      domain: 'financial',
      operation: 'create',
      resourceType: 'accountsPayable',
      criticalOperation: true
    }
  }
)

export const getAccountsPayable = financialAction(
  async (params: { organizationId: string; filters?: {
    status?: string
    supplierId?: string
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

    if (filters?.supplierId) {
      where.supplierId = filters.supplierId
    }

    if (filters?.overdue) {
      where.dueDate = { lt: new Date() }
      where.status = { in: ["PENDING", "APPROVED", "PARTIALLY_PAID"] }
    }

    const [payables, totalCount] = await Promise.all([
      db.accountsPayable.findMany({
        where,
        include: {
          supplier: true,
          purchaseOrder: true,
          payments: true,
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      db.accountsPayable.count({ where }),
    ])

    return {
      success: true,
      data: {
        payables,
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
    actionName: 'getAccountsPayable',
    component: 'AccountsPayableList',
    businessContext: {
      domain: 'financial',
      operation: 'read',
      resourceType: 'accountsPayable',
      criticalOperation: true
    }
  }
)

export const validatePayablePayment = financialAction(
  async (data: PayablePaymentData): Promise<ServerActionResult<{ isValid: boolean; payable?: any; error?: string }>> => {
    console.log("Validating payable payment:", {
      payableId: data.payableId,
      amount: data.amount,
      organizationId: data.organizationId
    })

    if (data.amount <= 0) {
      return { success: true, data: { isValid: false, error: "Payment amount must be greater than zero" } }
    }

    const payable = await db.accountsPayable.findUnique({
      where: { id: data.payableId, organizationId: data.organizationId },
    })

    if (!payable) {
      console.error("Payable not found:", {
        payableId: data.payableId,
        organizationId: data.organizationId
      })
      return { success: true, data: { isValid: false, error: "Payable not found or access denied" } }
    }

    console.log("Found payable:", {
      id: payable.id,
      status: payable.status,
      outstandingAmount: payable.outstandingAmount,
      totalAmount: payable.totalAmount
    })

    if (payable.status === "PAID") {
      return { success: true, data: { isValid: false, error: "Payable is already fully paid" } }
    }

    if (payable.status === "CANCELLED") {
      return { success: true, data: { isValid: false, error: "Cannot make payment on cancelled payable" } }
    }

    if (data.amount > payable.outstandingAmount) {
      return { success: true, data: { isValid: false, error: "Payment amount exceeds outstanding balance" } }
    }

    if (data.discountTaken && data.discountTaken > payable.discountAmount) {
      return { success: true, data: { isValid: false, error: "Discount taken exceeds available discount" } }
    }

    const totalPayment = data.amount + (data.discountTaken || 0)
    if (totalPayment > payable.outstandingAmount) {
      return { success: true, data: { isValid: false, error: "Total payment (amount + discount) exceeds outstanding balance" } }
    }

    return { success: true, data: { isValid: true, payable } }
  },
  {
    actionName: 'validatePayablePayment',
    component: 'PaymentValidation',
    businessContext: {
      domain: 'financial',
      operation: 'validate',
      resourceType: 'payablePayment',
      criticalOperation: true
    }
  }
)

export const recordPayablePayment = financialAction(
  async (data: PayablePaymentData): Promise<ServerActionResult<any>> => {
    const validation = await validatePayablePayment(data)
    if (!validation.success || !validation.data?.isValid) {
      return { success: false, error: {
        id: 'VALIDATION_FAILED',
        code: 'VALIDATION_ERROR',
        message: validation.data?.error || 'Validation failed',
        userMessage: validation.data?.error || 'Payment validation failed',
        category: 'validation' as any,
        severity: 'medium' as any,
        recoverable: true,
        retryable: false
      }}
    }

    const payable = validation.data!.payable!

    // Generate unique payment number
    const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

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
      const payment = await tx.payablePayment.create({
        data: {
          payableId: data.payableId,
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

      // Update payable amounts and status
      const newPaidAmount = payable.paidAmount + data.amount + (data.discountTaken || 0)
      const newOutstandingAmount = payable.totalAmount - newPaidAmount

      let newStatus = payable.status
      if (newOutstandingAmount <= 0) {
        newStatus = "PAID"
      } else if (newPaidAmount > 0) {
        newStatus = "PARTIALLY_PAID"
      }

      const updatedPayable = await tx.accountsPayable.update({
        where: { id: data.payableId },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: Math.max(0, newOutstandingAmount),
          status: newStatus,
        },
        include: {
          supplier: true,
          payments: true,
        },
      })

      return { payment, payable: updatedPayable }
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
      type: 'payable' as const,
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
        invoiceNumber: result.payable.invoiceNumber,
        totalAmount: result.payable.totalAmount,
        outstandingAmount: payable.outstandingAmount
      },
      payer: {
        name: result.payable.supplier.name,
        email: result.payable.supplier.email,
        phone: result.payable.supplier.phone,
        address: result.payable.supplier.address
      }
    }

    return { success: true, data: { result, receiptData } }
  },
  {
    actionName: 'recordPayablePayment',
    component: 'PaymentForm',
    businessContext: {
      domain: 'financial',
      operation: 'create',
      resourceType: 'payablePayment',
      criticalOperation: true
    }
  }
)

export const updateAccountsPayable = financialAction(
  async (data: UpdatePayableData): Promise<ServerActionResult<any>> => {
    const { id, ...updateData } = data

    let totalAmount = updateData.amount
    if (updateData.amount !== undefined) {
      totalAmount = updateData.amount + (updateData.taxAmount || 0) - (updateData.discountAmount || 0)
      updateData.totalAmount = totalAmount

      // Update outstanding amount if total changed
      const currentPayable = await db.accountsPayable.findUnique({
        where: { id },
      })

      if (currentPayable) {
        updateData.outstandingAmount = totalAmount - currentPayable.paidAmount
      }
    }

    const payable = await db.accountsPayable.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        purchaseOrder: true,
        payments: true,
      },
    })

    revalidatePath("/dashboard/finance")
    return { success: true, data: payable }
  },
  {
    actionName: 'updateAccountsPayable',
    component: 'AccountsPayableEditForm',
    businessContext: {
      domain: 'financial',
      operation: 'update',
      resourceType: 'accountsPayable',
      criticalOperation: true
    }
  }
)

export const deleteAccountsPayable = financialAction(
  async (params: { id: string }): Promise<ServerActionResult<any>> => {
    const { id } = params
    await db.accountsPayable.delete({
      where: { id },
    })

    revalidatePath("/dashboard/finance")
    return { success: true, data: { deleted: true } }
  },
  {
    actionName: 'deleteAccountsPayable',
    component: 'AccountsPayableDeleteDialog',
    businessContext: {
      domain: 'financial',
      operation: 'delete',
      resourceType: 'accountsPayable',
      criticalOperation: true
    }
  }
)

export async function getPayablePaymentHistory(payableId: string, organizationId: string) {
  try {
    const payments = await db.payablePayment.findMany({
      where: {
        payableId,
        organizationId,
      },
      include: {
        payable: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    })

    return { success: true, data: payments }
  } catch (error) {
    console.error("Error fetching payable payment history:", error)
    return { success: false, error: "Failed to fetch payment history" }
  }
}

export async function getAllPaymentHistory(organizationId: string, filters?: {
  supplierId?: string
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

    if (filters?.supplierId) {
      where.payable = { supplierId: filters.supplierId }
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
      db.payablePayment.findMany({
        where,
        include: {
          payable: {
            include: {
              supplier: true,
            },
          },
        },
        orderBy: { paymentDate: 'desc' },
        skip,
        take: limit,
      }),
      db.payablePayment.count({ where }),
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
    console.error("Error fetching all payment history:", error)
    return { success: false, error: "Failed to fetch payment history" }
  }
}

export async function cancelPayablePayment(paymentId: string, organizationId: string, reason?: string) {
  try {
    const payment = await db.payablePayment.findUnique({
      where: { id: paymentId, organizationId },
      include: { payable: true },
    })

    if (!payment) {
      return { success: false, error: "Payment not found" }
    }

    const result = await db.$transaction(async (tx) => {
      // Update payment status
      const cancelledPayment = await tx.payablePayment.update({
        where: { id: paymentId },
        data: {
          notes: reason ? `CANCELLED: ${reason}` : `CANCELLED on ${new Date().toISOString()}`,
        },
      })

      // Reverse the payment amounts on the payable
      const newPaidAmount = Math.max(0, payment.payable.paidAmount - payment.amount - (payment.discountTaken || 0))
      const newOutstandingAmount = payment.payable.totalAmount - newPaidAmount

      let newStatus = payment.payable.status
      if (newOutstandingAmount >= payment.payable.totalAmount) {
        newStatus = "PENDING"
      } else if (newOutstandingAmount > 0) {
        newStatus = "PARTIALLY_PAID"
      }

      const updatedPayable = await tx.accountsPayable.update({
        where: { id: payment.payableId },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: newOutstandingAmount,
          status: newStatus,
        },
        include: {
          supplier: true,
          payments: true,
        },
      })

      // Create a reversal record
      await tx.payablePayment.create({
        data: {
          payableId: payment.payableId,
          paymentNumber: `REV-${payment.paymentNumber}`,
          amount: -payment.amount,
          paymentDate: new Date(),
          paymentMethod: payment.paymentMethod,
          notes: `Reversal of payment ${payment.paymentNumber}${reason ? ` - ${reason}` : ''}`,
          discountTaken: -(payment.discountTaken || 0),
          organizationId,
        },
      })

      return { payment: cancelledPayment, payable: updatedPayable }
    })

    revalidatePath("/dashboard/finance")
    return { success: true, data: result }
  } catch (error) {
    console.error("Error cancelling payable payment:", error)
    return { success: false, error: "Failed to cancel payment" }
  }
}

export interface BulkPayablePaymentData {
  payableIds: string[]
  paymentDate?: Date
  paymentMethod: "CASH" | "DIGITAL" | "CARD"
  referenceNumber?: string
  notes?: string
  organizationId: string
}

export async function processBulkPayablePayments(data: BulkPayablePaymentData) {
  try {
    const payables = await db.accountsPayable.findMany({
      where: {
        id: { in: data.payableIds },
        organizationId: data.organizationId,
        status: { in: ["PENDING", "APPROVED", "PARTIALLY_PAID"] },
      },
    })

    if (payables.length === 0) {
      return { success: false, error: "No valid payables found" }
    }

    const results = await db.$transaction(async (tx) => {
      const paymentResults = []

      for (const payable of payables) {
        if (payable.outstandingAmount <= 0) continue

        const paymentAmount = payable.outstandingAmount
        const paymentNumber = `BULK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

        // Create payment record
        const payment = await tx.payablePayment.create({
          data: {
            payableId: payable.id,
            paymentNumber,
            amount: paymentAmount,
            paymentDate: data.paymentDate || new Date(),
            paymentMethod: data.paymentMethod,
            referenceNumber: data.referenceNumber,
            notes: data.notes ? `BULK PAYMENT: ${data.notes}` : "BULK PAYMENT",
            organizationId: data.organizationId,
          },
        })

        // Update payable
        const updatedPayable = await tx.accountsPayable.update({
          where: { id: payable.id },
          data: {
            paidAmount: payable.paidAmount + paymentAmount,
            outstandingAmount: 0,
            status: "PAID",
          },
        })

        paymentResults.push({ payment, payable: updatedPayable })
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
    console.error("Error processing bulk payable payments:", error)
    return { success: false, error: "Failed to process bulk payments" }
  }
}

export const getPayableSummary = financialAction(
  async (params: { organizationId: string }): Promise<ServerActionResult<any>> => {
    const { organizationId } = params
    const summary = await db.accountsPayable.aggregate({
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

    const overdueSummary = await db.accountsPayable.aggregate({
      where: {
        organizationId,
        dueDate: { lt: new Date() },
        status: { in: ["PENDING", "APPROVED", "PARTIALLY_PAID"] },
      },
      _sum: {
        outstandingAmount: true,
      },
      _count: {
        id: true,
      },
    })

    const dueSoonSummary = await db.accountsPayable.aggregate({
      where: {
        organizationId,
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        status: { in: ["PENDING", "APPROVED", "PARTIALLY_PAID"] },
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
      FROM "accounts_payable"
      WHERE "organizationId" = ${organizationId}
        AND status IN ('PENDING', 'APPROVED', 'PARTIALLY_PAID')
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
    actionName: 'getPayableSummary',
    component: 'PayableSummaryDashboard',
    businessContext: {
      domain: 'financial',
      operation: 'read',
      resourceType: 'payableSummary',
      criticalOperation: true
    }
  }
)