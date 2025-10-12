"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import {
  Calculator,
  DollarSign,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react"

interface CashReconciliationReportProps {
  locationId: string
  organizationId: string
}

interface ReconciliationData {
  sessionId: string
  sessionNumber: string
  startTime: Date
  endTime: Date | null
  openingBalance: number
  expectedClosingBalance: number
  actualClosingBalance: number
  variance: number
  cashSales: number
  cashReturns: number
  cashAdded: number
  cashRemoved: number
  status: "open" | "reconciled" | "variance"
}

// Mock reconciliation data
const mockReconciliations: ReconciliationData[] = [
  {
    sessionId: "session-1",
    sessionNumber: "POS-20241201-001",
    startTime: new Date("2024-12-01T09:00:00"),
    endTime: new Date("2024-12-01T17:30:00"),
    openingBalance: 200.0,
    expectedClosingBalance: 847.25,
    actualClosingBalance: 845.0,
    variance: -2.25,
    cashSales: 567.25,
    cashReturns: -12.5,
    cashAdded: 100.0,
    cashRemoved: -7.5,
    status: "variance",
  },
  {
    sessionId: "session-2",
    sessionNumber: "POS-20241130-001",
    startTime: new Date("2024-11-30T09:00:00"),
    endTime: new Date("2024-11-30T17:00:00"),
    openingBalance: 200.0,
    expectedClosingBalance: 723.75,
    actualClosingBalance: 723.75,
    variance: 0.0,
    cashSales: 523.75,
    cashReturns: 0.0,
    cashAdded: 0.0,
    cashRemoved: 0.0,
    status: "reconciled",
  },
]

export function CashReconciliationReportComponent({ locationId, organizationId }: CashReconciliationReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("today")
  const [reconciliations] = useState<ReconciliationData[]>(mockReconciliations)
  const [selectedSession, setSelectedSession] = useState<ReconciliationData | null>(null)
  const notifications = useNotifications()

  const currentSession = reconciliations.find((r) => r.status === "open") || reconciliations[0]
  const totalVariance = reconciliations.reduce((sum, r) => sum + r.variance, 0)
  const reconciliationRate =
    (reconciliations.filter((r) => r.status === "reconciled").length / reconciliations.length) * 100

  const getStatusColor = (status: ReconciliationData["status"]) => {
    switch (status) {
      case "reconciled":
        return "bg-green-100 text-green-800 border-green-200"
      case "variance":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: ReconciliationData["status"]) => {
    switch (status) {
      case "reconciled":
        return <CheckCircle className="w-4 h-4" />
      case "variance":
        return <AlertTriangle className="w-4 h-4" />
      case "open":
        return <Clock className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const exportReport = () => {
    notifications.success("Report Exported", "Cash reconciliation report has been exported to CSV")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cash Reconciliation</h2>
          <p className="text-gray-600">Track and reconcile cash drawer balances</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Current Balance</p>
                <p className="text-2xl font-bold text-blue-900">${currentSession.actualClosingBalance.toFixed(2)}</p>
                <p className="text-sm text-blue-600 mt-1">
                  Expected: ${currentSession.expectedClosingBalance.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${Math.abs(totalVariance) > 5 ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200" : "bg-gradient-to-br from-green-50 to-green-100 border-green-200"}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${Math.abs(totalVariance) > 5 ? "text-red-600" : "text-green-600"}`}>
                  Total Variance
                </p>
                <p className={`text-2xl font-bold ${Math.abs(totalVariance) > 5 ? "text-red-900" : "text-green-900"}`}>
                  {totalVariance >= 0 ? "+" : ""}${totalVariance.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {Math.abs(totalVariance) <= 1 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  )}
                  <span className={`text-sm ${Math.abs(totalVariance) <= 1 ? "text-green-600" : "text-orange-600"}`}>
                    {Math.abs(totalVariance) <= 1 ? "Within tolerance" : "Needs attention"}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${Math.abs(totalVariance) > 5 ? "bg-red-200" : "bg-green-200"}`}>
                {totalVariance >= 0 ? (
                  <TrendingUp
                    className={`w-6 h-6 ${Math.abs(totalVariance) > 5 ? "text-red-700" : "text-green-700"}`}
                  />
                ) : (
                  <TrendingDown
                    className={`w-6 h-6 ${Math.abs(totalVariance) > 5 ? "text-red-700" : "text-green-700"}`}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Reconciliation Rate</p>
                <p className="text-2xl font-bold text-purple-900">{reconciliationRate.toFixed(1)}%</p>
                <p className="text-sm text-purple-600 mt-1">
                  {reconciliations.filter((r) => r.status === "reconciled").length} of {reconciliations.length} sessions
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Calculator className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Sessions Today</p>
                <p className="text-2xl font-bold text-orange-900">{reconciliations.length}</p>
                <p className="text-sm text-orange-600 mt-1">
                  {reconciliations.filter((r) => r.status === "open").length} active
                </p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <FileText className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Details */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Session</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
          <TabsTrigger value="summary">Summary Report</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Session Reconciliation</span>
                <Badge className={getStatusColor(currentSession.status)}>
                  {getStatusIcon(currentSession.status)}
                  <span className="ml-2">{currentSession.status.toUpperCase()}</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Session Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session Number:</span>
                      <span className="font-medium">{currentSession.sessionNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium">{currentSession.startTime.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Time:</span>
                      <span className="font-medium">
                        {currentSession.endTime ? currentSession.endTime.toLocaleString() : "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Cash Flow</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Opening Balance:</span>
                      <span className="font-medium">${currentSession.openingBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash Sales:</span>
                      <span className="font-medium text-green-600">+${currentSession.cashSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash Returns:</span>
                      <span className="font-medium text-red-600">${currentSession.cashReturns.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash Added:</span>
                      <span className="font-medium text-green-600">+${currentSession.cashAdded.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash Removed:</span>
                      <span className="font-medium text-red-600">${currentSession.cashRemoved.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Expected Balance:</span>
                      <span>${currentSession.expectedClosingBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Actual Balance:</span>
                      <span>${currentSession.actualClosingBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Variance:</span>
                      <span className={currentSession.variance >= 0 ? "text-green-600" : "text-red-600"}>
                        {currentSession.variance >= 0 ? "+" : ""}${currentSession.variance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {Math.abs(currentSession.variance) > 1 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-800">Variance Detected</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    The cash drawer has a variance of ${Math.abs(currentSession.variance).toFixed(2)}. Please
                    investigate and document the reason for this discrepancy.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reconciliations.map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(session.status)}>
                        {getStatusIcon(session.status)}
                        <span className="ml-2">{session.status.toUpperCase()}</span>
                      </Badge>
                      <div>
                        <p className="font-medium">{session.sessionNumber}</p>
                        <p className="text-sm text-gray-600">
                          {session.startTime.toLocaleDateString()} •{session.startTime.toLocaleTimeString()} -
                          {session.endTime ? session.endTime.toLocaleTimeString() : "In Progress"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${session.actualClosingBalance.toFixed(2)}</p>
                      <p className={`text-sm ${session.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        Variance: {session.variance >= 0 ? "+" : ""}${session.variance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Summary Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Reconciliation Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Sessions:</span>
                      <span className="font-medium">{reconciliations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Perfect Reconciliations:</span>
                      <span className="font-medium text-green-600">
                        {reconciliations.filter((r) => r.variance === 0).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sessions with Variance:</span>
                      <span className="font-medium text-orange-600">
                        {reconciliations.filter((r) => r.variance !== 0).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Variance:</span>
                      <span className="font-medium">${(totalVariance / reconciliations.length).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Cash Flow Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Cash Sales:</span>
                      <span className="font-medium text-green-600">
                        ${reconciliations.reduce((sum, r) => sum + r.cashSales, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cash Returns:</span>
                      <span className="font-medium text-red-600">
                        ${reconciliations.reduce((sum, r) => sum + r.cashReturns, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cash Added:</span>
                      <span className="font-medium text-green-600">
                        ${reconciliations.reduce((sum, r) => sum + r.cashAdded, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cash Removed:</span>
                      <span className="font-medium text-red-600">
                        ${reconciliations.reduce((sum, r) => sum + r.cashRemoved, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
