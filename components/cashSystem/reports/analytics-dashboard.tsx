"use client"

import { useEffect, useState } from "react"
// import { getDashboardSummary, getSalesAnalytics } from "@/actions/reports/analytics-actions"
import { getDashboardSummary, getSalesAnalytics } from "@/actions/cashSystem/reports/analytics-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, subDays } from "date-fns"
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Download,
  Package,
  RefreshCw,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface DashboardSummary {
  today: {
    sales: number
    transactions: number
    averageTransaction: number
    salesChange: number
    transactionsChange: number
  }
  week: {
    sales: number
    transactions: number
    averageTransaction: number
  }
  month: {
    sales: number
    transactions: number
    averageTransaction: number
  }
  activeSessions: number
  lowStockItems: number
  topSellingItems: {
    itemName: string
    quantitySold: number
    totalRevenue: number
  }[]
}

interface AnalyticsDashboardProps {
  locationId: string
  organizationId: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"]

export function AnalyticsDashboard({ locationId, organizationId }: AnalyticsDashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [salesData, setSalesData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState(7) // Days

  const loadDashboardData = async () => {
    if (!organizationId || !locationId) return

    try {
      setIsLoading(true)
      const [summaryData, analyticsData] = await Promise.all([
        getDashboardSummary(organizationId, locationId),
        getSalesAnalytics(organizationId, locationId, subDays(new Date(), dateRange), new Date()),
      ])

      setSummary(summaryData)
      setSalesData(analyticsData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
    // Auto-refresh every 2 minutes for real-time updates
    const interval = setInterval(loadDashboardData, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [organizationId, locationId, dateRange])

  const exportData = () => {
    if (!salesData || !summary) return

    const exportData = {
      summary,
      salesData,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-report-${format(new Date(), "yyyy-MM-dd")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {format(lastUpdated, "MMM dd, yyyy HH:mm")} • Auto-refresh every 2 minutes
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Today's Sales</p>
                <p className="text-2xl font-bold">${summary.today.sales.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {summary.today.salesChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-medium ${summary.today.salesChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {summary.today.salesChange >= 0 ? "+" : ""}${Math.abs(summary.today.salesChange).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">vs yesterday</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{summary.today.transactions}</p>
                <div className="flex items-center gap-1 mt-1">
                  {summary.today.transactionsChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-medium ${summary.today.transactionsChange >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {summary.today.transactionsChange >= 0 ? "+" : ""}
                    {summary.today.transactionsChange}
                  </span>
                  <span className="text-xs text-muted-foreground">vs yesterday</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-violet-100">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Avg Transaction</p>
                <p className="text-2xl font-bold">${summary.today.averageTransaction.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Week: ${summary.week.averageTransaction.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden ${summary.lowStockItems > 0 ? "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50" : ""}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${summary.lowStockItems > 0 ? "bg-gradient-to-r from-orange-100 to-red-100" : "bg-gradient-to-r from-gray-100 to-slate-100"}`}
              >
                <AlertTriangle
                  className={`h-6 w-6 ${summary.lowStockItems > 0 ? "text-orange-600" : "text-gray-600"}`}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">{summary.lowStockItems}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.lowStockItems > 0 ? "Need attention" : "All good"}
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts and Analytics */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Enhanced Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Trend ({dateRange} days)
                </CardTitle>
                <CardDescription>Daily sales performance with trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData?.salesByDay || []}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), "MMM dd")} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), "MMM dd, yyyy")}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Sales"]}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#salesGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Enhanced Hourly Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Hourly Performance
                </CardTitle>
                <CardDescription>Peak hours and transaction patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData?.salesByHour || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "sales" ? `$${value.toFixed(2)}` : value,
                        name === "sales" ? "Sales" : "Transactions",
                      ]}
                    />
                    <Bar dataKey="sales" fill="#8884d8" name="sales" />
                    <Bar dataKey="transactions" fill="#82ca9d" name="transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Top Performing Items
              </CardTitle>
              <CardDescription>Best selling products with detailed metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {summary.topSellingItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-full font-bold text-sm ${index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-balance">{item.itemName}</p>
                          <p className="text-sm text-muted-foreground">{item.quantitySold} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${item.totalRevenue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          ${(item.totalRevenue / item.quantitySold).toFixed(2)} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Detailed product analytics coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Product performance analytics will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Methods Analysis
              </CardTitle>
              <CardDescription>Payment method distribution and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesData?.paymentMethods || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percentage }) => `${method.replace("_", " ")} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {(salesData?.paymentMethods || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {(salesData?.paymentMethods || []).map((method: any, index: number) => (
                    <div key={method.method} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium capitalize">{method.method.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${method.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{method.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>Key performance indicators and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Sales Growth</span>
                    <span className={`font-bold ${summary.today.salesChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {summary.today.salesChange >= 0 ? "+" : ""}
                      {((summary.today.salesChange / (summary.today.sales - summary.today.salesChange)) * 100).toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Transaction Growth</span>
                    <span
                      className={`font-bold ${summary.today.transactionsChange >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {summary.today.transactionsChange >= 0 ? "+" : ""}
                      {summary.today.transactionsChange}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Active Sessions</span>
                    <span className="font-bold text-blue-600">{summary.activeSessions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Package className="h-4 w-4 mr-2" />
                    View Low Stock Items ({summary.lowStockItems})
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Active Sessions ({summary.activeSessions})
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Full Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
