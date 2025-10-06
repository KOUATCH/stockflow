/**
 * Enhanced permission validation system
 * Implements secure permission checks with hierarchical roles and context-aware validation
 */

import { PERMISSIONS, ROLE_TEMPLATES } from "./permissions";

export interface PermissionContext {
  organizationId?: string;
  resourceId?: string;
  resourceType?: string;
  action?: string;
  userRole?: string;
  sensitiveOperation?: boolean;
}

export interface PermissionRule {
  permissions: string[];
  requireAll: boolean; // If true, user must have ALL permissions; if false, ANY permission
  context?: PermissionContext;
  hierarchyCheck?: boolean; // Check role hierarchy
  additionalChecks?: (userPermissions: string[], context: PermissionContext) => boolean;
}

/**
 * Enhanced permission validation with context and hierarchy
 */
export class PermissionValidator {
  /**
   * Check if user has required permissions with enhanced validation
   */
  static validatePermissions(
    userPermissions: string[],
    rule: PermissionRule,
    context: PermissionContext = {}
  ): { granted: boolean; reason?: string; suggestions?: string[] } {
    // Basic permission check
    const hasPermissions = rule.requireAll
      ? this.hasAllPermissions(userPermissions, rule.permissions)
      : this.hasAnyPermission(userPermissions, rule.permissions);

    if (!hasPermissions) {
      return {
        granted: false,
        reason: `Missing required permission${rule.permissions.length > 1 ? 's' : ''}: ${rule.permissions.join(', ')}`,
        suggestions: this.getPermissionSuggestions(rule.permissions)
      };
    }

    // Context validation
    if (rule.context) {
      const contextValidation = this.validateContext(userPermissions, rule.context, context);
      if (!contextValidation.valid) {
        return {
          granted: false,
          reason: contextValidation.reason,
          suggestions: contextValidation.suggestions
        };
      }
    }

    // Hierarchy check
    if (rule.hierarchyCheck && context.userRole) {
      const hierarchyValidation = this.validateRoleHierarchy(context.userRole, rule.permissions);
      if (!hierarchyValidation.valid) {
        return {
          granted: false,
          reason: hierarchyValidation.reason
        };
      }
    }

    // Additional custom checks
    if (rule.additionalChecks && !rule.additionalChecks(userPermissions, context)) {
      return {
        granted: false,
        reason: 'Additional security checks failed'
      };
    }

    return { granted: true };
  }

  /**
   * Check if user has ANY of the required permissions
   */
  private static hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has ALL required permissions
   */
  private static hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Validate permission context (organization, resource ownership, etc.)
   */
  private static validateContext(
    userPermissions: string[],
    ruleContext: PermissionContext,
    actualContext: PermissionContext
  ): { valid: boolean; reason?: string; suggestions?: string[] } {
    // Organization scope validation
    if (ruleContext.organizationId && actualContext.organizationId) {
      if (ruleContext.organizationId !== actualContext.organizationId) {
        return {
          valid: false,
          reason: 'Access denied: Resource belongs to different organization'
        };
      }
    }

    // Resource type validation
    if (ruleContext.resourceType && actualContext.resourceType) {
      if (ruleContext.resourceType !== actualContext.resourceType) {
        return {
          valid: false,
          reason: `Access denied: Invalid resource type. Expected ${ruleContext.resourceType}, got ${actualContext.resourceType}`
        };
      }
    }

    // Sensitive operation validation
    if (ruleContext.sensitiveOperation) {
      // Require additional checks for sensitive operations
      const hasManagementPermission = userPermissions.some(p =>
        p.includes('MANAGE_') || p.includes('DELETE_') || p === PERMISSIONS.MANAGE_ORGANIZATION
      );

      if (!hasManagementPermission) {
        return {
          valid: false,
          reason: 'Sensitive operation requires management-level permissions',
          suggestions: ['Contact your administrator for elevated permissions']
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate role hierarchy for permission escalation prevention
   */
  private static validateRoleHierarchy(
    userRole: string,
    requiredPermissions: string[]
  ): { valid: boolean; reason?: string } {
    const userRoleTemplate = Object.values(ROLE_TEMPLATES).find(r => r.code === userRole);

    if (!userRoleTemplate) {
      return {
        valid: false,
        reason: 'Invalid user role'
      };
    }

    // Check if trying to grant permissions higher than user's role
    const isEscalation = requiredPermissions.some(permission => {
      // Super admin can do anything
      if (userRole === 'super_admin') return false;

      // Admin cannot manage super admin permissions
      if (userRole === 'administrator' && permission === PERMISSIONS.MANAGE_ORGANIZATION) {
        return true;
      }

      // Manager cannot create/manage admin roles
      if (userRole === 'manager' && [
        PERMISSIONS.CREATE_ROLES,
        PERMISSIONS.UPDATE_ROLES,
        PERMISSIONS.DELETE_ROLES,
        PERMISSIONS.ASSIGN_ROLES
      ].includes(permission as any)) {
        return true;
      }

      return false;
    });

    if (isEscalation) {
      return {
        valid: false,
        reason: 'Permission escalation detected: Cannot grant permissions above your role level'
      };
    }

    return { valid: true };
  }

  /**
   * Get permission suggestions for missing permissions
   */
  private static getPermissionSuggestions(missingPermissions: string[]): string[] {
    const suggestions: string[] = [];

    for (const permission of missingPermissions) {
      const suggestion = this.getPermissionSuggestion(permission);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  /**
   * Get suggestion for a specific missing permission
   */
  private static getPermissionSuggestion(permission: string): string | null {
    const permissionSuggestions: Record<string, string> = {
      [PERMISSIONS.CREATE_USERS]: 'Contact your administrator to request user management permissions',
      [PERMISSIONS.UPDATE_USERS]: 'You need user management permissions to modify user accounts',
      [PERMISSIONS.DELETE_USERS]: 'User deletion requires administrative privileges',
      [PERMISSIONS.CREATE_ROLES]: 'Role creation is restricted to administrators',
      [PERMISSIONS.MANAGE_ORGANIZATION]: 'Organization management requires super administrator access',
      [PERMISSIONS.VIEW_FINANCIAL_REPORTS]: 'Financial reporting access must be granted by management',
      [PERMISSIONS.APPROVE_PURCHASE_ORDERS]: 'Purchase order approval requires manager or administrator role'
    };

    return permissionSuggestions[permission] || null;
  }
}

/**
 * Predefined permission rules for common operations
 */
export const PERMISSION_RULES = {
  // User management rules
  CREATE_USER: {
    permissions: [PERMISSIONS.CREATE_USERS],
    requireAll: true,
    hierarchyCheck: true,
    context: { sensitiveOperation: true }
  } as PermissionRule,

  UPDATE_USER: {
    permissions: [PERMISSIONS.UPDATE_USERS],
    requireAll: true,
    hierarchyCheck: true,
    additionalChecks: (userPermissions: string[], context: PermissionContext) => {
      // Users can update their own profile
      if (context.resourceId && context.userRole) {
        return true; // Allow self-update
      }
      return userPermissions.includes(PERMISSIONS.UPDATE_USERS);
    }
  } as PermissionRule,

  DELETE_USER: {
    permissions: [PERMISSIONS.DELETE_USERS],
    requireAll: true,
    hierarchyCheck: true,
    context: { sensitiveOperation: true },
    additionalChecks: (userPermissions: string[], context: PermissionContext) => {
      // Prevent users from deleting themselves
      return context.resourceId !== context.userRole;
    }
  } as PermissionRule,

  // Role management rules
  MANAGE_ROLES: {
    permissions: [PERMISSIONS.CREATE_ROLES, PERMISSIONS.UPDATE_ROLES, PERMISSIONS.DELETE_ROLES],
    requireAll: false, // ANY of these permissions
    hierarchyCheck: true,
    context: { sensitiveOperation: true }
  } as PermissionRule,

  // Financial operations rules
  APPROVE_PURCHASE_ORDER: {
    permissions: [PERMISSIONS.APPROVE_PURCHASE_ORDERS],
    requireAll: true,
    additionalChecks: (userPermissions: string[], context: PermissionContext) => {
      // Require additional verification for large amounts
      // This would be implemented based on business rules
      return true;
    }
  } as PermissionRule,

  // Sensitive operations requiring multiple permissions
  BULK_USER_OPERATIONS: {
    permissions: [PERMISSIONS.CREATE_USERS, PERMISSIONS.UPDATE_USERS, PERMISSIONS.ASSIGN_ROLES],
    requireAll: true, // Must have ALL permissions for bulk operations
    hierarchyCheck: true,
    context: { sensitiveOperation: true }
  } as PermissionRule,

  // Read-only operations
  VIEW_USERS: {
    permissions: [PERMISSIONS.READ_USERS],
    requireAll: true,
    hierarchyCheck: false
  } as PermissionRule,

  VIEW_REPORTS: {
    permissions: [
      PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      PERMISSIONS.VIEW_SALES_REPORTS,
      PERMISSIONS.VIEW_INVENTORY_REPORTS,
      PERMISSIONS.VIEW_POS_REPORTS
    ],
    requireAll: false, // ANY report permission grants access
    hierarchyCheck: false
  } as PermissionRule
} as const;

/**
 * Middleware helper for permission validation
 */
export function validateRoutePermissions(
  userPermissions: string[],
  routeRule: PermissionRule,
  context: PermissionContext = {}
): { allowed: boolean; error?: string; suggestions?: string[] } {
  const validation = PermissionValidator.validatePermissions(userPermissions, routeRule, context);

  return {
    allowed: validation.granted,
    error: validation.reason,
    suggestions: validation.suggestions
  };
}

/**
 * Permission audit helper
 */
export function auditPermissionCheck(
  userId: string,
  operation: string,
  permissions: string[],
  result: boolean,
  context: PermissionContext = {}
): void {
  const auditLog = {
    timestamp: new Date().toISOString(),
    userId,
    operation,
    permissions,
    result: result ? 'GRANTED' : 'DENIED',
    context,
    ip: context.resourceId || 'unknown'
  };

  // In production, send to audit system
  console.log('Permission Audit:', auditLog);
}