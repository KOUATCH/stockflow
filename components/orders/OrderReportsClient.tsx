"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DatePicker } from '@/components/ui/date-picker'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import {
  Calendar,
  Download,
  FileText,
  Filter,
  Printer,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  CreditCard,
  Truck,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { OrderStatus, OrderPaymentStatus } from '@/types/orders'
import {
  ExtendedClientOrder,
  OrderAnalytics,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  formatCurrency,
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from '@/types/orders'

interface OrderReportsClientProps {
  orders: ExtendedClientOrder[]
  analytics: OrderAnalytics
  organizationId: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

export function OrderReportsClient({ orders, analytics, organizationId }: OrderReportsClientProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()))
  const [dateToRange, setDateToRange] = useState<Date | undefined>(endOfMonth(new Date()))
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<OrderPaymentStatus | 'all'>('all')

  // Filter orders based on date range and filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate)
      const matchesDate =
        (!dateFrom || orderDate >= dateFrom) &&
        (!dateToRange || orderDate <= dateToRange)

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter

      return matchesDate && matchesStatus && matchesPayment
    })
  }, [orders, dateFrom, dateToRange, statusFilter, paymentFilter])

  // Calculate filtered analytics
  const filteredAnalytics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalPaid = filteredOrders.reduce((sum, order) => {
      return sum + (order.payments?.reduce((paySum, payment) => paySum + payment.amount, 0) || 0)
    }, 0)
    const balanceDue = totalRevenue - totalPaid

    const statusCounts = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<OrderStatus, number>)

    const paymentStatusCounts = filteredOrders.reduce((acc, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1
      return acc
    }, {} as Record<OrderPaymentStatus, number>)

    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      totalPaid,
      balanceDue,
      statusCounts,
      paymentStatusCounts,
    }
  }, [filteredOrders])

  // Prepare chart data
  const statusChartData = Object.entries(filteredAnalytics.statusCounts).map(([status, count]) => ({
    name: getOrderStatusLabel(status as OrderStatus),
    value: count,
    color: ORDER_STATUS_COLORS[status as OrderStatus]?.split(' ')[0] || '#8884d8'
  }))

  const paymentStatusChartData = Object.entries(filteredAnalytics.paymentStatusCounts).map(([status, count]) => ({
    name: getPaymentStatusLabel(status as OrderPaymentStatus),
    value: count,
    color: PAYMENT_STATUS_COLORS[status as OrderPaymentStatus]?.split(' ')[0] || '#82ca9d'
  }))

  // Daily revenue trend (last 30 days)
  const dailyRevenueData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      return {
        date: format(date, 'MM/dd'),
        revenue: 0,
        orders: 0
      }
    })

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.orderDate)
      const dayIndex = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))

      if (dayIndex >= 0 && dayIndex < 30) {
        const dataIndex = 29 - dayIndex
        if (dataIndex >= 0) {
          last30Days[dataIndex].revenue += order.totalAmount
          last30Days[dataIndex].orders += 1
        }
      }
    })

    return last30Days
  }, [filteredOrders])

  // Top customers by order value
  const topCustomers = useMemo(() => {
    const customerTotals = filteredOrders.reduce((acc, order) => {
      const key = order.customerName
      if (!acc[key]) {
        acc[key] = {
          name: key,
          totalValue: 0,
          orderCount: 0,
          email: order.customerEmail || ''
        }
      }
      acc[key].totalValue += order.totalAmount
      acc[key].orderCount += 1
      return acc
    }, {} as Record<string, { name: string; totalValue: number; orderCount: number; email: string }>)

    return Object.values(customerTotals)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)
  }, [filteredOrders])

  const generatePDFReport = () => {
    // Implement PDF generation logic here
    console.log('Generating PDF report...')
  }

  const generateExcelReport = () => {
    // Implement Excel generation logic here
    console.log('Generating Excel report...')
  }

  const presetDateRanges = [
    { label: 'Last 7 days', from: subDays(new Date(), 7), to: new Date() },
    { label: 'Last 30 days', from: subDays(new Date(), 30), to: new Date() },
    { label: 'This month', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    { label: 'This week', from: startOfWeek(new Date()), to: endOfWeek(new Date()) },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-700 shadow-lg shadow-indigo-500/25">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Order Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights and analytics for your order management
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <DatePicker
                date={dateFrom}
                onDateChange={setDateFrom}
                placeholder="From date"
                className="w-full"
              />

              <DatePicker
                date={dateToRange}
                onDateChange={setDateToRange}
                placeholder="To date"
                className="w-full"
              />

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={OrderStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                  <SelectItem value={OrderStatus.READY_FOR_PICKUP}>Ready for Pickup</SelectItem>
                  <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                  <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as OrderPaymentStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Status</SelectItem>
                  <SelectItem value={OrderPaymentStatus.UNPAID}>Unpaid</SelectItem>
                  <SelectItem value={OrderPaymentStatus.PARTIALLY_PAID}>Partially Paid</SelectItem>
                  <SelectItem value={OrderPaymentStatus.FULLY_PAID}>Fully Paid</SelectItem>
                </SelectContent>
              </Select>

              <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 flex gap-2">
                <Button onClick={generatePDFReport} variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={generateExcelReport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>

            {/* Quick date presets */}
            <div className="flex gap-2 mt-4">
              {presetDateRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFrom(preset.from)
                    setDateToRange(preset.to)
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">{filteredAnalytics.totalOrders}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(filteredAnalytics.totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(filteredAnalytics.totalPaid)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Balance Due</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(filteredAnalytics.balanceDue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-indigo-600" />
                  Orders by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Payment Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentStatusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="value"
                    >
                      {paymentStatusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Daily Revenue Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name]} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Order Volume by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Top Customers by Order Value
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Avg Order Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((customer, index) => (
                      <TableRow key={customer.name}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>{customer.orderCount}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(customer.totalValue)}</TableCell>
                        <TableCell>{formatCurrency(customer.totalValue / customer.orderCount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Tab */}
        <TabsContent value="detailed" className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Detailed Order Report ({filteredOrders.length} orders)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.slice(0, 100).map((order) => {
                      const totalPaid = order.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
                      const balance = order.totalAmount - totalPaid

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono">{order.orderNumber}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{format(new Date(order.orderDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge className={ORDER_STATUS_COLORS[order.status]}>
                              {getOrderStatusLabel(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
                              {getPaymentStatusLabel(order.paymentStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(totalPaid)}</TableCell>
                          <TableCell className={balance > 0 ? "text-red-600" : "text-green-600"}>
                            {formatCurrency(balance)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {filteredOrders.length > 100 && (
                <div className="p-4 text-center text-muted-foreground">
                  Showing first 100 orders. Export to see all {filteredOrders.length} orders.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
