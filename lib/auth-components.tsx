/**
 * Authentication & Authorization Components for StockFlow
 *
 * Provides React components for protecting UI elements based on
 * authentication state, permissions, and roles.
 */

import React from 'react'
import { auth } from '@/auth'
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/permissions'
import type { AuthUser } from './auth-unified-final'

// ============================================================================
// SERVER COMPONENTS (for server-side rendering)
// ============================================================================

interface PermissionGateProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Server component that renders children only if user has required permission(s)
 */
export async function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const session = await auth()
  const user = session?.user as AuthUser | null

  if (!user?.permissions) {
    return <>{fallback}</>
  }

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(user.permissions, permission)
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(user.permissions, permissions)
      : hasAnyPermission(user.permissions, permissions)
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface RoleGateProps {
  role?: string
  roles?: string[]
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Server component that renders children only if user has required role(s)
 */
export async function RoleGate({
  role,
  roles,
  requireAll = false,
  children,
  fallback = null,
}: RoleGateProps) {
  const session = await auth()
  const user = session?.user as AuthUser | null

  if (!user?.roles) {
    return <>{fallback}</>
  }

  const userRoleCodes = user.roles.map(r => r.code)
  let hasAccess = false

  if (role) {
    hasAccess = userRoleCodes.includes(role)
  } else if (roles) {
    hasAccess = requireAll
      ? roles.every(r => userRoleCodes.includes(r))
      : roles.some(r => userRoleCodes.includes(r))
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface AuthGateProps {
  requireAuth?: boolean
  requireOrg?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Server component that renders children only if user is authenticated
 */
export async function AuthGate({
  requireAuth = true,
  requireOrg = true,
  children,
  fallback = null,
}: AuthGateProps) {
  const session = await auth()
  const user = session?.user as AuthUser | null

  if (requireAuth && !user) {
    return <>{fallback}</>
  }

  if (requireOrg && !user?.organizationId) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ============================================================================
// CLIENT COMPONENTS (for client-side rendering)
// ============================================================================

"use client"

import { useAuth } from './auth-unified-final'

interface ClientPermissionGateProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Client component that renders children only if user has required permission(s)
 */
export function ClientPermissionGate({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: ClientPermissionGateProps) {
  const { hasPermission: checkPermission, hasAnyPermission, hasAllPermissions, isLoading } = useAuth()

  if (isLoading) {
    return <>{fallback}</>
  }

  let hasAccess = false

  if (permission) {
    hasAccess = checkPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface ClientRoleGateProps {
  role?: string
  roles?: string[]
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Client component that renders children only if user has required role(s)
 */
export function ClientRoleGate({
  role,
  roles,
  requireAll = false,
  children,
  fallback = null,
}: ClientRoleGateProps) {
  const { hasRole, hasAnyRole, isLoading, user } = useAuth()

  if (isLoading) {
    return <>{fallback}</>
  }

  let hasAccess = false

  if (role) {
    hasAccess = hasRole(role)
  } else if (roles) {
    hasAccess = requireAll
      ? roles.every(r => hasRole(r))
      : hasAnyRole(roles)
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface ClientAuthGateProps {
  requireAuth?: boolean
  requireOrg?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Client component that renders children only if user is authenticated
 */
export function ClientAuthGate({
  requireAuth = true,
  requireOrg = true,
  children,
  fallback = null,
}: ClientAuthGateProps) {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <>{fallback}</>
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>
  }

  if (requireOrg && !user?.organizationId) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ============================================================================
// HIGHER-ORDER COMPONENTS
// ============================================================================

/**
 * HOC that wraps a component with authentication requirements
 */
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: {
    requireAuth?: boolean
    requireOrg?: boolean
    permission?: string
    permissions?: string[]
    role?: string
    roles?: string[]
  } = {}
) {
  return function AuthenticatedComponent(props: T) {
    const auth = useAuth()

    if (auth.isLoading) {
      return <div>Loading...</div> // You can customize this loading state
    }

    if (options.requireAuth !== false && !auth.isAuthenticated) {
      return <div>Please log in to access this content.</div>
    }

    if (options.requireOrg !== false && !auth.user?.organizationId) {
      return <div>Organization setup required.</div>
    }

    if (options.permission && !auth.hasPermission(options.permission)) {
      return <div>Insufficient permissions.</div>
    }

    if (options.permissions && !auth.hasAnyPermission(options.permissions)) {
      return <div>Insufficient permissions.</div>
    }

    if (options.role && !auth.hasRole(options.role)) {
      return <div>Insufficient role permissions.</div>
    }

    if (options.roles && !auth.hasAnyRole(options.roles)) {
      return <div>Insufficient role permissions.</div>
    }

    return <Component {...props} />
  }
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

/**
 * Loading spinner component for authentication states
 */
export function AuthLoader({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      {children && <span className="ml-2">{children}</span>}
    </div>
  )
}

/**
 * Unauthorized access component
 */
export function UnauthorizedAccess({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600">
          {message || "You don't have permission to access this resource."}
        </p>
      </div>
    </div>
  )
}