"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Scatter,
  ScatterChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Download,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Upload,
  Settings,
  Bell,
  Shield,
  Zap,
  Clock,
  Globe,
  Archive,
  FileText,
  CreditCard,
  Package,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
  Layers,
  Database,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
} from "lucide-react"

// Enhanced mock data with more comprehensive metrics
const realtimeMetrics = {
  currentRevenue: 245780,
  todayGrowth: 12.5,
  activeUsers: 1247,
  conversionRate: 8.4,
  averageOrderValue: 1285,
  totalOrders: 2847,
  pendingOrders: 67,
  processingOrders: 123,
  completedOrders: 2657,
  lastUpdate: new Date(),
}

const hourlyData = [
  { hour: "00:00", revenue: 12500, orders: 15, customers: 12, conversion: 6.2 },
  { hour: "01:00", revenue: 8900, orders: 11, customers: 9, conversion: 5.8 },
  { hour: "02:00", revenue: 6700, orders: 8, customers: 7, conversion: 5.1 },
  { hour: "03:00", revenue: 4500, orders: 5, customers: 4, conversion: 4.8 },
  { hour: "04:00", revenue: 5600, orders: 7, customers: 6, conversion: 5.2 },
  { hour: "05:00", revenue: 8900, orders: 12, customers: 10, conversion: 6.1 },
  { hour: "06:00", revenue: 15600, orders: 18, customers: 15, conversion: 7.2 },
  { hour: "07:00", revenue: 23400, orders: 28, customers: 24, conversion: 8.1 },
  { hour: "08:00", revenue: 34500, orders: 42, customers: 36, conversion: 8.9 },
  { hour: "09:00", revenue: 45600, orders: 54, customers: 47, conversion: 9.2 },
  { hour: "10:00", revenue: 52300, orders: 67, customers: 58, conversion: 9.6 },
  { hour: "11:00", revenue: 48900, orders: 61, customers: 53, conversion: 9.4 },
  { hour: "12:00", revenue: 56700, orders: 72, customers: 62, conversion: 9.8 },
  { hour: "13:00", revenue: 51200, orders: 65, customers: 56, conversion: 9.5 },
  { hour: "14:00", revenue: 47800, orders: 58, customers: 51, conversion: 9.1 },
  { hour: "15:00", revenue: 44300, orders: 54, customers: 47, conversion: 8.8 },
  { hour: "16:00", revenue: 38900, orders: 47, customers: 41, conversion: 8.4 },
  { hour: "17:00", revenue: 32100, orders: 39, customers: 34, conversion: 7.9 },
  { hour: "18:00", revenue: 28700, orders: 34, customers: 29, conversion: 7.5 },
  { hour: "19:00", revenue: 24500, orders: 29, customers: 25, conversion: 7.1 },
  { hour: "20:00", revenue: 21300, orders: 25, customers: 22, conversion: 6.8 },
  { hour: "21:00", revenue: 18900, orders: 22, customers: 19, conversion: 6.4 },
  { hour: "22:00", revenue: 16700, orders: 19, customers: 17, conversion: 6.1 },
  { hour: "23:00", revenue: 14200, orders: 16, customers: 14, conversion: 5.8 },
]

const deviceData = [
  { device: "Desktop", users: 45.2, revenue: 1567800, orders: 1245, color: "#14B8A6" },
  { device: "Mobile", users: 38.7, revenue: 1234500, orders: 1892, color: "#0891B2" },
  { device: "Tablet", users: 16.1, revenue: 456700, orders: 567, color: "#0284C7" },
]

const channelData = [
  { channel: "Direct", revenue: 1567800, percentage: 42.3, orders: 1245, cac: 125 },
  { channel: "Organic Search", revenue: 1234500, percentage: 33.2, orders: 1892, cac: 89 },
  { channel: "Paid Search", revenue: 567800, percentage: 15.3, orders: 678, cac: 234 },
  { channel: "Social Media", revenue: 234500, percentage: 6.3, orders: 345, cac: 156 },
  { channel: "Email", revenue: 123400, percentage: 3.3, orders: 234, cac: 67 },
]

const cohortData = [
  { week: "Week 1", retention: 100, revenue: 125000 },
  { week: "Week 2", retention: 87.5, revenue: 109375 },
  { week: "Week 3", retention: 76.2, revenue: 95250 },
  { week: "Week 4", retention: 68.9, revenue: 86125 },
  { week: "Week 5", retention: 63.4, revenue: 79250 },
  { week: "Week 6", retention: 59.1, revenue: 73875 },
  { week: "Week 7", retention: 55.8, revenue: 69750 },
  { week: "Week 8", retention: 53.2, revenue: 66500 },
]

const predictiveData = [
  { month: "Jan", actual: 2456700, predicted: 2450000, confidence: 95 },
  { month: "Feb", actual: 2789300, predicted: 2780000, confidence: 93 },
  { month: "Mar", actual: 2934500, predicted: 2940000, confidence: 94 },
  { month: "Apr", actual: null, predicted: 3125000, confidence: 89 },
  { month: "May", actual: null, predicted: 3287000, confidence: 86 },
  { month: "Jun", actual: null, predicted: 3456000, confidence: 83 },
]

export default function EnhancedEnterpriseSalesDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState("realtime")
  const [timeRange, setTimeRange] = useState("24h")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLive, setIsLive] = useState(true)

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate real-time data updates
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        console.log('Updating real-time metrics...')
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isLive])

  const refreshData = () => {
    console.log('Refreshing dashboard data...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50/60 to-sky-100/80">
      {/* Enhanced Header Section */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-gradient-to-r from-cyan-100/90 via-teal-50/90 to-sky-100/90 border-b border-teal-200/30 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-700 bg-clip-text text-transparent flex items-center">
                  <BarChart3 className="mr-3 h-8 w-8 text-teal-600" />
                  Enterprise Sales Command Center
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-teal-600 text-lg">
                    Real-time sales intelligence and operational dashboard
                  </p>
                  <Badge variant="outline" className="text-xs border-teal-200 bg-teal-50/70 text-teal-700">
                    {isLive ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                    {isLive ? "Live Data" : "Offline"}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-200 bg-cyan-50/70 text-cyan-700">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentTime.toLocaleTimeString()}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-sky-200 bg-sky-50/70 text-sky-700">
                    <Activity className="h-3 w-3 mr-1" />
                    {realtimeMetrics.activeUsers.toLocaleString()} active
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-500" />
                <Input
                  placeholder="Search metrics, KPIs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-teal-50/80 backdrop-blur-sm border-teal-200/50 focus:border-teal-400 focus:ring-teal-300/30"
                />
              </div>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-cyan-50/80 backdrop-blur-sm border-cyan-200/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-8" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className={`${isLive ? 'bg-green-50/80 border-green-200/60 text-green-700' : 'bg-red-50/80 border-red-200/60 text-red-700'} backdrop-blur-sm`}
              >
                {isLive ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
                {isLive ? 'Live' : 'Paused'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="bg-teal-50/80 backdrop-blur-sm border-teal-200/60 hover:bg-teal-100/70 text-teal-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-cyan-50/80 backdrop-blur-sm border-cyan-200/60 hover:bg-cyan-100/70 text-cyan-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-sky-50/80 backdrop-blur-sm border-sky-200/60 hover:bg-sky-100/70 text-sky-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Real-time Status Alert */}
        <Alert className="border-green-200 bg-gradient-to-r from-green-50/70 to-emerald-50/70 backdrop-blur-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Sales System: All Systems Operational</AlertTitle>
          <AlertDescription className="text-green-600">
            Revenue tracking active • {realtimeMetrics.activeUsers.toLocaleString()} users online • Last sync: {currentTime.toLocaleString()}
          </AlertDescription>
        </Alert>

        {/* Real-time KPI Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg relative">
                  <DollarSign className="h-6 w-6 text-white" />
                  {isLive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>}
                </div>
                <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{realtimeMetrics.todayGrowth}%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-teal-600">Today's Revenue</p>
                <p className="text-3xl font-bold text-teal-800">${realtimeMetrics.currentRevenue.toLocaleString()}</p>
                <p className="text-xs text-teal-600 mt-1">Target: $280K (88%)</p>
                <Progress value={88} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50/80 to-sky-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg relative">
                  <ShoppingCart className="h-6 w-6 text-white" />
                  {isLive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>}
                </div>
                <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-600">Total Orders</p>
                <p className="text-3xl font-bold text-cyan-800">{realtimeMetrics.totalOrders.toLocaleString()}</p>
                <p className="text-xs text-cyan-600 mt-1">
                  {realtimeMetrics.processingOrders} processing • {realtimeMetrics.pendingOrders} pending
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  <Eye className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600">Active Users</p>
                <p className="text-3xl font-bold text-emerald-800">{realtimeMetrics.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-emerald-600 mt-1">Peak: 1,567 users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-sky-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-sky-800">{realtimeMetrics.conversionRate}%</p>
                <p className="text-xs text-sky-600 mt-1">Industry avg: 6.2%</p>
                <Progress value={84} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-amber-800">${realtimeMetrics.averageOrderValue.toLocaleString()}</p>
                <p className="text-xs text-amber-600 mt-1">+8.4% vs yesterday</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Success
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-800">96.7%</p>
                <p className="text-xs text-purple-600 mt-1">{realtimeMetrics.completedOrders.toLocaleString()} completed</p>
                <Progress value={96.7} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-teal-50/80 to-cyan-50/80 backdrop-blur-md border border-teal-200/30">
            <TabsTrigger
              value="realtime"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-teal-800"
            >
              <Activity className="h-4 w-4" />
              <span>Real-time</span>
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-teal-800"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger
              value="audience"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100/70 data-[state=active]:to-sky-100/70 data-[state=active]:text-cyan-800"
            >
              <Users className="h-4 w-4" />
              <span>Audience</span>
            </TabsTrigger>
            <TabsTrigger
              value="channels"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-sky-800"
            >
              <Globe className="h-4 w-4" />
              <span>Channels</span>
            </TabsTrigger>
            <TabsTrigger
              value="cohorts"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-100/70 data-[state=active]:to-teal-100/70 data-[state=active]:text-emerald-800"
            >
              <Layers className="h-4 w-4" />
              <span>Cohorts</span>
            </TabsTrigger>
            <TabsTrigger
              value="forecasting"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-100/70 data-[state=active]:to-purple-100/70 data-[state=active]:text-indigo-800"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Forecasting</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Real-time Revenue Chart */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-teal-800 flex items-center">
                        <Activity className="mr-2 h-5 w-5 text-teal-600" />
                        Real-time Revenue Flow
                      </CardTitle>
                      <CardDescription className="text-teal-600">
                        Live revenue tracking with 5-minute intervals
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: { label: "Revenue", color: "#14B8A6" },
                      orders: { label: "Orders", color: "#0891B2" },
                    }}
                    className="h-[320px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="hour" />
                        <YAxis yAxisId="revenue" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <YAxis yAxisId="orders" orientation="right" />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          labelFormatter={(value) => `Time: ${value}`}
                        />
                        <Area
                          yAxisId="revenue"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#14B8A6"
                          fill="#14B8A6"
                          fillOpacity={0.3}
                        />
                        <Line
                          yAxisId="orders"
                          type="monotone"
                          dataKey="orders"
                          stroke="#0891B2"
                          strokeWidth={2}
                          dot={{ fill: "#0891B2", strokeWidth: 2, r: 3 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Conversion Funnel */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <Target className="mr-2 h-5 w-5 text-teal-600" />
                    Live Conversion Funnel
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    Real-time user journey and conversion tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { stage: "Visitors", count: 15678, percentage: 100, color: "teal" },
                      { stage: "Product Views", count: 9876, percentage: 63, color: "cyan" },
                      { stage: "Add to Cart", count: 4567, percentage: 29, color: "sky" },
                      { stage: "Checkout", count: 2345, percentage: 15, color: "emerald" },
                      { stage: "Purchase", count: 1234, percentage: 8, color: "green" },
                    ].map((step, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{step.stage}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-800">{step.count.toLocaleString()}</span>
                            <Badge variant="outline" className={`border-${step.color}-200 bg-${step.color}-50 text-${step.color}-700`}>
                              {step.percentage}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={step.percentage} className="h-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Activity Feed */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-teal-800 flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-teal-600" />
                  Live Activity Stream
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Real-time sales events and customer interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[
                    { type: "sale", customer: "Enterprise Corp", amount: 12500, time: "2 min ago", location: "New York" },
                    { type: "signup", customer: "TechStart Inc", amount: null, time: "3 min ago", location: "San Francisco" },
                    { type: "sale", customer: "Global Systems", amount: 8900, time: "5 min ago", location: "London" },
                    { type: "refund", customer: "Digital Hub", amount: -2340, time: "7 min ago", location: "Toronto" },
                    { type: "sale", customer: "Innovation Labs", amount: 15600, time: "8 min ago", location: "Berlin" },
                    { type: "sale", customer: "Future Tech", amount: 6700, time: "10 min ago", location: "Tokyo" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-teal-200/30">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.type === 'sale' ? 'bg-green-500' :
                          activity.type === 'signup' ? 'bg-blue-500' :
                          'bg-red-500'
                        } animate-pulse`}></div>
                        <div>
                          <div className="font-medium text-gray-800">{activity.customer}</div>
                          <div className="text-sm text-gray-600">{activity.location} • {activity.time}</div>
                        </div>
                      </div>
                      {activity.amount && (
                        <div className={`font-bold text-lg ${activity.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {activity.amount > 0 ? '+' : ''}${activity.amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Performance Trends */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-teal-600" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    Multi-metric performance analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: { label: "Revenue", color: "#14B8A6" },
                      conversion: { label: "Conversion", color: "#0891B2" },
                    }}
                    className="h-[320px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="hour" />
                        <YAxis yAxisId="revenue" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <YAxis yAxisId="conversion" orientation="right" tickFormatter={(value) => `${value}%`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar yAxisId="revenue" dataKey="revenue" fill="#14B8A6" fillOpacity={0.8} />
                        <Line
                          yAxisId="conversion"
                          type="monotone"
                          dataKey="conversion"
                          stroke="#0891B2"
                          strokeWidth={3}
                          dot={{ fill: "#0891B2", strokeWidth: 2, r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* KPI Performance Matrix */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <Target className="mr-2 h-5 w-5 text-teal-600" />
                    KPI Performance Matrix
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    Key performance indicators vs targets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: "Revenue Growth", current: 22.5, target: 20, unit: "%" },
                      { metric: "Customer Acquisition", current: 1247, target: 1200, unit: "" },
                      { metric: "Conversion Rate", current: 8.4, target: 7.5, unit: "%" },
                      { metric: "Average Order Value", current: 1285, target: 1200, unit: "$" },
                      { metric: "Customer Satisfaction", current: 96.7, target: 95, unit: "%" },
                    ].map((kpi, index) => {
                      const percentage = (kpi.current / kpi.target) * 100
                      const isAboveTarget = kpi.current >= kpi.target
                      return (
                        <div key={index} className="p-3 rounded-lg bg-white/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{kpi.metric}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-800">
                                {kpi.unit === '$' ? '$' : ''}{kpi.current.toLocaleString()}{kpi.unit === '%' ? '%' : ''}
                              </span>
                              <Badge variant="outline" className={isAboveTarget ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
                                {isAboveTarget ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                          <Progress value={Math.min(percentage, 100)} className="h-2" />
                          <div className="text-xs text-gray-600 mt-1">
                            Target: {kpi.unit === '$' ? '$' : ''}{kpi.target.toLocaleString()}{kpi.unit === '%' ? '%' : ''}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Device Breakdown */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <Monitor className="mr-2 h-5 w-5 text-teal-600" />
                    Device & Platform Analytics
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    User engagement across different devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deviceData.map((device, index) => {
                      const Icon = device.device === 'Desktop' ? Monitor :
                                  device.device === 'Mobile' ? Smartphone : Tablet
                      return (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/60 backdrop-blur-sm">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${device.color}20` }}>
                              <Icon className="h-5 w-5" style={{ color: device.color }} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{device.device}</div>
                              <div className="text-sm text-gray-600">{device.orders.toLocaleString()} orders</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-800">{device.users}%</div>
                            <div className="text-sm text-gray-600">${device.revenue.toLocaleString()}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-teal-600" />
                    Geographic Performance
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    Revenue distribution by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { region: "North America", revenue: 1567800, percentage: 45.2, growth: 12.5 },
                      { region: "Europe", revenue: 1234500, percentage: 35.6, growth: 8.7 },
                      { region: "Asia Pacific", revenue: 456700, percentage: 13.2, growth: 22.4 },
                      { region: "Latin America", revenue: 123400, percentage: 6.0, growth: 18.7 },
                    ].map((region, index) => (
                      <div key={index} className="p-3 rounded-lg bg-white/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{region.region}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-800">${region.revenue.toLocaleString()}</span>
                            <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              +{region.growth}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={region.percentage} className="h-2" />
                        <div className="text-xs text-gray-600 mt-1">{region.percentage}% of total revenue</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-teal-800 flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-teal-600" />
                  Acquisition Channels Performance
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Revenue and cost analysis by marketing channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelData.map((channel, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-teal-200/30">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium text-gray-800">{channel.channel}</div>
                          <div className="text-sm text-gray-600">{channel.orders.toLocaleString()} orders • CAC: ${channel.cac}</div>
                        </div>
                        <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
                          {channel.percentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-700">${channel.revenue.toLocaleString()}</span>
                        <Progress value={channel.percentage} className="w-32 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cohorts" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-teal-800 flex items-center">
                  <Layers className="mr-2 h-5 w-5 text-teal-600" />
                  Customer Cohort Analysis
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Customer retention and lifetime value tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    retention: { label: "Retention %", color: "#14B8A6" },
                    revenue: { label: "Revenue", color: "#0891B2" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cohortData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="week" />
                      <YAxis yAxisId="retention" tickFormatter={(value) => `${value}%`} />
                      <YAxis yAxisId="revenue" orientation="right" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        yAxisId="retention"
                        type="monotone"
                        dataKey="retention"
                        stroke="#14B8A6"
                        strokeWidth={3}
                        dot={{ fill: "#14B8A6", strokeWidth: 2, r: 4 }}
                      />
                      <Bar yAxisId="revenue" dataKey="revenue" fill="#0891B2" fillOpacity={0.6} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-teal-800 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
                  AI-Powered Sales Forecasting
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Machine learning predictions with confidence intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    actual: { label: "Actual", color: "#14B8A6" },
                    predicted: { label: "Predicted", color: "#0891B2" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictiveData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => [
                          `$${value?.toLocaleString()}`,
                          name
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#14B8A6"
                        strokeWidth={3}
                        dot={{ fill: "#14B8A6", strokeWidth: 2, r: 5 }}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#0891B2"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        dot={{ fill: "#0891B2", strokeWidth: 2, r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {predictiveData.filter(d => d.actual === null).map((month, index) => (
                    <Card key={index} className="border border-teal-200/50 bg-white/60">
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-bold text-teal-800">{month.month}</div>
                        <div className="text-2xl font-bold text-gray-800">${(month.predicted / 1000000).toFixed(1)}M</div>
                        <div className="text-sm text-gray-600">
                          {month.confidence}% confidence
                        </div>
                        <Progress value={month.confidence} className="mt-2 h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enterprise Command Center Quick Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-teal-800 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-teal-600" />
              Command Center Quick Actions
            </CardTitle>
            <CardDescription className="text-teal-600">
              Enterprise-grade sales operations and management tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { name: "Live Alerts", icon: Bell, color: "teal", urgent: true },
                { name: "Export Data", icon: Download, color: "cyan" },
                { name: "Custom Reports", icon: FileText, color: "sky" },
                { name: "Data Import", icon: Upload, color: "emerald" },
                { name: "System Config", icon: Settings, color: "indigo" },
                { name: "Archive Data", icon: Archive, color: "purple" },
                { name: "Forecast Model", icon: TrendingUp, color: "amber" },
                { name: "API Access", icon: Database, color: "slate" },
              ].map((action, index) => (
                <Card key={index} className={`group border-0 shadow-md bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer relative`}>
                  <CardContent className="p-4 flex flex-col items-center justify-center h-24 space-y-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 shadow-md relative`}>
                      <action.icon className="h-5 w-5 text-white" />
                      {action.urgent && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
                    </div>
                    <span className={`text-xs font-medium text-${action.color}-800`}>{action.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}