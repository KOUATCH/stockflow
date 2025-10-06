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
  Database
} from 'lucide-react'

// Enhanced mock data with more comprehensive business metrics
const kpiData = [
  {
    title: "Total Revenue",
    value: "$2,847,923",
    previousValue: "$2,538,291",
    change: "+12.2%",
    trend: "up",
    icon: DollarSign,
    description: "vs last month",
    color: "from-blue-500 to-blue-600",
    target: "$3,000,000",
    targetProgress: 94.9
  },
  {
    title: "Orders",
    value: "15,234",
    previousValue: "14,012",
    change: "+8.7%",
    trend: "up",
    icon: ShoppingCart,
    description: "vs last month",
    color: "from-green-500 to-green-600",
    target: "16,000",
    targetProgress: 95.2
  },
  {
    title: "Inventory Value",
    value: "$1,923,847",
    previousValue: "$2,045,291",
    change: "-5.9%",
    trend: "down",
    icon: Package,
    description: "vs last month",
    color: "from-purple-500 to-purple-600",
    target: "$2,100,000",
    targetProgress: 91.6
  },
  {
    title: "Active Customers",
    value: "8,492",
    previousValue: "7,891",
    change: "+7.6%",
    trend: "up",
    icon: Users,
    description: "vs last month",
    color: "from-orange-500 to-orange-600",
    target: "9,000",
    targetProgress: 94.4
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    previousValue: "2.8%",
    change: "+14.3%",
    trend: "up",
    icon: Target,
    description: "vs last month",
    color: "from-teal-500 to-teal-600",
    target: "3.5%",
    targetProgress: 91.4
  },
  {
    title: "Avg Order Value",
    value: "$187.50",
    previousValue: "$181.23",
    change: "+3.5%",
    trend: "up",
    icon: TrendingUp,
    description: "vs last month",
    color: "from-pink-500 to-pink-600",
    target: "$200.00",
    targetProgress: 93.8
  }
]

const salesTrendData = [
  { name: 'Jan', revenue: 125000, orders: 1240, customers: 890, avgOrder: 101 },
  { name: 'Feb', revenue: 142000, orders: 1380, customers: 920, avgOrder: 103 },
  { name: 'Mar', revenue: 159000, orders: 1520, customers: 1050, avgOrder: 105 },
  { name: 'Apr', revenue: 178000, orders: 1680, customers: 1180, avgOrder: 106 },
  { name: 'May', revenue: 195000, orders: 1820, customers: 1290, avgOrder: 107 },
  { name: 'Jun', revenue: 213000, orders: 1960, customers: 1420, avgOrder: 109 },
  { name: 'Jul', revenue: 235000, orders: 2150, customers: 1580, avgOrder: 109 },
  { name: 'Aug', revenue: 248000, orders: 2280, customers: 1650, avgOrder: 109 },
  { name: 'Sep', revenue: 262000, orders: 2420, customers: 1720, avgOrder: 108 },
  { name: 'Oct', revenue: 275000, orders: 2580, customers: 1840, avgOrder: 107 },
  { name: 'Nov', revenue: 289000, orders: 2720, customers: 1950, avgOrder: 106 },
  { name: 'Dec', revenue: 305000, orders: 2890, customers: 2080, avgOrder: 106 }
]

const inventoryDistribution = [
  { name: 'Electronics', value: 2400, revenue: 850000, margin: 25, color: '#3B82F6' },
  { name: 'Clothing', value: 1800, revenue: 520000, margin: 45, color: '#10B981' },
  { name: 'Books & Media', value: 1200, revenue: 180000, margin: 35, color: '#F59E0B' },
  { name: 'Home & Garden', value: 900, revenue: 320000, margin: 40, color: '#EF4444' },
  { name: 'Sports & Recreation', value: 700, revenue: 280000, margin: 30, color: '#8B5CF6' },
  { name: 'Health & Beauty', value: 600, revenue: 420000, margin: 55, color: '#06B6D4' }
]

const topProducts = [
  { name: 'iPhone 15 Pro Max', sales: 1247, revenue: 1872500, trend: 'up', category: 'Electronics' },
  { name: 'Samsung Galaxy S24 Ultra', sales: 892, revenue: 1070400, trend: 'up', category: 'Electronics' },
  { name: 'MacBook Pro M3', sales: 456, revenue: 1368000, trend: 'down', category: 'Electronics' },
  { name: 'Nike Air Max 270', sales: 2341, revenue: 351150, trend: 'up', category: 'Clothing' },
  { name: 'Dyson V15 Detect', sales: 234, revenue: 140400, trend: 'up', category: 'Home & Garden' }
]

const recentActivities = [
  { id: '1', type: 'order', title: 'New Order #ORD-15847', description: 'Customer: John Smith - $1,249.99', time: '2 minutes ago', status: 'success' },
  { id: '2', type: 'inventory', title: 'Low Stock Alert', description: 'iPhone 15 Pro - Only 5 units left', time: '15 minutes ago', status: 'warning' },
  { id: '3', type: 'payment', title: 'Payment Processed', description: 'Order #ORD-15845 - $892.50', time: '23 minutes ago', status: 'success' },
  { id: '4', type: 'customer', title: 'New Customer Registration', description: 'Sarah Johnson joined', time: '1 hour ago', status: 'info' },
  { id: '5', type: 'return', title: 'Return Request', description: 'Order #ORD-15823 - $156.99', time: '2 hours ago', status: 'warning' }
]

const locationPerformance = [
  { name: 'Store #001 - Downtown', revenue: 485000, orders: 2840, growth: 12.5, rating: 4.8 },
  { name: 'Store #002 - Mall Central', revenue: 423000, orders: 2156, growth: 8.2, rating: 4.6 },
  { name: 'Store #003 - Westside', revenue: 367000, orders: 1892, growth: -2.1, rating: 4.4 },
  { name: 'Warehouse North', revenue: 0, orders: 0, growth: 0, rating: 0, type: 'warehouse' }
]

const alertsAndNotifications = [
  { id: '1', type: 'critical', title: 'System Maintenance', description: 'Scheduled maintenance tonight 2-4 AM', time: '1 hour ago' },
  { id: '2', type: 'warning', title: 'Low Stock Items', description: '23 items below reorder level', time: '2 hours ago' },
  { id: '3', type: 'info', title: 'New Feature Available', description: 'Advanced analytics dashboard is ready', time: '4 hours ago' },
  { id: '4', type: 'success', title: 'Backup Completed', description: 'Daily backup completed successfully', time: '6 hours ago' }
]

const financialMetrics = {
  grossProfit: { value: 1285000, change: 8.5, target: 1400000 },
  netProfit: { value: 342000, change: 12.3, target: 380000 },
  expenses: { value: 943000, change: 4.2, target: 900000 },
  cashFlow: { value: 542000, change: 15.8, target: 600000 }
}

interface EnterpriseDashboardProps {
  className?: string
}

export default function EnterpriseDashboard({ className = "" }: EnterpriseDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />
      case 'inventory': return <Package className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'customer': return <Users className="h-4 w-4" />
      case 'return': return <ArrowDownRight className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Bell className="h-4 w-4 text-blue-500" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
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
                  Executive Dashboard
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-muted-foreground">
                    Welcome back! Here's your business overview for today.
                  </p>
                  <Badge variant="outline" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    Live Data
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentTime.toLocaleTimeString()}
                  </Badge>
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
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="bg-white/70 backdrop-blur-sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
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
        {alertsAndNotifications.filter(alert => alert.type === 'critical').length > 0 && (
          <Alert className="border-red-200 bg-red-50/50 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-700">System Alert</AlertTitle>
            <AlertDescription className="text-red-600">
              {alertsAndNotifications.find(alert => alert.type === 'critical')?.description}
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon
            const isPositive = kpi.trend === "up"

            return (
              <Card key={index} className="group border-0 shadow-lg bg-white/70 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                      {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {kpi.change}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Target: {kpi.target}</span>
                        <span>{kpi.targetProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={kpi.targetProgress} className="h-2" />
                    </div>

                    <p className="text-xs text-muted-foreground">{kpi.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/70 backdrop-blur-md">
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
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
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Financial</span>
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Revenue & Orders Trend
                  </CardTitle>
                  <CardDescription>Monthly performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={salesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
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
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                    Category Performance
                  </CardTitle>
                  <CardDescription>Revenue distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={inventoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {inventoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: 'none',
                          borderRadius: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-600" />
                      Top Performing Products
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div>
                            <p className="font-semibold text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category} • {product.sales} units sold</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-sm">${product.revenue.toLocaleString()}</p>
                            <Badge variant={product.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                              {product.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                              {product.trend === 'up' ? '+' : '-'}5.2%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Location Performance
                  </CardTitle>
                  <CardDescription>Revenue by location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationPerformance.map((location, index) => (
                      <div key={index} className="p-4 bg-slate-50/50 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">{location.name}</p>
                            <p className="text-xs text-muted-foreground">{location.orders} orders • {location.rating}★ rating</p>
                          </div>
                          <Badge variant={location.growth >= 0 ? 'default' : 'destructive'}>
                            {location.growth >= 0 ? '+' : ''}{location.growth}%
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Revenue: ${location.revenue.toLocaleString()}</span>
                            <span>Target: ${(location.revenue * 1.15).toLocaleString()}</span>
                          </div>
                          <Progress value={(location.revenue / (location.revenue * 1.15)) * 100} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {inventoryDistribution.map((category, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{category.name}</span>
                      <Badge style={{ backgroundColor: category.color, color: 'white' }}>
                        {category.value} items
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Revenue</span>
                        <span className="font-semibold">${category.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Margin</span>
                        <Badge variant="outline">{category.margin}%</Badge>
                      </div>
                      <Progress value={category.margin} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                    <Badge variant="outline">{recentActivities.length} activities</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg backdrop-blur-sm">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-orange-600" />
                      Alerts & Notifications
                    </div>
                    <Badge variant="outline">{alertsAndNotifications.length} alerts</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alertsAndNotifications.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-lg backdrop-blur-sm">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Gross Profit</p>
                      <p className="text-2xl font-bold text-green-900">${financialMetrics.grossProfit.value.toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600 font-medium">+{financialMetrics.grossProfit.change}%</span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-600 rounded-full">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={(financialMetrics.grossProfit.value / financialMetrics.grossProfit.target) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: ${financialMetrics.grossProfit.target.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Net Profit</p>
                      <p className="text-2xl font-bold text-blue-900">${financialMetrics.netProfit.value.toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600 font-medium">+{financialMetrics.netProfit.change}%</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-600 rounded-full">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={(financialMetrics.netProfit.value / financialMetrics.netProfit.target) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: ${financialMetrics.netProfit.target.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Expenses</p>
                      <p className="text-2xl font-bold text-red-900">${financialMetrics.expenses.value.toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                        <span className="text-sm text-red-600 font-medium">+{financialMetrics.expenses.change}%</span>
                      </div>
                    </div>
                    <div className="p-3 bg-red-600 rounded-full">
                      <TrendingDown className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={(financialMetrics.expenses.value / financialMetrics.expenses.target) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Budget: ${financialMetrics.expenses.target.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Cash Flow</p>
                      <p className="text-2xl font-bold text-purple-900">${financialMetrics.cashFlow.value.toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600 font-medium">+{financialMetrics.cashFlow.change}%</span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-600 rounded-full">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={(financialMetrics.cashFlow.value / financialMetrics.cashFlow.target) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: ${financialMetrics.cashFlow.target.toLocaleString()}
                    </p>
                  </div>
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
            <CardDescription>Frequently used business operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                <Plus className="h-6 w-6" />
                <span className="text-xs">New Order</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                <Package className="h-6 w-6" />
                <span className="text-xs">Add Product</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                <Users className="h-6 w-6" />
                <span className="text-xs">New Customer</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                <Truck className="h-6 w-6" />
                <span className="text-xs">Stock Transfer</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                <CreditCard className="h-6 w-6" />
                <span className="text-xs">Process Payment</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                <FileText className="h-6 w-6" />
                <span className="text-xs">Generate Report</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                <Database className="h-6 w-6" />
                <span className="text-xs">Backup Data</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                <Settings className="h-6 w-6" />
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}