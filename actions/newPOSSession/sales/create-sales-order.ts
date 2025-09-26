"use server"

import { db } from "@/lib/db"
import {
  type SalesOrder,
  type Payment,
  type SalesOrderLineItem,
  PaymentMethod,
  PaymentStatus,
  SalesOrderStatus,
} from "@/lib/types"

export async function createSalesOrder(data: {
  organizationId: string
  locationId: string
  customerId?: string
  userId: string
  terminalId: string
  sessionId: string
  lineItems: Array<{
    itemId: string
    quantity: number
    unitPrice: number
    discount?: number
    taxAmount?: number
  }>
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  notes?: string
}): Promise<{ success: boolean; salesOrder?: SalesOrder; error?: string }> {
  try {
    // Generate unique order number
    const orderNumber = `SO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create sales order
    const salesOrder: SalesOrder = {
      id: `so_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderNumber,
      organizationId: data.organizationId,
      locationId: data.locationId,
      customerId: data.customerId,
      userId: data.userId,
      terminalId: data.terminalId,
      sessionId: data.sessionId,
      status: SalesOrderStatus.COMPLETED,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      discountAmount: data.discountAmount,
      total: data.total,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Create line items
    const lineItems: SalesOrderLineItem[] = data.lineItems.map((item, index) => ({
      id: `soli_${Date.now()}_${index}`,
      salesOrderId: salesOrder.id,
      itemId: item.itemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      taxAmount: item.taxAmount || 0,
      total: item.quantity * item.unitPrice - (item.discount || 0) + (item.taxAmount || 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    // Add to mock database
    db.salesOrders.push(salesOrder)
    db.salesOrderLineItems.push(...lineItems)

    return { success: true, salesOrder }
  } catch (error) {
    console.error("Error creating sales order:", error)
    return { success: false, error: "Failed to create sales order" }
  }
}

export async function createPayment(data: {
  salesOrderId: string
  organizationId: string
  locationId: string
  userId: string
  sessionId: string
  method: PaymentMethod
  amount: number
  reference?: string
  notes?: string
}): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  try {
    const payment: Payment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      salesOrderId: data.salesOrderId,
      organizationId: data.organizationId,
      locationId: data.locationId,
      userId: data.userId,
      sessionId: data.sessionId,
      method: data.method,
      amount: data.amount,
      status: PaymentStatus.COMPLETED,
      reference: data.reference,
      notes: data.notes,
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add to mock database
    db.payments.push(payment)

    // If cash payment, update cash drawer balance
    if (data.method === PaymentMethod.CASH) {
      const session = db.posSessions.find((s) => s.id === data.sessionId)
      if (session && session.cashDrawer) {
        session.cashDrawer.currentBalance += data.amount
        session.cashDrawer.expectedBalance += data.amount

        // Add cash transaction
        const cashTransaction = {
          id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          cashDrawerId: session.cashDrawer.id,
          sessionId: data.sessionId,
          userId: data.userId,
          type: "SALE" as const,
          amount: data.amount,
          reason: `Sale payment - Order ${data.salesOrderId}`,
          createdAt: new Date(),
        }

        db.cashTransactions.push(cashTransaction)
      }
    }

    return { success: true, payment }
  } catch (error) {
    console.error("Error creating payment:", error)
    return { success: false, error: "Failed to create payment" }
  }
}
