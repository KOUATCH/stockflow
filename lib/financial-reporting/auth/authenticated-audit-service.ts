// =============================================================================
// AUTHENTICATED AUDIT TRAIL SERVICE
// Integration of audit trails with user authentication and authorization
// =============================================================================

"use server";

import { db } from '@/prisma/db';
import { getSession } from '@/lib/session-auth';
import { createAuditEntry } from '@/actions/financial-reporting/audit/audit-trail-service';
import { createFinancialNotification } from '@/lib/financial-reporting/notifications/financial-notification-service';
import { FINANCIAL_PERMISSIONS } from '../../permissions/financial-permissions';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface AuthenticatedAuditEntry {
  userId: string;
  organizationId: string;
  sessionId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;

  // Authentication context
  userEmail: string;
  userRoles: string[];
  userPermissions: FinancialPermission[];

  // Security assessment
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresReview: boolean;
  complianceFlags: string[];
}

export interface SecurityEvent {
  eventType: 'DATA_ACCESS' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY' | 'COMPLIANCE_VIOLATION';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  userId?: string;
  organizationId: string;
  description: string;
  details: Record<string, any>;
  timestamp: Date;
  requiresInvestigation: boolean;
}

export interface FinancialAccessContext {
  userId: string;
  organizationId: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export type FinancialPermission =
  | 'VIEW_FINANCIAL_DASHBOARD'
  | 'VIEW_INCOME_STATEMENT'
  | 'VIEW_BALANCE_SHEET'
  | 'VIEW_CASH_FLOW_STATEMENT'
  | 'VIEW_GENERAL_LEDGER'
  | 'VIEW_JOURNAL_ENTRIES'
  | 'VIEW_CHART_OF_ACCOUNTS'
  | 'VIEW_FINANCIAL_RATIOS'
  | 'VIEW_BUDGETS'
  | 'VIEW_FINANCIAL_AUDIT_TRAIL'
  | 'MANAGE_FINANCIAL_PERIODS'
  | 'VIEW_CASH_MANAGEMENT'
  | 'CREATE_JOURNAL_ENTRIES'
  | 'APPROVE_JOURNAL_ENTRIES'
  | 'POST_JOURNAL_ENTRIES'
  | 'REVERSE_JOURNAL_ENTRIES'
  | 'MANAGE_CHART_OF_ACCOUNTS'
  | 'CREATE_FINANCIAL_BUDGETS'
  | 'APPROVE_FINANCIAL_BUDGETS'
  | 'MANAGE_COMPLIANCE_REQUIREMENTS'
  | 'EXPORT_FINANCIAL_DATA'
  | 'IMPORT_FINANCIAL_DATA'
  | 'VIEW_SENSITIVE_FINANCIAL_DATA'
  | 'APPROVE_FINANCIAL_STATEMENTS'
  | 'CERTIFY_COMPLIANCE';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function calculateRiskLevel(action: string, resource: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const criticalActions = [
    'APPROVE_FINANCIAL_STATEMENTS',
    'CERTIFY_COMPLIANCE',
    'DELETE_JOURNAL_ENTRIES',
    'AUTHORIZE_CASH_TRANSFERS'
  ];

  const highActions = [
    'POST_JOURNAL_ENTRIES',
    'CREATE_JOURNAL_ENTRIES',
    'UPDATE_FINANCIAL_STATEMENTS',
    'MANAGE_COMPLIANCE_REQUIREMENTS'
  ];

  const sensitiveResources = [
    'CASH_FLOW_STATEMENT',
    'BALANCE_SHEET',
    'INCOME_STATEMENT',
    'AUDIT_TRAIL'
  ];

  if (criticalActions.includes(action)) return 'CRITICAL';
  if (highActions.includes(action)) return 'HIGH';
  if (sensitiveResources.includes(resource)) return 'MEDIUM';

  return 'LOW';
}

function getComplianceFlags(action: string, resource: string): string[] {
  const flags: string[] = [];

  // SOX compliance flags
  if (['APPROVE_FINANCIAL_STATEMENTS', 'CERTIFY_COMPLIANCE'].includes(action)) {
    flags.push('SOX_404');
  }

  // Audit trail flags
  if (resource === 'AUDIT_TRAIL') {
    flags.push('AUDIT_RETENTION');
  }

  // Financial statement flags
  if (['INCOME_STATEMENT', 'BALANCE_SHEET', 'CASH_FLOW_STATEMENT'].includes(resource)) {
    flags.push('FINANCIAL_REPORTING');
  }

  return flags;
}

function getChangedFields(oldValues?: Record<string, any>, newValues?: Record<string, any>): string[] {
  if (!oldValues || !newValues) return [];

  const changedFields: string[] = [];
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  for (const key of allKeys) {
    if (oldValues[key] !== newValues[key]) {
      changedFields.push(key);
    }
  }

  return changedFields;
}

async function getUserWithPermissions(userId: string) {
  try {
    return await db.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to get user with permissions:', error);
    return null;
  }
}

async function getUserFinancialPermissions(userId: string): Promise<FinancialPermission[]> {
  try {
    const user = await getUserWithPermissions(userId);
    if (!user) return [];

    const permissions = new Set<FinancialPermission>();

    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        if (Object.values(FINANCIAL_PERMISSIONS).includes(permission.name as FinancialPermission)) {
          permissions.add(permission.name as FinancialPermission);
        }
      });
    });

    return Array.from(permissions);
  } catch (error) {
    console.error('Failed to get user financial permissions:', error);
    return [];
  }
}

async function storeAuthenticatedAuditEntry(entry: AuthenticatedAuditEntry): Promise<string> {
  try {
    const auditEntry = await db.auditTrail.create({
      data: {
        userId: entry.userId,
        organizationId: entry.organizationId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        description: entry.description,
        metadata: {
          ...entry.metadata,
          authentication: {
            userEmail: entry.userEmail,
            userRoles: entry.userRoles,
            userPermissions: entry.userPermissions,
            sessionId: entry.sessionId
          },
          security: {
            riskLevel: entry.riskLevel,
            requiresReview: entry.requiresReview,
            complianceFlags: entry.complianceFlags,
            ipAddress: entry.ipAddress,
            userAgent: entry.userAgent
          }
        },
        timestamp: entry.timestamp || new Date()
      }
    });

    return auditEntry.id;
  } catch (error) {
    console.error('Failed to store authenticated audit entry:', error);
    throw error;
  }
}

async function updateUserActivity(entry: AuthenticatedAuditEntry): Promise<void> {
  try {
    const sessionId = entry.sessionId || 'unknown';

    // Get or create user activity record
    const activity = await db.userActivity.upsert({
      where: {
        userId_organizationId_sessionId: {
          userId: entry.userId,
          organizationId: entry.organizationId,
          sessionId
        }
      },
      update: {
        endTime: new Date(),
        activitiesCount: {
          increment: 1
        },
        resources: {
          push: entry.resource
        },
        suspiciousActivities: entry.riskLevel === 'CRITICAL' ? {
          increment: 1
        } : undefined,
        riskScore: entry.riskLevel === 'CRITICAL' ? {
          increment: 10
        } : entry.riskLevel === 'HIGH' ? {
          increment: 5
        } : undefined
      },
      create: {
        userId: entry.userId,
        organizationId: entry.organizationId,
        sessionId,
        startTime: new Date(),
        ipAddress: entry.ipAddress || 'unknown',
        userAgent: entry.userAgent || 'unknown',
        activitiesCount: 1,
        resources: [entry.resource],
        suspiciousActivities: entry.riskLevel === 'CRITICAL' ? 1 : 0,
        riskScore: entry.riskLevel === 'CRITICAL' ? 10 : entry.riskLevel === 'HIGH' ? 5 : 0
      }
    });

    // Check for suspicious activity patterns
    if (activity.riskScore > 50) {
      await createSecurityEvent({
        eventType: 'SUSPICIOUS_ACTIVITY',
        severity: 'ERROR',
        userId: entry.userId,
        organizationId: entry.organizationId,
        description: `Suspicious activity detected: Risk score ${activity.riskScore}`,
        details: {
          activitiesCount: activity.activitiesCount,
          suspiciousActivities: activity.suspiciousActivities,
          riskScore: activity.riskScore,
          resources: activity.resources
        },
        timestamp: new Date(),
        requiresInvestigation: true
      });
    }
  } catch (error) {
    console.error('Failed to update user activity:', error);
  }
}

async function sendSecurityAlert(eventId: string, event: SecurityEvent): Promise<void> {
  // TODO: Implement security alert system (email, SMS, etc.)
  console.warn('CRITICAL SECURITY EVENT:', {
    eventId,
    eventType: event.eventType,
    description: event.description,
    userId: event.userId,
    organizationId: event.organizationId
  });
}

// =============================================================================
// EXPORTED SERVER FUNCTIONS
// =============================================================================

/**
 * Create audit entry with full authentication context
 */
export async function createAuthenticatedAuditEntry(
  entry: Omit<AuthenticatedAuditEntry, 'timestamp' | 'userEmail' | 'userRoles' | 'userPermissions'>
): Promise<string> {
  try {
    // Get current session and user context
    const session = await getSession();
    const user = session?.user;

    if (!user) {
      throw new Error('No authenticated user found for audit entry');
    }

    // Get user details with roles and permissions
    const userWithPermissions = await getUserWithPermissions(entry.userId);

    // Determine risk level
    const riskLevel = calculateRiskLevel(entry.action, entry.resource);

    // Enhanced audit entry with authentication context
    const enhancedEntry: AuthenticatedAuditEntry = {
      ...entry,
      timestamp: new Date(),
      userEmail: user.email,
      userRoles: userWithPermissions?.roles.map(r => r.name) || [],
      userPermissions: await getUserFinancialPermissions(entry.userId),
      riskLevel,
      requiresReview: riskLevel === 'HIGH' || riskLevel === 'CRITICAL',
      complianceFlags: getComplianceFlags(entry.action, entry.resource)
    };

    // Store in database
    const auditId = await storeAuthenticatedAuditEntry(enhancedEntry);

    // Create security event if high risk
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      await createSecurityEvent({
        eventType: 'DATA_ACCESS',
        severity: riskLevel === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        userId: entry.userId,
        organizationId: entry.organizationId,
        description: `High-risk financial operation: ${entry.action}`,
        details: {
          resource: entry.resource,
          resourceId: entry.resourceId,
          action: entry.action,
          riskLevel
        },
        timestamp: new Date(),
        requiresInvestigation: riskLevel === 'CRITICAL'
      });
    }

    // Update user activity tracking
    await updateUserActivity(enhancedEntry);

    return auditId;

  } catch (error) {
    console.error('Failed to create authenticated audit entry:', error);

    // Fallback to basic audit entry
    return await createAuditEntry({
      userId: entry.userId,
      organizationId: entry.organizationId,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      description: `${entry.description} (FALLBACK MODE)`,
      metadata: {
        ...entry.metadata,
        authenticationError: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

/**
 * Create audit entry for permission check
 */
export async function auditPermissionCheck(
  context: FinancialAccessContext,
  permission: FinancialPermission,
  granted: boolean,
  resource?: string
): Promise<void> {
  await createAuthenticatedAuditEntry({
    userId: context.userId,
    organizationId: context.organizationId,
    sessionId: context.sessionId,
    action: 'PERMISSION_CHECK',
    resource: resource || 'FINANCIAL_SYSTEM',
    description: `Permission check for ${permission}: ${granted ? 'GRANTED' : 'DENIED'}`,
    metadata: {
      permission,
      granted,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    },
    ipAddress: context.ipAddress,
    userAgent: context.userAgent
  });

  // Create security event for denied permissions
  if (!granted) {
    await createSecurityEvent({
      eventType: 'PERMISSION_DENIED',
      severity: 'WARNING',
      userId: context.userId,
      organizationId: context.organizationId,
      description: `Permission denied: ${permission}`,
      details: {
        permission,
        resource,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      },
      timestamp: new Date(),
      requiresInvestigation: false
    });
  }
}

/**
 * Create audit entry for resource access
 */
export async function auditResourceAccess(
  context: FinancialAccessContext,
  resource: string,
  action: string,
  resourceId?: string,
  granted?: boolean,
  metadata?: Record<string, any>
): Promise<void> {
  const riskLevel = calculateRiskLevel(action, resource);

  await createAuthenticatedAuditEntry({
    userId: context.userId,
    organizationId: context.organizationId,
    sessionId: context.sessionId,
    action,
    resource,
    resourceId,
    description: `Resource access: ${action} on ${resource}${resourceId ? ` (${resourceId})` : ''}`,
    metadata: {
      granted,
      riskLevel,
      ...metadata
    },
    ipAddress: context.ipAddress,
    userAgent: context.userAgent
  });
}

/**
 * Create audit entry for data modification
 */
export async function auditDataModification(
  context: FinancialAccessContext,
  tableName: string,
  recordId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>
): Promise<void> {
  const changedFields = getChangedFields(oldValues, newValues);

  await createAuthenticatedAuditEntry({
    userId: context.userId,
    organizationId: context.organizationId,
    sessionId: context.sessionId,
    action: `DATA_${action}`,
    resource: tableName,
    resourceId: recordId,
    description: `Data ${action.toLowerCase()}: ${tableName} record ${recordId}`,
    metadata: {
      tableName,
      recordId,
      action,
      oldValues,
      newValues,
      changedFields,
      changeCount: changedFields.length
    },
    ipAddress: context.ipAddress,
    userAgent: context.userAgent
  });
}

/**
 * Create security event
 */
export async function createSecurityEvent(event: SecurityEvent): Promise<string> {
  try {
    const securityEvent = await db.securityEvent.create({
      data: {
        eventType: event.eventType,
        severity: event.severity,
        userId: event.userId,
        organizationId: event.organizationId,
        description: event.description,
        details: event.details,
        timestamp: event.timestamp,
        requiresInvestigation: event.requiresInvestigation
      }
    });

    // Send alerts for critical events
    if (event.severity === 'CRITICAL') {
      await sendSecurityAlert(securityEvent.id, event);

      // Also create a notification for immediate attention
      createFinancialNotification(
        'error',
        'Critical Security Event',
        `${event.description} - Immediate attention required.`
      );
    } else if (event.severity === 'ERROR') {
      createFinancialNotification(
        'warning',
        'Security Alert',
        event.description
      );
    }

    return securityEvent.id;
  } catch (error) {
    console.error('Failed to create security event:', error);
    throw error;
  }
}

/**
 * Get security events for investigation
 */
export async function getSecurityEventsForInvestigation(organizationId: string): Promise<SecurityEvent[]> {
  try {
    const events = await db.securityEvent.findMany({
      where: {
        organizationId,
        requiresInvestigation: true,
        investigatedAt: null
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    });

    return events.map(event => ({
      eventType: event.eventType as SecurityEvent['eventType'],
      severity: event.severity as SecurityEvent['severity'],
      userId: event.userId || undefined,
      organizationId: event.organizationId,
      description: event.description,
      details: event.details as Record<string, any>,
      timestamp: event.timestamp,
      requiresInvestigation: event.requiresInvestigation
    }));
  } catch (error) {
    console.error('Failed to get security events:', error);
    return [];
  }
}