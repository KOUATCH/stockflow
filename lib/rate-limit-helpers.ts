/**
 * Rate limiting helpers for server actions and API routes
 * Provides utilities to implement rate limiting without direct NextRequest access
 */

import { headers } from "next/headers";
import { ProgressiveDelay } from "./rate-limiter";

interface MockRequest {
  headers: Headers;
  ip?: string;
}

/**
 * Create a mock request object from server action context
 */
async function createMockRequest(): Promise<MockRequest> {
  const headersList = await headers();

  return {
    headers: headersList,
    ip: headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
        headersList.get('x-real-ip') ||
        headersList.get('cf-connecting-ip') ||
        '127.0.0.1'
  };
}

/**
 * Rate limit helper for authentication attempts
 */
export async function checkAuthRateLimit(email: string): Promise<{
  allowed: boolean;
  retryAfter?: number;
  remaining?: number;
}> {
  try {
    const mockRequest = await createMockRequest() as any;
    const clientId = `email:${email}`;

    // Create a simple rate limit check based on email
    const rateLimitKey = `auth:${clientId}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    // Use a simple in-memory store for server actions
    if (!global.authAttempts) {
      global.authAttempts = {};
    }

    const attempts = global.authAttempts[rateLimitKey] || { count: 0, resetTime: now + windowMs };

    // Reset if window expired
    if (attempts.resetTime <= now) {
      attempts.count = 0;
      attempts.resetTime = now + windowMs;
    }

    // Check if rate limited
    if (attempts.count >= maxAttempts) {
      const retryAfter = Math.ceil((attempts.resetTime - now) / 1000);
      return {
        allowed: false,
        retryAfter
      };
    }

    // Increment counter
    attempts.count++;
    global.authAttempts[rateLimitKey] = attempts;

    return {
      allowed: true,
      remaining: maxAttempts - attempts.count
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow request if rate limiting fails
    return { allowed: true };
  }
}

/**
 * Rate limit helper for registration attempts
 */
export async function checkRegistrationRateLimit(ip: string): Promise<{
  allowed: boolean;
  retryAfter?: number;
}> {
  try {
    const rateLimitKey = `register:${ip}`;
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxAttempts = 3;

    if (!global.registerAttempts) {
      global.registerAttempts = {};
    }

    const attempts = global.registerAttempts[rateLimitKey] || { count: 0, resetTime: now + windowMs };

    // Reset if window expired
    if (attempts.resetTime <= now) {
      attempts.count = 0;
      attempts.resetTime = now + windowMs;
    }

    // Check if rate limited
    if (attempts.count >= maxAttempts) {
      const retryAfter = Math.ceil((attempts.resetTime - now) / 1000);
      return {
        allowed: false,
        retryAfter
      };
    }

    // Increment counter
    attempts.count++;
    global.registerAttempts[rateLimitKey] = attempts;

    return { allowed: true };
  } catch (error) {
    console.error('Registration rate limit check failed:', error);
    return { allowed: true };
  }
}

/**
 * Record successful authentication (reset rate limit)
 */
export async function recordAuthSuccess(email: string): Promise<void> {
  try {
    const clientId = `email:${email}`;
    const rateLimitKey = `auth:${clientId}`;

    if (global.authAttempts && global.authAttempts[rateLimitKey]) {
      delete global.authAttempts[rateLimitKey];
    }

    // Reset progressive delay
    ProgressiveDelay.reset(clientId);
  } catch (error) {
    console.error('Failed to record auth success:', error);
  }
}

/**
 * Record failed authentication attempt
 */
export async function recordAuthFailure(email: string): Promise<void> {
  try {
    const clientId = `email:${email}`;

    // Add progressive delay for repeated failures
    await ProgressiveDelay.addDelay(clientId, 1000);
  } catch (error) {
    console.error('Failed to record auth failure:', error);
  }
}

/**
 * Get client IP from headers
 */
export async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers();

    return headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
           headersList.get('x-real-ip') ||
           headersList.get('cf-connecting-ip') ||
           headersList.get('x-client-ip') ||
           '127.0.0.1';
  } catch (error) {
    // Return a default IP when running outside request context (e.g., in tests)
    return '127.0.0.1';
  }
}

/**
 * Brute force protection for user accounts
 */
export class AccountProtection {
  private static attempts: { [email: string]: { count: number; lastAttempt: number; lockedUntil?: number } } = {};

  static async checkAccountLock(email: string): Promise<{
    locked: boolean;
    lockedUntil?: number;
    attemptsRemaining?: number;
  }> {
    const now = Date.now();
    const entry = this.attempts[email];

    if (!entry) {
      return { locked: false, attemptsRemaining: 5 };
    }

    // Check if currently locked
    if (entry.lockedUntil && entry.lockedUntil > now) {
      return {
        locked: true,
        lockedUntil: entry.lockedUntil
      };
    }

    // Reset if more than 1 hour since last attempt
    if (now - entry.lastAttempt > 60 * 60 * 1000) {
      delete this.attempts[email];
      return { locked: false, attemptsRemaining: 5 };
    }

    return {
      locked: false,
      attemptsRemaining: Math.max(0, 5 - entry.count)
    };
  }

  static recordFailedAttempt(email: string): void {
    const now = Date.now();
    const entry = this.attempts[email] || { count: 0, lastAttempt: 0 };

    entry.count++;
    entry.lastAttempt = now;

    // Lock account after 5 failed attempts for 30 minutes
    if (entry.count >= 5) {
      entry.lockedUntil = now + (30 * 60 * 1000); // 30 minutes
    }

    this.attempts[email] = entry;
  }

  static recordSuccessfulAttempt(email: string): void {
    delete this.attempts[email];
  }
}

// Declare global types for TypeScript
declare global {
  var authAttempts: { [key: string]: { count: number; resetTime: number } } | undefined;
  var registerAttempts: { [key: string]: { count: number; resetTime: number } } | undefined;
}