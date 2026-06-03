import { describe, it, expect, vi, beforeEach } from "vitest"

// ── Mock DB ──────────────────────────────────────────────────────────────────

const mockTx = {
  customer: { findUnique: vi.fn(), upsert: vi.fn() },
  salesOrder: { create: vi.fn() },
  salesOrderLine: { create: vi.fn(), createMany: vi.fn() },
  inventoryLevel: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  payment: { create: vi.fn(), createMany: vi.fn() },
  pOSSession: { findUnique: vi.fn(), update: vi.fn() },
  cashDrawer: { update: vi.fn() },
  cashDrawerTransaction: { create: vi.fn() },
}

vi.mock("@/prisma/db", () => ({
  db: {
    $transaction: vi.fn((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  },
}))

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

import { createSale } from "./pos-order.service"

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseSale = {
  sessionId: "ses-1",
  terminalId: "term-1",
  createdById: "user-1",
  locationId: "loc-1",
  organizationId: "org-1",
  lines: [{ itemId: "item-1", quantity: 2, unitPrice: 50, discountAmount: 0, taxAmount: 0 }],
  subtotal: 100,
  taxAmount: 0,
  discount: 0,
  totalAmount: 100,
  payments: [{ method: "CASH" as const, amount: 100, cashTendered: 120 }],
}

const mockCustomer = { id: "cust-1", name: "Walk-In Customer", organizationId: "org-1", code: "WALK_IN" }
const mockOrder = { id: "order-1", orderNumber: "SO-123", sessionId: "ses-1", terminalId: "term-1" }
const mockLine = { id: "line-1", salesOrderId: "order-1", itemId: "item-1" }
const mockLevel = { id: "level-1", quantityOnHand: 10, quantityAvailable: 10 }
const mockPayment = { id: "pay-1" }
const mockDrawer = { id: "drawer-1", currentBalance: 500, expectedBalance: 500 }
const mockSession = {
  terminal: { CashDrawer: [mockDrawer] },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockTx.customer.upsert.mockResolvedValue(mockCustomer)
  mockTx.salesOrder.create.mockResolvedValue(mockOrder)
  mockTx.salesOrderLine.createMany.mockResolvedValue({ count: 1 })
  mockTx.inventoryLevel.findMany.mockResolvedValue([{ itemId: "item-1", ...mockLevel }])
  mockTx.inventoryLevel.update.mockResolvedValue({ ...mockLevel, quantityOnHand: 8 })
  mockTx.payment.createMany.mockResolvedValue({ count: 1 })
  mockTx.pOSSession.findUnique.mockResolvedValue(mockSession)
  mockTx.cashDrawer.update.mockResolvedValue(mockDrawer)
  mockTx.cashDrawerTransaction.create.mockResolvedValue({})
  mockTx.pOSSession.update.mockResolvedValue({})
})

describe("createSale", () => {
  it("returns orderNumber and salesOrder on success", async () => {
    const result = await createSale(baseSale)
    expect(result.orderNumber).toMatch(/^SO-/)
    expect(result.salesOrder.id).toBe("order-1")
  })

  it("upserts walk-in customer when no customerId given", async () => {
    await createSale(baseSale)
    expect(mockTx.customer.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId_code: { organizationId: "org-1", code: "WALK_IN" } },
      }),
    )
  })

  it("uses provided customerId when present and found", async () => {
    mockTx.customer.findUnique.mockResolvedValue(mockCustomer)
    await createSale({ ...baseSale, customerId: "cust-1" })
    expect(mockTx.customer.findUnique).toHaveBeenCalledWith({ where: { id: "cust-1" } })
  })

  it("deducts inventory for each line item", async () => {
    await createSale(baseSale)
    const updateCall = mockTx.inventoryLevel.update.mock.calls[0][0]
    expect(updateCall.data.quantityOnHand).toBe(8)  // 10 - 2
    expect(updateCall.data.quantityAvailable).toBe(8)
  })

  it("does not go below zero for inventory deduction", async () => {
    mockTx.inventoryLevel.findMany.mockResolvedValue([
      { itemId: "item-1", id: "level-1", quantityOnHand: 1, quantityAvailable: 1 },
    ])
    await createSale({ ...baseSale, lines: [{ itemId: "item-1", quantity: 5, unitPrice: 50, discountAmount: 0, taxAmount: 0 }] })

    const updateCall = mockTx.inventoryLevel.update.mock.calls[0][0]
    expect(updateCall.data.quantityOnHand).toBe(0)
  })

  it("calculates change correctly for cash payment", async () => {
    const result = await createSale({ ...baseSale, payments: [{ method: "CASH", amount: 100, cashTendered: 150 }] })
    expect(result.changeAmount).toBe(50)
  })

  it("returns zero change when cashTendered not provided", async () => {
    const result = await createSale({ ...baseSale, payments: [{ method: "CASH", amount: 100 }] })
    expect(result.changeAmount).toBe(0)
  })

  it("updates cash drawer balance for CASH payment", async () => {
    await createSale(baseSale)
    const updateCall = mockTx.cashDrawer.update.mock.calls[0][0]
    // net cash = payment.amount(100) - change(20) = 80; new balance = 500 + 80 = 580
    expect(updateCall.data.currentBalance).toBe(580)
  })

  it("does not update cash drawer for CARD payment", async () => {
    await createSale({ ...baseSale, payments: [{ method: "CARD", amount: 100 }] })
    expect(mockTx.cashDrawer.update).not.toHaveBeenCalled()
  })

  it("increments session totalSales and transactionCount", async () => {
    await createSale(baseSale)
    expect(mockTx.pOSSession.update).toHaveBeenCalledWith({
      where: { id: "ses-1" },
      data: { totalSales: { increment: 100 }, transactionCount: { increment: 1 } },
    })
  })

  it("marks paymentStatus PAID when fully paid", async () => {
    await createSale(baseSale)
    const orderCall = mockTx.salesOrder.create.mock.calls[0][0]
    expect(orderCall.data.paymentStatus).toBe("PAID")
  })

  it("marks paymentStatus PARTIAL when underpaid", async () => {
    await createSale({ ...baseSale, payments: [{ method: "CASH", amount: 50 }] })
    const orderCall = mockTx.salesOrder.create.mock.calls[0][0]
    expect(orderCall.data.paymentStatus).toBe("PARTIAL")
  })

  it("throws Zod error for invalid input", async () => {
    await expect(createSale({ ...baseSale, totalAmount: -1 })).rejects.toThrow()
  })

  it("throws Zod error when lines array is empty", async () => {
    await expect(createSale({ ...baseSale, lines: [] })).rejects.toThrow()
  })
})
