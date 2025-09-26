"use server"

import { db } from "@/prisma/db";
import { PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Types for the POS actions
interface SalesOrderLine {
  itemId: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  taxAmount: number
  lineTotal: number
}

interface CreateSalesOrderData {
  customerId: string
  locationId: string
  organizationId: string
  orderNumber: string
  createdById: string
  lines: SalesOrderLine[]
  subtotal: number
  taxAmount: number
  discount: number
  total: number
}


interface CreatePaymentData {
  amount: number
  method: PaymentMethod
  salesOrderId: string
  processedById: string
  cardType?: string
  cardLast4?: string
  transactionId?: string
  authorizationCode?: string
}

interface InventoryUpdate {
  itemId: string
  locationId: string
  quantityChange: number
  organizationId: string
}

interface InventoryTransaction {
  itemId: string
  locationId: string
  type: string
  quantity: number
  unitCost: number
  totalCost: number
  referenceType: string
  referenceId: string
  organizationId: string
  createdById: string
  serialNumbers: string[]
}

export interface CreateSaleData {
  sessionId: string
  terminalId: string
  customerId: string
  userId: string
  locationId: string
  organizationId: string
  lines: SalesOrderLine[]
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  payments: {
    method: "CASH" | "CARD" | "DIGITAL"
    amount: number
    referenceNumber?: string
    cardLastFour?: string
    cardType?: string
    authorizationCode?: string
  }[]
  notes?: string
}

export interface SalesType {
  id: string
  orderNumber: string
  sessionId: string
  terminalId: string
  customerId: string
  userId: string
  locationId: string
  organizationId: string
  status: "PENDING" | "PAID" | "CANCELLED"
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  amountPaid: number
  changeAmount: number
  notes?: string
  receiptNumber?: string
  createdAt: Date
  lines: {
    id: string
    itemId: string
    quantity: number
    unitPrice: number
    discount: number
    taxAmount: number
    lineTotal: number
    item: {
      name: string
      sku: string
    }
  }[]
  payments: {
    id: string
    method: "CASH" | "CARD" | "DIGITAL"
    paymentNumber: string
    amount: number
    cardLastFour?: string
    cardType?: string
    authorizationCode?: string
    status: string
  }[]
  location: {
    id: string
    name?: string
    cashDrawer:{
      id: string
      name: string
      currentBalance: number
      isOpen: boolean
    }
  },
  customer?: {
    id: string
    name?: string
    phone?: string
  }
}

export async function createSalesOrder(data: CreateSalesOrderData) {
  try {
    const salesOrder = await db.salesOrder.create({
      data: {
        customerId: data.customerId, // always provide customerId (string or null)
        locationId: data.locationId,
        organizationId: data.organizationId,
        createdById: data.createdById,
        subtotal: data.subtotal,
        orderNumber: data.orderNumber,
        taxAmount: data.taxAmount,
        discount: data.discount,
        total: data.total,
        status: "CONFIRMED",
        lines: {
          create: data.lines.map((line) => ({
            itemId: line.itemId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount,
            taxRate: line.taxRate,
            taxAmount: line.taxAmount,
            lineTotal: line.lineTotal,
          })),
        },
      },
      include: {
        lines: true,
      },
    })

    revalidatePath("/pos")
    return { success: true, data: salesOrder }
  } catch (error) {
    console.error("Failed to create sales order:", error)
    return { success: false, error: "Failed to create sales order" }
  }
}

export async function createSale1(
  saleData: CreateSaleData,
): Promise<{ success: boolean; saleId?: string; error?: string }> {
  try {
    // Generate sale number
    const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const receiptNumber = `RCP-${Date.now()}`

    // Calculate change amount
    const totalPaid = saleData.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const changeAmount = Math.max(0, totalPaid - saleData.totalAmount)

    const sale = await db.salesOrder.create({
      data: {
        orderNumber: saleNumber,
        sessionId: saleData.sessionId,
        terminalId: saleData.terminalId,
        createdById: saleData.userId,
        locationId: saleData.locationId,
        organizationId: saleData.organizationId,
        subtotal: saleData.subtotal,
        taxAmount: saleData.taxAmount,
        discount: saleData.discount,
        total: saleData.totalAmount,
        notes: saleData.notes,
        customerId: saleData.customerId,
      },
    })

    // Create sale items and update inventory
    for (const item of saleData.lines) {
      const lineTotal = item.unitPrice * item.quantity - (item.discount || 0) + (item.taxAmount || 0)

      await db.salesOrderLine.create({
        data: {
          salesOrderId: sale.id,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          taxAmount: item.taxAmount || 0,
          lineTotal,
        },
      })

      // Update inventory levels
      const inventoryLevel = await db.inventoryLevel.findFirst({
        where: {
          itemId: item.itemId,
          locationId: saleData.locationId,
        },
      })

      if (inventoryLevel) {
        await db.inventoryLevel.update({
          where: { id: inventoryLevel.id },
          data: {
            quantityOnHand: inventoryLevel.quantityOnHand - item.quantity,
            quantityAvailable: inventoryLevel.quantityAvailable - item.quantity,
            lastTransactionAt: new Date(),
          },
        })
      }
    }

    // Create payments and update cash drawer
    for (const payment of saleData.payments) {
      const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      await db.payment.create({
        data: {
          paymentNumber,
          salesOrderId: sale.id,
          method: payment.method,
          amount: payment.amount,
          cardLast4: payment.cardLastFour,
          cardType: payment.cardType,
          authorizationCode: payment.authorizationCode,
          status: "PAID",
        },
      })

      // If cash payment, update cash drawer
      if (payment.method === "CASH") {
        const session = await db.pOSSession.findUnique({
          where: { id: saleData.sessionId },
          include: { cashDrawerTransactions: { include: { cashDrawer: true } } },
        })

        if (session?.cashDrawerTransactions[0]?.cashDrawer) {
          const currentBalance = session.cashDrawerTransactions[0]?.cashDrawer.currentBalance
          const newBalance = currentBalance + payment.amount - changeAmount

          await db.cashDrawer.update({
            where: { id: session.cashDrawerTransactions[0]?.cashDrawerId },
            data: {
              currentBalance: newBalance,
              expectedBalance: newBalance,
            },
          })

          // Record cash drawer transaction
          await db.cashDrawerTransaction.create({
            data: {
              cashDrawerId: session.cashDrawerTransactions[0]?.cashDrawerId,
              sessionId: saleData.sessionId,
              userId: saleData.userId,
              type: "SALE",
              amount: payment.amount - changeAmount,
              reason: `Sale ${saleNumber}`,
              balanceBefore: currentBalance,
              balanceAfter: newBalance,
            },
          })
      }
    }
  }

    revalidatePath("/dashboard/app/sales/pos")
  return { success: true, saleId: sale.id }
} catch (error) {
  console.error("Error creating sale:", error)
  return { success: false, error: "Failed to create sale" }
}
}

export async function createSale(
  saleData: SalesType,
): Promise<{ success: boolean; saleId?: string; error?: string }> {
  try {
    // Validate required data
    if (!saleData.payments || !Array.isArray(saleData.payments) || saleData.payments.length === 0) {
      return { success: false, error: "At least one payment method is required" }
    }

    if (!saleData.lines || !Array.isArray(saleData.lines) || saleData.lines.length === 0) {
      return { success: false, error: "At least one sale item is required" }
    }

    // Generate sale number
    const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const receiptNumber = `RCP-${Date.now()}`

    // Calculate change amount with null safety
    const totalPaid = saleData.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const changeAmount = Math.max(0, totalPaid - saleData.totalAmount)

    const sale = await db.salesOrder.create({
      data: {
        orderNumber: saleNumber,
        sessionId: saleData.sessionId,
        terminalId: saleData.terminalId,
        createdById: saleData.userId,
        locationId: saleData.locationId,
        organizationId: saleData.organizationId,
        subtotal: saleData.subtotal,
        taxAmount: saleData.taxAmount,
        discount: saleData.discount,
        total: saleData.totalAmount,
        notes: saleData.notes,
        customerId: saleData.customerId,
      },
    })

    // Create sale items and update inventory
    for (const item of saleData.lines) {
      // Add validation for required item properties
      if (!item.itemId || item.quantity === undefined || item.unitPrice === undefined) {
        throw new Error(`Invalid item data: missing required properties`)
      }

      const lineTotal = item.unitPrice * item.quantity - (item.discount || 0) + (item.taxAmount || 0)

      await db.salesOrderLine.create({
        data: {
          salesOrderId: sale.id,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          taxAmount: item.taxAmount || 0,
          lineTotal,
        },
      })

      // Update inventory levels
      const inventoryLevel = await db.inventoryLevel.findFirst({
        where: {
          itemId: item.itemId,
          locationId: saleData.locationId,
        },
      })

      if (inventoryLevel) {
        await db.inventoryLevel.update({
          where: { id: inventoryLevel.id },
          data: {
            quantityOnHand: inventoryLevel.quantityOnHand - item.quantity,
            quantityAvailable: inventoryLevel.quantityAvailable - item.quantity,
            lastTransactionAt: new Date(),
          },
        })
      }
    }

    // Create payments and update cash drawer
    for (const payment of saleData.payments) {
      // Add validation for payment data
      if (!payment.method || payment.amount === undefined || payment.amount <= 0) {
        throw new Error(`Invalid payment data: missing or invalid method/amount`)
      }

      const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      await db.payment.create({
        data: {
          paymentNumber,
          salesOrderId: sale.id,
          method: payment.method,
          amount: payment.amount,
          cardLast4: payment.cardLastFour,
          cardType: payment.cardType,
          authorizationCode: payment.authorizationCode,
          status: "PAID",
        },
      })

      // If cash payment, update cash drawer
      if (payment.method === "CASH") {
        const session = await db.pOSSession.findUnique({
          where: { id: saleData.sessionId },
          include: { cashDrawerTransactions: { include: { cashDrawer: true } } },
        })

        if (session?.cashDrawerTransactions[0]?.cashDrawer) {
          const currentBalance = session.cashDrawerTransactions[0]?.cashDrawer.currentBalance
          const newBalance = currentBalance + payment.amount - changeAmount

          await db.cashDrawer.update({
            where: { id: session.cashDrawerTransactions[0]?.cashDrawerId },
            data: {
              currentBalance: newBalance,
              expectedBalance: newBalance,
            },
          })

          // Record cash drawer transaction
          await db.cashDrawerTransaction.create({
            data: {
              cashDrawerId: session.cashDrawerTransactions[0]?.cashDrawerId,
              sessionId: saleData.sessionId,
              userId: saleData.userId,
              type: "SALE",
              amount: payment.amount - changeAmount,
              reason: `Sale ${saleNumber}`,
              balanceBefore: currentBalance,
              balanceAfter: newBalance,
            },
          })
        }
      }
    }

    revalidatePath("/dashboard/app/sales/pos")
    return { success: true, saleId: sale.id }
  } catch (error) {
    console.error("Error creating sale:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create sale" }
  }
}


export async function createPayment(data: CreatePaymentData) {
  try {
    const payment = await db.payment.create({
      data: {
        amount: data.amount,
        method: data.method,
        salesOrderId: data.salesOrderId,
        processedById: data.processedById,
        status: "PAID",
        paymentNumber: data.method.toString().toUpperCase().slice(0, 3) + Date.now().toString().slice(-6),
        cardType: data.cardType,
        cardLast4: data.cardLast4,
        transactionId: data.transactionId,
        authorizationCode: data.authorizationCode,
      },
    })

    revalidatePath("/dashboard/app/sales/pos")
    return { success: true, data: payment }
  } catch (error) {
    console.error("Failed to create payment:", error)
    return { success: false, error: "Failed to create payment" }
  }
}



export async function updateInventoryLevels(updates: InventoryUpdate[]) {
  try {
    // Process each inventory update
    for (const update of updates) {
      await db.inventoryLevel.upsert({
        where: {
          itemId_locationId: {
            itemId: update.itemId,
            locationId: update.locationId,
          },
        },
        update: {
          quantityOnHand: {
            decrement: update.quantityChange,
          },
          updatedAt: new Date(),
        },
        create: {
          itemId: update.itemId,
          locationId: update.locationId,
          quantityOnHand: -update.quantityChange,
          reorderPoint: 0,
        },
      })
    }

    revalidatePath("/pos")
    return { success: true }
  } catch (error) {
    console.error("Failed to update inventory levels:", error)
    return { success: false, error: "Failed to update inventory levels" }
  }
}
// Add this to your POSActionFinal.ts file

export async function createPOSSession(data: {
  terminalId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance?: number
}) {
  try {
    const sessionNumber = `SES-${new Date().toISOString().slice(0, 10)}-${String(Date.now()).slice(-3)}`

    const session = await db.pOSSession.create({
      data: {
        sessionNumber,
        terminalId: data.terminalId,
        userId: data.userId,
        locationId: data.locationId,
        status: "ACTIVE",
        startTime: new Date(),
        openingBalance: data.openingBalance || 200.0,
        totalSales: 0,
        transactionCount: 0,
      },
    })

    // Create cash drawer entry if needed
    const cashDrawer = await db.cashDrawer.create({
      data: {
        name: `Drawer-${data.terminalId}-${Date.now()}`,
        drawerNumber: `DRW-${data.terminalId}-${Date.now()}`,
        terminalId: data.terminalId,
        locationId: data.locationId,
        currentBalance: data.openingBalance || 200.0,
        expectedBalance: data.openingBalance || 200.0,
        isOpen: true,
      },
    })

    // Link cash drawer to session
    await db.cashDrawerTransaction.create({
      data: {
        cashDrawerId: cashDrawer.id,
        sessionId: session.id,
        userId: data.userId,
        type: "OPENING_BALANCE",
        amount: data.openingBalance || 200.0,
        reason: "Session opened",
        balanceBefore: 0,
        balanceAfter: data.openingBalance || 200.0,
      },
    })

    return { success: true, data: session }
  } catch (error) {
    console.error("Failed to create POS session:", error)
    return { success: false, error: "Failed to create POS session" }
  }
}

export async function getActivePOSSession(terminalId: string) {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        terminalId,
        status: "ACTIVE",
      },
      include: {
        cashDrawerTransactions: {
          include: {
            cashDrawer: {
              select: {
                isOpen: true,
                id: true,
                currentBalance: true,
              }
            }
          },
        },
      },
    })

    return { success: true, data: session }
  } catch (error) {
    console.error("Failed to get active POS session:", error)
    return { success: false, error: "Failed to get active POS session" }
  }
}
export async function createInventoryTransactions(transactions: InventoryTransaction[]) {
  try {
    const createdTransactions = await db.inventoryTransaction.createMany({
      data: transactions.map((transaction) => ({
        itemId: transaction.itemId,
        locationId: transaction.locationId,
        type: transaction.type as any, // Cast to proper enum type
        quantity: transaction.quantity,
        unitCost: transaction.unitCost,
        balanceAfter: 0, // This would typically be calculated based on current inventory levels
        totalCost: transaction.totalCost,
        referenceType: transaction.referenceType as any, // Cast to proper enum type
        referenceId: transaction.referenceId,
        organizationId: transaction.organizationId,
        createdById: transaction.createdById,
        notes: `Sale transaction for ${Math.abs(transaction.quantity)} units`,
      })),
    })

    revalidatePath("/pos")
    return { success: true, data: createdTransactions }
  } catch (error) {
    console.error("Failed to create inventory transactions:", error)
    return { success: false, error: "Failed to create inventory transactions" }
  }
}


// Additional helper function for closing POS sessions
export async function closePOSSession(sessionId: string, closingBalance: number, userId: string) {
  try {
    const session = await db.pOSSession.update({
      where: { id: sessionId },
      data: {
        status: "CLOSED",
        endTime: new Date(),
        closingBalance: closingBalance,
      },
    })

    // Close associated cash drawer
    const cashDrawerTransaction = await db.cashDrawerTransaction.findFirst({
      where: { sessionId },
      include: { cashDrawer: true },
    })

    if (cashDrawerTransaction?.cashDrawer) {
      await db.cashDrawer.update({
        where: { id: cashDrawerTransaction.cashDrawerId },
        data: { isOpen: false },
      })

      // Record closing event
      await db.cashDrawerTransaction.create({
        data: {
          cashDrawerId: cashDrawerTransaction.cashDrawerId,
          sessionId,
          userId,
          type: "CLOSING_BALANCE",
          amount: closingBalance,
          reason: "Session closed",
          balanceBefore: cashDrawerTransaction.cashDrawer.currentBalance,
          balanceAfter: closingBalance,
        },
      })
    }

    return {
      success: true,
      data: session,
      message: `🏁 POS Session ${session.sessionNumber} closed successfully. Final sales: $${session.totalSales.toFixed(2)}`
    }
  } catch (error) {
    console.error("Failed to close POS session:", error)
    return {
      success: false,
      error: "Failed to close POS session",
      message: "Could not close the session. Please try again or contact support."
    }
  }
}