"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAttendanceAnalytics } from '@/hooks/usePresenceQueries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AttendanceChartProps {
  organizationId?: string;
  userId?: string;
  className?: string;
  dateRange?: number; // Days to look back
}

export function AttendanceChart({
  organizationId,
  userId,
  className,
  dateRange = 30
}: AttendanceChartProps) {
  const [selectedRange, setSelectedRange] = React.useState(dateRange.toString());

  const { data: analytics, isLoading } = useAttendanceAnalytics({
    organizationId,
    userId,
    startDate: startOfDay(subDays(new Date(), parseInt(selectedRange))),
    endDate: endOfDay(new Date())
  });

  const chartData = useMemo(() => {
    if (!analytics?.dailyStats) return [];

    return analytics.dailyStats.map(day => ({
      date: format(new Date(day.date), 'MMM dd'),
      fullDate: day.date,
      attendance: Math.round(day.attendanceRate),
      present: day.presentEmployees,
      total: day.totalEmployees,
      avgHours: day.averageHoursWorked,
      lateArrivals: day.lateArrivals
    }));
  }, [analytics]);

  const maxAttendance = useMemo(() =>
    Math.max(...chartData.map(d => d.attendance), 0)
  , [chartData]);

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No attendance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPeriod = analytics.summary;
  const previousPeriod = analytics.comparison;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Attendance Analytics</CardTitle>
            <CardDescription>
              {userId ? 'Your attendance' : 'Team attendance'} over the selected period
            </CardDescription>
          </div>
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Avg Attendance</p>
                <p className="text-2xl font-bold text-blue-900">
                  {Math.round(currentPeriod.averageAttendanceRate)}%
                </p>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(currentPeriod.averageAttendanceRate, previousPeriod?.averageAttendanceRate || 0)}
                <span className={cn("text-sm font-medium",
                  getTrendColor(currentPeriod.averageAttendanceRate, previousPeriod?.averageAttendanceRate || 0)
                )}>
                  {previousPeriod && (
                    `${Math.abs(Math.round(currentPeriod.averageAttendanceRate - previousPeriod.averageAttendanceRate))}%`
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Avg Work Hours</p>
                <p className="text-2xl font-bold text-green-900">
                  {(currentPeriod.averageHoursWorked).toFixed(1)}h
                </p>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(currentPeriod.averageHoursWorked, previousPeriod?.averageHoursWorked || 0)}
                <span className={cn("text-sm font-medium",
                  getTrendColor(currentPeriod.averageHoursWorked, previousPeriod?.averageHoursWorked || 0)
                )}>
                  {previousPeriod && (
                    `${Math.abs((currentPeriod.averageHoursWorked - previousPeriod.averageHoursWorked)).toFixed(1)}h`
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Late Arrivals</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {currentPeriod.totalLateArrivals}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(
                  -(currentPeriod.totalLateArrivals), // Negative because fewer late arrivals is better
                  -(previousPeriod?.totalLateArrivals || 0)
                )}
                <span className={cn("text-sm font-medium",
                  getTrendColor(
                    -(currentPeriod.totalLateArrivals),
                    -(previousPeriod?.totalLateArrivals || 0)
                  )
                )}>
                  {previousPeriod && (
                    `${Math.abs(currentPeriod.totalLateArrivals - previousPeriod.totalLateArrivals)}`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Daily Attendance Rate</h4>
          <div className="space-y-2">
            {chartData.map((day, index) => (
              <div key={day.fullDate} className="flex items-center gap-3">
                <div className="w-16 text-xs text-gray-600 font-medium">
                  {day.date}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      day.attendance >= 90 ? "bg-green-500" :
                      day.attendance >= 75 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${Math.max((day.attendance / 100) * 100, 2)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
                    {day.attendance}%
                  </div>
                </div>
                <div className="w-20 text-xs text-gray-600">
                  {day.present}/{day.total}
                </div>
                <div className="w-16 text-xs text-gray-600">
                  {day.avgHours.toFixed(1)}h
                </div>
                {day.lateArrivals > 0 && (
                  <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-700">
                    {day.lateArrivals} late
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-gray-600 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>90%+ attendance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>75-89% attendance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>&lt;75% attendance</span>
          </div>
        </div>

        {/* Additional Insights */}
        {!userId && currentPeriod.totalEmployees > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h5 className="font-medium text-gray-900 mb-2">Period Summary</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Employees</p>
                <p className="font-medium">{currentPeriod.totalEmployees}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Hours</p>
                <p className="font-medium">{Math.round(currentPeriod.totalHoursWorked)}h</p>
              </div>
              <div>
                <p className="text-gray-600">Overtime Hours</p>
                <p className="font-medium">{Math.round(currentPeriod.totalOvertimeHours)}h</p>
              </div>
              <div>
                <p className="text-gray-600">Perfect Attendance</p>
                <p className="font-medium">{currentPeriod.perfectAttendanceDays} days</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}