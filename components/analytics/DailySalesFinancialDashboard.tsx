"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DataTable } from "@/components/ui/data-table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar as CalendarIcon,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  Zap,
  AlertCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getDailySalesFinancialAnalytics, DailySalesFinancialReport, ItemFinancialMetrics } from "@/actions/analytics/daily-sales-financial-analytics"

interface DailySalesFinancialDashboardProps {
  organizationId: string
  locationId?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const formatPercentage = (value: number) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

const TrendIcon = ({ value, showNeutral = true }: { value: number; showNeutral?: boolean }) => {
  if (value > 0) return <TrendingUp className="h-4 w-4 text-emerald-600" />
  if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
  return showNeutral ? <Minus className="h-4 w-4 text-gray-500" /> : null
}

const MetricCard = ({
  title,
  value,
  change,
  prefix = "",
  suffix = "",
  trend,
  target,
  icon: Icon
}: {
  title: string
  value: number | string
  change?: number
  prefix?: string
  suffix?: string
  trend?: "up" | "down" | "stable"
  target?: number
  icon?: any
}) => (
  <Card className="transition-all duration-200 hover:shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              <TrendIcon value={change} />
              <span className={cn(
                "text-xs font-medium",
                change > 0 ? "text-emerald-600" : change < 0 ? "text-red-600" : "text-gray-500"
              )}>
                {formatPercentage(change)}
              </span>
              <span className="text-xs text-muted-foreground">vs yesterday</span>
            </div>
          )}
          {target && (
            <Progress value={(Number(value) / target) * 100} className="h-1.5 mt-2" />
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary/10 rounded-xl">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

const AlertCard = ({ alerts }: { alerts: any[] }) => (
  <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        Financial Alerts
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          No critical alerts
        </div>
      ) : (
        alerts.map((alert, index) => (
          <Alert key={index} className={cn(
            "border-l-4",
            alert.type === "critical" ? "border-l-red-500 bg-red-50" :
            alert.type === "warning" ? "border-l-amber-500 bg-amber-50" :
            "border-l-blue-500 bg-blue-50"
          )}>
            <div className="flex items-start gap-2">
              {alert.type === "critical" ? <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" /> :
               alert.type === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" /> :
               <Info className="h-4 w-4 text-blue-500 mt-0.5" />}
              <div className="space-y-1">
                <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                <AlertDescription className="text-xs">{alert.message}</AlertDescription>
                {alert.recommendation && (
                  <p className="text-xs font-medium text-gray-700">
                    💡 {alert.recommendation}
                  </p>
                )}
              </div>
            </div>
          </Alert>
        ))
      )}
    </CardContent>
  </Card>
)

const InsightsCard = ({ insights }: { insights: any[] }) => (
  <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center gap-2">
        <Zap className="h-5 w-5 text-blue-500" />
        Business Insights
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {insights.map((insight, index) => (
        <div key={index} className={cn(
          "p-4 rounded-lg border-l-4",
          insight.type === "opportunity" ? "border-l-blue-500 bg-blue-50" :
          insight.type === "risk" ? "border-l-red-500 bg-red-50" :
          "border-l-emerald-500 bg-emerald-50"
        )}>
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-sm">{insight.title}</h4>
            <Badge variant={insight.priority === "high" ? "destructive" :
                          insight.priority === "medium" ? "default" : "secondary"}>
              {insight.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
          <div className="space-y-1">
            {insight.actionItems.map((action: string, actionIndex: number) => (
              <div key={actionIndex} className="flex items-start gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-current rounded-full mt-1.5 opacity-60" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)

const ItemPerformanceTable = ({ items, title }: { items: ItemFinancialMetrics[]; title: string }) => {
  const columns = [
    {
      header: "Rank",
      cell: ({ row }: any) => (
        <div className="font-medium text-center">#{row.original.performance.ranking}</div>
      )
    },
    {
      header: "Item",
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.sku}</div>
          <Badge variant="outline" className="text-xs mt-1">{row.original.category}</Badge>
        </div>
      )
    },
    {
      header: "Revenue",
      cell: ({ row }: any) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(row.original.grossRevenue)}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.revenueShare}% share
          </div>
        </div>
      )
    },
    {
      header: "Profit",
      cell: ({ row }: any) => (
        <div className="text-right">
          <div className={cn(
            "font-medium",
            row.original.grossProfit > 0 ? "text-emerald-600" : "text-red-600"
          )}>
            {formatCurrency(row.original.grossProfit)}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.grossMargin.toFixed(1)}% margin
          </div>
        </div>
      )
    },
    {
      header: "Volume",
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.original.quantitySold}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.transactionCount} txns
          </div>
        </div>
      )
    },
    {
      header: "Performance",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <TrendIcon value={row.original.performance.growth} />
          <span className={cn(
            "text-xs font-medium",
            row.original.performance.growth > 0 ? "text-emerald-600" :
            row.original.performance.growth < 0 ? "text-red-600" : "text-gray-500"
          )}>
            {formatPercentage(row.original.performance.growth)}
          </span>
        </div>
      )
    }
  ]

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {columns.map((column, index) => (
                  <th key={index} className="text-left text-sm font-medium text-muted-foreground pb-3">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 10).map((item, index) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="py-3">
                      {column.cell({ row: { original: item } })}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DailySalesFinancialDashboard({
  organizationId,
  locationId = "all"
}: DailySalesFinancialDashboardProps) {
  const [reportData, setReportData] = useState<DailySalesFinancialReport | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState<"overview" | "items" | "analytics">("overview")
  const [currentTime, setCurrentTime] = useState(new Date())

  const loadData = async () => {
    setIsLoading(true)
    try {
      console.log("🔄 Loading financial analytics...", { organizationId, locationId, selectedDate })
      const data = await getDailySalesFinancialAnalytics(organizationId, locationId, selectedDate)
      console.log("✅ Financial analytics loaded successfully")
      setReportData(data)
    } catch (error) {
      console.error("❌ Failed to load financial analytics:", error)
      // Set a fallback error state
      setReportData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [organizationId, locationId, selectedDate])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!reportData && !isLoading) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center space-y-4">
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-red-900">Unable to Load Financial Analytics</p>
            <p className="text-sm text-red-700">
              There was an issue connecting to the database or processing your sales data.
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={loadData} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
            <div className="text-xs text-red-600">
              If this issue persists, please contact technical support
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { globalAnalytics, itemAnalytics, summary, comparisons } =
    reportData ?? ({} as DailySalesFinancialReport)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50/60 to-sky-100/80">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-gradient-to-r from-cyan-100/90 via-teal-50/90 to-sky-100/90 border-b border-teal-200/30 shadow-lg">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-700 bg-clip-text text-transparent">
                  Daily Sales Financial Analytics
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-teal-700/80">
                    Comprehensive financial analysis for {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                  <Badge variant="outline" className="text-xs border-teal-200 bg-teal-50/70 text-teal-700">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentTime.toLocaleTimeString()}
                  </Badge>
                  {reportData && (
                    <Badge variant="outline" className="text-xs border-cyan-200 bg-cyan-50/70 text-cyan-700">
                      <Activity className="h-3 w-3 mr-1" />
                      {reportData.itemAnalytics.length} items analyzed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-teal-50/80 backdrop-blur-sm border-teal-200/50 focus:border-teal-400 text-teal-700">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                onClick={loadData}
                variant="outline"
                disabled={isLoading}
                className="bg-cyan-50/80 backdrop-blur-sm border-cyan-200/50 hover:bg-cyan-100/70 text-cyan-700"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                variant="outline"
                className="bg-sky-50/80 backdrop-blur-sm border-sky-200/50 hover:bg-sky-100/70 text-sky-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch('/dashboard/sales/financial-analytics/test-db')
                      const result = await response.json()
                      console.log('🧪 Database test results:', result)
                      alert('Check browser console for database test results')
                    } catch (error) {
                      console.error('Database test failed:', error)
                    }
                  }}
                  className="text-xs bg-teal-50/80 backdrop-blur-sm border-teal-200/50 text-teal-700"
                >
                  Test DB
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading financial analytics...</p>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {reportData && !isLoading && (
        <>
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={globalAnalytics.overview.totalRevenue}
              change={comparisons.previousDay.revenueChange}
              prefix="$"
              target={10000}
              icon={DollarSign}
            />
            <MetricCard
              title="Gross Profit"
              value={globalAnalytics.overview.grossProfit}
              change={comparisons.previousDay.profitChange}
              prefix="$"
              icon={TrendingUp}
            />
            <MetricCard
              title="Profit Margin"
              value={globalAnalytics.overview.grossMargin}
              suffix="%"
              icon={Target}
            />
            <MetricCard
              title="Items Sold"
              value={itemAnalytics.reduce((sum, item) => sum + item.quantitySold, 0)}
              change={comparisons.previousDay.volumeChange}
              icon={Package}
            />
          </div>

          {/* Financial Health Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Financial Health Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Profitability Index</span>
                      <span className="font-medium">{(globalAnalytics.financialHealth.profitabilityIndex * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={globalAnalytics.financialHealth.profitabilityIndex * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Operating Efficiency</span>
                      <span className="font-medium">{(globalAnalytics.financialHealth.operatingEfficiency * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={globalAnalytics.financialHealth.operatingEfficiency * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Revenue Quality</span>
                      <span className="font-medium">{(globalAnalytics.financialHealth.revenueQuality * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={globalAnalytics.financialHealth.revenueQuality * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Growth Sustainability</span>
                      <span className="font-medium">{(globalAnalytics.financialHealth.growthSustainability * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={globalAnalytics.financialHealth.growthSustainability * 100} className="h-2" />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Risk Level</span>
                    <Badge variant={
                      globalAnalytics.financialHealth.riskIndicator === "low" ? "default" :
                      globalAnalytics.financialHealth.riskIndicator === "medium" ? "secondary" : "destructive"
                    }>
                      {globalAnalytics.financialHealth.riskIndicator.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <AlertCard alerts={globalAnalytics.alerts} />
            </div>
          </div>

          {/* Charts and Analysis */}
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Item Analysis</TabsTrigger>
              <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Revenue and Profit Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Hourly Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={globalAnalytics.trends.revenueByHour}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value, name) => [formatCurrency(Number(value)), name]}
                          labelFormatter={(label) => `${label}:00`}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stackId="1"
                          stroke="#0088FE"
                          fill="#0088FE"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="profit"
                          stackId="2"
                          stroke="#00C49F"
                          fill="#00C49F"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Category Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={globalAnalytics.trends.categoryPerformance}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                          dataKey="category"
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                        <Bar dataKey="revenue" fill="#0088FE" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-emerald-700">Profitable Items</p>
                        <p className="text-2xl font-bold text-emerald-900">
                          {globalAnalytics.performance.profitableItems}
                        </p>
                        <p className="text-xs text-emerald-600">
                          {((globalAnalytics.performance.profitableItems / globalAnalytics.performance.itemCount) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-700">High Margin Items</p>
                        <p className="text-2xl font-bold text-amber-900">
                          {globalAnalytics.performance.highMarginItems}
                        </p>
                        <p className="text-xs text-amber-600">
                          Above 30% margin
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Average Item Revenue</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {formatCurrency(globalAnalytics.performance.averageItemRevenue)}
                        </p>
                        <p className="text-xs text-blue-600">
                          Per item sold
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <InsightsCard insights={globalAnalytics.insights} />
            </TabsContent>

            <TabsContent value="items" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ItemPerformanceTable
                  items={summary.topRevenueitems}
                  title="🏆 Top Revenue Generators"
                />
                <ItemPerformanceTable
                  items={summary.topProfitItems}
                  title="💰 Most Profitable Items"
                />
                <ItemPerformanceTable
                  items={summary.highestMarginItems}
                  title="📈 Highest Margin Items"
                />
                <ItemPerformanceTable
                  items={summary.fastMovingItems}
                  title="🚀 Fast Moving Items"
                />
              </div>

              {summary.underperformingItems.length > 0 && (
                <ItemPerformanceTable
                  items={summary.underperformingItems}
                  title="⚠️ Underperforming Items"
                />
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profit Margin Distribution */}
                <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Profit Margin Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "High Margin (>30%)", value: globalAnalytics.performance.highMarginItems, color: COLORS[0] },
                            { name: "Medium Margin (10-30%)", value: globalAnalytics.performance.profitableItems - globalAnalytics.performance.highMarginItems, color: COLORS[1] },
                            { name: "Low Margin (<10%)", value: globalAnalytics.performance.lowMarginItems, color: COLORS[2] },
                            { name: "Loss Items", value: globalAnalytics.performance.lossItems, color: COLORS[3] }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[0, 1, 2, 3].map((index) => (
                            <Cell key={index} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Performance Comparison */}
                <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Performance vs Previous Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Revenue Change</p>
                          <div className="flex items-center gap-2 mt-1">
                            <TrendIcon value={comparisons.previousDay.revenueChange} />
                            <span className={cn(
                              "font-medium",
                              comparisons.previousDay.revenueChange > 0 ? "text-emerald-600" :
                              comparisons.previousDay.revenueChange < 0 ? "text-red-600" : "text-gray-500"
                            )}>
                              {formatPercentage(comparisons.previousDay.revenueChange)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-emerald-700">Volume Change</p>
                          <div className="flex items-center gap-2 mt-1">
                            <TrendIcon value={comparisons.previousDay.volumeChange} />
                            <span className={cn(
                              "font-medium",
                              comparisons.previousDay.volumeChange > 0 ? "text-emerald-600" :
                              comparisons.previousDay.volumeChange < 0 ? "text-red-600" : "text-gray-500"
                            )}>
                              {formatPercentage(comparisons.previousDay.volumeChange)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-purple-700">vs Week Average</p>
                          <div className="flex items-center gap-2 mt-1">
                            <TrendIcon value={comparisons.weekAverage.revenueVsAvg} />
                            <span className={cn(
                              "font-medium",
                              comparisons.weekAverage.revenueVsAvg > 0 ? "text-emerald-600" :
                              comparisons.weekAverage.revenueVsAvg < 0 ? "text-red-600" : "text-gray-500"
                            )}>
                              {formatPercentage(comparisons.weekAverage.revenueVsAvg)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Advanced Metrics Table */}
              <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Financial Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Metric</th>
                          <th className="text-right p-3 font-medium">Current</th>
                          <th className="text-right p-3 font-medium">Target</th>
                          <th className="text-right p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3">Operating Margin</td>
                          <td className="p-3 text-right font-medium">{globalAnalytics.overview.operatingMargin.toFixed(1)}%</td>
                          <td className="p-3 text-right">25.0%</td>
                          <td className="p-3 text-right">
                            <Badge variant={globalAnalytics.overview.operatingMargin >= 25 ? "default" : "secondary"}>
                              {globalAnalytics.overview.operatingMargin >= 25 ? "Target Met" : "Below Target"}
                            </Badge>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Cost Efficiency</td>
                          <td className="p-3 text-right font-medium">{(globalAnalytics.financialHealth.costEfficiency * 100).toFixed(1)}%</td>
                          <td className="p-3 text-right">80.0%</td>
                          <td className="p-3 text-right">
                            <Badge variant={globalAnalytics.financialHealth.costEfficiency >= 0.8 ? "default" : "secondary"}>
                              {globalAnalytics.financialHealth.costEfficiency >= 0.8 ? "Excellent" : "Good"}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3">Profitability Index</td>
                          <td className="p-3 text-right font-medium">{(globalAnalytics.financialHealth.profitabilityIndex * 100).toFixed(1)}%</td>
                          <td className="p-3 text-right">20.0%</td>
                          <td className="p-3 text-right">
                            <Badge variant={globalAnalytics.financialHealth.profitabilityIndex >= 0.2 ? "default" : "secondary"}>
                              {globalAnalytics.financialHealth.profitabilityIndex >= 0.2 ? "Strong" : "Moderate"}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
