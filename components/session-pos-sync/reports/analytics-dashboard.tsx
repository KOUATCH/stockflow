"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
} from "lucide-react"

interface AnalyticsDashboardProps {
  locationId: string
  organizationId: string
}

// Mock analytics data
const salesData = [
  { name: "Mon", sales: 2400, transactions: 24 },
  { name: "Tue", sales: 1398, transactions: 18 },
  { name: "Wed", sales: 9800, transactions: 45 },
  { name: "Thu", sales: 3908, transactions: 32 },
  { name: "Fri", sales: 4800, transactions: 38 },
  { name: "Sat", sales: 3800, transactions: 29 },
  { name: "Sun", sales: 4300, transactions: 35 },
]

const hourlyData = [
  { hour: "9AM", sales: 120 },
  { hour: "10AM", sales: 280 },
  { hour: "11AM", sales: 450 },
  { hour: "12PM", sales: 680 },
  { hour: "1PM", sales: 520 },
  { hour: "2PM", sales: 380 },
  { hour: "3PM", sales: 420 },
  { hour: "4PM", sales: 580 },
  { hour: "5PM", sales: 720 },
  { hour: "6PM", sales: 450 },
]

const categoryData = [
  { name: "Electronics", value: 35, color: "#3B82F6" },
  { name: "Clothing", value: 25, color: "#10B981" },
  { name: "Food & Beverages", value: 20, color: "#F59E0B" },
  { name: "Books", value: 12, color: "#8B5CF6" },
  { name: "Other", value: 8, color: "#6B7280" },
]

const topProducts = [
  { name: "Wireless Headphones", sales: 45, revenue: 8995.55 },
  { name: "Coffee Mug", name: "Coffee Mug", sales: 38, revenue: 493.62 },
  { name: "T-Shirt", sales: 32, revenue: 799.68 },
  { name: "Smartphone Case", sales: 28, revenue: 839.72 },
  { name: "Energy Drink", sales: 25, revenue: 99.75 },
]

export function AnalyticsDashboard({ locationId, organizationId }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("sales")

  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0)
  const totalTransactions = salesData.reduce((sum, day) => sum + day.transactions, 0)
  const avgTransaction = totalSales / totalTransactions
  const previousWeekSales = 25847.32 // Mock previous week data
  const salesGrowth = ((totalSales - previousWeekSales) / previousWeekSales) * 100

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "#3B82F6",
    },
    transactions: {
      label: "Transactions",
      color: "#10B981",
    },
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
          <p className="text-gray-600">Performance insights and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-900">${totalSales.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2">
                  {salesGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${salesGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {salesGrowth >= 0 ? "+" : ""}
                    {salesGrowth.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-600">vs last week</span>
                </div>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Transactions</p>
                <p className="text-2xl font-bold text-green-900">{totalTransactions}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">+8.2%</span>
                  <span className="text-sm text-gray-600">vs last week</span>
                </div>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <ShoppingCart className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Transaction</p>
                <p className="text-2xl font-bold text-purple-900">${avgTransaction.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">+12.5%</span>
                  <span className="text-sm text-gray-600">vs last week</span>
                </div>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Users className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Items Sold</p>
                <p className="text-2xl font-bold text-orange-900">1,247</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">+15.3%</span>
                  <span className="text-sm text-gray-600">vs last week</span>
                </div>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Package className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="sales-trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales-trend">Sales Trend</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>

        <TabsContent value="sales-trend">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Daily Sales Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {salesData.map((day, index) => (
                    <div key={day.name} className="text-center">
                      <div className="text-sm font-medium text-gray-600 mb-2">{day.name}</div>
                      <div
                        className="bg-blue-500 rounded-t mx-auto mb-2"
                        style={{
                          height: `${(day.sales / Math.max(...salesData.map((d) => d.sales))) * 120}px`,
                          width: "24px",
                        }}
                      />
                      <div className="text-xs text-gray-500">${day.sales.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{day.transactions} txn</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hourlyData.map((hour) => (
                  <div key={hour.hour} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-gray-600">{hour.hour}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${(hour.sales / Math.max(...hourlyData.map((h) => h.sales))) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm font-medium text-right">${hour.sales}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-gray-600">{category.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${category.value}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{category.value}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${product.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
