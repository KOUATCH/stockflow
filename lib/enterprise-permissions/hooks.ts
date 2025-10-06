/**
 * React Hooks for Enterprise Permission System
 *
 * Provides React hooks for permission checking and management in client components.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from '@/lib/auth-client';
import type {
  PermissionContext,
  PermissionResult,
  PermissionRule,
  UsePermissionsReturn,
  UseRolesReturn,
  UseResourceAccessReturn,
  EnhancedUser,
  ResourcePermission,
} from './types';

// API client for permission checks
class PermissionClient {
  async checkPermission(permission: string, context?: PermissionContext): Promise<PermissionResult> {
    const response = await fetch('/api/permissions/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permission, context }),
    });

    if (!response.ok) {
      throw new Error('Permission check failed');
    }

    return response.json();
  }

  async checkMultiplePermissions(permissions: string[], requireAll: boolean, context?: PermissionContext): Promise<PermissionResult> {
    const response = await fetch('/api/permissions/check-multiple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions, requireAll, context }),
    });

    if (!response.ok) {
      throw new Error('Permission check failed');
    }

    return response.json();
  }

  async validateRule(rule: PermissionRule, context?: PermissionContext): Promise<PermissionResult> {
    const response = await fetch('/api/permissions/validate-rule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rule, context }),
    });

    if (!response.ok) {
      throw new Error('Rule validation failed');
    }

    return response.json();
  }

  async checkResourceAccess(resourceType: string, resourceId: string, action: string, context?: PermissionContext): Promise<PermissionResult> {
    const response = await fetch('/api/permissions/check-resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceType, resourceId, action, context }),
    });

    if (!response.ok) {
      throw new Error('Resource access check failed');
    }

    return response.json();
  }

  async getUserPermissions(): Promise<{ user: EnhancedUser; permissions: string[] }> {
    const response = await fetch('/api/permissions/user-permissions');

    if (!response.ok) {
      throw new Error('Failed to fetch user permissions');
    }

    return response.json();
  }

  async getUserRoles(): Promise<any[]> {
    const response = await fetch('/api/permissions/user-roles');

    if (!response.ok) {
      throw new Error('Failed to fetch user roles');
    }

    return response.json();
  }

  async getResourcePermissions(resourceType: string, resourceId: string): Promise<ResourcePermission[]> {
    const response = await fetch(`/api/permissions/resource-permissions?resourceType=${resourceType}&resourceId=${resourceId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch resource permissions');
    }

    return response.json();
  }

  async refreshPermissions(): Promise<void> {
    const response = await fetch('/api/permissions/refresh', { method: 'POST' });

    if (!response.ok) {
      throw new Error('Failed to refresh permissions');
    }
  }
}

const permissionClient = new PermissionClient();

/**
 * Hook for permission checking
 */
export function usePermissions(): UsePermissionsReturn {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [permissionCache, setPermissionCache] = useState<Map<string, { result: boolean; expiresAt: number }>>(new Map());

  const getCacheKey = useCallback((permission: string | string[], context?: PermissionContext): string => {
    const permStr = Array.isArray(permission) ? permission.sort().join(':') : permission;
    const contextStr = context ? JSON.stringify(context) : '';
    return `${permStr}|${contextStr}`;
  }, []);

  const hasPermission = useCallback(async (permission: string, context?: PermissionContext): Promise<boolean> => {
    if (status !== 'authenticated' || !session?.user) {
      return false;
    }

    const cacheKey = getCacheKey(permission, context);
    const cached = permissionCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await permissionClient.checkPermission(permission, context);

      // Cache the result for 5 minutes
      const newCache = new Map(permissionCache);
      newCache.set(cacheKey, {
        result: result.granted,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
      setPermissionCache(newCache);

      return result.granted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Permission check failed');
      setError(error);
      console.error('Permission check error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, status, permissionCache, getCacheKey]);

  const hasAnyPermission = useCallback(async (permissions: string[], context?: PermissionContext): Promise<boolean> => {
    if (status !== 'authenticated' || !session?.user) {
      return false;
    }

    const cacheKey = getCacheKey(permissions, context);
    const cached = permissionCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await permissionClient.checkMultiplePermissions(permissions, false, context);

      // Cache the result
      const newCache = new Map(permissionCache);
      newCache.set(cacheKey, {
        result: result.granted,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
      setPermissionCache(newCache);

      return result.granted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Permission check failed');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, status, permissionCache, getCacheKey]);

  const hasAllPermissions = useCallback(async (permissions: string[], context?: PermissionContext): Promise<boolean> => {
    if (status !== 'authenticated' || !session?.user) {
      return false;
    }

    const cacheKey = getCacheKey(permissions, context);
    const cached = permissionCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await permissionClient.checkMultiplePermissions(permissions, true, context);

      // Cache the result
      const newCache = new Map(permissionCache);
      newCache.set(cacheKey, {
        result: result.granted,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
      setPermissionCache(newCache);

      return result.granted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Permission check failed');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, status, permissionCache, getCacheKey]);

  const validateRule = useCallback(async (rule: PermissionRule, context?: PermissionContext): Promise<PermissionResult> => {
    if (status !== 'authenticated' || !session?.user) {
      return { granted: false, reason: 'Not authenticated' };
    }

    try {
      setIsLoading(true);
      setError(null);

      return await permissionClient.validateRule(rule, context);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Rule validation failed');
      setError(error);
      return { granted: false, reason: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  const refreshPermissions = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear cache
      setPermissionCache(new Map());

      // Refresh permissions on server
      await permissionClient.refreshPermissions();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh permissions');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    validateRule,
    isLoading,
    error,
    refreshPermissions,
  };
}

/**
 * Hook for role management
 */
export function useRoles(): UseRolesReturn {
  const { data: session, status } = useSession();
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoles = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const userRoles = await permissionClient.getUserRoles();
      setRoles(userRoles);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch roles');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const effectiveRole = useMemo(() => {
    if (roles.length === 0) return null;

    // Return the role with the highest hierarchy (lowest number)
    const sortedRoles = roles.sort((a, b) => (a.hierarchyLevel || 999) - (b.hierarchyLevel || 999));
    return sortedRoles[0].code;
  }, [roles]);

  const hasRole = useCallback((roleCode: string): boolean => {
    return roles.some(role => role.code === roleCode);
  }, [roles]);

  const getRoleHierarchy = useCallback((): number => {
    if (roles.length === 0) return 999;
    return Math.min(...roles.map(role => role.hierarchyLevel || 999));
  }, [roles]);

  return {
    roles,
    effectiveRole,
    isLoading,
    error,
    hasRole,
    getRoleHierarchy,
  };
}

/**
 * Hook for resource access management
 */
export function useResourceAccess(): UseResourceAccessReturn {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [resourceCache, setResourceCache] = useState<Map<string, { result: boolean; expiresAt: number }>>(new Map());

  const canAccess = useCallback(async (resourceType: string, resourceId: string, action: string): Promise<boolean> => {
    if (status !== 'authenticated' || !session?.user) {
      return false;
    }

    const cacheKey = `${resourceType}:${resourceId}:${action}`;
    const cached = resourceCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await permissionClient.checkResourceAccess(resourceType, resourceId, action);

      // Cache the result for 2 minutes (shorter than general permissions)
      const newCache = new Map(resourceCache);
      newCache.set(cacheKey, {
        result: result.granted,
        expiresAt: Date.now() + 2 * 60 * 1000,
      });
      setResourceCache(newCache);

      return result.granted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Resource access check failed');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, status, resourceCache]);

  const getResourcePermissions = useCallback(async (resourceType: string, resourceId: string): Promise<ResourcePermission[]> => {
    if (status !== 'authenticated' || !session?.user) {
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      return await permissionClient.getResourcePermissions(resourceType, resourceId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch resource permissions');
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  return {
    canAccess,
    getResourcePermissions,
    isLoading,
    error,
  };
}

/**
 * Hook for user permissions (comprehensive user data)
 */
export function useUserPermissions() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserPermissions = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await permissionClient.getUserPermissions();
      setUser(data.user);
      setPermissions(data.permissions);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user permissions');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  const hasPermissionDirect = useCallback((permission: string): boolean => {
    return permissions.includes(permission) || permissions.includes('*');
  }, [permissions]);

  const hasAnyPermissionDirect = useCallback((perms: string[]): boolean => {
    return permissions.includes('*') || perms.some(p => permissions.includes(p));
  }, [permissions]);

  const hasAllPermissionsDirect = useCallback((perms: string[]): boolean => {
    return permissions.includes('*') || perms.every(p => permissions.includes(p));
  }, [permissions]);

  return {
    user,
    permissions,
    isLoading,
    error,
    hasPermission: hasPermissionDirect,
    hasAnyPermission: hasAnyPermissionDirect,
    hasAllPermissions: hasAllPermissionsDirect,
    refetch: fetchUserPermissions,
  };
}

/**
 * Hook for permission state management
 */
export function usePermissionState(permission: string, context?: PermissionContext) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    let cancelled = false;

    const checkPermission = async () => {
      setIsChecking(true);
      setError(null);

      try {
        const result = await hasPermission(permission, context);
        if (!cancelled) {
          setHasAccess(result);
        }
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error('Permission check failed');
          setError(error);
          setHasAccess(false);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    checkPermission();

    return () => {
      cancelled = true;
    };
  }, [permission, context, hasPermission]);

  return {
    hasAccess,
    isChecking,
    error,
  };
}

/**
 * Hook for managing permission requests/approvals
 */
export function usePermissionRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const requestPermission = useCallback(async (
    permissions: string[],
    resourceId?: string,
    justification?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/permissions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions, resourceId, justification }),
      });

      if (!response.ok) {
        throw new Error('Failed to request permission');
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Permission request failed');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/permissions/requests');

      if (!response.ok) {
        throw new Error('Failed to fetch permission requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch requests');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    requests,
    requestPermission,
    fetchRequests,
    isLoading,
    error,
  };
}