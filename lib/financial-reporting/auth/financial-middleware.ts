// =============================================================================
// FINANCIAL SECURITY MIDDLEWARE & GUARDS
// Enterprise-grade security middleware for financial operations
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { getSession } from '@/lib/session-auth';
import { FinancialAccessControlService, type FinancialAccessContext } from './financial-access-control';
import { FINANCIAL_PERMISSIONS, type FinancialPermission } from '@/lib/permissions/financial-permissions';
import { AuditTrailService } from '@/actions/financial-reporting/audit/audit-trail-service';
import { createFinancialNotification } from '@/lib/financial-reporting/notifications/financial-notification-service';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface FinancialMiddlewareOptions {
  requiredPermissions?: FinancialPermission[];
  requiredRole?: string;
  allowSuperAdmin?: boolean;
  auditAction?: string;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  requireHttps?: boolean;
  requireEncryption?: boolean;
}

export interface AuthenticatedFinancialRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    organizationId: string;
    roles: string[];
    permissions: FinancialPermission[];
  };
  financialContext: FinancialAccessContext;
}

export interface FinancialError {
  code: string;
  message: string;
  statusCode: number;
  auditRequired: boolean;
}

// =============================================================================
// FINANCIAL SECURITY MIDDLEWARE
// =============================================================================

export class FinancialSecurityMiddleware {
  private accessControl: FinancialAccessControlService;
  private auditService: AuditTrailService;

  constructor() {
    this.accessControl = new FinancialAccessControlService();
    this.auditService = new AuditTrailService();
  }

  /**
   * Main financial security middleware
   */
  createMiddleware(options: FinancialMiddlewareOptions = {}) {
    return async (req: NextRequest): Promise<NextResponse | Response> => {
      try {
        // 1. HTTPS Enforcement
        if (options.requireHttps && !this.isHTTPS(req)) {
          return this.createErrorResponse({
            code: 'HTTPS_REQUIRED',
            message: 'HTTPS is required for financial operations',
            statusCode: 426,
            auditRequired: true
          }, req);
        }

        // 2. Authentication Check
        const authResult = await this.authenticateRequest(req);
        if (!authResult.success) {
          return this.createErrorResponse({
            code: 'AUTHENTICATION_FAILED',
            message: authResult.error || 'Authentication failed',
            statusCode: 401,
            auditRequired: true
          }, req);
        }

        const authenticatedReq = authResult.request!;

        // 3. Permission Check
        if (options.requiredPermissions?.length) {
          const permissionResult = await this.checkPermissions(
            authenticatedReq,
            options.requiredPermissions
          );
          if (!permissionResult.granted) {
            return this.createErrorResponse({
              code: 'INSUFFICIENT_PERMISSIONS',
              message: `Required permissions: ${options.requiredPermissions.join(', ')}`,
              statusCode: 403,
              auditRequired: true
            }, authenticatedReq);
          }
        }

        // 4. Role Check
        if (options.requiredRole) {
          if (!authenticatedReq.user.roles.includes(options.requiredRole)) {
            return this.createErrorResponse({
              code: 'INSUFFICIENT_ROLE',
              message: `Required role: ${options.requiredRole}`,
              statusCode: 403,
              auditRequired: true
            }, authenticatedReq);
          }
        }

        // 5. Rate Limiting
        if (options.rateLimit) {
          const rateLimitResult = await this.checkRateLimit(
            authenticatedReq,
            options.rateLimit
          );
          if (!rateLimitResult.allowed) {
            return this.createErrorResponse({
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Rate limit exceeded for financial operations',
              statusCode: 429,
              auditRequired: true
            }, authenticatedReq);
          }
        }

        // 6. Audit Action
        if (options.auditAction) {
          await this.auditService.createAuditEntry({
            userId: authenticatedReq.user.id,
            organizationId: authenticatedReq.user.organizationId,
            action: options.auditAction,
            resource: 'FINANCIAL_API',
            description: `Financial API access: ${options.auditAction}`,
            metadata: {
              url: req.url,
              method: req.method,
              userAgent: req.headers.get('user-agent'),
              ipAddress: this.getClientIP(req)
            }
          });
        }

        // 7. Add security headers
        const response = NextResponse.next();
        this.addSecurityHeaders(response);

        return response;

      } catch (error) {
        console.error('Financial security middleware error:', error);
        return this.createErrorResponse({
          code: 'SECURITY_ERROR',
          message: 'Financial security check failed',
          statusCode: 500,
          auditRequired: true
        }, req);
      }
    };
  }

  /**
   * Authenticate financial request
   */
  private async authenticateRequest(req: NextRequest): Promise<{
    success: boolean;
    error?: string;
    request?: AuthenticatedFinancialRequest;
  }> {
    try {
      // Get session from different sources
      const session = await getSession();
      if (!session?.user) {
        return { success: false, error: 'No valid session' };
      }

      // Get user permissions from database
      const userPermissions = await this.getUserFinancialPermissions(session.user.id);

      // Create authenticated request
      const authenticatedReq = req as AuthenticatedFinancialRequest;
      authenticatedReq.user = {
        id: session.user.id,
        email: session.user.email,
        organizationId: session.user.organizationId,
        roles: session.user.roles || [],
        permissions: userPermissions
      };

      authenticatedReq.financialContext = FinancialAccessControlService.createAccessContext(
        session.user.id,
        session.user.organizationId,
        {
          sessionId: session.sessionId,
          ip: this.getClientIP(req),
          userAgent: req.headers.get('user-agent') || ''
        }
      );

      return { success: true, request: authenticatedReq };

    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication system error' };
    }
  }

  /**
   * Check user permissions
   */
  private async checkPermissions(
    req: AuthenticatedFinancialRequest,
    requiredPermissions: FinancialPermission[]
  ): Promise<{ granted: boolean; missing?: FinancialPermission[] }> {
    const userPermissions = req.user.permissions;
    const missingPermissions = requiredPermissions.filter(
      permission => !userPermissions.includes(permission)
    );

    return {
      granted: missingPermissions.length === 0,
      missing: missingPermissions.length > 0 ? missingPermissions : undefined
    };
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(
    req: AuthenticatedFinancialRequest,
    rateLimit: { maxRequests: number; windowMs: number }
  ): Promise<{ allowed: boolean; remaining?: number }> {
    // TODO: Implement Redis-based rate limiting
    // For now, return allowed
    return { allowed: true };
  }

  /**
   * Get user financial permissions
   */
  private async getUserFinancialPermissions(userId: string): Promise<FinancialPermission[]> {
    try {
      const user = await this.accessControl['getUserWithPermissions'](userId);
      if (!user) return [];

      return this.accessControl['getUserPermissions'](user);
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }

  /**
   * Create error response with audit logging
   */
  private async createErrorResponse(
    error: FinancialError,
    req: NextRequest | AuthenticatedFinancialRequest
  ): Promise<Response> {
    // Audit security violations
    if (error.auditRequired) {
      const user = (req as AuthenticatedFinancialRequest).user;
      if (user) {
        await this.auditService.createAuditEntry({
          userId: user.id,
          organizationId: user.organizationId,
          action: 'SECURITY_VIOLATION',
          resource: 'FINANCIAL_API',
          description: `Security violation: ${error.code}`,
          metadata: {
            errorCode: error.code,
            errorMessage: error.message,
            url: req.url,
            method: req.method,
            userAgent: req.headers.get('user-agent'),
            ipAddress: this.getClientIP(req)
          }
        });
      }
    }

    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'X-Financial-Security-Error': error.code
        }
      }
    );
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(response: NextResponse): void {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'payment=(), microphone=(), camera=()');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  /**
   * Check if request is HTTPS
   */
  private isHTTPS(req: NextRequest): boolean {
    return req.url.startsWith('https://') || req.headers.get('x-forwarded-proto') === 'https';
  }

  /**
   * Get client IP address
   */
  private getClientIP(req: NextRequest): string {
    return (
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown'
    );
  }
}

// =============================================================================
// FINANCIAL ROUTE GUARDS
// =============================================================================

export class FinancialRouteGuards {
  private middleware: FinancialSecurityMiddleware;

  constructor() {
    this.middleware = new FinancialSecurityMiddleware();
  }

  /**
   * Guard for financial statements routes
   */
  financialStatementsGuard() {
    return this.middleware.createMiddleware({
      requiredPermissions: [
        FINANCIAL_PERMISSIONS.VIEW_INCOME_STATEMENT,
        FINANCIAL_PERMISSIONS.VIEW_BALANCE_SHEET,
        FINANCIAL_PERMISSIONS.VIEW_CASH_FLOW_STATEMENT
      ],
      auditAction: 'ACCESS_FINANCIAL_STATEMENTS',
      requireHttps: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 }
    });
  }

  /**
   * Guard for journal entries routes
   */
  journalEntriesGuard() {
    return this.middleware.createMiddleware({
      requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_JOURNAL_ENTRIES],
      auditAction: 'ACCESS_JOURNAL_ENTRIES',
      requireHttps: true,
      rateLimit: { maxRequests: 200, windowMs: 60000 }
    });
  }

  /**
   * Guard for financial analysis routes
   */
  financialAnalysisGuard() {
    return this.middleware.createMiddleware({
      requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_FINANCIAL_RATIOS],
      auditAction: 'ACCESS_FINANCIAL_ANALYSIS',
      requireHttps: true
    });
  }

  /**
   * Guard for audit trail routes
   */
  auditTrailGuard() {
    return this.middleware.createMiddleware({
      requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_FINANCIAL_AUDIT_TRAIL],
      auditAction: 'ACCESS_AUDIT_TRAIL',
      requireHttps: true,
      rateLimit: { maxRequests: 50, windowMs: 60000 }
    });
  }

  /**
   * Guard for compliance routes
   */
  complianceGuard() {
    return this.middleware.createMiddleware({
      requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_COMPLIANCE_STATUS],
      auditAction: 'ACCESS_COMPLIANCE_DATA',
      requireHttps: true,
      rateLimit: { maxRequests: 30, windowMs: 60000 }
    });
  }

  /**
   * Guard for financial administration routes
   */
  financialAdminGuard() {
    return this.middleware.createMiddleware({
      requiredPermissions: [FINANCIAL_PERMISSIONS.CONFIGURE_FINANCIAL_SYSTEM],
      requiredRole: 'cfo',
      auditAction: 'ACCESS_FINANCIAL_ADMIN',
      requireHttps: true,
      rateLimit: { maxRequests: 20, windowMs: 60000 }
    });
  }

  /**
   * Guard for high-security financial operations
   */
  highSecurityGuard() {
    return this.middleware.createMiddleware({
      requiredPermissions: [
        FINANCIAL_PERMISSIONS.APPROVE_FINANCIAL_STATEMENTS,
        FINANCIAL_PERMISSIONS.CERTIFY_COMPLIANCE
      ],
      allowSuperAdmin: false,
      auditAction: 'HIGH_SECURITY_FINANCIAL_OPERATION',
      requireHttps: true,
      rateLimit: { maxRequests: 10, windowMs: 60000 }
    });
  }
}

// =============================================================================
// HOOK-BASED GUARDS FOR REACT COMPONENTS
// =============================================================================

export const useFinancialPermission = (permission: FinancialPermission) => {
  // This would integrate with your existing auth hook
  // For now, returning a placeholder structure
  return {
    hasPermission: false, // Would check actual permission
    loading: false,
    error: null
  };
};

export const useFinancialRole = (role: string) => {
  // This would integrate with your existing auth hook
  return {
    hasRole: false, // Would check actual role
    loading: false,
    error: null
  };
};

// =============================================================================
// COMPONENT GUARDS
// =============================================================================

interface FinancialComponentGuardProps {
  children: React.ReactNode;
  requiredPermissions?: FinancialPermission[];
  requiredRole?: string;
  fallback?: React.ReactNode;
  auditAction?: string;
}

export const FinancialComponentGuard: React.FC<FinancialComponentGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallback = React.createElement('div', {}, 'Access Denied'),
  auditAction
}) => {
  // Implementation would check permissions using your auth context
  // For now, returning placeholder
  const hasAccess = true; // Would check actual permissions

  if (!hasAccess) {
    return React.createElement(React.Fragment, {}, fallback);
  }

  return React.createElement(React.Fragment, {}, children);
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Decorator for financial API routes
 */
export function requireFinancialPermissions(permissions: FinancialPermission[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0] as NextRequest;

      // Check permissions before executing the method
      const middleware = new FinancialSecurityMiddleware();
      const guard = middleware.createMiddleware({
        requiredPermissions: permissions,
        auditAction: `API_${propertyKey.toUpperCase()}`
      });

      const guardResult = await guard(req);
      if (guardResult instanceof Response && guardResult.status !== 200) {
        return guardResult;
      }

      // Execute the original method
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Check if user can access financial resource
 */
export async function canAccessFinancialResource(
  userId: string,
  organizationId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const accessControl = new FinancialAccessControlService();
  const context = FinancialAccessControlService.createAccessContext(userId, organizationId);

  const result = await accessControl.checkResourceAccess(context, {
    resource,
    action,
    organizationId
  });

  return result.granted;
}

export default FinancialSecurityMiddleware;