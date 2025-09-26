"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

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

// Create a new sale
export async function createSale(
  saleData: CreateSaleData,
): Promise<{ success: boolean; saleId?: string; error?: string }> {
  try {
    // Generate sale number
    const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const receiptNumber = `RCP-${Date.now()}`

    // Calculate change amount
    const totalPaid = saleData.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const changeAmount = Math.max(0, totalPaid - saleData.totalAmount)

    const saleDataObj: any = {
      orderNumber: saleNumber,
      sessionId: saleData.sessionId,
      terminalId: saleData.terminalId,
      createdById: saleData.userId,
      locationId: saleData.locationId,
      organizationId: saleData.organizationId,
      subtotal: saleData.subtotal,
      taxAmount: saleData.taxAmount,
      discount: saleData.discountAmount,
      total: saleData.totalAmount,
      notes: saleData.notes,
    }
    if (saleData.customerId) {
      saleDataObj.customerId = saleData.customerId
    }

    const sale = await db.salesOrder.create({
      data: saleDataObj,
    })

    // Create sale items and update inventory
    for (const item of saleData.items) {
      const lineTotal = item.unitPrice * item.quantity - (item.discountAmount || 0) + (item.taxAmount || 0)

      await db.salesOrderLine.create({
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
          method: payment.method === "cash" ? "CASH" : "CARD",
          amount: payment.amount,
          cardLast4: payment.cardLastFour,
          cardType: payment.cardType,
          authorizationCode: payment.authorizationCode,
          status: "PAID",
        },
      })

      // If cash payment, update cash drawer
      if (payment.method === "cash") {
        const session = await db.pOSSession.findUnique({
          where: { id: saleData.sessionId },
          include: {
            cashDrawerTransactions: {
              include: {
                cashDrawer: {
                  select: {
                    id: true,
                    currentBalance: true

                  }
                }
              }
            }
          },
        },)

        if (session?.cashDrawerTransactions[0]?.cashDrawer) {
          const currentBalance = session.cashDrawerTransactions[0].cashDrawer.currentBalance
          const newBalance = currentBalance + payment.amount - changeAmount

          await db.cashDrawer.update({
            where: { id: session.cashDrawerTransactions[0].cashDrawerId },
            data: {
              currentBalance: newBalance,
              expectedBalance: newBalance,
            },
          })

          // Record cash drawer transaction
          await db.cashDrawerTransaction.create({
            data: {
              cashDrawerId: session?.cashDrawerTransactions[0]?.cashDrawerId,
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

    revalidatePath("/pos")
    return { success: true, saleId: sale.id }
  } catch (error) {
    console.error("Error creating sale:", error)
    return { success: false, error: "Failed to create sale" }
  }
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
      subtotal: sale.subtotal,
      taxAmount: sale.taxAmount,
      discountAmount: sale.discount ?? 0,
      totalAmount: sale.total,
      amountPaid: sale.payments?.reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0) ?? 0,
      changeAmount: sale.changeAmount ?? 0,
      notes: sale.notes ?? undefined,
      receiptNumber: sale.receiptNumber ?? undefined,
      createdAt: sale.createdAt,
      items: sale.lines.map((line: any) => ({
        id: line.id,
        itemId: line.itemId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountAmount: line.discount ?? 0,
        taxAmount: line.taxAmount ?? 0,
        lineTotal: line.lineTotal ?? (line.unitPrice * line.quantity - (line.discount ?? 0) + (line.taxAmount ?? 0)),
        item: {
          name: line.item?.name ?? "",
          sku: line.item?.sku ?? "",
        },
      })),
      payments: sale.payments.map((payment: any) => ({
        id: payment.id,
        paymentMethod: payment.method,
        amount: payment.amount,
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

    return sale as Sale | null
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
        payments:
        {
          where: {
            method: "CASH"

          }
        },
      },
    })

    if (!sale) {
      return { success: false, error: "Sale not found" }
    }

    if (sale?.createdAt && (new Date().getTime() - sale.createdAt.getTime()) > 24 * 60 * 60 * 1000) {
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
              quantityOnHand: inventoryLevel.quantityOnHand + item.quantity,
              quantityAvailable: inventoryLevel.quantityAvailable + item.quantity,
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
              cashDrawerTransactions:{
                include: {
                  cashDrawer: true },
              }}
          })
        }

        if (session?.cashDrawerTransactions[0]?.cashDrawer) {
          const totalCashAmount = cashPayments.reduce((sum, p) => sum + p.amount, 0)
          const currentBalance = session.cashDrawerTransactions[0]?.cashDrawer?.currentBalance ?? 0
          const changeGiven = sale?.payments && sale.payments.length > 0 && sale.payments[0]?.changeGiven ? sale.payments[0].changeGiven : 0
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
