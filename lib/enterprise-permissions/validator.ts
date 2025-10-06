/**
 * Enterprise Permission Validator
 *
 * Advanced permission validation with context-aware checks, risk assessment,
 * and comprehensive business rule enforcement.
 */

import type {
  EnhancedUser,
  PermissionContext,
  PermissionResult,
  PermissionRule,
  PermissionCondition,
  TimeRestriction,
  RiskAssessment,
  PermissionConfig,
} from './types';

export class PermissionValidator {
  private config: PermissionConfig;

  constructor(config: PermissionConfig) {
    this.config = config;
  }

  /**
   * Validate a permission rule with comprehensive checks
   */
  async validateRule(
    user: EnhancedUser,
    rule: PermissionRule,
    context: PermissionContext = {}
  ): Promise<PermissionResult> {
    try {
      // Step 1: Basic permission check
      const basicCheck = this.validateBasicPermissions(user, rule);
      if (!basicCheck.granted) {
        return basicCheck;
      }

      // Step 2: Hierarchy validation
      if (rule.hierarchyCheck) {
        const hierarchyCheck = this.validateRoleHierarchy(user, rule, context);
        if (!hierarchyCheck.granted) {
          return hierarchyCheck;
        }
      }

      // Step 3: Resource ownership validation
      if (rule.resourceCheck && context.resourceId) {
        const resourceCheck = await this.validateResourceAccess(user, rule, context);
        if (!resourceCheck.granted) {
          return resourceCheck;
        }
      }

      // Step 4: Conditional validation
      if (rule.conditions && rule.conditions.length > 0) {
        const conditionCheck = await this.validateConditions(user, rule.conditions, context);
        if (!conditionCheck.granted) {
          return conditionCheck;
        }
      }

      // Step 5: Time restriction validation
      if (rule.timeRestrictions && rule.timeRestrictions.length > 0) {
        const timeCheck = this.validateTimeRestrictions(rule.timeRestrictions, context);
        if (!timeCheck.granted) {
          return timeCheck;
        }
      }

      // Step 6: Location restriction validation
      if (rule.locationRestrictions && rule.locationRestrictions.length > 0) {
        const locationCheck = this.validateLocationRestrictions(rule.locationRestrictions, context);
        if (!locationCheck.granted) {
          return locationCheck;
        }
      }

      // Step 7: Risk assessment
      if (this.config.enableRiskAssessment && rule.riskAssessment) {
        const riskCheck = await this.validateRiskAssessment(user, rule.riskAssessment, context);
        if (!riskCheck.granted) {
          return riskCheck;
        }
      }

      // Step 8: Custom validators
      if (rule.additionalValidators && rule.additionalValidators.length > 0) {
        const customCheck = await this.validateCustomRules(user, rule.additionalValidators, context);
        if (!customCheck.granted) {
          return customCheck;
        }
      }

      // All checks passed
      return {
        granted: true,
        reason: `Permission rule '${rule.name}' validated successfully`,
        riskAssessment: rule.riskAssessment ? {
          level: rule.riskAssessment.level,
          factors: rule.riskAssessment.factors.map(f => f.description),
        } : undefined,
        auditInfo: {
          logRequired: true,
          metadata: {
            rule: rule.name,
            context,
            validationSteps: [
              'basic_permissions',
              'hierarchy_check',
              'resource_check',
              'conditions',
              'time_restrictions',
              'location_restrictions',
              'risk_assessment',
              'custom_validators'
            ].filter(Boolean)
          },
        },
      };

    } catch (error) {
      return {
        granted: false,
        reason: `Rule validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        auditInfo: {
          logRequired: true,
          metadata: { error: error instanceof Error ? error.message : error },
        },
      };
    }
  }

  /**
   * Validate basic permission requirements
   */
  private validateBasicPermissions(user: EnhancedUser, rule: PermissionRule): PermissionResult {
    const userPermissions = this.getUserPermissions(user);

    // Check for super admin access
    if (userPermissions.includes('*') || userPermissions.includes('PLATFORM_ADMIN')) {
      return {
        granted: true,
        reason: 'Super admin access bypasses rule validation',
      };
    }

    const hasPermissions = rule.requireAll
      ? rule.permissions.every(p => userPermissions.includes(p))
      : rule.permissions.some(p => userPermissions.includes(p));

    if (!hasPermissions) {
      const missingPermissions = rule.permissions.filter(p => !userPermissions.includes(p));
      return {
        granted: false,
        reason: `Missing required permission${rule.requireAll ? 's' : ''}: ${missingPermissions.join(', ')}`,
        missingPermissions,
        requiredPermissions: rule.permissions,
        suggestions: this.getPermissionSuggestions(missingPermissions),
      };
    }

    return { granted: true };
  }

  /**
   * Validate role hierarchy restrictions
   */
  private validateRoleHierarchy(
    user: EnhancedUser,
    rule: PermissionRule,
    context: PermissionContext
  ): PermissionResult {
    const userHierarchy = this.getUserHierarchyLevel(user);

    // Prevent privilege escalation
    if (context.resourceOwner && context.resourceOwner !== user.id) {
      // Check if user can manage the target resource owner
      const targetHierarchy = context.userHierarchy || 999;

      if (userHierarchy >= targetHierarchy) {
        return {
          granted: false,
          reason: 'Cannot perform action on user with equal or higher privileges',
          riskAssessment: {
            level: 'HIGH',
            factors: ['Privilege escalation attempt'],
          },
        };
      }
    }

    // Check minimum hierarchy requirements
    if (rule.riskAssessment?.level === 'CRITICAL' && userHierarchy > 2) {
      return {
        granted: false,
        reason: 'Critical operations require administrator or super admin role',
      };
    }

    return { granted: true };
  }

  /**
   * Validate resource access permissions
   */
  private async validateResourceAccess(
    user: EnhancedUser,
    rule: PermissionRule,
    context: PermissionContext
  ): Promise<PermissionResult> {
    // Resource ownership check
    if (context.resourceOwner && context.resourceOwner === user.id) {
      return { granted: true, reason: 'Resource owner access' };
    }

    // Organization boundary check
    if (context.organizationId && context.organizationId !== user.organizationId) {
      return {
        granted: false,
        reason: 'Cannot access resources from different organization',
        riskAssessment: {
          level: 'HIGH',
          factors: ['Cross-organization access attempt'],
        },
      };
    }

    // Specific resource type checks
    if (context.resourceType) {
      const resourcePermission = `${context.action?.toUpperCase()}_${context.resourceType.toUpperCase()}`;
      const userPermissions = this.getUserPermissions(user);

      if (!userPermissions.includes(resourcePermission) && !userPermissions.includes(`MANAGE_${context.resourceType.toUpperCase()}`)) {
        return {
          granted: false,
          reason: `Missing specific resource permission: ${resourcePermission}`,
          missingPermissions: [resourcePermission],
        };
      }
    }

    return { granted: true };
  }

  /**
   * Validate conditional logic
   */
  private async validateConditions(
    user: EnhancedUser,
    conditions: PermissionCondition[],
    context: PermissionContext
  ): Promise<PermissionResult> {
    for (const condition of conditions) {
      const result = await this.validateSingleCondition(condition, user, context);
      if (!result.granted) {
        return {
          ...result,
          reason: `Condition failed: ${condition.description || condition.field}`,
        };
      }
    }

    return { granted: true };
  }

  /**
   * Validate a single condition
   */
  private async validateSingleCondition(
    condition: PermissionCondition,
    user: EnhancedUser,
    context: PermissionContext
  ): Promise<PermissionResult> {
    let fieldValue: any;

    // Extract field value based on condition type
    switch (condition.type) {
      case 'AMOUNT_LIMIT':
        fieldValue = context.amount || 0;
        break;
      case 'TIME_WINDOW':
        fieldValue = context.timestamp || new Date();
        break;
      case 'LOCATION':
        fieldValue = context.location;
        break;
      case 'USER_ATTRIBUTE':
        fieldValue = this.getUserAttribute(user, condition.field);
        break;
      case 'RESOURCE_STATE':
        fieldValue = await this.getResourceState(context.resourceType, context.resourceId, condition.field);
        break;
      case 'CUSTOM':
        fieldValue = context.additionalContext?.[condition.field];
        break;
      default:
        return {
          granted: false,
          reason: `Unknown condition type: ${condition.type}`,
        };
    }

    // Evaluate condition based on operator
    const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value);

    if (!conditionMet) {
      return {
        granted: false,
        reason: `Condition not met: ${condition.field} ${condition.operator} ${condition.value}`,
        conditionalGrant: this.getConditionalGrant(condition),
      };
    }

    return { granted: true };
  }

  /**
   * Validate time restrictions
   */
  private validateTimeRestrictions(
    restrictions: TimeRestriction[],
    context: PermissionContext
  ): PermissionResult {
    const currentTime = context.timestamp || new Date();

    for (const restriction of restrictions) {
      if (!this.isTimeAllowed(currentTime, restriction)) {
        return {
          granted: false,
          reason: `Access denied: Outside allowed time window (${restriction.type})`,
          conditionalGrant: {
            conditions: { allowedTime: this.getNextAllowedTime(restriction) },
            expiresAt: this.getNextAllowedTime(restriction),
          },
        };
      }
    }

    return { granted: true };
  }

  /**
   * Validate location restrictions
   */
  private validateLocationRestrictions(
    restrictions: string[],
    context: PermissionContext
  ): PermissionResult {
    if (!context.location) {
      return {
        granted: false,
        reason: 'Location information required but not provided',
      };
    }

    if (!restrictions.includes(context.location)) {
      return {
        granted: false,
        reason: `Access denied from location: ${context.location}`,
        suggestions: [`Access allowed from: ${restrictions.join(', ')}`],
      };
    }

    return { granted: true };
  }

  /**
   * Validate risk assessment
   */
  private async validateRiskAssessment(
    user: EnhancedUser,
    riskAssessment: RiskAssessment,
    context: PermissionContext
  ): Promise<PermissionResult> {
    const riskScore = await this.calculateRiskScore(user, riskAssessment, context);

    if (riskScore > this.config.riskScoreThreshold) {
      const result: PermissionResult = {
        granted: false,
        reason: `Risk score too high: ${riskScore}/${this.config.riskScoreThreshold}`,
        riskAssessment: {
          level: riskAssessment.level,
          factors: riskAssessment.factors.map(f => f.description),
          mitigations: this.getRiskMitigations(riskAssessment),
        },
      };

      if (riskAssessment.automaticDeny) {
        return result;
      }

      if (riskAssessment.requiresApproval) {
        result.conditionalGrant = {
          conditions: { approvalRequired: true },
          requiresApproval: true,
          approvers: ['administrator', 'security_officer'],
        };
      }

      return result;
    }

    return { granted: true };
  }

  /**
   * Validate custom validators
   */
  private async validateCustomRules(
    user: EnhancedUser,
    validators: Array<(user: EnhancedUser, context: PermissionContext) => Promise<boolean>>,
    context: PermissionContext
  ): Promise<PermissionResult> {
    for (const validator of validators) {
      try {
        const result = await validator(user, context);
        if (!result) {
          return {
            granted: false,
            reason: 'Custom validation rule failed',
          };
        }
      } catch (error) {
        return {
          granted: false,
          reason: `Custom validator error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }

    return { granted: true };
  }

  /**
   * Helper methods
   */
  private getUserPermissions(user: EnhancedUser): string[] {
    const permissions = new Set<string>();

    // Add role permissions
    user.roles.forEach(role => {
      role.permissions.forEach(p => permissions.add(p));
      role.rolePermissions?.forEach(rp => {
        if (rp.isActive && (!rp.expiresAt || rp.expiresAt > new Date())) {
          permissions.add(rp.permission.code);
        }
      });
    });

    // Add direct user permissions
    user.userPermissions?.forEach(up => {
      if (up.isActive && (!up.expiresAt || up.expiresAt > new Date())) {
        permissions.add(up.permission.code);
      }
    });

    // Add session permissions
    if (user.sessionPermissions) {
      user.sessionPermissions.forEach(p => permissions.add(p));
    }

    return Array.from(permissions);
  }

  private getUserHierarchyLevel(user: EnhancedUser): number {
    if (user.roles.length === 0) return 999;
    return Math.min(...user.roles.map(role => role.hierarchyLevel || 999));
  }

  private getUserAttribute(user: EnhancedUser, field: string): any {
    switch (field) {
      case 'organizationId':
        return user.organizationId;
      case 'isActive':
        return user.isActive;
      case 'twoFactorEnabled':
        return user.twoFactorEnabled;
      case 'lastLoginAt':
        return user.lastLoginAt;
      case 'roles':
        return user.roles.map(r => r.code);
      default:
        return (user as any)[field];
    }
  }

  private async getResourceState(resourceType?: string, resourceId?: string, field?: string): Promise<any> {
    // Implementation would fetch resource state from database
    // This is a placeholder that would be implemented based on resource type
    return null;
  }

  private evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'EQUALS':
        return value === expectedValue;
      case 'NOT_EQUALS':
        return value !== expectedValue;
      case 'GREATER_THAN':
        return Number(value) > Number(expectedValue);
      case 'LESS_THAN':
        return Number(value) < Number(expectedValue);
      case 'IN':
        return Array.isArray(expectedValue) && expectedValue.includes(value);
      case 'NOT_IN':
        return Array.isArray(expectedValue) && !expectedValue.includes(value);
      case 'CONTAINS':
        return String(value).includes(String(expectedValue));
      case 'REGEX':
        return new RegExp(expectedValue).test(String(value));
      default:
        return false;
    }
  }

  private getConditionalGrant(condition: PermissionCondition): any {
    // Return conditional grant information based on condition
    switch (condition.type) {
      case 'AMOUNT_LIMIT':
        return {
          conditions: { maxAmount: condition.value },
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        };
      default:
        return null;
    }
  }

  private isTimeAllowed(currentTime: Date, restriction: TimeRestriction): boolean {
    switch (restriction.type) {
      case 'BUSINESS_HOURS':
        const hour = currentTime.getHours();
        const startHour = parseInt(restriction.startTime?.split(':')[0] || '9');
        const endHour = parseInt(restriction.endTime?.split(':')[0] || '17');
        return hour >= startHour && hour < endHour;

      case 'SPECIFIC_HOURS':
        // Implementation for specific hour restrictions
        return true;

      case 'DATE_RANGE':
        if (restriction.startDate && currentTime < restriction.startDate) return false;
        if (restriction.endDate && currentTime > restriction.endDate) return false;
        return true;

      case 'DAY_OF_WEEK':
        const dayOfWeek = currentTime.getDay();
        return restriction.daysOfWeek?.includes(dayOfWeek) ?? true;

      default:
        return true;
    }
  }

  private getNextAllowedTime(restriction: TimeRestriction): Date {
    // Implementation to calculate next allowed time
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }

  private async calculateRiskScore(
    user: EnhancedUser,
    riskAssessment: RiskAssessment,
    context: PermissionContext
  ): Promise<number> {
    let totalScore = 0;

    for (const factor of riskAssessment.factors) {
      const factorScore = await this.calculateRiskFactor(factor, user, context);
      totalScore += factorScore * factor.weight;
    }

    return Math.min(totalScore * 100, 100); // Cap at 100
  }

  private async calculateRiskFactor(factor: any, user: EnhancedUser, context: PermissionContext): Promise<number> {
    // Risk factor calculation implementation
    switch (factor.type) {
      case 'AMOUNT':
        const amount = context.amount || 0;
        return amount > (factor.threshold || 0) ? 1 : 0;
      case 'FREQUENCY':
        // Would check recent activity frequency
        return 0;
      case 'TIME':
        const hour = (context.timestamp || new Date()).getHours();
        return (hour < 6 || hour > 22) ? 0.8 : 0;
      case 'LOCATION':
        // Would check if location is unusual for user
        return 0;
      default:
        return 0;
    }
  }

  private getRiskMitigations(riskAssessment: RiskAssessment): string[] {
    const mitigations: string[] = [];

    if (riskAssessment.requiresSecondaryAuth) {
      mitigations.push('Two-factor authentication required');
    }

    if (riskAssessment.requiresApproval) {
      mitigations.push('Manager approval required');
    }

    if (riskAssessment.level === 'CRITICAL') {
      mitigations.push('Enhanced audit logging enabled');
    }

    return mitigations;
  }

  private getPermissionSuggestions(permissions: string[]): string[] {
    return permissions.map(p => `Contact your administrator to request: ${p}`);
  }
}