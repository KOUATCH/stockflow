"use server"

import type { AttendanceAnalytics, AttendanceReport } from "@/types/presence"
import {
  canAccessOrganization,
  getActiveEmployeeCount,
  getEmployeeSummary,
  getPresenceAuth,
  syntheticId,
} from "./presenceCompatibility"

interface DateRange {
  from: Date
  to: Date
}

interface AttendanceReportSummary {
  totalDays: number
  totalScheduledMinutes: number
  totalActualMinutes: number
  totalBreakMinutes: number
  totalOvertimeMinutes: number
  totalLateMinutes: number
  averageAttendanceScore: number
  perfectAttendanceDays: number
}

function emptyReportSummary(): AttendanceReportSummary {
  return {
    totalDays: 0,
    totalScheduledMinutes: 0,
    totalActualMinutes: 0,
    totalBreakMinutes: 0,
    totalOvertimeMinutes: 0,
    totalLateMinutes: 0,
    averageAttendanceScore: 0,
    perfectAttendanceDays: 0,
  }
}

function emptyAttendanceAnalytics(totalEmployees: number): AttendanceAnalytics {
  return {
    summary: {
      totalReports: 0,
      totalEmployees,
      averageAttendanceScore: 0,
      totalScheduledHours: 0,
      totalActualHours: 0,
      totalOvertimeHours: 0,
      attendanceRate: 0,
    },
    topPerformers: [],
    byLocation: {},
    dailyTrends: {},
    problemAreas: {
      chronicallyLate: [],
      frequentAbsences: [],
    },
  }
}

async function buildSyntheticReport(data: {
  userId: string
  organizationId: string
  reportDate: Date
  locationId?: string
}): Promise<AttendanceReport> {
  const user = await getEmployeeSummary(data.userId, data.organizationId)

  return {
    id: syntheticId("attendance-report"),
    userId: data.userId,
    organizationId: data.organizationId,
    locationId: data.locationId,
    reportDate: data.reportDate,
    scheduledMinutes: 0,
    actualMinutes: 0,
    breakMinutes: 0,
    overtimeMinutes: 0,
    lateArrivalMinutes: 0,
    earlyDepartureMinutes: 0,
    attendanceScore: 0,
    productivity: 0,
    generatedAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle || undefined,
    },
  }
}

export async function getAttendanceReport(userId: string, _dateRange: DateRange) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  return {
    success: true,
    report: {
      reports: [] as AttendanceReport[],
      summary: emptyReportSummary(),
      user: await getEmployeeSummary(userId, auth.user.organizationId),
    },
  }
}

export async function generateAttendanceReport(data: {
  userId: string
  reportDate: Date
  locationId: string
  forceRegenerate?: boolean
}) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  const report = await buildSyntheticReport({
    userId: data.userId,
    organizationId: auth.user.organizationId,
    reportDate: new Date(data.reportDate),
    locationId: data.locationId,
  })

  return {
    success: true,
    report,
    generated: false,
  }
}

export async function getAttendanceAnalytics(organizationId: string, _dateRange: DateRange) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { error: "Access denied" }
  }

  const targetOrgId = organizationId || auth.user.organizationId
  const totalEmployees = await getActiveEmployeeCount(targetOrgId)

  return {
    success: true,
    analytics: emptyAttendanceAnalytics(totalEmployees),
  }
}
