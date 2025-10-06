/**
 * Enhanced session security features
 * Implements session rotation, invalidation, and advanced security checks
 */

import crypto from "crypto";
import { headers } from "next/headers";

interface SessionSecurityInfo {
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  country?: string;
  lastActivity: Date;
  loginTime: Date;
  isActive: boolean;
  riskScore: number;
}

interface SecurityEvent {
  type: 'LOGIN' | 'LOGOUT' | 'PRIVILEGE_CHANGE' | 'SUSPICIOUS_ACTIVITY' | 'PASSWORD_CHANGE';
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: Record<string, any>;
}

// In-memory store for session security info (use Redis in production)
const sessionSecurityStore: Map<string, SessionSecurityInfo> = new Map();
const securityEvents: SecurityEvent[] = [];

/**
 * Generate device fingerprint from request headers
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const headersList = await headers();

  const fingerprintData = [
    headersList.get('user-agent') || '',
    headersList.get('accept-language') || '',
    headersList.get('accept-encoding') || '',
    headersList.get('accept') || '',
    headersList.get('sec-ch-ua') || '',
    headersList.get('sec-ch-ua-platform') || '',
  ].join('|');

  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
}

/**
 * Get client IP with fallbacks
 */
export async function getClientIP(): Promise<string> {
  const headersList = await headers();

  return headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
         headersList.get('x-real-ip') ||
         headersList.get('cf-connecting-ip') ||
         headersList.get('x-client-ip') ||
         '127.0.0.1';
}

/**
 * Calculate risk score based on session characteristics
 */
function calculateRiskScore(securityInfo: SessionSecurityInfo): number {
  let riskScore = 0;

  // Time-based risk factors
  const hoursSinceLogin = (Date.now() - securityInfo.loginTime.getTime()) / (1000 * 60 * 60);
  if (hoursSinceLogin > 24) riskScore += 20;
  if (hoursSinceLogin > 72) riskScore += 30;

  // Activity-based risk factors
  const hoursSinceActivity = (Date.now() - securityInfo.lastActivity.getTime()) / (1000 * 60 * 60);
  if (hoursSinceActivity > 4) riskScore += 10;
  if (hoursSinceActivity > 24) riskScore += 20;

  // Location-based risk (simplified)
  // In production, implement proper geolocation checks
  if (securityInfo.country && securityInfo.country !== 'US') {
    riskScore += 15;
  }

  return Math.min(riskScore, 100);
}

/**
 * Create session security record
 */
export async function createSessionSecurity(
  sessionId: string,
  userId: string
): Promise<void> {
  const deviceFingerprint = await generateDeviceFingerprint();
  const ipAddress = await getClientIP();
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  const securityInfo: SessionSecurityInfo = {
    deviceFingerprint,
    ipAddress,
    userAgent,
    lastActivity: new Date(),
    loginTime: new Date(),
    isActive: true,
    riskScore: 0
  };

  securityInfo.riskScore = calculateRiskScore(securityInfo);

  sessionSecurityStore.set(sessionId, securityInfo);

  // Log security event
  await logSecurityEvent({
    type: 'LOGIN',
    userId,
    sessionId,
    ipAddress,
    userAgent,
    timestamp: new Date(),
    details: { deviceFingerprint, riskScore: securityInfo.riskScore }
  });
}

/**
 * Validate session security
 */
export async function validateSessionSecurity(
  sessionId: string,
  userId: string
): Promise<{
  valid: boolean;
  requiresReauth?: boolean;
  riskScore?: number;
  reason?: string;
}> {
  const securityInfo = sessionSecurityStore.get(sessionId);

  if (!securityInfo) {
    return { valid: false, reason: 'Session security info not found' };
  }

  // Check if session is marked as inactive
  if (!securityInfo.isActive) {
    return { valid: false, reason: 'Session marked as inactive' };
  }

  // Device fingerprint validation
  const currentFingerprint = await generateDeviceFingerprint();
  if (securityInfo.deviceFingerprint !== currentFingerprint) {
    await logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      userId,
      sessionId,
      ipAddress: await getClientIP(),
      userAgent: (await headers()).get('user-agent') || '',
      timestamp: new Date(),
      details: {
        reason: 'Device fingerprint mismatch',
        original: securityInfo.deviceFingerprint,
        current: currentFingerprint
      }
    });

    return {
      valid: false,
      reason: 'Device fingerprint changed - possible session hijacking'
    };
  }

  // IP address validation (allow some flexibility)
  const currentIP = await getClientIP();
  if (securityInfo.ipAddress !== currentIP) {
    // Log but don't immediately invalidate (users might have dynamic IPs)
    await logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      userId,
      sessionId,
      ipAddress: currentIP,
      userAgent: (await headers()).get('user-agent') || '',
      timestamp: new Date(),
      details: {
        reason: 'IP address changed',
        original: securityInfo.ipAddress,
        current: currentIP
      }
    });

    // Update IP but increase risk score
    securityInfo.ipAddress = currentIP;
    securityInfo.riskScore += 25;
  }

  // Update last activity
  securityInfo.lastActivity = new Date();

  // Recalculate risk score
  const newRiskScore = calculateRiskScore(securityInfo);
  securityInfo.riskScore = newRiskScore;

  // High risk score requires re-authentication
  if (newRiskScore > 70) {
    return {
      valid: true,
      requiresReauth: true,
      riskScore: newRiskScore,
      reason: 'High risk session - requires re-authentication'
    };
  }

  return { valid: true, riskScore: newRiskScore };
}

/**
 * Invalidate session security
 */
export async function invalidateSessionSecurity(
  sessionId: string,
  userId: string,
  reason: string = 'Manual logout'
): Promise<void> {
  const securityInfo = sessionSecurityStore.get(sessionId);

  if (securityInfo) {
    securityInfo.isActive = false;
  }

  await logSecurityEvent({
    type: 'LOGOUT',
    userId,
    sessionId,
    ipAddress: await getClientIP(),
    userAgent: (await headers()).get('user-agent') || '',
    timestamp: new Date(),
    details: { reason }
  });

  // Remove from store after a delay (for audit purposes)
  setTimeout(() => {
    sessionSecurityStore.delete(sessionId);
  }, 24 * 60 * 60 * 1000); // 24 hours
}

/**
 * Rotate session on privilege change
 */
export async function rotateSessionOnPrivilegeChange(
  oldSessionId: string,
  newSessionId: string,
  userId: string
): Promise<void> {
  // Transfer security info to new session
  const oldSecurityInfo = sessionSecurityStore.get(oldSessionId);

  if (oldSecurityInfo) {
    const newSecurityInfo: SessionSecurityInfo = {
      ...oldSecurityInfo,
      lastActivity: new Date(),
      riskScore: Math.max(0, oldSecurityInfo.riskScore - 10) // Reduce risk on rotation
    };

    sessionSecurityStore.set(newSessionId, newSecurityInfo);
    sessionSecurityStore.delete(oldSessionId);
  }

  await logSecurityEvent({
    type: 'PRIVILEGE_CHANGE',
    userId,
    sessionId: newSessionId,
    ipAddress: await getClientIP(),
    userAgent: (await headers()).get('user-agent') || '',
    timestamp: new Date(),
    details: { oldSessionId, newSessionId }
  });
}

/**
 * Log security events
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  // Store in memory (in production, use database)
  securityEvents.push(event);

  // Keep only last 1000 events to prevent memory leaks
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000);
  }

  // Log to console for debugging
  console.log('Security Event:', {
    type: event.type,
    userId: event.userId,
    sessionId: event.sessionId?.substring(0, 8) + '...',
    ipAddress: event.ipAddress,
    timestamp: event.timestamp.toISOString(),
    details: event.details
  });

  // In production, send critical events to security monitoring
  if (['SUSPICIOUS_ACTIVITY', 'PRIVILEGE_CHANGE'].includes(event.type)) {
    // await sendToSecurityMonitoring(event);
  }
}

/**
 * Get session security status
 */
export async function getSessionSecurityStatus(sessionId: string): Promise<{
  exists: boolean;
  isActive: boolean;
  riskScore: number;
  lastActivity?: Date;
  loginTime?: Date;
  deviceFingerprint?: string;
  ipAddress?: string;
}> {
  const securityInfo = sessionSecurityStore.get(sessionId);

  if (!securityInfo) {
    return { exists: false, isActive: false, riskScore: 100 };
  }

  return {
    exists: true,
    isActive: securityInfo.isActive,
    riskScore: securityInfo.riskScore,
    lastActivity: securityInfo.lastActivity,
    loginTime: securityInfo.loginTime,
    deviceFingerprint: securityInfo.deviceFingerprint,
    ipAddress: securityInfo.ipAddress
  };
}

/**
 * Get security events for a user
 */
export async function getUserSecurityEvents(
  userId: string,
  limit: number = 50
): Promise<SecurityEvent[]> {
  return securityEvents
    .filter(event => event.userId === userId)
    .slice(-limit)
    .reverse();
}

/**
 * Detect concurrent sessions (multiple active sessions for same user)
 */
export async function detectConcurrentSessions(userId: string): Promise<{
  count: number;
  sessions: string[];
  suspicious: boolean;
}> {
  const userSessions: string[] = [];

  for (const [sessionId, securityInfo] of sessionSecurityStore.entries()) {
    if (securityInfo.isActive) {
      // In a real implementation, you'd query the database for user sessions
      // For now, we'll simulate by checking session events
      const recentLoginEvent = securityEvents.find(
        event => event.sessionId === sessionId &&
                event.type === 'LOGIN' &&
                event.userId === userId &&
                Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000 // 24 hours
      );

      if (recentLoginEvent) {
        userSessions.push(sessionId);
      }
    }
  }

  return {
    count: userSessions.length,
    sessions: userSessions,
    suspicious: userSessions.length > 3 // Suspicious if more than 3 concurrent sessions
  };
}

/**
 * Force logout all sessions for a user
 */
export async function forceLogoutAllSessions(
  userId: string,
  reason: string = 'Security measure'
): Promise<{ sessionsTerminated: number }> {
  let terminatedCount = 0;

  for (const [sessionId, securityInfo] of sessionSecurityStore.entries()) {
    if (securityInfo.isActive) {
      // Check if this session belongs to the user (simplified check)
      const sessionEvent = securityEvents.find(
        event => event.sessionId === sessionId &&
                event.userId === userId &&
                event.type === 'LOGIN'
      );

      if (sessionEvent) {
        await invalidateSessionSecurity(sessionId, userId, reason);
        terminatedCount++;
      }
    }
  }

  return { sessionsTerminated: terminatedCount };
}

/**
 * Session timeout management
 */
export class SessionTimeout {
  private static timeouts: Map<string, NodeJS.Timeout> = new Map();

  static setInactivityTimeout(sessionId: string, timeoutMs: number): void {
    // Clear existing timeout
    this.clearTimeout(sessionId);

    // Set new timeout
    const timeout = setTimeout(() => {
      const securityInfo = sessionSecurityStore.get(sessionId);
      if (securityInfo) {
        securityInfo.isActive = false;
      }
    }, timeoutMs);

    this.timeouts.set(sessionId, timeout);
  }

  static refreshTimeout(sessionId: string, timeoutMs: number): void {
    this.setInactivityTimeout(sessionId, timeoutMs);
  }

  static clearTimeout(sessionId: string): void {
    const timeout = this.timeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(sessionId);
    }
  }
}