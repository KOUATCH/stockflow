"use server"

import { db } from "@/prisma/db";
import { PaymentMethod, TransactionReferenceType, TransactionType } from "@prisma/client";
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
    cashDrawer: {
      id: string
      name: string
      currentBalance: number
      isOpen: boolean
    }
  }
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
        customerId: data.customerId,
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


export async function createSale(
  saleData: SalesType,
  userId: string
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

    // Calculate change amount with null safety
    const totalPaid = saleData.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const changeAmount = Math.max(0, totalPaid - saleData.totalAmount)

    // Use database transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Create the sales order
      const sale = await tx.salesOrder.create({
        data: {
          orderNumber: saleNumber,
          sessionId: saleData.sessionId,
          terminalId: saleData.terminalId,
          createdById: userId,
          locationId: saleData.locationId,
          organizationId: saleData.organizationId,
          subtotal: saleData.subtotal,
          taxAmount: saleData.taxAmount,
          discount: saleData.discount,
          total: saleData.totalAmount,
          notes: saleData.notes,
          customerId: saleData.customerId,
          status: "CONFIRMED",
          paymentStatus: "PAID",
        },
      })

      // Create sale items and update inventory
      for (const item of saleData.lines) {
        // Validate required item properties
        if (!item.itemId || item.quantity === undefined || item.unitPrice === undefined) {
          throw new Error(`Invalid item data: missing required properties`)
        }

        const lineTotal = item.unitPrice * item.quantity - (item.discount || 0) + (item.taxAmount || 0)

        await tx.salesOrderLine.create({
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

        // Get current inventory level
        const inventoryLevel = await tx.inventoryLevel.findFirst({
          where: {
            itemId: item.itemId,
            locationId: saleData.locationId,
          },
        })

        // Update or create inventory level
        if (inventoryLevel) {
          const newQuantityOnHand = inventoryLevel.quantityOnHand - item.quantity
          const newQuantityAvailable = Math.max(0, inventoryLevel.quantityAvailable - item.quantity)

          await tx.inventoryLevel.update({
            where: { id: inventoryLevel.id },
            data: {
              quantityOnHand: newQuantityOnHand,
              quantityAvailable: newQuantityAvailable,
              lastTransactionAt: new Date(),
            },
          })

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              itemId: item.itemId,
              locationId: saleData.locationId,
              organizationId: saleData.organizationId,
              type: TransactionType.SALE,
              quantity: -item.quantity, // Negative for outbound
              unitCost: item.unitPrice,
              totalCost: item.unitPrice * item.quantity,
              balanceAfter: newQuantityOnHand,
              referenceType: TransactionReferenceType.SALES_ORDER,
              referenceId: sale.id,
              referenceNumber: saleNumber,
              createdById: userId,
              notes: `Sale transaction - ${item.quantity} units sold`,
            },
          })
        } else {
          // Create new inventory level if it doesn't exist
          await tx.inventoryLevel.create({
            data: {
              itemId: item.itemId,
              locationId: saleData.locationId,
              quantityOnHand: -item.quantity,
              quantityAvailable: 0,
              quantityReserved: 0,
              quantityInTransit: 0,
              quantityOnOrder: 0,
              reorderPoint: 0,
              averageCost: item.unitPrice,
              totalValue: 0,
              lastTransactionAt: new Date(),
            },
          })

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              itemId: item.itemId,
              locationId: saleData.locationId,
              organizationId: saleData.organizationId,
              type: TransactionType.SALE,
              quantity: -item.quantity,
              unitCost: item.unitPrice,
              totalCost: item.unitPrice * item.quantity,
              balanceAfter: -item.quantity,
              referenceType: TransactionReferenceType.SALES_ORDER,
              referenceId: sale.id,
              referenceNumber: saleNumber,
              createdById: userId,
              notes: `Sale transaction - ${item.quantity} units sold`,
            },
          })
        }
      }

      // Create payments
      for (const payment of saleData.payments) {
        // Validate payment data
        if (!payment.method || payment.amount === undefined || payment.amount <= 0) {
          throw new Error(`Invalid payment data: missing or invalid method/amount`)
        }

        const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        await tx.payment.create({
          data: {
            paymentNumber,
            salesOrderId: sale.id,
            method: payment.method as PaymentMethod,
            amount: payment.amount,
            cardLast4: payment.cardLastFour,
            cardType: payment.cardType,
            authorizationCode: payment.authorizationCode,
            status: "PAID",
            processedById: saleData.userId,
            processedAt: new Date(),
          },
        })
      }

      // Handle cash drawer updates for cash payments
      const cashPayments = saleData.payments.filter(p => p.method === "CASH")
      if (cashPayments.length > 0) {
        // Find the cash drawer for this session/terminal
        const cashDrawer = await tx.cashDrawer.findFirst({
          where: {
            terminalId: saleData.terminalId,
            locationId: saleData.locationId,
            isOpen: true,
          },
        })

        if (cashDrawer) {
          const totalCashPayment = cashPayments.reduce((sum, payment) => sum + payment.amount, 0)
          const netCashAmount = totalCashPayment - changeAmount
          const newBalance = cashDrawer.currentBalance + netCashAmount

          // Update cash drawer balance
          await tx.cashDrawer.update({
            where: { id: cashDrawer.id },
            data: {
              currentBalance: newBalance,
              expectedBalance: newBalance,
            },
          })

          // Prepare transaction data
          const transactionData: any = {
            cashDrawer: {
              connect: { id: cashDrawer.id }
            },
            session: {
              connect: { id: saleData.sessionId }
            },
            type: "SALE",
            amount: netCashAmount,
            reason: `Sale ${saleNumber}`,
            balanceBefore: cashDrawer.currentBalance,
            balanceAfter: newBalance,
          }

          // Add notes if change was given
          if (changeAmount > 0) {
            transactionData.notes = `Change given: $${changeAmount.toFixed(2)}`
          }

          // Only connect user if userId is provided and valid
          if (userId) {
            transactionData.user = {
              connect: { id: userId }
            }
          } else {
            console.warn('User ID not provided for cash drawer transaction, creating without user association')
          }

          // Record cash drawer transaction
          await tx.cashDrawerTransaction.create({
            data: transactionData
          })
        } else {
          console.warn(`No active cash drawer found for terminal ${saleData.terminalId}`)
        }



        //     // FIXED: Record cash drawer transaction with proper relation connections
        //     await tx.cashDrawerTransaction.create({
        //       data: {
        //         cashDrawer: {
        //           connect: { id: cashDrawer.id }
        //         },
        //         session: {
        //           connect: { id: saleData.sessionId }
        //         },
        //         User: {
        //           connect: { id: saleData.userId }
        //         },
        //         type: "SALE",
        //         amount: netCashAmount,
        //         reason: `Sale ${saleNumber}`,
        //         balanceBefore: cashDrawer.currentBalance,
        //         balanceAfter: newBalance,
        //         notes: changeAmount > 0 ? `Change given: $${changeAmount.toFixed(2)}` : undefined,
        //       },
        //     })
        //   } else {
        //     console.warn(`No active cash drawer found for terminal ${saleData.terminalId}`)
        //   }
        }

        // Update POS session totals
        const session = await tx.pOSSession.findUnique({
          where: { id: saleData.sessionId },
        })

        if (session) {
          await tx.pOSSession.update({
            where: { id: saleData.sessionId },
            data: {
              totalSales: session.totalSales + saleData.totalAmount,
              totalTax: session.totalTax + saleData.taxAmount,
              totalDiscount: session.totalDiscount + saleData.discount,
              transactionCount: session.transactionCount + 1,
              cashTotal: session.cashTotal + cashPayments.reduce((sum, p) => sum + p.amount, 0),
              cardTotal: session.cardTotal + saleData.payments.filter(p => p.method === "CARD").reduce((sum, p) => sum + p.amount, 0),
              digitalTotal: session.digitalTotal + saleData.payments.filter(p => p.method === "DIGITAL").reduce((sum, p) => sum + p.amount, 0),
            },
          })
        }

        return sale
      })

    revalidatePath("/dashboard/app/sales/pos")
    return { success: true, saleId: result.id }
  } catch (error) {
    console.error("Error creating sale:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create sale"
    }
  }
}
export async function createPayment(data: CreatePaymentData,userId: string) {
  try {
    const payment = await db.payment.create({
      data: {
        amount: data.amount,
        method: data.method,
        salesOrderId: data.salesOrderId,
        processedById: userId,
        status: "PAID",
        paymentNumber: `${data.method.toString().toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`,
        cardType: data.cardType,
        cardLast4: data.cardLast4,
        transactionId: data.transactionId,
        authorizationCode: data.authorizationCode,
        processedAt: new Date(),
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
          quantityAvailable: {
            decrement: update.quantityChange,
          },
          lastTransactionAt: new Date(),
        },
        create: {
          itemId: update.itemId,
          locationId: update.locationId,
          quantityOnHand: Math.max(0, -update.quantityChange),
          quantityAvailable: Math.max(0, -update.quantityChange),
          quantityReserved: 0,
          quantityInTransit: 0,
          quantityOnOrder: 0,
          reorderPoint: 0,
          averageCost: 0,
          totalValue: 0,
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

export async function createPOSSession(data: {
  terminalId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance?: number
}) {
  try {
    const sessionNumber = `SES-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`
    const openingBalance = data.openingBalance || 200.0

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: data.userId } })
      // Create the POS session
      const sessionData: any = {
        sessionNumber,
        terminalId: data.terminalId,
        locationId: data.locationId,
        status: "ACTIVE",
        startTime: new Date(),
        openingBalance: openingBalance,
        totalSales: 0,
        totalTax: 0,
        totalDiscount: 0,
        transactionCount: 0,
        cashTotal: 0,
        cardTotal: 0,
        digitalTotal: 0,
      };
      if (user?.id) {
        sessionData.userId = user.id;
      }
      const session = await tx.pOSSession.create({
        data: sessionData,
      })

      // Create or find existing cash drawer for this terminal
      let cashDrawer = await tx.cashDrawer.findFirst({
        where: {
          terminalId: data.terminalId,
          locationId: data.locationId,
        },
      })

      if (!cashDrawer) {
        cashDrawer = await tx.cashDrawer.create({
          data: {
            name: `Drawer-${data.terminalId}`,
            drawerNumber: `DRW-${data.terminalId}-${Date.now()}`,
            terminalId: data.terminalId,
            locationId: data.locationId,
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
          },
        })
      } else {
        // Update existing cash drawer
        await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
          },
        })
      }

      // In createPOSSession function, fix the cash drawer transaction creation:
      await tx.cashDrawerTransaction.create({
        data: {
          cashDrawer: {
            connect: { id: cashDrawer.id }
          },
          session: {
            connect: { id: session.id }
          },
          user: {
            connect: { id: user?.id }
          },
          type: "OPENING_BALANCE",
          amount: openingBalance,
          reason: "Session opened",
          balanceBefore: 0,
          balanceAfter: openingBalance,
        },
      })
      // // Create opening balance transaction
      // await tx.cashDrawerTransaction.create({
      //   data: {
      //     cashDrawerId: cashDrawer.id,
      //     sessionId: session.id,
      //     userId: data.userId,
      //     type: "OPENING_BALANCE",
      //     amount: openingBalance,
      //     reason: "Session opened",
      //     balanceBefore: 0,
      //     balanceAfter: openingBalance,
      //   },
      // })

      // Update terminal's current session
      await tx.pOSStation.update({
        where: { id: data.terminalId },
        data: { currentSessionId: session.id },
      })

      return session
    })

    revalidatePath("/dashboard/app/sales/pos")
    return { success: true, data: result }
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
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          },
        },
        terminal: {
          select: {
            id: true,
            name: true,
            terminalNumber: true,
          },
        },
        cashDrawerTransactions: {
          include: {
            cashDrawer: {
              select: {
                id: true,
                name: true,
                currentBalance: true,
                expectedBalance: true,
                isOpen: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
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
        organizationId: transaction.organizationId,
        type: transaction.type as TransactionType,
        quantity: transaction.quantity,
        unitCost: transaction.unitCost,
        totalCost: transaction.totalCost,
        balanceAfter: 0, // This should be calculated based on current inventory levels
        referenceType: transaction.referenceType as TransactionReferenceType,
        referenceId: transaction.referenceId,
        createdById: transaction.createdById,
        serialNumbers: transaction.serialNumbers,
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

export async function closePOSSession(
  sessionId: string,
  closingBalance: number,
  userId: string
) {
  try {
    const result = await db.$transaction(async (tx) => {
      // Get the current session
      const currentSession = await tx.pOSSession.findUnique({
        where: { id: sessionId },
        include: {
          cashDrawerTransactions: {
            include: { cashDrawer: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })

      if (!currentSession) {
        throw new Error("Session not found")
      }

      // Update session status
      const session = await tx.pOSSession.update({
        where: { id: sessionId },
        data: {
          status: "CLOSED",
          endTime: new Date(),
          closingBalance: closingBalance,
          expectedBalance: currentSession.openingBalance + currentSession.totalSales,
          variance: closingBalance - (currentSession.openingBalance + currentSession.totalSales),
        },
      })

      // Close associated cash drawer
      const cashDrawerTransaction = currentSession.cashDrawerTransactions[0]
      if (cashDrawerTransaction?.cashDrawer) {
        await tx.cashDrawer.update({
          where: { id: cashDrawerTransaction.cashDrawerId },
          data: {
            isOpen: false,
            currentBalance: closingBalance,
          },
        })

        // In createPOSSession function, fix the cash drawer transaction creation:
        await tx.cashDrawerTransaction.create({
          data: {
            cashDrawer: {
              connect: { id: cashDrawerTransaction.cashDrawerId }
            },
            session: {
              connect: { id: session.id }
            },
            user: {
              connect: { id: userId }
            },
            type: "CLOSING_BALANCE",
            amount: closingBalance,
            reason: "Session closed",
            balanceBefore: cashDrawerTransaction.cashDrawer.currentBalance,
            balanceAfter: closingBalance,
          },
        })

        // // Record closing event
        // await tx.cashDrawerTransaction.create({
        //   data: {
        //     cashDrawerId: cashDrawerTransaction.cashDrawerId,
        //     sessionId,
        //     userId,
        //     type: "CLOSING_BALANCE",
        //     amount: closingBalance,
        //     reason: "Session closed",
        //     balanceBefore: cashDrawerTransaction.cashDrawer.currentBalance,
        //     balanceAfter: closingBalance,
        //   },
        // })
      }

      // Clear terminal's current session
      await tx.pOSStation.update({
        where: { id: currentSession.terminalId },
        data: { currentSessionId: null },
      })

      return session
    })

    revalidatePath("/dashboard/session-pos-sync")
    return {
      success: true,
      data: result,
      message: `POS Session ${result.sessionNumber} closed successfully. Final sales: $${result.totalSales.toFixed(2)}, Variance: $${(result.variance || 0).toFixed(2)}`
    }
  } catch (error) {
    console.error("Failed to close POS session:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to close POS session",
      message: "Could not close the session. Please try again or contact support."
    }
  }
}