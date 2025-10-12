// =============================================================================
// FINANCIAL NOTIFICATION SERVICE
// Centralized notification service for financial reporting system
// Integrates with project's NotificationProvider
// =============================================================================

"use client";

import { useNotifications } from "@/components/notifications/NotificationProvider";

// =============================================================================
// FINANCIAL NOTIFICATION TYPES
// =============================================================================

export interface FinancialNotificationOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  sound?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface AuditNotificationOptions {
  action: string;
  resource: string;
  userId: string;
  success: boolean;
  details?: string;
}

export interface ComplianceNotificationOptions {
  type: 'SOX' | 'GAAP' | 'IFRS' | 'INTERNAL';
  status: 'compliant' | 'non_compliant' | 'needs_review';
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityNotificationOptions {
  eventType: 'permission_denied' | 'suspicious_activity' | 'data_access' | 'system_error';
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  description: string;
  requiresAction: boolean;
}

// =============================================================================
// CUSTOM FINANCIAL NOTIFICATION HOOK
// =============================================================================

export function useFinancialNotifications() {
  const notifications = useNotifications();

  // =============================================================================
  // CORE FINANCIAL OPERATIONS
  // =============================================================================

  const reportGenerated = (reportType: string, period?: string) => {
    return notifications.success(
      "Report Generated",
      `${reportType} report has been successfully generated${period ? ` for ${period}` : ''}.`,
      {
        sound: true,
        duration: 4000,
        priority: "normal"
      }
    );
  };

  const reportExported = (reportType: string, format: string) => {
    return notifications.success(
      "Report Exported",
      `${reportType} report has been exported to ${format.toUpperCase()} format.`,
      {
        sound: true,
        duration: 3000
      }
    );
  };

  const dataLoadError = (dataType: string, error?: string) => {
    return notifications.error(
      "Data Load Failed",
      `Failed to load ${dataType}. ${error || 'Please try again or contact support.'}`,
      {
        sound: true,
        duration: 6000,
        priority: "high"
      }
    );
  };

  const dataLoadSuccess = (dataType: string, recordCount?: number) => {
    return notifications.success(
      "Data Loaded",
      `${dataType} data loaded successfully${recordCount ? ` (${recordCount} records)` : ''}.`,
      {
        sound: false,
        duration: 2000
      }
    );
  };

  // =============================================================================
  // FINANCIAL STATEMENT OPERATIONS
  // =============================================================================

  const statementGenerated = (statementType: 'income' | 'balance' | 'cashflow', period: string) => {
    const statementNames = {
      income: 'Income Statement',
      balance: 'Balance Sheet',
      cashflow: 'Cash Flow Statement'
    };

    return notifications.success(
      "Financial Statement Ready",
      `${statementNames[statementType]} for ${period} has been generated and is ready for review.`,
      {
        sound: true,
        duration: 5000,
        priority: "normal"
      }
    );
  };

  const statementApproved = (statementType: string, approver: string) => {
    return notifications.success(
      "Statement Approved",
      `${statementType} has been approved by ${approver}.`,
      {
        sound: true,
        duration: 4000,
        priority: "high"
      }
    );
  };

  const statementRejected = (statementType: string, reason: string) => {
    return notifications.warning(
      "Statement Rejected",
      `${statementType} requires revision: ${reason}`,
      {
        sound: true,
        duration: 6000,
        priority: "high"
      }
    );
  };

  // =============================================================================
  // JOURNAL ENTRY OPERATIONS
  // =============================================================================

  const journalEntryCreated = (entryId: string, amount: number) => {
    return notifications.success(
      "Journal Entry Created",
      `Journal entry ${entryId} created for ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`,
      {
        sound: true,
        duration: 3000
      }
    );
  };

  const journalEntryPosted = (entryId: string) => {
    return notifications.success(
      "Journal Entry Posted",
      `Journal entry ${entryId} has been posted to the general ledger.`,
      {
        sound: true,
        duration: 4000,
        priority: "normal"
      }
    );
  };

  const journalEntryApprovalRequired = (entryId: string, amount: number) => {
    return notifications.warning(
      "Approval Required",
      `Journal entry ${entryId} for ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} requires approval before posting.`,
      {
        sound: true,
        duration: 5000,
        priority: "high"
      }
    );
  };

  const journalEntryReversed = (entryId: string, reason: string) => {
    return notifications.info(
      "Journal Entry Reversed",
      `Journal entry ${entryId} has been reversed. Reason: ${reason}`,
      {
        sound: true,
        duration: 4000,
        priority: "normal"
      }
    );
  };

  // =============================================================================
  // BUDGET AND VARIANCE OPERATIONS
  // =============================================================================

  const budgetCreated = (budgetName: string, period: string) => {
    return notifications.success(
      "Budget Created",
      `Budget "${budgetName}" for ${period} has been created successfully.`,
      {
        sound: true,
        duration: 3000
      }
    );
  };

  const budgetApproved = (budgetName: string, approver: string) => {
    return notifications.success(
      "Budget Approved",
      `Budget "${budgetName}" has been approved by ${approver}.`,
      {
        sound: true,
        duration: 4000,
        priority: "normal"
      }
    );
  };

  const varianceAlert = (category: string, variance: number, threshold: number) => {
    return notifications.warning(
      "Budget Variance Alert",
      `${category} variance of ${variance.toFixed(1)}% exceeds threshold of ${threshold}%.`,
      {
        sound: true,
        duration: 6000,
        priority: "high"
      }
    );
  };

  // =============================================================================
  // AUDIT AND COMPLIANCE NOTIFICATIONS
  // =============================================================================

  const auditTrailLogged = (options: AuditNotificationOptions) => {
    const { action, resource, userId, success, details } = options;

    if (success) {
      return notifications.info(
        "Activity Logged",
        `${action} on ${resource} by user ${userId} has been logged.`,
        {
          sound: false,
          duration: 2000,
          priority: "low"
        }
      );
    } else {
      return notifications.warning(
        "Audit Log Failed",
        `Failed to log ${action} on ${resource}. ${details || 'Manual review required.'}`,
        {
          sound: true,
          duration: 5000,
          priority: "high"
        }
      );
    }
  };

  const complianceAlert = (options: ComplianceNotificationOptions) => {
    const { type, status, message, urgency } = options;

    const priorityMap = {
      low: 'low' as const,
      medium: 'normal' as const,
      high: 'high' as const,
      critical: 'critical' as const
    };

    if (status === 'compliant') {
      return notifications.success(
        `${type} Compliance`,
        `${type} compliance check passed: ${message}`,
        {
          sound: urgency === 'high' || urgency === 'critical',
          duration: 4000,
          priority: priorityMap[urgency]
        }
      );
    } else {
      return notifications.error(
        `${type} Compliance Issue`,
        `${type} compliance issue detected: ${message}`,
        {
          sound: true,
          duration: 8000,
          priority: priorityMap[urgency]
        }
      );
    }
  };

  const soxControlTest = (controlId: string, result: 'pass' | 'fail', findings?: string) => {
    if (result === 'pass') {
      return notifications.success(
        "SOX Control Test Passed",
        `Control ${controlId} testing completed successfully.`,
        {
          sound: false,
          duration: 3000
        }
      );
    } else {
      return notifications.error(
        "SOX Control Test Failed",
        `Control ${controlId} failed testing. ${findings || 'Review required.'}`,
        {
          sound: true,
          duration: 6000,
          priority: "critical"
        }
      );
    }
  };

  // =============================================================================
  // SECURITY NOTIFICATIONS
  // =============================================================================

  const securityEvent = (options: SecurityNotificationOptions) => {
    const { eventType, severity, userId, description, requiresAction } = options;

    const titles = {
      permission_denied: 'Access Denied',
      suspicious_activity: 'Security Alert',
      data_access: 'Data Access',
      system_error: 'System Error'
    };

    const notificationMethod = severity === 'critical' || severity === 'error'
      ? notifications.error
      : severity === 'warning'
        ? notifications.warning
        : notifications.info;

    return notificationMethod(
      titles[eventType],
      `${description}${userId ? ` (User: ${userId})` : ''}${requiresAction ? ' - Action required.' : ''}`,
      {
        sound: severity === 'critical' || severity === 'error',
        duration: severity === 'critical' ? 10000 : 5000,
        priority: severity === 'critical' ? 'critical' : severity === 'error' ? 'high' : 'normal'
      }
    );
  };

  const permissionDenied = (permission: string, resource: string) => {
    return notifications.warning(
      "Access Denied",
      `You don't have permission to ${permission} on ${resource}.`,
      {
        sound: true,
        duration: 4000,
        priority: "normal"
      }
    );
  };

  const sessionTimeout = (timeRemaining: number) => {
    return notifications.warning(
      "Session Timeout Warning",
      `Your session will expire in ${timeRemaining} minutes. Please save your work.`,
      {
        sound: true,
        duration: 8000,
        priority: "high"
      }
    );
  };

  // =============================================================================
  // CASH MANAGEMENT NOTIFICATIONS
  // =============================================================================

  const cashTransactionRecorded = (type: 'deposit' | 'withdrawal', amount: number, drawer: string) => {
    return notifications.cashOperation(
      type === 'deposit' ? 'add' : 'remove',
      amount,
      drawer
    );
  };

  const cashReconciliation = (variance: number, drawer: string) => {
    return notifications.reconciliationResult(variance, drawer);
  };

  const cashFlowAlert = (type: 'low_cash' | 'high_variance', details: string) => {
    const titles = {
      low_cash: 'Low Cash Alert',
      high_variance: 'Cash Variance Alert'
    };

    return notifications.warning(
      titles[type],
      details,
      {
        sound: true,
        duration: 6000,
        priority: "high"
      }
    );
  };

  // =============================================================================
  // PERIOD CLOSE NOTIFICATIONS
  // =============================================================================

  const periodCloseStarted = (period: string, type: 'month' | 'quarter' | 'year') => {
    return notifications.info(
      `${type.charAt(0).toUpperCase() + type.slice(1)}-End Close Started`,
      `${type}-end close process for ${period} has been initiated.`,
      {
        sound: true,
        duration: 4000,
        priority: "normal"
      }
    );
  };

  const periodCloseCompleted = (period: string, type: 'month' | 'quarter' | 'year') => {
    return notifications.success(
      `${type.charAt(0).toUpperCase() + type.slice(1)}-End Close Completed`,
      `${type}-end close for ${period} has been completed successfully.`,
      {
        sound: true,
        duration: 5000,
        priority: "high"
      }
    );
  };

  const periodCloseBlocked = (period: string, issues: string[]) => {
    return notifications.error(
      "Period Close Blocked",
      `Cannot close ${period}. Issues: ${issues.join(', ')}`,
      {
        sound: true,
        duration: 8000,
        priority: "critical"
      }
    );
  };

  // =============================================================================
  // RETURN NOTIFICATION SERVICE OBJECT
  // =============================================================================

  return {
    // Core notifications
    ...notifications,

    // Financial operations
    reportGenerated,
    reportExported,
    dataLoadError,
    dataLoadSuccess,

    // Financial statements
    statementGenerated,
    statementApproved,
    statementRejected,

    // Journal entries
    journalEntryCreated,
    journalEntryPosted,
    journalEntryApprovalRequired,
    journalEntryReversed,

    // Budget and variance
    budgetCreated,
    budgetApproved,
    varianceAlert,

    // Audit and compliance
    auditTrailLogged,
    complianceAlert,
    soxControlTest,

    // Security
    securityEvent,
    permissionDenied,
    sessionTimeout,

    // Cash management
    cashTransactionRecorded,
    cashReconciliation,
    cashFlowAlert,

    // Period close
    periodCloseStarted,
    periodCloseCompleted,
    periodCloseBlocked
  };
}

// =============================================================================
// CONVENIENCE FUNCTIONS FOR NON-COMPONENT USAGE
// =============================================================================

// These functions can be used in services and utilities where React hooks aren't available
export const createFinancialNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
  // This would be used in cases where we need to trigger notifications from non-React contexts
  // Implementation would depend on your notification system's external API
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
};

export default useFinancialNotifications;