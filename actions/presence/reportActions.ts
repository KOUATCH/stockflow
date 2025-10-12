"use server";

import { auth } from "@/auth";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { db } from "@/prisma/db";

interface DateRange {
  from: Date;
  to: Date;
}

// Get Attendance Report for User
export async function getAttendanceReport(userId: string, dateRange: DateRange) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "Authentication required" };
    }

    const reports = await db.attendanceReport.findMany({
      where: {
        userId,
        organizationId: currentUser.organizationId,
        reportDate: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      },
      include: {
        location: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        reportDate: 'desc'
      }
    });

    // Calculate summary statistics
    const summary = {
      totalDays: reports.length,
      totalScheduledMinutes: reports.reduce((sum, r) => sum + r.scheduledMinutes, 0),
      totalActualMinutes: reports.reduce((sum, r) => sum + r.actualMinutes, 0),
      totalBreakMinutes: reports.reduce((sum, r) => sum + r.breakMinutes, 0),
      totalOvertimeMinutes: reports.reduce((sum, r) => sum + r.overtimeMinutes, 0),
      totalLateMinutes: reports.reduce((sum, r) => sum + r.lateArrivalMinutes, 0),
      averageAttendanceScore: reports.length > 0
        ? reports.reduce((sum, r) => sum + Number(r.attendanceScore), 0) / reports.length
        : 0,
      perfectAttendanceDays: reports.filter(r => Number(r.attendanceScore) === 100).length
    };

    return { success: true, report: { reports, summary } };

  } catch (error) {
    console.error("Error fetching attendance report:", error);
    return { error: "Failed to fetch attendance report" };
  }
}

// Generate Attendance Report
export async function generateAttendanceReport(data: {
  userId: string;
  reportDate: Date;
  locationId: string
  forceRegenerate?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "Authentication required" };
    }

    const reportDate = new Date(data.reportDate);
    reportDate.setHours(0, 0, 0, 0);

    // Check if report already exists
    const existingReport = await db.attendanceReport.findUnique({
      where: {
        userId_reportDate_locationId: {
          userId: data.userId,
          reportDate,
          locationId: data.locationId
        }
      }
    });

    if (existingReport && !data.forceRegenerate) {
      return { success: true, report: existingReport, generated: false };
    }

    // Get all presence sessions for the date
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const sessions = await db.employeePresenceSession.findMany({
      where: {
        userId: data.userId,
        organizationId: currentUser.organizationId,
        clockInTime: {
          gte: reportDate,
          lt: nextDay
        }
      },
      include: {
        breakSessions: true
      }
    });

    // Get schedule for the day
    const dayOfWeek = reportDate.getDay();
    const schedule = await db.employeeSchedule.findFirst({
      where: {
        userId: data.userId,
        dayOfWeek,
        isActive: true,
        effectiveFrom: { lte: reportDate },
        OR: [
          { effectiveUntil: null },
          { effectiveUntil: { gte: reportDate } }
        ]
      }
    });

    // Calculate metrics
    let scheduledMinutes = 0;
    let actualMinutes = 0;
    let breakMinutes = 0;
    let overtimeMinutes = 0;
    let lateArrivalMinutes = 0;
    let earlyDepartureMinutes = 0;

    if (schedule) {
      const scheduledStart = new Date(reportDate);
      const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
      scheduledStart.setHours(startHours, startMinutes, 0, 0);

      const scheduledEnd = new Date(reportDate);
      const [endHours, endMinutesTime] = schedule.endTime.split(':').map(Number);
      scheduledEnd.setHours(endHours, endMinutesTime, 0, 0);

      scheduledMinutes = Math.floor((scheduledEnd.getTime() - scheduledStart.getTime()) / 60000);

      // Calculate actual time worked
      for (const session of sessions) {
        if (session.clockOutTime) {
          const sessionMinutes = Math.floor(
            (session.clockOutTime.getTime() - session.clockInTime.getTime()) / 60000
          );
          actualMinutes += sessionMinutes;
          breakMinutes += session.totalBreakMinutes;

          // Check for late arrival
          if (session.clockInTime > scheduledStart) {
            lateArrivalMinutes += Math.floor(
              (session.clockInTime.getTime() - scheduledStart.getTime()) / 60000
            );
          }

          // Check for early departure
          if (session.clockOutTime < scheduledEnd) {
            earlyDepartureMinutes += Math.floor(
              (scheduledEnd.getTime() - session.clockOutTime.getTime()) / 60000
            );
          }

          // Calculate overtime
          const workMinutes = sessionMinutes - session.totalBreakMinutes;
          if (workMinutes > scheduledMinutes) {
            overtimeMinutes += workMinutes - scheduledMinutes;
          }
        }
      }
    }

    // Calculate attendance score (100 - penalties)
    let attendanceScore = 100;
    if (scheduledMinutes > 0) {
      const latenessPenalty = Math.min((lateArrivalMinutes / scheduledMinutes) * 50, 30);
      const absencePenalty = sessions.length === 0 ? 100 : 0;
      const earlyDeparturePenalty = Math.min((earlyDepartureMinutes / scheduledMinutes) * 30, 20);

      attendanceScore = Math.max(0, 100 - latenessPenalty - absencePenalty - earlyDeparturePenalty);
    }

    // Create or update report
    const reportData = {
      userId: data.userId,
      organizationId: currentUser.organizationId,
      reportDate,
      scheduledMinutes,
      actualMinutes: actualMinutes - breakMinutes, // Subtract breaks from actual work time
      breakMinutes,
      overtimeMinutes,
      lateArrivalMinutes,
      earlyDepartureMinutes,
      attendanceScore,
      productivity: actualMinutes > 0 ? (actualMinutes / scheduledMinutes) * 100 : 0
    };

    const report = existingReport
      ? await db.attendanceReport.update({
          where: { id: existingReport.id },
          data: reportData
        })
      : await db.attendanceReport.create({
          data: reportData
        });

    return { success: true, report, generated: true };

  } catch (error) {
    console.error("Error generating attendance report:", error);
    return { error: "Failed to generate attendance report" };
  }
}

// Get Attendance Analytics for Organization
export async function getAttendanceAnalytics(organizationId: string, dateRange: DateRange) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return { error: "Authentication required" };
    }

    // Get all attendance reports in date range
    const reports = await db.attendanceReport.findMany({
      where: {
        organizationId,
        reportDate: {
          gte: dateRange.from,
          lte: dateRange.to
        }
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
            name: true,
            code: true
          }
        }
      }
    });

    // Calculate organization-wide metrics
    const totalEmployees = await db.user.count({
      where: {
        organizationId,
        isActive: true
      }
    });

    const analytics = {
      summary: {
        totalReports: reports.length,
        totalEmployees,
        averageAttendanceScore: reports.length > 0
          ? reports.reduce((sum, r) => sum + Number(r.attendanceScore), 0) / reports.length
          : 0,
        totalScheduledHours: reports.reduce((sum, r) => sum + r.scheduledMinutes, 0) / 60,
        totalActualHours: reports.reduce((sum, r) => sum + r.actualMinutes, 0) / 60,
        totalOvertimeHours: reports.reduce((sum, r) => sum + r.overtimeMinutes, 0) / 60,
        attendanceRate: reports.length > 0
          ? (reports.filter(r => r.actualMinutes > 0).length / reports.length) * 100
          : 0
      },

      // Top performers
      topPerformers: reports
        .reduce((acc, report) => {
          const existing = acc.find(p => p.userId === report.userId);
          if (existing) {
            existing.totalScore += Number(report.attendanceScore);
            existing.reportCount += 1;
          } else {
            acc.push({
              userId: report.userId,
              user: report.user,
              totalScore: Number(report.attendanceScore),
              reportCount: 1
            });
          }
          return acc;
        }, [] as any[])
        .map(p => ({
          ...p,
          averageScore: p.totalScore / p.reportCount
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 10),

      // Attendance by location
      byLocation: reports.reduce((acc, report) => {
        const locationName = report.location?.name || 'No Location';
        if (!acc[locationName]) {
          acc[locationName] = {
            totalReports: 0,
            totalScheduledMinutes: 0,
            totalActualMinutes: 0,
            averageScore: 0
          };
        }
        acc[locationName].totalReports += 1;
        acc[locationName].totalScheduledMinutes += report.scheduledMinutes;
        acc[locationName].totalActualMinutes += report.actualMinutes;
        acc[locationName].averageScore += Number(report.attendanceScore);
        return acc;
      }, {} as Record<string, any>),

      // Daily trends
      dailyTrends: reports.reduce((acc, report) => {
        const dateStr = report.reportDate.toISOString().split('T')[0];
        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            totalReports: 0,
            averageScore: 0,
            totalLateMinutes: 0,
            totalOvertimeMinutes: 0
          };
        }
        acc[dateStr].totalReports += 1;
        acc[dateStr].averageScore += Number(report.attendanceScore);
        acc[dateStr].totalLateMinutes += report.lateArrivalMinutes;
        acc[dateStr].totalOvertimeMinutes += report.overtimeMinutes;
        return acc;
      }, {} as Record<string, any>),

      // Problem areas
      problemAreas: {
        chronicallyLate: reports
          .filter(r => r.lateArrivalMinutes > 15)
          .reduce((acc, report) => {
            const existing = acc.find(p => p.userId === report.userId);
            if (existing) {
              existing.lateCount += 1;
              existing.totalLateMinutes += report.lateArrivalMinutes;
            } else {
              acc.push({
                userId: report.userId,
                user: report.user,
                lateCount: 1,
                totalLateMinutes: report.lateArrivalMinutes
              });
            }
            return acc;
          }, [] as any[])
          .filter(p => p.lateCount >= 3)
          .sort((a, b) => b.lateCount - a.lateCount),

        frequentAbsences: reports
          .filter(r => r.actualMinutes === 0)
          .reduce((acc, report) => {
            const existing = acc.find(p => p.userId === report.userId);
            if (existing) {
              existing.absenceCount += 1;
            } else {
              acc.push({
                userId: report.userId,
                user: report.user,
                absenceCount: 1
              });
            }
            return acc;
          }, [] as any[])
          .filter(p => p.absenceCount >= 2)
          .sort((a, b) => b.absenceCount - a.absenceCount)
      }
    };

    // Calculate averages for location data
    Object.keys(analytics.byLocation).forEach(location => {
      const data = analytics.byLocation[location];
      data.averageScore = data.averageScore / data.totalReports;
    });

    // Calculate averages for daily trends
    Object.keys(analytics.dailyTrends).forEach(date => {
      const data = analytics.dailyTrends[date];
      data.averageScore = data.averageScore / data.totalReports;
    });

    return { success: true, analytics };

  } catch (error) {
    console.error("Error fetching attendance analytics:", error);
    return { error: "Failed to fetch attendance analytics" };
  }
}