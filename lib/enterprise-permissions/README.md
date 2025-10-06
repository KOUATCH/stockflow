# Enterprise Permission System for StockFlow

A comprehensive, scalable, and secure Role-Based Access Control (RBAC) system designed for enterprise-level applications.

## Features

- ✅ **Hierarchical Roles & Permissions** - Multi-level role inheritance with fine-grained permission control
- ✅ **Resource-Level Security** - Control access to specific resources and records
- ✅ **Context-Aware Authorization** - Time, location, and condition-based access control
- ✅ **Risk Assessment** - Automated risk scoring and mitigation strategies
- ✅ **Approval Workflows** - Multi-stage approval processes for sensitive operations
- ✅ **Comprehensive Audit Trail** - Full activity logging and compliance reporting
- ✅ **Session Management** - Advanced session tracking and security controls
- ✅ **Emergency Access Controls** - Break-glass procedures for critical situations
- ✅ **React Integration** - Declarative permission components and hooks

## Quick Start

### 1. Database Migration

First, run the database migration to add the enterprise permission tables:

```bash
# Apply the enterprise permissions migration
psql -d your_database -f prisma/migrations/add_enterprise_permissions.sql

# Generate Prisma client
npx prisma generate
```

### 2. Basic Usage in API Routes

```typescript
import { withPermission } from '@/lib/enterprise-permissions/middleware';
import { SYSTEM_PERMISSIONS } from '@/lib/enterprise-permissions/permissions';

// Protect API route with single permission
export const GET = withPermission(
  SYSTEM_PERMISSIONS.READ_USERS
)(async (req, context) => {
  // Your protected route logic here
  return NextResponse.json({ users: [] });
});

// Protect with multiple permissions (require ANY)
export const POST = withPermission(
  [SYSTEM_PERMISSIONS.CREATE_USERS, SYSTEM_PERMISSIONS.MANAGE_USERS],
  { requireAll: false }
)(async (req, context) => {
  // User needs either CREATE_USERS OR MANAGE_USERS
  return NextResponse.json({ success: true });
});

// Advanced permission rule
export const DELETE = withPermission({
  name: 'Delete User with Approval',
  permissions: [SYSTEM_PERMISSIONS.DELETE_USERS],
  requireAll: true,
  hierarchyCheck: true,
  riskAssessment: {
    level: 'HIGH',
    factors: [{ type: 'RESOURCE_SENSITIVITY', weight: 1.0, description: 'User deletion' }],
    requiresApproval: true,
    auditLevel: 'COMPREHENSIVE'
  }
})(async (req, context) => {
  // High-risk operation with approval workflow
  return NextResponse.json({ success: true });
});
```

### 3. React Components

```tsx
import {
  PermissionGate,
  RoleGate,
  ResourceGate,
  PermissionButton
} from '@/lib/enterprise-permissions/components';
import { SYSTEM_PERMISSIONS } from '@/lib/enterprise-permissions/permissions';

function UserManagementPage() {
  return (
    <div>
      {/* Show content only if user has permission */}
      <PermissionGate permission={SYSTEM_PERMISSIONS.READ_USERS}>
        <UsersList />
      </PermissionGate>

      {/* Show content based on role */}
      <RoleGate role="administrator">
        <AdminPanel />
      </RoleGate>

      {/* Resource-specific access */}
      <ResourceGate
        resourceType="user"
        resourceId="user-123"
        action="update"
      >
        <EditUserForm />
      </ResourceGate>

      {/* Permission-aware button */}
      <PermissionButton
        permission={SYSTEM_PERMISSIONS.CREATE_USERS}
        onClick={handleCreateUser}
      >
        Create User
      </PermissionButton>
    </div>
  );
}
```

### 4. React Hooks

```tsx
import {
  usePermissions,
  useRoles,
  useResourceAccess
} from '@/lib/enterprise-permissions/hooks';

function MyComponent() {
  const { hasPermission, hasAnyPermission, isLoading } = usePermissions();
  const { roles, effectiveRole, hasRole } = useRoles();
  const { canAccess } = useResourceAccess();

  const handleAction = async () => {
    // Check permission before action
    const canDelete = await hasPermission(SYSTEM_PERMISSIONS.DELETE_USERS);
    if (!canDelete) {
      alert('Permission denied');
      return;
    }

    // Check resource access
    const canAccessUser = await canAccess('user', 'user-123', 'delete');
    if (!canAccessUser) {
      alert('Cannot access this user');
      return;
    }

    // Perform action
    await deleteUser();
  };

  if (isLoading) return <div>Loading permissions...</div>;

  return (
    <div>
      <p>Your role: {effectiveRole}</p>
      <p>Is Admin: {hasRole('administrator') ? 'Yes' : 'No'}</p>
      <button onClick={handleAction}>Delete User</button>
    </div>
  );
}
```

### 5. Server Actions

```typescript
import { requiresPermission } from '@/lib/enterprise-permissions/middleware';
import { SYSTEM_PERMISSIONS } from '@/lib/enterprise-permissions/permissions';

// Protect server action
export const createUser = requiresPermission(
  SYSTEM_PERMISSIONS.CREATE_USERS
)(async (userData: CreateUserData) => {
  // Protected server action logic
  const user = await prisma.user.create({ data: userData });
  return user;
});

// Advanced protection with context
export const deleteUser = requiresPermission(
  SYSTEM_PERMISSIONS.DELETE_USERS,
  {
    context: {
      sensitiveOperation: true,
      resourceType: 'user'
    }
  }
)(async (userId: string) => {
  // High-risk operation with enhanced logging
  await prisma.user.delete({ where: { id: userId } });
});
```

## Permission System Architecture

### Permission Hierarchy

```
PLATFORM_ADMIN (Level 1)
  └── ORGANIZATION_ADMIN (Level 2)
      └── MANAGER (Level 3)
          └── SUPERVISOR (Level 4)
              └── EMPLOYEE (Level 5)
                  └── CASHIER (Level 6)
                      └── VIEWER (Level 7)
```

### Permission Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **System** | Platform administration | `PLATFORM_ADMIN`, `MANAGE_ORGANIZATIONS` |
| **Organization** | Organization management | `MANAGE_ORGANIZATION`, `VIEW_ORGANIZATION_SETTINGS` |
| **User Management** | User and role administration | `CREATE_USERS`, `ASSIGN_ROLES`, `MANAGE_PERMISSIONS` |
| **Inventory** | Product and stock management | `CREATE_ITEMS`, `MANAGE_INVENTORY_LEVELS`, `ADJUST_INVENTORY` |
| **Sales** | Sales operations | `PROCESS_SALES`, `APPLY_DISCOUNTS`, `OVERRIDE_PRICES` |
| **Financial** | Financial operations | `VIEW_FINANCIAL_REPORTS`, `PROCESS_PAYMENTS_ABOVE_LIMIT` |
| **POS** | Point of sale operations | `OPERATE_POS`, `MANAGE_CASH_DRAWER`, `PROCESS_PAYMENTS` |

### Risk Assessment Levels

- **LOW** - Standard operations with basic audit logging
- **MEDIUM** - Enhanced monitoring and optional approval
- **HIGH** - Requires approval and comprehensive audit trail
- **CRITICAL** - Emergency access only with mandatory review

## Advanced Features

### 1. Conditional Permissions

```typescript
const conditionalRule: PermissionRule = {
  name: 'Large Purchase Approval',
  permissions: [SYSTEM_PERMISSIONS.APPROVE_PURCHASE_ORDERS],
  requireAll: true,
  conditions: [
    {
      type: 'AMOUNT_LIMIT',
      operator: 'GREATER_THAN',
      field: 'amount',
      value: 10000,
      description: 'Purchases over $10,000 require special approval'
    }
  ],
  approvalRequired: {
    required: true,
    approverRoles: ['administrator', 'financial_manager'],
    timeLimit: 24
  }
};
```

### 2. Time-Based Restrictions

```typescript
const timeRestrictedRule: PermissionRule = {
  name: 'After Hours Access',
  permissions: [SYSTEM_PERMISSIONS.PROCESS_SALES],
  requireAll: true,
  timeRestrictions: [
    {
      type: 'BUSINESS_HOURS',
      startTime: '18:00',
      endTime: '08:00'
    }
  ],
  riskAssessment: {
    level: 'MEDIUM',
    factors: [{ type: 'TIME', weight: 0.5, description: 'After hours activity' }]
  }
};
```

### 3. Resource Ownership

```typescript
// Grant resource-specific permission
await permissionManager.grantResourcePermission(
  'purchase_order',    // resourceType
  'po-12345',         // resourceId
  'user-456',         // userId
  'update',           // permissionType
  'manager-789',      // grantedBy
  {
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
);

// Check resource access
const canEdit = await permissionManager.canAccessResource(
  user,
  'purchase_order',
  'po-12345',
  'update'
);
```

### 4. Emergency Access

```typescript
// Request emergency access
const requestId = await permissionManager.requestEmergencyAccess(
  'user-123',
  [SYSTEM_PERMISSIONS.EMERGENCY_SYSTEM_ACCESS],
  'System outage - need to restore service'
);

// Approve emergency access
await permissionManager.approveEmergencyAccess(requestId, 'admin-456');
```

## Security Best Practices

### 1. Principle of Least Privilege
- Grant users only the minimum permissions needed
- Use time-limited permissions for temporary access
- Regular permission audits and cleanup

### 2. Defense in Depth
- Multiple permission checks (role + resource + context)
- Risk assessment for sensitive operations
- Comprehensive audit logging

### 3. Approval Workflows
- Multi-stage approval for high-risk operations
- Segregation of duties
- Time-limited approvals with automatic expiry

### 4. Session Security
- Session tracking and monitoring
- Concurrent session limits
- Automatic session revocation on suspicious activity

## API Reference

### Core Classes

#### PermissionManager
Main class for all permission operations.

```typescript
const manager = new PermissionManager(prisma, config);

// Permission checking
await manager.hasPermission(user, permission, context);
await manager.hasAnyPermission(user, permissions, context);
await manager.hasAllPermissions(user, permissions, context);
await manager.validateRule(user, rule, context);

// Resource access
await manager.canAccessResource(user, resourceType, resourceId, action, context);

// Role management
await manager.assignRole(userId, roleId, grantedBy);
await manager.revokeRole(userId, roleId, revokedBy);

// Session management
await manager.createSession(user, deviceInfo);
await manager.validateSession(sessionToken);
await manager.revokeSession(sessionId, revokedBy);
```

#### PermissionValidator
Advanced validation with context awareness.

```typescript
const validator = new PermissionValidator(config);
const result = await validator.validateRule(user, rule, context);
```

#### ResourceAccessManager
Resource-level permission management.

```typescript
const resourceManager = new ResourceAccessManager(prisma, config);

await resourceManager.grantResourcePermission(
  resourceType, resourceId, userId, permissionType, grantedBy
);

await resourceManager.transferResourceOwnership(
  resourceType, resourceId, newOwnerId, transferredBy
);
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/permissions/check` | POST | Check single permission |
| `/api/permissions/check-multiple` | POST | Check multiple permissions |
| `/api/permissions/validate-rule` | POST | Validate permission rule |
| `/api/permissions/check-resource` | POST | Check resource access |
| `/api/permissions/user-permissions` | GET | Get user permissions |
| `/api/permissions/user-roles` | GET | Get user roles |
| `/api/permissions/refresh` | POST | Refresh permission cache |

### React Components

| Component | Purpose |
|-----------|---------|
| `PermissionGate` | Conditional rendering based on permissions |
| `RoleGate` | Conditional rendering based on roles |
| `ResourceGate` | Conditional rendering based on resource access |
| `PermissionButton` | Permission-aware button component |
| `PermissionBoundary` | Error boundary for permission errors |
| `AccessDeniedFallback` | Default access denied component |

### React Hooks

| Hook | Purpose |
|------|---------|
| `usePermissions()` | Core permission checking |
| `useRoles()` | Role management and hierarchy |
| `useResourceAccess()` | Resource-level access control |
| `useUserPermissions()` | Comprehensive user data |
| `usePermissionState()` | Single permission state management |

## Configuration

### PermissionConfig Options

```typescript
const config: PermissionConfig = {
  // Security settings
  enableRiskAssessment: true,
  enableApprovalWorkflows: true,
  enableEmergencyAccess: true,
  enableSessionManagement: true,

  // Audit settings
  auditLevel: 'DETAILED',
  auditRetentionDays: 365,

  // Session settings
  maxConcurrentSessions: 5,
  sessionTimeoutMinutes: 480,
  extendSessionOnActivity: true,

  // Performance settings
  cachePermissions: true,
  cacheTTLMinutes: 15,

  // Security thresholds
  maxFailedPermissionChecks: 10,
  riskScoreThreshold: 75,

  // Default values
  defaultRiskLevel: 'MEDIUM',
  defaultApprovalTimeout: 24,
  defaultPermissionExpiry: 8760,
};
```

## Migration from Legacy System

The system provides backward compatibility with the existing permission structure:

```typescript
// Legacy permissions still work
import { adminPermissions, userPermissions } from '@/config/permissions';

// New enterprise permissions
import { SYSTEM_PERMISSIONS, PERMISSION_GROUPS } from '@/lib/enterprise-permissions/permissions';

// Migration utility
export function migrateLegacyPermissions(legacyPermissions: string[]): string[] {
  const mapping = {
    'users.create': SYSTEM_PERMISSIONS.CREATE_USERS,
    'users.read': SYSTEM_PERMISSIONS.READ_USERS,
    'users.update': SYSTEM_PERMISSIONS.UPDATE_USERS,
    'users.delete': SYSTEM_PERMISSIONS.DELETE_USERS,
    // ... more mappings
  };

  return legacyPermissions.map(p => mapping[p] || p);
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check user has required role/permission
   - Verify organization boundaries
   - Check time/location restrictions

2. **Session Issues**
   - Clear permission cache
   - Check session expiry
   - Verify session token validity

3. **Performance Issues**
   - Enable permission caching
   - Optimize database queries
   - Review audit log retention

### Debug Mode

Enable debug mode for development:

```tsx
import { PermissionDebugger } from '@/lib/enterprise-permissions/components';

function App() {
  return (
    <div>
      {/* Your app */}
      <PermissionDebugger
        showPermissions={true}
        showRoles={true}
        showContext={true}
      />
    </div>
  );
}
```

## Support and Contributing

For issues, questions, or contributions, please refer to the project documentation and follow the established development guidelines.

## License

This enterprise permission system is part of the StockFlow retail management system and is subject to the project's licensing terms.