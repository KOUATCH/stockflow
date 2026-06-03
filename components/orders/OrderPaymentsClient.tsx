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
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  Eye,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { OrderPaymentStatus, OrderPaymentMethod } from '@/types/orders'
import {
  ExtendedClientOrder,
  PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  formatCurrency,
  getPaymentStatusLabel,
} from '@/types/orders'

interface OrderPaymentsClientProps {
  orders: ExtendedClientOrder[]
  organizationId: string
}

export function OrderPaymentsClient({ orders, organizationId }: OrderPaymentsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<OrderPaymentStatus | 'all'>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<OrderPaymentMethod | 'all'>('all')
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)

  // Extract all payments with order information
  const allPayments = useMemo(() => {
    const payments: Array<{
      id: string
      paymentNumber: string
      amount: number
      paymentMethod: OrderPaymentMethod
      paymentDate: Date
      reference?: string
      notes?: string
      orderId: string
      orderNumber: string
      customerName: string
      orderTotal: number
      processedBy?: string
    }> = []

    orders.forEach(order => {
      if (order.payments) {
        order.payments.forEach(payment => {
          payments.push({
            id: payment.id,
            paymentNumber: payment.paymentNumber,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            paymentDate: payment.paymentDate,
            reference: payment.reference || undefined,
            notes: payment.notes || undefined,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            orderTotal: order.totalAmount,
            processedBy: payment.processedBy?.name || undefined
          })
        })
      }
    })

    return payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
  }, [orders])

  // Filter payments
  const filteredPayments = useMemo(() => {
    return allPayments.filter(payment => {
      const matchesSearch = searchTerm === '' ||
        payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMethod = paymentMethodFilter === 'all' || payment.paymentMethod === paymentMethodFilter

      const paymentDate = new Date(payment.paymentDate)
      const matchesDateRange =
        (!dateFrom || paymentDate >= dateFrom) &&
        (!dateTo || paymentDate <= dateTo)

      return matchesSearch && matchesMethod && matchesDateRange
    })
  }, [allPayments, searchTerm, paymentMethodFilter, dateFrom, dateTo])

  // Filter orders for payment status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter

      return matchesPaymentStatus
    })
  }, [orders, paymentStatusFilter])

  // Calculate payment analytics
  const paymentAnalytics = useMemo(() => {
    const totalPayments = filteredPayments.length
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)

    const methodBreakdown = filteredPayments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount
      return acc
    }, {} as Record<OrderPaymentMethod, number>)

    const ordersWithPayments = orders.filter(order => order.payments && order.payments.length > 0).length
    const totalOrderValue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalPaid = orders.reduce((sum, order) => {
      return sum + (order.payments?.reduce((paySum, payment) => paySum + payment.amount, 0) || 0)
    }, 0)
    const totalOutstanding = totalOrderValue - totalPaid

    return {
      totalPayments,
      totalAmount,
      methodBreakdown,
      ordersWithPayments,
      totalOrderValue,
      totalPaid,
      totalOutstanding
    }
  }, [filteredPayments, orders])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 shadow-lg shadow-green-500/25">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Order Payments
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all order payments and outstanding balances
            </p>
          </div>
        </div>

        {/* Payment Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                  <p className="text-3xl font-bold text-foreground">{paymentAnalytics.totalPayments}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount Collected</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(paymentAnalytics.totalPaid)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                  <p className="text-3xl font-bold text-orange-600">{formatCurrency(paymentAnalytics.totalOutstanding)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {paymentAnalytics.totalOrderValue > 0
                      ? `${Math.round((paymentAnalytics.totalPaid / paymentAnalytics.totalOrderValue) * 100)}%`
                      : '0%'
                    }
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="payments" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="outstanding">Outstanding Balances</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>
        </div>

        {/* Payment History Tab */}
        <TabsContent value="payments" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-green-600" />
                Payment Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={paymentMethodFilter} onValueChange={(value) => setPaymentMethodFilter(value as OrderPaymentMethod | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="STORE_CREDIT">Store Credit</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>

                <DatePicker
                  date={dateFrom}
                  onDateChange={setDateFrom}
                  placeholder="From date"
                  className="w-full"
                />

                <DatePicker
                  date={dateTo}
                  onDateChange={setDateTo}
                  placeholder="To date"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Payment History ({filteredPayments.length})
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Payment #</TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Processed By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono font-medium">{payment.paymentNumber}</TableCell>
                        <TableCell className="font-mono">{payment.orderNumber}</TableCell>
                        <TableCell>{payment.customerName}</TableCell>
                        <TableCell>{format(new Date(payment.paymentDate), 'MMM dd, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{payment.reference || '-'}</TableCell>
                        <TableCell>{payment.processedBy || 'System'}</TableCell>
                        <TableCell>
                          <Link href={`/dashboard/orders/${payment.orderId}/payment`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredPayments.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No payments found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or check back later for new payments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outstanding Balances Tab */}
        <TabsContent value="outstanding" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-600" />
                Balance Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={paymentStatusFilter} onValueChange={(value) => setPaymentStatusFilter(value as OrderPaymentStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="ADVANCE_PAID">Advance Paid</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                    <SelectItem value="FULLY_PAID">Fully Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Orders Table */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Outstanding Balances ({filteredOrders.filter(o => o.balanceAmount > 0).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Paid Amount</TableHead>
                      <TableHead>Balance Due</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.filter(order => order.balanceAmount > 0).map((order) => {
                      const totalPaid = order.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
                      const balance = order.totalAmount - totalPaid
                      const daysOverdue = order.expectedDate ?
                        Math.max(0, Math.floor((new Date().getTime() - new Date(order.expectedDate).getTime()) / (1000 * 60 * 60 * 24))) : 0

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{format(new Date(order.orderDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge className={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
                              {getPaymentStatusLabel(order.paymentStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(totalPaid)}</TableCell>
                          <TableCell className="font-medium text-orange-600">{formatCurrency(balance)}</TableCell>
                          <TableCell>
                            {daysOverdue > 0 ? (
                              <Badge variant="destructive">{daysOverdue} days</Badge>
                            ) : (
                              <Badge variant="secondary">Current</Badge>
                            )}
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Link href={`/dashboard/orders/${order.id}/payment`}>
                              <Button size="sm">
                                <Plus className="w-4 h-4 mr-1" />
                                Payment
                              </Button>
                            </Link>
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredOrders.filter(order => order.balanceAmount > 0).length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">All caught up!</h3>
                  <p className="text-sm text-muted-foreground">
                    No outstanding balances found for the selected filters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payment Method Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(paymentAnalytics.methodBreakdown).map(([method, amount]) => {
                  const percentage = paymentAnalytics.totalAmount > 0
                    ? Math.round((amount / paymentAnalytics.totalAmount) * 100)
                    : 0

                  return (
                    <Card key={method} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold mb-2">
                            {PAYMENT_METHOD_LABELS[method as OrderPaymentMethod]}
                          </div>
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatCurrency(amount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {percentage}% of total
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
