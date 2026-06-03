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
  TrendingDown as TrendDown,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react"

const salesData = [
  { date: "2024-01-01", revenue: 125000, orders: 145, customers: 138, avgOrder: 862 },
  { date: "2024-01-02", revenue: 152000, orders: 152, customers: 144, avgOrder: 1000 },
  { date: "2024-01-03", revenue: 189000, orders: 167, customers: 158, avgOrder: 1132 },
  { date: "2024-01-04", revenue: 143000, orders: 148, customers: 141, avgOrder: 966 },
  { date: "2024-01-05", revenue: 218000, orders: 178, customers: 165, avgOrder: 1225 },
  { date: "2024-01-06", revenue: 196000, orders: 171, customers: 159, avgOrder: 1146 },
  { date: "2024-01-07", revenue: 164000, orders: 155, customers: 147, avgOrder: 1058 },
  { date: "2024-01-08", revenue: 231000, orders: 182, customers: 171, avgOrder: 1269 },
  { date: "2024-01-09", revenue: 205000, orders: 173, customers: 162, avgOrder: 1185 },
  { date: "2024-01-10", revenue: 178000, orders: 161, customers: 153, avgOrder: 1106 },
  { date: "2024-01-11", revenue: 254000, orders: 189, customers: 176, avgOrder: 1344 },
  { date: "2024-01-12", revenue: 227000, orders: 181, customers: 168, avgOrder: 1254 },
  { date: "2024-01-13", revenue: 192000, orders: 168, customers: 157, avgOrder: 1143 },
  { date: "2024-01-14", revenue: 268000, orders: 195, customers: 182, avgOrder: 1374 },
  { date: "2024-01-15", revenue: 243000, orders: 187, customers: 174, avgOrder: 1299 },
]

const categoryData = [
  { name: "Enterprise Software", value: 45, revenue: 1250000, color: "#14B8A6", items: 245 },
  { name: "Hardware Solutions", value: 25, revenue: 890000, color: "#0891B2", items: 189 },
  { name: "Cloud Services", value: 15, revenue: 340000, color: "#0284C7", items: 156 },
  { name: "Consulting", value: 10, revenue: 180000, color: "#0F766E", items: 89 },
  { name: "Support & Maintenance", value: 5, revenue: 120000, color: "#065F46", items: 67 },
]

const topProducts = [
  { name: "Enterprise CRM Suite", sales: 245, revenue: 2694550, growth: 22.5, category: "Software", margin: 68.5 },
  { name: "Cloud Infrastructure Package", sales: 189, revenue: 1244110, growth: 18.3, category: "Services", margin: 45.2 },
  { name: "Analytics Dashboard Pro", sales: 156, revenue: 1246440, growth: -2.1, category: "Software", margin: 72.1 },
  { name: "Security Suite Enterprise", sales: 312, revenue: 776880, growth: 35.7, category: "Software", margin: 58.9 },
  { name: "Mobile App Platform", sales: 267, revenue: 401330, growth: 15.2, category: "Platform", margin: 62.3 },
]

const paymentMethodData = [
  { method: "Corporate Credit", amount: 1567800, percentage: 52.3, transactions: 1245, growth: 12.5 },
  { method: "Bank Transfer", amount: 894500, percentage: 29.8, transactions: 892, growth: 8.7 },
  { method: "Digital Wallet", amount: 536700, percentage: 17.9, transactions: 567, growth: 25.3 },
]

const regionalData = [
  { region: "North America", revenue: 1567800, orders: 2245, growth: 15.2, customers: 1890 },
  { region: "Europe", revenue: 1234500, orders: 1892, growth: 12.8, customers: 1567 },
  { region: "Asia Pacific", revenue: 987600, orders: 1456, growth: 22.4, customers: 1234 },
  { region: "Latin America", revenue: 456700, orders: 678, growth: 18.7, customers: 567 },
]

export function EnhancedEnterpriseSalesAnalytics() {
  const [dateRange, setDateRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("revenue")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0)
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0)
  const totalCustomers = salesData.reduce((sum, day) => sum + day.customers, 0)
  const avgOrderValue = totalRevenue / totalOrders

  const revenueGrowth = 22.5
  const ordersGrowth = 18.3
  const customersGrowth = 25.2

  const refreshData = () => {
    console.log('Refreshing analytics data...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-teal-50/30 dark:from-slate-800/80 dark:via-slate-700/40 dark:to-slate-600/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      {/* Enhanced Header Section */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-gradient-to-r from-cyan-100/90 via-teal-50/90 to-sky-100/90 border-b border-teal-200/30 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-700 bg-clip-text text-transparent flex items-center">
                  <BarChart3 className="mr-3 h-8 w-8 text-teal-600" />
                  Enterprise Sales Analytics
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-teal-600 text-lg">
                    Comprehensive business intelligence and performance insights
                  </p>
                  <Badge variant="outline" className="text-xs border-teal-200 bg-teal-50/70 text-teal-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Real-time Data
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-200 bg-cyan-50/70 text-cyan-700">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentTime.toLocaleTimeString()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-500" />
                <Input
                  placeholder="Search analytics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-teal-50/80 backdrop-blur-sm border-teal-200/50 focus:border-teal-400 focus:ring-teal-300/30"
                />
              </div>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40 bg-cyan-50/80 backdrop-blur-sm border-cyan-200/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-8" />

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
        {/* System Status Alert */}
        <Alert className="border-teal-200 bg-gradient-to-r from-teal-50/70 to-cyan-50/70 backdrop-blur-sm">
          <CheckCircle className="h-4 w-4 text-teal-500" />
          <AlertTitle className="text-teal-700">Analytics System: Operational</AlertTitle>
          <AlertDescription className="text-teal-600">
            All data streams are active. Last update: {currentTime.toLocaleString()}. Processing {totalOrders.toLocaleString()} orders.
          </AlertDescription>
        </Alert>

        {/* Enhanced KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{revenueGrowth}%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-teal-600">Total Revenue</p>
                <p className="text-3xl font-bold text-teal-800">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-teal-600 mt-1">Target: $3.2M (78%)</p>
                <Progress value={78} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50/80 to-sky-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{ordersGrowth}%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-600">Total Orders</p>
                <p className="text-3xl font-bold text-cyan-800">{totalOrders.toLocaleString()}</p>
                <p className="text-xs text-cyan-600 mt-1">Target: 2.8K (91%)</p>
                <Progress value={91} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{customersGrowth}%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600">Unique Customers</p>
                <p className="text-3xl font-bold text-emerald-800">{totalCustomers.toLocaleString()}</p>
                <p className="text-xs text-emerald-600 mt-1">Target: 2.5K (95%)</p>
                <Progress value={95} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-sky-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-sky-800">${avgOrderValue.toFixed(0)}</p>
                <p className="text-xs text-sky-600 mt-1">Industry avg: $1,050</p>
                <Progress value={85} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  <Star className="h-3 w-3 mr-1" />
                  Excellent
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-600">Customer Satisfaction</p>
                <p className="text-3xl font-bold text-amber-800">96.5%</p>
                <p className="text-xs text-amber-600 mt-1">Based on 1,245 reviews</p>
                <Progress value={96.5} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15.7%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-800">8.4%</p>
                <p className="text-xs text-purple-600 mt-1">Above industry avg</p>
                <Progress value={84} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-teal-50/80 to-cyan-50/80 backdrop-blur-md border border-teal-200/30">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-teal-800"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-teal-800"
            >
              <Package className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100/70 data-[state=active]:to-sky-100/70 data-[state=active]:text-cyan-800"
            >
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-sky-800"
            >
              <CreditCard className="h-4 w-4" />
              <span>Payments</span>
            </TabsTrigger>
            <TabsTrigger
              value="regional"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-100/70 data-[state=active]:to-teal-100/70 data-[state=active]:text-emerald-800"
            >
              <MapPin className="h-4 w-4" />
              <span>Regional</span>
            </TabsTrigger>
            <TabsTrigger
              value="forecasting"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-100/70 data-[state=active]:to-purple-100/70 data-[state=active]:text-indigo-800"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Forecasting</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Enhanced Revenue Trend Chart */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-teal-800 flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5 text-teal-600" />
                        Revenue Trend Analysis
                      </CardTitle>
                      <CardDescription className="text-teal-600">
                        Multi-dimensional revenue performance tracking
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
                      Live Data
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: { label: "Revenue", color: "#14B8A6" },
                      avgOrder: { label: "Avg Order", color: "#0891B2" },
                    }}
                    className="h-[320px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          }
                        />
                        <YAxis yAxisId="revenue" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <YAxis yAxisId="avgOrder" orientation="right" tickFormatter={(value) => `$${value}`} />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
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
                          yAxisId="avgOrder"
                          type="monotone"
                          dataKey="avgOrder"
                          stroke="#0891B2"
                          strokeWidth={3}
                          dot={{ fill: "#0891B2", strokeWidth: 2, r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Enhanced Category Performance */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <PieChartIcon className="mr-2 h-5 w-5 text-teal-600" />
                    Category Performance Matrix
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    Revenue distribution and growth analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="h-[280px]">
                      <ChartContainer
                        config={{ value: { label: "Sales %" } }}
                        className="h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              dataKey="value"
                              label={({ name, value }) => `${value}%`}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-white/95 backdrop-blur-sm border border-teal-200 rounded-lg p-3 shadow-lg">
                                      <p className="font-medium text-teal-800">{data.name}</p>
                                      <p className="text-sm text-teal-600">
                                        {data.value}% • ${data.revenue.toLocaleString()}
                                      </p>
                                      <p className="text-xs text-gray-600">{data.items} items sold</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                    <div className="space-y-3">
                      {categoryData.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/50 backdrop-blur-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                            <div>
                              <div className="font-medium text-gray-800">{category.name}</div>
                              <div className="text-sm text-gray-600">${category.revenue.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-teal-700">{category.value}%</div>
                            <Progress value={category.value} className="w-16 h-2 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-teal-700 flex items-center">
                    <Activity className="mr-2 h-4 w-4" />
                    Sales Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-800 mb-1">127</div>
                  <div className="text-sm text-teal-600">orders per day</div>
                  <div className="flex items-center mt-2 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                    <span className="text-green-600">+12.5% vs last week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50/80 to-sky-50/80 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-cyan-700 flex items-center">
                    <Target className="mr-2 h-4 w-4" />
                    Market Penetration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-800 mb-1">68.4%</div>
                  <div className="text-sm text-cyan-600">target market</div>
                  <Progress value={68.4} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-emerald-700 flex items-center">
                    <Award className="mr-2 h-4 w-4" />
                    Customer Retention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-800 mb-1">94.2%</div>
                  <div className="text-sm text-emerald-600">12-month rate</div>
                  <div className="flex items-center mt-2 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                    <span className="text-green-600">Industry leading</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-sky-700 flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Profit Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-sky-800 mb-1">42.8%</div>
                  <div className="text-sm text-sky-600">gross margin</div>
                  <div className="flex items-center mt-2 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                    <span className="text-green-600">+3.2% vs target</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-teal-800 flex items-center">
                  <Package className="mr-2 h-5 w-5 text-teal-600" />
                  Top Performing Products
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Comprehensive product performance analysis with profitability metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-teal-200/30 hover:bg-white/80 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {product.category} • {product.sales} units • {product.margin}% margin
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-teal-700">${product.revenue.toLocaleString()}</div>
                        <div className="flex items-center text-sm">
                          {product.growth > 0 ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                          ) : (
                            <TrendDown className="mr-1 h-3 w-3 text-red-600" />
                          )}
                          <span className={product.growth > 0 ? "text-green-600" : "text-red-600"}>
                            {product.growth > 0 ? "+" : ""}
                            {product.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-teal-700 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    New Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-800 mb-1">427</div>
                  <div className="text-sm text-teal-600">this month</div>
                  <div className="flex items-center mt-2 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                    <span className="text-green-600">+23% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50/80 to-sky-50/80 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-cyan-700 flex items-center">
                    <Award className="mr-2 h-4 w-4" />
                    VIP Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-800 mb-1">156</div>
                  <div className="text-sm text-cyan-600">enterprise clients</div>
                  <div className="text-xs text-cyan-600 mt-1">78% of total revenue</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-emerald-700 flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Customer LTV
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-800 mb-1">$12,470</div>
                  <div className="text-sm text-emerald-600">average lifetime value</div>
                  <div className="flex items-center mt-2 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                    <span className="text-green-600">+15.7% vs last quarter</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-sky-700 flex items-center">
                    <Target className="mr-2 h-4 w-4" />
                    Churn Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-sky-800 mb-1">2.3%</div>
                  <div className="text-sm text-sky-600">monthly churn</div>
                  <div className="flex items-center mt-2 text-xs">
                    <TrendDown className="h-3 w-3 mr-1 text-green-600" />
                    <span className="text-green-600">-0.8% improvement</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-teal-800 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-teal-600" />
                  Payment Methods Analysis
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Transaction volume and growth by payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethodData.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-teal-200/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{method.method}</div>
                          <div className="text-sm text-gray-600">{method.transactions.toLocaleString()} transactions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-teal-700">${method.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{method.percentage}%</div>
                        <div className="flex items-center text-xs mt-1">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                          <span className="text-green-600">+{method.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regional" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-teal-800 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-teal-600" />
                  Regional Performance Matrix
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Geographic sales distribution and growth analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {regionalData.map((region, index) => (
                    <div key={index} className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-teal-200/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <h3 className="font-medium text-gray-800">{region.region}</h3>
                        </div>
                        <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{region.growth}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Revenue</div>
                          <div className="font-bold text-teal-700">${region.revenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Orders</div>
                          <div className="font-bold text-gray-800">{region.orders.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Customers</div>
                          <div className="font-bold text-gray-800">{region.customers.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-teal-800 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
                  Sales Forecasting & Predictions
                </CardTitle>
                <CardDescription className="text-teal-600">
                  AI-powered sales predictions and trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border border-teal-200/50 bg-white/60">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-teal-800 mb-1">$3.2M</div>
                      <div className="text-sm text-teal-600">Next Month Forecast</div>
                      <div className="text-xs text-green-600 mt-1">95% confidence</div>
                    </CardContent>
                  </Card>
                  <Card className="border border-cyan-200/50 bg-white/60">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-cyan-800 mb-1">$9.8M</div>
                      <div className="text-sm text-cyan-600">Q1 2024 Projection</div>
                      <div className="text-xs text-green-600 mt-1">+18% growth</div>
                    </CardContent>
                  </Card>
                  <Card className="border border-sky-200/50 bg-white/60">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-sky-800 mb-1">$42M</div>
                      <div className="text-sm text-sky-600">Annual Target</div>
                      <div className="text-xs text-amber-600 mt-1">78% achieved</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enterprise Quick Actions Grid */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-teal-800 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-teal-600" />
              Analytics Quick Actions
            </CardTitle>
            <CardDescription className="text-teal-600">
              Streamlined analytics operations and report generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Custom Report", icon: FileText, color: "teal" },
                { name: "Export Data", icon: Download, color: "cyan" },
                { name: "Schedule Report", icon: Calendar, color: "sky" },
                { name: "Data Import", icon: Upload, color: "emerald" },
                { name: "Dashboard Config", icon: Settings, color: "indigo" },
                { name: "Alerts Setup", icon: Bell, color: "purple" },
              ].map((action, index) => (
                <Card key={index} className={`group border-0 shadow-md bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer`}>
                  <CardContent className="p-4 flex flex-col items-center justify-center h-24 space-y-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 shadow-md`}>
                      <action.icon className="h-5 w-5 text-white" />
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