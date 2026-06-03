// utils/server-permissions.ts - Server-side RBAC utilities for Auth.js
import { auth } from "@/auth"
import { LOCALE_COOKIE, localizePath, pickLocale } from "@/i18n/routing"
import { hasAllPermissions, hasAnyPermission, hasPermission } from "@/lib/permissions"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function getServerSession() {
  return await auth()
}

export async function getServerPermissions() {
  const session = await auth()
  const userPermissions = session?.user?.permissions || []

  return {
    hasPermission: (permission: string): boolean =>
      hasPermission(userPermissions, permission),

    hasAnyPermission: (permissions: string[]): boolean =>
      hasAnyPermission(userPermissions, permissions),

    hasAllPermissions: (permissions: string[]): boolean =>
      hasAllPermissions(userPermissions, permissions),

    user: session?.user,
    session
  }
}

async function redirectWithRequestLocale(path: string): Promise<never> {
  const cookieStore = await cookies()
  const locale = pickLocale(cookieStore.get(LOCALE_COOKIE)?.value)

  redirect(localizePath(path, locale))
}

// Server-side permission checking with redirect
export async function requirePermission(permission: string) {
  const session = await auth()

  if (!session?.user) {
    return redirectWithRequestLocale('/login')
  }

  if (!hasPermission(session.user.permissions ?? [], permission)) {
    return redirectWithRequestLocale('/unauthorized')
  }

  return session
}

export async function requireAnyPermission(permissions: string[]) {
  const session = await auth()

  if (!session?.user) {
    return redirectWithRequestLocale('/login')
  }

  if (!hasAnyPermission(session.user.permissions ?? [], permissions)) {
    return redirectWithRequestLocale('/unauthorized')
  }

  return session
}

export async function requireAllPermissions(permissions: string[]) {
  const session = await auth()

  if (!session?.user) {
    return redirectWithRequestLocale('/login')
  }

  if (!hasAllPermissions(session.user.permissions ?? [], permissions)) {
    return redirectWithRequestLocale('/unauthorized')
  }

  return session
}

// API route protection helper
export async function requirePermissionForAPI(permission: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }

  if (!hasPermission(session.user.permissions ?? [], permission)) {
    return { error: "Insufficient permissions", status: 403 }
  }

  return { session, status: 200 }
}

// Permission gate component for server components
interface PermissionGateProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export async function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission: checkPermission, hasAnyPermission: checkAnyPermission, hasAllPermissions: checkAllPermissions } = await getServerPermissions()

  let hasAccess = false

  if (permission) {
    hasAccess = checkPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll
      ? checkAllPermissions(permissions)
      : checkAnyPermission(permissions)
  }

  if (!hasAccess) {
    return fallback
  }

  return <>{children}</>
}

// Role-based gate component
interface RoleGateProps {
  roles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export async function RoleGate({
  roles,
  children,
  fallback = null,
}: RoleGateProps) {
  const session = await auth()

  if (!session?.user?.roles) {
    return fallback
  }

  const userRoleCodes = session.user.roles.map(role => role.code)
  const hasRequiredRole = roles.some(role => userRoleCodes.includes(role))

  if (!hasRequiredRole) {
    return fallback
  }

  return <>{children}</>
}
