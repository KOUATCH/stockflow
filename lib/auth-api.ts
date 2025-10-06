/**
 * Unified Authentication API for Auth.js (NextAuth v5)
 *
 * This file provides a centralized authentication interface that works
 * across server components, API routes, middleware, and client components.
 */

import { auth } from "@/auth"
import { redirect } from "next/navigation"

// Server-side authentication functions
export async function getServerSession() {
  return await auth()
}

export async function getAuthenticatedUser() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.organizationId) {
    redirect("/register")
  }

  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    phone: session.user.phone,
    organizationId: session.user.organizationId,
    organizationName: session.user.organizationName,
    roles: session.user.roles || [],
    permissions: session.user.permissions || []
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

  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.organizationId) {
    redirect("/register")
  }

  return session
}

export async function requirePermission(permission: string) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.organizationId) {
    redirect("/register")
  }

  const userPermissions = session.user.permissions || []
  const hasAccess = userPermissions.includes('*') || userPermissions.includes(permission)

  if (!hasAccess) {
    redirect("/unauthorized")
  }

  return session
}

export async function requireAnyPermission(permissions: string[]) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.organizationId) {
    redirect("/register")
  }

  const userPermissions = session.user.permissions || []
  const hasAccess = userPermissions.includes('*') || permissions.some(p => userPermissions.includes(p))

  if (!hasAccess) {
    redirect("/unauthorized")
  }

  return session
}

export async function requireRole(roleCode: string) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.organizationId) {
    redirect("/register")
  }

  const hasAccess = session.user.roles?.some(role => role.code === roleCode)

  if (!hasAccess) {
    redirect("/unauthorized")
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