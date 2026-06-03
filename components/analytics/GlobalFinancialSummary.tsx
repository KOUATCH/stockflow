"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
  Info,
  TrendingUp as TrendUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GlobalFinancialAnalytics } from "@/actions/analytics/daily-sales-financial-analytics"

interface GlobalFinancialSummaryProps {
  analytics: GlobalFinancialAnalytics
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const formatPercentage = (value: number, showSign = true) =>
  `${showSign && value >= 0 ? '+' : ''}${value.toFixed(1)}%`

const TrendIcon = ({ value, size = "h-4 w-4" }: { value: number; size?: string }) => {
  if (value > 0) return <TrendingUp className={cn(size, "text-emerald-600")} />
  if (value < 0) return <TrendingDown className={cn(size, "text-red-600")} />
  return <Minus className={cn(size, "text-gray-500")} />
}

const FinancialMetricCard = ({
  title,
  value,
  change,
  prefix = "",
  suffix = "",
  target,
  icon: Icon,
  trend,
  gradient
}: {
  title: string
  value: number
  change?: number
  prefix?: string
  suffix?: string
  target?: number
  icon: any
  trend?: "up" | "down" | "stable"
  gradient?: string
}) => (
  <Card className={cn("border-0 transition-all duration-200 hover:shadow-lg", gradient)}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/50">
          <Icon className="h-6 w-6 text-gray-700" />
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1">
            <TrendIcon value={change} />
            <span className={cn(
              "text-sm font-medium",
              change > 0 ? "text-emerald-600" : change < 0 ? "text-red-600" : "text-gray-500"
            )}>
              {formatPercentage(change)}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">
          {prefix}{value.toLocaleString()}{suffix}
        </p>

        {target && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress to target</span>
              <span>{((value / target) * 100).toFixed(0)}%</span>
            </div>
            <Progress value={(value / target) * 100} className="h-2" />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

const HealthScoreCard = ({ analytics }: { analytics: GlobalFinancialAnalytics }) => {
  const healthMetrics = [
    {
      name: "Profitability",
      value: analytics.financialHealth.profitabilityIndex * 100,
      color: "#0088FE"
    },
    {
      name: "Efficiency",
      value: analytics.financialHealth.operatingEfficiency * 100,
      color: "#00C49F"
    },
    {
      name: "Quality",
      value: analytics.financialHealth.revenueQuality * 100,
      color: "#FFBB28"
    },
    {
      name: "Sustainability",
      value: analytics.financialHealth.growthSustainability * 100,
      color: "#FF8042"
    }
  ]

  const overallScore = healthMetrics.reduce((sum, metric) => sum + metric.value, 0) / healthMetrics.length

  return (
    <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Financial Health Score
        </CardTitle>
        <CardDescription>Overall business financial performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={200} height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: overallScore }]}>
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="#2563eb"
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{overallScore.toFixed(0)}</div>
                <div className="text-xs text-blue-600">Health Score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {healthMetrics.map((metric) => (
            <div key={metric.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{metric.name}</span>
                <span className="font-medium">{metric.value.toFixed(0)}%</span>
              </div>
              <Progress value={metric.value} className="h-1.5" />
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-blue-200">
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant={
                analytics.financialHealth.riskIndicator === "low" ? "default" :
                analytics.financialHealth.riskIndicator === "medium" ? "secondary" : "destructive"
              }
            >
              {analytics.financialHealth.riskIndicator.toUpperCase()} RISK
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const AlertsSummary = ({ alerts }: { alerts: any[] }) => (
  <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        Critical Alerts
      </CardTitle>
    </CardHeader>
    <CardContent>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-lg p-3">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">All systems operating normally</span>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border-l-4",
                alert.type === "critical" ? "border-l-red-500 bg-red-50" :
                alert.type === "warning" ? "border-l-amber-500 bg-amber-50" :
                "border-l-blue-500 bg-blue-50"
              )}
            >
              <div className="flex items-start gap-2">
                {alert.type === "critical" ? <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" /> :
                 alert.type === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" /> :
                 <Info className="h-4 w-4 text-blue-500 mt-0.5" />}
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-medium">{alert.title}</h4>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                  {alert.recommendation && (
                    <p className="text-xs font-medium text-gray-700 bg-white/50 rounded px-2 py-1">
                      💡 {alert.recommendation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {alerts.length > 3 && (
            <Button variant="outline" size="sm" className="w-full">
              View {alerts.length - 3} more alerts
            </Button>
          )}
        </div>
      )}
    </CardContent>
  </Card>
)

const PerformanceBreakdown = ({ analytics }: { analytics: GlobalFinancialAnalytics }) => {
  const performanceData = [
    {
      name: "Profitable",
      value: analytics.performance.profitableItems,
      percentage: (analytics.performance.profitableItems / analytics.performance.itemCount) * 100,
      color: "#10b981"
    },
    {
      name: "High Margin",
      value: analytics.performance.highMarginItems,
      percentage: (analytics.performance.highMarginItems / analytics.performance.itemCount) * 100,
      color: "#3b82f6"
    },
    {
      name: "Low Margin",
      value: analytics.performance.lowMarginItems,
      percentage: (analytics.performance.lowMarginItems / analytics.performance.itemCount) * 100,
      color: "#f59e0b"
    },
    {
      name: "Loss Items",
      value: analytics.performance.lossItems,
      percentage: (analytics.performance.lossItems / analytics.performance.itemCount) * 100,
      color: "#ef4444"
    }
  ]

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-gray-600" />
          Item Performance Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Items"]} />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3">
            {performanceData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.value} items ({item.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const RevenueAnalysis = ({ analytics }: { analytics: GlobalFinancialAnalytics }) => (
  <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-gray-600" />
        Hourly Revenue Analysis
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={analytics.trends.revenueByHour}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 12 }}
            tickFormatter={(hour) => `${hour}:00`}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: any, name: string) => [
              name === "revenue" ? formatCurrency(value) : formatCurrency(value),
              name === "revenue" ? "Revenue" : name === "profit" ? "Profit" : "Cost"
            ]}
            labelFormatter={(label) => `${label}:00 - ${parseInt(label) + 1}:00`}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.1}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stackId="2"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

const CategoryAnalysis = ({ analytics }: { analytics: GlobalFinancialAnalytics }) => (
  <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Activity className="h-5 w-5 text-gray-600" />
        Category Performance
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analytics.trends.categoryPerformance}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: any) => [formatCurrency(value), "Revenue"]}
          />
          <Bar dataKey="revenue" fill="#0088FE" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {analytics.trends.categoryPerformance.slice(0, 3).map((category, index) => (
          <div key={category.category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                index === 0 ? "bg-emerald-500" : index === 1 ? "bg-blue-500" : "bg-amber-500"
              )} />
              <span className="text-sm font-medium">{category.category}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{formatCurrency(category.revenue)}</div>
              <div className="text-xs text-gray-500">{category.margin.toFixed(1)}% margin</div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export default function GlobalFinancialSummary({ analytics, className }: GlobalFinancialSummaryProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Key Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialMetricCard
          title="Total Revenue"
          value={analytics.overview.totalRevenue}
          change={analytics.overview.revenueGrowth}
          prefix="$"
          icon={DollarSign}
          gradient="bg-gradient-to-br from-emerald-50 to-emerald-100"
        />
        <FinancialMetricCard
          title="Gross Profit"
          value={analytics.overview.grossProfit}
          change={analytics.overview.profitGrowth}
          prefix="$"
          icon={TrendUp}
          gradient="bg-gradient-to-br from-blue-50 to-blue-100"
        />
        <FinancialMetricCard
          title="Operating Margin"
          value={analytics.overview.operatingMargin}
          suffix="%"
          target={25}
          icon={Target}
          gradient="bg-gradient-to-br from-purple-50 to-purple-100"
        />
        <FinancialMetricCard
          title="Total Items"
          value={analytics.performance.itemCount}
          icon={BarChart3}
          gradient="bg-gradient-to-br from-amber-50 to-amber-100"
        />
      </div>

      {/* Health Score and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HealthScoreCard analytics={analytics} />
        <AlertsSummary alerts={analytics.alerts} />
        <PerformanceBreakdown analytics={analytics} />
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RevenueAnalysis analytics={analytics} />
            <CategoryAnalysis analytics={analytics} />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardContent className="p-6 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-emerald-700">
                    {analytics.performance.profitableItems}
                  </div>
                  <div className="text-sm font-medium text-emerald-600">Profitable Items</div>
                  <div className="text-xs text-emerald-500">
                    {((analytics.performance.profitableItems / analytics.performance.itemCount) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-700">
                    {formatCurrency(analytics.performance.averageItemRevenue)}
                  </div>
                  <div className="text-sm font-medium text-blue-600">Avg Revenue/Item</div>
                  <div className="text-xs text-blue-500">Per item performance</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-700">
                    {analytics.performance.topPerformers}
                  </div>
                  <div className="text-sm font-medium text-purple-600">Top Performers</div>
                  <div className="text-xs text-purple-500">High-impact items</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.insights.map((insight, index) => (
              <Card key={index} className={cn(
                "border-0",
                insight.type === "opportunity" ? "bg-gradient-to-br from-blue-50 to-blue-100" :
                insight.type === "risk" ? "bg-gradient-to-br from-red-50 to-red-100" :
                "bg-gradient-to-br from-emerald-50 to-emerald-100"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {insight.type === "opportunity" ? <Zap className="h-5 w-5 text-blue-600" /> :
                       insight.type === "risk" ? <AlertTriangle className="h-5 w-5 text-red-600" /> :
                       <CheckCircle className="h-5 w-5 text-emerald-600" />}
                      {insight.title}
                    </CardTitle>
                    <Badge variant={
                      insight.priority === "high" ? "destructive" :
                      insight.priority === "medium" ? "default" : "secondary"
                    }>
                      {insight.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700">{insight.description}</p>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Action Items:</h5>
                    <ul className="space-y-1">
                      {insight.actionItems.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-60" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}