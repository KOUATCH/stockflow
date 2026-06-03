"use server"

import type { PresenceAlert } from "@/types/presence"
import {
  canAccessOrganization,
  getPresenceAuth,
  revalidatePresencePaths,
  syntheticId,
} from "./presenceCompatibility"

export type AlertType =
  | "LATE_ARRIVAL"
  | "EARLY_DEPARTURE"
  | "MISSED_CLOCK_OUT"
  | "EXTENDED_BREAK"
  | "NO_SHOW"
  | "OVERTIME_ALERT"
  | "SCHEDULE_CONFLICT"
  | "UNUSUAL_ACTIVITY"
  | "LOCATION_MISMATCH"
  | "SYSTEM_ERROR"

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "URGENT"

interface AlertFilters {
  isRead?: boolean
  isResolved?: boolean
  severity?: AlertSeverity
  alertType?: AlertType
  userId?: string
  limit?: number
  offset?: number
}

interface CreateAlertData {
  userId: string
  alertType: AlertType
  severity: AlertSeverity
  title: string
  description?: string
  metadata?: Record<string, unknown>
}

interface EmptyAlertSummary {
  total: number
  unresolved: number
  bySeverity: Record<string, number>
  byType: Record<string, number>
}

function emptySummary(total = 0): EmptyAlertSummary {
  return {
    total,
    unresolved: 0,
    bySeverity: {},
    byType: {},
  }
}

function emptyStatistics() {
  return {
    total: 0,
    unresolved: 0,
    unread: 0,
    resolvedPercentage: 0,
    bySeverity: {},
    byType: {},
    trend: [],
  }
}

export async function getPresenceAlerts(_userId: string, _filters?: AlertFilters) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  return {
    success: true,
    alerts: [] as PresenceAlert[],
    totalCount: 0,
  }
}

export async function getOrganizationAlerts(organizationId?: string, _filters?: AlertFilters) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { error: "Access denied" }
  }

  return {
    success: true,
    alerts: [] as PresenceAlert[],
    totalCount: 0,
    summary: emptySummary(),
  }
}

export async function createAlert(data: CreateAlertData) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  const alert: PresenceAlert = {
    id: syntheticId("presence-alert"),
    userId: data.userId,
    organizationId: auth.user.organizationId,
    alertType: data.alertType,
    severity: data.severity,
    title: data.title,
    description: data.description,
    isRead: false,
    isResolved: false,
    metadata: data.metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: data.userId,
      name: "Employee",
      email: "",
    },
  }

  revalidatePresencePaths()

  return {
    success: true,
    alert,
    persisted: false,
  }
}

export async function markAlertAsRead(_alertId: string) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  revalidatePresencePaths()

  return {
    success: true,
    alert: null,
  }
}

export async function markAlertsAsRead(alertIds: string[]) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  revalidatePresencePaths()

  return {
    success: true,
    updatedCount: alertIds.length,
  }
}

export async function resolveAlert(_alertId: string, _resolutionNotes?: string) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  revalidatePresencePaths()

  return {
    success: true,
    alert: null,
  }
}

export async function dismissAlert(_alertId: string) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  revalidatePresencePaths()

  return {
    success: true,
    alert: null,
  }
}

export async function getAlertStatistics(organizationId?: string, _dateRange?: {
  from: Date
  to: Date
}) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { error: "Access denied" }
  }

  return {
    success: true,
    statistics: emptyStatistics(),
  }
}

export async function generateSystemAlerts(organizationId?: string) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { error: "Access denied" }
  }

  return {
    success: true,
    alertsGenerated: 0,
  }
}
