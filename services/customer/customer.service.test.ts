import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/prisma/db", () => ({
  db: {
    customer: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

import { db } from "@/prisma/db"
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} from "./customer.service"

const baseCustomer = {
  id: "cust-1",
  name: "Acme Inc",
  code: "CUST-0001",
  email: "ops@acme.test",
  phone: null,
  address: null,
  taxId: null,
  creditLimit: null,
  paymentTerms: null,
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

describe("createCustomer", () => {
  it("auto-generates a customer code when none is supplied", async () => {
    vi.mocked(db.customer.count).mockResolvedValue(0 as never)
    vi.mocked(db.customer.findFirst).mockResolvedValue(null)
    vi.mocked(db.customer.create).mockResolvedValue(baseCustomer as never)

    await createCustomer("org-1", {
      name: "Acme Inc",
      isActive: true,
      preferredLocale: "EN",
    } as never)

    const call = vi.mocked(db.customer.create).mock.calls[0][0]
    expect((call.data as { code: string }).code).toMatch(/^CUST-\d{4}$/)
  })

  it("rejects when code already exists in org", async () => {
    vi.mocked(db.customer.findFirst).mockResolvedValue(baseCustomer as never)
    await expect(
      createCustomer("org-1", {
        name: "Acme",
        code: "CUST-0001",
        isActive: true,
        preferredLocale: "EN",
      } as never),
    ).rejects.toThrow("already exists")
  })

  it("scopes uniqueness check to the supplied org", async () => {
    vi.mocked(db.customer.count).mockResolvedValue(0 as never)
    vi.mocked(db.customer.findFirst).mockResolvedValue(null)
    vi.mocked(db.customer.create).mockResolvedValue(baseCustomer as never)

    await createCustomer("org-2", {
      name: "Acme",
      code: "CUST-0001",
      isActive: true,
      preferredLocale: "EN",
    } as never)

    expect(db.customer.findFirst).toHaveBeenCalledWith({
      where: { organizationId: "org-2", code: "CUST-0001" },
    })
  })
})

describe("getCustomerById", () => {
  it("throws when not found in this org", async () => {
    vi.mocked(db.customer.findFirst).mockResolvedValue(null)
    await expect(getCustomerById("org-1", "missing")).rejects.toThrow("Customer not found")
    expect(db.customer.findFirst).toHaveBeenCalledWith({
      where: { id: "missing", organizationId: "org-1", deletedAt: null },
    })
  })

  it("refuses to return a customer from another org", async () => {
    vi.mocked(db.customer.findFirst).mockResolvedValue(null)
    await expect(getCustomerById("org-2", "cust-1")).rejects.toThrow("Customer not found")
  })

  it("returns the customer when org matches", async () => {
    vi.mocked(db.customer.findFirst).mockResolvedValue(baseCustomer as never)
    const result = await getCustomerById("org-1", "cust-1")
    expect(result.id).toBe("cust-1")
  })
})

describe("updateCustomer", () => {
  it("throws when customer not found", async () => {
    vi.mocked(db.customer.findFirst).mockResolvedValue(null)
    await expect(updateCustomer("org-1", "missing", { name: "x" } as never)).rejects.toThrow(
      "Customer not found",
    )
  })

  it("refuses to update a customer from another org", async () => {
    vi.mocked(db.customer.findFirst).mockResolvedValue(null)
    await expect(updateCustomer("org-2", "cust-1", { name: "x" } as never)).rejects.toThrow(
      "Customer not found",
    )
    expect(db.customer.update).not.toHaveBeenCalled()
  })

  it("blocks code change that collides with another customer in the same org", async () => {
    vi.mocked(db.customer.findFirst)
      .mockResolvedValueOnce(baseCustomer as never)
      .mockResolvedValueOnce({ ...baseCustomer, id: "cust-2", code: "CUST-9999" } as never)

    await expect(
      updateCustomer("org-1", "cust-1", { code: "CUST-9999" } as never),
    ).rejects.toThrow("already exists")
  })

  it("updates when org matches and no code collision", async () => {
    vi.mocked(db.customer.findFirst).mockResolvedValue(baseCustomer as never)
    vi.mocked(db.customer.update).mockResolvedValue({ ...baseCustomer, name: "Acme Renamed" } as never)
    const result = await updateCustomer("org-1", "cust-1", { name: "Acme Renamed" } as never)
    expect(result.name).toBe("Acme Renamed")
  })
})

describe("deleteCustomer", () => {
  it("throws when not found in this org", async () => {
    vi.mocked(db.customer.findFirst).mockResolvedValue(null)
    await expect(deleteCustomer("org-1", "missing")).rejects.toThrow("Customer not found")
  })

  it("refuses to delete a customer from another org", async () => {
    vi.mocked(db.customer.findFirst).mockResolvedValue(null)
    await expect(deleteCustomer("org-2", "cust-1")).rejects.toThrow("Customer not found")
    expect(db.customer.update).not.toHaveBeenCalled()
  })

  it("soft-deletes by setting deletedAt and isActive=false", async () => {
    vi.mocked(db.customer.findFirst).mockResolvedValue(baseCustomer as never)
    vi.mocked(db.customer.update).mockResolvedValue({
      ...baseCustomer,
      deletedAt: new Date(),
      isActive: false,
    } as never)

    const result = await deleteCustomer("org-1", "cust-1")
    expect(result.isActive).toBe(false)
    expect(result.deletedAt).toBeTruthy()

    const updateCall = vi.mocked(db.customer.update).mock.calls[0][0]
    expect(updateCall.where).toEqual({ id: "cust-1" })
    expect((updateCall.data as { isActive: boolean }).isActive).toBe(false)
    expect((updateCall.data as { deletedAt: Date }).deletedAt).toBeInstanceOf(Date)
  })
})
