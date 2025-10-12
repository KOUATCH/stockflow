// Date utility functions for presence monitoring

/**
 * Format time to HH:MM AM/PM format
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format duration in minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format date to readable format
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date and time to readable format
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get time difference in minutes
 */
export function getTimeDifferenceInMinutes(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

/**
 * Check if a time is within working hours
 */
export function isWithinWorkingHours(
  time: Date,
  startTime: string, // "09:00"
  endTime: string    // "17:00"
): boolean {
  const timeStr = time.toTimeString().slice(0, 5);
  return timeStr >= startTime && timeStr <= endTime;
}

/**
 * Calculate overtime minutes
 */
export function calculateOvertime(
  clockInTime: Date,
  clockOutTime: Date,
  regularHours: number = 8 // Default 8 hours
): number {
  const totalMinutes = getTimeDifferenceInMinutes(clockInTime, clockOutTime);
  const regularMinutes = regularHours * 60;
  return Math.max(0, totalMinutes - regularMinutes);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = getTimeDifferenceInMinutes(date, now);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  } else if (diffInMinutes < 1440) { // Less than 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get start of day
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Get day of week (0 = Sunday, 1 = Monday, etc.)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Format schedule time (e.g., "09:00 AM - 05:00 PM")
 */
export function formatScheduleTime(startTime: string, endTime: string): string {
  const formatTimeString = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`;
}

/**
 * Calculate total work hours from clock in/out times excluding breaks
 */
export function calculateWorkHours(
  clockInTime: Date,
  clockOutTime: Date,
  breakMinutes: number = 0
): number {
  const totalMinutes = getTimeDifferenceInMinutes(clockInTime, clockOutTime) - breakMinutes;
  return Math.max(0, totalMinutes / 60);
}

/**
 * Check if employee is late based on schedule
 */
export function isLateArrival(
  clockInTime: Date,
  scheduledStartTime: string, // "09:00"
  graceMinutes: number = 5
): boolean {
  const scheduledTime = new Date(clockInTime);
  const [hours, minutes] = scheduledStartTime.split(':');
  scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  const lateMinutes = getTimeDifferenceInMinutes(scheduledTime, clockInTime);
  return lateMinutes > graceMinutes;
}