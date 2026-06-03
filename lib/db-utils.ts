"use server"

/**
 * Enterprise Database Utilities with Resilience Patterns
 *
 * Provides robust database operations with:
 * - Connection health monitoring with precise latency measurement
 * - Circuit breaker patterns for different operation types
 * - Automatic retry logic with exponential backoff
 * - Performance monitoring and alerting
 * - Deadlock detection and recovery
 */

import { db } from "@/prisma/db"
import {
  resilientDb,
  dbOperation,
  dbTransaction,
  circuitBreakerManager,
  createCircuitBreaker,
  executeWithCircuitBreaker,
  ServiceType,
  systemMonitor,
  createAlert,
  AlertType,
  AlertSeverity,
  HealthStatus
} from './error-handling'

import {
  DbOperationType,
  DbMetrics,
  DB_CIRCUIT_BREAKER_CONFIG,
  getPerformanceThreshold
} from './db-utils-constants'

/**
 * Initialize database circuit breakers
 */
export async function initializeDbCircuitBreakers() {
  Object.entries(DB_CIRCUIT_BREAKER_CONFIG).forEach(([type, config]) => {
    createCircuitBreaker({
      service: `database_${type}` as ServiceType,
      failureThreshold: config.failureThreshold,
      recoveryTimeMs: config.recoveryTimeMs,
      timeoutMs: config.timeoutMs,
      fallback: async () => {
        await createAlert({
          type: AlertType.SYSTEM_FAILURE,
          severity: AlertSeverity.HIGH,
          message: `Database ${type} operations circuit breaker open`,
          source: 'database-utils',
          metadata: {
            operationType: type,
            circuitState: 'OPEN'
          }
        })
        throw new Error(`Database ${type} operations are currently unavailable`)
      }
    })
  })
}

// Note: Circuit breakers should be initialized during app startup

/**
 * Enhanced database read operation with resilience
 */
export async function resilientDbRead<T>(
  operation: () => Promise<T>,
  options?: {
    tableName?: string
    timeout?: number
    retryCount?: number
  }
): Promise<T> {
  const startTime = Date.now()
  const { tableName = 'unknown', timeout = 5000, retryCount = 3 } = options || {}

  try {
    const result = await executeWithCircuitBreaker(
      `database_${DbOperationType.READ}` as ServiceType,
      async () => {
        return await dbOperation(operation, {
          maxRetries: retryCount,
          timeoutMs: timeout,
          retryDelayMs: 1000,
          operationName: `read_${tableName}`
        })
      }
    )

    // Record success metrics
    await recordDbMetrics({
      operationType: DbOperationType.READ,
      duration: Date.now() - startTime,
      success: true,
      tableName,
      recordCount: Array.isArray(result) ? result.length : 1
    })

    return result
  } catch (error) {
    // Record failure metrics
    await recordDbMetrics({
      operationType: DbOperationType.READ,
      duration: Date.now() - startTime,
      success: false,
      tableName,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    throw error
  }
}

/**
 * Enhanced database write operation with resilience
 */
export async function resilientDbWrite<T>(
  operation: () => Promise<T>,
  options?: {
    tableName?: string
    timeout?: number
    retryCount?: number
  }
): Promise<T> {
  const startTime = Date.now()
  const { tableName = 'unknown', timeout = 10000, retryCount = 2 } = options || {}

  try {
    const result = await executeWithCircuitBreaker(
      `database_${DbOperationType.WRITE}` as ServiceType,
      async () => {
        return await dbOperation(operation, {
          maxRetries: retryCount,
          timeoutMs: timeout,
          retryDelayMs: 2000,
          operationName: `write_${tableName}`
        })
      }
    )

    // Record success metrics
    await recordDbMetrics({
      operationType: DbOperationType.WRITE,
      duration: Date.now() - startTime,
      success: true,
      tableName,
      recordCount: 1
    })

    return result
  } catch (error) {
    // Record failure metrics
    await recordDbMetrics({
      operationType: DbOperationType.WRITE,
      duration: Date.now() - startTime,
      success: false,
      tableName,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    throw error
  }
}

/**
 * Enhanced database transaction with full resilience
 */
export async function resilientDbTransaction<T>(
  operation: (tx: any) => Promise<T>,
  options?: {
    timeout?: number
    isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable'
    maxRetries?: number
    description?: string
  }
): Promise<T> {
  const startTime = Date.now()
  const {
    timeout = 30000,
    isolationLevel = 'ReadCommitted',
    maxRetries = 2,
    description = 'database_transaction'
  } = options || {}

  try {
    const result = await executeWithCircuitBreaker(
      `database_${DbOperationType.TRANSACTION}` as ServiceType,
      async () => {
        return await dbTransaction(operation, {
          maxRetries,
          timeoutMs: timeout,
          isolationLevel,
          operationName: description
        })
      }
    )

    // Record success metrics
    await recordDbMetrics({
      operationType: DbOperationType.TRANSACTION,
      duration: Date.now() - startTime,
      success: true,
      tableName: description
    })

    return result
  } catch (error) {
    // Record failure metrics
    await recordDbMetrics({
      operationType: DbOperationType.TRANSACTION,
      duration: Date.now() - startTime,
      success: false,
      tableName: description,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    throw error
  }
}

/**
 * Record database performance metrics
 */
export async function recordDbMetrics(metrics: DbMetrics): Promise<void> {
  try {
    // Send metrics to monitoring system
    systemMonitor.recordMetric('database_operation', {
      operation_type: metrics.operationType,
      duration_ms: metrics.duration,
      success: metrics.success,
      table_name: metrics.tableName,
      record_count: metrics.recordCount,
      error: metrics.error
    })

    // Create alerts for performance issues
    const threshold = getPerformanceThreshold(metrics.operationType)
    if (metrics.duration > threshold) {
      await createAlert({
        type: AlertType.PERFORMANCE_DEGRADATION,
        severity: AlertSeverity.MEDIUM,
        message: `Slow database ${metrics.operationType} operation detected`,
        source: 'database-utils',
        metadata: {
          duration: metrics.duration,
          operationType: metrics.operationType,
          tableName: metrics.tableName,
          threshold
        }
      })
    }
  } catch (metricsError) {
    // Silent fail for metrics recording to not affect main operation
    console.error('Failed to record database metrics:', metricsError)
  }
}


/**
 * Enhanced database health check with precise latency measurement
 */
export async function checkDBHealth() {
  const startTime = Date.now()

  try {
    // Simple query to test database connection
    await db.$queryRaw`SELECT 1`
    const latency = Date.now() - startTime

    // Record health metrics
    systemMonitor.recordMetric('database_health', {
      healthy: true,
      latency_ms: latency
    })

    return {
      status: "connected",
      timestamp: new Date().toISOString(),
      latency: `${latency}ms`,
      latencyMs: latency,
      healthy: true
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown database error"
    const duration = Date.now() - startTime

    // Record unhealthy state
    systemMonitor.recordMetric('database_health', {
      healthy: false,
      error: errorMessage
    })

    // Create critical alert
    await createAlert({
      type: AlertType.SYSTEM_FAILURE,
      severity: AlertSeverity.CRITICAL,
      message: 'Database connection health check failed',
      source: 'database-utils',
      metadata: {
        error: errorMessage,
        duration
      }
    })

    console.error("Database health check failed:", error)

    return {
      status: "disconnected",
      timestamp: new Date().toISOString(),
      error: errorMessage,
      latency: `${duration}ms (failed)`,
      latencyMs: duration,
      healthy: false
    }
  }
}

/**
 * Enhanced database connection test with resilience monitoring
 */
export async function testDBConnection() {
  try {
    await db.$connect()

    // Record successful connection
    systemMonitor.recordMetric('database_connection', {
      success: true
    })

    return true
  } catch (error) {
    console.error("Database connection test failed:", error)

    // Record failed connection
    systemMonitor.recordMetric('database_connection', {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    // Create alert for connection failure
    await createAlert({
      type: AlertType.SYSTEM_FAILURE,
      severity: AlertSeverity.HIGH,
      message: 'Database connection test failed',
      source: 'database-utils',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })

    return false
  }
}

/**
 * Get database performance statistics
 */
export async function getDatabaseStats() {
  const performanceThresholds: Record<string, number> = {}

  for (const type of Object.keys(DbOperationType)) {
    const threshold = getPerformanceThreshold(DbOperationType[type as keyof typeof DbOperationType])
    performanceThresholds[type.toLowerCase()] = threshold
  }

  return {
    circuitBreakers: Object.keys(DbOperationType).map(type => {
      const serviceName = `database_${type.toLowerCase()}`
      let state = 'UNKNOWN'
      try {
        // Safe circuit breaker state check without type casting
        state = circuitBreakerManager.getCircuitState(serviceName as any) || 'UNKNOWN'
      } catch (error) {
        // Circuit breaker may not exist, which is fine
        state = 'NOT_INITIALIZED'
      }
      return {
        type: serviceName,
        state
      }
    }),
    performanceThresholds,
    config: DB_CIRCUIT_BREAKER_CONFIG
  }
}