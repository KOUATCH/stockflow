"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  ShoppingCart,
  Target,
  Filter,
  Calendar,
  Bell,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Settings,
  Upload,
  Info,
  AlertCircle,
  Globe,
  Archive,
  Package,
  CreditCard,
} from "lucide-react"

interface SalesOrder {
  id: string
  orderNumber: string
  customer: string
  customerEmail?: string
  date: string
  status: "draft" | "confirmed" | "processing" | "shipped" | "delivered" | "completed" | "cancelled"
  paymentStatus: "pending" | "partial" | "paid" | "refunded"
  items: number
  subtotal: number
  tax: number
  total: number
  location: string
  priority?: "low" | "medium" | "high" | "urgent"
  estimatedDelivery?: string
  notes?: string
}

const mockOrders: SalesOrder[] = [
  {
    id: "1",
    orderNumber: "SO-000001",
    customer: "Apple Inc.",
    customerEmail: "orders@apple.com",
    date: "2024-01-15T10:30:00Z",
    status: "completed",
    paymentStatus: "paid",
    items: 15,
    subtotal: 125750,
    tax: 12575,
    total: 138325,
    location: "Main Store",
    priority: "high",
    estimatedDelivery: "2024-01-20",
    notes: "Bulk order for corporate office"
  },
  {
    id: "2",
    orderNumber: "SO-000002",
    customer: "TechCorp Solutions",
    customerEmail: "procurement@techcorp.com",
    date: "2024-01-15T14:15:00Z",
    status: "processing",
    paymentStatus: "paid",
    items: 8,
    subtotal: 89990,
    tax: 8999,
    total: 98989,
    location: "Main Store",
    priority: "medium",
    estimatedDelivery: "2024-01-18",
    notes: "Express shipping requested"
  },
  {
    id: "3",
    orderNumber: "SO-000003",
    customer: "StartupHub Ltd",
    date: "2024-01-14T16:45:00Z",
    status: "confirmed",
    paymentStatus: "pending",
    items: 5,
    subtotal: 32480,
    tax: 3248,
    total: 35728,
    location: "Store Front",
    priority: "low",
    estimatedDelivery: "2024-01-22",
  },
  {
    id: "4",
    orderNumber: "SO-000004",
    customer: "Enterprise Systems Inc",
    customerEmail: "orders@enterprise.com",
    date: "2024-01-14T11:20:00Z",
    status: "shipped",
    paymentStatus: "paid",
    items: 12,
    subtotal: 156990,
    tax: 15699,
    total: 172689,
    location: "Main Store",
    priority: "urgent",
    estimatedDelivery: "2024-01-16",
    notes: "VIP customer - priority handling"
  },
  {
    id: "5",
    orderNumber: "SO-000005",
    customer: "Digital Innovations Co",
    customerEmail: "purchasing@digital.com",
    date: "2024-01-13T09:15:00Z",
    status: "delivered",
    paymentStatus: "paid",
    items: 6,
    subtotal: 78450,
    tax: 7845,
    total: 86295,
    location: "Warehouse",
    priority: "medium",
    estimatedDelivery: "2024-01-15",
  }
]

export function EnhancedEnterpriseSalesOrders() {
  const [orders, setOrders] = useState<SalesOrder[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState("overview")

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPayment && matchesPriority
  })

  const getStatusBadge = (status: SalesOrder["status"]) => {
    const statusConfig = {
      draft: { label: "Draft", className: "border-slate-200 bg-slate-50 text-slate-700", icon: Edit },
      confirmed: { label: "Confirmed", className: "border-teal-200 bg-teal-50 text-teal-700", icon: CheckCircle },
      processing: { label: "Processing", className: "border-cyan-200 bg-cyan-50 text-cyan-700", icon: Clock },
      shipped: { label: "Shipped", className: "border-sky-200 bg-sky-50 text-sky-700", icon: Package },
      delivered: { label: "Delivered", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: CheckCircle },
      completed: { label: "Completed", className: "border-green-200 bg-green-50 text-green-700", icon: CheckCircle },
      cancelled: { label: "Cancelled", className: "border-red-200 bg-red-50 text-red-700", icon: XCircle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (status: SalesOrder["paymentStatus"]) => {
    const statusConfig = {
      pending: { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-700" },
      partial: { label: "Partial", className: "border-orange-200 bg-orange-50 text-orange-700" },
      paid: { label: "Paid", className: "border-green-200 bg-green-50 text-green-700" },
      refunded: { label: "Refunded", className: "border-red-200 bg-red-50 text-red-700" },
    }

    const config = statusConfig[status]

    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
        <DollarSign className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: SalesOrder["priority"]) => {
    if (!priority) return null

    const priorityConfig = {
      low: { label: "Low", className: "border-blue-200 bg-blue-50 text-blue-700" },
      medium: { label: "Medium", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
      high: { label: "High", className: "border-orange-200 bg-orange-50 text-orange-700" },
      urgent: { label: "Urgent", className: "border-red-200 bg-red-50 text-red-700" },
    }

    const config = priorityConfig[priority]

    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${config.className}`}>
        <Target className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const viewOrderDetails = (order: SalesOrder) => {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const refreshData = () => {
    // Simulate refresh
    console.log('Refreshing sales orders data...')
  }

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
  const completedOrders = filteredOrders.filter((order) => order.status === "completed").length
  const pendingPayments = filteredOrders.filter((order) => order.paymentStatus === "pending").length
  const processingOrders = filteredOrders.filter((order) => order.status === "processing").length
  const avgOrderValue = totalRevenue / filteredOrders.length || 0
  const totalItems = filteredOrders.reduce((sum, order) => sum + order.items, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-teal-50/30 dark:from-slate-800/80 dark:via-slate-700/40 dark:to-slate-600/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      {/* Enhanced Header Section */}
      <div className="relative z-10 sticky top-0 backdrop-blur-xl bg-gradient-to-r from-white/60 to-slate-50/40 dark:from-slate-800/60 dark:to-slate-700/40 border-b border-slate-200/60 dark:border-slate-700/60 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg ring-4 ring-teal-500/20">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center">
                  Enterprise Sales Orders
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                    Advanced sales order management and analytics platform
                  </p>
                  <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
                    <Shield className="h-3 w-3 mr-1" />
                    Enterprise Grade
                  </Badge>
                  <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300">
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
                  placeholder="Search orders, customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-teal-50/80 backdrop-blur-sm border-teal-200/50 focus:border-teal-400 focus:ring-teal-300/30"
                />
              </div>

              <Separator orientation="vertical" className="h-8" />

              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="bg-teal-50/80 backdrop-blur-sm border-teal-200/60 hover:bg-teal-100/70 text-teal-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync
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
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>

              <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* System Status Alert */}
        <Alert className="border-teal-200 bg-gradient-to-r from-teal-50/70 to-cyan-50/70 backdrop-blur-sm">
          <Activity className="h-4 w-4 text-teal-500" />
          <AlertTitle className="text-teal-700">Sales System Status: Operational</AlertTitle>
          <AlertDescription className="text-teal-600">
            All sales processing systems are running smoothly. {filteredOrders.length} orders currently tracked.
          </AlertDescription>
        </Alert>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-teal-600">Total Orders</p>
                <p className="text-3xl font-bold text-teal-800">{filteredOrders.length}</p>
                <p className="text-xs text-teal-600 mt-1">Active orders</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50/80 to-sky-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-600">Total Revenue</p>
                <p className="text-3xl font-bold text-cyan-800">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-cyan-600 mt-1">From filtered orders</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  <Target className="h-3 w-3 mr-1" />
                  95%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600">Completed</p>
                <p className="text-3xl font-bold text-emerald-800">{completedOrders}</p>
                <p className="text-xs text-emerald-600 mt-1">Successfully completed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  <Activity className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-600">Processing</p>
                <p className="text-3xl font-bold text-amber-800">{processingOrders}</p>
                <p className="text-xs text-amber-600 mt-1">Currently processing</p>
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
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Avg
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-sky-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-sky-800">${avgOrderValue.toLocaleString()}</p>
                <p className="text-xs text-sky-600 mt-1">Per transaction</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                  <Activity className="h-3 w-3 mr-1" />
                  Total
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-600">Items Sold</p>
                <p className="text-3xl font-bold text-indigo-800">{totalItems.toLocaleString()}</p>
                <p className="text-xs text-indigo-600 mt-1">Units processed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-teal-50/80 to-cyan-50/80 backdrop-blur-md border border-teal-200/30">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-teal-800"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-teal-800"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100/70 data-[state=active]:to-sky-100/70 data-[state=active]:text-cyan-800"
            >
              <Activity className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-sky-800"
            >
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-teal-600" />
                    Order Status Distribution
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    Current status breakdown of all orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: "completed", count: completedOrders, color: "emerald" },
                      { status: "processing", count: processingOrders, color: "cyan" },
                      { status: "pending payment", count: pendingPayments, color: "amber" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/50">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">{item.status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-800">{item.count}</span>
                          <Progress value={(item.count / filteredOrders.length) * 100} className="w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-teal-600" />
                    Top Customers
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    Highest value customers this period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 3)
                      .map((order, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{order.customer}</p>
                              <p className="text-xs text-gray-600">{order.orderNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-teal-700">${order.total.toLocaleString()}</p>
                            <p className="text-xs text-gray-600">{order.items} items</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            {/* Enhanced Filters */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-white/70 border-teal-200/50">
                        <SelectValue placeholder="Order Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                      <SelectTrigger className="bg-white/70 border-teal-200/50">
                        <SelectValue placeholder="Payment Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Payments</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="bg-white/70 border-teal-200/50">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" className="bg-white/70 border-teal-200/50 hover:bg-teal-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Advanced
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Orders Table */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-teal-800">Sales Orders ({filteredOrders.length})</CardTitle>
                    <CardDescription className="text-teal-600">
                      Enterprise sales order management and tracking
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
                      Total: ${totalRevenue.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-teal-200/50 bg-white/50 backdrop-blur-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-teal-200/50 hover:bg-teal-50/50">
                        <TableHead className="text-teal-700 font-semibold">Order Details</TableHead>
                        <TableHead className="text-teal-700 font-semibold">Customer</TableHead>
                        <TableHead className="text-teal-700 font-semibold">Date & Time</TableHead>
                        <TableHead className="text-teal-700 font-semibold">Status</TableHead>
                        <TableHead className="text-teal-700 font-semibold">Payment</TableHead>
                        <TableHead className="text-teal-700 font-semibold">Priority</TableHead>
                        <TableHead className="text-teal-700 font-semibold">Total</TableHead>
                        <TableHead className="text-teal-700 font-semibold w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="border-teal-200/30 hover:bg-teal-50/60 transition-colors">
                          <TableCell>
                            <div>
                              <div className="font-medium text-teal-800">{order.orderNumber}</div>
                              <div className="text-sm text-teal-600">{order.items} items • {order.location}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-800">{order.customer}</div>
                              {order.customerEmail && (
                                <div className="text-sm text-gray-600">{order.customerEmail}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-800">
                                {new Date(order.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-600">{new Date(order.date).toLocaleTimeString()}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                          <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-bold text-teal-700">${order.total.toFixed(2)}</div>
                              <div className="text-sm text-gray-600">Tax: ${order.tax.toFixed(2)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-teal-50">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white border-teal-200">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => viewOrderDetails(order)}
                                  className="hover:bg-teal-50"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-teal-50">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Order
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-teal-50">
                                  <Download className="mr-2 h-4 w-4" />
                                  Print Receipt
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 hover:bg-red-50">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-teal-600" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Daily Average</span>
                        <span className="font-bold text-teal-700">${(totalRevenue / 7).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Growth Rate</span>
                        <span className="font-bold text-green-600">+18.5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <Target className="mr-2 h-5 w-5 text-teal-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completion Rate</span>
                        <span className="font-bold text-green-600">94.5%</span>
                      </div>
                      <Progress value={94.5} className="mt-2" />
                    </div>
                    <div className="p-4 rounded-lg bg-white/50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Success</span>
                        <span className="font-bold text-green-600">98.2%</span>
                      </div>
                      <Progress value={98.2} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-teal-800 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-teal-600" />
                  Sales Reports
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Generate comprehensive sales reports and exports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Daily Sales Summary", icon: Calendar, description: "Comprehensive daily report" },
                    { name: "Customer Analysis", icon: Users, description: "Customer behavior insights" },
                    { name: "Product Performance", icon: Package, description: "Top performing products" },
                    { name: "Financial Overview", icon: DollarSign, description: "Revenue and profit analysis" },
                    { name: "Order Fulfillment", icon: CheckCircle, description: "Order processing metrics" },
                    { name: "Payment Analytics", icon: CreditCard, description: "Payment method analysis" },
                  ].map((report, index) => (
                    <Card key={index} className="border border-teal-200/50 bg-white/50 hover:bg-white/70 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <report.icon className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                        <h3 className="font-medium text-gray-800">{report.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                        <Button size="sm" variant="outline" className="mt-3 border-teal-200 hover:bg-teal-50">
                          Generate
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Order Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-4xl bg-gradient-to-br from-teal-50/95 to-cyan-50/95 backdrop-blur-md border-teal-200">
            <DialogHeader>
              <DialogTitle className="text-teal-800 flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Order Details
              </DialogTitle>
              <DialogDescription className="text-teal-600">
                {selectedOrder && `${selectedOrder.orderNumber} - ${selectedOrder.customer}`}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-sm text-teal-700">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Number:</span>
                          <span className="font-medium">{selectedOrder.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(selectedOrder.date).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedOrder.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Items:</span>
                          <span className="font-medium">{selectedOrder.items}</span>
                        </div>
                        {selectedOrder.estimatedDelivery && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery:</span>
                            <span className="font-medium">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-sm text-teal-700">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedOrder.customer}</span>
                        </div>
                        {selectedOrder.customerEmail && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{selectedOrder.customerEmail}</span>
                          </div>
                        )}
                        {selectedOrder.notes && (
                          <div>
                            <span className="text-gray-600">Notes:</span>
                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedOrder.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-sm text-teal-700">Status & Priority</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Order Status:</span>
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment Status:</span>
                          {getPaymentBadge(selectedOrder.paymentStatus)}
                        </div>
                        {selectedOrder.priority && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Priority:</span>
                            {getPriorityBadge(selectedOrder.priority)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-sm text-teal-700">Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">${selectedOrder.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-medium">${selectedOrder.tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-teal-700">Total:</span>
                          <span className="text-teal-700">${selectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsDialogOpen(false)}
                    className="border-teal-200 hover:bg-teal-50"
                  >
                    Close
                  </Button>
                  <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white">
                    <Download className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}