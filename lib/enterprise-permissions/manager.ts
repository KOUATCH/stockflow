/**
 * Enterprise Permission Manager
 *
 * Central orchestrator for all permission-related operations in the StockFlow system.
 * Provides a unified interface for permission checking, role management, and access control.
 */

import { PrismaClient } from '@prisma/client';
import type {
  IPermissionManager,
  EnhancedUser,
  PermissionContext,
  PermissionResult,
  PermissionRule,
  UserSession,
  EmergencyAccess,
  AuditEntry,
  PermissionConfig,
} from './types';

import { SYSTEM_PERMISSIONS, PERMISSION_RULES, isHighRiskPermission } from './permissions';
import { PermissionValidator } from './validator';
import { AuditLogger } from './audit';
import { SessionManager } from './session';
import { ResourceAccessManager } from './resource';
import { ApprovalWorkflowManager } from './approval';

export class PermissionManager implements IPermissionManager {
  private prisma: PrismaClient;
  private validator: PermissionValidator;
  private auditLogger: AuditLogger;
  private sessionManager: SessionManager;
  private resourceManager: ResourceAccessManager;
  private approvalManager: ApprovalWorkflowManager;
  private config: PermissionConfig;
  private permissionCache: Map<string, { permissions: string[]; expiresAt: Date }>;

  constructor(
    prisma: PrismaClient,
    config: Partial<PermissionConfig> = {}
  ) {
    this.prisma = prisma;
    this.config = {
      enableRiskAssessment: true,
      enableApprovalWorkflows: true,
      enableEmergencyAccess: true,
      enableSessionManagement: true,
      auditLevel: 'DETAILED',
      auditRetentionDays: 365,
      maxConcurrentSessions: 5,
      sessionTimeoutMinutes: 480, // 8 hours
      extendSessionOnActivity: true,
      cachePermissions: true,
      cacheTTLMinutes: 15,
      maxFailedPermissionChecks: 10,
      riskScoreThreshold: 75,
      defaultRiskLevel: 'MEDIUM',
      defaultApprovalTimeout: 24,
      defaultPermissionExpiry: 8760, // 1 year in hours
      ...config,
    };

    this.validator = new PermissionValidator(this.config);
    this.auditLogger = new AuditLogger(prisma, this.config);
    this.sessionManager = new SessionManager(prisma, this.config);
    this.resourceManager = new ResourceAccessManager(prisma, this.config);
    this.approvalManager = new ApprovalWorkflowManager(prisma, this.config);
    this.permissionCache = new Map();
  }

  /**
   * Core permission checking with comprehensive validation
   */
  async hasPermission(
    user: EnhancedUser,
    permission: string,
    context: PermissionContext = {}
  ): Promise<PermissionResult> {
    try {
      // Enhance context with user information
      const enhancedContext: PermissionContext = {
        ...context,
        userId: user.id,
        organizationId: user.organizationId,
        userRole: this.getUserEffectiveRole(user),
        userHierarchy: this.getUserHierarchyLevel(user),
        timestamp: new Date(),
      };

      // Get user's effective permissions (from cache or compute)
      const userPermissions = await this.getUserEffectivePermissions(user);

      // Check for super admin wildcard
      if (userPermissions.includes('*') || userPermissions.includes(SYSTEM_PERMISSIONS.PLATFORM_ADMIN)) {
        const result: PermissionResult = {
          granted: true,
          reason: 'Super admin access',
          auditInfo: {
            logRequired: true,
            metadata: { superAdminAccess: true },
          },
        };
        await this.auditPermissionCheck(result, enhancedContext);
        return result;
      }

      // Basic permission check
      if (!userPermissions.includes(permission)) {
        const result: PermissionResult = {
          granted: false,
          reason: `Missing required permission: ${permission}`,
          missingPermissions: [permission],
          suggestions: await this.getPermissionSuggestions([permission]),
        };
        await this.auditPermissionCheck(result, enhancedContext);
        return result;
      }

      // Check for permission-specific rules
      const rule = PERMISSION_RULES[permission];
      if (rule) {
        const ruleResult = await this.validateRule(user, rule, enhancedContext);
        if (!ruleResult.granted) {
          await this.auditPermissionCheck(ruleResult, enhancedContext);
          return ruleResult;
        }
      }

      // Risk assessment for high-risk permissions
      if (this.config.enableRiskAssessment && isHighRiskPermission(permission)) {
        const riskResult = await this.assessPermissionRisk(user, permission, enhancedContext);
        if (!riskResult.granted) {
          await this.auditPermissionCheck(riskResult, enhancedContext);
          return riskResult;
        }
      }

      // Check for approval requirements
      if (this.config.enableApprovalWorkflows) {
        const approvalResult = await this.checkApprovalRequirements(user, permission, enhancedContext);
        if (!approvalResult.granted) {
          await this.auditPermissionCheck(approvalResult, enhancedContext);
          return approvalResult;
        }
      }

      // Permission granted
      const result: PermissionResult = {
        granted: true,
        reason: 'Permission validated successfully',
        auditInfo: {
          logRequired: true,
          metadata: { permission, context: enhancedContext },
        },
      };

      await this.auditPermissionCheck(result, enhancedContext);
      return result;

    } catch (error) {
      const result: PermissionResult = {
        granted: false,
        reason: `Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        auditInfo: {
          logRequired: true,
          metadata: { error: error instanceof Error ? error.message : error },
        },
      };

      await this.auditPermissionCheck(result, context);
      return result;
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    user: EnhancedUser,
    permissions: string[],
    context: PermissionContext = {}
  ): Promise<PermissionResult> {
    for (const permission of permissions) {
      const result = await this.hasPermission(user, permission, context);
      if (result.granted) {
        return {
          ...result,
          reason: `Granted via permission: ${permission}`,
        };
      }
    }

    return {
      granted: false,
      reason: `Missing all required permissions: ${permissions.join(', ')}`,
      missingPermissions: permissions,
      suggestions: await this.getPermissionSuggestions(permissions),
    };
  }

  /**
   * Check if user has all specified permissions
   */
  async hasAllPermissions(
    user: EnhancedUser,
    permissions: string[],
    context: PermissionContext = {}
  ): Promise<PermissionResult> {
    const missingPermissions: string[] = [];
    const grantedPermissions: string[] = [];

    for (const permission of permissions) {
      const result = await this.hasPermission(user, permission, context);
      if (result.granted) {
        grantedPermissions.push(permission);
      } else {
        missingPermissions.push(permission);
      }
    }

    if (missingPermissions.length > 0) {
      return {
        granted: false,
        reason: `Missing required permissions: ${missingPermissions.join(', ')}`,
        missingPermissions,
        suggestions: await this.getPermissionSuggestions(missingPermissions),
      };
    }

    return {
      granted: true,
      reason: 'All required permissions validated',
    };
  }

  /**
   * Validate a complex permission rule
   */
  async validateRule(
    user: EnhancedUser,
    rule: PermissionRule,
    context: PermissionContext = {}
  ): Promise<PermissionResult> {
    return this.validator.validateRule(user, rule, context);
  }

  /**
   * Check resource-level access
   */
  async canAccessResource(
    user: EnhancedUser,
    resourceType: string,
    resourceId: string,
    action: string,
    context: PermissionContext = {}
  ): Promise<PermissionResult> {
    return this.resourceManager.canAccessResource(user, resourceType, resourceId, action, context);
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            rolePermissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    return user?.roles || [];
  }

  /**
   * Assign role to user
   */
  async assignRole(
    userId: string,
    roleId: string,
    grantedBy: string,
    conditions?: any
  ): Promise<boolean> {
    try {
      // Check if role assignment is allowed
      const granter = await this.getEnhancedUser(grantedBy);
      if (!granter) {
        throw new Error('Granter user not found');
      }

      const canAssign = await this.hasPermission(granter, SYSTEM_PERMISSIONS.ASSIGN_ROLES);
      if (!canAssign.granted) {
        throw new Error('Insufficient permissions to assign roles');
      }

      // Assign the role
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          roles: {
            connect: { id: roleId }
          }
        }
      });

      // Clear permission cache
      await this.refreshPermissions(userId);

      // Audit the role assignment
      await this.auditLogger.log({
        userId: grantedBy,
        action: 'ASSIGN_ROLE',
        resource: 'USER_ROLE',
        resourceId: `${userId}:${roleId}`,
        result: 'GRANTED',
        metadata: { userId, roleId, conditions },
      });

      return true;
    } catch (error) {
      await this.auditLogger.log({
        userId: grantedBy,
        action: 'ASSIGN_ROLE',
        resource: 'USER_ROLE',
        resourceId: `${userId}:${roleId}`,
        result: 'ERROR',
        metadata: { error: error instanceof Error ? error.message : error },
      });
      return false;
    }
  }

  /**
   * Revoke role from user
   */
  async revokeRole(
    userId: string,
    roleId: string,
    revokedBy: string,
    reason?: string
  ): Promise<boolean> {
    try {
      // Check if role revocation is allowed
      const revoker = await this.getEnhancedUser(revokedBy);
      if (!revoker) {
        throw new Error('Revoker user not found');
      }

      const canRevoke = await this.hasPermission(revoker, SYSTEM_PERMISSIONS.REVOKE_ROLES);
      if (!canRevoke.granted) {
        throw new Error('Insufficient permissions to revoke roles');
      }

      // Revoke the role
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          roles: {
            disconnect: { id: roleId }
          }
        }
      });

      // Clear permission cache
      await this.refreshPermissions(userId);

      // Audit the role revocation
      await this.auditLogger.log({
        userId: revokedBy,
        action: 'REVOKE_ROLE',
        resource: 'USER_ROLE',
        resourceId: `${userId}:${roleId}`,
        result: 'GRANTED',
        metadata: { userId, roleId, reason },
      });

      return true;
    } catch (error) {
      await this.auditLogger.log({
        userId: revokedBy,
        action: 'REVOKE_ROLE',
        resource: 'USER_ROLE',
        resourceId: `${userId}:${roleId}`,
        result: 'ERROR',
        metadata: { error: error instanceof Error ? error.message : error },
      });
      return false;
    }
  }

  /**
   * Grant direct permission to user
   */
  async grantPermission(
    userId: string,
    permission: string,
    grantedBy: string,
    conditions?: any
  ): Promise<boolean> {
    try {
      // Check if permission granting is allowed
      const granter = await this.getEnhancedUser(grantedBy);
      if (!granter) {
        throw new Error('Granter user not found');
      }

      const canGrant = await this.hasPermission(granter, SYSTEM_PERMISSIONS.GRANT_PERMISSIONS);
      if (!canGrant.granted) {
        throw new Error('Insufficient permissions to grant permissions');
      }

      // Find or create the permission record
      const permissionRecord = await this.prisma.permission.findUnique({
        where: { code: permission }
      });

      if (!permissionRecord) {
        throw new Error(`Permission ${permission} not found`);
      }

      // Grant the permission
      await this.prisma.userPermission.create({
        data: {
          userId,
          permissionId: permissionRecord.id,
          grantedBy,
          conditions,
          expiresAt: conditions?.expiresAt ? new Date(conditions.expiresAt) : null,
        }
      });

      // Clear permission cache
      await this.refreshPermissions(userId);

      // Audit the permission grant
      await this.auditLogger.log({
        userId: grantedBy,
        action: 'GRANT_PERMISSION',
        resource: 'USER_PERMISSION',
        resourceId: `${userId}:${permission}`,
        result: 'GRANTED',
        metadata: { userId, permission, conditions },
      });

      return true;
    } catch (error) {
      await this.auditLogger.log({
        userId: grantedBy,
        action: 'GRANT_PERMISSION',
        resource: 'USER_PERMISSION',
        resourceId: `${userId}:${permission}`,
        result: 'ERROR',
        metadata: { error: error instanceof Error ? error.message : error },
      });
      return false;
    }
  }

  /**
   * Revoke direct permission from user
   */
  async revokePermission(
    userId: string,
    permission: string,
    revokedBy: string,
    reason?: string
  ): Promise<boolean> {
    try {
      // Check if permission revocation is allowed
      const revoker = await this.getEnhancedUser(revokedBy);
      if (!revoker) {
        throw new Error('Revoker user not found');
      }

      const canRevoke = await this.hasPermission(revoker, SYSTEM_PERMISSIONS.REVOKE_PERMISSIONS);
      if (!canRevoke.granted) {
        throw new Error('Insufficient permissions to revoke permissions');
      }

      // Find the permission record
      const permissionRecord = await this.prisma.permission.findUnique({
        where: { code: permission }
      });

      if (!permissionRecord) {
        throw new Error(`Permission ${permission} not found`);
      }

      // Revoke the permission
      await this.prisma.userPermission.updateMany({
        where: {
          userId,
          permissionId: permissionRecord.id,
          isActive: true,
        },
        data: {
          isActive: false,
        }
      });

      // Clear permission cache
      await this.refreshPermissions(userId);

      // Audit the permission revocation
      await this.auditLogger.log({
        userId: revokedBy,
        action: 'REVOKE_PERMISSION',
        resource: 'USER_PERMISSION',
        resourceId: `${userId}:${permission}`,
        result: 'GRANTED',
        metadata: { userId, permission, reason },
      });

      return true;
    } catch (error) {
      await this.auditLogger.log({
        userId: revokedBy,
        action: 'REVOKE_PERMISSION',
        resource: 'USER_PERMISSION',
        resourceId: `${userId}:${permission}`,
        result: 'ERROR',
        metadata: { error: error instanceof Error ? error.message : error },
      });
      return false;
    }
  }

  /**
   * Session management methods
   */
  async createSession(user: EnhancedUser, deviceInfo?: any): Promise<UserSession> {
    return this.sessionManager.createSession(user, deviceInfo);
  }

  async validateSession(sessionToken: string): Promise<UserSession | null> {
    return this.sessionManager.validateSession(sessionToken);
  }

  async revokeSession(sessionId: string, revokedBy?: string): Promise<boolean> {
    return this.sessionManager.revokeSession(sessionId, revokedBy);
  }

  /**
   * Emergency access methods
   */
  async requestEmergencyAccess(
    userId: string,
    permissions: string[],
    reason: string
  ): Promise<string> {
    // Implementation for emergency access request
    // This would create a pending emergency access request
    throw new Error('Not implemented');
  }

  async approveEmergencyAccess(requestId: string, approvedBy: string): Promise<boolean> {
    // Implementation for emergency access approval
    throw new Error('Not implemented');
  }

  async revokeEmergencyAccess(accessId: string, revokedBy: string): Promise<boolean> {
    // Implementation for emergency access revocation
    throw new Error('Not implemented');
  }

  /**
   * Audit and compliance methods
   */
  async auditPermissionCheck(result: PermissionResult, context: PermissionContext): Promise<void> {
    if (result.auditInfo?.logRequired) {
      await this.auditLogger.log({
        userId: context.userId,
        action: 'PERMISSION_CHECK',
        resource: 'PERMISSION',
        resourceId: context.resourceId,
        result: result.granted ? 'GRANTED' : 'DENIED',
        permissionContext: context,
        metadata: result.auditInfo.metadata,
      });
    }
  }

  async getAuditLogs(filters: any): Promise<AuditEntry[]> {
    return this.auditLogger.getAuditLogs(filters);
  }

  /**
   * System management methods
   */
  async refreshPermissions(userId: string): Promise<void> {
    // Clear cache for the user
    const cacheKeys = Array.from(this.permissionCache.keys()).filter(key =>
      key.startsWith(`${userId}:`)
    );
    cacheKeys.forEach(key => this.permissionCache.delete(key));
  }

  async cleanupExpiredSessions(): Promise<number> {
    return this.sessionManager.cleanupExpiredSessions();
  }

  async generateComplianceReport(
    organizationId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<any> {
    // Implementation for compliance reporting
    throw new Error('Not implemented');
  }

  /**
   * Private helper methods
   */
  private async getEnhancedUser(userId: string): Promise<EnhancedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            rolePermissions: {
              include: { permission: true },
              where: { isActive: true }
            }
          }
        },
        userPermissions: {
          include: { permission: true, resource: true },
          where: { isActive: true }
        },
        organization: true,
      }
    });

    return user as EnhancedUser | null;
  }

  private async getUserEffectivePermissions(user: EnhancedUser): Promise<string[]> {
    const cacheKey = `${user.id}:permissions`;
    const cached = this.permissionCache.get(cacheKey);

    if (this.config.cachePermissions && cached && cached.expiresAt > new Date()) {
      return cached.permissions;
    }

    const permissions = new Set<string>();

    // Add role-based permissions
    for (const role of user.roles) {
      for (const rolePermission of role.rolePermissions) {
        if (this.isPermissionValid(rolePermission)) {
          permissions.add(rolePermission.permission.code);
        }
      }
      // Add legacy permissions array
      role.permissions.forEach(p => permissions.add(p));
    }

    // Add direct user permissions
    for (const userPermission of user.userPermissions) {
      if (this.isPermissionValid(userPermission)) {
        permissions.add(userPermission.permission.code);
      }
    }

    const permissionArray = Array.from(permissions);

    // Cache the result
    if (this.config.cachePermissions) {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.config.cacheTTLMinutes);
      this.permissionCache.set(cacheKey, { permissions: permissionArray, expiresAt });
    }

    return permissionArray;
  }

  private isPermissionValid(permission: any): boolean {
    if (!permission.isActive) return false;
    if (permission.expiresAt && permission.expiresAt < new Date()) return false;
    return true;
  }

  private getUserEffectiveRole(user: EnhancedUser): string {
    if (user.roles.length === 0) return 'viewer';

    // Return the role with the highest hierarchy (lowest number)
    const sortedRoles = user.roles.sort((a, b) => (a.hierarchyLevel || 999) - (b.hierarchyLevel || 999));
    return sortedRoles[0].code;
  }

  private getUserHierarchyLevel(user: EnhancedUser): number {
    if (user.roles.length === 0) return 999;

    // Return the highest hierarchy level (lowest number)
    return Math.min(...user.roles.map(role => role.hierarchyLevel || 999));
  }

  private async getPermissionSuggestions(permissions: string[]): Promise<string[]> {
    const suggestions: string[] = [];

    for (const permission of permissions) {
      if (permission.includes('CREATE')) {
        suggestions.push('Contact your manager to request creation permissions');
      } else if (permission.includes('DELETE')) {
        suggestions.push('Deletion permissions require administrator approval');
      } else if (permission.includes('FINANCIAL')) {
        suggestions.push('Financial access requires manager or administrator role');
      } else {
        suggestions.push(`Request ${permission} permission from your administrator`);
      }
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }

  private async assessPermissionRisk(
    user: EnhancedUser,
    permission: string,
    context: PermissionContext
  ): Promise<PermissionResult> {
    // Risk assessment implementation
    // This would analyze various risk factors and return a result
    return { granted: true };
  }

  private async checkApprovalRequirements(
    user: EnhancedUser,
    permission: string,
    context: PermissionContext
  ): Promise<PermissionResult> {
    // Check if permission requires approval workflow
    // This would check for pending/approved requests
    return { granted: true };
  }
}