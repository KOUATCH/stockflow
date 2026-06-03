import { z, type ZodTypeAny } from "zod"

import { err } from "./action-response"
import type { ActionResponse } from "./types"

/**
 * Parses `unknown` input against a Zod schema and returns either the parsed
 * value or a structured validation error response. Designed to plug into the
 * top of a server action so handlers never see un-validated data.
 *
 *   const parsed = parseInput(createUserSchema, raw)
 *   if (!parsed.ok) return parsed.error
 *   const data = parsed.value
 *   // ... safe to use `data` from here
 *
 * Pair with `protect()` from this folder when adding new server actions —
 * the typical shape becomes:
 *
 *   export const createUser = protect(
 *     { permission: "users.create" },
 *     async (ctx, raw: unknown) => {
 *       const parsed = parseInput(createUserSchema, raw)
 *       if (!parsed.ok) throw new Error(parsed.message)
 *       return db.user.create({ data: { ...parsed.value, organizationId: ctx.orgId } })
 *     }
 *   )
 */
export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string; error: ActionResponse<never>; fieldErrors: Record<string, string[]> }

export function parseInput<T extends ZodTypeAny>(
  schema: T,
  input: unknown,
): ParseResult<z.infer<T>> {
  const result = schema.safeParse(input)
  if (result.success) return { ok: true, value: result.data as z.infer<T> }
  const flat = result.error.flatten()
  const fieldErrors = flat.fieldErrors as Record<string, string[]>
  // formErrors holds root-level issues — most notably `.strict()` rejections
  // for unrecognized keys, which list the offending field names in the message.
  const formErrors = flat.formErrors as string[]
  const fieldSummary = Object.entries(fieldErrors)
    .map(([k, msgs]) => `${k}: ${msgs?.join(", ")}`)
    .join("; ")
  const formSummary = formErrors.join("; ")
  const summary = [fieldSummary, formSummary].filter(Boolean).join("; ")
  const message = summary || "Invalid input"
  return {
    ok: false,
    message,
    fieldErrors,
    error: err(message),
  }
}

/**
 * Common reusable Zod fragments for stockflow domain shapes.
 *
 * Use these for new schemas so we get consistent bounds across actions.
 */
export const trimmedString = (max = 200) =>
  z.string().trim().min(1, "Required").max(max, `Must be at most ${max} characters`)

export const optionalTrimmedString = (max = 200) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .optional()
    .or(z.literal(""))

export const cuid = z.string().cuid({ message: "Must be a valid CUID" })

export const emailLower = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address")

export const nonNegativeInt = z.number().int().nonnegative()
export const positiveInt = z.number().int().positive()
