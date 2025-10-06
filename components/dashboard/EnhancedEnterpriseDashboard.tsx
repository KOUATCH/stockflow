"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  Calendar,
  Target,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Activity,
  Layers,
  PieChart as PieChartIcon,
  FileText,
  Mail,
  Bell,
  Settings,
  HelpCircle,
  MoreHorizontal,
  MapPin,
  Truck,
  CreditCard,
  Star,
  Bookmark,
  Share2,
  Printer,
  Archive,
  Database,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react'
import useDashboardData from '@/hooks/useDashboardData'
import InventoryCarousel from './InventoryCarousel'
import { formatCurrency, formatNumber, formatPercentage, getRelativeTime } from '@/lib/utils'

interface EnhancedEnterpriseDashboardProps {
  className?: string
}

export default function EnhancedEnterpriseDashboard({ className = "" }: EnhancedEnterpriseDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState("overview")

  // Real-time dashboard data
  const {
    metrics,
    salesData,
    topProducts,
    locations,
    alerts,
    activities,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    markAlertAsRead,
    dismissAlert,
    unreadAlerts,
    criticalAlerts,
    isDataStale
  } = useDashboardData(30000) // Refresh every 30 seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getKPICards = () => {
    if (!metrics) return []

    return [
      {
        title: "Total Revenue",
        value: formatCurrency(metrics.revenue.current),
        change: `${metrics.revenue.change >= 0 ? '+' : ''}${formatPercentage(metrics.revenue.change)}`,
        trend: metrics.revenue.change >= 0 ? "up" : "down",
        icon: DollarSign,
        description: "vs last month",
        color: "from-blue-500 to-blue-600",
        target: formatCurrency(metrics.revenue.target),
        targetProgress: (metrics.revenue.current / metrics.revenue.target) * 100
      },
      {
        title: "Orders",
        value: formatNumber(metrics.orders.current),
        change: `${metrics.orders.change >= 0 ? '+' : ''}${formatPercentage(metrics.orders.change)}`,
        trend: metrics.orders.change >= 0 ? "up" : "down",
        icon: ShoppingCart,
        description: "vs last month",
        color: "from-green-500 to-green-600",
        target: formatNumber(metrics.orders.target),
        targetProgress: (metrics.orders.current / metrics.orders.target) * 100
      },
      {
        title: "Inventory Value",
        value: formatCurrency(metrics.inventory.current),
        change: `${metrics.inventory.change >= 0 ? '+' : ''}${formatPercentage(metrics.inventory.change)}`,
        trend: metrics.inventory.change >= 0 ? "up" : "down",
        icon: Package,
        description: "vs last month",
        color: "from-purple-500 to-purple-600",
        target: formatCurrency(metrics.inventory.target),
        targetProgress: (metrics.inventory.current / metrics.inventory.target) * 100
      },
      {
        title: "Active Customers",
        value: formatNumber(metrics.customers.current),
        change: `${metrics.customers.change >= 0 ? '+' : ''}${formatPercentage(metrics.customers.change)}`,
        trend: metrics.customers.change >= 0 ? "up" : "down",
        icon: Users,
        description: "vs last month",
        color: "from-orange-500 to-orange-600",
        target: formatNumber(metrics.customers.target),
        targetProgress: (metrics.customers.current / metrics.customers.target) * 100
      },
      {
        title: "Conversion Rate",
        value: `${formatPercentage(metrics.conversionRate.current)}`,
        change: `${metrics.conversionRate.change >= 0 ? '+' : ''}${formatPercentage(metrics.conversionRate.change)}`,
        trend: metrics.conversionRate.change >= 0 ? "up" : "down",
        icon: Target,
        description: "vs last month",
        color: "from-teal-500 to-teal-600",
        target: `${formatPercentage(metrics.conversionRate.target)}`,
        targetProgress: (metrics.conversionRate.current / metrics.conversionRate.target) * 100
      },
      {
        title: "Avg Order Value",
        value: formatCurrency(metrics.avgOrderValue.current),
        change: `${metrics.avgOrderValue.change >= 0 ? '+' : ''}${formatPercentage(metrics.avgOrderValue.change)}`,
        trend: metrics.avgOrderValue.change >= 0 ? "up" : "down",
        icon: TrendingUp,
        description: "vs last month",
        color: "from-pink-500 to-pink-600",
        target: formatCurrency(metrics.avgOrderValue.target),
        targetProgress: (metrics.avgOrderValue.current / metrics.avgOrderValue.target) * 100
      }
    ]
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />
      case 'inventory': return <Package className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'customer': return <Users className="h-4 w-4" />
      case 'return': return <ArrowDownRight className="h-4 w-4" />
      case 'system': return <Settings className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getConnectionStatus = () => {
    if (error) return { icon: WifiOff, color: 'text-red-500', text: 'Connection Error' }
    if (isDataStale) return { icon: WifiOff, color: 'text-yellow-500', text: 'Connection Unstable' }
    return { icon: Wifi, color: 'text-green-500', text: 'Connected' }
  }

  const connectionStatus = getConnectionStatus()

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Dashboard Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${className}`}>
      {/* Header Section */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  StockFlow Executive Dashboard
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-muted-foreground">
                    Real-time business intelligence and analytics
                  </p>
                  <Badge variant="outline" className="text-xs">
                    <connectionStatus.icon className={`h-3 w-3 mr-1 ${connectionStatus.color}`} />
                    {connectionStatus.text}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentTime.toLocaleTimeString()}
                  </Badge>
                  {lastUpdated && (
                    <Badge variant="outline" className="text-xs">
                      Updated {getRelativeTime(lastUpdated)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search dashboard..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-white/70 backdrop-blur-sm"
                  />
                </div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32 bg-white/70 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={isLoading}
                  className="bg-white/70 backdrop-blur-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                {/* Alerts Bell */}
                <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm relative">
                  <Bell className="h-4 w-4 mr-2" />
                  Alerts
                  {unreadAlerts > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {unreadAlerts}
                    </Badge>
                  )}
                </Button>

                <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Critical Alerts */}
        {criticalAlerts > 0 && (
          <Alert className="border-red-200 bg-red-50/50 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-700">Critical System Alert</AlertTitle>
            <AlertDescription className="text-red-600">
              {criticalAlerts} critical alert{criticalAlerts > 1 ? 's' : ''} require immediate attention.
              <Button variant="link" className="p-0 h-auto ml-2 text-red-700">
                View Details
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Grid */}
        {isLoading && !metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-3" />
                  <Skeleton className="h-2 w-full mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {getKPICards().map((kpi, index) => {
              const Icon = kpi.icon
              const isPositive = kpi.trend === "up"

              const cardGradient = {
                "from-blue-500 to-blue-600": "from-blue-50 to-blue-100",
                "from-green-500 to-green-600": "from-green-50 to-green-100",
                "from-purple-500 to-purple-600": "from-purple-50 to-purple-100",
                "from-orange-500 to-orange-600": "from-orange-50 to-orange-100",
                "from-teal-500 to-teal-600": "from-teal-50 to-teal-100",
                "from-pink-500 to-pink-600": "from-pink-50 to-pink-100"
              }[kpi.color] || "from-gray-50 to-gray-100"

              const textColor = {
                "from-blue-500 to-blue-600": "text-blue-800",
                "from-green-500 to-green-600": "text-green-800",
                "from-purple-500 to-purple-600": "text-purple-800",
                "from-orange-500 to-orange-600": "text-orange-800",
                "from-teal-500 to-teal-600": "text-teal-800",
                "from-pink-500 to-pink-600": "text-pink-800"
              }[kpi.color] || "text-gray-800"

              return (
                <Card key={index} className={`group border-0 shadow-lg bg-gradient-to-br ${cardGradient} backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant={isPositive ? "default" : "destructive"} className="text-xs bg-white/70 backdrop-blur-sm">
                        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {kpi.change}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className={`text-sm font-medium ${textColor.replace('800', '600')}`}>{kpi.title}</p>
                        <p className={`text-2xl font-bold ${textColor}`}>{kpi.value}</p>
                      </div>

                      <div className="space-y-2">
                        <div className={`flex justify-between text-xs ${textColor.replace('800', '600')}`}>
                          <span>Target: {kpi.target}</span>
                          <span>{kpi.targetProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(kpi.targetProgress, 100)} className="h-2 bg-white/30" />
                      </div>

                      <p className={`text-xs ${textColor.replace('800', '600')}`}>{kpi.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/70 backdrop-blur-md">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Sales</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Operations</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <PieChartIcon className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Monthly revenue performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-600" />
                      Top Products
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        {topProducts.map((product, index) => (
                          <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg backdrop-blur-sm border border-white/20">
                            <div className="flex items-center space-x-4">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <div>
                                <p className="font-semibold text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.category} • {formatNumber(product.sales)} units • {formatPercentage(product.margin)}% margin
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="font-semibold text-sm">{formatCurrency(product.revenue)}</p>
                                <Badge variant={product.trend === 'up' ? 'default' : product.trend === 'down' ? 'destructive' : 'secondary'} className="text-xs">
                                  {product.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                                  {product.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                                  {product.trend === 'up' ? '+' : product.trend === 'down' ? '-' : ''}
                                  {product.trend !== 'stable' ? '5.2%' : 'Stable'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Sales vs Orders
                  </CardTitle>
                  <CardDescription>Revenue and order volume correlation</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="period" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue ($)" />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} name="Orders" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-red-600" />
                    Location Performance
                  </CardTitle>
                  <CardDescription>Revenue by store location</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="p-4 space-y-3">
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-5 w-12" />
                          </div>
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-80">
                      <div className="space-y-4">
                        {locations.filter(loc => loc.type !== 'warehouse').map((location) => (
                          <div key={location.id} className="p-4 bg-slate-50/50 rounded-lg backdrop-blur-sm border border-white/20">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-sm">{location.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatNumber(location.orders)} orders • {location.rating.toFixed(1)}★ rating
                                </p>
                              </div>
                              <Badge variant={location.growth >= 0 ? 'default' : 'destructive'}>
                                {location.growth >= 0 ? '+' : ''}{formatPercentage(location.growth)}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Revenue: {formatCurrency(location.revenue)}</span>
                                <span>Target: {formatCurrency(location.revenue * 1.15)}</span>
                              </div>
                              <Progress value={(location.revenue / (location.revenue * 1.15)) * 100} className="h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <InventoryCarousel
              items={[]} // Will use generated mock data
              isLoading={isLoading}
              className="w-full"
            />
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-600" />
                      Recent Activities
                    </div>
                    <Badge variant="outline">{activities.length} activities</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div key={activity.id} className={`flex items-start space-x-3 p-3 rounded-lg border backdrop-blur-sm ${getActivityColor(activity.status)}`}>
                            <div className="p-2 rounded-lg bg-white/70">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">{activity.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {getRelativeTime(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-orange-600" />
                      System Alerts
                    </div>
                    <Badge variant="outline">{alerts.length} alerts</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3">
                          <Skeleton className="h-4 w-4" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                          <Skeleton className="h-6 w-6" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`flex items-start space-x-3 p-3 rounded-lg border backdrop-blur-sm transition-opacity ${
                              alert.isRead ? 'opacity-70' : ''
                            } ${
                              alert.type === 'critical' ? 'bg-red-50/70 border-red-200' :
                              alert.type === 'warning' ? 'bg-yellow-50/70 border-yellow-200' :
                              alert.type === 'success' ? 'bg-green-50/70 border-green-200' :
                              'bg-blue-50/70 border-blue-200'
                            }`}
                            onClick={() => markAlertAsRead(alert.id)}
                          >
                            {getAlertIcon(alert.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{alert.title}</p>
                              <p className="text-xs text-muted-foreground">{alert.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {getRelativeTime(alert.timestamp)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                dismissAlert(alert.id)
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Customer Growth
                  </CardTitle>
                  <CardDescription>Customer acquisition over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value: any) => [formatNumber(value), 'Customers']}
                        />
                        <Line
                          type="monotone"
                          dataKey="customers"
                          stroke="#8B5CF6"
                          strokeWidth={3}
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-teal-600" />
                    Conversion Rate
                  </CardTitle>
                  <CardDescription>Sales conversion performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value: any) => [`${formatPercentage(value)}`, 'Conversion Rate']}
                        />
                        <Area
                          type="monotone"
                          dataKey="conversionRate"
                          stroke="#14B8A6"
                          fill="#14B8A6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions Grid */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used business operations and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <Card className="group border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-20 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-md">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-green-800">New Order</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-20 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-800">Add Product</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-20 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-orange-800">New Customer</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-20 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 shadow-md">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-teal-800">Stock Transfer</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-20 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 shadow-md">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-pink-800">Process Payment</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-20 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-blue-800">Reports</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-20 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-indigo-800">Backup</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-20 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 shadow-md">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-800">Settings</span>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}