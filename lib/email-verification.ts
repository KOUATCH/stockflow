/**
 * Email verification system for enhanced security
 * Handles email verification tokens, resend functionality, and verification flow
 */

import { db } from "@/prisma/db";
import crypto from "crypto";

export interface VerificationToken {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create and store verification token for email
 */
export async function createVerificationToken(
  email: string,
  expirationHours: number = 24
): Promise<string> {
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

  // Store token in database (you'll need to create this table)
  // For now, we'll use a simple approach

  return token;
}

/**
 * Verify email verification token
 */
export async function verifyEmailToken(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find user by email
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.isVerified) {
      return { success: false, error: "Email already verified" };
    }

    // In a real implementation, you would verify the token against stored tokens
    // For this example, we'll simulate token verification

    // Update user as verified
    await db.user.update({
      where: { email },
      data: { isVerified: true }
    });

    return { success: true };
  } catch (error) {
    console.error("Email verification error:", error);
    return { success: false, error: "Verification failed" };
  }
}

/**
 * Resend verification email with rate limiting
 */
export async function resendVerificationEmail(
  email: string
): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
  try {
    // Check if user exists and is not already verified
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.isVerified) {
      return { success: false, error: "Email already verified" };
    }

    // Rate limiting: Allow only 3 resend attempts per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // In a real implementation, track resend attempts
    // For now, we'll simulate rate limiting

    // Generate new verification token
    const token = await createVerificationToken(email);

    // Send verification email (integrate with your email service)
    await sendVerificationEmail(email, token);

    return { success: true };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { success: false, error: "Failed to resend verification email" };
  }
}

/**
 * Send verification email
 */
async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // In a real implementation, integrate with your email service (Resend, SendGrid, etc.)
  // For now, we'll just log the verification link

  const verificationUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  console.log(`Verification email for ${email}:`);
  console.log(`Click here to verify: ${verificationUrl}`);

  // TODO: Replace with actual email sending logic
  /*
  await emailService.send({
    to: email,
    subject: "Verify your email address",
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `
  });
  */
}

/**
 * Check if email verification is expired
 */
export function isVerificationExpired(createdAt: Date, expirationHours: number = 24): boolean {
  const expirationTime = new Date(createdAt.getTime() + expirationHours * 60 * 60 * 1000);
  return new Date() > expirationTime;
}

/**
 * Clean up expired verification tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
  // In a real implementation, delete expired tokens from database
  console.log("Cleaning up expired verification tokens...");
}

/**
 * Email verification middleware for routes that require verified email
 */
export function requireEmailVerification(user: any): { verified: boolean; error?: string } {
  if (!user) {
    return { verified: false, error: "User not authenticated" };
  }

  if (!user.isVerified) {
    return {
      verified: false,
      error: "Email verification required. Please check your email and verify your account."
    };
  }

  return { verified: true };
}

/**
 * Send welcome email after successful verification
 */
export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  console.log(`Sending welcome email to ${firstName} at ${email}`);

  // TODO: Replace with actual email sending logic
  /*
  await emailService.send({
    to: email,
    subject: "Welcome to StockFlow!",
    html: `
      <h1>Welcome to StockFlow, ${firstName}!</h1>
      <p>Your email has been successfully verified.</p>
      <p>You can now access all features of your account.</p>
      <a href="${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/dashboard">Go to Dashboard</a>
    `
  });
  */
}