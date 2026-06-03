"use server"

import { randomUUID } from "crypto"

import type { CreatePosStationInput, UpdatePosStationInput } from "@/lib/validations/pos-station"
import { posStationSchema, updatePosStationSchema } from "@/lib/validations/pos-station"
import { db } from "@/prisma/db"
import {
  CashDrawerTransactionType,
  PaymentMethod,
  PaymentStatus,
  POSSessionStatus,
  Prisma,
  SalesOrderStatus,
  TransactionReferenceType,
  TransactionType,
} from "@prisma/client"
import { revalidatePath } from "next/cache"

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
  organizationId: string
  locationId: string
  stationId: string
  createdById: string
  customerId?: string
  sessionId: string
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
  stationId: string
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

const POS_REVALIDATION_PATHS = [
  "/[locale]/dashboard/session-pos-sync",
  "/[locale]/dashboard/posStation",
  "/[locale]/dashboard/pos-system",
  "/[locale]/dashboard/app/sales/pos",
] as const

function revalidatePOSPaths() {
  for (const path of POS_REVALIDATION_PATHS) {
    revalidatePath(path, "page")
  }
}

function createId() {
  return randomUUID()
}

function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0
  }

  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    return Number(value) || 0
  }

  return value.toNumber()
}

function generateNumber(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function toPaymentMethod(method: "CASH" | "CARD" | "DIGITAL" | PaymentMethod): PaymentMethod {
  if (method === "DIGITAL") {
    return PaymentMethod.MOBILE_MONEY
  }

  return method as PaymentMethod
}

function mapPOSSessionForClient(session: any) {
  if (!session) {
    return null
  }

  return {
    ...session,
    stationId: session.terminalId,
    digitalTotal: toNumber(session.mobileMoneyTotal),
    openingBalance: toNumber(session.openingBalance),
    closingBalance: toNumber(session.closingBalance),
    expectedBalance: toNumber(session.expectedBalance),
    variance: toNumber(session.variance),
    totalSales: toNumber(session.totalSales),
    totalTax: toNumber(session.totalTax),
    totalDiscount: toNumber(session.totalDiscount),
    cashTotal: toNumber(session.cashTotal),
    cardTotal: toNumber(session.cardTotal),
    mobileMoneyTotal: toNumber(session.mobileMoneyTotal),
    bankTransferTotal: toNumber(session.bankTransferTotal),
    creditTotal: toNumber(session.creditTotal),
    station: session.terminal
      ? {
          ...session.terminal,
          stationNumber: session.terminal.terminalNumber,
        }
      : undefined,
    cashDrawerTransactions: session.cashDrawerTransactions?.map((transaction: any) => ({
      ...transaction,
      amount: toNumber(transaction.amount),
      balanceBefore: toNumber(transaction.balanceBefore),
      balanceAfter: toNumber(transaction.balanceAfter),
      cashDrawer: transaction.cashDrawer
        ? {
            ...transaction.cashDrawer,
            currentBalance: toNumber(transaction.cashDrawer.currentBalance),
            expectedBalance: toNumber(transaction.cashDrawer.expectedBalance),
          }
        : transaction.cashDrawer,
    })),
  }
}

function mapPOSStationForClient(station: any) {
  if (!station) {
    return null
  }

  return {
    ...station,
    stationNumber: station.terminalNumber,
  }
}

function mapCashDrawerForClient(cashDrawer: any) {
  if (!cashDrawer) {
    return null
  }

  return {
    ...cashDrawer,
    stationId: cashDrawer.terminalId,
    currentBalance: toNumber(cashDrawer.currentBalance),
    expectedBalance: toNumber(cashDrawer.expectedBalance),
    station: cashDrawer.terminal
      ? {
          ...cashDrawer.terminal,
          stationNumber: cashDrawer.terminal.terminalNumber,
        }
      : undefined,
    transactions: cashDrawer.transactions?.map((transaction: any) => ({
      ...transaction,
      amount: toNumber(transaction.amount),
      balanceBefore: toNumber(transaction.balanceBefore),
      balanceAfter: toNumber(transaction.balanceAfter),
    })),
  }
}

async function resolveCustomerId(
  tx: Prisma.TransactionClient,
  organizationId: string,
  customerId?: string
) {
  if (customerId?.trim()) {
    return customerId
  }

  const existingCustomer = await tx.customer.findFirst({
    where: {
      organizationId,
      code: "WALK-IN",
      deletedAt: null,
    },
    select: { id: true },
  })

  if (existingCustomer) {
    return existingCustomer.id
  }

  const customer = await tx.customer.create({
    data: {
      id: createId(),
      name: "Walk-in Customer",
      code: "WALK-IN",
      organizationId,
      updatedAt: new Date(),
    },
    select: { id: true },
  })

  return customer.id
}

async function generateTerminalNumber(organizationId: string): Promise<string> {
  const terminalNumber = generateNumber("POS")
  const existing = await db.pOSStation.findFirst({
    where: {
      organizationId,
      terminalNumber,
    },
    select: { id: true },
  })

  return existing ? generateTerminalNumber(organizationId) : terminalNumber
}

async function findTerminalOrThrow(
  tx: Prisma.TransactionClient,
  terminalId: string
) {
  const terminal = await tx.pOSStation.findUnique({
    where: { id: terminalId },
    select: {
      id: true,
      name: true,
      terminalNumber: true,
      locationId: true,
      organizationId: true,
    },
  })

  if (!terminal) {
    throw new Error("POS terminal not found")
  }

  return terminal
}

async function findOpenCashDrawer(tx: Prisma.TransactionClient, terminalId: string) {
  return tx.cashDrawer.findFirst({
    where: {
      terminalId,
      isOpen: true,
    },
  })
}

export async function createSalesOrder(data: CreateSalesOrderData) {
  try {
    if (!data.lines.length) {
      return { success: false, error: "At least one sales order line is required" }
    }

    const now = new Date()
    const salesOrder = await db.salesOrder.create({
      data: {
        id: createId(),
        customerId: data.customerId,
        locationId: data.locationId,
        organizationId: data.organizationId,
        createdById: data.createdById,
        subtotal: data.subtotal,
        orderNumber: data.orderNumber,
        taxAmount: data.taxAmount,
        discount: data.discount,
        total: data.total,
        status: SalesOrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PENDING,
        updatedAt: now,
        lines: {
          create: data.lines.map((line) => ({
            id: createId(),
            itemId: line.itemId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount,
            taxRate: line.taxRate,
            taxAmount: line.taxAmount,
            lineTotal: line.lineTotal,
            updatedAt: now,
          })),
        },
      },
      include: {
        lines: true,
      },
    })

    revalidatePOSPaths()
    return { success: true, data: salesOrder }
  } catch (error) {
    console.error("Failed to create sales order:", error)
    return { success: false, error: "Failed to create sales order" }
  }
}

export async function createSale(
  saleData: CreateSaleData,
  userId: string
): Promise<{ success: boolean; data?: { id: string }; saleId?: string; error?: string }> {
  try {
    if (!saleData.payments?.length) {
      return { success: false, error: "At least one payment method is required" }
    }

    if (!saleData.lines?.length) {
      return { success: false, error: "At least one sale item is required" }
    }

    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    if (!saleData.organizationId || !saleData.locationId || !saleData.stationId || !saleData.sessionId) {
      return { success: false, error: "Organization, location, terminal, and session IDs are required" }
    }

    const saleNumber = generateNumber("SALE")
    const totalPaid = saleData.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const changeAmount = Math.max(0, totalPaid - saleData.totalAmount)

    const result = await db.$transaction(async (tx) => {
      const now = new Date()
      const customerId = await resolveCustomerId(tx, saleData.organizationId, saleData.customerId)

      const sale = await tx.salesOrder.create({
        data: {
          id: createId(),
          orderNumber: saleNumber,
          sessionId: saleData.sessionId,
          terminalId: saleData.stationId,
          createdById: userId,
          customerId,
          locationId: saleData.locationId,
          organizationId: saleData.organizationId,
          subtotal: saleData.subtotal,
          taxAmount: saleData.taxAmount,
          discount: saleData.discount,
          total: saleData.totalAmount,
          notes: saleData.notes,
          status: SalesOrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          updatedAt: now,
          lines: {
            create: saleData.lines.map((line) => ({
              id: createId(),
              itemId: line.itemId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              discount: line.discount || 0,
              taxRate: line.taxRate || 0,
              taxAmount: line.taxAmount || 0,
              lineTotal: line.lineTotal || line.unitPrice * line.quantity - (line.discount || 0) + (line.taxAmount || 0),
              updatedAt: now,
            })),
          },
        },
      })

      for (const line of saleData.lines) {
        const inventoryLevel = await tx.inventoryLevel.findUnique({
          where: {
            itemId_locationId: {
              itemId: line.itemId,
              locationId: saleData.locationId,
            },
          },
        })

        const currentOnHand = toNumber(inventoryLevel?.quantityOnHand)
        const currentAvailable = toNumber(inventoryLevel?.quantityAvailable)
        const newQuantityOnHand = currentOnHand - line.quantity
        const newQuantityAvailable = Math.max(0, currentAvailable - line.quantity)

        if (inventoryLevel) {
          await tx.inventoryLevel.update({
            where: { id: inventoryLevel.id },
            data: {
              quantityOnHand: newQuantityOnHand,
              quantityAvailable: newQuantityAvailable,
              totalValue: Math.max(0, newQuantityOnHand) * toNumber(inventoryLevel.averageCost),
              lastTransactionAt: now,
              updatedAt: now,
            },
          })
        } else {
          await tx.inventoryLevel.create({
            data: {
              id: createId(),
              itemId: line.itemId,
              locationId: saleData.locationId,
              quantityOnHand: newQuantityOnHand,
              quantityAvailable: newQuantityAvailable,
              quantityReserved: 0,
              quantityInTransit: 0,
              quantityOnOrder: 0,
              reorderPoint: 0,
              averageCost: line.unitPrice,
              totalValue: Math.max(0, newQuantityOnHand) * line.unitPrice,
              lastTransactionAt: now,
              updatedAt: now,
            },
          })
        }

        await tx.inventoryTransaction.create({
          data: {
            id: createId(),
            itemId: line.itemId,
            locationId: saleData.locationId,
            organizationId: saleData.organizationId,
            type: TransactionType.SALE,
            quantity: -line.quantity,
            unitCost: line.unitPrice,
            totalCost: line.unitPrice * line.quantity,
            balanceAfter: newQuantityOnHand,
            referenceType: TransactionReferenceType.SALES_ORDER,
            referenceId: sale.id,
            referenceNumber: saleNumber,
            createdById: userId,
            serialNumbers: [],
            notes: `Sale transaction - ${line.quantity} units sold`,
          },
        })
      }

      for (const payment of saleData.payments) {
        if (!payment.method || payment.amount <= 0) {
          throw new Error("Each payment must include a valid method and amount")
        }

        await tx.payment.create({
          data: {
            id: createId(),
            paymentNumber: generateNumber("PAY"),
            salesOrderId: sale.id,
            organizationId: saleData.organizationId,
            method: toPaymentMethod(payment.method),
            amount: payment.amount,
            cardLast4: payment.cardLastFour,
            cardType: payment.cardType,
            transactionId: payment.referenceNumber,
            authorizationCode: payment.authorizationCode,
            status: PaymentStatus.PAID,
            processedById: userId,
            processedAt: now,
            updatedAt: now,
          },
        })
      }

      const cashPaymentsTotal = saleData.payments
        .filter((payment) => payment.method === "CASH")
        .reduce((sum, payment) => sum + payment.amount, 0)

      if (cashPaymentsTotal > 0) {
        const cashDrawer = await tx.cashDrawer.findFirst({
          where: {
            terminalId: saleData.stationId,
            locationId: saleData.locationId,
            isOpen: true,
          },
        })

        if (cashDrawer) {
          const balanceBefore = toNumber(cashDrawer.currentBalance)
          const netCashAmount = cashPaymentsTotal - changeAmount
          const balanceAfter = balanceBefore + netCashAmount

          await tx.cashDrawer.update({
            where: { id: cashDrawer.id },
            data: {
              currentBalance: balanceAfter,
              expectedBalance: balanceAfter,
              updatedAt: now,
            },
          })

          await tx.cashDrawerTransaction.create({
            data: {
              id: createId(),
              cashDrawerId: cashDrawer.id,
              sessionId: saleData.sessionId,
              userId,
              type: CashDrawerTransactionType.SALE,
              amount: netCashAmount,
              reason: `Sale ${saleNumber}`,
              notes: changeAmount > 0 ? `Change given: ${changeAmount.toFixed(2)}` : undefined,
              balanceBefore,
              balanceAfter,
            },
          })
        }
      }

      const session = await tx.pOSSession.findUnique({
        where: { id: saleData.sessionId },
        select: { id: true },
      })

      if (session) {
        const cardTotal = saleData.payments
          .filter((payment) => payment.method === "CARD")
          .reduce((sum, payment) => sum + payment.amount, 0)
        const mobileMoneyTotal = saleData.payments
          .filter((payment) => payment.method === "DIGITAL")
          .reduce((sum, payment) => sum + payment.amount, 0)

        await tx.pOSSession.update({
          where: { id: saleData.sessionId },
          data: {
            totalSales: { increment: saleData.totalAmount },
            totalTax: { increment: saleData.taxAmount },
            totalDiscount: { increment: saleData.discount },
            transactionCount: { increment: 1 },
            cashTotal: { increment: cashPaymentsTotal },
            cardTotal: { increment: cardTotal },
            mobileMoneyTotal: { increment: mobileMoneyTotal },
            updatedAt: now,
          },
        })
      }

      return sale
    })

    revalidatePOSPaths()
    return {
      success: true,
      data: { id: result.id },
      saleId: result.id,
    }
  } catch (error) {
    console.error("[CREATE_SALE] Error creating sale:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create sale",
    }
  }
}

export async function createPayment(data: CreatePaymentData, userId: string) {
  try {
    const salesOrder = await db.salesOrder.findUnique({
      where: { id: data.salesOrderId },
      select: { organizationId: true },
    })

    if (!salesOrder) {
      return { success: false, error: "Sales order not found" }
    }

    const payment = await db.payment.create({
      data: {
        id: createId(),
        amount: data.amount,
        method: data.method,
        salesOrderId: data.salesOrderId,
        organizationId: salesOrder.organizationId,
        processedById: userId,
        status: PaymentStatus.PAID,
        paymentNumber: generateNumber(data.method.toString().toUpperCase().slice(0, 3)),
        cardType: data.cardType,
        cardLast4: data.cardLast4,
        transactionId: data.transactionId,
        authorizationCode: data.authorizationCode,
        processedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    revalidatePOSPaths()
    return { success: true, data: payment }
  } catch (error) {
    console.error("Failed to create payment:", error)
    return { success: false, error: "Failed to create payment" }
  }
}

export async function updateInventoryLevels(updates: InventoryUpdate[]) {
  try {
    for (const update of updates) {
      const existingLevel = await db.inventoryLevel.findUnique({
        where: {
          itemId_locationId: {
            itemId: update.itemId,
            locationId: update.locationId,
          },
        },
      })

      const quantityOnHand = toNumber(existingLevel?.quantityOnHand) + update.quantityChange
      const quantityAvailable = Math.max(0, toNumber(existingLevel?.quantityAvailable) + update.quantityChange)

      await db.inventoryLevel.upsert({
        where: {
          itemId_locationId: {
            itemId: update.itemId,
            locationId: update.locationId,
          },
        },
        update: {
          quantityOnHand,
          quantityAvailable,
          lastTransactionAt: new Date(),
          updatedAt: new Date(),
        },
        create: {
          id: createId(),
          itemId: update.itemId,
          locationId: update.locationId,
          quantityOnHand,
          quantityAvailable,
          quantityReserved: 0,
          quantityInTransit: 0,
          quantityOnOrder: 0,
          reorderPoint: 0,
          averageCost: 0,
          totalValue: 0,
          lastTransactionAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }

    revalidatePOSPaths()
    return { success: true }
  } catch (error) {
    console.error("Failed to update inventory levels:", error)
    return { success: false, error: "Failed to update inventory levels" }
  }
}

export async function createPOSSession(data: {
  stationId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance?: number
}) {
  try {
    const sessionNumber = generateNumber("SES")
    const openingBalance = data.openingBalance ?? 200

    const result = await db.$transaction(async (tx) => {
      const now = new Date()
      const user = await tx.user.findUnique({ where: { id: data.userId }, select: { id: true } })
      if (!user) {
        throw new Error("User not found")
      }

      await findTerminalOrThrow(tx, data.stationId)

      const session = await tx.pOSSession.create({
        data: {
          id: createId(),
          sessionNumber,
          terminalId: data.stationId,
          userId: data.userId,
          locationId: data.locationId,
          organizationId: data.organizationId,
          status: POSSessionStatus.ACTIVE,
          startTime: now,
          openingBalance,
          totalSales: 0,
          totalTax: 0,
          totalDiscount: 0,
          transactionCount: 0,
          cashTotal: 0,
          cardTotal: 0,
          mobileMoneyTotal: 0,
          bankTransferTotal: 0,
          creditTotal: 0,
          updatedAt: now,
        },
        include: {
          terminal: true,
          cashDrawerTransactions: {
            include: { cashDrawer: true },
          },
        },
      })

      let cashDrawer = await tx.cashDrawer.findFirst({
        where: {
          terminalId: data.stationId,
          locationId: data.locationId,
        },
      })

      if (!cashDrawer) {
        cashDrawer = await tx.cashDrawer.create({
          data: {
            id: createId(),
            name: `Drawer-${data.stationId}`,
            drawerNumber: generateNumber("DRW"),
            terminalId: data.stationId,
            locationId: data.locationId,
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
            updatedAt: now,
          },
        })
      } else {
        cashDrawer = await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
            updatedAt: now,
          },
        })
      }

      await tx.cashDrawerTransaction.create({
        data: {
          id: createId(),
          cashDrawerId: cashDrawer.id,
          sessionId: session.id,
          userId: user.id,
          type: CashDrawerTransactionType.OPENING_BALANCE,
          amount: openingBalance,
          reason: "Session opened",
          balanceBefore: 0,
          balanceAfter: openingBalance,
        },
      })

      await tx.pOSStation.update({
        where: { id: data.stationId },
        data: {
          currentSessionId: session.id,
          updatedAt: now,
        },
      })

      return session
    })

    revalidatePOSPaths()
    return { success: true, data: mapPOSSessionForClient(result) }
  } catch (error) {
    console.error("Failed to create POS session:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create POS session",
    }
  }
}

export async function getActivePOSSession(stationId: string) {
  try {
    const session = await db.pOSSession.findFirst({
      where: {
        terminalId: stationId,
        status: POSSessionStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    return { success: true, data: mapPOSSessionForClient(session) }
  } catch (error) {
    console.error("Failed to get active POS session:", error)
    return { success: false, error: "Failed to get active POS session" }
  }
}

export async function createInventoryTransactions(transactions: InventoryTransaction[]) {
  try {
    const createdTransactions = await db.inventoryTransaction.createMany({
      data: transactions.map((transaction) => ({
        id: createId(),
        itemId: transaction.itemId,
        locationId: transaction.locationId,
        organizationId: transaction.organizationId,
        type: transaction.type as TransactionType,
        quantity: transaction.quantity,
        unitCost: transaction.unitCost,
        totalCost: transaction.totalCost,
        balanceAfter: transaction.quantity,
        referenceType: transaction.referenceType as TransactionReferenceType,
        referenceId: transaction.referenceId,
        createdById: transaction.createdById,
        serialNumbers: transaction.serialNumbers ?? [],
        notes: `Inventory transaction for ${Math.abs(transaction.quantity)} units`,
      })),
    })

    revalidatePOSPaths()
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
      const now = new Date()
      const currentSession = await tx.pOSSession.findUnique({
        where: { id: sessionId },
        include: {
          terminal: true,
          cashDrawerTransactions: {
            include: { cashDrawer: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      })

      if (!currentSession) {
        throw new Error("Session not found")
      }

      const expectedBalance = toNumber(currentSession.openingBalance) + toNumber(currentSession.cashTotal)
      const variance = closingBalance - expectedBalance

      const session = await tx.pOSSession.update({
        where: { id: sessionId },
        data: {
          status: POSSessionStatus.CLOSED,
          endTime: now,
          closingBalance,
          expectedBalance,
          variance,
          updatedAt: now,
        },
        include: {
          terminal: true,
          cashDrawerTransactions: {
            include: { cashDrawer: true },
          },
        },
      })

      const cashDrawer = await tx.cashDrawer.findFirst({
        where: {
          terminalId: currentSession.terminalId,
          isOpen: true,
        },
      })

      if (cashDrawer) {
        const balanceBefore = toNumber(cashDrawer.currentBalance)

        await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            isOpen: false,
            currentBalance: closingBalance,
            expectedBalance,
            updatedAt: now,
          },
        })

        await tx.cashDrawerTransaction.create({
          data: {
            id: createId(),
            cashDrawerId: cashDrawer.id,
            sessionId,
            userId,
            type: CashDrawerTransactionType.CLOSING_BALANCE,
            amount: closingBalance,
            reason: "Session closed",
            balanceBefore,
            balanceAfter: closingBalance,
          },
        })
      }

      await tx.pOSStation.update({
        where: { id: currentSession.terminalId },
        data: {
          currentSessionId: null,
          updatedAt: now,
        },
      })

      return session
    })

    const mappedResult = mapPOSSessionForClient(result)
    revalidatePOSPaths()
    return {
      success: true,
      data: mappedResult,
      message: `POS Session ${mappedResult.sessionNumber} closed successfully. Final sales: $${mappedResult.totalSales.toFixed(2)}, Variance: $${mappedResult.variance.toFixed(2)}`,
    }
  } catch (error) {
    console.error("Failed to close POS session:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to close POS session",
      message: "Could not close the session. Please try again or contact support.",
    }
  }
}

export async function createPosStation(input: CreatePosStationInput) {
  try {
    const validatedInput = posStationSchema.parse(input)

    const organization = await db.organization.findUnique({
      where: { id: validatedInput.organizationId },
      select: { id: true },
    })

    if (!organization) {
      return { success: false, error: "Organization not found" }
    }

    const location = await db.location.findFirst({
      where: {
        id: validatedInput.locationId,
        organizationId: validatedInput.organizationId,
      },
      select: { id: true },
    })

    if (!location) {
      return { success: false, error: "Location not found or does not belong to the specified organization" }
    }

    const terminalNumber = validatedInput.terminalNumber || await generateTerminalNumber(validatedInput.organizationId)
    const posStation = await db.pOSStation.create({
      data: {
        id: createId(),
        name: validatedInput.name,
        terminalNumber,
        isActive: validatedInput.isActive,
        hasCashDrawer: validatedInput.hasCashDrawer,
        locationId: validatedInput.locationId,
        organizationId: validatedInput.organizationId,
        updatedAt: new Date(),
      },
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
    })

    revalidatePOSPaths()
    return {
      success: true,
      data: mapPOSStationForClient(posStation),
    }
  } catch (error) {
    console.error("Error creating POS station:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create POS station",
    }
  }
}

export async function getPosStations(organizationId?: string) {
  try {
    const posStations = await db.pOSStation.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: posStations.map(mapPOSStationForClient),
    }
  } catch (error) {
    console.error("Error fetching POS stations:", error)
    return {
      success: false,
      error: "Failed to fetch POS stations",
    }
  }
}

export async function getPosStationById(id: string) {
  try {
    const posStation = await db.pOSStation.findUnique({
      where: { id },
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
    })

    if (!posStation) {
      return {
        success: false,
        error: "POS station not found",
      }
    }

    return {
      success: true,
      data: mapPOSStationForClient(posStation),
    }
  } catch (error) {
    console.error("Error fetching POS station:", error)
    return {
      success: false,
      error: "Failed to fetch POS station",
    }
  }
}

export async function updatePosStation(input: UpdatePosStationInput) {
  try {
    const validatedInput = updatePosStationSchema.parse(input)
    const { id, ...updateData } = validatedInput

    const existingStation = await db.pOSStation.findUnique({
      where: { id },
      select: { organizationId: true },
    })

    if (!existingStation) {
      return {
        success: false,
        error: "POS station not found",
      }
    }

    if (updateData.locationId) {
      const organizationId = updateData.organizationId ?? existingStation.organizationId
      const location = await db.location.findFirst({
        where: {
          id: updateData.locationId,
          organizationId,
        },
        select: { id: true },
      })

      if (!location) {
        return {
          success: false,
          error: "Location not found or does not belong to the specified organization",
        }
      }
    }

    const updatedStation = await db.pOSStation.update({
      where: { id },
      data: {
        name: updateData.name,
        terminalNumber: updateData.terminalNumber,
        isActive: updateData.isActive,
        hasCashDrawer: updateData.hasCashDrawer,
        locationId: updateData.locationId,
        organizationId: updateData.organizationId,
        updatedAt: new Date(),
      },
      include: {
        location: {
          select: { id: true, name: true },
        },
        organization: {
          select: { id: true, name: true },
        },
        currentSession: {
          select: { id: true, sessionNumber: true, status: true },
        },
      },
    })

    revalidatePOSPaths()
    return {
      success: true,
      data: mapPOSStationForClient(updatedStation),
    }
  } catch (error) {
    console.error("Error updating POS station:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update POS station",
    }
  }
}

export async function deletePosStation(id: string) {
  try {
    const existingStation = await db.pOSStation.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existingStation) {
      return {
        success: false,
        error: "POS station not found",
      }
    }

    await db.pOSStation.update({
      where: { id },
      data: {
        isActive: false,
        currentSessionId: null,
        updatedAt: new Date(),
      },
    })

    revalidatePOSPaths()
    return {
      success: true,
      message: "POS station deactivated successfully",
    }
  } catch (error) {
    console.error("Error deactivating POS station:", error)
    return {
      success: false,
      error: "Failed to deactivate POS station",
    }
  }
}

export async function getOrganizations() {
  try {
    const organizations = await db.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return {
      success: true,
      data: organizations,
    }
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return {
      success: false,
      error: "Failed to fetch organizations",
    }
  }
}

export async function getLocationsByOrganization(organizationId: string) {
  try {
    const locations = await db.location.findMany({
      where: { organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return {
      success: true,
      data: locations,
    }
  } catch (error) {
    console.error("Error fetching locations:", error)
    return {
      success: false,
      error: "Failed to fetch locations",
    }
  }
}

export async function getCashDrawerByStationId(stationId: string) {
  try {
    const cashDrawer = await db.cashDrawer.findFirst({
      where: { terminalId: stationId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        terminal: {
          select: { id: true, name: true, terminalNumber: true },
        },
      },
    })

    return {
      success: true,
      data: mapCashDrawerForClient(cashDrawer),
    }
  } catch (error) {
    console.error("Error fetching cash drawer:", error)
    return {
      success: false,
      error: "Failed to fetch cash drawer",
    }
  }
}

export async function openCashDrawer(stationId: string, userId: string, openingBalance: number) {
  try {
    const result = await db.$transaction(async (tx) => {
      const now = new Date()
      const terminal = await findTerminalOrThrow(tx, stationId)
      let cashDrawer = await tx.cashDrawer.findFirst({
        where: { terminalId: stationId },
      })

      if (!cashDrawer) {
        cashDrawer = await tx.cashDrawer.create({
          data: {
            id: createId(),
            name: `Drawer-${terminal.terminalNumber}`,
            drawerNumber: generateNumber("DRW"),
            terminalId: stationId,
            locationId: terminal.locationId,
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
            updatedAt: now,
          },
        })
      } else {
        cashDrawer = await tx.cashDrawer.update({
          where: { id: cashDrawer.id },
          data: {
            currentBalance: openingBalance,
            expectedBalance: openingBalance,
            isOpen: true,
            updatedAt: now,
          },
        })
      }

      await tx.cashDrawerTransaction.create({
        data: {
          id: createId(),
          cashDrawerId: cashDrawer.id,
          userId,
          type: CashDrawerTransactionType.OPENING_BALANCE,
          amount: openingBalance,
          reason: "Cash drawer opened",
          balanceBefore: 0,
          balanceAfter: openingBalance,
        },
      })

      return cashDrawer
    })

    revalidatePOSPaths()
    return {
      success: true,
      data: mapCashDrawerForClient(result),
      message: `Cash drawer opened with balance: $${openingBalance.toFixed(2)}`,
    }
  } catch (error) {
    console.error("Error opening cash drawer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to open cash drawer",
    }
  }
}

export async function closeCashDrawer(stationId: string, userId: string, closingBalance: number) {
  try {
    const result = await db.$transaction(async (tx) => {
      const now = new Date()
      const cashDrawer = await findOpenCashDrawer(tx, stationId)

      if (!cashDrawer) {
        throw new Error("No open cash drawer found for this terminal")
      }

      const balanceBefore = toNumber(cashDrawer.currentBalance)
      const updatedDrawer = await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          isOpen: false,
          currentBalance: closingBalance,
          updatedAt: now,
        },
      })

      await tx.cashDrawerTransaction.create({
        data: {
          id: createId(),
          cashDrawerId: cashDrawer.id,
          userId,
          type: CashDrawerTransactionType.CLOSING_BALANCE,
          amount: closingBalance,
          reason: "Cash drawer closed",
          balanceBefore,
          balanceAfter: closingBalance,
        },
      })

      return updatedDrawer
    })

    revalidatePOSPaths()
    return {
      success: true,
      data: mapCashDrawerForClient(result),
      message: `Cash drawer closed with balance: $${closingBalance.toFixed(2)}`,
    }
  } catch (error) {
    console.error("Error closing cash drawer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to close cash drawer",
    }
  }
}

export async function addCashToDrawer(
  stationId: string,
  userId: string,
  amount: number,
  reason: string,
  sessionId?: string
) {
  try {
    const result = await db.$transaction(async (tx) => {
      const now = new Date()
      const cashDrawer = await findOpenCashDrawer(tx, stationId)

      if (!cashDrawer) {
        throw new Error("No open cash drawer found for this terminal")
      }

      const balanceBefore = toNumber(cashDrawer.currentBalance)
      const balanceAfter = balanceBefore + amount

      const updatedDrawer = await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: balanceAfter,
          expectedBalance: balanceAfter,
          updatedAt: now,
        },
      })

      await tx.cashDrawerTransaction.create({
        data: {
          id: createId(),
          cashDrawerId: cashDrawer.id,
          sessionId,
          userId,
          type: CashDrawerTransactionType.CASH_IN,
          amount,
          reason,
          balanceBefore,
          balanceAfter,
        },
      })

      return updatedDrawer
    })

    revalidatePOSPaths()
    return {
      success: true,
      data: mapCashDrawerForClient(result),
      message: `$${amount.toFixed(2)} added to cash drawer`,
    }
  } catch (error) {
    console.error("Error adding cash to drawer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add cash to drawer",
    }
  }
}

export async function removeCashFromDrawer(
  stationId: string,
  userId: string,
  amount: number,
  reason: string,
  sessionId?: string
) {
  try {
    const result = await db.$transaction(async (tx) => {
      const now = new Date()
      const cashDrawer = await findOpenCashDrawer(tx, stationId)

      if (!cashDrawer) {
        throw new Error("No open cash drawer found for this terminal")
      }

      const balanceBefore = toNumber(cashDrawer.currentBalance)
      if (balanceBefore < amount) {
        throw new Error("Insufficient cash in drawer")
      }

      const balanceAfter = balanceBefore - amount
      const updatedDrawer = await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: balanceAfter,
          expectedBalance: balanceAfter,
          updatedAt: now,
        },
      })

      await tx.cashDrawerTransaction.create({
        data: {
          id: createId(),
          cashDrawerId: cashDrawer.id,
          sessionId,
          userId,
          type: CashDrawerTransactionType.CASH_OUT,
          amount: -amount,
          reason,
          balanceBefore,
          balanceAfter,
        },
      })

      return updatedDrawer
    })

    revalidatePOSPaths()
    return {
      success: true,
      data: mapCashDrawerForClient(result),
      message: `$${amount.toFixed(2)} removed from cash drawer`,
    }
  } catch (error) {
    console.error("Error removing cash from drawer:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove cash from drawer",
    }
  }
}

export async function getCashDrawerTransactions(stationId: string, limit: number = 50) {
  try {
    const cashDrawer = await db.cashDrawer.findFirst({
      where: { terminalId: stationId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: limit,
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            session: {
              select: { id: true, sessionNumber: true },
            },
          },
        },
      },
    })

    if (!cashDrawer) {
      return {
        success: false,
        error: "Cash drawer not found",
      }
    }

    return {
      success: true,
      data: mapCashDrawerForClient(cashDrawer)?.transactions ?? [],
    }
  } catch (error) {
    console.error("Error fetching cash drawer transactions:", error)
    return {
      success: false,
      error: "Failed to fetch cash drawer transactions",
    }
  }
}

export async function performCashCount(
  stationId: string,
  userId: string,
  countedAmount: number,
  sessionId?: string
) {
  try {
    const result = await db.$transaction(async (tx) => {
      const now = new Date()
      const cashDrawer = await findOpenCashDrawer(tx, stationId)

      if (!cashDrawer) {
        throw new Error("No open cash drawer found for this terminal")
      }

      const balanceBefore = toNumber(cashDrawer.currentBalance)
      const expectedBalance = toNumber(cashDrawer.expectedBalance)
      const variance = countedAmount - expectedBalance

      const updatedDrawer = await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: countedAmount,
          updatedAt: now,
        },
      })

      await tx.cashDrawerTransaction.create({
        data: {
          id: createId(),
          cashDrawerId: cashDrawer.id,
          sessionId,
          userId,
          type: CashDrawerTransactionType.RECONCILIATION,
          amount: variance,
          reason: `Cash count - Variance: $${variance.toFixed(2)}`,
          balanceBefore,
          balanceAfter: countedAmount,
          notes: `Expected: $${expectedBalance.toFixed(2)}, Counted: $${countedAmount.toFixed(2)}, Variance: $${variance.toFixed(2)}`,
        },
      })

      return { drawer: mapCashDrawerForClient(updatedDrawer), variance }
    })

    revalidatePOSPaths()
    return {
      success: true,
      data: result,
      message: `Cash count completed. Variance: $${result.variance.toFixed(2)}`,
    }
  } catch (error) {
    console.error("Error performing cash count:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to perform cash count",
    }
  }
}

export async function getCashDrawerStatus(stationId: string) {
  try {
    const cashDrawer = await db.cashDrawer.findFirst({
      where: { terminalId: stationId },
      select: {
        id: true,
        isOpen: true,
        currentBalance: true,
        expectedBalance: true,
      },
    })

    return {
      success: true,
      data: cashDrawer
        ? {
            ...cashDrawer,
            currentBalance: toNumber(cashDrawer.currentBalance),
            expectedBalance: toNumber(cashDrawer.expectedBalance),
          }
        : {
            id: null,
            isOpen: false,
            currentBalance: 0,
            expectedBalance: 0,
            lastActivity: null,
          },
    }
  } catch (error) {
    console.error("Error fetching cash drawer status:", error)
    return {
      success: false,
      error: "Failed to fetch cash drawer status",
    }
  }
}
