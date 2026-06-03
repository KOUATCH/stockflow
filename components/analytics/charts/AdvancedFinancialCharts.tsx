"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ComposedChart,
  Line,
  Area,
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
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Brush,
  AreaChart,
  LineChart,
  BarChart as RechartsBarChart
} from "recharts"
import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Filter,
  Download,
  Maximize2,
  Eye,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ItemFinancialMetrics, GlobalFinancialAnalytics } from "@/actions/analytics/daily-sales-financial-analytics"

interface AdvancedFinancialChartsProps {
  itemAnalytics: ItemFinancialMetrics[]
  globalAnalytics: GlobalFinancialAnalytics
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const formatPercentage = (value: number) => `${value.toFixed(1)}%`

const ProfitabilityScatterChart = ({ items }: { items: ItemFinancialMetrics[] }) => {
  const scatterData = items.map(item => ({
    x: item.grossRevenue,
    y: item.grossMargin,
    z: item.quantitySold,
    name: item.name,
    category: item.category,
    profit: item.grossProfit
  }))

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Revenue vs Margin Analysis
        </CardTitle>
        <CardDescription>
          Items plotted by revenue (x), margin (y), and volume (size)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="x"
              type="number"
              name="Revenue"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              dataKey="y"
              type="number"
              name="Margin %"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="font-medium text-sm mb-2">{data.name}</p>
                      <div className="space-y-1 text-xs">
                        <p><span className="text-gray-600">Revenue:</span> {formatCurrency(data.x)}</p>
                        <p><span className="text-gray-600">Margin:</span> {data.y.toFixed(1)}%</p>
                        <p><span className="text-gray-600">Units Sold:</span> {data.z}</p>
                        <p><span className="text-gray-600">Profit:</span> {formatCurrency(data.profit)}</p>
                        <Badge variant="outline" className="text-xs mt-1">{data.category}</Badge>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="5 5" label="Target Margin" />
            <ReferenceLine x={1000} stroke="#3b82f6" strokeDasharray="5 5" label="Revenue Target" />
            <Scatter
              data={scatterData}
              fill="#0088FE"
              fillOpacity={0.6}
              stroke="#0088FE"
              strokeWidth={2}
            />
          </ScatterChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="text-center p-2 bg-emerald-50 rounded">
            <div className="text-sm font-medium text-emerald-700">High Value</div>
            <div className="text-xs text-emerald-600">Top right quadrant</div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded">
            <div className="text-sm font-medium text-amber-700">High Volume</div>
            <div className="text-xs text-amber-600">Large circles</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-sm font-medium text-blue-700">Target Margin</div>
            <div className="text-xs text-blue-600">Above 20%</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="text-sm font-medium text-purple-700">Revenue Target</div>
            <div className="text-xs text-purple-600">Above $1k</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const MarginDistributionChart = ({ items }: { items: ItemFinancialMetrics[] }) => {
  // Create margin buckets
  const marginBuckets = [
    { range: "Loss (< 0%)", min: -100, max: 0, color: "#ef4444", count: 0, items: [] as ItemFinancialMetrics[] },
    { range: "0-10%", min: 0, max: 10, color: "#f59e0b", count: 0, items: [] as ItemFinancialMetrics[] },
    { range: "10-20%", min: 10, max: 20, color: "#eab308", count: 0, items: [] as ItemFinancialMetrics[] },
    { range: "20-30%", min: 20, max: 30, color: "#22c55e", count: 0, items: [] as ItemFinancialMetrics[] },
    { range: "30-40%", min: 30, max: 40, color: "#3b82f6", count: 0, items: [] as ItemFinancialMetrics[] },
    { range: "40%+", min: 40, max: 100, color: "#8b5cf6", count: 0, items: [] as ItemFinancialMetrics[] }
  ]

  items.forEach(item => {
    const bucket = marginBuckets.find(b => item.grossMargin >= b.min && item.grossMargin < b.max)
    if (bucket) {
      bucket.count++
      bucket.items.push(item)
    }
  })

  const chartData = marginBuckets.map(bucket => ({
    range: bucket.range,
    count: bucket.count,
    percentage: items.length > 0 ? (bucket.count / items.length) * 100 : 0,
    fill: bucket.color,
    revenue: bucket.items.reduce((sum, item) => sum + item.grossRevenue, 0)
  }))

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Profit Margin Distribution
        </CardTitle>
        <CardDescription>
          Distribution of items across profit margin ranges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'count') return [value, 'Items']
                    if (name === 'revenue') return [formatCurrency(Number(value)), 'Total Revenue']
                    return [value, name]
                  }}
                />
                <Bar dataKey="count" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, 'Items']}
                  labelFormatter={(label) => `Margin Range: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {chartData.map((bucket, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: bucket.fill }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{bucket.range}</div>
                <div className="text-xs text-gray-500">
                  {bucket.count} items ({bucket.percentage.toFixed(1)}%)
                </div>
                <div className="text-xs text-gray-600">
                  {formatCurrency(bucket.revenue)} revenue
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const PerformanceHeatmap = ({ analytics }: { analytics: GlobalFinancialAnalytics }) => {
  const heatmapData = analytics.trends.categoryPerformance.map(category => ({
    category: category.category,
    revenue: category.revenue,
    margin: category.margin,
    growth: category.growth,
    itemCount: category.itemCount,
    revenuePerItem: category.revenue / category.itemCount
  }))

  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'margin' | 'growth' | 'revenuePerItem'>('revenue')

  const getMetricValue = (item: any, metric: string) => {
    switch (metric) {
      case 'revenue': return item.revenue
      case 'margin': return item.margin
      case 'growth': return item.growth
      case 'revenuePerItem': return item.revenuePerItem
      default: return 0
    }
  }

  const getMetricColor = (value: number, metric: string) => {
    let intensity = 0
    switch (metric) {
      case 'revenue':
        const maxRevenue = Math.max(...heatmapData.map(d => d.revenue))
        intensity = value / maxRevenue
        break
      case 'margin':
        intensity = Math.min(value / 50, 1) // Cap at 50% for color scaling
        break
      case 'growth':
        intensity = Math.max(0, Math.min((value + 20) / 40, 1)) // Scale from -20% to 20%
        break
      case 'revenuePerItem':
        const maxRPI = Math.max(...heatmapData.map(d => d.revenuePerItem))
        intensity = value / maxRPI
        break
    }

    const opacity = Math.max(0.1, intensity)
    return `rgba(59, 130, 246, ${opacity})`
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-600" />
          Category Performance Heatmap
        </CardTitle>
        <CardDescription>
          Visual comparison of category performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Display Metric:</span>
            <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="margin">Profit Margin</SelectItem>
                <SelectItem value="growth">Growth Rate</SelectItem>
                <SelectItem value="revenuePerItem">Revenue/Item</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {heatmapData.map((category, index) => {
              const metricValue = getMetricValue(category, selectedMetric)
              const bgColor = getMetricColor(metricValue, selectedMetric)

              return (
                <div
                  key={index}
                  className="relative p-4 rounded-lg border transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="space-y-2">
                    <div className="font-medium text-sm text-gray-900">
                      {category.category}
                    </div>
                    <div className="text-xs text-gray-700">
                      {category.itemCount} items
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {selectedMetric === 'revenue' ? formatCurrency(metricValue) :
                       selectedMetric === 'revenuePerItem' ? formatCurrency(metricValue) :
                       selectedMetric === 'margin' ? `${metricValue.toFixed(1)}%` :
                       `${metricValue >= 0 ? '+' : ''}${metricValue.toFixed(1)}%`}
                    </div>
                  </div>

                  {/* Hover details */}
                  <div className="absolute inset-0 bg-black/80 rounded-lg opacity-0 hover:opacity-100 transition-opacity p-3 text-white text-xs space-y-1">
                    <div><span className="font-medium">Revenue:</span> {formatCurrency(category.revenue)}</div>
                    <div><span className="font-medium">Margin:</span> {category.margin.toFixed(1)}%</div>
                    <div><span className="font-medium">Growth:</span> {category.growth >= 0 ? '+' : ''}{category.growth.toFixed(1)}%</div>
                    <div><span className="font-medium">Revenue/Item:</span> {formatCurrency(category.revenuePerItem)}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Intensity represents relative performance within the selected metric
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span>Low</span>
              <div className="w-4 h-4 bg-blue-300 rounded"></div>
              <span>Medium</span>
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const HourlyTrendsComposedChart = ({ analytics }: { analytics: GlobalFinancialAnalytics }) => (
  <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Activity className="h-5 w-5 text-green-600" />
        Hourly Financial Performance
      </CardTitle>
      <CardDescription>
        Revenue, costs, and profit trends throughout the day
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={analytics.trends.revenueByHour}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 12 }}
            tickFormatter={(hour) => `${hour}:00`}
          />
          <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: any, name: string) => [
              formatCurrency(value),
              name === 'revenue' ? 'Revenue' : name === 'cost' ? 'Cost' : 'Profit'
            ]}
            labelFormatter={(label) => `${label}:00 - ${parseInt(label) + 1}:00`}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            fill="#3b82f6"
            fillOpacity={0.1}
            stroke="#3b82f6"
            strokeWidth={2}
            name="Revenue"
          />
          <Bar
            yAxisId="left"
            dataKey="cost"
            fill="#ef4444"
            fillOpacity={0.7}
            name="Cost"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="profit"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="Profit"
          />
          <Brush dataKey="hour" height={30} stroke="#8884d8" />
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

const TopPerformersRadialChart = ({ items }: { items: ItemFinancialMetrics[] }) => {
  const topItems = items
    .filter(item => item.grossRevenue > 0)
    .sort((a, b) => b.grossRevenue - a.grossRevenue)
    .slice(0, 8)
    .map((item, index) => ({
      name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
      fullName: item.name,
      value: (item.grossRevenue / items[0]?.grossRevenue) * 100,
      revenue: item.grossRevenue,
      margin: item.grossMargin,
      fill: COLORS[index % COLORS.length]
    }))

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-indigo-600" />
          Top Performers (Revenue)
        </CardTitle>
        <CardDescription>
          Radial comparison of highest revenue items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={topItems}>
              <RadialBar
                dataKey="value"
                cornerRadius={4}
                label={{ position: 'insideStart', fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium text-sm mb-2">{data.fullName}</p>
                        <div className="space-y-1 text-xs">
                          <p><span className="text-gray-600">Revenue:</span> {formatCurrency(data.revenue)}</p>
                          <p><span className="text-gray-600">Margin:</span> {data.margin.toFixed(1)}%</p>
                          <p><span className="text-gray-600">Relative Performance:</span> {data.value.toFixed(0)}%</p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatCurrency(item.revenue)}</div>
                  <div className="text-xs text-gray-500">{item.margin.toFixed(1)}% margin</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdvancedFinancialCharts({
  itemAnalytics,
  globalAnalytics,
  className
}: AdvancedFinancialChartsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Profitability Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProfitabilityScatterChart items={itemAnalytics} />
        <MarginDistributionChart items={itemAnalytics} />
      </div>

      {/* Performance Visualization */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PerformanceHeatmap analytics={globalAnalytics} />
        <TopPerformersRadialChart items={itemAnalytics} />
      </div>

      {/* Temporal Analysis */}
      <HourlyTrendsComposedChart analytics={globalAnalytics} />
    </div>
  )
}