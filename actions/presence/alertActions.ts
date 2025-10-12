"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth-server";

export type AlertType =
  | 'LATE_ARRIVAL'
  | 'EARLY_DEPARTURE'
  | 'MISSED_CLOCK_OUT'
  | 'EXTENDED_BREAK'
  | 'NO_SHOW'
  | 'OVERTIME_ALERT'
  | 'SCHEDULE_CONFLICT'
  | 'UNUSUAL_ACTIVITY'
  | 'LOCATION_MISMATCH'
  | 'SYSTEM_ERROR';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'URGENT';

interface CreateAlertData {
  userId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Get Presence Alerts for User
export async function getPresenceAlerts(userId: string, filters?: {
  isRead?: boolean;
  isResolved?: boolean;
  severity?: AlertSeverity;
  alertType?: AlertType;
  limit?: number;
  offset?: number;
}) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const whereClause: any = {
      userId,
      organizationId: currentUser.organizationId
    };

    if (filters?.isRead !== undefined) {
      whereClause.isRead = filters.isRead;
    }

    if (filters?.isResolved !== undefined) {
      whereClause.isResolved = filters.isResolved;
    }

    if (filters?.severity) {
      whereClause.severity = filters.severity;
    }

    if (filters?.alertType) {
      whereClause.alertType = filters.alertType;
    }

    const alerts = await db.presenceAlert.findMany({
      where: whereClause,
      include: {
        resolver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    });

    // Get total count for pagination
    const totalCount = await db.presenceAlert.count({
      where: whereClause
    });

    return { success: true, alerts, totalCount };

  } catch (error) {
    console.error("Error fetching presence alerts:", error);
    return { error: "Failed to fetch alerts" };
  }
}

// Get Organization Alerts (for managers)
export async function getOrganizationAlerts(organizationId?: string, filters?: {
  isRead?: boolean;
  isResolved?: boolean;
  severity?: AlertSeverity;
  alertType?: AlertType;
  userId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const targetOrgId = organizationId || currentUser.organizationId;

    const whereClause: any = {
      organizationId: targetOrgId
    };

    if (filters?.isRead !== undefined) {
      whereClause.isRead = filters.isRead;
    }

    if (filters?.isResolved !== undefined) {
      whereClause.isResolved = filters.isResolved;
    }

    if (filters?.severity) {
      whereClause.severity = filters.severity;
    }

    if (filters?.alertType) {
      whereClause.alertType = filters.alertType;
    }

    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }

    const alerts = await db.presenceAlert.findMany({
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
        resolver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ],
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    });

    // Get total count for pagination
    const totalCount = await db.presenceAlert.count({
      where: whereClause
    });

    // Get summary statistics
    const alertStats = await db.presenceAlert.groupBy({
      by: ['severity', 'alertType'],
      where: {
        ...whereClause,
        isResolved: false
      },
      _count: true
    });

    const summary = {
      total: totalCount,
      unresolved: alertStats.reduce((sum, stat) => sum + stat._count, 0),
      bySeverity: alertStats.reduce((acc, stat) => {
        acc[stat.severity] = (acc[stat.severity] || 0) + stat._count;
        return acc;
      }, {} as Record<string, number>),
      byType: alertStats.reduce((acc, stat) => {
        acc[stat.alertType] = (acc[stat.alertType] || 0) + stat._count;
        return acc;
      }, {} as Record<string, number>)
    };

    return { success: true, alerts, totalCount, summary };

  } catch (error) {
    console.error("Error fetching organization alerts:", error);
    return { error: "Failed to fetch alerts" };
  }
}

// Create Alert
export async function createAlert(data: CreateAlertData) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const alert = await db.presenceAlert.create({
      data: {
        userId: data.userId,
        organizationId: currentUser.organizationId,
        alertType: data.alertType,
        severity: data.severity,
        title: data.title,
        description: data.description,
        metadata: data.metadata
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    revalidatePath('/dashboard/presence/alerts');
    return { success: true, alert };

  } catch (error) {
    console.error("Error creating alert:", error);
    return { error: "Failed to create alert" };
  }
}

// Mark Alert as Read
export async function markAlertAsRead(alertId: string) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const alert = await db.presenceAlert.update({
      where: {
        id: alertId,
        organizationId: currentUser.organizationId
      },
      data: {
        isRead: true
      }
    });

    revalidatePath('/dashboard/presence/alerts');
    return { success: true, alert };

  } catch (error) {
    console.error("Error marking alert as read:", error);
    return { error: "Failed to mark alert as read" };
  }
}

// Mark Multiple Alerts as Read
export async function markAlertsAsRead(alertIds: string[]) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const result = await db.presenceAlert.updateMany({
      where: {
        id: { in: alertIds },
        organizationId: currentUser.organizationId
      },
      data: {
        isRead: true
      }
    });

    revalidatePath('/dashboard/presence/alerts');
    return { success: true, updatedCount: result.count };

  } catch (error) {
    console.error("Error marking alerts as read:", error);
    return { error: "Failed to mark alerts as read" };
  }
}

// Resolve Alert
export async function resolveAlert(alertId: string, resolutionNotes?: string) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const alert = await db.presenceAlert.update({
      where: {
        id: alertId,
        organizationId: currentUser.organizationId
      },
      data: {
        isResolved: true,
        isRead: true,
        resolvedById: currentUser.id,
        resolvedAt: new Date(),
        resolutionNotes
      },
      include: {
        resolver: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    revalidatePath('/dashboard/presence/alerts');
    return { success: true, alert };

  } catch (error) {
    console.error("Error resolving alert:", error);
    return { error: "Failed to resolve alert" };
  }
}

// Dismiss Alert (mark as read but not resolved)
export async function dismissAlert(alertId: string) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const alert = await db.presenceAlert.update({
      where: {
        id: alertId,
        organizationId: currentUser.organizationId
      },
      data: {
        isRead: true
      }
    });

    revalidatePath('/dashboard/presence/alerts');
    return { success: true, alert };

  } catch (error) {
    console.error("Error dismissing alert:", error);
    return { error: "Failed to dismiss alert" };
  }
}

// Get Alert Statistics
export async function getAlertStatistics(organizationId?: string, dateRange?: {
  from: Date;
  to: Date;
}) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const targetOrgId = organizationId || currentUser.organizationId;

    const whereClause: any = {
      organizationId: targetOrgId
    };

    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to
      };
    }

    // Get total counts
    const totalAlerts = await db.presenceAlert.count({
      where: whereClause
    });

    const unresolvedAlerts = await db.presenceAlert.count({
      where: {
        ...whereClause,
        isResolved: false
      }
    });

    const unreadAlerts = await db.presenceAlert.count({
      where: {
        ...whereClause,
        isRead: false
      }
    });

    // Get counts by severity
    const severityStats = await db.presenceAlert.groupBy({
      by: ['severity'],
      where: whereClause,
      _count: true
    });

    // Get counts by type
    const typeStats = await db.presenceAlert.groupBy({
      by: ['alertType'],
      where: whereClause,
      _count: true
    });

    // Get daily trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await db.presenceAlert.groupBy({
      by: ['alertType'],
      where: {
        ...whereClause,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true,
      _min: {
        createdAt: true
      }
    });

    const statistics = {
      total: totalAlerts,
      unresolved: unresolvedAlerts,
      unread: unreadAlerts,
      resolvedPercentage: totalAlerts > 0 ? ((totalAlerts - unresolvedAlerts) / totalAlerts) * 100 : 0,
      bySeverity: severityStats.reduce((acc, stat) => {
        acc[stat.severity] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      byType: typeStats.reduce((acc, stat) => {
        acc[stat.alertType] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      trend: dailyStats
    };

    return { success: true, statistics };

  } catch (error) {
    console.error("Error fetching alert statistics:", error);
    return { error: "Failed to fetch alert statistics" };
  }
}

// Auto-generate alerts based on attendance patterns
export async function generateSystemAlerts(organizationId?: string) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return { error: "Authentication required" };
    }

    const targetOrgId = organizationId || currentUser.organizationId;
    const alertsGenerated = [];

    // Check for missed clock-outs (sessions that started yesterday but haven't ended)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const missedClockOuts = await db.employeePresenceSession.findMany({
      where: {
        organizationId: targetOrgId,
        clockInTime: {
          gte: yesterday,
          lte: yesterdayEnd
        },
        clockOutTime: null,
        status: {
          in: ['CLOCKED_IN', 'ON_BREAK']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    for (const session of missedClockOuts) {
      // Check if alert already exists
      const existingAlert = await db.presenceAlert.findFirst({
        where: {
          userId: session.userId,
          alertType: 'MISSED_CLOCK_OUT',
          createdAt: {
            gte: yesterday
          }
        }
      });

      if (!existingAlert) {
        const alert = await db.presenceAlert.create({
          data: {
            userId: session.userId,
            organizationId: targetOrgId,
            alertType: 'MISSED_CLOCK_OUT',
            severity: 'MEDIUM',
            title: 'Missed Clock Out',
            description: `Employee ${session.user.name} forgot to clock out yesterday`,
            metadata: {
              sessionId: session.id,
              clockInTime: session.clockInTime,
              estimatedWorkHours: 8
            }
          }
        });
        alertsGenerated.push(alert);
      }
    }

    // Check for no-shows (employees scheduled but didn't clock in)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    const scheduledEmployees = await db.employeeSchedule.findMany({
      where: {
        organizationId: targetOrgId,
        dayOfWeek,
        isActive: true,
        effectiveFrom: { lte: today },
        OR: [
          { effectiveUntil: null },
          { effectiveUntil: { gte: today } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    for (const schedule of scheduledEmployees) {
      // Check if employee has clocked in today
      const todaySession = await db.employeePresenceSession.findFirst({
        where: {
          userId: schedule.userId,
          clockInTime: {
            gte: todayStart
          }
        }
      });

      // Check if it's more than 30 minutes past scheduled start time
      const scheduledStart = new Date(today);
      const [hours, minutes] = schedule.startTime.split(':').map(Number);
      scheduledStart.setHours(hours, minutes + 30, 0, 0); // 30 minutes grace period

      if (!todaySession && new Date() > scheduledStart) {
        // Check if alert already exists
        const existingAlert = await db.presenceAlert.findFirst({
          where: {
            userId: schedule.userId,
            alertType: 'NO_SHOW',
            createdAt: {
              gte: todayStart
            }
          }
        });

        if (!existingAlert) {
          const alert = await db.presenceAlert.create({
            data: {
              userId: schedule.userId,
              organizationId: targetOrgId,
              alertType: 'NO_SHOW',
              severity: 'HIGH',
              title: 'No Show',
              description: `Employee ${schedule.user.name} was scheduled to work at ${schedule.startTime} but has not clocked in`,
              metadata: {
                scheduledTime: schedule.startTime,
                currentTime: new Date().toISOString(),
                locationId: schedule.locationId
              }
            }
          });
          alertsGenerated.push(alert);
        }
      }
    }

    return { success: true, alertsGenerated: alertsGenerated.length };

  } catch (error) {
    console.error("Error generating system alerts:", error);
    return { error: "Failed to generate system alerts" };
  }
}