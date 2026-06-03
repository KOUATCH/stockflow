"use client"

import { getLocaleFromPathname, localizePath } from "@/i18n/routing"
import { DEFAULT_LOCALE } from "@/types/bilingual"
import { useSession as useNextAuthSession } from "next-auth/react"

export function useSession() {
  return useNextAuthSession()
}

export function useAuth() {
  const { data: session, status } = useNextAuthSession()

  return {
    user: session?.user || null,
    isLoading: status === "loading",
    isAuthenticated: !!session?.user,
    session,
    status
  }
}

// Email verification functions for NextAuth v5
export async function verifyEmail({ query }: { query: { token: string } }) {
  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: query.token }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: { message: result.error || 'Verification failed' } }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Email verification error:', error)
    return { error: { message: 'Network error during verification' } }
  }
}

export async function sendVerificationEmail({ email, callbackURL }: { email: string, callbackURL: string }) {
  try {
    const response = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, callbackURL }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: { message: result.error || 'Failed to send verification email' } }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Send verification email error:', error)
    return { error: { message: 'Network error while sending email' } }
  }
}

export function usePermissions() {
  const { data: session } = useNextAuthSession()
  const userPermissions = session?.user?.permissions || []

  return {
    // Raw permissions array
    permissions: userPermissions,

    // Check single permission
    hasPermission: (permission: string) => userPermissions.includes('*') || userPermissions.includes(permission),

    // Check if user has any of the provided permissions
    hasAnyPermission: (permissions: string[]) => userPermissions.includes('*') || permissions.some(p => userPermissions.includes(p)),

    // Check if user has all of the provided permissions
    hasAllPermissions: (permissions: string[]) => userPermissions.includes('*') || permissions.every(p => userPermissions.includes(p)),

    // User info
    user: session?.user,
    isAuthenticated: !!session?.user,
  }
}

// Client-safe signOut function that doesn't import server auth
export async function signOut(options?: { redirectTo?: string; redirect?: boolean }) {
  // Use next-auth/react for client-side signOut
  const { signOut: nextSignOut } = await import("next-auth/react");

  // Use absolute URL to ensure correct port
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const currentLocale =
    typeof window === "undefined"
      ? DEFAULT_LOCALE
      : getLocaleFromPathname(window.location.pathname) ?? DEFAULT_LOCALE;
  const redirectPath = localizePath(options?.redirectTo || "/login", currentLocale);
  const callbackUrl = redirectPath.startsWith('http') ? redirectPath : `${baseUrl}${redirectPath}`;

  console.log("SignOut debug:", { baseUrl, redirectPath, callbackUrl, options });

  if (options?.redirect === false) {
    return nextSignOut({ callbackUrl, redirect: false });
  }

  return nextSignOut({ callbackUrl, redirect: true });
}

export default useAuth
