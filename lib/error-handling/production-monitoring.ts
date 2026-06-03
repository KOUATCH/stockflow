/**
 * Production-Ready Error Monitoring and Alerting System
 *
 * This module provides comprehensive monitoring capabilities for production environments
 * including real-time alerting, performance tracking, and business intelligence.
 */

import { systemMonitor, createAlert, AlertType, AlertSeverity } from './monitoring'
import { stockFlowErrorHandling } from './setup'

/**
 * Production monitoring configuration
 */
interface ProductionMonitoringConfig {
  enableRealTimeAlerts: boolean
  alertThresholds: {
    errorRate: number // errors per minute
    responseTime: number // milliseconds
    failedTransactions: number // failed financial transactions per hour
    inventoryDiscrepancies: number // inventory mismatches per hour
  }
  businessMetrics: {
    trackSalesVolume: boolean
    trackInventoryTurnover: boolean
    trackCashFlowHealth: boolean
    trackUserEngagement: boolean
  }
  integrations: {
    slack?: {
      webhook: string
      channels: {
        critical: string
        errors: string
        business: string
      }
    }
    email?: {
      smtp: {
        host: string
        port: number
        secure: boolean
        auth: {
          user: string
          pass: string
        }
      }
      recipients: {
        critical: string[]
        errors: string[]
        business: string[]
      }
    }
  }
}

/**
 * Default production monitoring configuration
 */
const DEFAULT_CONFIG: ProductionMonitoringConfig = {
  enableRealTimeAlerts: true,
  alertThresholds: {
    errorRate: 10, // 10 errors per minute
    responseTime: 5000, // 5 seconds
    failedTransactions: 5, // 5 failed transactions per hour
    inventoryDiscrepancies: 10 // 10 inventory mismatches per hour
  },
  businessMetrics: {
    trackSalesVolume: true,
    trackInventoryTurnover: true,
    trackCashFlowHealth: true,
    trackUserEngagement: true
  },
  integrations: {}
}

/**
 * Production Monitoring Manager
 */
class ProductionMonitor {
  private config: ProductionMonitoringConfig
  private metrics: {
    errors: Array<{ timestamp: number; severity: string }>
    transactions: Array<{ timestamp: number; success: boolean; amount?: number }>
    responseTime: Array<{ timestamp: number; duration: number }>
    inventoryEvents: Array<{ timestamp: number; type: string; discrepancy?: number }>
  }

  constructor(config: Partial<ProductionMonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.metrics = {
      errors: [],
      transactions: [],
      responseTime: [],
      inventoryEvents: []
    }
    this.initializeMonitoring()
  }

  private initializeMonitoring() {
    // Set up error rate monitoring
    if (this.config.enableRealTimeAlerts) {
      setInterval(() => {
        this.checkErrorRates()
        this.checkResponseTimes()
        this.checkTransactionHealth()
        this.checkInventoryHealth()
      }, 60000) // Check every minute

      // Clean up old metrics every hour
      setInterval(() => {
        this.cleanupOldMetrics()
      }, 3600000) // Every hour
    }

    // Initialize business metrics tracking
    if (this.config.businessMetrics.trackSalesVolume) {
      this.initializeSalesTracking()
    }

    console.log('Production monitoring initialized', this.config)
  }

  /**
   * Record error event
   */
  recordError(error: Error, severity: AlertSeverity, metadata?: any) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      severity
    })

    // Send to external monitoring services
    this.sendToExternalServices('error', {
      error: error.message,
      severity,
      stack: error.stack,
      metadata,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Record transaction event
   */
  recordTransaction(success: boolean, amount?: number, metadata?: any) {
    this.metrics.transactions.push({
      timestamp: Date.now(),
      success,
      amount
    })

    if (!success) {
      createAlert({
        type: AlertType.BUSINESS_CRITICAL,
        severity: AlertSeverity.HIGH,
        message: `Failed transaction: ${metadata?.transactionType || 'Unknown'} - ${amount ? `$${amount}` : 'No amount'}`,
        source: 'production-monitor',
        metadata
      })
    }
  }

  /**
   * Record response time
   */
  recordResponseTime(operation: string, duration: number, metadata?: any) {
    this.metrics.responseTime.push({
      timestamp: Date.now(),
      duration
    })

    if (duration > this.config.alertThresholds.responseTime) {
      createAlert({
        type: AlertType.PERFORMANCE_DEGRADATION,
        severity: duration > this.config.alertThresholds.responseTime * 2 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
        message: `Slow operation detected: ${operation} took ${duration}ms`,
        source: 'production-monitor',
        metadata: {
          operation,
          duration,
          threshold: this.config.alertThresholds.responseTime,
          ...metadata
        }
      })
    }
  }

  /**
   * Record inventory event
   */
  recordInventoryEvent(type: 'adjustment' | 'discrepancy' | 'stockout', discrepancy?: number, metadata?: any) {
    this.metrics.inventoryEvents.push({
      timestamp: Date.now(),
      type,
      discrepancy
    })

    if (type === 'stockout') {
      createAlert({
        type: AlertType.BUSINESS_CRITICAL,
        severity: AlertSeverity.MEDIUM,
        message: `Stock out detected: ${metadata?.itemName || 'Unknown item'} at ${metadata?.locationName || 'Unknown location'}`,
        source: 'production-monitor',
        metadata
      })
    }

    if (type === 'discrepancy' && discrepancy && Math.abs(discrepancy) > 100) {
      createAlert({
        type: AlertType.BUSINESS_CRITICAL,
        severity: AlertSeverity.HIGH,
        message: `Large inventory discrepancy detected: ${discrepancy} units for ${metadata?.itemName || 'Unknown item'}`,
        source: 'production-monitor',
        metadata: {
          discrepancy,
          ...metadata
        }
      })
    }
  }

  /**
   * Check error rates and alert if threshold exceeded
   */
  private checkErrorRates() {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    const recentErrors = this.metrics.errors.filter(e => e.timestamp > oneMinuteAgo)
    const errorRate = recentErrors.length

    if (errorRate >= this.config.alertThresholds.errorRate) {
      createAlert({
        type: AlertType.SYSTEM_FAILURE,
        severity: errorRate >= this.config.alertThresholds.errorRate * 2 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
        message: `High error rate detected: ${errorRate} errors in the last minute`,
        source: 'production-monitor',
        metadata: {
          errorRate,
          threshold: this.config.alertThresholds.errorRate,
          recentErrors: recentErrors.slice(-5) // Last 5 errors
        }
      })
    }
  }

  /**
   * Check response times
   */
  private checkResponseTimes() {
    const now = Date.now()
    const fiveMinutesAgo = now - 300000

    const recentResponseTimes = this.metrics.responseTime.filter(rt => rt.timestamp > fiveMinutesAgo)

    if (recentResponseTimes.length > 0) {
      const avgResponseTime = recentResponseTimes.reduce((sum, rt) => sum + rt.duration, 0) / recentResponseTimes.length
      const slowOperations = recentResponseTimes.filter(rt => rt.duration > this.config.alertThresholds.responseTime)

      if (avgResponseTime > this.config.alertThresholds.responseTime * 0.8 || slowOperations.length > 3) {
        createAlert({
          type: AlertType.PERFORMANCE_DEGRADATION,
          severity: AlertSeverity.MEDIUM,
          message: `Performance degradation detected: Average response time ${Math.round(avgResponseTime)}ms, ${slowOperations.length} slow operations`,
          source: 'production-monitor',
          metadata: {
            avgResponseTime: Math.round(avgResponseTime),
            slowOperationsCount: slowOperations.length,
            threshold: this.config.alertThresholds.responseTime
          }
        })
      }
    }
  }

  /**
   * Check transaction health
   */
  private checkTransactionHealth() {
    const now = Date.now()
    const oneHourAgo = now - 3600000

    const recentTransactions = this.metrics.transactions.filter(t => t.timestamp > oneHourAgo)
    const failedTransactions = recentTransactions.filter(t => !t.success)

    if (failedTransactions.length >= this.config.alertThresholds.failedTransactions) {
      const totalAmount = failedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

      createAlert({
        type: AlertType.BUSINESS_CRITICAL,
        severity: AlertSeverity.HIGH,
        message: `High transaction failure rate: ${failedTransactions.length} failed transactions in the last hour (${totalAmount > 0 ? `$${totalAmount.toFixed(2)} affected` : ''})`,
        source: 'production-monitor',
        metadata: {
          failedCount: failedTransactions.length,
          totalTransactions: recentTransactions.length,
          affectedAmount: totalAmount,
          threshold: this.config.alertThresholds.failedTransactions
        }
      })
    }
  }

  /**
   * Check inventory health
   */
  private checkInventoryHealth() {
    const now = Date.now()
    const oneHourAgo = now - 3600000

    const recentInventoryEvents = this.metrics.inventoryEvents.filter(e => e.timestamp > oneHourAgo)
    const discrepancies = recentInventoryEvents.filter(e => e.type === 'discrepancy')

    if (discrepancies.length >= this.config.alertThresholds.inventoryDiscrepancies) {
      createAlert({
        type: AlertType.BUSINESS_CRITICAL,
        severity: AlertSeverity.MEDIUM,
        message: `High inventory discrepancy rate: ${discrepancies.length} discrepancies in the last hour`,
        source: 'production-monitor',
        metadata: {
          discrepancyCount: discrepancies.length,
          threshold: this.config.alertThresholds.inventoryDiscrepancies
        }
      })
    }
  }

  /**
   * Initialize sales tracking
   */
  private initializeSalesTracking() {
    // This would integrate with your sales system
    // For now, we'll set up the framework
    systemMonitor.recordMetric('sales_tracking_enabled', {
      timestamp: Date.now(),
      enabled: true
    })
  }

  /**
   * Send metrics to external services
   */
  private async sendToExternalServices(type: string, data: any) {
    try {
      // Slack integration
      if (this.config.integrations.slack?.webhook) {
        await this.sendToSlack(type, data)
      }

      // Email integration
      if (this.config.integrations.email?.smtp) {
        await this.sendEmail(type, data)
      }
    } catch (error) {
      console.error('Failed to send to external monitoring services:', error)
    }
  }

  /**
   * Send alert to Slack
   */
  private async sendToSlack(type: string, data: any) {
    // Implementation for Slack webhook
    // This would send formatted messages to appropriate Slack channels
    console.log('Would send to Slack:', type, data)
  }

  /**
   * Send email alert
   */
  private async sendEmail(type: string, data: any) {
    // Implementation for email notifications
    // This would send formatted emails to appropriate recipients
    console.log('Would send email:', type, data)
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupOldMetrics() {
    const now = Date.now()
    const oneDayAgo = now - 86400000 // 24 hours

    this.metrics.errors = this.metrics.errors.filter(e => e.timestamp > oneDayAgo)
    this.metrics.transactions = this.metrics.transactions.filter(t => t.timestamp > oneDayAgo)
    this.metrics.responseTime = this.metrics.responseTime.filter(rt => rt.timestamp > oneDayAgo)
    this.metrics.inventoryEvents = this.metrics.inventoryEvents.filter(e => e.timestamp > oneDayAgo)
  }

  /**
   * Get current monitoring status
   */
  getStatus() {
    const now = Date.now()
    const oneHourAgo = now - 3600000

    return {
      config: this.config,
      metrics: {
        recentErrors: this.metrics.errors.filter(e => e.timestamp > oneHourAgo).length,
        recentTransactions: this.metrics.transactions.filter(t => t.timestamp > oneHourAgo).length,
        failedTransactions: this.metrics.transactions.filter(t => t.timestamp > oneHourAgo && !t.success).length,
        avgResponseTime: this.getAverageResponseTime(),
        inventoryEvents: this.metrics.inventoryEvents.filter(e => e.timestamp > oneHourAgo).length
      },
      status: 'active',
      lastUpdate: new Date().toISOString()
    }
  }

  private getAverageResponseTime(): number {
    const now = Date.now()
    const fiveMinutesAgo = now - 300000
    const recentResponseTimes = this.metrics.responseTime.filter(rt => rt.timestamp > fiveMinutesAgo)

    if (recentResponseTimes.length === 0) return 0

    return Math.round(
      recentResponseTimes.reduce((sum, rt) => sum + rt.duration, 0) / recentResponseTimes.length
    )
  }
}

// Create singleton instance
export const productionMonitor = new ProductionMonitor()

// Export initialization function for app startup
export function initializeProductionMonitoring(config?: Partial<ProductionMonitoringConfig>) {
  if (config) {
    return new ProductionMonitor(config)
  }
  return productionMonitor
}

// Export monitoring functions for use throughout the app
export const monitoring = {
  recordError: productionMonitor.recordError.bind(productionMonitor),
  recordTransaction: productionMonitor.recordTransaction.bind(productionMonitor),
  recordResponseTime: productionMonitor.recordResponseTime.bind(productionMonitor),
  recordInventoryEvent: productionMonitor.recordInventoryEvent.bind(productionMonitor),
  getStatus: productionMonitor.getStatus.bind(productionMonitor)
}

// Development utilities
if (process.env.NODE_ENV === 'development') {
  // Add development monitoring helpers
  (globalThis as any).__stockflow_monitoring = {
    getStatus: productionMonitor.getStatus.bind(productionMonitor),
    testError: () => {
      productionMonitor.recordError(new Error('Test error'), AlertSeverity.LOW, { test: true })
    },
    testTransaction: (success: boolean = false) => {
      productionMonitor.recordTransaction(success, 100, { test: true, type: 'test' })
    }
  }
}