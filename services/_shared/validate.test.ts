import { describe, it, expect } from "vitest"
import { z } from "zod"
import { parseInput, trimmedString, emailLower } from "./validate"

describe("parseInput()", () => {
  const schema = z
    .object({
      title: trimmedString(50),
      email: emailLower,
    })
    .strict()

  it("returns ok with parsed value on valid input", () => {
    const r = parseInput(schema, { title: "  Hello  ", email: "FOO@BAR.com" })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.title).toBe("Hello")
      expect(r.value.email).toBe("foo@bar.com")
    }
  })

  it("returns structured error on invalid input", () => {
    const r = parseInput(schema, { title: "", email: "not-an-email" })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.message).toContain("title")
      expect(r.message).toContain("email")
      expect(r.error.success).toBe(false)
      expect(r.fieldErrors).toMatchObject({ title: expect.any(Array), email: expect.any(Array) })
    }
  })

  it("rejects extra fields when schema is strict()", () => {
    const r = parseInput(schema, { title: "x", email: "a@b.com", role: "admin" })
    expect(r.ok).toBe(false)
  })

  it("enforces max length on trimmedString", () => {
    const r = parseInput(schema, { title: "x".repeat(51), email: "a@b.com" })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.fieldErrors.title?.[0]).toMatch(/at most/i)
  })
})
