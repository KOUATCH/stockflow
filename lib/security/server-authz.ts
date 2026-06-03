import { auth } from "@/auth"
import { can } from "@/lib/permissions"
import type { Prisma } from "@prisma/client"

export const safeUserSelect = {
  id: true,
  email: true,
  emailVerified: true,
  firstName: true,
  lastName: true,
  phone: true,
  image: true,
  jobTitle: true,
  isActive: true,
  isVerified: true,
  preferredLocale: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
  roles: {
    select: {
      id: true,
      code: true,
      nameEn: true,
      nameFr: true,
      description: true,
      organizationId: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>

export async function requireApiSessionForOrg(organizationId: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 as const, session: null }
  }

  if (!session.user.organizationId || session.user.organizationId !== organizationId) {
    return { error: "Forbidden", status: 403 as const, session: null }
  }

  return { error: null, status: 200 as const, session }
}

type PermissionUser = {
  id: string
  email?: string | null
  name?: string | null
  roles?: Array<string | { code?: string | null; permissions?: string[] | null }> | null
  permissions?: string[] | null
}

export function hasAppPermission(user: PermissionUser, permission: string) {
  return can(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles ?? undefined,
      permissions: user.permissions ?? undefined,
    },
    permission,
  )
}

export function requireAppPermission(user: PermissionUser, permission: string) {
  if (!hasAppPermission(user, permission)) {
    throw new Error("Forbidden")
  }
}
