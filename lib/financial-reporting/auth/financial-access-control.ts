// =============================================================================
// FINANCIAL DATA ACCESS CONTROL SERVICE
// Enterprise-grade security for financial reporting system
// =============================================================================

import { User, Permission, Role } from '@prisma/client';
import { FINANCIAL_PERMISSIONS, FINANCIAL_ROLE_TEMPLATES, type FinancialPermission } from '@/lib/permissions/financial-permissions';
import { AuditTrailService } from '@/actions/financial-reporting/audit/audit-trail-service';
import { db } from '@/prisma/db';
import { createFinancialNotification } from '@/lib/financial-reporting/notifications/financial-notification-service';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface FinancialUser extends User {
  roles: Array<Role & {
    permissions: Permission[];
  }>;
}

export interface FinancialAccessContext {
  userId: string;
  organizationId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface FinancialResourceAccess {
  resource: string;
  action: string;
  resourceId?: string;
  organizationId: string;
  additionalContext?: Record<string, any>;
}

export interface AccessControlResult {
  granted: boolean;
  reason?: string;
  auditEntry?: any;
  requiredPermissions?: FinancialPermission[];
  userPermissions?: FinancialPermission[];
}

export interface DataSensitivityLevel {
  level: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'TOP_SECRET';
  requiredPermissions: FinancialPermission[];
  encryptionRequired: boolean;
  auditRequired: boolean;
}

// =============================================================================
// FINANCIAL ACCESS CONTROL SERVICE
// =============================================================================

export class FinancialAccessControlService {
  private auditService: AuditTrailService;

  constructor() {
    this.auditService = new AuditTrailService();
  }

  // =============================================================================
  // PERMISSION CHECKING
  // =============================================================================

  /**
   * Check if user has specific financial permission
   */
  async hasPermission(
    context: FinancialAccessContext,
    permission: FinancialPermission
  ): Promise<boolean> {
    try {
      const user = await this.getUserWithPermissions(context.userId);
      if (!user) return false;

      // Check if user has the specific permission
      const hasPermission = user.roles.some(role =>
        role.permissions.some(p => p.name === permission)
      );

      // Audit the permission check
      await this.auditService.createAuditEntry({
        userId: context.userId,
        organizationId: context.organizationId,
        action: 'PERMISSION_CHECK',
        resource: 'FINANCIAL_PERMISSION',
        resourceId: permission,
        description: `Permission check for ${permission}`,
        metadata: {
          granted: hasPermission,
          sessionId: context.sessionId,
          ipAddress: context.ipAddress
        }
      });

      return hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Check if user has multiple financial permissions (all required)
   */
  async hasAllPermissions(
    context: FinancialAccessContext,
    permissions: FinancialPermission[]
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(context, permission))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if user has any of the financial permissions (at least one required)
   */
  async hasAnyPermission(
    context: FinancialAccessContext,
    permissions: FinancialPermission[]
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(context, permission)) {
        return true;
      }
    }
    return false;
  }

  // =============================================================================
  // RESOURCE ACCESS CONTROL
  // =============================================================================

  /**
   * Check access to financial resource with comprehensive validation
   */
  async checkResourceAccess(
    context: FinancialAccessContext,
    resource: FinancialResourceAccess
  ): Promise<AccessControlResult> {
    try {
      const user = await this.getUserWithPermissions(context.userId);
      if (!user) {
        return {
          granted: false,
          reason: 'User not found or invalid'
        };
      }

      // Get required permissions for the resource action
      const requiredPermissions = this.getRequiredPermissions(resource.resource, resource.action);
      const userPermissions = this.getUserPermissions(user);

      // Check if user has required permissions
      const hasRequiredPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      // Additional security checks
      const securityChecks = await this.performSecurityChecks(context, resource, user);

      const granted = hasRequiredPermissions && securityChecks.passed;

      // Create audit entry
      const auditEntry = await this.auditService.createAuditEntry({
        userId: context.userId,
        organizationId: context.organizationId,
        action: resource.action,
        resource: resource.resource,
        resourceId: resource.resourceId,
        description: `Access ${granted ? 'granted' : 'denied'} for ${resource.resource}`,
        metadata: {
          granted,
          requiredPermissions,
          userPermissions,
          securityChecks: securityChecks.details,
          additionalContext: resource.additionalContext
        }
      });

      return {
        granted,
        reason: granted ? 'Access granted' : (securityChecks.reason || 'Insufficient permissions'),
        auditEntry,
        requiredPermissions,
        userPermissions
      };

    } catch (error) {
      console.error('Resource access check failed:', error);
      return {
        granted: false,
        reason: 'Access check failed due to system error'
      };
    }
  }

  /**
   * Get required permissions for a specific resource and action
   */
  private getRequiredPermissions(resource: string, action: string): FinancialPermission[] {
    const permissionMap: Record<string, Record<string, FinancialPermission[]>> = {
      'INCOME_STATEMENT': {
        'VIEW': [FINANCIAL_PERMISSIONS.VIEW_INCOME_STATEMENT],
        'GENERATE': [FINANCIAL_PERMISSIONS.GENERATE_FINANCIAL_STATEMENTS],
        'APPROVE': [FINANCIAL_PERMISSIONS.APPROVE_FINANCIAL_STATEMENTS],
        'EXPORT': [FINANCIAL_PERMISSIONS.EXPORT_FINANCIAL_REPORTS]
      },
      'BALANCE_SHEET': {
        'VIEW': [FINANCIAL_PERMISSIONS.VIEW_BALANCE_SHEET],
        'GENERATE': [FINANCIAL_PERMISSIONS.GENERATE_FINANCIAL_STATEMENTS],
        'APPROVE': [FINANCIAL_PERMISSIONS.APPROVE_FINANCIAL_STATEMENTS],
        'EXPORT': [FINANCIAL_PERMISSIONS.EXPORT_FINANCIAL_REPORTS]
      },
      'CASH_FLOW_STATEMENT': {
        'VIEW': [FINANCIAL_PERMISSIONS.VIEW_CASH_FLOW_STATEMENT],
        'GENERATE': [FINANCIAL_PERMISSIONS.GENERATE_FINANCIAL_STATEMENTS],
        'APPROVE': [FINANCIAL_PERMISSIONS.APPROVE_FINANCIAL_STATEMENTS],
        'EXPORT': [FINANCIAL_PERMISSIONS.EXPORT_FINANCIAL_REPORTS]
      },
      'JOURNAL_ENTRY': {
        'VIEW': [FINANCIAL_PERMISSIONS.VIEW_JOURNAL_ENTRIES],
        'CREATE': [FINANCIAL_PERMISSIONS.CREATE_JOURNAL_ENTRIES],
        'UPDATE': [FINANCIAL_PERMISSIONS.UPDATE_JOURNAL_ENTRIES],
        'DELETE': [FINANCIAL_PERMISSIONS.DELETE_JOURNAL_ENTRIES],
        'APPROVE': [FINANCIAL_PERMISSIONS.APPROVE_JOURNAL_ENTRIES],
        'POST': [FINANCIAL_PERMISSIONS.POST_JOURNAL_ENTRIES]
      },
      'CHART_OF_ACCOUNTS': {
        'VIEW': [FINANCIAL_PERMISSIONS.VIEW_CHART_OF_ACCOUNTS],
        'CREATE': [FINANCIAL_PERMISSIONS.CREATE_ACCOUNTS],
        'UPDATE': [FINANCIAL_PERMISSIONS.UPDATE_ACCOUNTS],
        'DELETE': [FINANCIAL_PERMISSIONS.DELETE_ACCOUNTS]
      },
      'GENERAL_LEDGER': {
        'VIEW': [FINANCIAL_PERMISSIONS.VIEW_GENERAL_LEDGER],
        'EXPORT': [FINANCIAL_PERMISSIONS.EXPORT_FINANCIAL_REPORTS]
      },
      'BUDGET': {
        'VIEW': [FINANCIAL_PERMISSIONS.VIEW_BUDGETS],
        'CREATE': [FINANCIAL_PERMISSIONS.CREATE_BUDGETS],
        'UPDATE': [FINANCIAL_PERMISSIONS.UPDATE_BUDGETS],
        'DELETE': [FINANCIAL_PERMISSIONS.DELETE_BUDGETS],
        'APPROVE': [FINANCIAL_PERMISSIONS.APPROVE_BUDGETS]
      },
      'FINANCIAL_ANALYSIS': {
        'VIEW': [FINANCIAL_PERMISSIONS.VIEW_FINANCIAL_RATIOS],
        'GENERATE': [FINANCIAL_PERMISSIONS.VIEW_FINANCIAL_TRENDS],
        'FORECAST': [FINANCIAL_PERMISSIONS.GENERATE_FINANCIAL_FORECASTS]
      },
      'AUDIT_TRAIL': {
        'VIEW': [FINANCIAL_PERMISSIONS.VIEW_FINANCIAL_AUDIT_TRAIL],
        'EXPORT': [FINANCIAL_PERMISSIONS.EXPORT_AUDIT_LOGS],
        'INVESTIGATE': [FINANCIAL_PERMISSIONS.INVESTIGATE_AUDIT_FINDINGS]
      },
      'COMPLIANCE': {
        'VIEW': [FINANCIAL_PERMISSIONS.VIEW_COMPLIANCE_STATUS],
        'MANAGE': [FINANCIAL_PERMISSIONS.MANAGE_COMPLIANCE_REQUIREMENTS],
        'REPORT': [FINANCIAL_PERMISSIONS.GENERATE_COMPLIANCE_REPORTS]
      }
    };

    return permissionMap[resource]?.[action] || [];
  }

  /**
   * Get all permissions for a user
   */
  private getUserPermissions(user: FinancialUser): FinancialPermission[] {
    const permissions = new Set<FinancialPermission>();

    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        if (Object.values(FINANCIAL_PERMISSIONS).includes(permission.name as FinancialPermission)) {
          permissions.add(permission.name as FinancialPermission);
        }
      });
    });

    return Array.from(permissions);
  }

  // =============================================================================
  // SECURITY CHECKS
  // =============================================================================

  /**
   * Perform additional security checks beyond permissions
   */
  private async performSecurityChecks(
    context: FinancialAccessContext,
    resource: FinancialResourceAccess,
    user: FinancialUser
  ): Promise<{ passed: boolean; reason?: string; details: any }> {
    const checks = {
      organizationAccess: false,
      timeBasedAccess: false,
      ipWhitelist: false,
      rateLimit: false,
      dataClassification: false
    };

    try {
      // 1. Organization Access Check
      checks.organizationAccess = await this.checkOrganizationAccess(
        user.id,
        context.organizationId
      );

      // 2. Time-based Access Check (business hours, etc.)
      checks.timeBasedAccess = this.checkTimeBasedAccess(user, resource);

      // 3. IP Whitelist Check (for sensitive operations)
      checks.ipWhitelist = await this.checkIPWhitelist(
        context.ipAddress,
        resource.resource,
        resource.action
      );

      // 4. Rate Limiting Check
      checks.rateLimit = await this.checkRateLimit(context.userId, resource);

      // 5. Data Classification Check
      checks.dataClassification = this.checkDataClassification(resource, user);

      const passed = Object.values(checks).every(check => check === true);

      return {
        passed,
        reason: passed ? undefined : 'Security checks failed',
        details: checks
      };

    } catch (error) {
      console.error('Security checks failed:', error);
      return {
        passed: false,
        reason: 'Security check system error',
        details: checks
      };
    }
  }

  /**
   * Check if user has access to organization
   */
  private async checkOrganizationAccess(userId: string, organizationId: string): Promise<boolean> {
    try {
      const userOrg = await db.userOrganization.findFirst({
        where: {
          userId,
          organizationId,
          isActive: true
        }
      });
      return !!userOrg;
    } catch (error) {
      console.error('Organization access check failed:', error);
      return false;
    }
  }

  /**
   * Check time-based access restrictions
   */
  private checkTimeBasedAccess(user: FinancialUser, resource: FinancialResourceAccess): boolean {
    // For high-risk operations, enforce business hours
    const highRiskOperations = [
      'APPROVE_FINANCIAL_STATEMENTS',
      'POST_JOURNAL_ENTRIES',
      'AUTHORIZE_CASH_TRANSFERS'
    ];

    if (highRiskOperations.some(op => resource.action.includes(op))) {
      const now = new Date();
      const hour = now.getHours();

      // Business hours: 6 AM to 10 PM
      if (hour < 6 || hour > 22) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check IP whitelist for sensitive operations
   */
  private async checkIPWhitelist(
    ipAddress: string | undefined,
    resource: string,
    action: string
  ): Promise<boolean> {
    // For now, allow all IPs - in production, implement whitelist
    // High-security operations should have IP restrictions
    const restrictedOperations = [
      'APPROVE_FINANCIAL_STATEMENTS',
      'CERTIFY_COMPLIANCE',
      'AUTHORIZE_CASH_TRANSFERS'
    ];

    if (restrictedOperations.includes(action)) {
      // TODO: Implement IP whitelist check
      return true; // Placeholder
    }

    return true;
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(userId: string, resource: FinancialResourceAccess): Promise<boolean> {
    // TODO: Implement Redis-based rate limiting
    // For now, return true
    return true;
  }

  /**
   * Check data classification access
   */
  private checkDataClassification(resource: FinancialResourceAccess, user: FinancialUser): boolean {
    const sensitivityLevels = this.getDataSensitivityLevel(resource.resource);
    const userClearanceLevel = this.getUserClearanceLevel(user);

    return this.hasSufficientClearance(userClearanceLevel, sensitivityLevels.level);
  }

  /**
   * Get data sensitivity level for resource
   */
  private getDataSensitivityLevel(resource: string): DataSensitivityLevel {
    const sensitivityMap: Record<string, DataSensitivityLevel> = {
      'INCOME_STATEMENT': {
        level: 'CONFIDENTIAL',
        requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_INCOME_STATEMENT],
        encryptionRequired: true,
        auditRequired: true
      },
      'BALANCE_SHEET': {
        level: 'CONFIDENTIAL',
        requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_BALANCE_SHEET],
        encryptionRequired: true,
        auditRequired: true
      },
      'CASH_FLOW_STATEMENT': {
        level: 'RESTRICTED',
        requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_CASH_FLOW_STATEMENT],
        encryptionRequired: true,
        auditRequired: true
      },
      'JOURNAL_ENTRY': {
        level: 'INTERNAL',
        requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_JOURNAL_ENTRIES],
        encryptionRequired: false,
        auditRequired: true
      },
      'CHART_OF_ACCOUNTS': {
        level: 'INTERNAL',
        requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_CHART_OF_ACCOUNTS],
        encryptionRequired: false,
        auditRequired: false
      },
      'AUDIT_TRAIL': {
        level: 'RESTRICTED',
        requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_FINANCIAL_AUDIT_TRAIL],
        encryptionRequired: true,
        auditRequired: true
      }
    };

    return sensitivityMap[resource] || {
      level: 'INTERNAL',
      requiredPermissions: [],
      encryptionRequired: false,
      auditRequired: false
    };
  }

  /**
   * Get user clearance level based on roles
   */
  private getUserClearanceLevel(user: FinancialUser): DataSensitivityLevel['level'] {
    const roleClearanceLevels: Record<string, DataSensitivityLevel['level']> = {
      'cfo': 'TOP_SECRET',
      'ceo': 'TOP_SECRET',
      'controller': 'RESTRICTED',
      'assistant_controller': 'CONFIDENTIAL',
      'financial_analyst': 'CONFIDENTIAL',
      'internal_auditor': 'RESTRICTED',
      'compliance_officer': 'RESTRICTED',
      'accounting_clerk': 'INTERNAL',
      'financial_viewer': 'INTERNAL'
    };

    let highestLevel: DataSensitivityLevel['level'] = 'PUBLIC';

    user.roles.forEach(role => {
      const roleLevel = roleClearanceLevels[role.name];
      if (roleLevel) {
        const levels = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET'];
        if (levels.indexOf(roleLevel) > levels.indexOf(highestLevel)) {
          highestLevel = roleLevel;
        }
      }
    });

    return highestLevel;
  }

  /**
   * Check if user has sufficient clearance for data sensitivity level
   */
  private hasSufficientClearance(
    userLevel: DataSensitivityLevel['level'],
    requiredLevel: DataSensitivityLevel['level']
  ): boolean {
    const levels = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET'];
    return levels.indexOf(userLevel) >= levels.indexOf(requiredLevel);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Get user with permissions
   */
  private async getUserWithPermissions(userId: string): Promise<FinancialUser | null> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              permissions: true
            }
          }
        }
      });

      return user as FinancialUser;
    } catch (error) {
      console.error('Failed to get user with permissions:', error);
      return null;
    }
  }

  /**
   * Create financial access context from request
   */
  static createAccessContext(
    userId: string,
    organizationId: string,
    request?: {
      sessionId?: string;
      ip?: string;
      userAgent?: string;
    }
  ): FinancialAccessContext {
    return {
      userId,
      organizationId,
      sessionId: request?.sessionId,
      ipAddress: request?.ip,
      userAgent: request?.userAgent
    };
  }

  /**
   * Validate financial resource access request
   */
  static validateResourceAccess(resource: Partial<FinancialResourceAccess>): FinancialResourceAccess | null {
    if (!resource.resource || !resource.action || !resource.organizationId) {
      return null;
    }

    return {
      resource: resource.resource,
      action: resource.action,
      organizationId: resource.organizationId,
      resourceId: resource.resourceId,
      additionalContext: resource.additionalContext || {}
    };
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick permission check function
 */
export async function checkFinancialPermission(
  userId: string,
  organizationId: string,
  permission: FinancialPermission
): Promise<boolean> {
  const accessControl = new FinancialAccessControlService();
  const context = FinancialAccessControlService.createAccessContext(userId, organizationId);
  return await accessControl.hasPermission(context, permission);
}

/**
 * Quick resource access check function
 */
export async function checkFinancialResourceAccess(
  userId: string,
  organizationId: string,
  resource: string,
  action: string,
  resourceId?: string
): Promise<AccessControlResult> {
  const accessControl = new FinancialAccessControlService();
  const context = FinancialAccessControlService.createAccessContext(userId, organizationId);
  const resourceAccess: FinancialResourceAccess = {
    resource,
    action,
    organizationId,
    resourceId
  };

  return await accessControl.checkResourceAccess(context, resourceAccess);
}

export default FinancialAccessControlService;