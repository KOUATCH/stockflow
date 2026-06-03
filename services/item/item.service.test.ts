import { beforeEach, describe, expect, it, vi } from "vitest"

const mockTx = {
  item: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  inventoryLevel: { create: vi.fn() },
  inventoryTransaction: { create: vi.fn() },
}

vi.mock("@/prisma/db", () => ({
  db: {
    item: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  },
}))

import { db } from "@/prisma/db"
import { createItem, deleteItem } from "./item.service"
import type { ItemCreateInput } from "./item.schemas"

const baseInput: ItemCreateInput = {
  nameEn: "Test Widget",
  nameFr: null,
  descriptionEn: null,
  descriptionFr: null,
  sku: "WIDGET-001",
  costPrice: 10,
  sellingPrice: 20,
}

const mockItem = {
  id: "item-1",
  nameEn: "Test Widget",
  nameFr: null,
  descriptionEn: null,
  descriptionFr: null,
  sku: "WIDGET-001",
  slug: "test-widget",
  organizationId: "org-1",
  costPrice: { toString: () => "10.00" },
  sellingPrice: { toString: () => "20.00" },
  thumbnail: null,
  imageUrls: [],
  isActive: true,
  isDiscontinued: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => vi.clearAllMocks())

describe("createItem", () => {
  it("throws when SKU already exists in org", async () => {
    mockTx.item.findFirst.mockResolvedValue({ id: "item-x" })
    await expect(createItem("org-1", "user-1", baseInput)).rejects.toThrow("already exists")
  })

  it("creates item when SKU is unique", async () => {
    mockTx.item.findFirst.mockResolvedValue(null)
    mockTx.item.create.mockResolvedValue(mockItem)

    const result = await createItem("org-1", "user-1", baseInput)
    expect(result.id).toBe("item-1")
    expect(mockTx.item.create).toHaveBeenCalledOnce()
  })

  it("auto-generates SKU when not provided", async () => {
    const { sku: _sku, ...noSkuInput } = baseInput
    mockTx.item.findFirst.mockResolvedValue(null)
    mockTx.item.create.mockResolvedValue({ ...mockItem, sku: "SKU-1700000000000" })

    await createItem("org-1", "user-1", noSkuInput as ItemCreateInput)

    const createCall = mockTx.item.create.mock.calls[0][0]
    expect(createCall.data.sku).toMatch(/^SKU-/)
  })

  it("seeds inventory level when initialQuantity and locationId provided", async () => {
    mockTx.item.findFirst.mockResolvedValue(null)
    mockTx.item.create.mockResolvedValue(mockItem)

    await createItem("org-1", "user-1", {
      ...baseInput,
      initialQuantity: 50,
      locationId: "loc-1",
    })

    expect(mockTx.inventoryLevel.create).toHaveBeenCalledOnce()
    const levelCall = mockTx.inventoryLevel.create.mock.calls[0][0]
    expect(levelCall.data.locationId).toBe("loc-1")
  })

  it("creates inventory transaction for initial stock", async () => {
    mockTx.item.findFirst.mockResolvedValue(null)
    mockTx.item.create.mockResolvedValue(mockItem)

    await createItem("org-1", "user-1", {
      ...baseInput,
      initialQuantity: 50,
      locationId: "loc-1",
    })

    expect(mockTx.inventoryTransaction.create).toHaveBeenCalledOnce()
    const txCall = mockTx.inventoryTransaction.create.mock.calls[0][0]
    expect(txCall.data.type).toBe("INITIAL_STOCK")
  })

  it("does not seed inventory when initialQuantity is 0", async () => {
    mockTx.item.findFirst.mockResolvedValue(null)
    mockTx.item.create.mockResolvedValue(mockItem)

    await createItem("org-1", "user-1", { ...baseInput, initialQuantity: 0, locationId: "loc-1" })
    expect(mockTx.inventoryLevel.create).not.toHaveBeenCalled()
  })

  it("does not seed inventory when locationId not provided", async () => {
    mockTx.item.findFirst.mockResolvedValue(null)
    mockTx.item.create.mockResolvedValue(mockItem)

    await createItem("org-1", "user-1", { ...baseInput, initialQuantity: 50 })
    expect(mockTx.inventoryLevel.create).not.toHaveBeenCalled()
  })
})

describe("deleteItem (soft)", () => {
  it("throws when item not found in this org", async () => {
    vi.mocked(db.item.findFirst).mockResolvedValue(null)
    await expect(deleteItem("org-1", "bad-id")).rejects.toThrow("Item not found")
  })

  it("refuses to delete an item from another org", async () => {
    vi.mocked(db.item.findFirst).mockResolvedValue(null)
    await expect(deleteItem("org-2", "item-1")).rejects.toThrow("Item not found")
    expect(db.item.update).not.toHaveBeenCalled()
  })

  it("sets deletedAt + isActive=false (soft delete)", async () => {
    vi.mocked(db.item.findFirst).mockResolvedValue(mockItem as never)
    vi.mocked(db.item.update).mockResolvedValue({
      ...mockItem,
      isActive: false,
      deletedAt: new Date(),
    } as never)

    const result = await deleteItem("org-1", "item-1")
    expect(result.isActive).toBe(false)
    const updateCall = vi.mocked(db.item.update).mock.calls[0][0]
    expect(updateCall.data).toMatchObject({ isActive: false })
  })
})
