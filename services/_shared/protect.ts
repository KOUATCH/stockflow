import { logger } from "@/lib/logger"
import { can, type Permission } from "@/lib/permissions"
import { logSecurityEvent, SecurityEventType } from "@/lib/security/audit-log"
import { err, ok } from "./action-response"
import { requireOrg, type AuthedContext } from "./require-org"
import type { ActionResponse } from "./types"

/**
 * Wraps a server-action handler with auth + permission enforcement.
 *
 * The returned function is callable as a `"use server"` export. On every call
 * it:
 *  1. Resolves the session and asserts an organisation via `requireOrg()`.
 *  2. Checks that the resolved user holds `options.permission`. If not, logs
 *     a `PERMISSION_DENIED` security event and returns `err("Forbidden")`.
 *  3. Invokes the handler inside a try/catch. Thrown errors are logged with
 *     `userId`/`orgId`/`action` context and returned as `err(message)` so the
 *     caller doesn't see a 500.
 *
 * The wrapper centralises the auth + permission boundary so future actions
 * don't have to (and can't easily) forget to call it — pair this with the
 * ESLint check from ticket #019 that flags any `"use server"` export in
 * `actions/` not wrapped by `protect()`.
 *
 * Usage:
 *
 *   export const deleteUser = protect(
 *     { permission: "users.delete" },
 *     async (ctx, input: { id: string }) => {
 *       await db.user.delete({ where: { id: input.id, organizationId: ctx.orgId } })
 *       return { ok: true }
 *     }
 *   )
 */
export function protect<I, O>(
  options: {
    permission: Permission
    /** Optional override for the resource string in the audit log. */
    auditResource?: string
  },
  handler: (ctx: AuthedContext, input: I) => Promise<O>,
): (input: I) => Promise<ActionResponse<O>> {
  return async (input: I) => {
    let ctx: AuthedContext
    try {
      ctx = await requireOrg()
    } catch (e) {
      // No session or no org — surface as a structured response.
      return err(e instanceof Error ? e.message : "Unauthorized")
    }

    if (!can(ctx.user as Parameters<typeof can>[0], options.permission)) {
      // Best-effort audit; never let logging failure block the response.
      void logSecurityEvent({
        type: SecurityEventType.PERMISSION_DENIED,
        userId: ctx.userId,
        organizationId: ctx.orgId,
        ip: "unknown",
        userAgent: "unknown",
        resource: options.auditResource ?? options.permission,
        details: { reason: "Missing permission", permission: options.permission },
      })
      return err("Forbidden")
    }

    try {
      const data = await handler(ctx, input)
      return ok(data)
    } catch (e) {
      logger.error("server action failed", {
        err: e,
        userId: ctx.userId,
        orgId: ctx.orgId,
        permission: options.permission,
      })
      return err(e instanceof Error ? e.message : "Internal error")
    }
  }
}
