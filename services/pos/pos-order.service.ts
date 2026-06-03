import { recordAuditEvent } from "@/lib/audit/record-event"
import { logger } from "@/lib/logger"
import { db } from "@/prisma/db"
import { z } from "zod"

// ── Schemas ──────────────────────────────────────────────────────────────────

const PaymentSchema = z.object({
  method: z.enum(["CASH", "CARD", "DIGITAL"]),
  amount: z.number().positive("Payment amount must be positive"),
  cashTendered: z.number().optional(),
  referenceNumber: z.string().optional(),
  cardLastFour: z.string().optional(),
  cardType: z.string().optional(),
  authorizationCode: z.string().optional(),
})

const SaleLineSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
})

export const CreateSaleSchema = z.object({
  sessionId: z.string().min(1),
  terminalId: z.string().min(1),
  customerId: z.string().optional(),
  createdById: z.string().min(1),
  locationId: z.string().min(1),
  organizationId: z.string().min(1),
  lines: z.array(SaleLineSchema).min(1, "At least one item is required"),
  subtotal: z.number().nonnegative(),
  taxAmount: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  totalAmount: z.number().positive(),
  payments: z.array(PaymentSchema).min(1, "At least one payment is required"),
  notes: z.string().optional(),
})

export type CreateSaleInput = z.infer<typeof CreateSaleSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

function uniqueNumber(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

function calcChange(payments: CreateSaleInput["payments"], total: number): number {
  const cash = payments.find(p => p.method === "CASH")
  if (!cash?.cashTendered) return 0
  return Math.max(0, cash.cashTendered - total)
}

// ── Core service function ─────────────────────────────────────────────────────

export async function createSale(rawInput: unknown) {
  const saleData = CreateSaleSchema.parse(rawInput)
  logger.info("pos-order.create", { orgId: saleData.organizationId, terminalId: saleData.terminalId })

  const totalPaid   = saleData.payments.reduce((s, p) => s + p.amount, 0)
  const changeAmount = calcChange(saleData.payments, saleData.totalAmount)
  const paymentStatus = totalPaid >= saleData.totalAmount ? "PAID" : "PARTIAL"
  const orderNumber   = uniqueNumber("SO")

  const result = await db.$transaction(async (tx) => {
    // Resolve or create walk-in customer
    const customer = saleData.customerId
      ? (await tx.customer.findUnique({ where: { id: saleData.customerId } }) ??
        await tx.customer.upsert({
          where: { organizationId_code: { organizationId: saleData.organizationId, code: "WALK_IN" } },
          update: {},
          create: { organizationId: saleData.organizationId, name: "Walk-In Customer", code: "WALK_IN" },
        }))
      : await tx.customer.upsert({
          where: { organizationId_code: { organizationId: saleData.organizationId, code: "WALK_IN" } },
          update: {},
          create: { organizationId: saleData.organizationId, name: "Walk-In Customer", code: "WALK_IN" },
        })

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
        paymentStatus: paymentStatus as "PAID" | "PARTIAL",
        subtotal: saleData.subtotal,
        taxAmount: saleData.taxAmount,
        discount: saleData.discount,
        total: saleData.totalAmount,
        notes: saleData.notes,
      },
    })

    // Process line items — bulk insert (was N round-trips per line)
    await tx.salesOrderLine.createMany({
      data: saleData.lines.map((line) => ({
        salesOrderId: salesOrder.id,
        itemId: line.itemId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discountAmount,
        taxAmount: line.taxAmount,
        lineTotal: Math.max(0, line.unitPrice * line.quantity - line.discountAmount + line.taxAmount),
      })),
    })

    // Deduct inventory — bulk read once, then update only the matched levels.
    // Updates still run per-row inside the transaction (Prisma serialises) but
    // we drop from 2N round-trips to 1 + N.
    const itemIds = [...new Set(saleData.lines.map((l) => l.itemId))]
    const levels = await tx.inventoryLevel.findMany({
      where: { itemId: { in: itemIds }, locationId: saleData.locationId },
    })
    const levelByItem = new Map(levels.map((l) => [l.itemId, l]))

    for (const line of saleData.lines) {
      const level = levelByItem.get(line.itemId)
      if (!level) continue
      const newOnHand = Math.max(0, level.quantityOnHand - line.quantity)
      const newAvailable = Math.max(0, level.quantityAvailable - line.quantity)
      await tx.inventoryLevel.update({
        where: { id: level.id },
        data: {
          quantityOnHand: newOnHand,
          quantityAvailable: newAvailable,
          lastTransactionAt: new Date(),
        },
      })
      // Keep the cached level in sync for subsequent lines that share an itemId
      level.quantityOnHand = newOnHand
      level.quantityAvailable = newAvailable
    }

    // Look up the session+drawer ONCE (was repeated for every cash payment).
    const sessionWithDrawer = saleData.payments.some((p) => p.method === "CASH")
      ? await tx.pOSSession.findUnique({
          where: { id: saleData.sessionId },
          include: { terminal: { include: { CashDrawer: true } } },
        })
      : null
    const drawer = sessionWithDrawer?.terminal?.CashDrawer?.[0] ?? null

    // Process payments — bulk insert payment rows
    await tx.payment.createMany({
      data: saleData.payments.map((payment) => ({
        paymentNumber: uniqueNumber("PAY"),
        salesOrderId: salesOrder.id,
        method: payment.method as "CASH" | "CARD" | "DIGITAL",
        amount: payment.amount,
        cardLast4: payment.cardLastFour,
        cardType: payment.cardType,
        authorizationCode: payment.authorizationCode,
        status: "PAID",
      })),
    })

    // Update cash drawer once for the net cash, not per-payment
    if (drawer) {
      const totalCash = saleData.payments
        .filter((p) => p.method === "CASH")
        .reduce((sum, p) => sum + p.amount, 0)
      const netCash = totalCash - changeAmount
      if (netCash !== 0) {
        const newBalance = drawer.currentBalance + netCash
        await tx.cashDrawer.update({
          where: { id: drawer.id },
          data: { currentBalance: newBalance, expectedBalance: newBalance },
        })
        await tx.cashDrawerTransaction.create({
          data: {
            cashDrawerId: drawer.id,
            sessionId: saleData.sessionId,
            userId: saleData.createdById,
            type: "SALE",
            amount: netCash,
            reason: `Sale ${orderNumber}`,
            balanceBefore: drawer.currentBalance,
            balanceAfter: newBalance,
          },
        })
      }
    }

    // Update session totals
    await tx.pOSSession.update({
      where: { id: saleData.sessionId },
      data: {
        totalSales:       { increment: saleData.totalAmount },
        transactionCount: { increment: 1 },
      },
    })

    return { salesOrder, customer, orderNumber, changeAmount }
  })

  // Audit AFTER commit so a transient audit failure can't roll back a real sale.
  await recordAuditEvent({
    entityType: "SalesOrder",
    entityId: result.salesOrder.id,
    action: "CREATE",
    orgId: saleData.organizationId,
    userId: saleData.createdById,
    changes: {
      orderNumber: result.orderNumber,
      customerId: result.customer.id,
      locationId: saleData.locationId,
      terminalId: saleData.terminalId,
      sessionId: saleData.sessionId,
      subtotal: saleData.subtotal,
      taxAmount: saleData.taxAmount,
      discount: saleData.discount,
      total: saleData.totalAmount,
      lineCount: saleData.lines.length,
      paymentMethods: saleData.payments.map((p) => p.method),
      changeAmount: result.changeAmount,
    },
  })

  return result
}
