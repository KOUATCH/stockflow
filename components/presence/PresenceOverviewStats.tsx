"use client";

import React from 'react';
import { Users, UserCheck, Coffee, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PresenceOverview } from '@/types/presence';

interface PresenceOverviewStatsProps {
  overview: PresenceOverview;
  className?: string;
}

export function PresenceOverviewStats({ overview, className }: PresenceOverviewStatsProps) {
  const stats = [
    {
      icon: Users,
      label: 'Total Employees',
      value: overview.stats.totalEmployees,
      change: null,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: UserCheck,
      label: 'Currently Working',
      value: overview.stats.currentlyWorking,
      change: `${Math.round((overview.stats.currentlyWorking / overview.stats.totalEmployees) * 100)}%`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      icon: Coffee,
      label: 'On Break',
      value: overview.stats.onBreak,
      change: overview.stats.onBreak > 0 ? `${overview.stats.onBreak} active` : 'None',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      icon: Clock,
      label: 'Late Today',
      value: overview.stats.lateToday,
      change: overview.stats.lateToday > 0 ? 'Needs attention' : 'All on time',
      color: overview.stats.lateToday > 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: overview.stats.lateToday > 0 ? 'bg-red-50' : 'bg-gray-50',
      borderColor: overview.stats.lateToday > 0 ? 'border-red-200' : 'border-gray-200'
    },
    {
      icon: TrendingUp,
      label: 'Avg Attendance',
      value: `${overview.stats.averageAttendance}%`,
      change: 'This month',
      color: overview.stats.averageAttendance >= 90 ? 'text-green-600' :
             overview.stats.averageAttendance >= 80 ? 'text-yellow-600' : 'text-red-600',
      bgColor: overview.stats.averageAttendance >= 90 ? 'bg-green-50' :
               overview.stats.averageAttendance >= 80 ? 'bg-yellow-50' : 'bg-red-50',
      borderColor: overview.stats.averageAttendance >= 90 ? 'border-green-200' :
                   overview.stats.averageAttendance >= 80 ? 'border-yellow-200' : 'border-red-200'
    },
    {
      icon: AlertTriangle,
      label: 'Active Alerts',
      value: overview.stats.activeAlerts,
      change: overview.stats.activeAlerts > 0 ? 'Requires action' : 'All clear',
      color: overview.stats.activeAlerts > 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: overview.stats.activeAlerts > 0 ? 'bg-red-50' : 'bg-gray-50',
      borderColor: overview.stats.activeAlerts > 0 ? 'border-red-200' : 'border-gray-200'
    }
  ];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index} className={cn("border-2", stat.borderColor, stat.bgColor)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                  <p className="text-sm font-medium text-gray-600 leading-none">
                    {stat.label}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className={cn("text-xs", stat.color)}>
                      {stat.change}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}