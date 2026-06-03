import { describe, it, expect, vi, beforeEach } from "vitest"

const { dbMock, hibpMock } = vi.hoisted(() => ({
  dbMock: {
    passwordHistory: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  hibpMock: vi.fn().mockResolvedValue(false),
}))

vi.mock("@/prisma/db", () => ({ db: dbMock }))
vi.mock("@/lib/security/hibp", () => ({
  isPasswordBreached: hibpMock,
  passwordBreachCount: vi.fn(),
}))
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}))

import { checkPasswordPolicy, PASSWORD_HISTORY_DEPTH } from "./password-policy"
import { hashPassword } from "@/lib/security/password-utils"

const STRONG = "Tr@vellingF1sh#42!"

describe("checkPasswordPolicy()", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    hibpMock.mockResolvedValue(false)
    dbMock.passwordHistory.findMany.mockResolvedValue([])
  })

  it("accepts a strong password with no userId / history", async () => {
    const r = await checkPasswordPolicy({ password: STRONG, skipBreachCheck: true })
    expect(r.ok).toBe(true)
  })

  it("rejects a short password", async () => {
    const r = await checkPasswordPolicy({ password: "Aa1!", skipBreachCheck: true })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe("WEAK")
  })

  it("rejects a common password", async () => {
    const r = await checkPasswordPolicy({ password: "password", skipBreachCheck: true })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe("WEAK")
  })

  it("rejects passwords containing the email local-part", async () => {
    const r = await checkPasswordPolicy({
      password: "MyAlice#Password!23",
      email: "alice@example.com",
      skipBreachCheck: true,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe("CONTAINS_EMAIL")
  })

  it("rejects a breached password", async () => {
    hibpMock.mockResolvedValueOnce(true)
    const r = await checkPasswordPolicy({ password: STRONG })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe("BREACHED")
  })

  it("accepts when HIBP is unreachable (fail-open)", async () => {
    hibpMock.mockResolvedValueOnce(false) // isPasswordBreached returns false on network error
    const r = await checkPasswordPolicy({ password: STRONG })
    expect(r.ok).toBe(true)
  })

  it("rejects re-use of a recent password", async () => {
    const oldHash = await hashPassword(STRONG)
    dbMock.passwordHistory.findMany.mockResolvedValueOnce([{ passwordHash: oldHash }])

    const r = await checkPasswordPolicy({
      password: STRONG,
      userId: "u1",
      skipBreachCheck: true,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe("RECENTLY_USED")
    expect(dbMock.passwordHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "u1" },
        take: PASSWORD_HISTORY_DEPTH,
      }),
    )
  })

  it("accepts when the password matches NONE of the history", async () => {
    const decoyHash = await hashPassword("UnrelatedOther#99!")
    dbMock.passwordHistory.findMany.mockResolvedValueOnce([{ passwordHash: decoyHash }])

    const r = await checkPasswordPolicy({
      password: STRONG,
      userId: "u1",
      skipBreachCheck: true,
    })
    expect(r.ok).toBe(true)
  })

  it("does not crash on a malformed historical hash", async () => {
    dbMock.passwordHistory.findMany.mockResolvedValueOnce([{ passwordHash: "garbage-not-a-hash" }])
    const r = await checkPasswordPolicy({
      password: STRONG,
      userId: "u1",
      skipBreachCheck: true,
    })
    // The garbage entry can't match, so the policy passes.
    expect(r.ok).toBe(true)
  })
})
