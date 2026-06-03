import {
  getPresenceAlerts,
  markAlertAsRead,
  resolveAlert
} from "@/actions/presence/alertActions";
import {
  ActivityType,
  clockInEmployee,
  clockOutEmployee,
  endBreak,
  getCurrentPresenceStatus,
  getOrganizationPresenceOverview,
  logActivity,
  startBreak
} from "@/actions/presence/presenceActions";
import { getPresenceOverview } from "@/actions/presence/presence-actions";
import {
  generateAttendanceReport,
  getAttendanceAnalytics,
  getAttendanceReport
} from "@/actions/presence/reportActions";
import {
  createEmployeeSchedule,
  getEmployeeSchedules
} from "@/actions/presence/scheduleActions";
import { useNotifications } from "@/components/notifications/NotificationProvider";
import {
  BreakType,
  ClockMethod
} from "@/types/presence";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys for caching
export const PresenceKeys = {
  all: ["presence"] as const,

  // Current user presence
  currentStatus: (userId?: string) => [...PresenceKeys.all, "currentStatus", userId] as const,

  // Organization presence overview
  overview: (organizationId: string) => [...PresenceKeys.all, "overview", organizationId] as const,

  // Schedules
  schedules: () => [...PresenceKeys.all, "schedules"] as const,
  userSchedules: (userId: string) => [...PresenceKeys.schedules(), userId] as const,
  orgSchedules: (organizationId: string) => [...PresenceKeys.schedules(), "org", organizationId] as const,

  // Alerts
  alerts: () => [...PresenceKeys.all, "alerts"] as const,
  userAlerts: (userId: string) => [...PresenceKeys.alerts(), userId] as const,
  orgAlerts: (organizationId: string) => [...PresenceKeys.alerts(), "org", organizationId] as const,

  // Reports
  reports: () => [...PresenceKeys.all, "reports"] as const,
  attendanceReport: (userId: string, dateRange: { from: Date; to: Date }) =>
    [...PresenceKeys.reports(), "attendance", userId, dateRange] as const,
  attendanceAnalytics: (organizationId: string, dateRange: { from: Date; to: Date }) =>
    [...PresenceKeys.reports(), "analytics", organizationId, dateRange] as const,

  // Activity logs
  activities: () => [...PresenceKeys.all, "activities"] as const,
  userActivities: (userId: string, sessionId?: string) =>
    [...PresenceKeys.activities(), userId, sessionId] as const,
};

// ===================== PRESENCE STATUS QUERIES =====================

export const useCurrentPresenceStatus = (userId?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: PresenceKeys.currentStatus(userId),
    queryFn: async () => {
      try {
        const result = await getCurrentPresenceStatus(userId);
        if (result.error) {
          throw new Error(result.error);
        }
        return result;
      } catch (error) {
        console.error("Failed to fetch current presence status:", error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    enabled: options?.enabled !== false,
  });
};

export const useOrganizationPresenceOverview = (organizationId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: PresenceKeys.overview(organizationId),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      try {
        const result = await getPresenceOverview(organizationId);
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch presence overview");
        }
        return result.data;
      } catch (error) {
        console.error("Failed to fetch organization presence overview:", error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    enabled: options?.enabled !== false && !!organizationId,
  });
};

// ===================== CLOCK IN/OUT MUTATIONS =====================

export const useClockIn = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    meta: { operation: 'start', entity: 'Presence Session', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (data: {
      locationId: string;
      stationId?: string;
      method?: ClockMethod;
      geolocation?: { latitude: number; longitude: number; accuracy: number };
      deviceInfo?: { userAgent: string; platform: string; language: string };
      notes?: string;
    }) => {
      const result = await clockInEmployee(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      // Invalidate and refetch presence-related queries
      queryClient.invalidateQueries({ queryKey: PresenceKeys.all });
      success(
        "Successfully Clocked In!",
        `You are now clocked in at ${new Date().toLocaleTimeString()}`,
        {
          category: "info",
          priority: "normal",
          action: {
            label: "View Status",
            onClick: () => console.log("View presence status")
          }
        }
      );
    },
    onError: (err) => {
      error(
        "Clock In Failed",
        err.message || "Unable to clock in at this time",
        {
          category: "error",
          priority: "high",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry clock in")
          }
        }
      );
    },
  });
};

export const useClockOut = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    meta: { operation: 'stop', entity: 'Presence Session', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (data?: {
      method?: ClockMethod;
      notes?: string;
    }) => {
      const result = await clockOutEmployee(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PresenceKeys.all });
      success(
        "Successfully Clocked Out!",
        `You are now clocked out at ${new Date().toLocaleTimeString()}`,
        {
          category: "info",
          priority: "normal",
          action: {
            label: "View Summary",
            onClick: () => console.log("View work summary")
          }
        }
      );
    },
    onError: (err) => {
      error(
        "Clock Out Failed",
        err.message || "Unable to clock out at this time",
        {
          category: "error",
          priority: "high",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry clock out")
          }
        }
      );
    },
  });
};

// ===================== BREAK MUTATIONS =====================

export const useStartBreak = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    meta: { operation: 'start', entity: 'Break', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (data?: {
      breakType?: BreakType;
      expectedDuration?: number;
      reason?: string;
      notes?: string;
    }) => {
      const result = await startBreak(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PresenceKeys.all });
      const breakType = variables?.breakType || 'REGULAR';
      const breakTypeLabel = breakType === 'LUNCH' ? 'Lunch Break' :
                            breakType === 'SHORT_BREAK' ? 'Short Break' :
                            breakType === 'PERSONAL' ? 'Personal Break' : 'Break';

      success(
        `${breakTypeLabel} Started`,
        `You are now on ${breakTypeLabel.toLowerCase()}. Enjoy your time!`,
        {
          category: "info",
          priority: "low",
          action: {
            label: "End Break Early",
            onClick: () => console.log("End break early")
          }
        }
      );
    },
    onError: (err) => {
      error(
        "Failed to Start Break",
        err.message || "Unable to start break at this time",
        {
          category: "error",
          priority: "normal",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry start break")
          }
        }
      );
    },
  });
};

export const useEndBreak = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    meta: { operation: 'close', entity: 'Break', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async () => {
      const result = await endBreak();
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PresenceKeys.all });
      success(
        "Break Ended",
        "Welcome back! You're now clocked in and ready to work",
        {
          category: "info",
          priority: "normal",
          action: {
            label: "View Status",
            onClick: () => console.log("View presence status")
          }
        }
      );
    },
    onError: (err) => {
      error(
        "Failed to End Break",
        err.message || "Unable to end break at this time",
        {
          category: "error",
          priority: "normal",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry end break")
          }
        }
      );
    },
  });
};

// ===================== SCHEDULE QUERIES =====================

export const useEmployeeSchedules = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: PresenceKeys.userSchedules(userId),
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      try {
        const result = await getEmployeeSchedules(userId);
        if (result.error) {
          throw new Error(result.error);
        }
        return result.schedules;
      } catch (error) {
        console.error("Failed to fetch employee schedules:", error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!userId,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  const { formSuccess, formError } = useNotifications();

  return useMutation({
    meta: { operation: 'create', entity: 'Employee Schedule', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (data: {
      userId: string;
      locationId?: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      breakDurations?: number[];
      effectiveFrom: Date;
      effectiveUntil?: Date;
      notes?: string;
    }) => {
      const result = await createEmployeeSchedule(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PresenceKeys.userSchedules(variables.userId) });
      queryClient.invalidateQueries({ queryKey: PresenceKeys.schedules() });
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[variables.dayOfWeek];
      formSuccess(
        "Schedule Creation",
        `${dayName} schedule from ${variables.startTime} to ${variables.endTime} has been created successfully`
      );
    },
    onError: (err) => {
      formError(
        "Schedule Creation",
        err.message || "Unable to create schedule",
        "Please check the schedule details and try again"
      );
    },
  });
};

// ===================== ALERT QUERIES =====================

export const usePresenceAlerts = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: PresenceKeys.userAlerts(userId),
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      try {
        const result = await getPresenceAlerts(userId);
        if (result.error) {
          throw new Error(result.error);
        }
        return result.alerts;
      } catch (error) {
        console.error("Failed to fetch presence alerts:", error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!userId,
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();
  const { error } = useNotifications();

  return useMutation({
    meta: { operation: 'update', entity: 'Presence Alert', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (alertId: string) => {
      const result = await markAlertAsRead(alertId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PresenceKeys.alerts() });
      // No success notification for marking as read - it's a silent action
    },
    onError: (err) => {
      error(
        "Failed to Mark Alert as Read",
        err.message || "Unable to update alert status",
        {
          category: "error",
          priority: "low"
        }
      );
    },
  });
};

export const useResolveAlert = () => {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    meta: { operation: 'resolve', entity: 'Presence Alert', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (data: { alertId: string; resolutionNotes?: string }) => {
      const result = await resolveAlert(data.alertId, data.resolutionNotes);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: PresenceKeys.alerts() });
      success(
        "Alert Resolved",
        "The presence alert has been successfully resolved",
        {
          category: "info",
          priority: "normal",
          action: variables.resolutionNotes ? {
            label: "View Notes",
            onClick: () => console.log("View resolution notes:", variables.resolutionNotes)
          } : undefined
        }
      );
    },
    onError: (err) => {
      error(
        "Failed to Resolve Alert",
        err.message || "Unable to resolve the alert at this time",
        {
          category: "error",
          priority: "normal",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry resolve alert")
          }
        }
      );
    },
  });
};

// ===================== ACTIVITY LOGGING =====================

export const useLogActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { operation: 'create', entity: 'Activity Log', notify: false },
    mutationFn: async (data: {
      activityType: ActivityType;
      description?: string;
      metadata?: Record<string, any>;
    }) => {
      const result = await logActivity(data.activityType, data.description, data.metadata);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PresenceKeys.activities() });
    },
    onError: (error) => {
      console.error("Failed to log activity:", error);
      // Don't show notification for activity logging errors to avoid spam
    },
  });
};

// ===================== ATTENDANCE REPORTS =====================

export const useAttendanceReport = (
  userId: string,
  dateRange: { from: Date; to: Date },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: PresenceKeys.attendanceReport(userId, dateRange),
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      try {
        const result = await getAttendanceReport(userId, dateRange);
        if (result.error) {
          throw new Error(result.error);
        }
        return result.report;
      } catch (error) {
        console.error("Failed to fetch attendance report:", error);
        throw error;
      }
    },
    enabled: options?.enabled !== false && !!userId && !!dateRange.from && !!dateRange.to,
  });
};

export const useAttendanceAnalytics = (
  organizationId: string,
  dateRange: { from: Date; to: Date },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: PresenceKeys.attendanceAnalytics(organizationId, dateRange),
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      try {
        const result = await getAttendanceAnalytics(organizationId, dateRange);
        if (result.error) {
          throw new Error(result.error);
        }
        return result.analytics;
      } catch (error) {
        console.error("Failed to fetch attendance analytics:", error);
        throw error;
      }
    },
    // enabled: options?.enabled !== false && !!organizationId && !!dateRange.from && !!dateRange.to,
  });
};

export const useGenerateAttendanceReport = () => {
  const queryClient = useQueryClient();
  const { operationComplete, operationStart, error } = useNotifications();

  return useMutation({
    meta: { operation: 'generate', entity: 'Attendance Report', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (data: {
      userId: string;
      reportDate: Date;
      locationId: string;
      forceRegenerate?: boolean;
    }) => {
      operationStart("Attendance Report Generation");
      const result = await generateAttendanceReport(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: PresenceKeys.attendanceReport(variables.userId, {
          from: variables.reportDate,
          to: variables.reportDate
        })
      });
      operationComplete(
        "Attendance Report Generation",
        `Report for ${variables.reportDate.toDateString()} has been generated successfully`
      );
    },
    onError: (err) => {
      error(
        "Report Generation Failed",
        err.message || "Unable to generate attendance report",
        {
          category: "error",
          priority: "normal",
          action: {
            label: "Try Again",
            onClick: () => console.log("Retry report generation")
          }
        }
      );
    },
  });
};

// ===================== CONVENIENCE HOOKS =====================

// Hook to get real-time presence status with automatic refetching
export const useRealTimePresenceStatus = (userId?: string) => {
  return useCurrentPresenceStatus(userId, { enabled: true });
};

// Hook to check if user is currently working
export const useIsUserWorking = (userId?: string) => {
  const { data: status } = useCurrentPresenceStatus(userId);
  return status?.status && ['CLOCKED_IN', 'ON_BREAK', 'OVERTIME'].includes(status.status);
};

// Hook to get work duration for current session
export const useCurrentWorkDuration = (userId?: string) => {
  const { data: status } = useCurrentPresenceStatus(userId);
  return status?.session?.currentWorkDuration || 0;
};

// Hook to check if user is on break
export const useIsOnBreak = (userId?: string) => {
  const { data: status } = useCurrentPresenceStatus(userId);
  return status?.status === 'ON_BREAK';
};