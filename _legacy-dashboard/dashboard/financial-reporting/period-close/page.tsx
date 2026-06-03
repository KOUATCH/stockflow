"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  TrendingUp,
  FileText,
  Settings
} from "lucide-react"
import { useState } from "react"

export default function PeriodClosePage() {
  const [currentPeriod, setCurrentPeriod] = useState("October 2024")
  const [closeProgress, setCloseProgress] = useState(65)

  const closeTasks = [
    {
      id: "1",
      task: "Reconcile Bank Accounts",
      status: "completed",
      assignee: "Sarah Johnson",
      dueDate: "2024-10-05",
      priority: "High"
    },
    {
      id: "2",
      task: "Review Accounts Receivable",
      status: "in-progress",
      assignee: "Mike Davis",
      dueDate: "2024-10-08",
      priority: "High"
    },
    {
      id: "3",
      task: "Inventory Valuation",
      status: "pending",
      assignee: "Lisa Chen",
      dueDate: "2024-10-10",
      priority: "Medium"
    },
    {
      id: "4",
      task: "Accrual Adjustments",
      status: "pending",
      assignee: "John Smith",
      dueDate: "2024-10-12",
      priority: "Medium"
    },
    {
      id: "5",
      task: "Depreciation Calculations",
      status: "completed",
      assignee: "Sarah Johnson",
      dueDate: "2024-10-07",
      priority: "Low"
    }
  ]

  const periodHistory = [
    {
      period: "September 2024",
      status: "closed",
      closeDate: "2024-10-05",
      variance: "$1,247.50"
    },
    {
      period: "August 2024",
      status: "closed",
      closeDate: "2024-09-03",
      variance: "$892.30"
    },
    {
      period: "July 2024",
      status: "closed",
      closeDate: "2024-08-02",
      variance: "$456.75"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>
      case "pending":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Pending</Badge>
      case "closed":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><Lock className="w-3 h-3 mr-1" />Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-100 text-red-700 border-red-200">High</Badge>
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Medium</Badge>
      case "Low":
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Period Close Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage month-end and year-end closing processes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure Workflow
          </Button>
          <Button>
            <Lock className="w-4 h-4 mr-2" />
            Close Period
          </Button>
        </div>
      </div>

      {/* Current Period Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Current Period: {currentPeriod}
          </CardTitle>
          <CardDescription>
            Monitor and manage the current period closing process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Close Progress</span>
            <span className="text-sm text-muted-foreground">{closeProgress}% Complete</span>
          </div>
          <Progress value={closeProgress} className="w-full" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">3</div>
              <div className="text-sm text-green-600">Tasks Completed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">1</div>
              <div className="text-sm text-blue-600">In Progress</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">2</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Deadline Approaching</AlertTitle>
            <AlertDescription>
              Period close deadline is October 15, 2024. 5 days remaining.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Close Tasks</TabsTrigger>
          <TabsTrigger value="checklist">Period Checklist</TabsTrigger>
          <TabsTrigger value="history">Period History</TabsTrigger>
          <TabsTrigger value="reports">Close Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Period Close Tasks</CardTitle>
              <CardDescription>
                Track and manage all tasks required for period closing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {closeTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{task.task}</h4>
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Assigned to: {task.assignee} • Due: {task.dueDate}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Period Close Checklist</CardTitle>
              <CardDescription>
                Standard checklist for month-end closing procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Period close checklist will be available here</p>
                <p className="text-sm">Standardized checklist for consistent month-end processes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Period History</CardTitle>
              <CardDescription>
                Historical view of previous period closes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {periodHistory.map((period, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{period.period}</h4>
                        {getStatusBadge(period.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Closed: {period.closeDate} • Variance: {period.variance}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Period Close Reports</CardTitle>
              <CardDescription>
                Generate reports for period closing documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Period close reports will be available here</p>
                <p className="text-sm">Generate comprehensive reports for audit trail</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}