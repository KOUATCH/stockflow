import type { POSSession, POSSessionStatus, User, Location, CashDrawer, CashDrawerTransaction } from "@prisma/client"

// Core session interfaces
export interface SessionData {
  stationId: string
  userId: string
  locationId: string
  organizationId: string
  openingBalance: number
}

export interface CloseSessionData {
  sessionId: string
  stationId: string
  closingBalance: number
  userId: string
}

export interface SessionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Extended session with relations
export interface SessionWithDetails extends POSSession {
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>
  location?: Pick<Location, 'id' | 'name' | 'organizationId'>
  cashDrawerTransactions?: (CashDrawerTransaction & {
    cashDrawer?: Pick<CashDrawer, 'id' | 'name' | 'currentBalance' | 'expectedBalance' | 'isOpen'>
  })[]
}

// Session history filters
export interface SessionFilters {
  stationId?: string
  organizationId?: string
  locationId?: string
  userId?: string
  status?: POSSessionStatus[]
  startDate?: Date
  endDate?: Date
}

// Pagination
export interface Pagination {
  skip?: number
  take?: number
}

// Session history response
export interface SessionHistoryResponse {
  sessions: SessionWithDetails[]
  total: number
  pagination: Required<Pagination>
}

// Session states for UI
export type SessionState = 'loading' | 'active' | 'inactive' | 'error'

// Session management hook return type
export interface UseSessionManagement {
  // Session data
  currentSession: SessionWithDetails | null
  sessionLoading: boolean
  sessionError: any

  // Session actions
  startSession: (
    openingBalance: number,
    userId: string,
    locationId: string,
    organizationId: string
  ) => Promise<SessionResponse>
  endSession: (closingBalance?: number) => Promise<SessionResponse>
  refetchSession: () => Promise<any>
  forceCloseSession: () => Promise<SessionResponse>

  // Mutation states
  isOpeningSession: boolean
  isClosingSession: boolean

  // Helper properties
  isSessionActive: boolean
  sessionDuration: number
  sessionState: SessionState
}

// TanStack Query keys
export const SESSION_QUERY_KEYS = {
  currentSession: (stationId: string) => ['currentSession', stationId] as const,
  sessionHistory: (filters: SessionFilters) => ['sessionHistory', filters] as const,
  cashDrawer: (stationId: string) => ['cashDrawer', stationId] as const,
  realTimeBalance: (sessionId: string) => ['realTimeBalance', sessionId] as const,
} as const

// Session validation
export interface SessionValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Session statistics
export interface SessionStats {
  totalSessions: number
  activeSessions: number
  averageSessionDuration: number
  totalSales: number
  totalVariance: number
}

// Default export removed - use named exports instead
