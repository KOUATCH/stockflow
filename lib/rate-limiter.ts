/**
 * Advanced rate limiting and brute force protection system
 * Implements multiple strategies to prevent abuse and attacks
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  blockDuration: number; // How long to block after exceeding limit
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blockedUntil?: number;
  };
}

// In-memory store (in production, use Redis for distributed systems)
const rateLimitStore: RateLimitStore = {};

// Different rate limit configurations for various endpoints
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - very strict
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // 5 attempts per 15 minutes
    blockDuration: 30 * 60 * 1000, // Block for 30 minutes
    skipSuccessfulRequests: true,
  },

  REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3, // 3 registration attempts per hour
    blockDuration: 2 * 60 * 60 * 1000, // Block for 2 hours
    skipSuccessfulRequests: true,
  },

  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3, // 3 password reset attempts per hour
    blockDuration: 60 * 60 * 1000, // Block for 1 hour
    skipSuccessfulRequests: true,
  },

  // API endpoints - moderate
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 60, // 60 requests per minute
    blockDuration: 5 * 60 * 1000, // Block for 5 minutes
  },

  // Sensitive operations - strict
  ROLE_MANAGEMENT: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxAttempts: 10, // 10 attempts per 5 minutes
    blockDuration: 15 * 60 * 1000, // Block for 15 minutes
  },

  USER_MANAGEMENT: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxAttempts: 20, // 20 attempts per 5 minutes
    blockDuration: 10 * 60 * 1000, // Block for 10 minutes
  }
} as const;

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Get client identifier from request
   * Uses multiple fallbacks: IP, X-Forwarded-For, X-Real-IP
   */
  private getClientId(request: NextRequest, userId?: string): string {
    // If user is authenticated, use user ID for more accurate tracking
    if (userId) {
      return `user:${userId}`;
    }

    // Get IP address with fallbacks
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0].trim() || realIp || 'unknown';

    return `ip:${ip}`;
  }

  /**
   * Check if request is rate limited
   */
  async isRateLimited(
    request: NextRequest,
    endpoint: string,
    userId?: string
  ): Promise<{ limited: boolean; retryAfter?: number; remaining?: number }> {
    const clientId = this.getClientId(request, userId);
    const key = `${endpoint}:${clientId}`;
    const now = Date.now();

    // Clean up expired entries
    this.cleanup();

    let entry = rateLimitStore[key];

    // Check if currently blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return {
        limited: true,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
      };
    }

    // Initialize or reset if window expired
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs
      };
      rateLimitStore[key] = entry;
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxAttempts) {
      // Block the client
      entry.blockedUntil = now + this.config.blockDuration;

      return {
        limited: true,
        retryAfter: Math.ceil(this.config.blockDuration / 1000)
      };
    }

    // Increment counter
    entry.count++;

    return {
      limited: false,
      remaining: this.config.maxAttempts - entry.count
    };
  }

  /**
   * Record a successful request (may reset counter based on config)
   */
  async recordSuccess(request: NextRequest, endpoint: string, userId?: string): Promise<void> {
    if (this.config.skipSuccessfulRequests) {
      const clientId = this.getClientId(request, userId);
      const key = `${endpoint}:${clientId}`;

      // Reset the counter on successful request
      if (rateLimitStore[key]) {
        delete rateLimitStore[key];
      }
    }
  }

  /**
   * Record a failed request
   */
  async recordFailure(request: NextRequest, endpoint: string, userId?: string): Promise<void> {
    if (this.config.skipFailedRequests) {
      return; // Don't count failed requests
    }

    // Failed requests are already counted in isRateLimited
    // This method is for custom logic if needed
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Object.entries(rateLimitStore)) {
      // Remove if reset time has passed and not currently blocked
      if (entry.resetTime <= now && (!entry.blockedUntil || entry.blockedUntil <= now)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => delete rateLimitStore[key]);
  }

  /**
   * Get current status for a client
   */
  async getStatus(request: NextRequest, endpoint: string, userId?: string): Promise<{
    count: number;
    remaining: number;
    resetTime: number;
    blocked: boolean;
    blockedUntil?: number;
  }> {
    const clientId = this.getClientId(request, userId);
    const key = `${endpoint}:${clientId}`;
    const entry = rateLimitStore[key];
    const now = Date.now();

    if (!entry) {
      return {
        count: 0,
        remaining: this.config.maxAttempts,
        resetTime: now + this.config.windowMs,
        blocked: false
      };
    }

    const blocked = entry.blockedUntil ? entry.blockedUntil > now : false;

    return {
      count: entry.count,
      remaining: Math.max(0, this.config.maxAttempts - entry.count),
      resetTime: entry.resetTime,
      blocked,
      blockedUntil: entry.blockedUntil
    };
  }
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.LOGIN);
export const registerRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.REGISTER);
export const passwordResetRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.PASSWORD_RESET);
export const apiRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.API_GENERAL);
export const roleManagementRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.ROLE_MANAGEMENT);
export const userManagementRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.USER_MANAGEMENT);

/**
 * Middleware helper for rate limiting
 */
export async function withRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter,
  endpoint: string,
  userId?: string
): Promise<NextResponse | null> {
  const result = await rateLimiter.isRateLimited(request, endpoint, userId);

  if (result.limited) {
    const response = NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: result.retryAfter,
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`
      },
      { status: 429 }
    );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimiter['config'].maxAttempts.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', (Date.now() + (result.retryAfter! * 1000)).toString());
    response.headers.set('Retry-After', result.retryAfter!.toString());

    return response;
  }

  return null; // Not rate limited, proceed
}

/**
 * Progressive delay for repeated failures
 * Implements exponential backoff for brute force protection
 */
export class ProgressiveDelay {
  private static delays: { [key: string]: { count: number; lastAttempt: number } } = {};

  static async addDelay(clientId: string, baseDelayMs: number = 1000): Promise<void> {
    const now = Date.now();
    const entry = this.delays[clientId] || { count: 0, lastAttempt: 0 };

    // Reset if more than 1 hour since last attempt
    if (now - entry.lastAttempt > 60 * 60 * 1000) {
      entry.count = 0;
    }

    entry.count++;
    entry.lastAttempt = now;
    this.delays[clientId] = entry;

    // Calculate exponential delay: baseDelay * 2^(attempts-1)
    const delayMs = Math.min(baseDelayMs * Math.pow(2, entry.count - 1), 30000); // Max 30 seconds

    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  static reset(clientId: string): void {
    delete this.delays[clientId];
  }
}

/**
 * IP-based blocking for severe abuse
 */
export class IPBlocklist {
  private static blockedIPs: Set<string> = new Set();
  private static temporaryBlocks: { [ip: string]: number } = {};

  static blockIP(ip: string, durationMs?: number): void {
    if (durationMs) {
      // Temporary block
      this.temporaryBlocks[ip] = Date.now() + durationMs;
    } else {
      // Permanent block
      this.blockedIPs.add(ip);
    }
  }

  static isBlocked(ip: string): boolean {
    // Check permanent block
    if (this.blockedIPs.has(ip)) {
      return true;
    }

    // Check temporary block
    const blockUntil = this.temporaryBlocks[ip];
    if (blockUntil && blockUntil > Date.now()) {
      return true;
    }

    // Clean up expired temporary blocks
    if (blockUntil && blockUntil <= Date.now()) {
      delete this.temporaryBlocks[ip];
    }

    return false;
  }

  static unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    delete this.temporaryBlocks[ip];
  }
}

/**
 * CAPTCHA requirement after multiple failures
 */
export class CaptchaRequirement {
  private static requirements: { [key: string]: { required: boolean; failures: number } } = {};

  static checkRequirement(clientId: string): boolean {
    const entry = this.requirements[clientId];
    return entry?.required || false;
  }

  static recordFailure(clientId: string): void {
    const entry = this.requirements[clientId] || { required: false, failures: 0 };
    entry.failures++;

    // Require CAPTCHA after 3 failures
    if (entry.failures >= 3) {
      entry.required = true;
    }

    this.requirements[clientId] = entry;
  }

  static recordSuccess(clientId: string): void {
    delete this.requirements[clientId];
  }
}