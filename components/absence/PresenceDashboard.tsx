"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrentPresenceStatus, useOrganizationPresenceOverview } from "@/hooks/usePresenceQueries"
import { PRESENCE_STATUS_COLORS } from "@/types/presence"
import { AlertTriangle, Clock, TrendingUp, Users } from "lucide-react"
import { useState } from "react"
// import { ActiveEmployeesList } from "./ActiveEmployeesList"
// import { AttendanceChart } from "./AttendanceChart"
// import { ClockInOutPanel } from "./ClockInOutPanel"
// import { PresenceAlertsList } from "./PresenceAlertsList"
import { ActiveEmployeesList } from "./ActiveEmployeesList"
import { AttendanceChart } from "./AttendanceChart"
import { ClockInOutPanel } from "./ClockInOutPanel"
import { PresenceAlertsList } from "./PresenceAlertsList"
import { PresenceOverviewStats } from "./PresenceOverviewStats"
import { PresenceStatusCard } from "./PresenceStatusCard"
import { QuickActions } from "./QuickActions"

interface PresenceDashboardProps {
  organizationId: string
  currentUserId: string
  userRole?: string
}

export function PresenceDashboard({ organizationId, currentUserId, userRole = "employee" }: PresenceDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview")

  const { data: overview, isLoading: overviewLoading } = useOrganizationPresenceOverview(organizationId)
  const { data: currentStatus } = useCurrentPresenceStatus(currentUserId)

  const isManager = userRole === "manager" || userRole === "admin"

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
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Presence</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring and attendance tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
          {currentStatus?.status && (
            <Badge className={PRESENCE_STATUS_COLORS[currentStatus.status as keyof typeof PRESENCE_STATUS_COLORS]}>
              {currentStatus.status ? currentStatus.status.replace("_", " ") : "Unknown"}
            </Badge>
          )}
        </div>
      </div>

      <PresenceStatusCard
        status={currentStatus || { status: "OFFLINE", session: null }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
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
                    <CardDescription>Daily attendance patterns over the last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AttendanceChart organizationId={organizationId} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Active Sessions
                    </CardTitle>
                    <CardDescription>Currently active employee sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActiveEmployeesList sessions={overview.sessions} />
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
                  <QuickActions currentStatus={currentStatus} organizationId={organizationId} />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Clock In/Out Tab */}
        <TabsContent value="clock" className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <ClockInOutPanel currentStatus={currentStatus} organizationId={organizationId} />
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
                  <CardDescription>Real-time status of all team members</CardDescription>
                </CardHeader>
                <CardContent>
                  {overview && <ActiveEmployeesList sessions={overview.sessions} showDetails={true} />}
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
  )
}
