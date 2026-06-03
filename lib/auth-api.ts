/**
 * Unified Authentication API for Auth.js (NextAuth v5)
 *
 * This file provides a centralized authentication interface that works
 * across server components, API routes, middleware, and client components.
 */

import { auth } from "@/auth"
import { localizedRedirect } from "@/i18n/server-routing"

async function redirectTo(path: string): Promise<never> {
  await localizedRedirect(path)
  throw new Error(`Redirected to ${path}`)
}

// Server-side authentication functions
export async function getServerSession() {
  return await auth()
}

export async function getAuthenticatedUser() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirectTo("/login")
  }

  if (!user.organizationId) {
    return redirectTo("/register")
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    roles: user.roles || [],
    permissions: user.permissions || []
  }
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}

export async function isAuthenticated() {
  const session = await auth()
  return !!session?.user?.organizationId
}

// Permission checking functions
export async function hasPermission(permission: string) {
  const session = await auth()
  if (!session?.user) return false

  const userPermissions = session.user.permissions || []
  return userPermissions.includes('*') || userPermissions.includes(permission)
}

export async function hasAnyPermission(permissions: string[]) {
  const session = await auth()
  if (!session?.user) return false

  const userPermissions = session.user.permissions || []
  return userPermissions.includes('*') || permissions.some(p => userPermissions.includes(p))
}

export async function hasAllPermissions(permissions: string[]) {
  const session = await auth()
  if (!session?.user) return false

  const userPermissions = session.user.permissions || []
  return userPermissions.includes('*') || permissions.every(p => userPermissions.includes(p))
}

export async function hasRole(roleCode: string) {
  const session = await auth()
  if (!session?.user?.roles) return false

  return session.user.roles.some(role => role.code === roleCode)
}

export async function hasAnyRole(roleCodes: string[]) {
  const session = await auth()
  if (!session?.user?.roles) return false

  return session.user.roles.some(role => roleCodes.includes(role.code))
}

// Authorization helpers with redirects
export async function requireAuth() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirectTo("/login")
  }

  if (!user.organizationId) {
    return redirectTo("/register")
  }

  return session
}

export async function requirePermission(permission: string) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirectTo("/login")
  }

  if (!user.organizationId) {
    return redirectTo("/register")
  }

  const userPermissions = user.permissions || []
  const hasAccess = userPermissions.includes('*') || userPermissions.includes(permission)

  if (!hasAccess) {
    return redirectTo("/unauthorized")
  }

  return session
}

export async function requireAnyPermission(permissions: string[]) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirectTo("/login")
  }

  if (!user.organizationId) {
    return redirectTo("/register")
  }

  const userPermissions = user.permissions || []
  const hasAccess = userPermissions.includes('*') || permissions.some(p => userPermissions.includes(p))

  if (!hasAccess) {
    return redirectTo("/unauthorized")
  }

  return session
}

export async function requireRole(roleCode: string) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirectTo("/login")
  }

  if (!user.organizationId) {
    return redirectTo("/register")
  }

  const hasAccess = user.roles?.some(role => role.code === roleCode)

  if (!hasAccess) {
    return redirectTo("/unauthorized")
  }

  return session
}

// API route helpers (return errors instead of redirecting)
export async function requireAuthForAPI() {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }

  if (!session.user.organizationId) {
    return { error: "Organization required", status: 403 }
  }

  return { session, status: 200 }
}

export async function requirePermissionForAPI(permission: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }

  if (!session.user.organizationId) {
    return { error: "Organization required", status: 403 }
  }

  const userPermissions = session.user.permissions || []
  const hasAccess = userPermissions.includes('*') || userPermissions.includes(permission)

  if (!hasAccess) {
    return { error: "Insufficient permissions", status: 403 }
  }

  return { session, status: 200 }
}

export async function requireAnyPermissionForAPI(permissions: string[]) {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }

  if (!session.user.organizationId) {
    return { error: "Organization required", status: 403 }
  }

  const userPermissions = session.user.permissions || []
  const hasAccess = userPermissions.includes('*') || permissions.some(p => userPermissions.includes(p))

  if (!hasAccess) {
    return { error: "Insufficient permissions", status: 403 }
  }

  return { session, status: 200 }
}

// Re-export auth function for convenience
export { auth } from "@/auth"
