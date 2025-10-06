/**
 * Core types for the Enterprise Permission System
 */

import type { User, Role, Permission, Resource, Organization } from '@prisma/client';

// Enhanced user type with permission context
export interface EnhancedUser extends User {
  roles: (Role & {
    rolePermissions: Array<{
      permission: Permission;
      conditions?: any;
      expiresAt?: Date | null;
    }>;
  })[];
  userPermissions: Array<{
    permission: Permission;
    resource?: Resource | null;
    conditions?: any;
    expiresAt?: Date | null;
  }>;
  organization: Organization;
  computedPermissions?: string[];
  effectiveRole?: string;
  sessionPermissions?: string[];
}

// Permission context for authorization decisions
export interface PermissionContext {
  userId?: string;
  organizationId?: string;
  resourceId?: string;
  resourceType?: string;
  resourceOwner?: string;
  action?: string;
  userRole?: string;
  userHierarchy?: number;
  location?: string;
  ipAddress?: string;
  deviceInfo?: any;
  timestamp?: Date;
  amount?: number;
  sensitiveOperation?: boolean;
  requiresApproval?: boolean;
  emergencyAccess?: boolean;
  sessionId?: string;
  additionalContext?: Record<string, any>;
}

// Permission check result with detailed feedback
export interface PermissionResult {
  granted: boolean;
  reason?: string;
  suggestions?: string[];
  requiredPermissions?: string[];
  missingPermissions?: string[];
  conditionalGrant?: {
    conditions: any;
    expiresAt?: Date;
    requiresApproval?: boolean;
    approvers?: string[];
  };
  riskAssessment?: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: string[];
    mitigations?: string[];
  };
  auditInfo?: {
    logRequired: boolean;
    metadata: any;
  };
}

// Permission rule for complex authorization logic
export interface PermissionRule {
  name: string;
  description?: string;
  permissions: string[];
  requireAll: boolean;
  context?: PermissionContext;
  conditions?: PermissionCondition[];
  hierarchyCheck?: boolean;
  resourceCheck?: boolean;
  timeRestrictions?: TimeRestriction[];
  locationRestrictions?: string[];
  additionalValidators?: Array<(user: EnhancedUser, context: PermissionContext) => Promise<boolean>>;
  riskAssessment?: RiskAssessment;
  approvalRequired?: ApprovalRequirement;
}

// Conditional permission logic
export interface PermissionCondition {
  type: 'AMOUNT_LIMIT' | 'TIME_WINDOW' | 'LOCATION' | 'RESOURCE_STATE' | 'USER_ATTRIBUTE' | 'CUSTOM';
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'REGEX';
  field: string;
  value: any;
  description?: string;
}

// Time-based restrictions
export interface TimeRestriction {
  type: 'BUSINESS_HOURS' | 'SPECIFIC_HOURS' | 'DATE_RANGE' | 'DAY_OF_WEEK';
  startTime?: string;
  endTime?: string;
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[];
  timezone?: string;
}

// Risk assessment configuration
export interface RiskAssessment {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  automaticDeny?: boolean;
  requiresSecondaryAuth?: boolean;
  requiresApproval?: boolean;
  auditLevel: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
}

export interface RiskFactor {
  type: 'AMOUNT' | 'FREQUENCY' | 'TIME' | 'LOCATION' | 'DEVICE' | 'BEHAVIOR' | 'RESOURCE_SENSITIVITY';
  weight: number;
  threshold?: any;
  description: string;
}

// Approval workflow configuration
export interface ApprovalRequirement {
  required: boolean;
  approverRoles: string[];
  requiredApprovers?: number;
  escalationChain?: ApprovalEscalation[];
  timeLimit?: number; // hours
  autoApproveConditions?: PermissionCondition[];
  autoDenyConditions?: PermissionCondition[];
}

export interface ApprovalEscalation {
  level: number;
  roles: string[];
  escalateAfter: number; // hours
  autoApprove?: boolean;
}

// Resource access control
export interface ResourcePermission {
  resourceType: string;
  resourceId: string;
  permissionType: 'READ' | 'WRITE' | 'DELETE' | 'ADMIN' | 'CUSTOM';
  grantType: 'DIRECT' | 'INHERITED' | 'ROLE_BASED';
  conditions?: PermissionCondition[];
  expiresAt?: Date;
  metadata?: any;
}

// Session management
export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  deviceInfo?: any;
  ipAddress?: string;
  location?: string;
  permissionsSnapshot: string[];
  createdAt: Date;
  lastActivity: Date;
  expiresAt?: Date;
  isActive: boolean;
  riskScore?: number;
}

// Temporary permission elevation
export interface PermissionElevation {
  userId: string;
  permissions: string[];
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  expiresAt: Date;
  context?: PermissionContext;
  auditTrail: ElevationAuditEntry[];
}

export interface ElevationAuditEntry {
  timestamp: Date;
  action: 'REQUESTED' | 'APPROVED' | 'DENIED' | 'USED' | 'REVOKED' | 'EXPIRED';
  userId: string;
  details?: any;
}

// Emergency access controls
export interface EmergencyAccess {
  id: string;
  userId: string;
  reason: string;
  permissions: string[];
  activatedAt: Date;
  expiresAt: Date;
  approvedBy?: string;
  reviewRequired: boolean;
  metadata?: any;
}

// Audit log entry
export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  permissionContext?: PermissionContext;
  result: 'GRANTED' | 'DENIED' | 'ERROR';
  riskAssessment?: string;
  approvalChain?: string[];
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

// Configuration for the permission system
export interface PermissionConfig {
  // Security settings
  enableRiskAssessment: boolean;
  enableApprovalWorkflows: boolean;
  enableEmergencyAccess: boolean;
  enableSessionManagement: boolean;

  // Audit settings
  auditLevel: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
  auditRetentionDays: number;

  // Session settings
  maxConcurrentSessions: number;
  sessionTimeoutMinutes: number;
  extendSessionOnActivity: boolean;

  // Performance settings
  cachePermissions: boolean;
  cacheTTLMinutes: number;

  // Security thresholds
  maxFailedPermissionChecks: number;
  riskScoreThreshold: number;

  // Default values
  defaultRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  defaultApprovalTimeout: number;
  defaultPermissionExpiry: number;
}

// Permission manager interface
export interface IPermissionManager {
  // Core permission checking
  hasPermission(user: EnhancedUser, permission: string, context?: PermissionContext): Promise<PermissionResult>;
  hasAnyPermission(user: EnhancedUser, permissions: string[], context?: PermissionContext): Promise<PermissionResult>;
  hasAllPermissions(user: EnhancedUser, permissions: string[], context?: PermissionContext): Promise<PermissionResult>;

  // Rule-based checking
  validateRule(user: EnhancedUser, rule: PermissionRule, context?: PermissionContext): Promise<PermissionResult>;

  // Resource access
  canAccessResource(user: EnhancedUser, resourceType: string, resourceId: string, action: string, context?: PermissionContext): Promise<PermissionResult>;

  // Role management
  getUserRoles(userId: string): Promise<Role[]>;
  assignRole(userId: string, roleId: string, grantedBy: string, conditions?: any): Promise<boolean>;
  revokeRole(userId: string, roleId: string, revokedBy: string, reason?: string): Promise<boolean>;

  // Permission management
  grantPermission(userId: string, permission: string, grantedBy: string, conditions?: any): Promise<boolean>;
  revokePermission(userId: string, permission: string, revokedBy: string, reason?: string): Promise<boolean>;

  // Session management
  createSession(user: EnhancedUser, deviceInfo?: any): Promise<UserSession>;
  validateSession(sessionToken: string): Promise<UserSession | null>;
  revokeSession(sessionId: string, revokedBy?: string): Promise<boolean>;

  // Emergency access
  requestEmergencyAccess(userId: string, permissions: string[], reason: string): Promise<string>;
  approveEmergencyAccess(requestId: string, approvedBy: string): Promise<boolean>;
  revokeEmergencyAccess(accessId: string, revokedBy: string): Promise<boolean>;

  // Audit and compliance
  auditPermissionCheck(result: PermissionResult, context: PermissionContext): Promise<void>;
  getAuditLogs(filters: any): Promise<AuditEntry[]>;

  // System management
  refreshPermissions(userId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<number>;
  generateComplianceReport(organizationId: string, dateRange: { start: Date; end: Date }): Promise<any>;
}

// Hook return types
export interface UsePermissionsReturn {
  hasPermission: (permission: string, context?: PermissionContext) => Promise<boolean>;
  hasAnyPermission: (permissions: string[], context?: PermissionContext) => Promise<boolean>;
  hasAllPermissions: (permissions: string[], context?: PermissionContext) => Promise<boolean>;
  validateRule: (rule: PermissionRule, context?: PermissionContext) => Promise<PermissionResult>;
  isLoading: boolean;
  error: Error | null;
  refreshPermissions: () => Promise<void>;
}

export interface UseRolesReturn {
  roles: Role[];
  effectiveRole: string | null;
  isLoading: boolean;
  error: Error | null;
  hasRole: (roleCode: string) => boolean;
  getRoleHierarchy: () => number;
}

export interface UseResourceAccessReturn {
  canAccess: (resourceType: string, resourceId: string, action: string) => Promise<boolean>;
  getResourcePermissions: (resourceType: string, resourceId: string) => Promise<ResourcePermission[]>;
  isLoading: boolean;
  error: Error | null;
}

// Component prop types
export interface PermissionGateProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  rule?: PermissionRule;
  context?: PermissionContext;
  fallback?: React.ReactNode;
  onDenied?: (result: PermissionResult) => void;
  children: React.ReactNode;
}

export interface RoleGateProps {
  role?: string;
  roles?: string[];
  requireAll?: boolean;
  minimumHierarchy?: number;
  fallback?: React.ReactNode;
  onDenied?: () => void;
  children: React.ReactNode;
}

export interface ResourceGateProps {
  resourceType: string;
  resourceId: string;
  action: string;
  context?: PermissionContext;
  fallback?: React.ReactNode;
  onDenied?: (result: PermissionResult) => void;
  children: React.ReactNode;
}