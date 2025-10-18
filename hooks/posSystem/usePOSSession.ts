"use client"

// Legacy wrapper for backward compatibility
// This file re-exports the unified session management system

export { useSessionManagement as usePOSSession } from '@/hooks/sessions/useSessionManagement'
export { useSessionManagement as usePOSSessionManager } from '@/hooks/sessions/useSessionManagement'

// For heartbeat functionality, users should use the unified session management hook
// with enableAutoRefetch: true
export function usePOSSessionHeartbeat(sessionId: string | null, enabled: boolean = true) {
  // This is now handled automatically by the unified session management system
  // Users should use useSessionManagement with enableAutoRefetch: true instead
  return
}

// Legacy type exports - redirect to unified types
export type { SessionData as CreateSessionData } from '@/actions/sessions/types'
export type { SessionWithDetails as POSSession } from '@/actions/sessions/types'