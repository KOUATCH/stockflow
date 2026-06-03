"use server"

import {
  canAccessOrganization,
  getActiveEmployeeCount,
  getActiveEmployees,
  getPresenceAuth,
  PRESENCE_SCHEMA_UNAVAILABLE,
} from "./presenceCompatibility"

export interface PresenceStats {
  totalEmployees: number
  currentlyWorking: number
  onBreak: number
  lateToday: number
  averageAttendance: number
  activeAlerts: number
}

export interface EmployeePresenceStatus {
  id: string
  name: string
  email: string
  jobTitle?: string
  status: "CLOCKED_IN" | "CLOCKED_OUT" | "ON_BREAK"
  clockInTime?: Date
  expectedClockOutTime?: Date
  totalHoursToday: number
  isLate: boolean
  currentSessionId?: string
  location?: string
}

export interface PresenceAlert {
  id: string
  type: "LATE_ARRIVAL" | "LONG_BREAK" | "OVERTIME" | "MISSED_CLOCK_OUT"
  severity: "LOW" | "MEDIUM" | "HIGH"
  title: string
  description: string
  employeeId: string
  employeeName: string
  createdAt: Date
  isResolved: boolean
}

export interface PresenceOverview {
  stats: PresenceStats
  recentActivity: Array<{
    id: string
    employeeName: string
    action: string
    timestamp: Date
    details?: string
  }>
  alerts: PresenceAlert[]
}

type ActionResult<T> =
  | { success: true; data: T; error?: undefined; message?: string }
  | { success: false; error: string; data?: undefined; message?: string }

function emptyOverview(totalEmployees: number): PresenceOverview {
  return {
    stats: {
      totalEmployees,
      currentlyWorking: 0,
      onBreak: 0,
      lateToday: 0,
      averageAttendance: 0,
      activeAlerts: 0,
    },
    recentActivity: [],
    alerts: [],
  }
}

export async function getPresenceOverview(
  organizationId: string,
  _date: Date = new Date(),
): Promise<ActionResult<PresenceOverview>> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return { success: false, error: auth.error }
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { success: false, error: "Access denied" }
  }

  const totalEmployees = await getActiveEmployeeCount(organizationId)

  return {
    success: true,
    data: emptyOverview(totalEmployees),
  }
}

export async function getEmployeePresenceStatuses(
  organizationId: string,
  _date: Date = new Date(),
): Promise<ActionResult<EmployeePresenceStatus[]>> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return { success: false, error: auth.error }
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { success: false, error: "Access denied" }
  }

  const employees = await getActiveEmployees(organizationId)

  return {
    success: true,
    data: employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      jobTitle: employee.jobTitle || undefined,
      status: "CLOCKED_OUT",
      totalHoursToday: 0,
      isLate: false,
    })),
  }
}

export async function clockInEmployee(
  organizationId: string,
  _userId: string,
  _locationId: string,
  _options?: {
    notes?: string
    ipAddress?: string
    deviceInfo?: unknown
    geolocation?: unknown
  },
): Promise<ActionResult<null>> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return { success: false, error: auth.error }
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { success: false, error: "Access denied" }
  }

  return { success: false, error: PRESENCE_SCHEMA_UNAVAILABLE }
}

export async function clockOutEmployee(
  organizationId: string,
  _userId: string,
  _options?: {
    notes?: string
    ipAddress?: string
    deviceInfo?: unknown
  },
): Promise<ActionResult<null>> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return { success: false, error: auth.error }
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { success: false, error: "Access denied" }
  }

  return { success: false, error: PRESENCE_SCHEMA_UNAVAILABLE }
}

export async function startBreak(
  organizationId: string,
  _userId: string,
  _breakType: "REGULAR" | "LUNCH" | "PERSONAL" = "REGULAR",
  _reason?: string,
): Promise<ActionResult<null>> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return { success: false, error: auth.error }
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { success: false, error: "Access denied" }
  }

  return { success: false, error: PRESENCE_SCHEMA_UNAVAILABLE }
}

export async function endBreak(
  organizationId: string,
  _userId: string,
): Promise<ActionResult<null>> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return { success: false, error: auth.error }
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { success: false, error: "Access denied" }
  }

  return { success: false, error: PRESENCE_SCHEMA_UNAVAILABLE }
}
