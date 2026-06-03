"use client"

import type { CashReconciliationReport } from "@/actions/newPOSSession/reports/analytics-actions"
import { getCashReconciliationReports } from "@/actions/newPOSSession/reports/analytics-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, subDays } from "date-fns"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Filter,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { useEffect, useState } from "react"

interface CashReconciliationReportProps {
  locationId: string
  organizationId: string
}

export function CashReconciliationReportComponent({ locationId, organizationId }: CashReconciliationReportProps) {
  const [reports, setReports] = useState<CashReconciliationReport[]>([])
  const [filteredReports, setFilteredReports] = useState<CashReconciliationReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7))
  const [endDate, setEndDate] = useState<Date>(new Date())

  const loadReports = async () => {
    if (!organizationId || !locationId) return

    try {
      setIsLoading(true)
      const data = await getCashReconciliationReports(
        organizationId,
        locationId,
        startDate,
        endDate,
      )
      setReports(data)
      setFilteredReports(data)
    } catch (error) {
      console.error("Error loading cash reconciliation reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [organizationId, locationId, startDate, endDate])

  useEffect(() => {
    let filtered = reports

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.sessionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.terminalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.userName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }

    setFilteredReports(filtered)
  }, [reports, searchTerm, statusFilter])

  const getVarianceColor = (variance?: number) => {
    if (variance === undefined) return "text-gray-600"
    if (Math.abs(variance) < 0.01) return "text-green-600"
    if (Math.abs(variance) < 5) return "text-yellow-600"
    return "text-red-600"
  }

  const getVarianceIcon = (variance?: number) => {
    if (variance === undefined) return <Clock className="h-4 w-4" />
    if (Math.abs(variance) < 0.01) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />
  }

  const totalVariance = filteredReports.reduce((sum, report) => sum + Math.abs(report.variance || 0), 0)
  const sessionsWithVariance = filteredReports.filter((report) => Math.abs(report.variance || 0) > 0.01).length
  const totalSales = filteredReports.reduce((sum, report) => sum + report.totalSales, 0)
  const averageVariance = filteredReports.length > 0 ? totalVariance / filteredReports.length : 0

  const exportReport = () => {
    const csvContent = [
      [
        "Session",
        "Terminal",
        "User",
        "Date",
        "Opening Balance",
        "Expected Balance",
        "Actual Balance",
        "Variance",
        "Total Sales",
        "Status",
      ].join(","),
      ...filteredReports.map((report) =>
        [
          report.sessionNumber,
          report.terminalName,
          report.userName,
          format(new Date(report.openedAt), "yyyy-MM-dd HH:mm"),
          report.openingBalance.toFixed(2),
          report.expectedBalance.toFixed(2),
          report.actualBalance?.toFixed(2) || "",
          report.variance?.toFixed(2) || "",
          report.totalSales.toFixed(2),
          report.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cash-reconciliation-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Cash Reconciliation Report</h1>
          <p className="text-muted-foreground">Track cash drawer variances and session performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{filteredReports.length}</p>
                <p className="text-xs text-muted-foreground mt-1">${totalSales.toFixed(2)} total sales</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden ${sessionsWithVariance > 0 ? "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50" : "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${sessionsWithVariance > 0 ? "bg-gradient-to-r from-orange-100 to-red-100" : "bg-gradient-to-r from-green-100 to-emerald-100"}`}
              >
                <AlertTriangle
                  className={`h-6 w-6 ${sessionsWithVariance > 0 ? "text-orange-600" : "text-green-600"}`}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Sessions with Variance</p>
                <p className="text-2xl font-bold">{sessionsWithVariance}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((sessionsWithVariance / filteredReports.length) * 100).toFixed(1)}% of total
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-red-100 to-pink-100">
                {totalVariance > 0 ? (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Variance</p>
                <p className="text-2xl font-bold">${totalVariance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">${averageVariance.toFixed(2)} average</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-violet-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                <p className="text-2xl font-bold">
                  {filteredReports.length > 0
                    ? (((filteredReports.length - sessionsWithVariance) / filteredReports.length) * 100).toFixed(1)
                    : 0}
                  %
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredReports.length - sessionsWithVariance} perfect sessions
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Session, terminal, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <DatePicker
                date={startDate}
                onDateChange={(date) => setStartDate(date!)}
                placeholder="Select start date"
                maxDate={endDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <DatePicker
                date={endDate}
                onDateChange={(date) => setEndDate(date!)}
                placeholder="Select end date"
                minDate={startDate}
                maxDate={new Date()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="all">All Sessions</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Session Details
          </CardTitle>
          <CardDescription>Detailed cash reconciliation for each session</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Terminal</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Opening</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.sessionId} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{report.sessionNumber}</TableCell>
                    <TableCell>{report.terminalName}</TableCell>
                    <TableCell>{report.userName}</TableCell>
                    <TableCell>{format(new Date(report.openedAt), "MMM dd, HH:mm")}</TableCell>
                    <TableCell>${report.openingBalance.toFixed(2)}</TableCell>
                    <TableCell>${report.expectedBalance.toFixed(2)}</TableCell>
                    <TableCell>
                      {report.actualBalance !== undefined ? `$${report.actualBalance.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getVarianceIcon(report.variance)}
                        <span className={getVarianceColor(report.variance)}>
                          {report.variance !== undefined
                            ? `${report.variance >= 0 ? "+" : ""}$${report.variance.toFixed(2)}`
                            : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${report.totalSales.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.status === "active"
                            ? "default"
                            : report.status === "closed"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
