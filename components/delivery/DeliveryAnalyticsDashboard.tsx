"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from '@/components/ui/date-picker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Truck,
  MapPin,
  Users,
  Calendar,
  BarChart3,
  Activity,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import {
  DeliveryStatus,
  DeliveryPriority,
  DeliveryAnalytics,
  DELIVERY_STATUS_COLORS,
  DELIVERY_PRIORITY_COLORS,
  getDeliveryStatusLabel,
  getPriorityLabel
} from '@/types/delivery'
import { getDeliveryAnalytics } from '@/actions/delivery/deliverySystemActions'

interface DeliveryAnalyticsDashboardProps {
  organizationId: string
}

export function DeliveryAnalyticsDashboard({ organizationId }: DeliveryAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<DeliveryAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30))
  const [dateTo, setDateTo] = useState<Date>(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d')

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true)
        const result = await getDeliveryAnalytics(organizationId, dateFrom, dateTo)

        if (result.success && result.data) {
          setAnalytics(result.data)
        }
      } catch (error) {
        console.error('Error loading delivery analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [organizationId, dateFrom, dateTo])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    const now = new Date()

    switch (period) {
      case '7d':
        setDateFrom(subDays(now, 7))
        break
      case '30d':
        setDateFrom(subDays(now, 30))
        break
      case '90d':
        setDateFrom(subDays(now, 90))
        break
      case 'ytd':
        setDateFrom(new Date(now.getFullYear(), 0, 1))
        break
      default:
        setDateFrom(subDays(now, 30))
    }
    setDateTo(now)
  }

  // Prepare chart data
  const statusChartData = analytics ? Object.entries(analytics.deliveriesByStatus).map(([status, count]) => ({
    name: getDeliveryStatusLabel(status as DeliveryStatus),
    value: count,
    fill: DELIVERY_STATUS_COLORS[status as DeliveryStatus]?.replace('bg-', '#').replace('-100', '') || '#8884d8'
  })) : []

  const priorityChartData = analytics ? Object.entries(analytics.deliveriesByPriority).map(([priority, count]) => ({
    name: getPriorityLabel(priority as DeliveryPriority),
    value: count,
    fill: DELIVERY_PRIORITY_COLORS[priority as DeliveryPriority]?.replace('bg-', '#').replace('-100', '') || '#8884d8'
  })) : []

  const performanceData = analytics?.driverPerformance || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Delivery Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into delivery performance and metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {selectedPeriod === 'custom' && (
            <>
              <DatePicker
                date={dateFrom}
                onDateChange={(date) => date && setDateFrom(startOfDay(date))}
                placeholder="From date"
              />
              <DatePicker
                date={dateTo}
                onDateChange={(date) => date && setDateTo(endOfDay(date))}
                placeholder="To date"
              />
            </>
          )}

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Deliveries</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalDeliveries}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-4 text-xs text-blue-700 dark:text-blue-300">
                {analytics.deliveriesByStatus[DeliveryStatus.DELIVERED] || 0} completed
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">On-Time Rate</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {analytics.onTimeDeliveryRate.toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="mt-4 flex items-center text-xs">
                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                <span className="text-green-700 dark:text-green-300">+2.5% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg. Delivery Time</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {analytics.averageDeliveryTime.toFixed(1)}h
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="mt-4 flex items-center text-xs">
                <TrendingDown className="w-3 h-3 mr-1 text-orange-600" />
                <span className="text-orange-700 dark:text-orange-300">-15min from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed Rate</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {analytics.failedDeliveryRate.toFixed(1)}%
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="mt-4 flex items-center text-xs">
                <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                <span className="text-red-700 dark:text-red-300">-1.2% from last period</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Status Distribution */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Delivery Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of deliveries by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Priority Distribution
            </CardTitle>
            <CardDescription>
              Delivery volume by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Peak Delivery Times */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Peak Delivery Times
            </CardTitle>
            <CardDescription>
              Delivery volume by hour of day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.peakDeliveryTimes || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(hour) => `${hour}:00`}
                    formatter={(value) => [value, 'Deliveries']}
                  />
                  <Area
                    type="monotone"
                    dataKey="deliveryCount"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Heatmap */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Coverage
            </CardTitle>
            <CardDescription>
              Top delivery areas by volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.deliveryHeatmap?.slice(0, 5).map((area, index) => (
                <div key={area.area} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="font-medium">{area.area}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{area.deliveryCount} deliveries</div>
                    <div className="text-xs text-muted-foreground">
                      {area.averageTime.toFixed(1)}h avg time
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No geographic data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Performance Table */}
      {analytics && analytics.driverPerformance.length > 0 && (
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Driver Performance
            </CardTitle>
            <CardDescription>
              Individual driver statistics and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Driver</TableHead>
                    <TableHead>Total Deliveries</TableHead>
                    <TableHead>On-Time Rate</TableHead>
                    <TableHead>Average Rating</TableHead>
                    <TableHead>Distance Covered</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.map((driver) => (
                    <TableRow key={driver.driverId}>
                      <TableCell className="font-medium">{driver.driverName}</TableCell>
                      <TableCell>{driver.totalDeliveries}</TableCell>
                      <TableCell>
                        <Badge
                          variant={driver.onTimeRate >= 90 ? 'default' : driver.onTimeRate >= 75 ? 'secondary' : 'destructive'}
                        >
                          {driver.onTimeRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{driver.averageRating.toFixed(1)}</span>
                          <div className="text-yellow-500">★</div>
                        </div>
                      </TableCell>
                      <TableCell>{driver.totalDistance.toFixed(1)} km</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {driver.onTimeRate >= 95 && (
                            <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                          )}
                          {driver.onTimeRate >= 85 && driver.onTimeRate < 95 && (
                            <Badge className="bg-blue-100 text-blue-700">Good</Badge>
                          )}
                          {driver.onTimeRate >= 75 && driver.onTimeRate < 85 && (
                            <Badge className="bg-yellow-100 text-yellow-700">Average</Badge>
                          )}
                          {driver.onTimeRate < 75 && (
                            <Badge className="bg-red-100 text-red-700">Needs Improvement</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}