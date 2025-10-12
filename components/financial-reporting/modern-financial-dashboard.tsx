"use client"

// =============================================================================
// MODERN FINANCIAL DASHBOARD
// Professional, enterprise-grade financial dashboard with consistent design
// =============================================================================

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import {
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  FileText,
  Eye,
  RefreshCw,
  Download,
  Target,
  Zap,
  Clock,
  Users,
  CreditCard,
  Briefcase,
  Globe,
  Star,
  Info,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts'
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { useFinancialNotifications } from '@/lib/financial-reporting/notifications/financial-notification-service'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface FinancialDashboardProps {
  organizationId: string
  initialData?: any
  className?: string
  restrictedMode?: boolean
  executiveView?: boolean
  operationalView?: boolean
  adminMode?: boolean
  focusMode?: 'analysis' | 'statements' | 'compliance'
  showAdvancedAnalytics?: boolean
  showAllFeatures?: boolean
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: React.ReactNode
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

interface ChartData {
  name: string
  value: number
  change?: number
  fill?: string
}

// =============================================================================
// CHART CONFIGURATIONS
// =============================================================================

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-3))",
  },
  assets: {
    label: "Assets",
    color: "hsl(var(--chart-4))",
  },
  liabilities: {
    label: "Liabilities",
    color: "hsl(var(--chart-5))",
  }
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockFinancialData = {
  overview: {
    totalRevenue: 2456789,
    totalExpenses: 1876543,
    netProfit: 580246,
    grossMargin: 23.6,
    operatingMargin: 18.4,
    netMargin: 14.2,
    currentRatio: 2.1,
    quickRatio: 1.8,
    debtToEquity: 0.45,
    returnOnAssets: 12.3,
    returnOnEquity: 18.7
  },
  monthlyTrends: [
    { month: 'Jan', revenue: 210000, expenses: 165000, profit: 45000 },
    { month: 'Feb', revenue: 225000, expenses: 172000, profit: 53000 },
    { month: 'Mar', revenue: 240000, expenses: 178000, profit: 62000 },
    { month: 'Apr', revenue: 235000, expenses: 175000, profit: 60000 },
    { month: 'May', revenue: 265000, expenses: 185000, profit: 80000 },
    { month: 'Jun', revenue: 281000, expenses: 192000, profit: 89000 }
  ],
  categoryBreakdown: [
    { name: 'Revenue', value: 2456789, fill: chartConfig.revenue.color },
    { name: 'COGS', value: 1234567, fill: chartConfig.expenses.color },
    { name: 'Operating Expenses', value: 641976, fill: chartConfig.profit.color }
  ],
  balanceSheet: {
    totalAssets: 5432100,
    totalLiabilities: 2456789,
    totalEquity: 2975311,
    cashAndEquivalents: 987654,
    accountsReceivable: 543210,
    inventory: 765432,
    currentAssets: 2296296,
    fixedAssets: 3135804
  },
  ratios: {
    liquidity: [
      { name: 'Current Ratio', value: 2.1, benchmark: 2.0, status: 'good' },
      { name: 'Quick Ratio', value: 1.8, benchmark: 1.5, status: 'good' },
      { name: 'Cash Ratio', value: 0.9, benchmark: 0.5, status: 'excellent' }
    ],
    profitability: [
      { name: 'Gross Margin', value: 23.6, benchmark: 20.0, status: 'good' },
      { name: 'Operating Margin', value: 18.4, benchmark: 15.0, status: 'good' },
      { name: 'Net Margin', value: 14.2, benchmark: 10.0, status: 'excellent' }
    ],
    efficiency: [
      { name: 'Asset Turnover', value: 1.2, benchmark: 1.0, status: 'good' },
      { name: 'Inventory Turnover', value: 8.5, benchmark: 6.0, status: 'excellent' },
      { name: 'Receivables Turnover', value: 12.3, benchmark: 10.0, status: 'good' }
    ]
  }
}

// =============================================================================
// METRIC CARD COMPONENT
// =============================================================================

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  description,
  trend = 'neutral',
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50'
      case 'destructive':
        return 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50'
      default:
        return ''
    }
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return null
  }

  return (
    <Card className={cn("relative overflow-hidden", getVariantStyles())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? formatCurrency(value) : value}
        </div>
        {change && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {change.type === 'increase' ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={change.type === 'increase' ? 'text-green-600' : 'text-red-600'}>
              {change.value > 0 ? '+' : ''}{formatPercentage(change.value)}
            </span>
            <span>from {change.period}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

export function ModernFinancialDashboard({
  organizationId,
  initialData,
  className,
  restrictedMode = false,
  executiveView = false,
  operationalView = false,
  adminMode = false,
  focusMode,
  showAdvancedAnalytics = false,
  showAllFeatures = false
}: FinancialDashboardProps) {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(subMonths(new Date(), 1))
  })
  const [financialData, setFinancialData] = useState<any>(initialData || mockFinancialData)
  const [loading, setLoading] = useState(!initialData)
  const [activeTab, setActiveTab] = useState(focusMode || 'overview')

  // Financial notifications
  const notifications = useFinancialNotifications()

  useEffect(() => {
    if (!initialData) {
      loadFinancialData()
    }
  }, [dateRange, organizationId])

  const handleExport = async () => {
    try {
      // Simulate export process
      notifications.operationStart('Exporting financial report')

      setTimeout(() => {
        notifications.reportExported('Financial Dashboard', 'PDF')
        notifications.operationComplete('Export completed successfully')
      }, 2000)
    } catch (error) {
      notifications.error('Export Failed', 'Unable to export the financial report. Please try again.')
    }
  }

  const loadFinancialData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      setTimeout(() => {
        setFinancialData(mockFinancialData)
        setLoading(false)

        // Notify successful data load
        notifications.dataLoadSuccess('Financial data', Object.keys(mockFinancialData.monthlyTrends).length)

        // Generate appropriate report notification based on view type
        if (executiveView) {
          notifications.reportGenerated('Executive Summary', format(dateRange.from, 'MMM yyyy'))
        } else if (operationalView) {
          notifications.reportGenerated('Operational Report', format(dateRange.from, 'MMM yyyy'))
        } else {
          notifications.reportGenerated('Financial Dashboard', format(dateRange.from, 'MMM yyyy'))
        }
      }, 1000)
    } catch (error) {
      console.error('Error loading financial data:', error)
      setLoading(false)

      // Notify error
      notifications.dataLoadError('financial data', error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }

  // =============================================================================
  // LOADING STATE
  // =============================================================================

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // =============================================================================
  // ERROR STATE
  // =============================================================================

  if (!financialData) {
    return (
      <div className={cn("", className)}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Financial Data Available</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Unable to load financial data for the selected period. Please try selecting a different date range.
            </p>
            <Button onClick={() => {
              notifications.operationStart('Retrying data load')
              loadFinancialData()
            }} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {executiveView && "Executive Dashboard"}
              {operationalView && "Operations Dashboard"}
              {adminMode && "Financial Administration"}
              {!executiveView && !operationalView && !adminMode && "Financial Dashboard"}
            </h1>
            {adminMode && (
              <Badge variant="destructive" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
            )}
            {restrictedMode && (
              <Badge variant="secondary" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Limited View
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {executiveView
              ? "Strategic financial overview and key performance indicators"
              : operationalView
                ? "Operational financial data and transaction management"
                : `Comprehensive financial analysis for ${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!restrictedMode && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => range && setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={financialData.overview.totalRevenue}
          change={{ value: 12.5, type: 'increase', period: 'last month' }}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend="up"
          variant="success"
        />
        <MetricCard
          title="Net Profit"
          value={financialData.overview.netProfit}
          change={{ value: 8.3, type: 'increase', period: 'last month' }}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend="up"
          variant="success"
        />
        <MetricCard
          title="Operating Margin"
          value={`${financialData.overview.operatingMargin}%`}
          change={{ value: 2.1, type: 'increase', period: 'last month' }}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          trend="up"
        />
        <MetricCard
          title="Current Ratio"
          value={financialData.overview.currentRatio.toFixed(1)}
          change={{ value: 0.1, type: 'increase', period: 'last month' }}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          trend="up"
          description="Liquidity measure"
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Statements
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="ratios" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Ratios
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue vs Expenses
                </CardTitle>
                <CardDescription>
                  Monthly comparison of revenue and expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="revenue" fill={chartConfig.revenue.color} name="Revenue" />
                      <Bar dataKey="expenses" fill={chartConfig.expenses.color} name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Profit Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Profit Trend
                </CardTitle>
                <CardDescription>
                  Monthly profit performance and growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke={chartConfig.profit.color}
                        fill={chartConfig.profit.color}
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Financial Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Balance Sheet Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Assets</span>
                  <span className="font-semibold">{formatCurrency(financialData.balanceSheet.totalAssets)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Liabilities</span>
                  <span className="font-semibold">{formatCurrency(financialData.balanceSheet.totalLiabilities)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Equity</span>
                  <span className="font-semibold">{formatCurrency(financialData.balanceSheet.totalEquity)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Debt-to-Equity</span>
                  <span>{financialData.overview.debtToEquity}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profitability Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gross Margin</span>
                    <span className="font-semibold">{financialData.overview.grossMargin}%</span>
                  </div>
                  <Progress value={financialData.overview.grossMargin} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operating Margin</span>
                    <span className="font-semibold">{financialData.overview.operatingMargin}%</span>
                  </div>
                  <Progress value={financialData.overview.operatingMargin} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Net Margin</span>
                    <span className="font-semibold">{financialData.overview.netMargin}%</span>
                  </div>
                  <Progress value={financialData.overview.netMargin} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Ratios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Ratio</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {financialData.overview.currentRatio}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quick Ratio</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {financialData.overview.quickRatio}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ROA</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    {financialData.overview.returnOnAssets}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ROE</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    {financialData.overview.returnOnEquity}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Placeholder for other tabs */}
        <TabsContent value="statements" className="space-y-6 mt-6">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Financial statements view will display income statement, balance sheet, and cash flow statement with detailed breakdowns.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6 mt-6">
          <Alert>
            <LineChartIcon className="h-4 w-4" />
            <AlertDescription>
              Financial analysis view will show advanced analytics, forecasting, and scenario analysis tools.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="ratios" className="space-y-6 mt-6">
          <Alert>
            <PieChartIcon className="h-4 w-4" />
            <AlertDescription>
              Financial ratios view will display comprehensive ratio analysis with industry benchmarks.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6 mt-6">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Trends view will show historical performance analysis and predictive insights.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ModernFinancialDashboard