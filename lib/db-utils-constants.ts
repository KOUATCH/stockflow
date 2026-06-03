/**
 * Database Constants and Utility Types
 *
 * This file contains non-server action constants and types for database utilities
 */

/**
 * Database operation types for monitoring and circuit breaker categorization
 */
export enum DbOperationType {
  READ = 'read',
  WRITE = 'write',
  TRANSACTION = 'transaction',
  BULK = 'bulk',
  ANALYTICS = 'analytics'
}

/**
 * Database performance metrics
 */
export interface DbMetrics {
  operationType: DbOperationType
  duration: number
  success: boolean
  recordCount?: number
  tableName?: string
  error?: string
}

/**
 * Circuit breaker configuration for database operations
 */
export const DB_CIRCUIT_BREAKER_CONFIG = {
  [DbOperationType.READ]: {
    failureThreshold: 10,
    recoveryTimeMs: 30000, // 30 seconds
    timeoutMs: 5000 // 5 seconds
  },
  [DbOperationType.WRITE]: {
    failureThreshold: 5,
    recoveryTimeMs: 60000, // 1 minute
    timeoutMs: 10000 // 10 seconds
  },
  [DbOperationType.TRANSACTION]: {
    failureThreshold: 3,
    recoveryTimeMs: 120000, // 2 minutes
    timeoutMs: 30000 // 30 seconds
  },
  [DbOperationType.BULK]: {
    failureThreshold: 2,
    recoveryTimeMs: 300000, // 5 minutes
    timeoutMs: 60000 // 1 minute
  },
  [DbOperationType.ANALYTICS]: {
    failureThreshold: 8,
    recoveryTimeMs: 45000, // 45 seconds
    timeoutMs: 15000 // 15 seconds
  }
}

/**
 * Get performance threshold for operation type
 */
export function getPerformanceThreshold(operationType: DbOperationType): number {
  const thresholds = {
    [DbOperationType.READ]: 2000,      // 2 seconds
    [DbOperationType.WRITE]: 5000,     // 5 seconds
    [DbOperationType.TRANSACTION]: 10000, // 10 seconds
    [DbOperationType.BULK]: 30000,     // 30 seconds
    [DbOperationType.ANALYTICS]: 8000  // 8 seconds
  }
  return thresholds[operationType] || 5000
}