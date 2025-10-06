/**
 * Enterprise Permission System for StockFlow
 *
 * A comprehensive, scalable, and secure Role-Based Access Control (RBAC) system
 * with support for:
 * - Hierarchical roles and permissions
 * - Resource-level access control
 * - Context-aware authorization
 * - Temporary permission elevation
 * - Approval workflows
 * - Comprehensive audit logging
 * - Session management
 * - Emergency access controls
 */

export * from './types';
export * from './permissions';
export * from './roles';
export * from './validator';
export * from './middleware';
export * from './hooks';
export * from './utils';
export * from './audit';
export * from './session';
export * from './resource';
export * from './approval';

// Main exports for easy consumption
export { PermissionManager } from './manager';
export { EnterpriseAuthProvider } from './provider';
export { usePermissions, useRoles, useResourceAccess } from './hooks';
export { withPermission, requiresPermission, hasPermission } from './guards';
export { PermissionGate, RoleGate, ResourceGate } from './components';