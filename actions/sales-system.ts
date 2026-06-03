"use server"

import { db } from "@/prisma/db"
import { PaymentStatus, Prisma, type PaymentMethod, type SalesOrderStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

const toNumber = (value: Prisma.Decimal | number | null | undefined) => {
  if (value instanceof Prisma.Decimal) return value.toNumber()
  return Number(value ?? 0)
}

// Create sales order
export async function createSalesOrder(data: {
  customerId: string
  locationId: string
  organizationId: string
  createdById?: string
  terminalId?: string
  sessionId?: string
  notes?: string
  lines: {
    itemId: string
    quantity: number
    unitPrice: number
    discount?: number
    taxRate?: number
  }[]
}) {
  try {
    // Calculate totals
    let subtotal = 0
    let totalTax = 0
    let totalDiscount = 0

    const processedLines = data.lines.map((line) => {
      const lineSubtotal = line.quantity * line.unitPrice
      const lineDiscount = line.discount || 0
      const lineTaxRate = line.taxRate || 0
      const lineAfterDiscount = lineSubtotal - lineDiscount
      const lineTax = lineAfterDiscount * (lineTaxRate / 100)
      const lineTotal = lineAfterDiscount + lineTax

      subtotal += lineSubtotal
      totalDiscount += lineDiscount
      totalTax += lineTax

      return {
        ...line,
        discount: lineDiscount,
        taxRate: lineTaxRate,
        taxAmount: lineTax,
        lineTotal,
      }
    })

    const total = subtotal - totalDiscount + totalTax

    // Generate order number
    const orderCount = await db.salesOrder.count({
      where: { organizationId: data.organizationId },
    })
    const orderNumber = `SO-${String(orderCount + 1).padStart(6, "0")}`

    // Create sales order
    const salesOrder = await db.salesOrder.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        locationId: data.locationId,
        organizationId: data.organizationId,
        createdById: data.createdById,
        terminalId: data.terminalId,
        sessionId: data.sessionId,
        notes: data.notes,
        subtotal,
        taxAmount: totalTax,
        discount: totalDiscount,
        total,
        lines: {
          create: processedLines,
        },
      },
      include: {
        customer: true,
        location: true,
        lines: {
          include: {
            item: true,
          },
        },
        payments: true,
      },
    })

    // Create inventory transactions for each line
    for (const line of processedLines) {
      await db.inventoryTransaction.create({
        data: {
          itemId: line.itemId,
          locationId: data.locationId,
          organizationId: data.organizationId,
          type: "SALE",
          quantity: -line.quantity, // Negative for outbound
          unitCost: line.unitPrice,
          totalCost: line.lineTotal,
          createdById: data.createdById,
          referenceType: "SALES_ORDER",
          referenceId: salesOrder.id,
          referenceNumber: orderNumber,
          balanceAfter: 0, // Will be updated by trigger
        },
      })
    }

    revalidatePath("/sales")
    revalidatePath("/sales/orders")
    return { success: true, data: salesOrder }
  } catch (error) {
    console.error("Error creating sales order:", error)
    return { success: false, error: "Failed to create sales order" }
  }
}

// Update sales order status
export async function updateSalesOrderStatus(id: string, status: SalesOrderStatus) {
  try {
    const salesOrder = await db.salesOrder.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        location: true,
        lines: {
          include: {
            item: true,
          },
        },
        payments: true,
      },
    })

    revalidatePath("/sales")
    revalidatePath(`/sales/orders/${id}`)
    return { success: true, data: salesOrder }
  } catch (error) {
    console.error("Error updating sales order status:", error)
    return { success: false, error: "Failed to update sales order status" }
  }
}

// Process payment
export async function processPayment(data: {
  salesOrderId?: string
  purchaseOrderId?: string
  amount: number
  method: PaymentMethod
  processedById?: string
  cardType?: string
  cardLast4?: string
  transactionId?: string
  authorizationCode?: string
  digitalWalletType?: string
  digitalTransactionId?: string
  cashTendered?: number
  changeGiven?: number
  notes?: string
}) {
  try {
    // Generate payment number
    const paymentCount = await db.payment.count()
    const paymentNumber = `PAY-${String(paymentCount + 1).padStart(8, "0")}`
    const relatedOrder = data.salesOrderId
      ? await db.salesOrder.findUnique({
          where: { id: data.salesOrderId },
          select: { organizationId: true },
        })
      : data.purchaseOrderId
        ? await db.purchaseOrder.findUnique({
            where: { id: data.purchaseOrderId },
            select: { organizationId: true },
          })
        : null

    if (!relatedOrder) {
      throw new Error("A sales or purchase order is required to process a payment")
    }

    const paymentData: Prisma.PaymentUncheckedCreateInput = {
      paymentNumber,
      organizationId: relatedOrder.organizationId,
      salesOrderId: data.salesOrderId,
      purchaseOrderId: data.purchaseOrderId,
      amount: new Prisma.Decimal(data.amount),
      method: data.method,
      status: PaymentStatus.PAID,
      processedAt: new Date(),
      processedById: data.processedById,
      cardType: data.cardType,
      cardLast4: data.cardLast4,
      transactionId: data.transactionId,
      authorizationCode: data.authorizationCode,
      mobileMoneyReference: data.digitalTransactionId,
      cashTendered: data.cashTendered === undefined ? undefined : new Prisma.Decimal(data.cashTendered),
      changeGiven: data.changeGiven === undefined ? undefined : new Prisma.Decimal(data.changeGiven),
      notes: data.notes,
    }

    const payment = await db.payment.create({
      data: paymentData,
      include: {
        salesOrder: true,
        purchaseOrder: true,
        processedBy: true,
      },
    })

    // Update order payment status if applicable
    if (data.salesOrderId) {
      const salesOrder = await db.salesOrder.findUnique({
        where: { id: data.salesOrderId },
        include: { payments: true },
      })

      if (salesOrder) {
        const totalPaid = salesOrder.payments.reduce((sum, p) => sum + toNumber(p.amount), 0) + data.amount
        const paymentStatus: PaymentStatus =
          totalPaid >= toNumber(salesOrder.total) ? PaymentStatus.PAID : totalPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.PENDING

        await db.salesOrder.update({
          where: { id: data.salesOrderId },
          data: { paymentStatus },
        })
      }
    }

    revalidatePath("/sales")
    revalidatePath("/payments")
    return { success: true, data: payment }
  } catch (error) {
    console.error("Error processing payment:", error)
    return { success: false, error: "Failed to process payment" }
  }
}

// Get sales orders
export async function getSalesOrders(params: {
  organizationId: string
  locationId?: string
  customerId?: string
  status?: SalesOrderStatus
  paymentStatus?: PaymentStatus
  page?: number
  limit?: number
  startDate?: Date
  endDate?: Date
}) {
  try {
    const {
      organizationId,
      locationId,
      customerId,
      status,
      paymentStatus,
      page = 1,
      limit = 20,
      startDate,
      endDate,
    } = params

    const where = {
      organizationId,
      ...(locationId && { locationId }),
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(startDate &&
        endDate && {
          orderDate: {
            gte: startDate,
            lte: endDate,
          },
        }),
    }

    const [orders, total] = await Promise.all([
      db.salesOrder.findMany({
        where,
        include: {
          customer: true,
          location: true,
          lines: {
            include: {
              item: true,
            },
          },
          payments: true,
          createdBy: true,
        },
        orderBy: { orderDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.salesOrder.count({ where }),
    ])

    return {
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching sales orders:", error)
    return { success: false, error: "Failed to fetch sales orders" }
  }
}
