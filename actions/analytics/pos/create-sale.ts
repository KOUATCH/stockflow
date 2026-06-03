"use server"

import { db } from "@/prisma/db"
import type { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import {
  executeFinancialOperation,
  FinancialTransactionType,
  systemMonitor,
  createAlert,
  AlertType,
  AlertSeverity
} from "@/lib/error-handling"

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined
type SalePaymentMethod = CreateSaleData["payments"][number]["method"]

function toNumber(value: DecimalLike): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value) || 0
  if (typeof value.toNumber === "function") return value.toNumber()
  return Number(value.toString()) || 0
}

function toPaymentMethod(method: SalePaymentMethod) {
  switch (method) {
    case "cash":
      return "CASH"
    case "card":
      return "CARD"
    case "check":
      return "CHEQUE"
    case "gift_card":
    case "store_credit":
      return "STORE_CREDIT"
  }
}

export interface SaleItem {
  itemId: string
  quantity: number
  unitPrice: number
  discountAmount?: number
  taxAmount?: number
}

export interface CreateSaleData {
  sessionId: string
  terminalId: string
  customerId?: string
  userId: string
  locationId: string
  organizationId: string
  items: SaleItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  payments: {
    method: "cash" | "card" | "check" | "gift_card" | "store_credit"
    amount: number
    referenceNumber?: string
    cardLastFour?: string
    cardType?: string
    authorizationCode?: string
  }[]
  notes?: string
}

export interface Sale {
  id: string
  saleNumber: string
  sessionId: string
  terminalId: string
  customerId?: string
  userId: string
  locationId: string
  organizationId: string
  status: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  amountPaid: number
  changeAmount: number
  notes?: string
  receiptNumber?: string
  createdAt: Date
  items: {
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
  }[]
  payments: {
    id: string
    paymentMethod: string
    amount: number
    referenceNumber?: string
    cardLastFour?: string
    cardType?: string
    authorizationCode?: string
    status: string
  }[]
  customer?: {
    id: string
    firstName?: string
    lastName?: string
    email?: string
  }
}

// Create a new sale with enterprise-grade error handling
export async function createSale(
  saleData: CreateSaleData,
): Promise<{ success: boolean; saleId?: string; error?: string }> {
  const startTime = Date.now()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const saleNumber = `SALE-${timestamp}-${random}`

  try {
    // Validate sale data before processing
    await validateSaleData(saleData)

    // Calculate totals and validate payment amount
    const totalPaid = saleData.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const changeAmount = Math.max(0, totalPaid - saleData.totalAmount)

    if (totalPaid < saleData.totalAmount) {
      throw new Error(`Insufficient payment: ${totalPaid} < ${saleData.totalAmount}`)
    }

    const result = await executeFinancialOperation(
      {
        type: FinancialTransactionType.SALE,
        amount: saleData.totalAmount,
        currency: "USD",
        reference: saleNumber,
        description: "POS Sale Creation",
        organizationId: saleData.organizationId,
        userId: saleData.userId,
        customerId: saleData.customerId,
        sessionId: saleData.sessionId,
        locationId: saleData.locationId,
        metadata: {
          terminalId: saleData.terminalId,
          itemsCount: saleData.items.length,
          paymentsCount: saleData.payments.length,
        },
      },
      async (tx: Prisma.TransactionClient) => {
        const providedCustomer = saleData.customerId
          ? await tx.customer.findUnique({
              where: { id: saleData.customerId },
              select: { id: true },
            })
          : null
        const customer =
          providedCustomer ??
          (await tx.customer.upsert({
            where: {
              organizationId_code: {
                organizationId: saleData.organizationId,
                code: "WALK_IN",
              },
            },
            update: {},
            create: {
              organizationId: saleData.organizationId,
              name: "Walk-In Customer",
              code: "WALK_IN",
            },
            select: { id: true },
          }))

        const sale = await tx.salesOrder.create({
          data: {
            orderNumber: saleNumber,
            sessionId: saleData.sessionId,
            terminalId: saleData.terminalId,
            customerId: customer.id,
            createdById: saleData.userId,
            locationId: saleData.locationId,
            organizationId: saleData.organizationId,
            status: "COMPLETED",
            paymentStatus: totalPaid >= saleData.totalAmount ? "PAID" : "PARTIAL",
            subtotal: saleData.subtotal,
            taxAmount: saleData.taxAmount,
            discount: saleData.discountAmount,
            total: saleData.totalAmount,
            notes: saleData.notes,
          },
        })

        const inventoryUpdates: Array<{ itemId: string; quantityDeducted: number }> = []

        for (const item of saleData.items) {
          const lineTotal = item.unitPrice * item.quantity - (item.discountAmount || 0) + (item.taxAmount || 0)

          await tx.salesOrderLine.create({
            data: {
              salesOrderId: sale.id,
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discountAmount || 0,
              taxAmount: item.taxAmount || 0,
              lineTotal,
            },
          })

          const inventoryLevel = await tx.inventoryLevel.findFirst({
            where: {
              itemId: item.itemId,
              locationId: saleData.locationId,
            },
          })

          if (!inventoryLevel) {
            throw new Error(`No inventory level found for item ${item.itemId} at location ${saleData.locationId}`)
          }

          const quantityOnHand = toNumber(inventoryLevel.quantityOnHand)
          const quantityAvailable = toNumber(inventoryLevel.quantityAvailable)
          if (quantityOnHand < item.quantity) {
            throw new Error(`Insufficient stock for item ${item.itemId}: available ${quantityOnHand}, needed ${item.quantity}`)
          }

          const newQuantityOnHand = quantityOnHand - item.quantity
          const newQuantityAvailable = quantityAvailable - item.quantity
          const updatedInventory = await tx.inventoryLevel.update({
            where: {
              id: inventoryLevel.id,
              quantityOnHand: inventoryLevel.quantityOnHand,
            },
            data: {
              quantityOnHand: newQuantityOnHand,
              quantityAvailable: newQuantityAvailable,
              lastTransactionAt: new Date(),
            },
          })

          inventoryUpdates.push({ itemId: item.itemId, quantityDeducted: item.quantity })

          await tx.inventoryTransaction.create({
            data: {
              itemId: item.itemId,
              locationId: saleData.locationId,
              type: "SALE",
              quantity: -item.quantity,
              balanceAfter: toNumber(updatedInventory.quantityOnHand),
              referenceId: sale.id,
              referenceType: "SALES_ORDER",
              notes: `Sale ${saleNumber}`,
              createdById: saleData.userId,
              organizationId: saleData.organizationId,
            },
          })
        }

        for (const payment of saleData.payments) {
          const paymentNumber = `PAY-${timestamp}-${Math.random().toString(36).substring(2, 9)}`
          const method = toPaymentMethod(payment.method)

          await tx.payment.create({
            data: {
              paymentNumber,
              salesOrderId: sale.id,
              method,
              amount: payment.amount,
              cashTendered: method === "CASH" ? payment.amount : undefined,
              changeGiven: method === "CASH" ? changeAmount : undefined,
              cardLast4: payment.cardLastFour,
              cardType: payment.cardType,
              authorizationCode: payment.authorizationCode,
              status: "PAID",
              organizationId: saleData.organizationId,
            },
          })

          if (payment.method === "cash") {
            await processCashPayment(tx, saleData, payment, changeAmount, saleNumber)
          }
        }

        return { sale, inventoryUpdates }
      }
    )

    systemMonitor.recordMetric("sale_created", {
      sale_id: result.sale.id,
      sale_number: saleNumber,
      total_amount: saleData.totalAmount,
      items_count: saleData.items.length,
      payment_methods: saleData.payments.map(p => p.method),
      processing_time_ms: Date.now() - startTime,
      location_id: saleData.locationId,
      organization_id: saleData.organizationId,
    })

    if (saleData.totalAmount > 1000) {
      await createAlert({
        type: AlertType.BUSINESS,
        severity: AlertSeverity.LOW,
        message: `High-value sale created: ${saleNumber} - $${saleData.totalAmount}`,
        source: "pos-sales",
        metadata: {
          saleId: result.sale.id,
          saleNumber,
          totalAmount: saleData.totalAmount,
          locationId: saleData.locationId,
          userId: saleData.userId,
        },
      })
    }

    revalidatePath("/pos")
    revalidatePath("/dashboard/sales")
    revalidatePath("/dashboard/inventory")

    return { success: true, saleId: result.sale.id }
  } catch (error) {
    console.error("Error creating sale:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create sale" }
  }
}

// Helper function to validate sale data
async function validateSaleData(saleData: CreateSaleData): Promise<void> {
  // Validate required fields
  if (!saleData.sessionId) throw new Error("Session ID is required")
  if (!saleData.terminalId) throw new Error("Terminal ID is required")
  if (!saleData.userId) throw new Error("User ID is required")
  if (!saleData.locationId) throw new Error("Location ID is required")
  if (!saleData.organizationId) throw new Error("Organization ID is required")
  if (!saleData.items || saleData.items.length === 0) throw new Error("At least one item is required")
  if (!saleData.payments || saleData.payments.length === 0) throw new Error("At least one payment is required")

  // Validate amounts
  if (saleData.totalAmount <= 0) throw new Error("Total amount must be positive")
  if (saleData.subtotal <= 0) throw new Error("Subtotal must be positive")

  // Validate items
  for (const item of saleData.items) {
    if (!item.itemId) throw new Error("Item ID is required for all items")
    if (item.quantity <= 0) throw new Error("Item quantity must be positive")
    if (item.unitPrice < 0) throw new Error("Item unit price cannot be negative")
  }

  // Validate payments
  for (const payment of saleData.payments) {
    if (payment.amount <= 0) throw new Error("Payment amount must be positive")
    if (!["cash", "card", "check", "gift_card", "store_credit"].includes(payment.method)) {
      throw new Error(`Invalid payment method: ${payment.method}`)
    }
  }
}

// Helper function to process cash payments
async function processCashPayment(
  tx: Prisma.TransactionClient,
  saleData: CreateSaleData,
  payment: CreateSaleData["payments"][number],
  changeAmount: number,
  saleNumber: string
): Promise<void> {
  const session = await tx.pOSSession.findUnique({
    where: { id: saleData.sessionId },
    include: {
      cashDrawerTransactions: {
        include: {
          cashDrawer: {
            select: {
              id: true,
              currentBalance: true,
            },
          },
        },
      },
    },
  })

  if (!session?.cashDrawerTransactions[0]?.cashDrawer) {
    throw new Error("No active cash drawer found for this session")
  }

  const currentBalance = toNumber(session.cashDrawerTransactions[0].cashDrawer.currentBalance)
  const netCashChange = payment.amount - changeAmount
  const newBalance = currentBalance + netCashChange

  // Update cash drawer balance
  await tx.cashDrawer.update({
    where: { id: session.cashDrawerTransactions[0].cashDrawerId },
    data: {
      currentBalance: newBalance,
      expectedBalance: newBalance,
    },
  })

  // Record cash drawer transaction
  await tx.cashDrawerTransaction.create({
    data: {
      cashDrawerId: session.cashDrawerTransactions[0].cashDrawerId,
      sessionId: saleData.sessionId,
      userId: saleData.userId,
      type: "SALE",
      amount: netCashChange,
      reason: `Sale ${saleNumber}`,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
    },
  })
}

// Get sales for a session
export async function getSessionSales(sessionId: string, limit = 50): Promise<Sale[]> {
  try {
    const sales = await db.salesOrder.findMany({
      where: { sessionId },
      include: {
        lines: {
          include: {
            item: {
              select: {
                nameEn: true,
                nameFr: true,
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

    // Map DB results to Sale interface
    const mappedSales: Sale[] = sales.map((sale: any) => ({
      id: sale.id,
      saleNumber: sale.orderNumber,
      sessionId: sale.sessionId,
      terminalId: sale.terminalId,
      customerId: sale.customerId ?? undefined,
      userId: sale.createdById,
      locationId: sale.locationId,
      organizationId: sale.organizationId ?? "",
      status: sale.status ?? "COMPLETED",
      subtotal: toNumber(sale.subtotal),
      taxAmount: toNumber(sale.taxAmount),
      discountAmount: toNumber(sale.discount),
      totalAmount: toNumber(sale.total),
      amountPaid: sale.payments?.reduce((sum: number, p: any) => sum + toNumber(p.amount), 0) ?? 0,
      changeAmount: sale.changeAmount ?? 0,
      notes: sale.notes ?? undefined,
      receiptNumber: sale.orderNumber,
      createdAt: sale.createdAt,
      items: sale.lines.map((line: any) => ({
        id: line.id,
        itemId: line.itemId,
        quantity: toNumber(line.quantity),
        unitPrice: toNumber(line.unitPrice),
        discountAmount: toNumber(line.discount),
        taxAmount: toNumber(line.taxAmount),
        lineTotal: toNumber(line.lineTotal) || toNumber(line.unitPrice) * toNumber(line.quantity) - toNumber(line.discount) + toNumber(line.taxAmount),
        item: {
          name: line.item?.nameEn ?? line.item?.nameFr ?? "",
          sku: line.item?.sku ?? "",
        },
      })),
      payments: sale.payments.map((payment: any) => ({
        id: payment.id,
        paymentMethod: payment.method,
        amount: toNumber(payment.amount),
        referenceNumber: payment.referenceNumber ?? undefined,
        cardLastFour: payment.cardLast4 ?? undefined,
        cardType: payment.cardType ?? undefined,
        authorizationCode: payment.authorizationCode ?? undefined,
        status: payment.status,
      })),
      customer: sale.customer
        ? {
            id: sale.customer.id,
            firstName: sale.customer.name?.split(" ")[0] ?? "",
            lastName: sale.customer.name?.split(" ").slice(1).join(" ") ?? "",
            email: sale.customer.email ?? undefined,
          }
        : undefined,
    }))

    return mappedSales
  } catch (error) {
    console.error("Error getting session sales:", error)
    return []
  }
}

// Get sale by ID
export async function getSaleById(saleId: string): Promise<Sale | null> {
  try {
    const sale = await db.salesOrder.findUnique({
      where: { id: saleId },
      include: {
        lines: true,
        payments: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    return sale as unknown as Sale | null
  } catch (error) {
    console.error("Error getting sale by ID:", error)
    return null
  }
}

// Void a sale
export async function voidSale(
  saleId: string,
  userId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const sale = await db.salesOrder.findUnique({
      where: { id: saleId },
      include: {
        lines: true,
        payments: {
          where: {
            method: "CASH",
          },
        },
      },
    })

    if (!sale) {
      return { success: false, error: "Sale not found" }
    }

    if (sale?.createdAt && new Date().getTime() - sale.createdAt.getTime() > 24 * 60 * 60 * 1000) {
      return { success: false, error: "Sale is already voided" }
    }

    await db.$transaction(async (tx) => {
      // Void the sale
      await tx.salesOrder.update({
        where: { id: saleId },
        data: {
          createdAt: new Date(),
          createdById: userId,
          notes: reason,
        },
      })

      // Restore inventory levels
      for (const item of sale.lines) {
        const inventoryLevel = await tx.inventoryLevel.findFirst({
          where: {
            itemId: item.itemId,
            locationId: sale.locationId,
          },
        })

        if (inventoryLevel) {
          await tx.inventoryLevel.update({
            where: { id: inventoryLevel.id },
            data: {
              quantityOnHand: toNumber(inventoryLevel.quantityOnHand) + toNumber(item.quantity),
              quantityAvailable: toNumber(inventoryLevel.quantityAvailable) + toNumber(item.quantity),
              lastTransactionAt: new Date(),
            },
          })
        }
      }

      // Reverse cash drawer transactions
      const cashPayments = sale.payments.filter((p) => p.method === "CASH")
      if (cashPayments.length > 0) {
        let session = null
        if (sale.sessionId) {
          session = await tx.pOSSession.findUnique({
            where: { id: sale.sessionId },
            include: {
              cashDrawerTransactions: {
                include: {
                  cashDrawer: true,
                },
              },
            },
          })
        }

        if (session?.cashDrawerTransactions[0]?.cashDrawer) {
          const totalCashAmount = cashPayments.reduce((sum, p) => sum + toNumber(p.amount), 0)
          const currentBalance = toNumber(session.cashDrawerTransactions[0]?.cashDrawer?.currentBalance)
          const changeGiven =
            sale?.payments && sale.payments.length > 0 && sale.payments[0]?.changeGiven
              ? toNumber(sale.payments[0].changeGiven)
              : 0
          const newBalance = currentBalance - totalCashAmount + changeGiven

          await tx.cashDrawer.update({
            where: { id: session.cashDrawerTransactions[0]?.cashDrawerId },
            data: {
              currentBalance: newBalance,
              expectedBalance: newBalance,
            },
          })

          // Record reversal transaction
          await tx.cashDrawerTransaction.create({
            data: {
              cashDrawerId: session.cashDrawerTransactions[0]?.cashDrawerId,
              sessionId: sale.sessionId,
              userId,
              type: "CASH_OUT",
              amount: totalCashAmount - changeGiven,
              reason: `Void sale ${sale.orderNumber}`,
              notes: reason,
              balanceBefore: currentBalance,
              balanceAfter: newBalance,
            },
          })
        }
      }
    })

    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Error voiding sale:", error)
    return { success: false, error: "Failed to void sale" }
  }
}

// Generate daily sales report
export async function generateDailySalesReport(
  organizationId: string,
  locationId: string,
  date: Date,
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Check if report already exists
    const existingReport = await db.dailySalesReport.findFirst({
      where: {
        date: startOfDay,
        locationId,
        organizationId,
      },
    })

    if (existingReport) {
      return { success: false, error: "Report already exists for this date" }
    }

    // Get all sales for the day
    const sales = await db.salesOrder.findMany({
      where: {
        organizationId,
        locationId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["COMPLETED", "DELIVERED"],
        },
      },
      include: {
        lines: {
          include: {
            item: true,
          },
        },
        payments: true,
      },
    })

    // Calculate totals
    const totalRevenue = sales.reduce((sum, sale) => sum + toNumber(sale.total), 0)
    const totalCost = sales.reduce((sum, sale) => {
      return (
        sum +
        sale.lines.reduce((lineSum, line) => {
          return lineSum + toNumber(line.item.costPrice) * toNumber(line.quantity)
        }, 0)
      )
    }, 0)

    const grossProfit = totalRevenue - totalCost
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    const totalTransactions = sales.length
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const totalQuantitySold = sales.reduce((sum, sale) => {
      return sum + sale.lines.reduce((lineSum, line) => lineSum + toNumber(line.quantity), 0)
    }, 0)

    // Payment method breakdown
    const payments = sales.flatMap((sale) => sale.payments)
    const cashSales = payments.filter((p) => p.method === "CASH").reduce((sum, p) => sum + toNumber(p.amount), 0)
    const cardSales = payments.filter((p) => p.method === "CARD").reduce((sum, p) => sum + toNumber(p.amount), 0)
    const mobileMoneySales = payments.filter((p) => p.method === "MOBILE_MONEY").reduce((sum, p) => sum + toNumber(p.amount), 0)
    const bankTransferSales = payments.filter((p) => p.method === "BANK_TRANSFER").reduce((sum, p) => sum + toNumber(p.amount), 0)
    const creditSales = payments
      .filter((p) => p.method === "CREDIT" || p.method === "STORE_CREDIT")
      .reduce((sum, p) => sum + toNumber(p.amount), 0)

    // Get cash drawer data
    const cashTransactions = await db.cashDrawerTransaction.findMany({
      where: {
        cashDrawer: {
          locationId,
        },
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const openingBalance = cashTransactions
      .filter((t) => t.type === "OPENING_BALANCE")
      .reduce((sum, t) => sum + toNumber(t.amount), 0)

    const closingBalance = cashTransactions
      .filter((t) => t.type === "CLOSING_BALANCE")
      .reduce((sum, t) => sum + toNumber(t.amount), 0)

    const cashIn = cashTransactions
      .filter((t) => ["SALE", "CASH_IN"].includes(t.type))
      .reduce((sum, t) => sum + toNumber(t.amount), 0)

    const cashOut = cashTransactions
      .filter((t) => ["REFUND", "CASH_OUT", "PAYOUT"].includes(t.type))
      .reduce((sum, t) => sum + toNumber(t.amount), 0)

    const variance = closingBalance - (openingBalance + cashIn - cashOut)

    // Create the daily sales report
    const report = await db.dailySalesReport.create({
      data: {
        date: startOfDay,
        locationId,
        organizationId,
        totalRevenue,
        totalCost,
        grossProfit,
        grossMargin,
        totalQuantitySold,
        totalTransactions,
        averageTransactionValue,
        itemsSold: Math.round(totalQuantitySold),
        cashSales,
        cardSales,
        mobileMoneySales,
        bankTransferSales,
        creditSales,
        totalExpenses: 0,
        netProfit: grossProfit,
        openingBalance,
        closingBalance,
        cashIn,
        cashOut,
        variance,
        isFinalized: true,
      },
    })

    return { success: true, reportId: report.id }
  } catch (error) {
    console.error("Error generating daily sales report:", error)
    return { success: false, error: "Failed to generate daily sales report" }
  }
}
