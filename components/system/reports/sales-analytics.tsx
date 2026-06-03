"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Download, Target, Award, BarChart3 } from "lucide-react"

const salesData = [
  { date: "2024-01-01", revenue: 12500, orders: 45, customers: 38 },
  { date: "2024-01-02", revenue: 15200, orders: 52, customers: 44 },
  { date: "2024-01-03", revenue: 18900, orders: 67, customers: 58 },
  { date: "2024-01-04", revenue: 14300, orders: 48, customers: 41 },
  { date: "2024-01-05", revenue: 21800, orders: 78, customers: 65 },
  { date: "2024-01-06", revenue: 19600, orders: 71, customers: 59 },
  { date: "2024-01-07", revenue: 16400, orders: 55, customers: 47 },
  { date: "2024-01-08", revenue: 23100, orders: 82, customers: 71 },
  { date: "2024-01-09", revenue: 20500, orders: 73, customers: 62 },
  { date: "2024-01-10", revenue: 17800, orders: 61, customers: 53 },
  { date: "2024-01-11", revenue: 25400, orders: 89, customers: 76 },
  { date: "2024-01-12", revenue: 22700, orders: 81, customers: 68 },
  { date: "2024-01-13", revenue: 19200, orders: 68, customers: 57 },
  { date: "2024-01-14", revenue: 26800, orders: 95, customers: 82 },
  { date: "2024-01-15", revenue: 24300, orders: 87, customers: 74 },
]

const categoryData = [
  { name: "Smartphones", value: 45, revenue: 125000, color: "hsl(var(--chart-1))" },
  { name: "Laptops", value: 25, revenue: 89000, color: "hsl(var(--chart-2))" },
  { name: "Audio", value: 15, revenue: 34000, color: "hsl(var(--chart-3))" },
  { name: "Accessories", value: 10, revenue: 18000, color: "hsl(var(--chart-4))" },
  { name: "Tablets", value: 5, revenue: 12000, color: "hsl(var(--chart-5))" },
]

const topProducts = [
  { name: "iPhone 15 Pro", sales: 245, revenue: 269455, growth: 12.5 },
  { name: "MacBook Air M3", sales: 89, revenue: 124411, growth: 8.3 },
  { name: "Samsung Galaxy S24", sales: 156, revenue: 124644, growth: -2.1 },
  { name: "AirPods Pro", sales: 312, revenue: 77688, growth: 15.7 },
  { name: "iPad Air", sales: 67, revenue: 40133, growth: 5.2 },
]

const paymentMethodData = [
  { method: "Credit Card", amount: 156780, percentage: 52.3, transactions: 1245 },
  { method: "Cash", amount: 89450, percentage: 29.8, transactions: 892 },
  { method: "Digital Wallet", amount: 53670, percentage: 17.9, transactions: 567 },
]

export function SalesAnalytics() {
  const [dateRange, setDateRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("revenue")
  const [activeTab, setActiveTab] = useState("overview")

  // Debug function to test tab switching
  const handleTabChange = (value: string) => {
    console.log("Tab clicked:", value, "Current tab:", activeTab)
    setActiveTab(value)
    console.log("Tab should now be:", value)
  }

  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0)
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0)
  const totalCustomers = salesData.reduce((sum, day) => sum + day.customers, 0)
  const avgOrderValue = totalRevenue / totalOrders

  const revenueGrowth = 12.5
  const ordersGrowth = 8.3
  const customersGrowth = 15.2

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-teal-50/30 dark:from-slate-800/80 dark:via-slate-700/40 dark:to-slate-600/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      {/* Enhanced Header Section */}
      <div className="relative z-10 sticky top-0 backdrop-blur-xl bg-gradient-to-r from-white/60 to-slate-50/40 dark:from-slate-800/60 dark:to-slate-700/40 border-b border-slate-200/60 dark:border-slate-700/60 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg ring-4 ring-teal-500/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Sales Analytics</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">Comprehensive sales performance and business insights</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-8 space-y-8">

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200/40 dark:border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                Total Revenue
              </p>
              <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-emerald-600" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">+{revenueGrowth}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200/40 dark:border-blue-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
              <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                Total Orders
              </p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{totalOrders.toLocaleString()}</p>
            </div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-blue-600" />
              <span className="text-blue-700 dark:text-blue-400 font-semibold">+{ordersGrowth}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-teal-200/40 dark:border-teal-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 dark:bg-teal-400/10">
              <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                Unique Customers
              </p>
              <p className="text-xl font-bold text-teal-900 dark:text-teal-100">{totalCustomers.toLocaleString()}</p>
            </div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-teal-600" />
              <span className="text-teal-700 dark:text-teal-400 font-semibold">+{customersGrowth}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200/40 dark:border-amber-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-400/10">
              <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Avg Order Value
              </p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-100">${avgOrderValue.toFixed(2)}</p>
            </div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-amber-600" />
              <span className="text-amber-700 dark:text-amber-400 font-semibold">+3.2%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid w-full grid-cols-4 bg-slate-100/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-xl h-14 p-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTabChange("overview")
            }}
            className={`h-full px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTabChange("products")
            }}
            className={`h-full px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200 ${
              activeTab === "products"
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
            }`}
          >
            Products
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTabChange("customers")
            }}
            className={`h-full px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200 ${
              activeTab === "customers"
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
            }`}
          >
            Customers
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTabChange("payments")
            }}
            className={`h-full px-4 py-2 rounded-lg font-medium cursor-pointer transition-all duration-200 ${
              activeTab === "payments"
                ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
            }`}
          >
            Payments
          </button>
        </div>

        {/* Debug indicator - remove after testing */}
        <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded border">
          <span className="text-sm font-mono">Current active tab: {activeTab}</span>
        </div>

        {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Revenue Trend */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Trend</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Daily revenue over the selected period</p>
                  </div>
                </div>
              </div>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Orders vs Customers */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Orders vs Customers</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Daily orders and unique customers</p>
                  </div>
                </div>
              </div>
              <ChartContainer
                config={{
                  orders: {
                    label: "Orders",
                    color: "hsl(var(--chart-2))",
                  },
                  customers: {
                    label: "Customers",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-2))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="customers"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-3))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30">
                  <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Performance</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Sales distribution by product category</p>
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    value: {
                      label: "Sales %",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
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
                              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-slate-900 dark:text-white">{data.name}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {data.value}% • ${data.revenue.toLocaleString()}
                                </p>
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
              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/60 dark:bg-slate-700/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-700/80 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{category.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">${category.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-900 dark:text-white">{category.value}%</div>
                      <Progress value={category.value} className="w-16 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === "products" && (
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30">
                  <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">Top Performing Products</span>
              </div>
              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                {topProducts.length} products
              </Badge>
            </div>

            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{product.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{product.sales} units sold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700 dark:text-emerald-400">${product.revenue.toLocaleString()}</div>
                      <div className="flex items-center text-sm">
                        {product.growth > 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-emerald-600" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                        )}
                        <span className={product.growth > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                          {product.growth > 0 ? "+" : ""}
                          {product.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-teal-200/40 dark:border-teal-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10 dark:bg-teal-400/10">
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                    New Customers
                  </p>
                  <p className="text-xl font-bold text-teal-900 dark:text-teal-100">127</p>
                  <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">+23% from last period</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200/40 dark:border-blue-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
                  <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    Returning Customers
                  </p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">68%</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Customer retention rate</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200/40 dark:border-emerald-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Customer LTV
                  </p>
                  <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">$1,247</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Average lifetime value</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-base font-bold text-slate-900 dark:text-white">Payment Methods</span>
              </div>
              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">
                {paymentMethodData.length} methods
              </Badge>
            </div>

            <div className="space-y-4">
              {paymentMethodData.map((method, index) => (
                <div key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/10 dark:to-teal-400/10 flex items-center justify-center border border-emerald-200/40 dark:border-emerald-800/40">
                        <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{method.method}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{method.transactions} transactions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700 dark:text-emerald-400">${method.amount.toLocaleString()}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{method.percentage}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
      </div>
    </div>
  )
}
