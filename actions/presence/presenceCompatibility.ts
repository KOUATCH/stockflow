import { auth } from "@/auth"
import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export const PRESENCE_SCHEMA_UNAVAILABLE =
  "Presence tracking is not configured in the current database schema."

export interface PresenceAuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  name: string
  organizationId: string
  permissions: string[]
}

export type PresenceAuthResult =
  | { user: PresenceAuthUser }
  | { error: string }

export interface EmployeeSummary {
  id: string
  name: string
  email: string
  image?: string | null
  jobTitle?: string | null
}

export async function getPresenceAuth(): Promise<PresenceAuthResult> {
  const session = await auth()
  const sessionUser = session?.user

  if (!sessionUser?.id || !sessionUser.organizationId) {
    return { error: "Authentication required" }
  }

  const firstName = sessionUser.firstName || null
  const lastName = sessionUser.lastName || null
  const email = sessionUser.email || ""
  const name =
    sessionUser.name ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    email ||
    "User"

  return {
    user: {
      id: sessionUser.id,
      email,
      firstName,
      lastName,
      name,
      organizationId: sessionUser.organizationId,
      permissions: sessionUser.permissions || [],
    },
  }
}

export function canAccessOrganization(user: PresenceAuthUser, organizationId?: string) {
  return !organizationId || organizationId === user.organizationId || user.permissions.includes("*")
}

export function displayName(user: {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Employee"
}

export async function getActiveEmployeeCount(organizationId: string) {
  return db.user.count({
    where: {
      organizationId,
      isActive: true,
    },
  })
}

export async function getActiveEmployees(organizationId: string): Promise<EmployeeSummary[]> {
  const users = await db.user.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      image: true,
      jobTitle: true,
    },
    orderBy: [
      { firstName: "asc" },
      { lastName: "asc" },
      { email: "asc" },
    ],
  })

  return users.map((user) => ({
    id: user.id,
    name: displayName(user),
    email: user.email,
    image: user.image,
    jobTitle: user.jobTitle,
  }))
}

export async function getEmployeeSummary(userId: string, organizationId: string) {
  const user = await db.user.findFirst({
    where: {
      id: userId,
      organizationId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      image: true,
      jobTitle: true,
    },
  })

  if (!user) {
    return {
      id: userId,
      name: "Employee",
      email: "",
      image: null,
      jobTitle: null,
    }
  }

  return {
    id: user.id,
    name: displayName(user),
    email: user.email,
    image: user.image,
    jobTitle: user.jobTitle,
  }
}

export function revalidatePresencePaths() {
  revalidatePath("/[locale]/dashboard/presence", "page")
  revalidatePath("/[locale]/dashboard/presence/alerts", "page")
  revalidatePath("/[locale]/dashboard/presence/schedules", "page")
}

export function syntheticId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`
}
