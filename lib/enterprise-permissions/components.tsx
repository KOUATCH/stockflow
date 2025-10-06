/**
 * React Components for Enterprise Permission System
 *
 * Provides React components for declarative permission checking and access control.
 */

'use client';

import React, { useEffect, useState } from 'react';
import type {
  PermissionGateProps,
  RoleGateProps,
  ResourceGateProps,
  PermissionResult,
} from './types';
import { usePermissions, useRoles, useResourceAccess, usePermissionState } from './hooks';

/**
 * PermissionGate - Controls rendering based on user permissions
 */
export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  rule,
  context,
  fallback = null,
  onDenied,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, validateRule, isLoading } = usePermissions();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [permissionResult, setPermissionResult] = useState<PermissionResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        let result: PermissionResult | boolean;

        if (rule) {
          result = await validateRule(rule, context);
        } else if (permission) {
          result = await hasPermission(permission, context);
        } else if (permissions) {
          result = requireAll
            ? await hasAllPermissions(permissions, context)
            : await hasAnyPermission(permissions, context);
        } else {
          // No permission specified, deny access
          result = false;
        }

        if (!cancelled) {
          if (typeof result === 'boolean') {
            setHasAccess(result);
            setPermissionResult({ granted: result });
          } else {
            setHasAccess(result.granted);
            setPermissionResult(result);
          }

          // Call onDenied if access is denied
          if (typeof result === 'boolean' ? !result : !result.granted) {
            onDenied?.(typeof result === 'boolean' ? { granted: result } : result);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setHasAccess(false);
          const errorResult: PermissionResult = {
            granted: false,
            reason: error instanceof Error ? error.message : 'Permission check failed',
          };
          setPermissionResult(errorResult);
          onDenied?.(errorResult);
        }
      }
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [permission, permissions, requireAll, rule, context, hasPermission, hasAnyPermission, hasAllPermissions, validateRule, onDenied]);

  // Show loading state
  if (isLoading || hasAccess === null) {
    return <PermissionLoadingIndicator />;
  }

  // Show children if access is granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback if access is denied
  return <>{fallback}</>;
}

/**
 * RoleGate - Controls rendering based on user roles
 */
export function RoleGate({
  role,
  roles,
  requireAll = false,
  minimumHierarchy,
  fallback = null,
  onDenied,
  children,
}: RoleGateProps) {
  const { roles: userRoles, isLoading, hasRole, getRoleHierarchy } = useRoles();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    let access = false;

    if (role) {
      access = hasRole(role);
    } else if (roles) {
      access = requireAll
        ? roles.every(r => hasRole(r))
        : roles.some(r => hasRole(r));
    }

    // Check minimum hierarchy requirement
    if (access && minimumHierarchy !== undefined) {
      const userHierarchy = getRoleHierarchy();
      access = userHierarchy <= minimumHierarchy;
    }

    setHasAccess(access);

    if (!access) {
      onDenied?.();
    }
  }, [role, roles, requireAll, minimumHierarchy, userRoles, isLoading, hasRole, getRoleHierarchy, onDenied]);

  // Show loading state
  if (isLoading || hasAccess === null) {
    return <PermissionLoadingIndicator />;
  }

  // Show children if access is granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback if access is denied
  return <>{fallback}</>;
}

/**
 * ResourceGate - Controls rendering based on resource access
 */
export function ResourceGate({
  resourceType,
  resourceId,
  action,
  context,
  fallback = null,
  onDenied,
  children,
}: ResourceGateProps) {
  const { canAccess, isLoading } = useResourceAccess();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      try {
        const access = await canAccess(resourceType, resourceId, action);

        if (!cancelled) {
          setHasAccess(access);

          if (!access) {
            onDenied?.({ granted: false, reason: 'Resource access denied' });
          }
        }
      } catch (error) {
        if (!cancelled) {
          setHasAccess(false);
          onDenied?.({
            granted: false,
            reason: error instanceof Error ? error.message : 'Resource access check failed',
          });
        }
      }
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [resourceType, resourceId, action, canAccess, onDenied]);

  // Show loading state
  if (isLoading || hasAccess === null) {
    return <PermissionLoadingIndicator />;
  }

  // Show children if access is granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback if access is denied
  return <>{fallback}</>;
}

/**
 * ConditionalRender - More flexible permission-based rendering
 */
interface ConditionalRenderProps {
  condition: () => Promise<boolean> | boolean;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  children: React.ReactNode;
}

export function ConditionalRender({
  condition,
  fallback = null,
  loading = <PermissionLoadingIndicator />,
  children,
}: ConditionalRenderProps) {
  const [state, setState] = useState<'loading' | 'allowed' | 'denied'>('loading');

  useEffect(() => {
    let cancelled = false;

    const checkCondition = async () => {
      try {
        const result = await condition();

        if (!cancelled) {
          setState(result ? 'allowed' : 'denied');
        }
      } catch (error) {
        if (!cancelled) {
          setState('denied');
        }
      }
    };

    checkCondition();

    return () => {
      cancelled = true;
    };
  }, [condition]);

  switch (state) {
    case 'loading':
      return <>{loading}</>;
    case 'allowed':
      return <>{children}</>;
    case 'denied':
      return <>{fallback}</>;
  }
}

/**
 * PermissionBoundary - Error boundary for permission-related errors
 */
interface PermissionBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface PermissionBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error) => void;
  children: React.ReactNode;
}

export class PermissionBoundary extends React.Component<PermissionBoundaryProps, PermissionBoundaryState> {
  constructor(props: PermissionBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PermissionBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Permission boundary caught an error:', error, errorInfo);
    this.props.onError?.(error);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="permission-error">
          <h3>Permission Error</h3>
          <p>{this.state.error.message}</p>
          <button onClick={this.resetError}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * PermissionLoadingIndicator - Default loading component
 */
export function PermissionLoadingIndicator() {
  return (
    <div className="permission-loading" style={{ opacity: 0.6 }}>
      <span>Checking permissions...</span>
    </div>
  );
}

/**
 * AccessDeniedFallback - Default access denied component
 */
interface AccessDeniedFallbackProps {
  reason?: string;
  suggestions?: string[];
  onRequestAccess?: () => void;
}

export function AccessDeniedFallback({
  reason = 'Access denied',
  suggestions = [],
  onRequestAccess,
}: AccessDeniedFallbackProps) {
  return (
    <div className="access-denied">
      <div className="access-denied-content">
        <h3>Access Restricted</h3>
        <p>{reason}</p>

        {suggestions.length > 0 && (
          <div className="suggestions">
            <p>Suggestions:</p>
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {onRequestAccess && (
          <button
            onClick={onRequestAccess}
            className="request-access-btn"
          >
            Request Access
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * PermissionDebugger - Development tool for debugging permissions
 */
interface PermissionDebuggerProps {
  userId?: string;
  showPermissions?: boolean;
  showRoles?: boolean;
  showContext?: boolean;
}

export function PermissionDebugger({
  userId,
  showPermissions = true,
  showRoles = true,
  showContext = false,
}: PermissionDebuggerProps) {
  const { roles } = useRoles();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [context, setContext] = useState<any>({});

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="permission-debugger" style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: '#f0f0f0',
      border: '1px solid #ccc',
      padding: 10,
      fontSize: 12,
      maxWidth: 300,
      maxHeight: 400,
      overflow: 'auto',
      zIndex: 9999,
    }}>
      <h4>Permission Debugger</h4>

      {userId && <div><strong>User ID:</strong> {userId}</div>}

      {showRoles && (
        <div>
          <strong>Roles:</strong>
          <ul style={{ margin: 0, paddingLeft: 15 }}>
            {roles.map(role => (
              <li key={role.id}>{role.name} ({role.code})</li>
            ))}
          </ul>
        </div>
      )}

      {showPermissions && (
        <div>
          <strong>Permissions:</strong>
          <ul style={{ margin: 0, paddingLeft: 15 }}>
            {permissions.slice(0, 10).map(permission => (
              <li key={permission}>{permission}</li>
            ))}
            {permissions.length > 10 && <li>... and {permissions.length - 10} more</li>}
          </ul>
        </div>
      )}

      {showContext && (
        <div>
          <strong>Context:</strong>
          <pre style={{ fontSize: 10, overflow: 'auto' }}>
            {JSON.stringify(context, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

/**
 * Higher-order component for permission protection
 */
export function withPermissionCheck<P extends object>(
  Component: React.ComponentType<P>,
  permission: string | string[],
  options: {
    requireAll?: boolean;
    fallback?: React.ComponentType;
    onDenied?: () => void;
  } = {}
) {
  return function PermissionProtectedComponent(props: P) {
    const { hasAccess, isChecking } = usePermissionState(
      Array.isArray(permission) ? permission[0] : permission
    );

    if (isChecking) {
      return <PermissionLoadingIndicator />;
    }

    if (!hasAccess) {
      if (options.fallback) {
        const FallbackComponent = options.fallback;
        return <FallbackComponent />;
      }

      options.onDenied?.();
      return <AccessDeniedFallback reason="You don't have permission to access this component" />;
    }

    return <Component {...props} />;
  };
}

/**
 * Permission-aware button component
 */
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  fallbackText?: string;
  checkingText?: string;
}

export function PermissionButton({
  permission,
  permissions,
  requireAll = false,
  resourceType,
  resourceId,
  action,
  fallbackText = 'No Permission',
  checkingText = 'Checking...',
  children,
  disabled,
  ...props
}: PermissionButtonProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  const { canAccess } = useResourceAccess();

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      setIsChecking(true);

      try {
        let access = false;

        if (resourceType && resourceId && action) {
          access = await canAccess(resourceType, resourceId, action);
        } else if (permission) {
          access = await hasPermission(permission);
        } else if (permissions) {
          access = requireAll
            ? await hasAllPermissions(permissions)
            : await hasAnyPermission(permissions);
        } else {
          access = true; // No permission specified
        }

        if (!cancelled) {
          setHasAccess(access);
        }
      } catch (error) {
        if (!cancelled) {
          setHasAccess(false);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [permission, permissions, requireAll, resourceType, resourceId, action]);

  if (isChecking) {
    return (
      <button {...props} disabled>
        {checkingText}
      </button>
    );
  }

  if (!hasAccess) {
    return (
      <button {...props} disabled>
        {fallbackText}
      </button>
    );
  }

  return (
    <button {...props} disabled={disabled}>
      {children}
    </button>
  );
}