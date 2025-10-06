"use client"

import { usePermissions } from "@/lib/auth-client"
import { ReactNode } from "react"

interface PermissionGateProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  }

  if (!hasAccess) {
    return fallback
  }

  return <>{children}</>
}

interface RoleGateProps {
  roles: string[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGate({
  roles,
  children,
  fallback = null
}: RoleGateProps) {
  const { user } = usePermissions()

  if (!user?.roles) {
    return fallback
  }

  const userRoleCodes = user.roles.map(role => role.code)
  const hasRequiredRole = roles.some(role => userRoleCodes.includes(role))

  if (!hasRequiredRole) {
    return fallback
  }

  return <>{children}</>
}

// Convenience components for common permission checks
export function AdminOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleGate roles={['super_admin', 'administrator']} fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export function ManagerOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <RoleGate roles={['super_admin', 'administrator', 'manager']} fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export function AuthorizedOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  const { isAuthenticated } = usePermissions()

  if (!isAuthenticated) {
    return fallback
  }

  return <>{children}</>
}