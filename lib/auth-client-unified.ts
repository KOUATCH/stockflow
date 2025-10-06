"use client"

import { useSession as useNextAuthSession, signOut as nextSignOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Unified client-side authentication hook for Auth.js (NextAuth v5)
 *
 * This hook provides all authentication functionality needed on the client side:
 * - Authentication state
 * - Permission checking
 * - Role checking
 * - Auto-redirect functionality
 */
export function useAuth(options: { requireAuth?: boolean; requireOrg?: boolean } = {}) {
  const { data: session, status } = useNextAuthSession()
  const router = useRouter()

  const isLoading = status === "loading"
  const isAuthenticated = !!session?.user && !!session?.user?.organizationId
  const user = session?.user || null

  // Auto-redirect logic
  useEffect(() => {
    if (options.requireAuth && status === "unauthenticated") {
      router.push("/login")
    } else if (options.requireOrg && isAuthenticated && !user?.organizationId) {
      router.push("/register")
    }
  }, [status, isAuthenticated, user?.organizationId, options.requireAuth, options.requireOrg, router])

  // Permission checking functions
  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false
    return user.permissions.includes('*') || user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false
    return user.permissions.includes('*') || permissions.some(p => user.permissions.includes(p))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user?.permissions) return false
    return user.permissions.includes('*') || permissions.every(p => user.permissions.includes(p))
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

  const hasAllRoles = (roleCodes: string[]): boolean => {
    if (!user?.roles) return false
    return roleCodes.every(roleCode => user.roles?.some(role => role.code === roleCode))
  }

  return {
    // Basic auth state
    user,
    session,
    status,
    isLoading,
    isAuthenticated,

    // Organization info
    organizationId: user?.organizationId || null,
    organizationName: user?.organizationName || null,

    // User permissions and roles
    permissions: user?.permissions || [],
    roles: user?.roles || [],

    // Permission checkers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Role checkers
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // Convenience permission checks for common operations
    canCreateUsers: () => hasPermission("users.create"),
    canUpdateUsers: () => hasPermission("users.update"),
    canDeleteUsers: () => hasPermission("users.delete"),
    canManageRoles: () => hasPermission("roles.manage"),
    canViewReports: () => hasAnyPermission([
      "reports.financial.view",
      "reports.analytics.view",
      "reports.inventory.view",
      "reports.sales.view",
      "reports.pos.view"
    ]),
    canManageInventory: () => hasAnyPermission([
      "inventory.items.create",
      "inventory.items.update",
      "inventory.levels.manage"
    ]),
    canOperatePOS: () => hasPermission("pos.operate"),
    canManageOrganization: () => hasPermission("organization.manage"),

    // Admin checks
    isAdmin: () => hasRole("admin"),
    isOwner: () => hasRole("owner"),
    isSuperAdmin: () => hasRole("super_admin"),

    // Actions
    signOut: (redirectTo = "/login") => nextSignOut({ callbackUrl: redirectTo })
  }
}

/**
 * Hook for components that require authentication
 */
export function useRequireAuth() {
  return useAuth({ requireAuth: true })
}

/**
 * Hook for components that require authentication and organization
 */
export function useRequireAuthAndOrg() {
  return useAuth({ requireAuth: true, requireOrg: true })
}

/**
 * Hook specifically for permission checking (lighter weight)
 */
export function usePermissions() {
  const { data: session } = useNextAuthSession()
  const user = session?.user

  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false
    return user.permissions.includes('*') || user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false
    return user.permissions.includes('*') || permissions.some(p => user.permissions.includes(p))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user?.permissions) return false
    return user.permissions.includes('*') || permissions.every(p => user.permissions.includes(p))
  }

  return {
    permissions: user?.permissions || [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    user,
    isAuthenticated: !!user
  }
}

/**
 * Hook specifically for role checking
 */
export function useRoles() {
  const { data: session } = useNextAuthSession()
  const user = session?.user

  const hasRole = (roleCode: string): boolean => {
    if (!user?.roles) return false
    return user.roles.some(role => role.code === roleCode)
  }

  const hasAnyRole = (roleCodes: string[]): boolean => {
    if (!user?.roles) return false
    return user.roles.some(role => roleCodes.includes(role.code))
  }

  return {
    roles: user?.roles || [],
    hasRole,
    hasAnyRole,
    user,
    isAuthenticated: !!user
  }
}

// Re-export for convenience
export const useSession = useNextAuthSession
export const signOut = (redirectTo = "/login") => nextSignOut({ callbackUrl: redirectTo })

// Default export
export default useAuth