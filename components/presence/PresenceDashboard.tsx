"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentPresenceStatus, useOrganizationPresenceOverview } from '@/hooks/usePresenceQueries';
import { PRESENCE_STATUS_COLORS, PresenceStatus } from '@/types/presence';
import { AlertTriangle, Clock, TrendingUp, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getEmployeePresenceStatuses } from '@/actions/presence/presence-actions';
import { useClientAuth } from '@/hooks/useClientAuth';
import { ActiveEmployeesList } from './ActiveEmployeesList';
import { AttendanceChart } from './AttendanceChart';
import { ClockInOutPanel } from './ClockInOutPanel';
import { PresenceAlertsList } from './PresenceAlertsList';
import { PresenceOverviewStats } from './PresenceOverviewStats';
import { PresenceStatusCard } from './PresenceStatusCard';
import { QuickActions } from './QuickActions';

interface PresenceDashboardProps {
  organizationId: string;
  currentUserId: string;
  userRole?: string;
}

export function PresenceDashboard({
  organizationId,
  currentUserId,
  userRole = 'employee'
}: PresenceDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [employeeStatuses, setEmployeeStatuses] = useState<any[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(true);

  const { data: overview, isLoading: overviewLoading } = useOrganizationPresenceOverview(organizationId);
  const { data: currentStatus } = useCurrentPresenceStatus(currentUserId);

  const isManager = userRole === 'manager' || userRole === 'admin';

  useEffect(() => {
    const fetchEmployeeStatuses = async () => {
      if (!organizationId) return;
      try {
        setStatusesLoading(true);
        const result = await getEmployeePresenceStatuses(organizationId);
        if (result.success && result.data) {
          setEmployeeStatuses(result.data);
        }
      } catch (error) {
        console.error('Error fetching employee statuses:', error);
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchEmployeeStatuses();

    // Refresh every 30 seconds
    const interval = setInterval(fetchEmployeeStatuses, 30000);
    return () => clearInterval(interval);
  }, [organizationId]);

  if (overviewLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Presence</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and attendance tracking
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          {currentStatus?.status && (
            <Badge className={PRESENCE_STATUS_COLORS[currentStatus.status as keyof typeof PRESENCE_STATUS_COLORS]}>
              {currentStatus.status.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Status for Current User */}
      <PresenceStatusCard
        status={currentStatus?.status || "OFFLINE"}
        className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200"
      />

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="clock" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Clock In/Out
          </TabsTrigger>
          {isManager && (
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
          )}
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {isManager && overview && (
            <>
              {/* Organization Stats */}
              <PresenceOverviewStats overview={overview} />

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Attendance Trends
                    </CardTitle>
                    <CardDescription>
                      Daily attendance patterns over the last 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AttendanceChart organizationId={organizationId} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Employee Status
                    </CardTitle>
                    <CardDescription>
                      Current employee presence status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {statusesLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : employeeStatuses.length > 0 ? (
                      <div className="space-y-3">
                        {employeeStatuses.slice(0, 5).map((employee) => (
                          <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {employee.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{employee.name}</p>
                                <p className="text-xs text-gray-500">{employee.jobTitle || 'Employee'}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`text-xs ${
                                employee.status === 'CLOCKED_IN' ? 'bg-green-100 text-green-800' :
                                employee.status === 'ON_BREAK' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {employee.status === 'CLOCKED_IN' ? 'Working' :
                                 employee.status === 'ON_BREAK' ? 'On Break' : 'Offline'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {employee.totalHoursToday.toFixed(1)}h
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No employee data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {!isManager && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Attendance Summary</CardTitle>
                  <CardDescription>Your attendance overview for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <AttendanceChart userId={currentUserId} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used presence actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <QuickActions
                    currentStatus={
                      currentStatus && typeof currentStatus.status !== 'undefined'
                        ? currentStatus
                        : { status: "OFFLINE" as PresenceStatus | undefined, session: null }
                    }
                    organizationId={organizationId}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Clock In/Out Tab */}
        <TabsContent value="clock" className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <ClockInOutPanel currentStatus={currentStatus || "OFFLINE"} organizationId={organizationId} />
          </div>
        </TabsContent>

        {/* Team Tab (Manager Only) */}
        {isManager && (
          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Presence Overview
                  </CardTitle>
                  <CardDescription>
                    Real-time status of all team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statusesLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : employeeStatuses.length > 0 ? (
                    <div className="space-y-3">
                      {employeeStatuses.map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {employee.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{employee.name}</p>
                              <p className="text-xs text-gray-500">{employee.jobTitle || 'Employee'}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Hours: {employee.totalHoursToday.toFixed(1)}h</span>
                                {employee.isLate && <span className="text-red-500">Late</span>}
                                {employee.location && <span>@{employee.location}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge className={`text-xs ${
                              employee.status === 'CLOCKED_IN' ? 'bg-green-100 text-green-800' :
                              employee.status === 'ON_BREAK' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {employee.status === 'CLOCKED_IN' ? 'Working' :
                               employee.status === 'ON_BREAK' ? 'On Break' : 'Offline'}
                            </Badge>
                            {employee.clockInTime && (
                              <span className="text-xs text-gray-500">
                                Since {new Date(employee.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No employee data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <PresenceAlertsList
            userId={isManager ? undefined : currentUserId}
            organizationId={organizationId}
            isManager={isManager}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}