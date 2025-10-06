"use client";

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // If no permissions specified, allow access
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// HOC version for wrapping components
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: string,
  fallback?: React.ReactNode
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGate permission={permission} fallback={fallback}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}

// Hook for conditional rendering in components
export function usePermissionGate() {
  const permissions = usePermissions();

  return {
    ...permissions,
    canRender: (permission: string, fallback?: React.ReactNode) => (children: React.ReactNode) =>
      permissions.hasPermission(permission) ? children : fallback || null,
  };
}