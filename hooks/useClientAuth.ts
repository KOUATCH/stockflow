"use client"

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Client-side authentication hook that handles redirects safely
 * Use this in client components instead of server-side auth checks
 */
export function useClientAuth(required = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (required && status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, required, router])

  return {
    session,
    status,
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    organizationId: session?.user?.organizationId,
  }
}

/**
 * Hook for components that need to ensure user has organizationId
 */
export function useOrgAuth() {
  const auth = useClientAuth(true)
  const router = useRouter()

  useEffect(() => {
    if (auth.isAuthenticated && !auth.organizationId) {
      router.push('/register') // or setup organization page
    }
  }, [auth.isAuthenticated, auth.organizationId, router])

  return {
    ...auth,
    hasOrganization: !!auth.organizationId,
  }
}