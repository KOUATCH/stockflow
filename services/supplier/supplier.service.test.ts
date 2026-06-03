import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/prisma/db", () => ({
  db: {
    supplier: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    purchaseOrder: {
      count: vi.fn(),
    },
  },
}))

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

import { db } from "@/prisma/db"
import {
  createSupplier,
  deleteSupplier,
  getSupplierById,
  searchSuppliersLite,
  setSupplierActive,
  updateSupplier,
} from "./supplier.service"

const baseSupplier = {
  id: "sup-1",
  name: "Acme Supplies",
  code: "SUP-0001",
  contactPerson: null,
  email: "ops@acme.test",
  phone: null,
  address: null,
  city: null,
  state: null,
  zipCode: null,
  country: null,
  taxId: null,
  paymentTerms: 30,
  creditLimit: null,
  notes: null,
  isActive: true,
  preferredLocale: "EN",
  currentBalance: 0,
  deletedAt: null,
  organizationId: "org-1",
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => vi.clearAllMocks())

describe("createSupplier", () => {
  it("auto-generates a supplier code when none is supplied", async () => {
    vi.mocked(db.supplier.count).mockResolvedValue(0 as never)
    vi.mocked(db.supplier.findFirst).mockResolvedValue(null)
    vi.mocked(db.supplier.create).mockResolvedValue(baseSupplier as never)

    await createSupplier("org-1", {
      name: "Acme Supplies",
      paymentTerms: 30,
      isActive: true,
      preferredLocale: "EN",
    } as never)

    const call = vi.mocked(db.supplier.create).mock.calls[0][0]
    expect((call.data as { code: string }).code).toMatch(/^SUP-\d{4}$/)
  })

  it("rejects when supplier code already exists in org", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(baseSupplier as never)
    await expect(
      createSupplier("org-1", {
        name: "Acme",
        code: "SUP-0001",
        paymentTerms: 30,
        isActive: true,
        preferredLocale: "EN",
      } as never),
    ).rejects.toThrow("already exists")
  })

  it("scopes uniqueness check to the supplied org", async () => {
    vi.mocked(db.supplier.count).mockResolvedValue(0 as never)
    vi.mocked(db.supplier.findFirst).mockResolvedValue(null)
    vi.mocked(db.supplier.create).mockResolvedValue(baseSupplier as never)

    await createSupplier("org-2", {
      name: "Acme",
      code: "SUP-0001",
      paymentTerms: 30,
      isActive: true,
      preferredLocale: "EN",
    } as never)

    expect(db.supplier.findFirst).toHaveBeenCalledWith({
      where: { organizationId: "org-2", code: "SUP-0001" },
    })
  })
})

describe("getSupplierById", () => {
  it("throws when not found in this org", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(null)
    await expect(getSupplierById("org-1", "missing")).rejects.toThrow("Supplier not found")
    expect(db.supplier.findFirst).toHaveBeenCalledWith({
      where: { id: "missing", organizationId: "org-1", deletedAt: null },
    })
  })

  it("refuses to return a supplier from another org", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(null)
    await expect(getSupplierById("org-2", "sup-1")).rejects.toThrow("Supplier not found")
  })

  it("returns the supplier when org matches", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(baseSupplier as never)
    const result = await getSupplierById("org-1", "sup-1")
    expect(result.id).toBe("sup-1")
  })
})

describe("updateSupplier", () => {
  it("throws when supplier not found", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(null)
    await expect(updateSupplier("org-1", "missing", { name: "x" } as never)).rejects.toThrow(
      "Supplier not found",
    )
  })

  it("refuses to update a supplier from another org", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(null)
    await expect(updateSupplier("org-2", "sup-1", { name: "x" } as never)).rejects.toThrow(
      "Supplier not found",
    )
    expect(db.supplier.update).not.toHaveBeenCalled()
  })

  it("blocks code change that collides with another supplier in the same org", async () => {
    vi.mocked(db.supplier.findFirst)
      .mockResolvedValueOnce(baseSupplier as never)
      .mockResolvedValueOnce({ ...baseSupplier, id: "sup-2", code: "SUP-9999" } as never)

    await expect(
      updateSupplier("org-1", "sup-1", { code: "SUP-9999" } as never),
    ).rejects.toThrow("already exists")
  })
})

describe("setSupplierActive", () => {
  it("refuses to toggle a supplier from another org", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(null)
    await expect(setSupplierActive("org-2", "sup-1", false)).rejects.toThrow("Supplier not found")
    expect(db.supplier.update).not.toHaveBeenCalled()
  })

  it("flips isActive when org matches", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(baseSupplier as never)
    vi.mocked(db.supplier.update).mockResolvedValue({ ...baseSupplier, isActive: false } as never)
    const result = await setSupplierActive("org-1", "sup-1", false)
    expect(result.isActive).toBe(false)
  })
})

describe("deleteSupplier", () => {
  it("throws when not found in this org", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(null)
    await expect(deleteSupplier("org-1", "missing")).rejects.toThrow("Supplier not found")
  })

  it("refuses to delete a supplier from another org", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(null)
    await expect(deleteSupplier("org-2", "sup-1")).rejects.toThrow("Supplier not found")
    expect(db.supplier.update).not.toHaveBeenCalled()
  })

  it("blocks delete when supplier has linked purchase orders", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(baseSupplier as never)
    vi.mocked(db.purchaseOrder.count).mockResolvedValue(2 as never)

    await expect(deleteSupplier("org-1", "sup-1")).rejects.toThrow("referenced by purchase orders")
    expect(db.supplier.update).not.toHaveBeenCalled()
  })

  it("soft-deletes by setting deletedAt and isActive=false", async () => {
    vi.mocked(db.supplier.findFirst).mockResolvedValue(baseSupplier as never)
    vi.mocked(db.purchaseOrder.count).mockResolvedValue(0 as never)
    vi.mocked(db.supplier.update).mockResolvedValue({
      ...baseSupplier,
      deletedAt: new Date(),
      isActive: false,
    } as never)

    const result = await deleteSupplier("org-1", "sup-1")
    expect(result.isActive).toBe(false)
    expect(result.deletedAt).toBeTruthy()
  })
})

describe("searchSuppliersLite", () => {
  it("scopes the query to the given org and active suppliers only", async () => {
    vi.mocked(db.supplier.findMany).mockResolvedValue([] as never)
    await searchSuppliersLite("org-1", { q: "acme", limit: 10 })

    const call = vi.mocked(db.supplier.findMany).mock.calls[0][0]!
    expect((call.where as { organizationId: string }).organizationId).toBe("org-1")
    expect((call.where as { isActive: boolean }).isActive).toBe(true)
    expect((call.where as { deletedAt: null }).deletedAt).toBeNull()
  })
})
