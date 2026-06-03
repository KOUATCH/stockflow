"use server"

import type { EmployeeSchedule } from "@/types/presence"
import {
  canAccessOrganization,
  getActiveEmployees,
  getPresenceAuth,
  PRESENCE_SCHEMA_UNAVAILABLE,
  revalidatePresencePaths,
} from "./presenceCompatibility"

interface CreateScheduleData {
  userId: string
  locationId?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  breakDurations?: number[]
  effectiveFrom: Date
  effectiveUntil?: Date
  notes?: string
}

interface UpdateScheduleData extends CreateScheduleData {
  id: string
}

type ScheduleActionResult<T extends object = Record<string, never>> =
  | ({ success: true; error?: undefined } & T)
  | { success?: false; error: string }

function isValidTime(value: string) {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)
}

function validateSchedule(data: CreateScheduleData) {
  if (!Number.isInteger(data.dayOfWeek) || data.dayOfWeek < 0 || data.dayOfWeek > 6) {
    return "Day of week must be between 0 and 6"
  }

  if (!isValidTime(data.startTime) || !isValidTime(data.endTime)) {
    return "Invalid time format. Use HH:MM format"
  }

  if (data.endTime <= data.startTime) {
    return "End time must be after start time"
  }

  return null
}

export async function getEmployeeSchedules(_userId: string): Promise<
  ScheduleActionResult<{ schedules: EmployeeSchedule[] }>
> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  return {
    success: true,
    schedules: [],
  }
}

export async function createEmployeeSchedule(data: CreateScheduleData): Promise<ScheduleActionResult> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  const validationError = validateSchedule(data)
  if (validationError) {
    return { error: validationError }
  }

  return { error: PRESENCE_SCHEMA_UNAVAILABLE }
}

export async function updateEmployeeSchedule(data: UpdateScheduleData): Promise<ScheduleActionResult> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  const validationError = validateSchedule(data)
  if (validationError) {
    return { error: validationError }
  }

  return { error: PRESENCE_SCHEMA_UNAVAILABLE }
}

export async function deleteEmployeeSchedule(_scheduleId: string): Promise<ScheduleActionResult> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  return { error: PRESENCE_SCHEMA_UNAVAILABLE }
}

export async function getOrganizationSchedules(organizationId?: string): Promise<
  ScheduleActionResult<{ schedules: EmployeeSchedule[]; byUser: Record<string, EmployeeSchedule[]> }>
> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  if (!canAccessOrganization(auth.user, organizationId)) {
    return { error: "Access denied" }
  }

  return {
    success: true,
    schedules: [],
    byUser: {},
  }
}

export async function getTodaysScheduledEmployees(locationId?: string) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  const employees = await getActiveEmployees(auth.user.organizationId)

  return {
    success: true,
    employees: employees.map((employee) => ({
      ...employee,
      locationId,
      scheduled: false,
      schedule: null,
      presenceSession: null,
    })),
  }
}

export async function getWeeklySchedule(_userId: string, weekStart: Date = new Date()) {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)

    return {
      date,
      dayOfWeek: date.getDay(),
      schedules: [] as EmployeeSchedule[],
    }
  })

  revalidatePresencePaths()

  return {
    success: true,
    weekStart,
    days,
  }
}
