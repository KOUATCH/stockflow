import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/prisma/db", () => ({
  db: {
    category: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { db } from "@/prisma/db"
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "./category.service"

const now = new Date("2026-01-01T00:00:00Z")

const mockCat = {
  id: "cat-1",
  organizationId: "org-1",
  titleEn: "Electronics",
  titleFr: null,
  slug: "electronics-",
  descriptionEn: null,
  descriptionFr: null,
  imageUrl: null,
  parentId: null,
  isActive: true,
  deletedAt: null,
  createdAt: now,
  updatedAt: now,
}

beforeEach(() => vi.clearAllMocks())

describe("createCategory", () => {
  it("throws when slug already exists in the org", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(mockCat as never)
    await expect(
      createCategory("org-1", { titleEn: "Electronics" } as never),
    ).rejects.toThrow("already exists")
  })

  it("creates category when slug is unique", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    vi.mocked(db.category.create).mockResolvedValue(mockCat as never)

    const result = await createCategory("org-1", { titleEn: "Electronics" } as never)
    expect(result.titleEn).toBe("Electronics")
    expect(db.category.create).toHaveBeenCalledOnce()
  })

  it("generates a slug from titleEn and descriptionEn", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    vi.mocked(db.category.create).mockResolvedValue({
      ...mockCat,
      slug: "phones-mobile-devices-",
    } as never)

    await createCategory("org-1", {
      titleEn: "Phones",
      descriptionEn: "Mobile devices",
    } as never)

    const createCall = vi.mocked(db.category.create).mock.calls[0][0]
    expect(createCall.data.slug).toContain("phones")
    expect(createCall.data.slug).toContain("mobile")
  })

  it("stores null descriptionEn when not provided", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    vi.mocked(db.category.create).mockResolvedValue(mockCat as never)

    await createCategory("org-1", { titleEn: "Electronics" } as never)

    const createCall = vi.mocked(db.category.create).mock.calls[0][0]
    expect(createCall.data.descriptionEn).toBeNull()
  })
})

describe("updateCategory", () => {
  it("throws when category not found in this org", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    await expect(updateCategory("org-1", "bad-id", { titleEn: "X" })).rejects.toThrow(
      "Category not found",
    )
  })

  it("refuses to update a category in another org", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    await expect(updateCategory("org-2", "cat-1", { titleEn: "X" })).rejects.toThrow(
      "Category not found",
    )
    expect(db.category.update).not.toHaveBeenCalled()
  })

  it("updates and returns DTO", async () => {
    const updated = { ...mockCat, titleEn: "Updated Electronics" }
    vi.mocked(db.category.findFirst).mockResolvedValue(mockCat as never)
    vi.mocked(db.category.update).mockResolvedValue(updated as never)

    const result = await updateCategory("org-1", "cat-1", { titleEn: "Updated Electronics" })
    expect(result.titleEn).toBe("Updated Electronics")
  })
})

describe("deleteCategory (soft)", () => {
  it("throws when category not found in this org", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    await expect(deleteCategory("org-1", "bad-id")).rejects.toThrow("Category not found")
  })

  it("refuses to delete a category in another org", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    await expect(deleteCategory("org-2", "cat-1")).rejects.toThrow("Category not found")
    expect(db.category.update).not.toHaveBeenCalled()
  })

  it("sets deletedAt and isActive=false (soft delete)", async () => {
    const deleted = { ...mockCat, isActive: false, deletedAt: new Date() }
    vi.mocked(db.category.findFirst).mockResolvedValue(mockCat as never)
    vi.mocked(db.category.update).mockResolvedValue(deleted as never)

    const result = await deleteCategory("org-1", "cat-1")
    expect(result.id).toBe("cat-1")
    expect(result.isActive).toBe(false)
    const updateCall = vi.mocked(db.category.update).mock.calls[0][0]
    expect(updateCall.data).toMatchObject({ isActive: false })
  })
})

describe("getCategoryById", () => {
  it("throws when not found in this org", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(null)
    await expect(getCategoryById("org-1", "bad-id")).rejects.toThrow("Category not found")
  })

  it("returns DTO when found", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue(mockCat as never)
    const result = await getCategoryById("org-1", "cat-1")
    expect(result.id).toBe("cat-1")
    expect(result.titleEn).toBe("Electronics")
  })

  it("maps null titleFr to null in DTO (no fallback at service layer)", async () => {
    vi.mocked(db.category.findFirst).mockResolvedValue({ ...mockCat, titleFr: null } as never)
    const result = await getCategoryById("org-1", "cat-1")
    expect(result.titleFr).toBeNull()
  })
})
