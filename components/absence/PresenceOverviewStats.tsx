"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OrganizationPresenceOverview } from "@/types/presence"
import { AlertTriangle, Clock, Coffee, Users } from "lucide-react"

interface PresenceOverviewStatsProps {
  overview: OrganizationPresenceOverview
}

export function PresenceOverviewStats({ overview }: PresenceOverviewStatsProps) {
  const stats = [
    {
      title: "Total Employees",
      value: overview.totalEmployees,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Now",
      value: overview.present,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "On Break",
      value: overview.onBreak,
      icon: Coffee,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Late/Overtime",
      value: overview.late + overview.overtime,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
