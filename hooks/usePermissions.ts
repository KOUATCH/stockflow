"use client";

import { useSession } from "@/lib/auth-client";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/permissions";

export function usePermissions() {
  const { data: session } = useSession();

  // Better-Auth may have different session structure, fallback to empty array if no permissions
  const userPermissions = session?.user?.permissions || [];

  return {
    // Raw permissions array
    permissions: userPermissions,

    // Check single permission
    hasPermission: (permission: string) => hasPermission(userPermissions, permission),

    // Check if user has any of the provided permissions
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(userPermissions, permissions),

    // Check if user has all of the provided permissions
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(userPermissions, permissions),

    // Convenience checks for common operations
    canCreateUsers: () => hasPermission(userPermissions, "CREATE_USERS"),
    canUpdateUsers: () => hasPermission(userPermissions, "UPDATE_USERS"),
    canDeleteUsers: () => hasPermission(userPermissions, "DELETE_USERS"),
    canManageRoles: () => hasPermission(userPermissions, "CREATE_ROLES"),
    canViewReports: () => hasAnyPermission(userPermissions, [
      "VIEW_FINANCIAL_REPORTS",
      "VIEW_ANALYTICS",
      "VIEW_INVENTORY_REPORTS",
      "VIEW_SALES_REPORTS",
      "VIEW_POS_REPORTS"
    ]),
    canManageInventory: () => hasAnyPermission(userPermissions, [
      "CREATE_ITEMS",
      "UPDATE_ITEMS",
      "MANAGE_INVENTORY_LEVELS"
    ]),
    canOperatePOS: () => hasPermission(userPermissions, "OPERATE_POS"),
    canManageOrganization: () => hasPermission(userPermissions, "MANAGE_ORGANIZATION"),

    // User info
    user: session?.user,
    isAuthenticated: !!session?.user,
  };
}

// Legacy export for backward compatibility
export function usePermission() {
  const { data: session } = useSession();

  const hasPermissionLegacy = (permission: string): boolean => {
    if (!session?.user?.permissions) return false;
    return session.user.permissions.includes(permission);
  };

  const hasAnyPermissionLegacy = (permissions: string[]): boolean => {
    if (!session?.user?.permissions) return false;
    return permissions.some((permission) =>
      session.user.permissions.includes(permission)
    );
  };

  const hasAllPermissionsLegacy = (permissions: string[]): boolean => {
    if (!session?.user?.permissions) return false;
    return permissions.every((permission) =>
      session.user.permissions.includes(permission)
    );
  };

  return {
    hasPermission: hasPermissionLegacy,
    hasAnyPermission: hasAnyPermissionLegacy,
    hasAllPermissions: hasAllPermissionsLegacy,
  };
}

export default usePermissions;
