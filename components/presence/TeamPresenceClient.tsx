"use client";

import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PresenceOverviewStats } from './PresenceOverviewStats';
import { ActiveEmployeesList } from './ActiveEmployeesList';
import { AttendanceChart } from './AttendanceChart';
import { useOrganizationPresenceOverview } from '@/hooks/usePresenceQueries';

interface TeamPresenceClientProps {
  organizationId: string;
}

export function TeamPresenceClient({ organizationId }: TeamPresenceClientProps) {
  const { data: overview, isLoading } = useOrganizationPresenceOverview(organizationId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      {overview && <PresenceOverviewStats overview={overview} />}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Team Members
            </CardTitle>
            <CardDescription>
              Currently clocked in employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overview?.sessions ? (
              <ActiveEmployeesList
                sessions={overview.sessions}
                showDetails={true}
              />
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active sessions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Attendance Trends
            </CardTitle>
            <CardDescription>
              Daily attendance patterns over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceChart organizationId={organizationId} />
          </CardContent>
        </Card>
      </div>

      {/* Team Summary */}
      {overview && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>
              Overview of today's team attendance and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {overview.stats.currentlyWorking}
                </div>
                <div className="text-sm text-gray-600">Currently Working</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {overview.stats.onBreak}
                </div>
                <div className="text-sm text-gray-600">On Break</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {overview.stats.lateToday}
                </div>
                <div className="text-sm text-gray-600">Late Arrivals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {overview.stats.averageAttendance}%
                </div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}