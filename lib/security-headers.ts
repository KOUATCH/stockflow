/**
 * Security headers configuration for comprehensive web application protection
 * Implements OWASP security header recommendations and modern security standards
 */

import { NextResponse } from "next/server";

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  xssProtection?: boolean;
  contentTypeOptions?: boolean;
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  hsts?: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  referrerPolicy?: string;
  permissionsPolicy?: string;
  crossOriginEmbedderPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
}

/**
 * Default security headers configuration
 */
export const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  // Content Security Policy - Prevents XSS and data injection attacks
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join("; "),

  // XSS Protection - Enables browser XSS filtering
  xssProtection: true,

  // Content Type Options - Prevents MIME type sniffing
  contentTypeOptions: true,

  // Frame Options - Prevents clickjacking
  frameOptions: 'DENY',

  // HTTP Strict Transport Security - Forces HTTPS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // Referrer Policy - Controls referrer information
  referrerPolicy: 'strict-origin-when-cross-origin',

  // Permissions Policy - Controls browser features
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'serial=()',
    'bluetooth=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
    'ambient-light-sensor=()',
    'encrypted-media=()',
    'autoplay=()'
  ].join(', '),

  // Cross-Origin Embedder Policy - Prevents loading of cross-origin resources
  crossOriginEmbedderPolicy: 'require-corp',

  // Cross-Origin Opener Policy - Prevents window references
  crossOriginOpenerPolicy: 'same-origin',

  // Cross-Origin Resource Policy - Controls resource sharing
  crossOriginResourcePolicy: 'same-origin'
};

/**
 * Environment-specific configurations
 */
export const DEVELOPMENT_HEADERS: SecurityHeadersConfig = {
  ...DEFAULT_SECURITY_HEADERS,
  // Relaxed CSP for development
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com localhost:*",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "connect-src 'self' ws: wss: http://localhost:* https://localhost:*",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join("; "),
  // Disable HSTS in development
  hsts: undefined
};

/**
 * Production security headers with stricter policies
 */
export const PRODUCTION_HEADERS: SecurityHeadersConfig = {
  ...DEFAULT_SECURITY_HEADERS,
  // Stricter CSP for production
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' https://cdn.jsdelivr.net",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "media-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join("; "),
  // Enhanced HSTS for production
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true
  }
};

/**
 * Security headers manager
 */
export class SecurityHeaders {
  private config: SecurityHeadersConfig;

  constructor(config?: SecurityHeadersConfig) {
    // Use environment-specific configuration
    const isDevelopment = process.env.NODE_ENV === 'development';
    this.config = config || (isDevelopment ? DEVELOPMENT_HEADERS : PRODUCTION_HEADERS);
  }

  /**
   * Apply security headers to a NextResponse
   */
  applyHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    if (this.config.contentSecurityPolicy) {
      response.headers.set('Content-Security-Policy', this.config.contentSecurityPolicy);
    }

    // X-XSS-Protection
    if (this.config.xssProtection) {
      response.headers.set('X-XSS-Protection', '1; mode=block');
    }

    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // X-Frame-Options
    if (this.config.frameOptions) {
      response.headers.set('X-Frame-Options', this.config.frameOptions);
    }

    // Strict-Transport-Security
    if (this.config.hsts && process.env.NODE_ENV === 'production') {
      const hstsValue = [
        `max-age=${this.config.hsts.maxAge}`,
        this.config.hsts.includeSubDomains ? 'includeSubDomains' : null,
        this.config.hsts.preload ? 'preload' : null
      ].filter(Boolean).join('; ');

      response.headers.set('Strict-Transport-Security', hstsValue);
    }

    // Referrer-Policy
    if (this.config.referrerPolicy) {
      response.headers.set('Referrer-Policy', this.config.referrerPolicy);
    }

    // Permissions-Policy
    if (this.config.permissionsPolicy) {
      response.headers.set('Permissions-Policy', this.config.permissionsPolicy);
    }

    // Cross-Origin-Embedder-Policy
    if (this.config.crossOriginEmbedderPolicy) {
      response.headers.set('Cross-Origin-Embedder-Policy', this.config.crossOriginEmbedderPolicy);
    }

    // Cross-Origin-Opener-Policy
    if (this.config.crossOriginOpenerPolicy) {
      response.headers.set('Cross-Origin-Opener-Policy', this.config.crossOriginOpenerPolicy);
    }

    // Cross-Origin-Resource-Policy
    if (this.config.crossOriginResourcePolicy) {
      response.headers.set('Cross-Origin-Resource-Policy', this.config.crossOriginResourcePolicy);
    }

    // Additional security headers
    this.applyAdditionalHeaders(response);

    return response;
  }

  /**
   * Apply additional security headers
   */
  private applyAdditionalHeaders(response: NextResponse): void {
    // X-DNS-Prefetch-Control - Controls DNS prefetching
    response.headers.set('X-DNS-Prefetch-Control', 'off');

    // X-Download-Options - Prevents IE from executing downloads
    response.headers.set('X-Download-Options', 'noopen');

    // X-Permitted-Cross-Domain-Policies - Controls Adobe Flash/PDF cross-domain
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    // Cache-Control for sensitive pages
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Remove server information
    response.headers.delete('Server');
    response.headers.delete('X-Powered-By');

    // Add custom security identifier
    response.headers.set('X-Security-Framework', 'StockFlow-Security-v1.0');
  }

  /**
   * Get CSP nonce for inline scripts/styles
   */
  static generateNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * Create CSP with nonce support
   */
  static createCSPWithNonce(nonce: string, baseCSP?: string): string {
    const csp = baseCSP || DEFAULT_SECURITY_HEADERS.contentSecurityPolicy!;

    return csp
      .replace("script-src 'self'", `script-src 'self' 'nonce-${nonce}'`)
      .replace("style-src 'self'", `style-src 'self' 'nonce-${nonce}'`);
  }

  /**
   * Validate security headers on response
   */
  static validateHeaders(response: NextResponse): {
    valid: boolean;
    missing: string[];
    warnings: string[];
  } {
    const missing: string[] = [];
    const warnings: string[] = [];

    const requiredHeaders = [
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy'
    ];

    const productionHeaders = [
      'Strict-Transport-Security'
    ];

    // Check required headers
    for (const header of requiredHeaders) {
      if (!response.headers.get(header)) {
        missing.push(header);
      }
    }

    // Check production-specific headers
    if (process.env.NODE_ENV === 'production') {
      for (const header of productionHeaders) {
        if (!response.headers.get(header)) {
          missing.push(header);
        }
      }
    }

    // Check for potential issues
    const csp = response.headers.get('Content-Security-Policy');
    if (csp) {
      if (csp.includes("'unsafe-inline'")) {
        warnings.push("CSP contains 'unsafe-inline' directive");
      }
      if (csp.includes("'unsafe-eval'")) {
        warnings.push("CSP contains 'unsafe-eval' directive");
      }
      if (!csp.includes("frame-ancestors")) {
        warnings.push("CSP missing frame-ancestors directive");
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      warnings
    };
  }
}

/**
 * Route-specific security configurations
 */
export const ROUTE_SECURITY_CONFIGS: Record<string, SecurityHeadersConfig> = {
  // Admin routes - strictest security
  '/dashboard/admin': {
    ...PRODUCTION_HEADERS,
    frameOptions: 'DENY',
    contentSecurityPolicy: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "block-all-mixed-content"
    ].join("; ")
  },

  // API routes - API-specific headers
  '/api/': {
    ...DEFAULT_SECURITY_HEADERS,
    frameOptions: 'DENY',
    contentSecurityPolicy: "default-src 'none'; frame-ancestors 'none';"
  },

  // Public routes - relaxed for embedding
  '/': {
    ...DEFAULT_SECURITY_HEADERS,
    frameOptions: 'SAMEORIGIN'
  }
};

/**
 * Security header middleware helper
 */
export function applySecurityHeaders(
  response: NextResponse,
  pathname?: string,
  customConfig?: SecurityHeadersConfig
): NextResponse {
  // Determine configuration based on route
  let config = customConfig;

  if (!config && pathname) {
    // Find matching route configuration
    const matchingRoute = Object.keys(ROUTE_SECURITY_CONFIGS).find(route => {
      if (pathname === route) return true;
      if (route.endsWith('/') && pathname.startsWith(route)) return true;
      return false;
    });

    if (matchingRoute) {
      config = ROUTE_SECURITY_CONFIGS[matchingRoute];
    }
  }

  // Apply headers
  const securityHeaders = new SecurityHeaders(config);
  return securityHeaders.applyHeaders(response);
}

/**
 * Content Security Policy builder
 */
export class CSPBuilder {
  private directives: Map<string, string[]> = new Map();

  constructor(baseCSP?: string) {
    if (baseCSP) {
      this.parseCSP(baseCSP);
    }
  }

  /**
   * Add a directive
   */
  addDirective(directive: string, values: string[]): this {
    const existing = this.directives.get(directive) || [];
    this.directives.set(directive, [...existing, ...values]);
    return this;
  }

  /**
   * Remove a directive
   */
  removeDirective(directive: string): this {
    this.directives.delete(directive);
    return this;
  }

  /**
   * Build CSP string
   */
  build(): string {
    const policies: string[] = [];

    for (const [directive, values] of this.directives.entries()) {
      const uniqueValues = [...new Set(values)];
      policies.push(`${directive} ${uniqueValues.join(' ')}`);
    }

    return policies.join('; ');
  }

  /**
   * Parse existing CSP
   */
  private parseCSP(csp: string): void {
    const policies = csp.split(';').map(p => p.trim()).filter(Boolean);

    for (const policy of policies) {
      const parts = policy.split(' ');
      const directive = parts[0];
      const values = parts.slice(1);

      this.directives.set(directive, values);
    }
  }
}

/**
 * Security header testing utilities
 */
export class SecurityHeaderTester {
  /**
   * Test security headers against OWASP recommendations
   */
  static testOWASPCompliance(headers: Record<string, string>): {
    score: number;
    maxScore: number;
    passed: string[];
    failed: string[];
    recommendations: string[];
  } {
    const tests = [
      {
        name: 'Content-Security-Policy',
        test: () => !!headers['content-security-policy'],
        recommendation: 'Implement Content Security Policy to prevent XSS attacks'
      },
      {
        name: 'X-Content-Type-Options',
        test: () => headers['x-content-type-options'] === 'nosniff',
        recommendation: 'Add X-Content-Type-Options: nosniff to prevent MIME sniffing'
      },
      {
        name: 'X-Frame-Options',
        test: () => ['DENY', 'SAMEORIGIN'].includes(headers['x-frame-options']?.toUpperCase()),
        recommendation: 'Add X-Frame-Options to prevent clickjacking'
      },
      {
        name: 'Strict-Transport-Security',
        test: () => !!headers['strict-transport-security'] || process.env.NODE_ENV !== 'production',
        recommendation: 'Add HSTS header for production HTTPS enforcement'
      },
      {
        name: 'Referrer-Policy',
        test: () => !!headers['referrer-policy'],
        recommendation: 'Add Referrer-Policy to control referrer information'
      },
      {
        name: 'Permissions-Policy',
        test: () => !!headers['permissions-policy'],
        recommendation: 'Add Permissions-Policy to control browser features'
      }
    ];

    const passed: string[] = [];
    const failed: string[] = [];
    const recommendations: string[] = [];

    for (const test of tests) {
      if (test.test()) {
        passed.push(test.name);
      } else {
        failed.push(test.name);
        recommendations.push(test.recommendation);
      }
    }

    return {
      score: passed.length,
      maxScore: tests.length,
      passed,
      failed,
      recommendations
    };
  }
}