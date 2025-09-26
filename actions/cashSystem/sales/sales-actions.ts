"use server"

import { db } from "@/prisma/db"
import type {
  Customer,
  PaymentMethod,
  PaymentStatus,
  SalesOrderStatus
} from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ===== VALIDATION SCHEMAS =====
const PaymentSchema = z.object({
  method: z.enum(["CASH", "CARD", "DIGITAL"]),
  amount: z.number().positive("Payment amount must be positive"),
  cashTendered: z.number().optional(),
  referenceNumber: z.string().optional(),
  cardLastFour: z.string().optional(), // Changed from min/max validation
  cardType: z.string().optional(),
  authorizationCode: z.string().optional(),
})

const SaleItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative("Unit price cannot be negative"),
  discountAmount: z.number().nonnegative().optional().default(0),
  taxAmount: z.number().nonnegative().optional().default(0),
})

const CreateSaleSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  terminalId: z.string().min(1, "Terminal ID is required"),
  customerId: z.string().optional(),
  createdById: z.string().min(1, "Creator ID is required"),
  locationId: z.string().min(1, "Location ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
  lines: z.array(SaleItemSchema).min(1, "At least one item is required"),
  subtotal: z.number().nonnegative("Subtotal cannot be negative"),
  taxAmount: z.number().nonnegative("Tax amount cannot be negative"),
  discount: z.number().nonnegative("Discount amount cannot be negative"),
  totalAmount: z.number().positive("Total amount must be positive"),
  payments: z.array(PaymentSchema).min(1, "At least one payment is required"),
  notes: z.string().optional(),
})

// ===== TYPE DEFINITIONS =====
export type CreateSaleData = z.infer<typeof CreateSaleSchema>

export interface SaleResponse {
  id: string
  orderNumber: string
  sessionId: string
  terminalId: string
  customerId: string
  userId: string
  locationId: string
  organizationId: string
  status: SalesOrderStatus
  subtotal: number
  taxAmount: number // Changed from taxRate to taxAmount
  discount: number
  totalAmount: number
  amountPaid: number
  changeAmount: number
  paymentStatus: PaymentStatus
  notes?: string
  createdAt: Date
  lines: Array<{
    id: string
    itemId: string
    quantity: number
    unitPrice: number
    discountAmount: number
    taxAmount: number
    lineTotal: number
    item: {
      name: string
      sku: string
    }
  }>
  payments: Array<{
    id: string
    method: PaymentMethod
    amount: number
    referenceNumber?: string
    cardLastFour?: string
    cardType?: string
    authorizationCode?: string
    status: PaymentStatus
    cashTendered?: number
    changeGiven?: number
  }>
  customer?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
}

// ===== UTILITY FUNCTIONS =====
function calculateLineTotal(
  unitPrice: number, 
  quantity: number, 
  discountAmount = 0, 
  taxAmount = 0
): number {
  return Math.max(0, (unitPrice * quantity) - discountAmount + taxAmount)
}

function calculateChangeAmount(payments: CreateSaleData['payments'], totalAmount: number): number {
  const cashPayment = payments.find(p => p.method === "CASH")
  if (!cashPayment?.cashTendered) return 0
  
  return Math.max(0, cashPayment.cashTendered - totalAmount)
}

function generateUniqueNumber(prefix: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// ===== MAIN SALE CREATION FUNCTION =====
export async function createSalesOrder(
  rawSaleData: CreateSaleData
): Promise<{ success: boolean; sale?: SaleResponse; orderNumber?: string; error?: string }> {
  try {
    console.log("Raw sale data received:", JSON.stringify(rawSaleData, null, 2)) // Debug log
    
    // Validate input data
    const saleData = CreateSaleSchema.parse(rawSaleData)
    console.log("Validated sale data:", JSON.stringify(saleData, null, 2)) // Debug log
    
    // Generate unique identifiers
    const orderNumber = generateUniqueNumber("SO")
    
    // Calculate totals
    const totalPaid = saleData.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const changeAmount = calculateChangeAmount(saleData.payments, saleData.totalAmount)
    const paymentStatus: PaymentStatus = totalPaid >= saleData.totalAmount ? "PAID" : "PARTIAL"

    // Execute transaction
    const result = await db.$transaction(async (tx) => {
      // Ensure customer exists (create walk-in if needed)
      const customer = await ensureCustomerExists(tx, saleData.customerId, saleData.organizationId)
      
      // Create sales order
      const salesOrder = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: customer.id,
          locationId: saleData.locationId,
          organizationId: saleData.organizationId,
          createdById: saleData.createdById,
          terminalId: saleData.terminalId,
          sessionId: saleData.sessionId,
          status: "COMPLETED",
          paymentStatus,
          subtotal: saleData.subtotal,
          taxAmount: saleData.taxAmount,
          discount: saleData.discount,
          total: saleData.totalAmount,
          notes: saleData.notes,
        },
      })

      // Process sale items and inventory
      const createdLines = await processSaleItems(tx, salesOrder.id, saleData)
      
      // Process payments
      const createdPayments = await processPayments(
        tx, 
        salesOrder.id, 
        saleData, 
        changeAmount
      )

      // Return structured result
      return {
        salesOrder,
        customer,
        lines: createdLines,
        payments: createdPayments,
      }
    })

    // Format response
    const sale: SaleResponse = {
      id: result.salesOrder.id,
      orderNumber: result.salesOrder.orderNumber,
      sessionId: result.salesOrder.sessionId!,
      terminalId: result.salesOrder.terminalId!,
      customerId: result.customer.id,
      userId: result.salesOrder.createdById!,
      locationId: result.salesOrder.locationId,
      organizationId: result.salesOrder.organizationId,
      status: result.salesOrder.status,
      subtotal: result.salesOrder.subtotal,
      taxAmount: result.salesOrder.taxAmount, // Fixed: was using taxRate
      discount: result.salesOrder.discount,
      totalAmount: result.salesOrder.total,
      amountPaid: totalPaid,
      changeAmount,
      paymentStatus: result.salesOrder.paymentStatus,
      notes: result.salesOrder.notes || undefined,
      createdAt: result.salesOrder.createdAt,
      lines: result.lines,
      payments: result.payments,
      customer: {
        id: result.customer.id,
        name: result.customer.name,
        email: result.customer.email || undefined,
        phone: result.customer.phone || undefined,
      },
    }

    revalidatePath("/pos")
    
    return {
      success: true,
      sale,
      orderNumber: result.salesOrder.orderNumber,
    }

  } catch (error) {
    console.error("Error creating sales order:", error)
    
    if (error instanceof z.ZodError) {
      console.log("Zod validation errors:", error.errors) // Debug log
      return {
        success: false,
        error: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ")}`
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create sale"
    }
  }
}

// ===== HELPER FUNCTIONS =====
async function ensureCustomerExists(
  tx: any,
  customerId: string | undefined,
  organizationId: string
): Promise<Customer> {
  if (customerId) {
    const customer = await tx.customer.findUnique({
      where: { id: customerId }
    })
    if (customer) return customer
  }

  // Create or get walk-in customer
  return await tx.customer.upsert({
    where: {
      organizationId_code: {
        organizationId,
        code: "WALK_IN"
      }
    },
    create: {
      name: "Walk-In Customer",
      code: "WALK_IN",
      organizationId,
    },
    update: {},
  })
}

async function processSaleItems(
  tx: any,
  salesOrderId: string,
  saleData: CreateSaleData
) {
  const createdLines = []

  for (const item of saleData.lines) {
    const lineTotal = calculateLineTotal(
      item.unitPrice,
      item.quantity,
      item.discountAmount,
      item.taxAmount
    )

    // Create sales order line
    const line = await tx.salesOrderLine.create({
      data: {
        salesOrderId,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discountAmount,
        taxAmount: item.taxAmount,
        lineTotal,
      },
      include: {
        item: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    })

    // Update inventory
    await updateInventoryLevel(tx, item, saleData.locationId, saleData.organizationId, saleData.createdById, salesOrderId)

    createdLines.push({
      id: line.id,
      itemId: line.itemId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discountAmount: line.discount,
      taxAmount: line.taxAmount,
      lineTotal: line.lineTotal,
      item: line.item,
    })
  }

  return createdLines
}

async function updateInventoryLevel(
  tx: any,
  item: CreateSaleData['lines'][0],
  locationId: string,
  organizationId: string,
  userId: string,
  salesOrderId: string
) {
  const inventoryLevel = await tx.inventoryLevel.findFirst({
    where: {
      itemId: item.itemId,
      locationId,
    },
  })

  if (inventoryLevel) {
    const newQuantityOnHand = Math.max(0, inventoryLevel.quantityOnHand - item.quantity)
    const newQuantityAvailable = Math.max(0, inventoryLevel.quantityAvailable - item.quantity)

    await tx.inventoryLevel.update({
      where: { id: inventoryLevel.id },
      data: {
        quantityOnHand: newQuantityOnHand,
        quantityAvailable: newQuantityAvailable,
        lastTransactionAt: new Date(),
      },
    })

    // Create inventory transaction record
    await tx.inventoryTransaction.create({
      data: {
        itemId: item.itemId,
        locationId,
        organizationId,
        createdById: userId,
        type: "SALE",
        quantity: -item.quantity,
        unitCost: item.unitPrice,
        totalCost: item.unitPrice * item.quantity,
        referenceType: "SALES_ORDER",
        referenceId: salesOrderId,
        balanceAfter: newQuantityOnHand,
      },
    })
  }
}

async function processPayments(
  tx: any,
  salesOrderId: string,
  saleData: CreateSaleData,
  changeAmount: number
) {
  const createdPayments = []

  for (const paymentData of saleData.payments) {
    const paymentNumber = generateUniqueNumber("PAY")

    const payment = await tx.payment.create({
      data: {
        paymentNumber,
        salesOrderId,
        method: paymentData.method,
        amount: paymentData.amount,
        status: "PAID",
        cardType: paymentData.cardType,
        cardLast4: paymentData.cardLastFour,
        transactionId: paymentData.referenceNumber,
        authorizationCode: paymentData.authorizationCode,
        cashTendered: paymentData.cashTendered,
        changeGiven: paymentData.method === "CASH" ? changeAmount : undefined,
        processedAt: new Date(),
        processedById: saleData.createdById,
      },
    })

    // Handle cash drawer updates
    if (paymentData.method === "CASH") {
      await updateCashDrawer(tx, saleData, paymentData, changeAmount)
    } else {
      await updateSessionTotals(tx, saleData, paymentData)
    }

    createdPayments.push({
      id: payment.id,
      method: payment.method,
      amount: payment.amount,
      referenceNumber: payment.transactionId || undefined,
      cardLastFour: payment.cardLast4 || undefined,
      cardType: payment.cardType || undefined,
      authorizationCode: payment.authorizationCode || undefined,
      status: payment.status,
      cashTendered: payment.cashTendered || undefined,
      changeGiven: payment.changeGiven || undefined,
    })
  }

  return createdPayments
}

async function updateCashDrawer(
  tx: any,
  saleData: CreateSaleData,
  paymentData: CreateSaleData['payments'][0],
  changeAmount: number
) {
  const session = await tx.pOSSession.findUnique({
    where: { id: saleData.sessionId },
    include: {
      terminal: {
        include: {
          CashDrawer: true,
        },
      },
    },
  })

  if (session?.terminal.CashDrawer?.[0]) {
    const cashDrawer = session.terminal.CashDrawer[0]
    const netCashAmount = paymentData.amount - changeAmount
    const newBalance = cashDrawer.currentBalance + netCashAmount

    await tx.cashDrawer.update({
      where: { id: cashDrawer.id },
      data: {
        currentBalance: newBalance,
      },
    })

    // Record cash drawer event
    await tx.cashDrawerTransaction.create({
      data: {
        cashDrawerId: cashDrawer.id,
        sessionId: saleData.sessionId,
        userId: saleData.createdById,
        type: "SALE",
        amount: netCashAmount,
        reason: "POS Sale",
        notes: changeAmount > 0 ? `Change given: $${changeAmount.toFixed(2)}` : undefined,
        balanceBefore: cashDrawer.currentBalance,
        balanceAfter: newBalance,
      },
    })

    // Update session totals
    await tx.pOSSession.update({
      where: { id: saleData.sessionId },
      data: {
        totalSales: { increment: saleData.totalAmount },
        cashTotal: { increment: netCashAmount },
        transactionCount: { increment: 1 },
      },
    })
  }
}

async function updateSessionTotals(
  tx: any,
  saleData: CreateSaleData,
  paymentData: CreateSaleData['payments'][0]
) {
  const updateData: any = {
    totalSales: { increment: saleData.totalAmount },
    transactionCount: { increment: 1 },
  }

  if (paymentData.method === "CARD") {
    updateData.cardTotal = { increment: paymentData.amount }
  } else if (paymentData.method === "DIGITAL") {
    updateData.digitalTotal = { increment: paymentData.amount }
  }

  await tx.pOSSession.update({
    where: { id: saleData.sessionId },
    data: updateData,
  })
}

// Keep the rest of the query and void functions from your original file...
// (getSessionSales, getSaleById, voidSale functions remain the same)

export async function getSessionSales(
  sessionId: string, 
  limit = 50
): Promise<SaleResponse[]> {
  try {
    if (!sessionId) {
      throw new Error("Session ID is required")
    }

    const salesOrders = await db.salesOrder.findMany({
      where: { sessionId },
      include: {
        lines: {
          include: {
            item: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
        payments: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return salesOrders.map(mapSalesOrderToResponse)
  } catch (error) {
    console.error("Error getting session sales:", error)
    return []
  }
}

// ===== MAPPING FUNCTION =====
function mapSalesOrderToResponse(salesOrder: any): SaleResponse {
  const totalPaid = salesOrder.payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
  const changeAmount = salesOrder.payments?.reduce((sum: number, p: any) => sum + (p.changeGiven || 0), 0) || 0

  return {
    id: salesOrder.id,
    orderNumber: salesOrder.orderNumber,
    sessionId: salesOrder.sessionId || "",
    terminalId: salesOrder.terminalId || "",
    customerId: salesOrder.customerId,
    userId: salesOrder.createdById || "",
    locationId: salesOrder.locationId,
    organizationId: salesOrder.organizationId,
    status: salesOrder.status,
    subtotal: salesOrder.subtotal || 0,
    taxAmount: salesOrder.taxAmount || 0, // Fixed: was using non-existent taxRate
    discount: salesOrder.discount || 0,
    totalAmount: salesOrder.total || 0,
    amountPaid: totalPaid,
    changeAmount,
    paymentStatus: salesOrder.paymentStatus,
    notes: salesOrder.notes || undefined,
    createdAt: salesOrder.createdAt,
    lines: (salesOrder.lines || []).map((line: any) => ({
      id: line.id,
      itemId: line.itemId,
      quantity: line.quantity || 0,
      unitPrice: line.unitPrice || 0,
      discountAmount: line.discount || 0,
      taxAmount: line.taxAmount || 0,
      lineTotal: line.lineTotal || 0,
      item: {
        name: line.item?.name || "Unknown Item",
        sku: line.item?.sku || "N/A",
      },
    })),
    payments: (salesOrder.payments || []).map((payment: any) => ({
      id: payment.id,
      method: payment.method,
      amount: payment.amount || 0,
      referenceNumber: payment.transactionId || undefined,
      cardLastFour: payment.cardLast4 || undefined,
      cardType: payment.cardType || undefined,
      authorizationCode: payment.authorizationCode || undefined,
      status: payment.status,
      cashTendered: payment.cashTendered || undefined,
      changeGiven: payment.changeGiven || undefined,
    })),
    customer: salesOrder.customer ? {
      id: salesOrder.customer.id,
      name: salesOrder.customer.name || "Unknown Customer",
      email: salesOrder.customer.email || undefined,
      phone: salesOrder.customer.phone || undefined,
    } : undefined,
  }
}