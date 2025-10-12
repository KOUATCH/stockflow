"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth-server";

interface CreateScheduleData {
  userId: string;
  locationId?: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  breakDurations?: number[]; // Array of break durations in minutes
  effectiveFrom: Date;
  effectiveUntil?: Date;
  notes?: string;
}

interface UpdateScheduleData extends CreateScheduleData {
  id: string;
}

// Get Employee Schedules
export async function getEmployeeSchedules(userId: string) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const schedules = await db.employeeSchedule.findMany({
      where: {
        userId,
        organizationId: currentUser.organizationId
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { effectiveFrom: 'desc' }
      ]
    });

    return { success: true, schedules };

  } catch (error) {
    console.error("Error fetching employee schedules:", error);
    return { error: "Failed to fetch schedules" };
  }
}

// Create Employee Schedule
export async function createEmployeeSchedule(data: CreateScheduleData) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      return { error: "Invalid time format. Use HH:MM format" };
    }

    // Validate that end time is after start time
    const startMinutes = timeToMinutes(data.startTime);
    const endMinutes = timeToMinutes(data.endTime);
    if (endMinutes <= startMinutes) {
      return { error: "End time must be after start time" };
    }

    // Check for overlapping schedules
    const existingSchedule = await db.employeeSchedule.findFirst({
      where: {
        userId: data.userId,
        dayOfWeek: data.dayOfWeek,
        locationId: data.locationId,
        isActive: true,
        effectiveFrom: { lte: data.effectiveFrom },
        OR: [
          { effectiveUntil: null },
          { effectiveUntil: { gte: data.effectiveFrom } }
        ]
      }
    });

    if (existingSchedule) {
      return { error: "Schedule already exists for this day and location" };
    }

    const schedule = await db.employeeSchedule.create({
      data: {
        userId: data.userId,
        organizationId: currentUser.organizationId,
        locationId: data.locationId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        breakDurations: data.breakDurations,
        effectiveFrom: data.effectiveFrom,
        effectiveUntil: data.effectiveUntil,
        notes: data.notes
      },
      include: {
        location: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    revalidatePath('/dashboard/presence/schedules');
    return { success: true, schedule };

  } catch (error) {
    console.error("Error creating employee schedule:", error);
    return { error: "Failed to create schedule" };
  }
}

// Update Employee Schedule
export async function updateEmployeeSchedule(data: UpdateScheduleData) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      return { error: "Invalid time format. Use HH:MM format" };
    }

    // Validate that end time is after start time
    const startMinutes = timeToMinutes(data.startTime);
    const endMinutes = timeToMinutes(data.endTime);
    if (endMinutes <= startMinutes) {
      return { error: "End time must be after start time" };
    }

    const schedule = await db.employeeSchedule.update({
      where: {
        id: data.id,
        organizationId: currentUser.organizationId
      },
      data: {
        locationId: data.locationId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        breakDurations: data.breakDurations,
        effectiveFrom: data.effectiveFrom,
        effectiveUntil: data.effectiveUntil,
        notes: data.notes
      },
      include: {
        location: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    revalidatePath('/dashboard/presence/schedules');
    return { success: true, schedule };

  } catch (error) {
    console.error("Error updating employee schedule:", error);
    return { error: "Failed to update schedule" };
  }
}

// Delete Employee Schedule
export async function deleteEmployeeSchedule(scheduleId: string) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    await db.employeeSchedule.delete({
      where: {
        id: scheduleId,
        organizationId: currentUser.organizationId
      }
    });

    revalidatePath('/dashboard/presence/schedules');
    return { success: true };

  } catch (error) {
    console.error("Error deleting employee schedule:", error);
    return { error: "Failed to delete schedule" };
  }
}

// Get Organization Schedules (for managers)
export async function getOrganizationSchedules(organizationId?: string) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const targetOrgId = organizationId || currentUser.organizationId;

    const schedules = await db.employeeSchedule.findMany({
      where: {
        organizationId: targetOrgId,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Group schedules by user
    const schedulesByUser = schedules.reduce((acc, schedule) => {
      const userId = schedule.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: schedule.user,
          schedules: []
        };
      }
      acc[userId].schedules.push(schedule);
      return acc;
    }, {} as Record<string, any>);

    return { success: true, schedules: Object.values(schedulesByUser) };

  } catch (error) {
    console.error("Error fetching organization schedules:", error);
    return { error: "Failed to fetch schedules" };
  }
}

// Get Today's Scheduled Employees
export async function getTodaysScheduledEmployees(locationId?: string) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const today = new Date();
    const dayOfWeek = today.getDay();

    const whereClause: any = {
      organizationId: currentUser.organizationId,
      dayOfWeek,
      isActive: true,
      effectiveFrom: { lte: today },
      OR: [
        { effectiveUntil: null },
        { effectiveUntil: { gte: today } }
      ]
    };

    if (locationId) {
      whereClause.locationId = locationId;
    }

    const schedules = await db.employeeSchedule.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true,
            image: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Get current presence status for each scheduled employee
    const userIds = schedules.map(s => s.userId);
    const currentSessions = await db.employeePresenceSession.findMany({
      where: {
        userId: { in: userIds },
        status: {
          in: ['CLOCKED_IN', 'ON_BREAK', 'OVERTIME']
        }
      },
      select: {
        userId: true,
        status: true,
        clockInTime: true
      }
    });

    const sessionMap = currentSessions.reduce((acc, session) => {
      acc[session.userId] = session;
      return acc;
    }, {} as Record<string, any>);

    const scheduledEmployees = schedules.map(schedule => ({
      ...schedule,
      currentSession: sessionMap[schedule.userId] || null,
      isPresent: !!sessionMap[schedule.userId],
      status: sessionMap[schedule.userId]?.status || 'ABSENT'
    }));

    return { success: true, employees: scheduledEmployees };

  } catch (error) {
    console.error("Error fetching today's scheduled employees:", error);
    return { error: "Failed to fetch scheduled employees" };
  }
}

// Utility function to convert time string to minutes
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Get Weekly Schedule for User
export async function getWeeklySchedule(userId: string, weekStart?: Date) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const startOfWeek = weekStart || getStartOfWeek(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const schedules = await db.employeeSchedule.findMany({
      where: {
        userId,
        organizationId: currentUser.organizationId,
        isActive: true,
        effectiveFrom: { lte: endOfWeek },
        OR: [
          { effectiveUntil: null },
          { effectiveUntil: { gte: startOfWeek } }
        ]
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        dayOfWeek: 'asc'
      }
    });

    // Create array for each day of week
    const weeklySchedule = Array.from({ length: 7 }, (_, index) => {
      const daySchedule = schedules.find(s => s.dayOfWeek === index);
      return {
        dayOfWeek: index,
        dayName: getDayName(index),
        date: new Date(startOfWeek.getTime() + index * 24 * 60 * 60 * 1000),
        schedule: daySchedule || null
      };
    });

    return { success: true, weeklySchedule, weekStart: startOfWeek };

  } catch (error) {
    console.error("Error fetching weekly schedule:", error);
    return { error: "Failed to fetch weekly schedule" };
  }
}

// Utility functions
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}