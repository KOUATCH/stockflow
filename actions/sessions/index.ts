// Unified session management exports
export {
  createPOSSession,
  closePOSSession,
  getCurrentSession,
  forceCloseActiveSession,
  getSessionHistory,
  // Legacy aliases
  openPOSSession,
  startSession,
  endSession
} from './pos-session-actions'

export type {
  SessionData,
  CloseSessionData,
  SessionResponse,
  SessionWithDetails,
  SessionFilters,
  Pagination,
  SessionHistoryResponse,
  SessionState,
  UseSessionManagement,
  SessionValidation,
  SessionStats
} from './types'

export { SESSION_QUERY_KEYS } from './types'