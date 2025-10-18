// Unified session hook exports
export {
  useSessionManagement,
  useSessionHistory,
  // Legacy exports for backward compatibility
  useSessionManagementModern,
  usePOSSession
} from './useSessionManagement'

export type {
  UseSessionManagement,
  SessionState
} from '@/actions/sessions/types'

// Re-export session query keys for convenience
export { SESSION_QUERY_KEYS } from '@/actions/sessions/types'