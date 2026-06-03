import 'server-only'

/**
 * Enterprise System Monitoring Initialization
 *
 * Configures and starts comprehensive system monitoring including:
 * - Database health monitoring
 * - Performance metrics collection
 * - Circuit breaker monitoring
 * - Business metrics tracking
 * - Alert management
 * - System health dashboards
 */

import {
  systemMonitor,
  startSystemMonitoring,
  getSystemHealth,
  createAlert,
  AlertType,
  AlertSeverity,
  HealthStatus
} from './error-handling/monitoring'
// Import db-utils conditionally - only on server side
const getDBUtils = () => {
  // Check if we're on the server side
  if (typeof window === 'undefined') {
    try {
      return require('./db-utils')
    } catch (error) {
      console.warn('DB utilities not available in current environment')
      return null
    }
  }
  return null
}

/**
 * System monitoring configuration
 */
export interface MonitoringConfig {
  healthCheckInterval: number
  metricsRetentionDays: number
  alertThresholds: {
    responseTime: number
    errorRate: number
    memoryUsage: number
    diskUsage: number
  }
  enableRealTimeAlerts: boolean
  enablePerformanceDashboard: boolean
}

/**
 * Default monitoring configuration
 */
const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  healthCheckInterval: 30000, // 30 seconds
  metricsRetentionDays: 30,
  alertThresholds: {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05,    // 5%
    memoryUsage: 0.85,  // 85%
    diskUsage: 0.90     // 90%
  },
  enableRealTimeAlerts: true,
  enablePerformanceDashboard: true
}

function getNodePackageVersion(fallback = 'unknown'): string {
  return typeof process !== 'undefined' && process.env?.npm_package_version
    ? process.env.npm_package_version
    : fallback
}

function getNodeMemoryUsage(): NodeJS.MemoryUsage | null {
  return typeof process !== 'undefined' && typeof process.memoryUsage === 'function'
    ? process.memoryUsage()
    : null
}

function getNodeCpuUsage(): NodeJS.CpuUsage | null {
  return typeof process !== 'undefined' && typeof process.cpuUsage === 'function'
    ? process.cpuUsage()
    : null
}

/**
 * Global monitoring state
 */
let monitoringInitialized = false
let healthCheckInterval: NodeJS.Timeout | null = null
let performanceMetrics: {
  startTime: number
  totalRequests: number
  totalErrors: number
  averageResponseTime: number
  lastHealthCheck: Date | null
  systemStatus: HealthStatus
} = {
  startTime: Date.now(),
  totalRequests: 0,
  totalErrors: 0,
  averageResponseTime: 0,
  lastHealthCheck: null,
  systemStatus: HealthStatus.HEALTHY
}

/**
 * Initialize comprehensive system monitoring
 */
export async function initializeSystemMonitoring(config?: Partial<MonitoringConfig>): Promise<void> {
  if (monitoringInitialized) {
    console.log('System monitoring already initialized')
    return
  }

  const finalConfig = { ...DEFAULT_MONITORING_CONFIG, ...config }

  try {
    // Start the enterprise error handling monitoring system
    await startSystemMonitoring()

    // Initialize database health monitoring
    await initializeDatabaseMonitoring(finalConfig)

    // Initialize performance tracking
    initializePerformanceTracking(finalConfig)

    // Initialize alert management
    await initializeAlertManagement(finalConfig)

    // Start periodic health checks
    startPeriodicHealthChecks(finalConfig)

    // Record system startup
    await createAlert({
      type: AlertType.SYSTEM_EVENT,
      severity: AlertSeverity.INFO,
      message: 'StockFlow system monitoring initialized successfully',
      source: 'monitoring-setup',
      metadata: {
        config: finalConfig,
        timestamp: new Date().toISOString(),
        systemVersion: getNodePackageVersion()
      }
    })

    monitoringInitialized = true
    console.log('✅ Enterprise system monitoring initialized successfully')

  } catch (error) {
    console.error('❌ Failed to initialize system monitoring:', error)

    await createAlert({
      type: AlertType.SYSTEM_FAILURE,
      severity: AlertSeverity.CRITICAL,
      message: 'Failed to initialize system monitoring',
      source: 'monitoring-setup',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    })

    throw error
  }
}

/**
 * Initialize database health monitoring
 */
async function initializeDatabaseMonitoring(config: MonitoringConfig): Promise<void> {
  const dbUtils = getDBUtils()

  // Skip database monitoring if not available (client-side)
  if (!dbUtils) {
    console.log('📊 Database monitoring skipped (not available in current environment)')
    return
  }

  try {
    // Initial database health check
    const healthStatus = await dbUtils.checkDBHealth()

    if (!healthStatus.healthy) {
      await createAlert({
        type: AlertType.SYSTEM_FAILURE,
        severity: AlertSeverity.CRITICAL,
        message: 'Database unhealthy at system startup',
        source: 'monitoring-setup',
        metadata: {
          status: healthStatus.status,
          error: healthStatus.error,
          latency: healthStatus.latencyMs
        }
      })
    }

    // Test database connection
    const connectionTest = await dbUtils.testDBConnection()

    if (!connectionTest) {
      await createAlert({
        type: AlertType.SYSTEM_FAILURE,
        severity: AlertSeverity.CRITICAL,
        message: 'Database connection test failed at startup',
        source: 'monitoring-setup',
        metadata: {
          timestamp: new Date().toISOString()
        }
      })
    }

    // Get database statistics
    const dbStats = await dbUtils.getDatabaseStats()
    console.log('📊 Database monitoring initialized:', {
      circuitBreakers: dbStats.circuitBreakers.length,
      performanceThresholds: Object.keys(dbStats.performanceThresholds).length
    })

  } catch (error) {
    console.error('Failed to initialize database monitoring:', error)
    throw error
  }
}

/**
 * Initialize performance tracking
 */
function initializePerformanceTracking(config: MonitoringConfig): void {
  const canTrackMemory = typeof process !== 'undefined' && typeof process.memoryUsage === 'function'
  const canTrackCpu = typeof process !== 'undefined' && typeof process.cpuUsage === 'function'

  // Track Node.js performance metrics when running in a Node runtime.
  if (canTrackMemory) {
    // Memory usage tracking
    const memoryInterval = setInterval(() => {
      const memUsage = getNodeMemoryUsage()
      if (!memUsage) return

      systemMonitor.recordMetric('memory_usage', {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      })

      // Alert on high memory usage
      const heapUsageRatio = memUsage.heapUsed / memUsage.heapTotal
      if (heapUsageRatio > config.alertThresholds.memoryUsage) {
        createAlert({
          type: AlertType.PERFORMANCE_DEGRADATION,
          severity: AlertSeverity.HIGH,
          message: `High memory usage detected: ${Math.round(heapUsageRatio * 100)}%`,
          source: 'monitoring-setup',
          metadata: {
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            ratio: heapUsageRatio,
            threshold: config.alertThresholds.memoryUsage
          }
        })
      }
    }, 60000) // Check every minute
  }

  if (canTrackCpu) {
    // CPU usage tracking (if available)
    const cpuInterval = setInterval(() => {
      const cpuUsage = getNodeCpuUsage()
      if (!cpuUsage) return

      systemMonitor.recordMetric('cpu_usage', {
        user: cpuUsage.user,
        system: cpuUsage.system
      })
    }, 30000) // Check every 30 seconds
  }

  console.log('📈 Performance tracking initialized')
}

/**
 * Initialize alert management
 */
async function initializeAlertManagement(config: MonitoringConfig): Promise<void> {
  if (!config.enableRealTimeAlerts) {
    console.log('⚠️ Real-time alerts disabled in configuration')
    return
  }

  // Set up alert handlers for different severity levels
  systemMonitor.onAlert(async (alert) => {
    try {
      switch (alert.severity) {
        case AlertSeverity.CRITICAL:
          // For critical alerts, you might want to send immediate notifications
          // This could integrate with services like PagerDuty, Slack, email, etc.
          console.error('🚨 CRITICAL ALERT:', alert.message, alert.metadata)
          break

        case AlertSeverity.HIGH:
          console.warn('🔥 HIGH ALERT:', alert.message, alert.metadata)
          break

        case AlertSeverity.MEDIUM:
          console.warn('⚠️ MEDIUM ALERT:', alert.message)
          break

        case AlertSeverity.LOW:
          console.info('💡 LOW ALERT:', alert.message)
          break

        default:
          console.log('📢 ALERT:', alert.message)
      }
    } catch (error) {
      console.error('Failed to process alert:', error)
    }
  })

  console.log('🔔 Alert management initialized')
}

/**
 * Start periodic health checks
 */
function startPeriodicHealthChecks(config: MonitoringConfig): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
  }

  healthCheckInterval = setInterval(async () => {
    try {
      await performSystemHealthCheck(config)
    } catch (error) {
      console.error('Health check failed:', error)
    }
  }, config.healthCheckInterval)

  console.log(`⏰ Periodic health checks started (every ${config.healthCheckInterval}ms)`)
}

/**
 * Perform comprehensive system health check
 */
async function performSystemHealthCheck(config: MonitoringConfig): Promise<void> {
  const startTime = Date.now()
  const dbUtils = getDBUtils()

  try {
    let dbHealth = { healthy: true, latencyMs: 0 }

    // Check database health only if available (server-side)
    if (dbUtils) {
      dbHealth = await dbUtils.checkDBHealth()
    }

    // Get overall system health
    const systemHealth = await getSystemHealth()

    // Update performance metrics
    performanceMetrics.lastHealthCheck = new Date()
    const isSystemHealthy = systemHealth.overall === HealthStatus.HEALTHY

    performanceMetrics.systemStatus = dbHealth.healthy && isSystemHealthy
      ? HealthStatus.HEALTHY
      : HealthStatus.CRITICAL

    // Record health check metrics
    systemMonitor.recordMetric('health_check', {
      duration_ms: Date.now() - startTime,
      database_healthy: dbHealth.healthy,
      database_latency: dbHealth.latencyMs,
      system_healthy: isSystemHealthy,
      overall_status: performanceMetrics.systemStatus,
      database_available: !!dbUtils
    })

    // Create alerts for unhealthy systems
    if (dbUtils && !dbHealth.healthy) {
      await createAlert({
        type: AlertType.SYSTEM_FAILURE,
        severity: AlertSeverity.HIGH,
        message: 'Database health check failed during monitoring',
        source: 'monitoring-setup',
        metadata: {
          status: dbHealth.status,
          error: dbHealth.error,
          latency: dbHealth.latencyMs
        }
      })
    }

    if (!isSystemHealthy) {
      await createAlert({
        type: AlertType.SYSTEM_FAILURE,
        severity: AlertSeverity.MEDIUM,
        message: 'System health check indicates degraded performance',
        source: 'monitoring-setup',
        metadata: systemHealth
      })
    }

  } catch (error) {
    await createAlert({
      type: AlertType.SYSTEM_FAILURE,
      severity: AlertSeverity.HIGH,
      message: 'Health check process failed',
      source: 'monitoring-setup',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      }
    })
  }
}

/**
 * Get current system performance metrics
 */
export function getPerformanceMetrics() {
  return {
    ...performanceMetrics,
    uptime: Date.now() - performanceMetrics.startTime,
    errorRate: performanceMetrics.totalRequests > 0
      ? performanceMetrics.totalErrors / performanceMetrics.totalRequests
      : 0
  }
}

/**
 * Record request metrics (to be called by middleware)
 */
export function recordRequest(success: boolean, responseTime: number): void {
  performanceMetrics.totalRequests++

  if (!success) {
    performanceMetrics.totalErrors++
  }

  // Update average response time
  const currentAvg = performanceMetrics.averageResponseTime
  const count = performanceMetrics.totalRequests
  performanceMetrics.averageResponseTime = ((currentAvg * (count - 1)) + responseTime) / count

  // Record individual request metrics
  systemMonitor.recordMetric('request', {
    success,
    response_time_ms: responseTime,
    timestamp: Date.now()
  })
}

/**
 * Shutdown monitoring gracefully
 */
export async function shutdownMonitoring(): Promise<void> {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
    healthCheckInterval = null
  }

  await createAlert({
    type: AlertType.SYSTEM_EVENT,
    severity: AlertSeverity.INFO,
    message: 'System monitoring shutting down',
    source: 'monitoring-setup',
    metadata: {
      uptime: Date.now() - performanceMetrics.startTime,
      totalRequests: performanceMetrics.totalRequests,
      totalErrors: performanceMetrics.totalErrors,
      timestamp: new Date().toISOString()
    }
  })

  monitoringInitialized = false
  console.log('🔽 System monitoring shutdown complete')
}

/**
 * Check if monitoring is initialized
 */
export function isMonitoringInitialized(): boolean {
  return monitoringInitialized
}
