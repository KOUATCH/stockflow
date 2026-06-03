"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  BarChart3,
  Clock,
  DollarSign,
  Plus,
  Receipt,
  ShoppingCart,
} from 'lucide-react'
import {
  ExtendedClientOrder,
  OrderAnalytics,
  formatCurrency,
} from '@/types/orders'
import Link from 'next/link'
import { format } from 'date-fns'
import { EnhancedOrdersTable } from './EnhancedOrdersTable'

interface OrdersManagementProps {
  initialOrders: ExtendedClientOrder[]
  analytics: OrderAnalytics
  organizationId: string
}

export function OrdersManagement({ initialOrders, analytics, organizationId }: OrdersManagementProps) {
  const [orders] = useState<ExtendedClientOrder[]>(initialOrders)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-700 shadow-lg shadow-indigo-500/25">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Client Orders
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive order management with advance payments and delivery tracking
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-3xl font-bold text-foreground">{analytics.totalOrders}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                    <p className="text-3xl font-bold text-amber-600">{analytics.ordersByStatus.pending}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {formatCurrency(analytics.revenue.totalRevenue)}
                    </p>
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
                    <p className="text-sm font-medium text-muted-foreground">Balance Due</p>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(analytics.revenue.balancePayments)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <div className="flex gap-3">
              <Link href="/dashboard/orders/create">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Order
                </Button>
              </Link>
            </div>
          </div>

          <TabsContent value="orders" className="space-y-6">
            {/* Enhanced Orders Table */}
            <EnhancedOrdersTable orders={orders} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Status Distribution */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Orders by Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${{
                          pending: 'bg-yellow-500',
                          processing: 'bg-orange-500',
                          ready: 'bg-green-500',
                          delivered: 'bg-emerald-500',
                          cancelled: 'bg-red-500'
                        }[status]}`} />
                        <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Revenue Breakdown */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="font-medium">Total Revenue</span>
                    </div>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(analytics.revenue.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="font-medium">Advance Payments</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(analytics.revenue.advancePayments)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="font-medium">Balance Due</span>
                    </div>
                    <span className="font-bold text-red-600">
                      {formatCurrency(analytics.revenue.balancePayments)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}