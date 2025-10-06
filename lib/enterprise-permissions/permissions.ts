/**
 * Comprehensive Permission Definitions for StockFlow Enterprise
 */

import type { PermissionRule, RiskAssessment, ApprovalRequirement } from './types';

// Core system permissions
export const SYSTEM_PERMISSIONS = {
  // Super Admin - Platform Level
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  MANAGE_PLATFORM: 'MANAGE_PLATFORM',
  MANAGE_ORGANIZATIONS: 'MANAGE_ORGANIZATIONS',
  SYSTEM_CONFIGURATION: 'SYSTEM_CONFIGURATION',
  EMERGENCY_ACCESS: 'EMERGENCY_ACCESS',

  // Organization Management
  MANAGE_ORGANIZATION: 'MANAGE_ORGANIZATION',
  VIEW_ORGANIZATION_SETTINGS: 'VIEW_ORGANIZATION_SETTINGS',
  UPDATE_ORGANIZATION_SETTINGS: 'UPDATE_ORGANIZATION_SETTINGS',
  MANAGE_ORGANIZATION_BILLING: 'MANAGE_ORGANIZATION_BILLING',
  MANAGE_ORGANIZATION_SECURITY: 'MANAGE_ORGANIZATION_SECURITY',

  // User Management
  CREATE_USERS: 'CREATE_USERS',
  READ_USERS: 'READ_USERS',
  UPDATE_USERS: 'UPDATE_USERS',
  DELETE_USERS: 'DELETE_USERS',
  DEACTIVATE_USERS: 'DEACTIVATE_USERS',
  MANAGE_USER_SESSIONS: 'MANAGE_USER_SESSIONS',
  RESET_USER_PASSWORDS: 'RESET_USER_PASSWORDS',
  MANAGE_USER_MFA: 'MANAGE_USER_MFA',

  // Role and Permission Management
  CREATE_ROLES: 'CREATE_ROLES',
  READ_ROLES: 'READ_ROLES',
  UPDATE_ROLES: 'UPDATE_ROLES',
  DELETE_ROLES: 'DELETE_ROLES',
  ASSIGN_ROLES: 'ASSIGN_ROLES',
  REVOKE_ROLES: 'REVOKE_ROLES',
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  GRANT_PERMISSIONS: 'GRANT_PERMISSIONS',
  REVOKE_PERMISSIONS: 'REVOKE_PERMISSIONS',
  VIEW_PERMISSION_MATRIX: 'VIEW_PERMISSION_MATRIX',

  // Location Management
  CREATE_LOCATIONS: 'CREATE_LOCATIONS',
  READ_LOCATIONS: 'READ_LOCATIONS',
  UPDATE_LOCATIONS: 'UPDATE_LOCATIONS',
  DELETE_LOCATIONS: 'DELETE_LOCATIONS',
  MANAGE_LOCATION_SETTINGS: 'MANAGE_LOCATION_SETTINGS',
  TRANSFER_LOCATION_OWNERSHIP: 'TRANSFER_LOCATION_OWNERSHIP',

  // Inventory Management
  CREATE_ITEMS: 'CREATE_ITEMS',
  READ_ITEMS: 'READ_ITEMS',
  UPDATE_ITEMS: 'UPDATE_ITEMS',
  DELETE_ITEMS: 'DELETE_ITEMS',
  MANAGE_INVENTORY_LEVELS: 'MANAGE_INVENTORY_LEVELS',
  ADJUST_INVENTORY: 'ADJUST_INVENTORY',
  APPROVE_INVENTORY_ADJUSTMENTS: 'APPROVE_INVENTORY_ADJUSTMENTS',
  VIEW_INVENTORY_REPORTS: 'VIEW_INVENTORY_REPORTS',
  EXPORT_INVENTORY_DATA: 'EXPORT_INVENTORY_DATA',
  MANAGE_ITEM_CATEGORIES: 'MANAGE_ITEM_CATEGORIES',
  MANAGE_ITEM_BRANDS: 'MANAGE_ITEM_BRANDS',
  MANAGE_ITEM_UNITS: 'MANAGE_ITEM_UNITS',

  // Purchase Management
  CREATE_PURCHASE_ORDERS: 'CREATE_PURCHASE_ORDERS',
  READ_PURCHASE_ORDERS: 'READ_PURCHASE_ORDERS',
  UPDATE_PURCHASE_ORDERS: 'UPDATE_PURCHASE_ORDERS',
  DELETE_PURCHASE_ORDERS: 'DELETE_PURCHASE_ORDERS',
  SUBMIT_PURCHASE_ORDERS: 'SUBMIT_PURCHASE_ORDERS',
  APPROVE_PURCHASE_ORDERS: 'APPROVE_PURCHASE_ORDERS',
  REJECT_PURCHASE_ORDERS: 'REJECT_PURCHASE_ORDERS',
  CANCEL_PURCHASE_ORDERS: 'CANCEL_PURCHASE_ORDERS',
  RECEIVE_GOODS: 'RECEIVE_GOODS',
  VIEW_PURCHASE_REPORTS: 'VIEW_PURCHASE_REPORTS',
  MANAGE_SUPPLIERS: 'MANAGE_SUPPLIERS',

  // Sales Management
  CREATE_SALES_ORDERS: 'CREATE_SALES_ORDERS',
  READ_SALES_ORDERS: 'READ_SALES_ORDERS',
  UPDATE_SALES_ORDERS: 'UPDATE_SALES_ORDERS',
  DELETE_SALES_ORDERS: 'DELETE_SALES_ORDERS',
  PROCESS_SALES: 'PROCESS_SALES',
  VOID_SALES: 'VOID_SALES',
  REFUND_SALES: 'REFUND_SALES',
  APPLY_DISCOUNTS: 'APPLY_DISCOUNTS',
  OVERRIDE_PRICES: 'OVERRIDE_PRICES',
  VIEW_SALES_REPORTS: 'VIEW_SALES_REPORTS',
  MANAGE_CUSTOMERS: 'MANAGE_CUSTOMERS',

  // Point of Sale Operations
  OPERATE_POS: 'OPERATE_POS',
  OPEN_POS_SESSION: 'OPEN_POS_SESSION',
  CLOSE_POS_SESSION: 'CLOSE_POS_SESSION',
  MANAGE_CASH_DRAWER: 'MANAGE_CASH_DRAWER',
  COUNT_CASH_DRAWER: 'COUNT_CASH_DRAWER',
  MANAGE_POS_TERMINALS: 'MANAGE_POS_TERMINALS',
  PROCESS_PAYMENTS: 'PROCESS_PAYMENTS',
  PROCESS_REFUNDS: 'PROCESS_REFUNDS',
  VIEW_POS_REPORTS: 'VIEW_POS_REPORTS',
  RECONCILE_TRANSACTIONS: 'RECONCILE_TRANSACTIONS',

  // Stock Management
  CREATE_STOCK_ADJUSTMENTS: 'CREATE_STOCK_ADJUSTMENTS',
  APPROVE_STOCK_ADJUSTMENTS: 'APPROVE_STOCK_ADJUSTMENTS',
  CREATE_STOCK_TRANSFERS: 'CREATE_STOCK_TRANSFERS',
  APPROVE_STOCK_TRANSFERS: 'APPROVE_STOCK_TRANSFERS',
  RECEIVE_STOCK_TRANSFERS: 'RECEIVE_STOCK_TRANSFERS',
  MANAGE_STOCK_MOVEMENTS: 'MANAGE_STOCK_MOVEMENTS',
  VIEW_STOCK_HISTORY: 'VIEW_STOCK_HISTORY',

  // Financial Operations
  VIEW_FINANCIAL_REPORTS: 'VIEW_FINANCIAL_REPORTS',
  EXPORT_FINANCIAL_DATA: 'EXPORT_FINANCIAL_DATA',
  MANAGE_TAX_RATES: 'MANAGE_TAX_RATES',
  PROCESS_PAYMENTS_ABOVE_LIMIT: 'PROCESS_PAYMENTS_ABOVE_LIMIT',
  ACCESS_PROFIT_LOSS: 'ACCESS_PROFIT_LOSS',
  ACCESS_BALANCE_SHEET: 'ACCESS_BALANCE_SHEET',
  MANAGE_PAYMENT_METHODS: 'MANAGE_PAYMENT_METHODS',

  // Analytics and Reporting
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  CREATE_CUSTOM_REPORTS: 'CREATE_CUSTOM_REPORTS',
  SCHEDULE_REPORTS: 'SCHEDULE_REPORTS',
  EXPORT_DATA: 'EXPORT_DATA',
  ACCESS_RAW_DATA: 'ACCESS_RAW_DATA',
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  CONFIGURE_DASHBOARDS: 'CONFIGURE_DASHBOARDS',

  // System Administration
  MANAGE_SYSTEM_SETTINGS: 'MANAGE_SYSTEM_SETTINGS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  EXPORT_AUDIT_LOGS: 'EXPORT_AUDIT_LOGS',
  MANAGE_INTEGRATIONS: 'MANAGE_INTEGRATIONS',
  CONFIGURE_API_ACCESS: 'CONFIGURE_API_ACCESS',
  MANAGE_WEBHOOKS: 'MANAGE_WEBHOOKS',
  SYSTEM_BACKUP: 'SYSTEM_BACKUP',
  SYSTEM_RESTORE: 'SYSTEM_RESTORE',

  // Security and Compliance
  MANAGE_SECURITY_POLICIES: 'MANAGE_SECURITY_POLICIES',
  VIEW_SECURITY_LOGS: 'VIEW_SECURITY_LOGS',
  MANAGE_SESSION_SECURITY: 'MANAGE_SESSION_SECURITY',
  CONFIGURE_MFA: 'CONFIGURE_MFA',
  MANAGE_API_KEYS: 'MANAGE_API_KEYS',
  APPROVE_PERMISSION_REQUESTS: 'APPROVE_PERMISSION_REQUESTS',
  REVOKE_USER_ACCESS: 'REVOKE_USER_ACCESS',
  EMERGENCY_SYSTEM_ACCESS: 'EMERGENCY_SYSTEM_ACCESS',

  // Profile and Personal
  VIEW_OWN_PROFILE: 'VIEW_OWN_PROFILE',
  UPDATE_OWN_PROFILE: 'UPDATE_OWN_PROFILE',
  CHANGE_OWN_PASSWORD: 'CHANGE_OWN_PASSWORD',
  MANAGE_OWN_SESSIONS: 'MANAGE_OWN_SESSIONS',
  VIEW_OWN_ACTIVITY: 'VIEW_OWN_ACTIVITY',
} as const;

export type SystemPermission = keyof typeof SYSTEM_PERMISSIONS;

// Permission categories for organization
export const PERMISSION_CATEGORIES = {
  SYSTEM: 'System Administration',
  ORGANIZATION: 'Organization Management',
  USER_MANAGEMENT: 'User & Role Management',
  INVENTORY: 'Inventory Management',
  PURCHASING: 'Purchase Management',
  SALES: 'Sales Management',
  POS: 'Point of Sale',
  FINANCIAL: 'Financial Operations',
  ANALYTICS: 'Analytics & Reporting',
  SECURITY: 'Security & Compliance',
  PERSONAL: 'Personal & Profile',
} as const;

// High-risk permissions requiring special handling
export const HIGH_RISK_PERMISSIONS = [
  SYSTEM_PERMISSIONS.DELETE_USERS,
  SYSTEM_PERMISSIONS.MANAGE_ORGANIZATION_SECURITY,
  SYSTEM_PERMISSIONS.EMERGENCY_ACCESS,
  SYSTEM_PERMISSIONS.SYSTEM_BACKUP,
  SYSTEM_PERMISSIONS.SYSTEM_RESTORE,
  SYSTEM_PERMISSIONS.REVOKE_USER_ACCESS,
  SYSTEM_PERMISSIONS.EXPORT_AUDIT_LOGS,
  SYSTEM_PERMISSIONS.ACCESS_RAW_DATA,
  SYSTEM_PERMISSIONS.MANAGE_API_KEYS,
  SYSTEM_PERMISSIONS.CONFIGURE_API_ACCESS,
];

// Permission rules for complex authorization scenarios
export const PERMISSION_RULES: Record<string, PermissionRule> = {
  // User Management Rules
  CREATE_USER: {
    name: 'Create User',
    description: 'Create new user accounts with appropriate role restrictions',
    permissions: [SYSTEM_PERMISSIONS.CREATE_USERS],
    requireAll: true,
    hierarchyCheck: true,
    riskAssessment: {
      level: 'MEDIUM',
      factors: [
        { type: 'FREQUENCY', weight: 0.3, threshold: 10, description: 'User creation frequency' },
        { type: 'BEHAVIOR', weight: 0.2, description: 'Unusual user creation patterns' }
      ],
      auditLevel: 'DETAILED'
    },
  },

  DELETE_USER: {
    name: 'Delete User',
    description: 'Permanently delete user accounts',
    permissions: [SYSTEM_PERMISSIONS.DELETE_USERS],
    requireAll: true,
    hierarchyCheck: true,
    riskAssessment: {
      level: 'HIGH',
      factors: [
        { type: 'RESOURCE_SENSITIVITY', weight: 0.8, description: 'User account deletion is irreversible' }
      ],
      requiresApproval: true,
      auditLevel: 'COMPREHENSIVE'
    },
    approvalRequired: {
      required: true,
      approverRoles: ['super_admin', 'administrator'],
      requiredApprovers: 1,
      timeLimit: 24,
    },
  },

  BULK_USER_OPERATIONS: {
    name: 'Bulk User Operations',
    description: 'Perform operations on multiple users simultaneously',
    permissions: [SYSTEM_PERMISSIONS.CREATE_USERS, SYSTEM_PERMISSIONS.UPDATE_USERS, SYSTEM_PERMISSIONS.ASSIGN_ROLES],
    requireAll: true,
    hierarchyCheck: true,
    conditions: [
      {
        type: 'CUSTOM',
        operator: 'GREATER_THAN',
        field: 'userCount',
        value: 5,
        description: 'Operations affecting more than 5 users require approval'
      }
    ],
    riskAssessment: {
      level: 'HIGH',
      factors: [
        { type: 'AMOUNT', weight: 0.6, threshold: 5, description: 'Number of users affected' }
      ],
      requiresApproval: true,
      auditLevel: 'COMPREHENSIVE'
    },
  },

  // Financial Operations Rules
  LARGE_PAYMENT_PROCESSING: {
    name: 'Large Payment Processing',
    description: 'Process payments above normal limits',
    permissions: [SYSTEM_PERMISSIONS.PROCESS_PAYMENTS_ABOVE_LIMIT],
    requireAll: true,
    conditions: [
      {
        type: 'AMOUNT_LIMIT',
        operator: 'GREATER_THAN',
        field: 'amount',
        value: 10000,
        description: 'Payments over $10,000 require special authorization'
      }
    ],
    riskAssessment: {
      level: 'HIGH',
      factors: [
        { type: 'AMOUNT', weight: 0.8, threshold: 10000, description: 'Payment amount threshold' },
        { type: 'FREQUENCY', weight: 0.2, threshold: 3, description: 'Large payment frequency' }
      ],
      requiresSecondaryAuth: true,
      auditLevel: 'COMPREHENSIVE'
    },
    approvalRequired: {
      required: true,
      approverRoles: ['administrator', 'financial_manager'],
      requiredApprovers: 1,
      timeLimit: 4,
      escalationChain: [
        { level: 1, roles: ['financial_manager'], escalateAfter: 2 },
        { level: 2, roles: ['administrator'], escalateAfter: 2 }
      ]
    },
  },

  INVENTORY_ADJUSTMENT_APPROVAL: {
    name: 'Inventory Adjustment Approval',
    description: 'Approve significant inventory adjustments',
    permissions: [SYSTEM_PERMISSIONS.APPROVE_INVENTORY_ADJUSTMENTS],
    requireAll: true,
    conditions: [
      {
        type: 'AMOUNT_LIMIT',
        operator: 'GREATER_THAN',
        field: 'totalValue',
        value: 5000,
        description: 'Adjustments over $5,000 require manager approval'
      }
    ],
    riskAssessment: {
      level: 'MEDIUM',
      factors: [
        { type: 'AMOUNT', weight: 0.7, threshold: 5000, description: 'Adjustment value' }
      ],
      auditLevel: 'DETAILED'
    },
  },

  // Emergency Access Rules
  EMERGENCY_SYSTEM_ACCESS: {
    name: 'Emergency System Access',
    description: 'Break-glass access for emergency situations',
    permissions: [SYSTEM_PERMISSIONS.EMERGENCY_SYSTEM_ACCESS],
    requireAll: true,
    riskAssessment: {
      level: 'CRITICAL',
      factors: [
        { type: 'BEHAVIOR', weight: 1.0, description: 'Emergency access usage' }
      ],
      requiresSecondaryAuth: true,
      auditLevel: 'COMPREHENSIVE'
    },
    approvalRequired: {
      required: false, // Emergency access doesn't require pre-approval
      approverRoles: ['super_admin'],
      requiredApprovers: 1,
      timeLimit: 1, // Must be reviewed within 1 hour
    },
    timeRestrictions: [
      {
        type: 'SPECIFIC_HOURS',
        startTime: '00:00',
        endTime: '23:59'
      }
    ],
  },

  // Time-restricted operations
  AFTER_HOURS_OPERATIONS: {
    name: 'After Hours Operations',
    description: 'Operations performed outside business hours',
    permissions: [SYSTEM_PERMISSIONS.PROCESS_SALES, SYSTEM_PERMISSIONS.MANAGE_CASH_DRAWER],
    requireAll: false,
    timeRestrictions: [
      {
        type: 'BUSINESS_HOURS',
        startTime: '18:00',
        endTime: '08:00'
      }
    ],
    riskAssessment: {
      level: 'MEDIUM',
      factors: [
        { type: 'TIME', weight: 0.5, description: 'After hours activity' }
      ],
      auditLevel: 'DETAILED'
    },
  },

  // Data export rules
  BULK_DATA_EXPORT: {
    name: 'Bulk Data Export',
    description: 'Export large amounts of system data',
    permissions: [SYSTEM_PERMISSIONS.EXPORT_DATA, SYSTEM_PERMISSIONS.ACCESS_RAW_DATA],
    requireAll: false,
    riskAssessment: {
      level: 'HIGH',
      factors: [
        { type: 'RESOURCE_SENSITIVITY', weight: 0.8, description: 'Data export operations' },
        { type: 'AMOUNT', weight: 0.2, threshold: 1000, description: 'Number of records' }
      ],
      auditLevel: 'COMPREHENSIVE'
    },
    approvalRequired: {
      required: true,
      approverRoles: ['administrator', 'data_protection_officer'],
      requiredApprovers: 1,
      timeLimit: 24,
    },
  },

  // API access rules
  API_KEY_MANAGEMENT: {
    name: 'API Key Management',
    description: 'Create, modify, or revoke API keys',
    permissions: [SYSTEM_PERMISSIONS.MANAGE_API_KEYS],
    requireAll: true,
    hierarchyCheck: true,
    riskAssessment: {
      level: 'HIGH',
      factors: [
        { type: 'RESOURCE_SENSITIVITY', weight: 0.9, description: 'API key management' }
      ],
      requiresSecondaryAuth: true,
      auditLevel: 'COMPREHENSIVE'
    },
    approvalRequired: {
      required: true,
      approverRoles: ['administrator', 'security_officer'],
      requiredApprovers: 1,
      timeLimit: 12,
    },
  },
};

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  SUPER_ADMIN: {
    name: 'Super Administrator',
    description: 'Full platform access - use with extreme caution',
    permissions: Object.values(SYSTEM_PERMISSIONS),
    riskLevel: 'CRITICAL' as const,
  },

  ORGANIZATION_ADMIN: {
    name: 'Organization Administrator',
    description: 'Full organization management capabilities',
    permissions: [
      SYSTEM_PERMISSIONS.MANAGE_ORGANIZATION,
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION_SETTINGS,
      SYSTEM_PERMISSIONS.UPDATE_ORGANIZATION_SETTINGS,
      SYSTEM_PERMISSIONS.CREATE_USERS,
      SYSTEM_PERMISSIONS.READ_USERS,
      SYSTEM_PERMISSIONS.UPDATE_USERS,
      SYSTEM_PERMISSIONS.DEACTIVATE_USERS,
      SYSTEM_PERMISSIONS.CREATE_ROLES,
      SYSTEM_PERMISSIONS.READ_ROLES,
      SYSTEM_PERMISSIONS.UPDATE_ROLES,
      SYSTEM_PERMISSIONS.ASSIGN_ROLES,
      SYSTEM_PERMISSIONS.GRANT_PERMISSIONS,
      SYSTEM_PERMISSIONS.CREATE_LOCATIONS,
      SYSTEM_PERMISSIONS.READ_LOCATIONS,
      SYSTEM_PERMISSIONS.UPDATE_LOCATIONS,
      SYSTEM_PERMISSIONS.MANAGE_LOCATION_SETTINGS,
      SYSTEM_PERMISSIONS.VIEW_AUDIT_LOGS,
      SYSTEM_PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      SYSTEM_PERMISSIONS.VIEW_ANALYTICS,
      SYSTEM_PERMISSIONS.EXPORT_DATA,
    ],
    riskLevel: 'HIGH' as const,
  },

  INVENTORY_MANAGER: {
    name: 'Inventory Manager',
    description: 'Full inventory management capabilities',
    permissions: [
      SYSTEM_PERMISSIONS.CREATE_ITEMS,
      SYSTEM_PERMISSIONS.READ_ITEMS,
      SYSTEM_PERMISSIONS.UPDATE_ITEMS,
      SYSTEM_PERMISSIONS.MANAGE_INVENTORY_LEVELS,
      SYSTEM_PERMISSIONS.ADJUST_INVENTORY,
      SYSTEM_PERMISSIONS.APPROVE_INVENTORY_ADJUSTMENTS,
      SYSTEM_PERMISSIONS.VIEW_INVENTORY_REPORTS,
      SYSTEM_PERMISSIONS.EXPORT_INVENTORY_DATA,
      SYSTEM_PERMISSIONS.MANAGE_ITEM_CATEGORIES,
      SYSTEM_PERMISSIONS.MANAGE_ITEM_BRANDS,
      SYSTEM_PERMISSIONS.CREATE_STOCK_ADJUSTMENTS,
      SYSTEM_PERMISSIONS.CREATE_STOCK_TRANSFERS,
      SYSTEM_PERMISSIONS.APPROVE_STOCK_TRANSFERS,
      SYSTEM_PERMISSIONS.VIEW_STOCK_HISTORY,
    ],
    riskLevel: 'MEDIUM' as const,
  },

  SALES_MANAGER: {
    name: 'Sales Manager',
    description: 'Sales operations and customer management',
    permissions: [
      SYSTEM_PERMISSIONS.CREATE_SALES_ORDERS,
      SYSTEM_PERMISSIONS.READ_SALES_ORDERS,
      SYSTEM_PERMISSIONS.UPDATE_SALES_ORDERS,
      SYSTEM_PERMISSIONS.PROCESS_SALES,
      SYSTEM_PERMISSIONS.REFUND_SALES,
      SYSTEM_PERMISSIONS.APPLY_DISCOUNTS,
      SYSTEM_PERMISSIONS.OVERRIDE_PRICES,
      SYSTEM_PERMISSIONS.VIEW_SALES_REPORTS,
      SYSTEM_PERMISSIONS.MANAGE_CUSTOMERS,
      SYSTEM_PERMISSIONS.OPERATE_POS,
      SYSTEM_PERMISSIONS.MANAGE_POS_TERMINALS,
      SYSTEM_PERMISSIONS.PROCESS_PAYMENTS,
      SYSTEM_PERMISSIONS.PROCESS_REFUNDS,
      SYSTEM_PERMISSIONS.VIEW_POS_REPORTS,
    ],
    riskLevel: 'MEDIUM' as const,
  },

  PURCHASE_MANAGER: {
    name: 'Purchase Manager',
    description: 'Purchase order and supplier management',
    permissions: [
      SYSTEM_PERMISSIONS.CREATE_PURCHASE_ORDERS,
      SYSTEM_PERMISSIONS.READ_PURCHASE_ORDERS,
      SYSTEM_PERMISSIONS.UPDATE_PURCHASE_ORDERS,
      SYSTEM_PERMISSIONS.SUBMIT_PURCHASE_ORDERS,
      SYSTEM_PERMISSIONS.APPROVE_PURCHASE_ORDERS,
      SYSTEM_PERMISSIONS.RECEIVE_GOODS,
      SYSTEM_PERMISSIONS.VIEW_PURCHASE_REPORTS,
      SYSTEM_PERMISSIONS.MANAGE_SUPPLIERS,
    ],
    riskLevel: 'MEDIUM' as const,
  },

  CASHIER: {
    name: 'Cashier',
    description: 'Point of sale operations only',
    permissions: [
      SYSTEM_PERMISSIONS.OPERATE_POS,
      SYSTEM_PERMISSIONS.OPEN_POS_SESSION,
      SYSTEM_PERMISSIONS.CLOSE_POS_SESSION,
      SYSTEM_PERMISSIONS.PROCESS_PAYMENTS,
      SYSTEM_PERMISSIONS.PROCESS_REFUNDS,
      SYSTEM_PERMISSIONS.READ_ITEMS,
      SYSTEM_PERMISSIONS.VIEW_OWN_PROFILE,
      SYSTEM_PERMISSIONS.UPDATE_OWN_PROFILE,
      SYSTEM_PERMISSIONS.CHANGE_OWN_PASSWORD,
    ],
    riskLevel: 'LOW' as const,
  },

  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access to reports and data',
    permissions: [
      SYSTEM_PERMISSIONS.READ_ITEMS,
      SYSTEM_PERMISSIONS.READ_SALES_ORDERS,
      SYSTEM_PERMISSIONS.READ_PURCHASE_ORDERS,
      SYSTEM_PERMISSIONS.VIEW_INVENTORY_REPORTS,
      SYSTEM_PERMISSIONS.VIEW_SALES_REPORTS,
      SYSTEM_PERMISSIONS.VIEW_PURCHASE_REPORTS,
      SYSTEM_PERMISSIONS.VIEW_ANALYTICS,
      SYSTEM_PERMISSIONS.VIEW_DASHBOARD,
      SYSTEM_PERMISSIONS.VIEW_OWN_PROFILE,
      SYSTEM_PERMISSIONS.UPDATE_OWN_PROFILE,
      SYSTEM_PERMISSIONS.CHANGE_OWN_PASSWORD,
    ],
    riskLevel: 'LOW' as const,
  },
};

// Helper functions
export function getPermissionCategory(permission: string): string {
  if (permission.includes('USER') || permission.includes('ROLE')) {
    return PERMISSION_CATEGORIES.USER_MANAGEMENT;
  }
  if (permission.includes('ORGANIZATION')) {
    return PERMISSION_CATEGORIES.ORGANIZATION;
  }
  if (permission.includes('INVENTORY') || permission.includes('ITEM') || permission.includes('STOCK')) {
    return PERMISSION_CATEGORIES.INVENTORY;
  }
  if (permission.includes('PURCHASE')) {
    return PERMISSION_CATEGORIES.PURCHASING;
  }
  if (permission.includes('SALES') || permission.includes('POS')) {
    return PERMISSION_CATEGORIES.SALES;
  }
  if (permission.includes('FINANCIAL') || permission.includes('PAYMENT')) {
    return PERMISSION_CATEGORIES.FINANCIAL;
  }
  if (permission.includes('ANALYTICS') || permission.includes('REPORT')) {
    return PERMISSION_CATEGORIES.ANALYTICS;
  }
  if (permission.includes('SECURITY') || permission.includes('AUDIT') || permission.includes('API')) {
    return PERMISSION_CATEGORIES.SECURITY;
  }
  if (permission.includes('OWN') || permission.includes('PROFILE')) {
    return PERMISSION_CATEGORIES.PERSONAL;
  }
  return PERMISSION_CATEGORIES.SYSTEM;
}

export function isHighRiskPermission(permission: string): boolean {
  return HIGH_RISK_PERMISSIONS.includes(permission);
}

export function getPermissionsByCategory(category: string): string[] {
  return Object.values(SYSTEM_PERMISSIONS).filter(
    permission => getPermissionCategory(permission) === category
  );
}

export function getAllPermissions(): string[] {
  return Object.values(SYSTEM_PERMISSIONS);
}

export function getPermissionGroups(): typeof PERMISSION_GROUPS {
  return PERMISSION_GROUPS;
}