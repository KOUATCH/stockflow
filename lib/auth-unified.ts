"use client"

import { useSession as useNextAuthSession } from "next-auth/react"

// Unified auth hook that consolidates all authentication logic
export function useAuth() {
  const { data: session, status } = useNextAuthSession()

  const isLoading = status === "loading"
  const isAuthenticated = !!session?.user && !!session?.user?.organizationId
  const user = session?.user || null

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

    // User permissions
    permissions: user?.permissions || [],
    roles: user?.roles || [],

    // Permission checkers
    hasPermission: (permission: string) => {
      const userPermissions = user?.permissions || []
      return userPermissions.includes('*') || userPermissions.includes(permission)
    },

    hasAnyPermission: (permissions: string[]) => {
      const userPermissions = user?.permissions || []
      return userPermissions.includes('*') || permissions.some(p => userPermissions.includes(p))
    },

    hasAllPermissions: (permissions: string[]) => {
      const userPermissions = user?.permissions || []
      return userPermissions.includes('*') || permissions.every(p => userPermissions.includes(p))
    },

    // Role checkers
    hasRole: (roleCode: string) => {
      return user?.roles?.some(role => role.code === roleCode) || false
    },

    hasAnyRole: (roleCodes: string[]) => {
      return user?.roles?.some(role => roleCodes.includes(role.code)) || false
    }
  }
}

// Alias for backward compatibility
export const useSession = useNextAuthSession
export const usePermissions = useAuth

// Client-safe signOut function
export async function signOut(options?: { redirectTo?: string; redirect?: boolean }) {
  const { signOut: nextSignOut } = await import("next-auth/react")

  const callbackUrl = options?.redirectTo || "/login"

  if (options?.redirect === false) {
    return nextSignOut({ callbackUrl, redirect: false })
  }

  return nextSignOut({ callbackUrl, redirect: true })
}

export default useAuth
