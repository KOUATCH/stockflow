"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  DollarSign,
  Package,
  Receipt,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { OrderAnalytics, formatCurrency } from '@/types/orders'

interface OrderAnalyticsDashboardProps {
  analytics: OrderAnalytics
  organizationId: string
}

export function OrderAnalyticsDashboard({ analytics }: OrderAnalyticsDashboardProps) {
  const statusCards = [
    {
      title: "Pending Orders",
      value: analytics.ordersByStatus.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    },
    {
      title: "Processing",
      value: analytics.ordersByStatus.processing,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Ready for Pickup",
      value: analytics.ordersByStatus.ready,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Delivered",
      value: analytics.ordersByStatus.delivered,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20"
    },
    {
      title: "Cancelled",
      value: analytics.ordersByStatus.cancelled,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-700 shadow-lg shadow-indigo-500/25">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Order Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into your order management system
            </p>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">{analytics.totalOrders}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Receipt className="w-6 h-6 text-white" />
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
                <p className="text-sm font-medium text-muted-foreground">Advance Payments</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(analytics.revenue.advancePayments)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
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

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Orders by Status
            </CardTitle>
            <CardDescription>Distribution of orders across different statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusCards.map((item) => (
              <div key={item.title} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="font-medium">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{item.value}</span>
                  <span className="text-sm text-muted-foreground">
                    ({analytics.totalOrders > 0 ? Math.round((item.value / analytics.totalOrders) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Revenue Breakdown
            </CardTitle>
            <CardDescription>Financial overview of order payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-500" />
                  <span className="font-medium">Total Revenue</span>
                </div>
                <span className="text-xl font-bold text-emerald-600">
                  {formatCurrency(analytics.revenue.totalRevenue)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <span className="font-medium">Advance Payments</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(analytics.revenue.advancePayments)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analytics.revenue.totalRevenue > 0
                      ? Math.round((analytics.revenue.advancePayments / analytics.revenue.totalRevenue) * 100)
                      : 0
                    }% of total
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="font-medium">Balance Due</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(analytics.revenue.balancePayments)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analytics.revenue.totalRevenue > 0
                      ? Math.round((analytics.revenue.balancePayments / analytics.revenue.totalRevenue) * 100)
                      : 0
                    }% remaining
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Payment Collection Progress</span>
                <span>
                  {analytics.revenue.totalRevenue > 0
                    ? Math.round(((analytics.revenue.totalRevenue - analytics.revenue.balancePayments) / analytics.revenue.totalRevenue) * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: analytics.revenue.totalRevenue > 0
                      ? `${((analytics.revenue.totalRevenue - analytics.revenue.balancePayments) / analytics.revenue.totalRevenue) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Key Performance Indicators
          </CardTitle>
          <CardDescription>Important metrics for your order management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg border bg-muted/30">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {analytics.ordersByStatus.delivered}
              </div>
              <div className="text-sm text-muted-foreground">Completed Orders</div>
            </div>

            <div className="text-center p-4 rounded-lg border bg-muted/30">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {analytics.ordersByStatus.pending + analytics.ordersByStatus.processing}
              </div>
              <div className="text-sm text-muted-foreground">Active Orders</div>
            </div>

            <div className="text-center p-4 rounded-lg border bg-muted/30">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {analytics.totalOrders > 0
                  ? Math.round((analytics.ordersByStatus.delivered / analytics.totalOrders) * 100)
                  : 0
                }%
              </div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>

            <div className="text-center p-4 rounded-lg border bg-muted/30">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {analytics.ordersByStatus.cancelled}
              </div>
              <div className="text-sm text-muted-foreground">Cancelled Orders</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}