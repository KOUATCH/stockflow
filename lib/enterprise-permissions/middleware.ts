/**
 * Enterprise Permission Middleware
 *
 * Provides middleware functions for protecting API routes and server actions
 * with comprehensive permission checking and audit logging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import type {
  PermissionContext,
  PermissionResult,
  PermissionRule,
  EnhancedUser,
} from './types';
import { PermissionManager } from './manager';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const permissionManager = new PermissionManager(prisma);

/**
 * Middleware factory for protecting API routes with permissions
 */
export function withPermission(
  requiredPermission: string | string[] | PermissionRule,
  options: {
    requireAll?: boolean;
    context?: Partial<PermissionContext>;
    onDenied?: (result: PermissionResult, req: NextRequest) => NextResponse;
    bypassFor?: string[]; // Roles that bypass permission check
  } = {}
) {
  return function permissionMiddleware(
    handler: (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse
  ) {
    return async function (req: NextRequest, context: any): Promise<NextResponse> {
      try {
        // Get session
        const session = await auth();
        if (!session?.user) {
          return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get enhanced user data
        const user = await getEnhancedUser(session.user.id);
        if (!user) {
          return new NextResponse('User not found', { status: 401 });
        }

        if (!user.isActive) {
          return new NextResponse('Account disabled', { status: 403 });
        }

        // Build permission context
        const permissionContext: PermissionContext = {
          userId: user.id,
          organizationId: user.organizationId,
          ipAddress: getClientIP(req),
          userAgent: req.headers.get('user-agent') || undefined,
          timestamp: new Date(),
          ...options.context,
          ...extractContextFromRequest(req, context),
        };

        // Check for bypass roles
        if (options.bypassFor) {
          const userRoles = user.roles.map(r => r.code);
          if (options.bypassFor.some(role => userRoles.includes(role))) {
            return handler(req, context);
          }
        }

        // Perform permission check
        let result: PermissionResult;

        if (typeof requiredPermission === 'string') {
          result = await permissionManager.hasPermission(user, requiredPermission, permissionContext);
        } else if (Array.isArray(requiredPermission)) {
          result = options.requireAll
            ? await permissionManager.hasAllPermissions(user, requiredPermission, permissionContext)
            : await permissionManager.hasAnyPermission(user, requiredPermission, permissionContext);
        } else {
          // Permission rule
          result = await permissionManager.validateRule(user, requiredPermission, permissionContext);
        }

        if (!result.granted) {
          if (options.onDenied) {
            return options.onDenied(result, req);
          }

          return new NextResponse(
            JSON.stringify({
              error: 'Permission denied',
              reason: result.reason,
              suggestions: result.suggestions,
              missingPermissions: result.missingPermissions,
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        // Permission granted, continue to handler
        return handler(req, context);
      } catch (error) {
        console.error('Permission middleware error:', error);
        return new NextResponse('Internal server error', { status: 500 });
      }
    };
  };
}

/**
 * Server action wrapper for permission checking
 */
export function requiresPermission(
  permission: string | string[] | PermissionRule,
  options: {
    requireAll?: boolean;
    context?: Partial<PermissionContext>;
  } = {}
) {
  return function permissionDecorator<T extends any[], R>(
    target: (...args: T) => Promise<R>
  ) {
    return async function permissionWrapper(...args: T): Promise<R> {
      try {
        // Get session
        const session = await auth();
        if (!session?.user) {
          throw new Error('Authentication required');
        }

        // Get enhanced user data
        const user = await getEnhancedUser(session.user.id);
        if (!user || !user.isActive) {
          throw new Error('Access denied');
        }

        // Build permission context
        const permissionContext: PermissionContext = {
          userId: user.id,
          organizationId: user.organizationId,
          timestamp: new Date(),
          ...options.context,
        };

        // Perform permission check
        let result: PermissionResult;

        if (typeof permission === 'string') {
          result = await permissionManager.hasPermission(user, permission, permissionContext);
        } else if (Array.isArray(permission)) {
          result = options.requireAll
            ? await permissionManager.hasAllPermissions(user, permission, permissionContext)
            : await permissionManager.hasAnyPermission(user, permission, permissionContext);
        } else {
          // Permission rule
          result = await permissionManager.validateRule(user, permission, permissionContext);
        }

        if (!result.granted) {
          throw new Error(result.reason || 'Permission denied');
        }

        // Permission granted, execute the function
        return target(...args);
      } catch (error) {
        console.error('Permission check failed:', error);
        throw error;
      }
    };
  };
}

/**
 * Higher-order component for protecting pages
 */
export function withPagePermission(
  permission: string | string[] | PermissionRule,
  options: {
    requireAll?: boolean;
    redirectTo?: string;
    fallbackComponent?: React.ComponentType;
  } = {}
) {
  return function pagePermissionWrapper<P extends object>(
    WrappedComponent: React.ComponentType<P>
  ): React.ComponentType<P> {
    return function PermissionProtectedPage(props: P) {
      // This would be implemented on the client side using React hooks
      // The actual implementation would use the permission hooks
      return React.createElement(WrappedComponent, props);
    };
  };
}

/**
 * Guard functions for inline permission checking
 */
export async function hasPermission(
  userId: string,
  permission: string,
  context?: PermissionContext
): Promise<boolean> {
  try {
    const user = await getEnhancedUser(userId);
    if (!user) return false;

    const result = await permissionManager.hasPermission(user, permission, context);
    return result.granted;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

export async function hasAnyPermission(
  userId: string,
  permissions: string[],
  context?: PermissionContext
): Promise<boolean> {
  try {
    const user = await getEnhancedUser(userId);
    if (!user) return false;

    const result = await permissionManager.hasAnyPermission(user, permissions, context);
    return result.granted;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

export async function hasAllPermissions(
  userId: string,
  permissions: string[],
  context?: PermissionContext
): Promise<boolean> {
  try {
    const user = await getEnhancedUser(userId);
    if (!user) return false;

    const result = await permissionManager.hasAllPermissions(user, permissions, context);
    return result.granted;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

export async function validateRule(
  userId: string,
  rule: PermissionRule,
  context?: PermissionContext
): Promise<PermissionResult> {
  try {
    const user = await getEnhancedUser(userId);
    if (!user) {
      return {
        granted: false,
        reason: 'User not found',
      };
    }

    return await permissionManager.validateRule(user, rule, context);
  } catch (error) {
    return {
      granted: false,
      reason: `Rule validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Utility function for checking permissions in API routes
 */
export async function checkApiPermission(
  req: NextRequest,
  permission: string | string[],
  context?: Partial<PermissionContext>
): Promise<{ success: boolean; user?: EnhancedUser; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    const user = await getEnhancedUser(session.user.id);
    if (!user || !user.isActive) {
      return { success: false, error: 'Access denied' };
    }

    const permissionContext: PermissionContext = {
      userId: user.id,
      organizationId: user.organizationId,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get('user-agent') || undefined,
      timestamp: new Date(),
      ...context,
    };

    let result: PermissionResult;

    if (typeof permission === 'string') {
      result = await permissionManager.hasPermission(user, permission, permissionContext);
    } else {
      result = await permissionManager.hasAnyPermission(user, permission, permissionContext);
    }

    if (!result.granted) {
      return { success: false, error: result.reason };
    }

    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: `Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Rate limiting middleware based on permissions
 */
export function withRateLimit(
  options: {
    windowMs: number;
    maxRequests: number;
    skipSuccessful?: boolean;
    keyGenerator?: (req: NextRequest, user: EnhancedUser) => string;
  }
) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return function rateLimitMiddleware(
    handler: (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse
  ) {
    return async function (req: NextRequest, context: any): Promise<NextResponse> {
      try {
        const session = await auth();
        if (!session?.user) {
          return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await getEnhancedUser(session.user.id);
        if (!user) {
          return new NextResponse('User not found', { status: 401 });
        }

        // Generate rate limit key
        const key = options.keyGenerator
          ? options.keyGenerator(req, user)
          : `${user.id}:${req.nextUrl.pathname}`;

        const now = Date.now();
        const windowStart = now - options.windowMs;

        // Get or initialize request count
        let requestData = requestCounts.get(key);
        if (!requestData || requestData.resetTime <= windowStart) {
          requestData = { count: 0, resetTime: now + options.windowMs };
          requestCounts.set(key, requestData);
        }

        // Check rate limit
        if (requestData.count >= options.maxRequests) {
          return new NextResponse('Rate limit exceeded', { status: 429 });
        }

        // Execute handler
        const response = await handler(req, context);

        // Increment count only for failed requests (if skipSuccessful is true)
        if (!options.skipSuccessful || response.status >= 400) {
          requestData.count++;
        }

        return response;
      } catch (error) {
        console.error('Rate limit middleware error:', error);
        return new NextResponse('Internal server error', { status: 500 });
      }
    };
  };
}

/**
 * Audit middleware for logging all API requests
 */
export function withAuditLog(
  options: {
    logLevel?: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
    excludePaths?: string[];
    includeRequestBody?: boolean;
    includeResponseBody?: boolean;
  } = {}
) {
  return function auditMiddleware(
    handler: (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse
  ) {
    return async function (req: NextRequest, context: any): Promise<NextResponse> {
      const startTime = Date.now();

      try {
        const session = await auth();
        const user = session?.user ? await getEnhancedUser(session.user.id) : null;

        // Check if path should be excluded
        if (options.excludePaths?.some(path => req.nextUrl.pathname.startsWith(path))) {
          return handler(req, context);
        }

        // Execute handler
        const response = await handler(req, context);
        const duration = Date.now() - startTime;

        // Log the request
        await logApiRequest({
          userId: user?.id,
          method: req.method,
          path: req.nextUrl.pathname,
          query: Object.fromEntries(req.nextUrl.searchParams),
          status: response.status,
          duration,
          ipAddress: getClientIP(req),
          userAgent: req.headers.get('user-agent') || undefined,
          requestBody: options.includeRequestBody ? await getRequestBody(req) : undefined,
          responseBody: options.includeResponseBody ? await getResponseBody(response) : undefined,
          logLevel: options.logLevel || 'BASIC',
        });

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;

        // Log the error
        await logApiRequest({
          userId: undefined,
          method: req.method,
          path: req.nextUrl.pathname,
          status: 500,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
          logLevel: options.logLevel || 'BASIC',
        });

        throw error;
      }
    };
  };
}

/**
 * Helper functions
 */
async function getEnhancedUser(userId: string): Promise<EnhancedUser | null> {
  try {
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error('Error fetching enhanced user:', error);
    return null;
  }
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

function extractContextFromRequest(req: NextRequest, routeContext: any): Partial<PermissionContext> {
  const context: Partial<PermissionContext> = {};

  // Extract resource information from route parameters
  if (routeContext?.params) {
    if (routeContext.params.id) {
      context.resourceId = routeContext.params.id;
    }
    if (routeContext.params.resourceType) {
      context.resourceType = routeContext.params.resourceType;
    }
  }

  // Extract action from HTTP method
  switch (req.method) {
    case 'GET':
      context.action = 'READ';
      break;
    case 'POST':
      context.action = 'create';
      break;
    case 'PUT':
    case 'PATCH':
      context.action = 'update';
      break;
    case 'DELETE':
      context.action = 'delete';
      break;
  }

  // Extract additional context from query parameters
  const searchParams = req.nextUrl.searchParams;
  if (searchParams.get('amount')) {
    context.amount = parseFloat(searchParams.get('amount')!);
  }
  if (searchParams.get('location')) {
    context.location = searchParams.get('location')!;
  }

  return context;
}

async function getRequestBody(req: NextRequest): Promise<any> {
  try {
    if (req.body) {
      return await req.json();
    }
  } catch (error) {
    return undefined;
  }
}

async function getResponseBody(response: NextResponse): Promise<any> {
  try {
    const clone = response.clone();
    const text = await clone.text();
    return JSON.parse(text);
  } catch (error) {
    return undefined;
  }
}

async function logApiRequest(data: any): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: `API_${data.method}`,
        resource: 'API_REQUEST',
        resourceId: data.path,
        newValues: {
          method: data.method,
          path: data.path,
          query: data.query,
          status: data.status,
          duration: data.duration,
          requestBody: data.requestBody,
          responseBody: data.responseBody,
          error: data.error,
        },
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        permissionContext: {
          logLevel: data.logLevel,
        },
      },
    });
  } catch (error) {
    console.error('Error logging API request:', error);
  }
}