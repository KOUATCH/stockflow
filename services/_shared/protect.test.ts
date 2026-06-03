import { describe, it, expect, vi, beforeEach } from "vitest"

const { getAuthenticatedUserMock, logSecurityEventMock, captureExceptionMock } = vi.hoisted(() => ({
  getAuthenticatedUserMock: vi.fn(),
  logSecurityEventMock: vi.fn().mockResolvedValue(undefined),
  captureExceptionMock: vi.fn(),
}))

vi.mock("@/config/useAuth", () => ({ getAuthenticatedUser: getAuthenticatedUserMock }))
vi.mock("@/lib/security/audit-log", () => ({
  logSecurityEvent: logSecurityEventMock,
  SecurityEventType: { PERMISSION_DENIED: "PERMISSION_DENIED" },
}))
vi.mock("@sentry/nextjs", () => ({ captureException: captureExceptionMock }))
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

import { protect } from "./protect"

describe("protect()", () => {
  beforeEach(() => vi.clearAllMocks())

  it("returns err('Unauthorized') when no session", async () => {
    getAuthenticatedUserMock.mockResolvedValueOnce({ id: undefined } as never)
    const handler = vi.fn()
    const wrapped = protect({ permission: "users.read" }, handler)
    const r = await wrapped({})
    expect(r.success).toBe(false)
    expect(r.error).toContain("Unauthorized")
    expect(handler).not.toHaveBeenCalled()
  })

  it("returns err('Forbidden') and logs audit event when permission missing", async () => {
    getAuthenticatedUserMock.mockResolvedValueOnce({
      id: "u1",
      organizationId: "org-A",
      permissions: ["items.read"], // no users.delete
    } as never)

    const handler = vi.fn()
    const wrapped = protect({ permission: "users.delete" }, handler)
    const r = await wrapped({})

    expect(r.success).toBe(false)
    expect(r.error).toBe("Forbidden")
    expect(handler).not.toHaveBeenCalled()

    await new Promise((res) => setImmediate(res))
    expect(logSecurityEventMock).toHaveBeenCalledTimes(1)
    expect(logSecurityEventMock.mock.calls[0][0]).toMatchObject({
      type: "PERMISSION_DENIED",
      userId: "u1",
      organizationId: "org-A",
      resource: "users.delete",
    })
  })

  it("invokes handler with ctx when permission satisfied", async () => {
    getAuthenticatedUserMock.mockResolvedValueOnce({
      id: "u-admin",
      organizationId: "org-A",
      permissions: ["*"],
    } as never)

    const handler = vi.fn(async (ctx, input: { id: string }) => {
      return { handledFor: input.id, byUser: ctx.userId, inOrg: ctx.orgId }
    })

    const wrapped = protect({ permission: "users.delete" }, handler)
    const r = await wrapped({ id: "target-1" })

    expect(r.success).toBe(true)
    expect(r.data).toEqual({ handledFor: "target-1", byUser: "u-admin", inOrg: "org-A" })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("reports thrown handler errors to Sentry with userId/orgId/action tags", async () => {
    getAuthenticatedUserMock.mockResolvedValueOnce({
      id: "u-admin",
      organizationId: "org-A",
      permissions: ["*"],
    } as never)

    const wrapped = protect({ permission: "users.delete" }, async () => {
      throw new Error("boom")
    })

    const r = await wrapped({})
    expect(r.success).toBe(false)
    expect(r.error).toBe("boom")
    expect(captureExceptionMock).toHaveBeenCalledTimes(1)
    expect(captureExceptionMock.mock.calls[0][1]).toMatchObject({
      tags: { userId: "u-admin", orgId: "org-A", action: "users.delete" },
    })
  })

  it("role-based admin code bypasses the permission check (admin role short-circuit)", async () => {
    getAuthenticatedUserMock.mockResolvedValueOnce({
      id: "u-admin",
      organizationId: "org-A",
      roles: [{ code: "admin", permissions: [] }],
    } as never)
    const handler = vi.fn(async () => "ok")
    const wrapped = protect({ permission: "users.delete" }, handler)
    const r = await wrapped({})
    expect(r.success).toBe(true)
    expect(handler).toHaveBeenCalled()
  })
})
