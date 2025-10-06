// Permission system for StockFlow - Comprehensive RBAC
export const PERMISSIONS = {
  // Organization Management
  MANAGE_ORGANIZATION: 'MANAGE_ORGANIZATION',
  VIEW_ORGANIZATION_SETTINGS: 'VIEW_ORGANIZATION_SETTINGS',

  // User Management
  CREATE_USERS: 'CREATE_USERS',
  READ_USERS: 'READ_USERS',
  UPDATE_USERS: 'UPDATE_USERS',
  DELETE_USERS: 'DELETE_USERS',
  DEACTIVATE_USERS: 'DEACTIVATE_USERS',

  // Role Management
  CREATE_ROLES: 'CREATE_ROLES',
  READ_ROLES: 'READ_ROLES',
  UPDATE_ROLES: 'UPDATE_ROLES',
  DELETE_ROLES: 'DELETE_ROLES',
  ASSIGN_ROLES: 'ASSIGN_ROLES',

  // Location Management
  CREATE_LOCATIONS: 'CREATE_LOCATIONS',
  READ_LOCATIONS: 'READ_LOCATIONS',
  UPDATE_LOCATIONS: 'UPDATE_LOCATIONS',
  DELETE_LOCATIONS: 'DELETE_LOCATIONS',
  MANAGE_LOCATION_SETTINGS: 'MANAGE_LOCATION_SETTINGS',

  // Inventory Management
  CREATE_ITEMS: 'CREATE_ITEMS',
  READ_ITEMS: 'READ_ITEMS',
  UPDATE_ITEMS: 'UPDATE_ITEMS',
  DELETE_ITEMS: 'DELETE_ITEMS',
  MANAGE_INVENTORY_LEVELS: 'MANAGE_INVENTORY_LEVELS',
  VIEW_INVENTORY_REPORTS: 'VIEW_INVENTORY_REPORTS',

  // Category Management
  CREATE_CATEGORIES: 'CREATE_CATEGORIES',
  READ_CATEGORIES: 'READ_CATEGORIES',
  UPDATE_CATEGORIES: 'UPDATE_CATEGORIES',
  DELETE_CATEGORIES: 'DELETE_CATEGORIES',

  // Purchase Orders
  CREATE_PURCHASE_ORDERS: 'CREATE_PURCHASE_ORDERS',
  READ_PURCHASE_ORDERS: 'READ_PURCHASE_ORDERS',
  UPDATE_PURCHASE_ORDERS: 'UPDATE_PURCHASE_ORDERS',
  DELETE_PURCHASE_ORDERS: 'DELETE_PURCHASE_ORDERS',
  APPROVE_PURCHASE_ORDERS: 'APPROVE_PURCHASE_ORDERS',
  VIEW_PURCHASE_REPORTS: 'VIEW_PURCHASE_REPORTS',

  // Sales Orders
  CREATE_SALES_ORDERS: 'CREATE_SALES_ORDERS',
  READ_SALES_ORDERS: 'READ_SALES_ORDERS',
  UPDATE_SALES_ORDERS: 'UPDATE_SALES_ORDERS',
  DELETE_SALES_ORDERS: 'DELETE_SALES_ORDERS',
  PROCESS_SALES: 'PROCESS_SALES',
  VIEW_SALES_REPORTS: 'VIEW_SALES_REPORTS',

  // Stock Management
  CREATE_STOCK_ADJUSTMENTS: 'CREATE_STOCK_ADJUSTMENTS',
  APPROVE_STOCK_ADJUSTMENTS: 'APPROVE_STOCK_ADJUSTMENTS',
  CREATE_STOCK_TRANSFERS: 'CREATE_STOCK_TRANSFERS',
  APPROVE_STOCK_TRANSFERS: 'APPROVE_STOCK_TRANSFERS',
  RECEIVE_GOODS: 'RECEIVE_GOODS',

  // Supplier Management
  CREATE_SUPPLIERS: 'CREATE_SUPPLIERS',
  READ_SUPPLIERS: 'READ_SUPPLIERS',
  UPDATE_SUPPLIERS: 'UPDATE_SUPPLIERS',
  DELETE_SUPPLIERS: 'DELETE_SUPPLIERS',

  // Customer Management
  CREATE_CUSTOMERS: 'CREATE_CUSTOMERS',
  READ_CUSTOMERS: 'READ_CUSTOMERS',
  UPDATE_CUSTOMERS: 'UPDATE_CUSTOMERS',
  DELETE_CUSTOMERS: 'DELETE_CUSTOMERS',

  // POS Operations
  OPERATE_POS: 'OPERATE_POS',
  MANAGE_POS_SESSIONS: 'MANAGE_POS_SESSIONS',
  MANAGE_CASH_DRAWER: 'MANAGE_CASH_DRAWER',
  PROCESS_PAYMENTS: 'PROCESS_PAYMENTS',
  PROCESS_REFUNDS: 'PROCESS_REFUNDS',
  VIEW_POS_REPORTS: 'VIEW_POS_REPORTS',

  // Financial Reports
  VIEW_FINANCIAL_REPORTS: 'VIEW_FINANCIAL_REPORTS',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  EXPORT_DATA: 'EXPORT_DATA',

  // System Administration
  MANAGE_SYSTEM_SETTINGS: 'MANAGE_SYSTEM_SETTINGS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  MANAGE_INTEGRATIONS: 'MANAGE_INTEGRATIONS',
} as const;

export type Permission = keyof typeof PERMISSIONS;

// Predefined role templates with permissions
export const ROLE_TEMPLATES = {
  SUPER_ADMIN: {
    name: 'Super Administrator',
    code: 'super_admin',
    description: 'Full system access with all permissions',
    permissions: Object.values(PERMISSIONS),
    hierarchy: 1,
  },

  ADMIN: {
    name: 'Administrator',
    code: 'administrator',
    description: 'Organization administrator with full business access',
    permissions: [
      PERMISSIONS.VIEW_ORGANIZATION_SETTINGS,
      PERMISSIONS.CREATE_USERS,
      PERMISSIONS.READ_USERS,
      PERMISSIONS.UPDATE_USERS,
      PERMISSIONS.DEACTIVATE_USERS,
      PERMISSIONS.CREATE_ROLES,
      PERMISSIONS.READ_ROLES,
      PERMISSIONS.UPDATE_ROLES,
      PERMISSIONS.ASSIGN_ROLES,
      PERMISSIONS.CREATE_LOCATIONS,
      PERMISSIONS.READ_LOCATIONS,
      PERMISSIONS.UPDATE_LOCATIONS,
      PERMISSIONS.MANAGE_LOCATION_SETTINGS,
      PERMISSIONS.CREATE_ITEMS,
      PERMISSIONS.READ_ITEMS,
      PERMISSIONS.UPDATE_ITEMS,
      PERMISSIONS.DELETE_ITEMS,
      PERMISSIONS.MANAGE_INVENTORY_LEVELS,
      PERMISSIONS.VIEW_INVENTORY_REPORTS,
      PERMISSIONS.CREATE_CATEGORIES,
      PERMISSIONS.READ_CATEGORIES,
      PERMISSIONS.UPDATE_CATEGORIES,
      PERMISSIONS.DELETE_CATEGORIES,
      PERMISSIONS.CREATE_PURCHASE_ORDERS,
      PERMISSIONS.READ_PURCHASE_ORDERS,
      PERMISSIONS.UPDATE_PURCHASE_ORDERS,
      PERMISSIONS.APPROVE_PURCHASE_ORDERS,
      PERMISSIONS.VIEW_PURCHASE_REPORTS,
      PERMISSIONS.CREATE_SALES_ORDERS,
      PERMISSIONS.READ_SALES_ORDERS,
      PERMISSIONS.UPDATE_SALES_ORDERS,
      PERMISSIONS.PROCESS_SALES,
      PERMISSIONS.VIEW_SALES_REPORTS,
      PERMISSIONS.CREATE_STOCK_ADJUSTMENTS,
      PERMISSIONS.APPROVE_STOCK_ADJUSTMENTS,
      PERMISSIONS.CREATE_STOCK_TRANSFERS,
      PERMISSIONS.APPROVE_STOCK_TRANSFERS,
      PERMISSIONS.RECEIVE_GOODS,
      PERMISSIONS.CREATE_SUPPLIERS,
      PERMISSIONS.READ_SUPPLIERS,
      PERMISSIONS.UPDATE_SUPPLIERS,
      PERMISSIONS.CREATE_CUSTOMERS,
      PERMISSIONS.READ_CUSTOMERS,
      PERMISSIONS.UPDATE_CUSTOMERS,
      PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.EXPORT_DATA,
    ],
    hierarchy: 2,
  },

  MANAGER: {
    name: 'Manager',
    code: 'manager',
    description: 'Location or department manager with operational access',
    permissions: [
      PERMISSIONS.READ_USERS,
      PERMISSIONS.READ_LOCATIONS,
      PERMISSIONS.CREATE_ITEMS,
      PERMISSIONS.READ_ITEMS,
      PERMISSIONS.UPDATE_ITEMS,
      PERMISSIONS.MANAGE_INVENTORY_LEVELS,
      PERMISSIONS.VIEW_INVENTORY_REPORTS,
      PERMISSIONS.READ_CATEGORIES,
      PERMISSIONS.CREATE_PURCHASE_ORDERS,
      PERMISSIONS.READ_PURCHASE_ORDERS,
      PERMISSIONS.UPDATE_PURCHASE_ORDERS,
      PERMISSIONS.VIEW_PURCHASE_REPORTS,
      PERMISSIONS.CREATE_SALES_ORDERS,
      PERMISSIONS.READ_SALES_ORDERS,
      PERMISSIONS.UPDATE_SALES_ORDERS,
      PERMISSIONS.PROCESS_SALES,
      PERMISSIONS.VIEW_SALES_REPORTS,
      PERMISSIONS.CREATE_STOCK_ADJUSTMENTS,
      PERMISSIONS.CREATE_STOCK_TRANSFERS,
      PERMISSIONS.RECEIVE_GOODS,
      PERMISSIONS.READ_SUPPLIERS,
      PERMISSIONS.READ_CUSTOMERS,
      PERMISSIONS.UPDATE_CUSTOMERS,
      PERMISSIONS.OPERATE_POS,
      PERMISSIONS.MANAGE_POS_SESSIONS,
      PERMISSIONS.MANAGE_CASH_DRAWER,
      PERMISSIONS.PROCESS_PAYMENTS,
      PERMISSIONS.PROCESS_REFUNDS,
      PERMISSIONS.VIEW_POS_REPORTS,
    ],
    hierarchy: 3,
  },

  SUPERVISOR: {
    name: 'Supervisor',
    code: 'supervisor',
    description: 'Shift supervisor with limited management capabilities',
    permissions: [
      PERMISSIONS.READ_USERS,
      PERMISSIONS.READ_ITEMS,
      PERMISSIONS.UPDATE_ITEMS,
      PERMISSIONS.VIEW_INVENTORY_REPORTS,
      PERMISSIONS.READ_CATEGORIES,
      PERMISSIONS.READ_PURCHASE_ORDERS,
      PERMISSIONS.CREATE_SALES_ORDERS,
      PERMISSIONS.READ_SALES_ORDERS,
      PERMISSIONS.UPDATE_SALES_ORDERS,
      PERMISSIONS.PROCESS_SALES,
      PERMISSIONS.CREATE_STOCK_ADJUSTMENTS,
      PERMISSIONS.RECEIVE_GOODS,
      PERMISSIONS.READ_SUPPLIERS,
      PERMISSIONS.READ_CUSTOMERS,
      PERMISSIONS.UPDATE_CUSTOMERS,
      PERMISSIONS.OPERATE_POS,
      PERMISSIONS.MANAGE_POS_SESSIONS,
      PERMISSIONS.MANAGE_CASH_DRAWER,
      PERMISSIONS.PROCESS_PAYMENTS,
      PERMISSIONS.PROCESS_REFUNDS,
    ],
    hierarchy: 4,
  },

  EMPLOYEE: {
    name: 'Employee',
    code: 'employee',
    description: 'General employee with basic operational access',
    permissions: [
      PERMISSIONS.READ_ITEMS,
      PERMISSIONS.READ_CATEGORIES,
      PERMISSIONS.READ_PURCHASE_ORDERS,
      PERMISSIONS.CREATE_SALES_ORDERS,
      PERMISSIONS.READ_SALES_ORDERS,
      PERMISSIONS.PROCESS_SALES,
      PERMISSIONS.READ_CUSTOMERS,
      PERMISSIONS.OPERATE_POS,
      PERMISSIONS.PROCESS_PAYMENTS,
    ],
    hierarchy: 5,
  },

  CASHIER: {
    name: 'Cashier',
    code: 'cashier',
    description: 'POS operator with point-of-sale access only',
    permissions: [
      PERMISSIONS.READ_ITEMS,
      PERMISSIONS.CREATE_SALES_ORDERS,
      PERMISSIONS.PROCESS_SALES,
      PERMISSIONS.READ_CUSTOMERS,
      PERMISSIONS.OPERATE_POS,
      PERMISSIONS.PROCESS_PAYMENTS,
      PERMISSIONS.PROCESS_REFUNDS,
    ],
    hierarchy: 6,
  },

  VIEWER: {
    name: 'Viewer',
    code: 'viewer',
    description: 'Read-only access for reporting and monitoring',
    permissions: [
      PERMISSIONS.READ_ITEMS,
      PERMISSIONS.READ_CATEGORIES,
      PERMISSIONS.READ_PURCHASE_ORDERS,
      PERMISSIONS.READ_SALES_ORDERS,
      PERMISSIONS.READ_SUPPLIERS,
      PERMISSIONS.READ_CUSTOMERS,
      PERMISSIONS.VIEW_INVENTORY_REPORTS,
      PERMISSIONS.VIEW_SALES_REPORTS,
      PERMISSIONS.VIEW_POS_REPORTS,
    ],
    hierarchy: 7,
  },
} as const;

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: {
    name: 'User Management',
    permissions: [
      PERMISSIONS.CREATE_USERS,
      PERMISSIONS.READ_USERS,
      PERMISSIONS.UPDATE_USERS,
      PERMISSIONS.DELETE_USERS,
      PERMISSIONS.DEACTIVATE_USERS,
    ],
  },

  ROLE_MANAGEMENT: {
    name: 'Role Management',
    permissions: [
      PERMISSIONS.CREATE_ROLES,
      PERMISSIONS.READ_ROLES,
      PERMISSIONS.UPDATE_ROLES,
      PERMISSIONS.DELETE_ROLES,
      PERMISSIONS.ASSIGN_ROLES,
    ],
  },

  INVENTORY_MANAGEMENT: {
    name: 'Inventory Management',
    permissions: [
      PERMISSIONS.CREATE_ITEMS,
      PERMISSIONS.READ_ITEMS,
      PERMISSIONS.UPDATE_ITEMS,
      PERMISSIONS.DELETE_ITEMS,
      PERMISSIONS.MANAGE_INVENTORY_LEVELS,
      PERMISSIONS.VIEW_INVENTORY_REPORTS,
      PERMISSIONS.CREATE_CATEGORIES,
      PERMISSIONS.READ_CATEGORIES,
      PERMISSIONS.UPDATE_CATEGORIES,
      PERMISSIONS.DELETE_CATEGORIES,
    ],
  },

  PURCHASE_MANAGEMENT: {
    name: 'Purchase Management',
    permissions: [
      PERMISSIONS.CREATE_PURCHASE_ORDERS,
      PERMISSIONS.READ_PURCHASE_ORDERS,
      PERMISSIONS.UPDATE_PURCHASE_ORDERS,
      PERMISSIONS.DELETE_PURCHASE_ORDERS,
      PERMISSIONS.APPROVE_PURCHASE_ORDERS,
      PERMISSIONS.VIEW_PURCHASE_REPORTS,
      PERMISSIONS.RECEIVE_GOODS,
    ],
  },

  SALES_MANAGEMENT: {
    name: 'Sales Management',
    permissions: [
      PERMISSIONS.CREATE_SALES_ORDERS,
      PERMISSIONS.READ_SALES_ORDERS,
      PERMISSIONS.UPDATE_SALES_ORDERS,
      PERMISSIONS.DELETE_SALES_ORDERS,
      PERMISSIONS.PROCESS_SALES,
      PERMISSIONS.VIEW_SALES_REPORTS,
    ],
  },

  POS_OPERATIONS: {
    name: 'POS Operations',
    permissions: [
      PERMISSIONS.OPERATE_POS,
      PERMISSIONS.MANAGE_POS_SESSIONS,
      PERMISSIONS.MANAGE_CASH_DRAWER,
      PERMISSIONS.PROCESS_PAYMENTS,
      PERMISSIONS.PROCESS_REFUNDS,
      PERMISSIONS.VIEW_POS_REPORTS,
    ],
  },

  SUPPLIER_MANAGEMENT: {
    name: 'Supplier Management',
    permissions: [
      PERMISSIONS.CREATE_SUPPLIERS,
      PERMISSIONS.READ_SUPPLIERS,
      PERMISSIONS.UPDATE_SUPPLIERS,
      PERMISSIONS.DELETE_SUPPLIERS,
    ],
  },

  CUSTOMER_MANAGEMENT: {
    name: 'Customer Management',
    permissions: [
      PERMISSIONS.CREATE_CUSTOMERS,
      PERMISSIONS.READ_CUSTOMERS,
      PERMISSIONS.UPDATE_CUSTOMERS,
      PERMISSIONS.DELETE_CUSTOMERS,
    ],
  },

  REPORTS_ANALYTICS: {
    name: 'Reports & Analytics',
    permissions: [
      PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.EXPORT_DATA,
    ],
  },

  SYSTEM_ADMINISTRATION: {
    name: 'System Administration',
    permissions: [
      PERMISSIONS.MANAGE_ORGANIZATION,
      PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.MANAGE_INTEGRATIONS,
    ],
  },
} as const;

// Legacy types for backward compatibility
export type Role = "admin" | "buyer" | "approver" | "receiver" | "manager" | "supervisor" | "employee" | "cashier" | "viewer"

export type UserLike = {
  id: string
  email?: string | null
  name?: string | null
  roles?: Role[]
  permissions?: string[]
}

export type Action =
  | "po:create"
  | "po:submit"
  | "po:approve"
  | "po:receive"
  | "po:cancel"
  | "po:update"
  | "po:delete"
  | "po:clone"
  | "po:export"
  | "po:bulk-status"

const roleMatrix: Record<Role, Action[]> = {
  admin: [
    "po:create",
    "po:submit",
    "po:approve",
    "po:receive",
    "po:cancel",
    "po:update",
    "po:delete",
    "po:clone",
    "po:export",
    "po:bulk-status",
  ],
  buyer: ["po:create", "po:submit", "po:update", "po:clone", "po:export"],
  approver: ["po:approve", "po:cancel", "po:export", "po:bulk-status"],
  receiver: ["po:receive", "po:export"],
  manager: ["po:create", "po:submit", "po:approve", "po:update", "po:clone", "po:export"],
  supervisor: ["po:create", "po:submit", "po:update", "po:clone", "po:export"],
  employee: ["po:create", "po:submit", "po:export"],
  cashier: ["po:export"],
  viewer: ["po:export"],
}

// Legacy function for backward compatibility
export function can(user: UserLike | null | undefined, action: Action) {
  if (!user?.roles?.length) return false
  if (user.roles.includes("admin")) return true
  return user.roles.some((r) => roleMatrix[r]?.includes(action))
}

// Helper functions for permission checking
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes('*') || userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return userPermissions.includes('*') || requiredPermissions.some(permission => userPermissions.includes(permission));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return userPermissions.includes('*') || requiredPermissions.every(permission => userPermissions.includes(permission));
}

export function getPermissionsByGroup(groupName: keyof typeof PERMISSION_GROUPS): string[] {
  return Array.from(PERMISSION_GROUPS[groupName].permissions);
}

export function getAllPermissions(): string[] {
  return Object.values(PERMISSIONS);
}

// Permission hierarchy checker
export function canManageUser(managerPermissions: string[], targetUserPermissions: string[]): boolean {
  // Super admins can manage anyone
  if (hasPermission(managerPermissions, PERMISSIONS.MANAGE_ORGANIZATION)) {
    return true;
  }

  // Admins can manage non-admin users
  if (hasPermission(managerPermissions, PERMISSIONS.CREATE_USERS)) {
    return !hasPermission(targetUserPermissions, PERMISSIONS.MANAGE_ORGANIZATION);
  }

  return false;
}

// Role hierarchy helper
export function getRoleHierarchy(roleCode: string): number {
  const role = Object.values(ROLE_TEMPLATES).find(r => r.code === roleCode);
  return role?.hierarchy || 999;
}

export function canManageRole(managerRoles: string[], targetRoleCode: string): boolean {
  const managerHierarchy = Math.min(...managerRoles.map(getRoleHierarchy));
  const targetHierarchy = getRoleHierarchy(targetRoleCode);

  return managerHierarchy < targetHierarchy;
}
