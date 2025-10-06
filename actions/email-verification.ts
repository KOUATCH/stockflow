"use server";

import { verifyEmailToken, resendVerificationEmail } from "@/lib/email-verification";
import { checkAuthRateLimit, getClientIP } from "@/lib/rate-limit-helpers";

export async function verifyEmail(email: string, token: string) {
  try {
    // Rate limiting for verification attempts
    const rateLimit = await checkAuthRateLimit(email);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many verification attempts. Please try again in ${Math.ceil(rateLimit.retryAfter! / 60)} minutes.`,
      };
    }

    const result = await verifyEmailToken(email, token);

    if (result.success) {
      return {
        success: true,
        message: "Email successfully verified! You can now log in to your account.",
      };
    } else {
      return {
        success: false,
        error: result.error || "Email verification failed",
      };
    }
  } catch (error) {
    console.error("Email verification action error:", error);
    return {
      success: false,
      error: "An error occurred during email verification. Please try again.",
    };
  }
}

export async function resendVerification(email: string) {
  try {
    // Rate limiting for resend attempts
    const clientIP = getClientIP();

    // Simple rate limiting for resend (3 attempts per hour per IP)
    if (!global.resendAttempts) {
      global.resendAttempts = {};
    }

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const key = `resend:${clientIP}:${email}`;

    const attempts = global.resendAttempts[key] || { count: 0, resetTime: now + oneHour };

    if (attempts.resetTime <= now) {
      attempts.count = 0;
      attempts.resetTime = now + oneHour;
    }

    if (attempts.count >= 3) {
      const retryAfter = Math.ceil((attempts.resetTime - now) / (60 * 1000));
      return {
        success: false,
        error: `Too many resend attempts. Please try again in ${retryAfter} minutes.`,
      };
    }

    attempts.count++;
    global.resendAttempts[key] = attempts;

    const result = await resendVerificationEmail(email);

    if (result.success) {
      return {
        success: true,
        message: "Verification email sent successfully. Please check your inbox.",
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to send verification email",
      };
    }
  } catch (error) {
    console.error("Resend verification action error:", error);
    return {
      success: false,
      error: "An error occurred while sending verification email. Please try again.",
    };
  }
}

// Declare global types for TypeScript
declare global {
  var resendAttempts: { [key: string]: { count: number; resetTime: number } } | undefined;
}