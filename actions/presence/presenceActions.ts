"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";

import { revalidatePath } from "next/cache";

export type PresenceStatus = 'CLOCKED_IN' | 'ON_BREAK' | 'CLOCKED_OUT' | 'OVERTIME' | 'LATE' | 'ABSENT' | 'OFFLINE';
export type ClockMethod = 'MANUAL' | 'BIOMETRIC' | 'CARD_SWIPE' | 'MOBILE_APP' | 'WEB_BROWSER' | 'QR_CODE' | 'NFC' | 'GEOFENCE';
export type ActivityType = 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END' | 'POS_TRANSACTION' | 'SYSTEM_LOGIN' | 'OTHER';

interface ClockInData {
  locationId: string;
  stationId?: string;
  method?: ClockMethod;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  deviceInfo?: {
    userAgent: string;
    platform: string;
    language: string;
  };
  notes?: string;
}

interface ClockOutData {
  method?: ClockMethod;
  notes?: string;
}

interface StartBreakData {
  breakType?: 'LUNCH' | 'SHORT_BREAK' | 'PERSONAL' | 'TRAINING' | 'MEETING' | 'EMERGENCY' | 'SICK' | 'REGULAR' | 'EXTENDED';
  expectedDuration?: number; // in minutes
  reason?: string;
  notes?: string;
}

// Clock In Employee
export async function clockInEmployee(data: ClockInData) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    // Check if user already has an active session
    const existingSession = await db.employeePresenceSession.findFirst({
      where: {
        userId: currentUser.id,
        status: {
          in: ['CLOCKED_IN', 'ON_BREAK']
        }
      }
    });

    if (existingSession) {
      return { error: "User already has an active session" };
    }

    // Get user's schedule for today to check if they're late
    const today = new Date();
    const dayOfWeek = today.getDay();

    const schedule = await db.employeeSchedule.findFirst({
      where: {
        userId: currentUser.id,
        dayOfWeek,
        isActive: true,
        effectiveFrom: { lte: today },
        OR: [
          { effectiveUntil: null },
          { effectiveUntil: { gte: today } }
        ]
      }
    });

    let status: PresenceStatus = 'CLOCKED_IN';
    const currentTime = new Date();

    // Check if late based on schedule
    if (schedule) {
      const scheduledStart = new Date(today);
      const [hours, minutes] = schedule.startTime.split(':').map(Number);
      scheduledStart.setHours(hours, minutes, 0, 0);

      if (currentTime > scheduledStart) {
        status = 'LATE';
      }
    }

    // Create presence session
    const session = await db.employeePresenceSession.create({
      data: {
        userId: currentUser.id,
        locationId: data.locationId,
        organizationId: currentUser.organizationId,
        stationId: data.stationId,
        status,
        clockInTime: currentTime,
        clockInMethod: data.method || 'MANUAL',
        geolocation: data.geolocation,
        deviceInfo: data.deviceInfo,
        notes: data.notes
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        location: {
          select: {
            name: true
          }
        }
      }
    });

    // Log activity
    await db.employeeActivityLog.create({
      data: {
        presenceSessionId: session.id,
        userId: currentUser.id,
        activityType: 'CLOCK_IN',
        description: `Clocked in at ${data.locationId}`,
        systemGenerated: true,
        metadata: {
          method: data.method,
          location: data.locationId,
          station: data.stationId
        }
      }
    });

    // Create alert if late
    if (status === 'LATE' && schedule) {
      const scheduledStart = new Date(today);
      const [hours, minutes] = schedule.startTime.split(':').map(Number);
      scheduledStart.setHours(hours, minutes, 0, 0);
      const lateMinutes = Math.floor((currentTime.getTime() - scheduledStart.getTime()) / 60000);

      await db.presenceAlert.create({
        data: {
          userId: currentUser.id,
          organizationId: currentUser.organizationId,
          alertType: 'LATE_ARRIVAL',
          severity: lateMinutes > 30 ? 'HIGH' : 'MEDIUM',
          title: 'Late Arrival',
          description: `Employee arrived ${lateMinutes} minutes late`,
          metadata: {
            lateMinutes,
            scheduledTime: schedule.startTime,
            actualTime: currentTime.toISOString()
          }
        }
      });
    }

    revalidatePath('/dashboard/presence');
    return { success: true, session };

  } catch (error) {
    console.error("Error clocking in:", error);
    return { error: "Failed to clock in. Please try again." };
  }
}

// Clock Out Employee
export async function clockOutEmployee(data: ClockOutData = {}) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    // Find active session
    const session = await db.employeePresenceSession.findFirst({
      where: {
        userId: currentUser.id,
        status: {
          in: ['CLOCKED_IN', 'ON_BREAK', 'OVERTIME']
        }
      }
    });

    if (!session) {
      return { error: "No active session found" };
    }

    const clockOutTime = new Date();
    const totalMinutesWorked = Math.floor(
      (clockOutTime.getTime() - session.clockInTime.getTime()) / 60000
    ) - session.totalBreakMinutes;

    // Check for overtime
    const isOvertime = totalMinutesWorked > 480; // 8 hours
    const overtimeMinutes = isOvertime ? totalMinutesWorked - 480 : 0;

    // Update session
    const updatedSession = await db.employeePresenceSession.update({
      where: { id: session.id },
      data: {
        status: 'CLOCKED_OUT',
        clockOutTime,
        clockOutMethod: data.method || 'MANUAL',
        totalMinutesWorked,
        overtime: isOvertime,
        overtimeMinutes,
        notes: data.notes ? `${session.notes || ''}\n${data.notes}`.trim() : session.notes
      }
    });

    // End any active breaks
    await db.employeeBreakSession.updateMany({
      where: {
        presenceSessionId: session.id,
        endTime: null
      },
      data: {
        endTime: clockOutTime
      }
    });

    // Log activity
    await db.employeeActivityLog.create({
      data: {
        presenceSessionId: session.id,
        userId: currentUser.id,
        activityType: 'CLOCK_OUT',
        description: 'Clocked out',
        duration: totalMinutesWorked,
        systemGenerated: true,
        metadata: {
          method: data.method,
          totalMinutes: totalMinutesWorked,
          overtime: isOvertime,
          overtimeMinutes
        }
      }
    });

    // Create overtime alert if applicable
    if (isOvertime) {
      await db.presenceAlert.create({
        data: {
          userId: currentUser.id,
          organizationId: currentUser.organizationId,
          alertType: 'OVERTIME_ALERT',
          severity: overtimeMinutes > 120 ? 'HIGH' : 'MEDIUM',
          title: 'Overtime Detected',
          description: `Employee worked ${overtimeMinutes} minutes of overtime`,
          metadata: {
            overtimeMinutes,
            totalMinutes: totalMinutesWorked
          }
        }
      });
    }

    revalidatePath('/dashboard/presence');
    return { success: true, session: updatedSession };

  } catch (error) {
    console.error("Error clocking out:", error);
    return { error: "Failed to clock out. Please try again." };
  }
}

// Start Break
export async function startBreak(data: StartBreakData = {}) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    // Find active session
    const session = await db.employeePresenceSession.findFirst({
      where: {
        userId: currentUser.id,
        status: 'CLOCKED_IN'
      }
    });

    if (!session) {
      return { error: "No active work session found" };
    }

    // Check if already on break
    const activeBreak = await db.employeeBreakSession.findFirst({
      where: {
        presenceSessionId: session.id,
        endTime: null
      }
    });

    if (activeBreak) {
      return { error: "Already on break" };
    }

    // Create break session
    const breakSession = await db.employeeBreakSession.create({
      data: {
        presenceSessionId: session.id,
        userId: currentUser.id,
        breakType: data.breakType || 'REGULAR',
        expectedDuration: data.expectedDuration,
        reason: data.reason,
        notes: data.notes
      }
    });

    // Update presence session status
    await db.employeePresenceSession.update({
      where: { id: session.id },
      data: { status: 'ON_BREAK' }
    });

    // Log activity
    await db.employeeActivityLog.create({
      data: {
        presenceSessionId: session.id,
        userId: currentUser.id,
        activityType: 'BREAK_START',
        description: `Started ${data.breakType || 'regular'} break`,
        systemGenerated: true,
        metadata: {
          breakType: data.breakType,
          expectedDuration: data.expectedDuration
        }
      }
    });

    revalidatePath('/dashboard/presence');
    return { success: true, breakSession };

  } catch (error) {
    console.error("Error starting break:", error);
    return { error: "Failed to start break. Please try again." };
  }
}

// End Break
export async function endBreak() {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    // Find active session and break
    const session = await db.employeePresenceSession.findFirst({
      where: {
        userId: currentUser.id,
        status: 'ON_BREAK'
      }
    });

    if (!session) {
      return { error: "No active break session found" };
    }

    const activeBreak = await db.employeeBreakSession.findFirst({
      where: {
        presenceSessionId: session.id,
        endTime: null
      }
    });

    if (!activeBreak) {
      return { error: "No active break found" };
    }

    const endTime = new Date();
    const actualDuration = Math.floor(
      (endTime.getTime() - activeBreak.startTime.getTime()) / 60000
    );

    // Update break session
    const updatedBreak = await db.employeeBreakSession.update({
      where: { id: activeBreak.id },
      data: {
        endTime,
        actualDuration
      }
    });

    // Update total break minutes in presence session
    const totalBreakMinutes = session.totalBreakMinutes + actualDuration;
    await db.employeePresenceSession.update({
      where: { id: session.id },
      data: {
        status: 'CLOCKED_IN',
        totalBreakMinutes
      }
    });

    // Check for extended break alert
    if (activeBreak.expectedDuration && actualDuration > activeBreak.expectedDuration + 10) {
      await db.presenceAlert.create({
        data: {
          userId: currentUser.id,
          organizationId: currentUser.organizationId,
          alertType: 'EXTENDED_BREAK',
          severity: 'MEDIUM',
          title: 'Extended Break',
          description: `Break exceeded expected duration by ${actualDuration - activeBreak.expectedDuration} minutes`,
          metadata: {
            expectedDuration: activeBreak.expectedDuration,
            actualDuration,
            overageMinutes: actualDuration - activeBreak.expectedDuration
          }
        }
      });
    }

    // Log activity
    await db.employeeActivityLog.create({
      data: {
        presenceSessionId: session.id,
        userId: currentUser.id,
        activityType: 'BREAK_END',
        description: `Ended break (${actualDuration} minutes)`,
        duration: actualDuration,
        systemGenerated: true,
        metadata: {
          breakType: activeBreak.breakType,
          actualDuration
        }
      }
    });

    revalidatePath('/dashboard/presence');
    return { success: true, breakSession: updatedBreak };

  } catch (error) {
    console.error("Error ending break:", error);
    return { error: "Failed to end break. Please try again." };
  }
}

// Get Current User Presence Status
export async function getCurrentPresenceStatus(userId?: string): Promise<PresenceStatusResponse | { error: string }> {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const targetUserId = userId || currentUser.id;

    const session = await db.employeePresenceSession.findFirst({
      where: {
        userId: targetUserId,
        status: {
          in: ['CLOCKED_IN', 'ON_BREAK', 'OVERTIME']
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        },
        location: {
          select: {
            name: true,
            code: true
          }
        },
        breakSessions: {
          where: {
            endTime: null
          },
          orderBy: {
            startTime: 'desc'
          },
          take: 1
        }
      }
    });

    if (!session) {
      return {
        status: 'CLOCKED_OUT',
        session: null
      };
    }

    // Calculate current work duration
    const currentTime = new Date();
    const workDuration = Math.floor(
      (currentTime.getTime() - session.clockInTime.getTime()) / 60000
    );

    return {
      status: session.status,
      session: {
        ...session,
        currentWorkDuration: workDuration,
        isOnBreak: session.breakSessions.length > 0,
        currentBreak: session.breakSessions[0] || null
      }
    };

  } catch (error) {
    console.error("Error getting presence status:", error);
    return { error: "Failed to get presence status" };
  }
}

// Get Organization Presence Overview
export async function getOrganizationPresenceOverview(organizationId?: string) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const targetOrgId = organizationId || currentUser.organizationId;

    // Get all active sessions
    const activeSessions = await db.employeePresenceSession.findMany({
      where: {
        organizationId: targetOrgId,
        status: {
          in: ['CLOCKED_IN', 'ON_BREAK', 'OVERTIME']
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            jobTitle: true
          }
        },
        location: {
          select: {
            name: true,
            code: true
          }
        },
        breakSessions: {
          where: {
            endTime: null
          }
        }
      },
      orderBy: {
        clockInTime: 'asc'
      }
    });

    // Get total employee count
    const totalEmployees = await db.user.count({
      where: {
        organizationId: targetOrgId,
        isActive: true
      }
    });

    const overview = {
      totalEmployees,
      present: activeSessions.length,
      clockedIn: activeSessions.filter(s => s.status === 'CLOCKED_IN').length,
      onBreak: activeSessions.filter(s => s.status === 'ON_BREAK').length,
      overtime: activeSessions.filter(s => s.status === 'OVERTIME').length,
      absent: totalEmployees - activeSessions.length,
      sessions: activeSessions.map(session => {
        const workDuration = Math.floor(
          (new Date().getTime() - session.clockInTime.getTime()) / 60000
        );
        return {
          ...session,
          currentWorkDuration: workDuration,
          isOnBreak: session.breakSessions.length > 0
        };
      })
    };

    return { success: true, overview };

  } catch (error) {
    console.error("Error getting organization presence overview:", error);
    return { error: "Failed to get presence overview" };
  }
}

// Log Activity
export async function logActivity(
  activityType: ActivityType,
  description?: string,
  metadata?: Record<string, any>
) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    // Find active session
    const session = await db.employeePresenceSession.findFirst({
      where: {
        userId: currentUser.id,
        status: {
          in: ['CLOCKED_IN', 'ON_BREAK', 'OVERTIME']
        }
      }
    });

    if (!session) {
      return { error: "No active session found" };
    }

    const activity = await db.employeeActivityLog.create({
      data: {
        presenceSessionId: session.id,
        userId: currentUser.id,
        activityType,
        description,
        metadata,
        systemGenerated: false
      }
    });

    return { success: true, activity };

  } catch (error) {
    console.error("Error logging activity:", error);
    return { error: "Failed to log activity" };
  }
}