import React from 'react';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AttendanceChart } from '@/components/presence/AttendanceChart';
import { AuthenticatedUser, getAuthenticatedUser } from '@/config/useAuth';

export default async function PresenceReportsPage() {
  const user: AuthenticatedUser = await getAuthenticatedUser();

  const userOrgId: string = user?.organizationId;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
            <p className="text-gray-600">View and analyze your attendance data</p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22 days</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2h</div>
            <p className="text-xs text-muted-foreground">
              +0.3h from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96%</div>
            <p className="text-xs text-muted-foreground">
              +2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Chart */}
      <AttendanceChart userId={user.id} />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent clock in/out activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: 'Today', clockIn: '09:15 AM', clockOut: '05:45 PM', hours: '8.5h', status: 'Complete' },
              { date: 'Yesterday', clockIn: '09:00 AM', clockOut: '05:30 PM', hours: '8.5h', status: 'Complete' },
              { date: '2 days ago', clockIn: '08:45 AM', clockOut: '05:15 PM', hours: '8.5h', status: 'Complete' },
              { date: '3 days ago', clockIn: '09:30 AM', clockOut: '06:00 PM', hours: '8.5h', status: 'Late arrival' },
            ].map((day, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{day.date}</p>
                    <p className="text-sm text-gray-600">{day.clockIn} - {day.clockOut}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{day.hours}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    day.status === 'Complete'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {day.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}