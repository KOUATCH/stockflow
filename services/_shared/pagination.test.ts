import { describe, it, expect } from "vitest"
import { buildPagination, buildPaginatedResult, MAX_PAGE_SIZES } from "./pagination"

describe("buildPagination", () => {
  it("returns correct skip/take for page 1", () => {
    const result = buildPagination(1, 20, 100)
    expect(result).toEqual({ skip: 0, take: 20, page: 1, pageSize: 20 })
  })

  it("returns correct skip for page 3", () => {
    const result = buildPagination(3, 10, 100)
    expect(result.skip).toBe(20)
    expect(result.take).toBe(10)
  })

  it("clamps pageSize to maxPageSize", () => {
    const result = buildPagination(1, 9999, 100)
    expect(result.pageSize).toBe(100)
    expect(result.take).toBe(100)
  })

  it("clamps pageSize minimum to 1", () => {
    const result = buildPagination(1, 0, 100)
    expect(result.pageSize).toBe(1)
  })

  it("clamps page minimum to 1 for zero input", () => {
    const result = buildPagination(0, 20, 100)
    expect(result.page).toBe(1)
    expect(result.skip).toBe(0)
  })

  it("clamps page minimum to 1 for negative input", () => {
    const result = buildPagination(-5, 20, 100)
    expect(result.page).toBe(1)
  })
})

describe("buildPaginatedResult", () => {
  it("returns all fields correctly", () => {
    const data = [{ id: "1" }, { id: "2" }]
    const result = buildPaginatedResult(data, 50, 1, 10)
    expect(result.data).toBe(data)
    expect(result.total).toBe(50)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
    expect(result.totalPages).toBe(5)
  })

  it("rounds totalPages up for non-divisible totals", () => {
    const result = buildPaginatedResult([], 11, 1, 5)
    expect(result.totalPages).toBe(3)
  })

  it("returns totalPages of 0 for empty set", () => {
    const result = buildPaginatedResult([], 0, 1, 10)
    expect(result.totalPages).toBe(0)
  })

  it("returns totalPages of 1 when total equals pageSize", () => {
    const result = buildPaginatedResult([], 10, 1, 10)
    expect(result.totalPages).toBe(1)
  })
})

describe("MAX_PAGE_SIZES", () => {
  it("has items capped at 100", () => {
    expect(MAX_PAGE_SIZES.items).toBe(100)
  })

  it("has brands capped at 500", () => {
    expect(MAX_PAGE_SIZES.brands).toBe(500)
  })
})
