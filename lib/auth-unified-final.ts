/**
 * Unified Authentication & Authorization System for StockFlow
 *
 * This is the single source of truth for all authentication and authorization
 * logic in the application. It uses Auth.js (NextAuth v5) and provides:
 *
 * 1. Client-side hooks for React components
 * 2. Server-side functions for API routes and server components
 * 3. Middleware helpers for route protection
 * 4. Comprehensive RBAC with permissions
 */

"use client"

import { useSession as useNextAuthSession, signOut as nextSignOut } from "next-auth/react"
import { auth } from "@/auth"
import { getLocaleFromPathname, localizePath } from "@/i18n/routing"
import { redirect } from "next/navigation"
import { PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/permissions"
import { DEFAULT_LOCALE } from "@/types/bilingual"

// Types for better TypeScript support
export interface AuthUser {
  id: string
  email: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  image?: string | null
  organizationId: string
  organizationName?: string | null
  roles: Array<{
    id: string
    name: string
    code: string
    permissions: string[]
  }>
  permissions: string[]
}

export interface AuthSession {
  user: AuthUser
  expires: string
}

function localizedClientHref(href: string) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE
  return localizePath(href, locale)
}

// ============================================================================
// CLIENT-SIDE HOOKS (for React components)
// ============================================================================

/**
 * Main authentication hook for client components
 * Provides authentication state, user data, and permission checking
 */
export function useAuth(options: {
  requireAuth?: boolean
  requireOrg?: boolean
  redirectTo?: string
} = {}) {
  const { data: session, status } = useNextAuthSession()

  const isLoading = status === "loading"
  const isAuthenticated = !!session?.user && !!session?.user?.organizationId
  const user = session?.user as AuthUser | null

  // Permission checking functions
  const checkPermission = (permission: string): boolean => {
    if (!user?.permissions) return false
    return hasPermission(user.permissions, permission)
  }

  const checkAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false
    return hasAnyPermission(user.permissions, permissions)
  }

  const checkAllPermissions = (permissions: string[]): boolean => {
    if (!user?.permissions) return false
    return hasAllPermissions(user.permissions, permissions)
  }

  // Role checking functions
  const hasRole = (roleCode: string): boolean => {
    if (!user?.roles) return false
    return user.roles.some(role => role.code === roleCode)
  }

  const hasAnyRole = (roleCodes: string[]): boolean => {
    if (!user?.roles) return false
    return user.roles.some(role => roleCodes.includes(role.code))
  }

  // Convenience checks
  const isAdmin = () => hasAnyRole(['admin', 'super_admin'])
  const isSuperAdmin = () => hasRole('super_admin')
  const isOwner = () => hasRole('owner')

  return {
    // Core state
    user,
    session,
    status,
    isLoading,
    isAuthenticated,

    // Organization info
    organizationId: user?.organizationId || null,
    organizationName: user?.organizationName || null,

    // Permission checking
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,

    // Role checking
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isOwner,

    // Common permission checks
    canManageUsers: () => checkPermission(PERMISSIONS.CREATE_USERS),
    canManageRoles: () => checkPermission(PERMISSIONS.CREATE_ROLES),
    canManageInventory: () => checkAnyPermission([
      PERMISSIONS.CREATE_ITEMS,
      PERMISSIONS.UPDATE_ITEMS,
      PERMISSIONS.MANAGE_INVENTORY_LEVELS
    ]),
    canOperatePOS: () => checkPermission(PERMISSIONS.OPERATE_POS),
    canViewReports: () => checkAnyPermission([
      PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.VIEW_INVENTORY_REPORTS,
      PERMISSIONS.VIEW_SALES_REPORTS,
      PERMISSIONS.VIEW_POS_REPORTS
    ]),
    canManageOrganization: () => checkPermission(PERMISSIONS.MANAGE_ORGANIZATION),

    // Actions
    signOut: (redirectTo = "/login") => nextSignOut({ callbackUrl: localizedClientHref(redirectTo) })
  }
}

/**
 * Lightweight hook for permission checking only
 */
export function usePermissions() {
  const { data: session } = useNextAuthSession()
  const user = session?.user as AuthUser | null

  return {
    permissions: user?.permissions || [],
    hasPermission: (permission: string) => user?.permissions ? hasPermission(user.permissions, permission) : false,
    hasAnyPermission: (permissions: string[]) => user?.permissions ? hasAnyPermission(user.permissions, permissions) : false,
    hasAllPermissions: (permissions: string[]) => user?.permissions ? hasAllPermissions(user.permissions, permissions) : false,
    user,
    isAuthenticated: !!user
  }
}

/**
 * Hook for components that require authentication
 */
export function useRequireAuth() {
  const auth = useAuth()

  if (typeof window !== 'undefined' && !auth.isLoading && !auth.isAuthenticated) {
    window.location.href = localizedClientHref('/login')
  }

  return auth
}

// ============================================================================
// SERVER-SIDE FUNCTIONS (for API routes and server components)
// ============================================================================

/**
 * Get the current session on the server
 */
export async function getServerSession() {
  return await auth()
}

/**
 * Get authenticated user or redirect to login
 */
export async function getAuthenticatedUser(): Promise<AuthUser> {
  const session = await auth()

  if (!session?.user) {
    redirect(localizedClientHref("/login"))
  }

  if (!session.user.organizationId) {
    redirect(localizedClientHref("/register"))
  }

  return session.user as AuthUser
}

/**
 * Get current user without redirecting (returns null if not authenticated)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth()
  return session?.user as AuthUser | null
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth()
  return !!session?.user?.organizationId
}

/**
 * Server-side permission checking
 */
export async function requirePermission(permission: string): Promise<AuthSession> {
  const session = await auth()

  if (!session?.user) {
    redirect(localizedClientHref("/login"))
  }

  if (!session.user.organizationId) {
    redirect(localizedClientHref("/register"))
  }

  const user = session.user as AuthUser
  if (!hasPermission(user.permissions, permission)) {
    redirect(localizedClientHref("/unauthorized"))
  }

  return session as AuthSession
}

/**
 * Check multiple permissions (any)
 */
export async function requireAnyPermission(permissions: string[]): Promise<AuthSession> {
  const session = await auth()

  if (!session?.user) {
    redirect(localizedClientHref("/login"))
  }

  if (!session.user.organizationId) {
    redirect(localizedClientHref("/register"))
  }

  const user = session.user as AuthUser
  if (!hasAnyPermission(user.permissions, permissions)) {
    redirect(localizedClientHref("/unauthorized"))
  }

  return session as AuthSession
}

/**
 * Check role access
 */
export async function requireRole(roleCode: string): Promise<AuthSession> {
  const session = await auth()

  if (!session?.user) {
    redirect(localizedClientHref("/login"))
  }

  if (!session.user.organizationId) {
    redirect(localizedClientHref("/register"))
  }

  const user = session.user as AuthUser
  const hasRequiredRole = user.roles?.some(role => role.code === roleCode)

  if (!hasRequiredRole) {
    redirect(localizedClientHref("/unauthorized"))
  }

  return session as AuthSession
}

// ============================================================================
// API ROUTE HELPERS (return errors instead of redirecting)
// ============================================================================

export async function requireAuthForAPI() {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }

  if (!session.user.organizationId) {
    return { error: "Organization required", status: 403 }
  }

  return { session: session as AuthSession, status: 200 }
}

export async function requirePermissionForAPI(permission: string) {
  const session = await auth()

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }

  if (!session.user.organizationId) {
    return { error: "Organization required", status: 403 }
  }

  const user = session.user as AuthUser
  if (!hasPermission(user.permissions, permission)) {
    return { error: "Insufficient permissions", status: 403 }
  }

  return { session: session as AuthSession, status: 200 }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

// Re-export the auth function for direct use
export { auth }

// Re-export permissions for easy access
export { PERMISSIONS }

// Default export for main hook
export default useAuth
