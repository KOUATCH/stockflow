"use server"

import type {
  ActivityType,
  BreakType,
  ClockMethod,
  OrganizationPresenceOverview,
  PresenceStatus,
  PresenceStatusResponse,
} from "@/types/presence"
import {
  canAccessOrganization,
  getActiveEmployeeCount,
  getPresenceAuth,
  PRESENCE_SCHEMA_UNAVAILABLE,
  revalidatePresencePaths,
  syntheticId,
} from "./presenceCompatibility"

export type { ActivityType, ClockMethod, PresenceStatus }

interface ClockInData {
  locationId: string
  stationId?: string
  method?: ClockMethod
  geolocation?: {
    latitude: number
    longitude: number
    accuracy: number
  }
  deviceInfo?: {
    userAgent: string
    platform: string
    language: string
  }
  notes?: string
}

interface ClockOutData {
  method?: ClockMethod
  notes?: string
}

interface StartBreakData {
  breakType?: BreakType
  expectedDuration?: number
  reason?: string
  notes?: string
}

type PresenceActionResult<T extends object = Record<string, never>> =
  | ({ success: true; error?: undefined } & T)
  | { success?: false; error: string }

function emptyOrganizationOverview(totalEmployees: number): OrganizationPresenceOverview {
  return {
    totalEmployees,
    present: 0,
    clockedIn: 0,
    onBreak: 0,
    overtime: 0,
    absent: 0,
    late: 0,
    offline: totalEmployees,
    activeSessions: 0,
    averageWorkDuration: 0,
    averageBreakDuration: 0,
    totalOvertimeHours: 0,
    totalBreaksTaken: 0,
    sessions: [],
  }
}

export async function clockInEmployee(_data: ClockInData): Promise<PresenceActionResult> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  return { error: PRESENCE_SCHEMA_UNAVAILABLE }
}

export async function clockOutEmployee(_data: ClockOutData = {}): Promise<PresenceActionResult> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  return { error: PRESENCE_SCHEMA_UNAVAILABLE }
}

export async function startBreak(_data: StartBreakData = {}): Promise<PresenceActionResult> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  return { error: PRESENCE_SCHEMA_UNAVAILABLE }
}

export async function endBreak(): Promise<PresenceActionResult> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  return { error: PRESENCE_SCHEMA_UNAVAILABLE }
}

export async function getCurrentPresenceStatus(
  _userId?: string,
): Promise<(PresenceStatusResponse & { error?: undefined }) | { error: string }> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  return {
    status: "OFFLINE",
    session: null,
  }
}

export async function getOrganizationPresenceOverview(
  organizationId?: string,
): Promise<PresenceActionResult<{ overview: OrganizationPresenceOverview }>> {
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
    overview: emptyOrganizationOverview(totalEmployees),
  }
}

export async function logActivity(
  activityType: ActivityType,
  description?: string,
  metadata?: Record<string, unknown>,
): Promise<PresenceActionResult<{
  activity: {
    id: string
    userId: string
    activityType: ActivityType
    description?: string
    metadata?: Record<string, unknown>
    timestamp: Date
    systemGenerated: boolean
  }
}>> {
  const auth = await getPresenceAuth()
  if ("error" in auth) {
    return auth
  }

  const activity = {
    id: syntheticId("presence-activity"),
    userId: auth.user.id,
    activityType,
    description,
    metadata,
    timestamp: new Date(),
    systemGenerated: false,
  }

  revalidatePresencePaths()

  return {
    success: true,
    activity,
  }
}
