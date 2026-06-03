import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/prisma/db", () => ({
  db: {
    brand: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

import { db } from "@/prisma/db"
import { createBrand, deleteBrand, getBrandById, updateBrand } from "./brand.service"

const mockBrand = {
  id: "brand-1",
  organizationId: "org-1",
  nameEn: "Nike",
  nameFr: null,
  slug: "nike",
  descriptionEn: null,
  descriptionFr: null,
  logoUrl: null,
  isActive: true,
  deletedAt: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
}

beforeEach(() => vi.clearAllMocks())

describe("createBrand", () => {
  it("throws when brand name already exists in org", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(mockBrand as never)
    await expect(createBrand("org-1", { nameEn: "Nike" } as never)).rejects.toThrow("already exists")
  })

  it("creates brand when name is unique", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(null)
    vi.mocked(db.brand.create).mockResolvedValue(mockBrand as never)

    const result = await createBrand("org-1", { nameEn: "Nike" } as never)
    expect(result.nameEn).toBe("Nike")
    expect(db.brand.create).toHaveBeenCalledOnce()
  })

  it("scopes uniqueness check to the org", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(null)
    vi.mocked(db.brand.create).mockResolvedValue({ ...mockBrand, organizationId: "org-2" } as never)

    await createBrand("org-2", { nameEn: "Nike" } as never)
    const findCall = vi.mocked(db.brand.findFirst).mock.calls[0][0]
    expect(findCall?.where?.organizationId).toBe("org-2")
  })
})

describe("updateBrand", () => {
  it("throws when brand not found in this org", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(null)
    await expect(updateBrand("org-1", "bad-id", { nameEn: "Adidas" })).rejects.toThrow(
      "Brand not found",
    )
  })

  it("throws when brand belongs to a different org (cross-tenant guard)", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(null)
    await expect(updateBrand("org-2", "brand-1", { nameEn: "Adidas" })).rejects.toThrow(
      "Brand not found",
    )
  })

  it("updates brand when found in same org", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue({ id: "brand-1" } as never)
    vi.mocked(db.brand.update).mockResolvedValue({ ...mockBrand, nameEn: "Adidas" } as never)

    const result = await updateBrand("org-1", "brand-1", { nameEn: "Adidas" })
    expect(result.nameEn).toBe("Adidas")
  })
})

describe("deleteBrand (soft)", () => {
  it("throws when brand not found in this org", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(null)
    await expect(deleteBrand("org-1", "bad-id")).rejects.toThrow("Brand not found")
  })

  it("refuses to delete a brand from a different org", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(null)
    await expect(deleteBrand("org-2", "brand-1")).rejects.toThrow("Brand not found")
    expect(db.brand.update).not.toHaveBeenCalled()
  })

  it("soft-deletes (deletedAt + isActive=false) when found", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(mockBrand as never)
    vi.mocked(db.brand.update).mockResolvedValue({
      ...mockBrand,
      isActive: false,
      deletedAt: new Date(),
    } as never)

    const result = await deleteBrand("org-1", "brand-1")
    expect(result.isActive).toBe(false)
    const updateCall = vi.mocked(db.brand.update).mock.calls[0][0]
    expect(updateCall.data).toMatchObject({ isActive: false })
  })
})

describe("getBrandById", () => {
  it("throws when brand not found in this org", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(null)
    await expect(getBrandById("org-1", "bad-id")).rejects.toThrow("Brand not found")
  })

  it("returns brand when found in same org", async () => {
    vi.mocked(db.brand.findFirst).mockResolvedValue(mockBrand as never)
    const result = await getBrandById("org-1", "brand-1")
    expect(result.id).toBe("brand-1")
    expect(result.nameEn).toBe("Nike")
  })
})
