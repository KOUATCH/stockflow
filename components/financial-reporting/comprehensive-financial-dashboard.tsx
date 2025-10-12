"use client"

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
  Zap
} from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
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
import { ComprehensiveFinancialAnalysis } from '@/lib/financial-reporting/core/financial-models'
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

interface FinancialDashboardProps {
  organizationId: string
  initialData?: ComprehensiveFinancialAnalysis
  className?: string
  restrictedMode?: boolean
  executiveView?: boolean
  operationalView?: boolean
  adminMode?: boolean
  focusMode?: 'analysis' | 'statements' | 'compliance'
  showAdvancedAnalytics?: boolean
  showAllFeatures?: boolean
}

export function ComprehensiveFinancialDashboard({
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
  const [financialData, setFinancialData] = useState<ComprehensiveFinancialAnalysis | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!initialData) {
      loadFinancialData()
    }
  }, [dateRange, organizationId])

  const loadFinancialData = async () => {
    setLoading(true)
    try {
      // This would call your financial data service
      // const response = await generateComprehensiveFinancialReport(organizationId, dateRange.from, dateRange.to)
      // setFinancialData(response)

      // Mock data for demonstration
      setTimeout(() => {
        setFinancialData(mockFinancialData)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error loading financial data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
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
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!financialData) {
    return (
      <div className={cn("", className)}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Financial Data Available</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Unable to load financial data for the selected period. Please try selecting a different date range.
            </p>
            <Button onClick={loadFinancialData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Date Selector */}
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
            <Button variant="outline" size="sm">
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
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Select defaultValue="comprehensive">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
              <SelectItem value="income">Income Statement</SelectItem>
              <SelectItem value="balance">Balance Sheet</SelectItem>
              <SelectItem value="cashflow">Cash Flow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${formatNumber(financialData.incomeStatement.netRevenue)}`}
          change={financialData.incomeStatement.priorPeriodComparison?.revenueGrowth || 8.5}
          icon={DollarSignIcon}
        />
        <MetricCard
          title="Net Profit"
          value={`$${formatNumber(financialData.incomeStatement.netIncome)}`}
          change={financialData.incomeStatement.priorPeriodComparison?.netIncomeGrowth || 12.3}
          icon={TrendingUpIcon}
        />
        <MetricCard
          title="Cash Flow"
          value={`$${formatNumber(financialData.cashFlowStatement.netCashFromOperatingActivities)}`}
          change={financialData.cashFlowStatement.priorPeriodComparison?.operatingCashFlowGrowth || 9.8}
          icon={LineChartIcon}
        />
        <MetricCard
          title="Financial Health"
          value={`${financialData.kpis.financialHealthScore}/100`}
          change={2.1}
          icon={CheckCircleIcon}
          isScore
        />
      </div>

      {/* Risk Alerts */}
      {financialData.alerts && financialData.alerts.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
              Financial Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {financialData.alerts.map((alert, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-orange-900">{alert.title}</h4>
                    <p className="text-sm text-orange-700">{alert.message}</p>
                  </div>
                  <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.impact.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="ratios">Ratios</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FinancialOverview financialData={financialData} />
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <IncomeStatementView incomeStatement={financialData.incomeStatement} />
        </TabsContent>

        <TabsContent value="balance" className="space-y-6">
          <BalanceSheetView balanceSheet={financialData.balanceSheet} />
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <CashFlowView cashFlowStatement={financialData.cashFlowStatement} />
        </TabsContent>

        <TabsContent value="ratios" className="space-y-6">
          <FinancialRatiosView
            liquidityRatios={financialData.liquidityRatios}
            leverageRatios={financialData.leverageRatios}
            profitabilityRatios={financialData.profitabilityRatios}
            efficiencyRatios={financialData.efficiencyRatios}
            benchmarks={financialData.benchmarks}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendAnalysisView
            trendAnalysis={financialData.trendAnalysis}
            seasonalAnalysis={financialData.seasonalAnalysis}
          />
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <ForecastView
            forecasts={financialData.forecasts}
            scenarios={financialData.scenarios}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Metric Card Component
function MetricCard({ title, value, change, icon: Icon, isScore = false }) {
  const isPositive = change > 0
  const changeColor = isScore ? 'text-blue-600' : (isPositive ? 'text-green-600' : 'text-red-600')
  const TrendIcon = isScore ? CheckCircleIcon : (isPositive ? TrendingUpIcon : TrendingDownIcon)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendIcon className={`h-4 w-4 ${changeColor}`} />
              <span className={`text-sm font-medium ${changeColor}`}>
                {isScore ? '+' : ''}{change.toFixed(1)}{isScore ? '' : '%'}
              </span>
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Financial Overview Component
function FinancialOverview({ financialData }) {
  const profitabilityData = [
    { name: 'Gross Profit', value: Number(financialData.incomeStatement.grossProfit), margin: financialData.incomeStatement.grossProfitMargin },
    { name: 'Operating Profit', value: Number(financialData.incomeStatement.operatingIncome), margin: financialData.incomeStatement.operatingMargin },
    { name: 'Net Profit', value: Number(financialData.incomeStatement.netIncome), margin: financialData.incomeStatement.netProfitMargin },
    { name: 'EBITDA', value: Number(financialData.incomeStatement.ebitda), margin: financialData.incomeStatement.ebitdaMargin }
  ]

  const assetBreakdown = [
    { name: 'Current Assets', value: Number(financialData.balanceSheet.assets.totalCurrentAssets), color: '#3B82F6' },
    { name: 'Fixed Assets', value: Number(financialData.balanceSheet.assets.totalNonCurrentAssets), color: '#10B981' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Profitability Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Profitability Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${formatNumber(value)}`, 'Amount']} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Asset Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {assetBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${formatNumber(value)}`, 'Value']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Ratios Summary */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Key Financial Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{financialData.liquidityRatios.currentRatio.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Current Ratio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{financialData.profitabilityRatios.returnOnEquity.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Return on Equity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{financialData.leverageRatios.debtToEquityRatio.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Debt to Equity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{financialData.efficiencyRatios.assetTurnover.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Asset Turnover</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Income Statement View
function IncomeStatementView({ incomeStatement }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Statement</CardTitle>
        <p className="text-sm text-gray-600">
          For the period {format(incomeStatement.reportingPeriod.startDate, 'MMM dd')} - {format(incomeStatement.reportingPeriod.endDate, 'MMM dd, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div className="font-semibold">Revenue</div>
            <div className="text-right font-semibold">${formatNumber(incomeStatement.netRevenue)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div className="pl-4">Gross Revenue</div>
            <div className="text-right">${formatNumber(incomeStatement.grossRevenue)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div className="pl-4">Less: Returns & Allowances</div>
            <div className="text-right">($${formatNumber(incomeStatement.salesReturns)})</div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div className="font-semibold">Cost of Goods Sold</div>
            <div className="text-right font-semibold">($${formatNumber(incomeStatement.costOfGoodsSold)})</div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2 border-b bg-blue-50">
            <div className="font-bold">Gross Profit</div>
            <div className="text-right font-bold">${formatNumber(incomeStatement.grossProfit)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-1">
            <div className="text-sm text-gray-600">Gross Margin</div>
            <div className="text-right text-sm text-gray-600">{incomeStatement.grossProfitMargin.toFixed(1)}%</div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div className="font-semibold">Operating Expenses</div>
            <div className="text-right font-semibold">($${formatNumber(incomeStatement.totalOperatingExpenses)})</div>
          </div>

          {/* Operating Expense Breakdown */}
          {Object.entries(incomeStatement.operatingExpenses).map(([key, value]) => (
            <div key={key} className="grid grid-cols-2 gap-4 py-1">
              <div className="pl-4 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
              <div className="text-right text-sm">($${formatNumber(value)})</div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4 py-2 border-b bg-green-50">
            <div className="font-bold">Operating Income</div>
            <div className="text-right font-bold">${formatNumber(incomeStatement.operatingIncome)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-1">
            <div className="text-sm text-gray-600">Operating Margin</div>
            <div className="text-right text-sm text-gray-600">{incomeStatement.operatingMargin.toFixed(1)}%</div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div>Other Income</div>
            <div className="text-right">${formatNumber(incomeStatement.otherIncome)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div>Interest Income</div>
            <div className="text-right">${formatNumber(incomeStatement.interestIncome)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div>Interest Expense</div>
            <div className="text-right">($${formatNumber(incomeStatement.interestExpense)})</div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div className="font-semibold">Earnings Before Tax</div>
            <div className="text-right font-semibold">${formatNumber(incomeStatement.earningsBeforeTax)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2 border-b">
            <div>Income Tax Expense</div>
            <div className="text-right">($${formatNumber(incomeStatement.incomeTaxExpense)})</div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-1">
            <div className="text-sm text-gray-600">Effective Tax Rate</div>
            <div className="text-right text-sm text-gray-600">{incomeStatement.effectiveTaxRate.toFixed(1)}%</div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-b-2 border-black bg-yellow-50">
            <div className="font-bold text-lg">Net Income</div>
            <div className="text-right font-bold text-lg">${formatNumber(incomeStatement.netIncome)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-1">
            <div className="text-sm text-gray-600">Net Margin</div>
            <div className="text-right text-sm text-gray-600">{incomeStatement.netProfitMargin.toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Balance Sheet View
function BalanceSheetView({ balanceSheet }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Sheet</CardTitle>
        <p className="text-sm text-gray-600">
          As of {format(balanceSheet.reportingDate, 'MMM dd, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assets */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">ASSETS</h3>

            <div className="space-y-3">
              <div className="font-semibold text-blue-600">Current Assets</div>
              <div className="pl-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span>Cash & Cash Equivalents</span>
                  <span className="text-right">${formatNumber(balanceSheet.assets.currentAssets.cashAndCashEquivalents)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Short-term Investments</span>
                  <span className="text-right">${formatNumber(balanceSheet.assets.currentAssets.shortTermInvestments)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Accounts Receivable (Net)</span>
                  <span className="text-right">${formatNumber(balanceSheet.assets.currentAssets.netAccountsReceivable)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Inventory</span>
                  <span className="text-right">${formatNumber(balanceSheet.assets.currentAssets.inventory)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Prepaid Expenses</span>
                  <span className="text-right">${formatNumber(balanceSheet.assets.currentAssets.prepaidExpenses)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-semibold border-t pt-2">
                <span>Total Current Assets</span>
                <span className="text-right">${formatNumber(balanceSheet.assets.totalCurrentAssets)}</span>
              </div>

              <div className="font-semibold text-blue-600 mt-6">Non-Current Assets</div>
              <div className="pl-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span>Property, Plant & Equipment (Net)</span>
                  <span className="text-right">${formatNumber(balanceSheet.assets.nonCurrentAssets.propertyPlantEquipment.netPPE)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Intangible Assets (Net)</span>
                  <span className="text-right">${formatNumber(balanceSheet.assets.nonCurrentAssets.intangibleAssets.netIntangibleAssets)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Long-term Investments</span>
                  <span className="text-right">${formatNumber(balanceSheet.assets.nonCurrentAssets.longTermInvestments)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-semibold border-t pt-2">
                <span>Total Non-Current Assets</span>
                <span className="text-right">${formatNumber(balanceSheet.assets.totalNonCurrentAssets)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-bold border-t-2 border-black pt-2 text-lg">
                <span>TOTAL ASSETS</span>
                <span className="text-right">${formatNumber(balanceSheet.assets.totalAssets)}</span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b pb-2">LIABILITIES & EQUITY</h3>

            <div className="space-y-3">
              <div className="font-semibold text-red-600">Current Liabilities</div>
              <div className="pl-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span>Accounts Payable</span>
                  <span className="text-right">${formatNumber(balanceSheet.liabilities.currentLiabilities.accountsPayable)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Accrued Liabilities</span>
                  <span className="text-right">${formatNumber(balanceSheet.liabilities.currentLiabilities.accruedLiabilities)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Short-term Debt</span>
                  <span className="text-right">${formatNumber(balanceSheet.liabilities.currentLiabilities.shortTermDebt)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Current Portion of Long-term Debt</span>
                  <span className="text-right">${formatNumber(balanceSheet.liabilities.currentLiabilities.currentPortionLongTermDebt)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-semibold border-t pt-2">
                <span>Total Current Liabilities</span>
                <span className="text-right">${formatNumber(balanceSheet.liabilities.totalCurrentLiabilities)}</span>
              </div>

              <div className="font-semibold text-red-600 mt-6">Non-Current Liabilities</div>
              <div className="pl-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span>Long-term Debt</span>
                  <span className="text-right">${formatNumber(balanceSheet.liabilities.nonCurrentLiabilities.longTermDebt)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Deferred Tax Liabilities</span>
                  <span className="text-right">${formatNumber(balanceSheet.liabilities.nonCurrentLiabilities.deferredTaxLiabilities)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-semibold border-t pt-2">
                <span>Total Non-Current Liabilities</span>
                <span className="text-right">${formatNumber(balanceSheet.liabilities.totalNonCurrentLiabilities)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-bold border-t pt-2">
                <span>Total Liabilities</span>
                <span className="text-right">${formatNumber(balanceSheet.liabilities.totalLiabilities)}</span>
              </div>

              <div className="font-semibold text-green-600 mt-6">Shareholders' Equity</div>
              <div className="pl-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span>Common Stock</span>
                  <span className="text-right">${formatNumber(balanceSheet.equity.commonStock)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Additional Paid-in Capital</span>
                  <span className="text-right">${formatNumber(balanceSheet.equity.additionalPaidInCapital)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span>Retained Earnings</span>
                  <span className="text-right">${formatNumber(balanceSheet.equity.retainedEarnings)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-bold border-t pt-2">
                <span>Total Shareholders' Equity</span>
                <span className="text-right">${formatNumber(balanceSheet.totalEquity)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-bold border-t-2 border-black pt-2 text-lg">
                <span>TOTAL LIAB. & EQUITY</span>
                <span className="text-right">${formatNumber(balanceSheet.totalLiabilitiesAndEquity)}</span>
              </div>

              {balanceSheet.balanceVerification && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Balance Sheet Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Cash Flow View
function CashFlowView({ cashFlowStatement }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Statement</CardTitle>
        <p className="text-sm text-gray-600">
          For the period {format(cashFlowStatement.reportingPeriod.startDate, 'MMM dd')} - {format(cashFlowStatement.reportingPeriod.endDate, 'MMM dd, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Operating Activities */}
          <div>
            <h3 className="font-bold text-blue-600 mb-3">Cash Flows from Operating Activities</h3>
            <div className="space-y-2 pl-4">
              <div className="grid grid-cols-2 gap-4">
                <span>Net Income</span>
                <span className="text-right">${formatNumber(cashFlowStatement.operatingActivities.netIncome)}</span>
              </div>
              <div className="text-sm font-medium text-gray-600 mt-3 mb-2">Adjustments:</div>
              {Object.entries(cashFlowStatement.operatingActivities.adjustments).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-4 pl-4">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-right">${formatNumber(value)}</span>
                </div>
              ))}
              <div className="text-sm font-medium text-gray-600 mt-3 mb-2">Changes in Working Capital:</div>
              {Object.entries(cashFlowStatement.operatingActivities.workingCapitalChanges).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-4 pl-4">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-right">${formatNumber(value)}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 font-bold border-t pt-2 mt-3">
              <span>Net Cash from Operating Activities</span>
              <span className="text-right">${formatNumber(cashFlowStatement.netCashFromOperatingActivities)}</span>
            </div>
          </div>

          {/* Investing Activities */}
          <div>
            <h3 className="font-bold text-green-600 mb-3">Cash Flows from Investing Activities</h3>
            <div className="space-y-2 pl-4">
              {Object.entries(cashFlowStatement.investingActivities).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-4">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-right">${formatNumber(value)}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 font-bold border-t pt-2 mt-3">
              <span>Net Cash from Investing Activities</span>
              <span className="text-right">${formatNumber(cashFlowStatement.netCashFromInvestingActivities)}</span>
            </div>
          </div>

          {/* Financing Activities */}
          <div>
            <h3 className="font-bold text-purple-600 mb-3">Cash Flows from Financing Activities</h3>
            <div className="space-y-2 pl-4">
              {Object.entries(cashFlowStatement.financingActivities).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-4">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-right">${formatNumber(value)}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 font-bold border-t pt-2 mt-3">
              <span>Net Cash from Financing Activities</span>
              <span className="text-right">${formatNumber(cashFlowStatement.netCashFromFinancingActivities)}</span>
            </div>
          </div>

          {/* Net Change in Cash */}
          <div className="border-t-2 border-black pt-4">
            <div className="grid grid-cols-2 gap-4 font-bold text-lg">
              <span>Net Change in Cash</span>
              <span className="text-right">${formatNumber(cashFlowStatement.netChangeInCash)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <span>Beginning Cash Balance</span>
              <span className="text-right">${formatNumber(cashFlowStatement.beginningCashBalance)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 font-bold border-t pt-2 mt-2">
              <span>Ending Cash Balance</span>
              <span className="text-right">${formatNumber(cashFlowStatement.endingCashBalance)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Financial Ratios View
function FinancialRatiosView({ liquidityRatios, leverageRatios, profitabilityRatios, efficiencyRatios, benchmarks }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Liquidity Ratios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Liquidity Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RatioRow
              label="Current Ratio"
              value={liquidityRatios.currentRatio.toFixed(2)}
              benchmark={benchmarks.benchmarkMetrics.medianCurrentRatio}
              ideal="2.0+"
            />
            <RatioRow
              label="Quick Ratio"
              value={liquidityRatios.quickRatio.toFixed(2)}
              benchmark={1.5}
              ideal="1.0+"
            />
            <RatioRow
              label="Cash Ratio"
              value={liquidityRatios.cashRatio.toFixed(2)}
              benchmark={0.5}
              ideal="0.2+"
            />
            <RatioRow
              label="Days of Cash on Hand"
              value={liquidityRatios.daysOfCashOnHand.toFixed(0)}
              benchmark={45}
              ideal="30+ days"
            />
          </div>
        </CardContent>
      </Card>

      {/* Profitability Ratios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Profitability Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RatioRow
              label="Gross Margin"
              value={`${profitabilityRatios.grossProfitMargin.toFixed(1)}%`}
              benchmark={benchmarks.benchmarkMetrics.medianGrossMargin}
              ideal="35%+"
            />
            <RatioRow
              label="Operating Margin"
              value={`${profitabilityRatios.operatingProfitMargin.toFixed(1)}%`}
              benchmark={benchmarks.benchmarkMetrics.medianOperatingMargin}
              ideal="8%+"
            />
            <RatioRow
              label="Net Margin"
              value={`${profitabilityRatios.netProfitMargin.toFixed(1)}%`}
              benchmark={benchmarks.benchmarkMetrics.medianNetMargin}
              ideal="5%+"
            />
            <RatioRow
              label="Return on Equity"
              value={`${profitabilityRatios.returnOnEquity.toFixed(1)}%`}
              benchmark={benchmarks.benchmarkMetrics.medianROE}
              ideal="15%+"
            />
          </div>
        </CardContent>
      </Card>

      {/* Leverage Ratios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Leverage Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RatioRow
              label="Debt to Equity"
              value={leverageRatios.debtToEquityRatio.toFixed(2)}
              benchmark={benchmarks.benchmarkMetrics.medianDebtToEquity}
              ideal="<0.5"
              isReverse
            />
            <RatioRow
              label="Debt to Assets"
              value={leverageRatios.debtToAssetsRatio.toFixed(2)}
              benchmark={0.3}
              ideal="<0.3"
              isReverse
            />
            <RatioRow
              label="Times Interest Earned"
              value={leverageRatios.timesInterestEarned.toFixed(1)}
              benchmark={5.0}
              ideal="5.0+"
            />
            <RatioRow
              label="Debt Service Coverage"
              value={leverageRatios.debtServiceCoverage.toFixed(2)}
              benchmark={1.5}
              ideal="1.25+"
            />
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Ratios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-purple-600">Efficiency Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RatioRow
              label="Asset Turnover"
              value={efficiencyRatios.assetTurnover.toFixed(2)}
              benchmark={benchmarks.benchmarkMetrics.medianAssetTurnover}
              ideal="1.0+"
            />
            <RatioRow
              label="Inventory Turnover"
              value={efficiencyRatios.inventoryTurnover.toFixed(1)}
              benchmark={6.0}
              ideal="6.0+"
            />
            <RatioRow
              label="Receivables Turnover"
              value={efficiencyRatios.receivablesTurnover.toFixed(1)}
              benchmark={12.0}
              ideal="12.0+"
            />
            <RatioRow
              label="Working Capital Turnover"
              value={efficiencyRatios.workingCapitalTurnover.toFixed(2)}
              benchmark={4.0}
              ideal="4.0+"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Ratio Row Component
function RatioRow({ label, value, benchmark, ideal, isReverse = false }) {
  const numericValue = parseFloat(value.replace('%', ''))
  const isGood = isReverse ? numericValue <= benchmark : numericValue >= benchmark
  const statusColor = isGood ? 'text-green-600' : 'text-orange-600'
  const statusIcon = isGood ? CheckCircleIcon : AlertTriangleIcon

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-gray-600">Ideal: {ideal}</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold">{value}</div>
        <div className={`flex items-center gap-1 text-sm ${statusColor}`}>
          <statusIcon className="h-3 w-3" />
          <span>vs {benchmark}</span>
        </div>
      </div>
    </div>
  )
}

// Trend Analysis View
function TrendAnalysisView({ trendAnalysis, seasonalAnalysis }) {
  const trendData = trendAnalysis.revenueGrowthTrend.map((value, index) => ({
    month: `Month ${index + 1}`,
    revenue: value,
    profit: trendAnalysis.profitabilityTrend[index] || 0,
    liquidity: trendAnalysis.liquidityTrend[index] || 0
  }))

  return (
    <div className="space-y-6">
      {/* Revenue & Profitability Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Profitability Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue Growth %" />
              <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit Growth %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seasonal Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Quarterly Patterns</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seasonalAnalysis.quarterlyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenueIndex" fill="#3B82F6" name="Revenue Index" />
                  <Bar dataKey="profitabilityIndex" fill="#10B981" name="Profitability Index" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Seasonality Impact</h4>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium">Revenue Seasonality</div>
                  <div className="text-2xl font-bold text-blue-600">{seasonalAnalysis.revenueSeasonality.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Seasonal variation in revenue</div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium">Expense Seasonality</div>
                  <div className="text-2xl font-bold text-green-600">{seasonalAnalysis.expenseSeasonality.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Seasonal variation in expenses</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium">Overall Impact</div>
                  <div className="text-2xl font-bold text-purple-600">{seasonalAnalysis.seasonalityImpact}</div>
                  <div className="text-sm text-gray-600">Business seasonality level</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Forecast View
function ForecastView({ forecasts, scenarios }) {
  const forecastData = forecasts.revenueForecasts.slice(0, 6).map((forecast, index) => ({
    period: forecast.period,
    revenue: Number(forecast.value),
    confidence: forecast.confidenceLevel
  }))

  return (
    <div className="space-y-6">
      {/* Revenue Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecasts (Next 6 Months)</CardTitle>
          <p className="text-sm text-gray-600">Based on {forecasts.methodology} methodology</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${formatNumber(value)}`, 'Forecasted Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Optimistic Scenario */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-800">{scenarios.optimisticCase.scenarioName}</h4>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {scenarios.optimisticCase.probability}% likely
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-medium">${formatNumber(scenarios.optimisticCase.financialImpact.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit:</span>
                  <span className="font-medium">${formatNumber(scenarios.optimisticCase.financialImpact.profit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth:</span>
                  <span className="font-medium text-green-600">+{scenarios.optimisticCase.keyMetrics.revenueGrowth}%</span>
                </div>
              </div>
            </div>

            {/* Base Case Scenario */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-800">{scenarios.baseCase.scenarioName}</h4>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {scenarios.baseCase.probability}% likely
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-medium">${formatNumber(scenarios.baseCase.financialImpact.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit:</span>
                  <span className="font-medium">${formatNumber(scenarios.baseCase.financialImpact.profit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth:</span>
                  <span className="font-medium text-blue-600">+{scenarios.baseCase.keyMetrics.revenueGrowth}%</span>
                </div>
              </div>
            </div>

            {/* Pessimistic Scenario */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-red-800">{scenarios.pessimisticCase.scenarioName}</h4>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {scenarios.pessimisticCase.probability}% likely
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-medium">${formatNumber(scenarios.pessimisticCase.financialImpact.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit:</span>
                  <span className="font-medium">${formatNumber(scenarios.pessimisticCase.financialImpact.profit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth:</span>
                  <span className="font-medium text-red-600">{scenarios.pessimisticCase.keyMetrics.revenueGrowth}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Utility function for number formatting
function formatNumber(value: any): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value)
  if (isNaN(num)) return '0'

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }
}

// Mock data for demonstration
const mockFinancialData: ComprehensiveFinancialAnalysis = {
  reportingPeriod: {
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-31'),
    fiscalYear: 2024,
    fiscalQuarter: 1,
    fiscalMonth: 3,
    isCurrentPeriod: true,
    isComparativePeriod: false
  },
  organizationId: 'org-123',
  incomeStatement: {
    reportingPeriod: {
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      fiscalYear: 2024,
      fiscalQuarter: 1,
      fiscalMonth: 3,
      isCurrentPeriod: true,
      isComparativePeriod: false
    },
    currency: 'USD',
    grossRevenue: new (require('@prisma/client/runtime/library').Decimal)(1250000),
    salesReturns: new (require('@prisma/client/runtime/library').Decimal)(25000),
    netRevenue: new (require('@prisma/client/runtime/library').Decimal)(1225000),
    beginningInventory: new (require('@prisma/client/runtime/library').Decimal)(150000),
    purchases: new (require('@prisma/client/runtime/library').Decimal)(450000),
    directLabor: new (require('@prisma/client/runtime/library').Decimal)(0),
    manufacturingOverhead: new (require('@prisma/client/runtime/library').Decimal)(0),
    endingInventory: new (require('@prisma/client/runtime/library').Decimal)(175000),
    costOfGoodsSold: new (require('@prisma/client/runtime/library').Decimal)(425000),
    grossProfit: new (require('@prisma/client/runtime/library').Decimal)(800000),
    grossProfitMargin: 65.3,
    operatingExpenses: {
      salariesAndWages: new (require('@prisma/client/runtime/library').Decimal)(285000),
      employeeBenefits: new (require('@prisma/client/runtime/library').Decimal)(45000),
      rent: new (require('@prisma/client/runtime/library').Decimal)(72000),
      utilities: new (require('@prisma/client/runtime/library').Decimal)(18000),
      insurance: new (require('@prisma/client/runtime/library').Decimal)(12000),
      depreciation: new (require('@prisma/client/runtime/library').Decimal)(25000),
      amortization: new (require('@prisma/client/runtime/library').Decimal)(8000),
      marketing: new (require('@prisma/client/runtime/library').Decimal)(35000),
      professionalServices: new (require('@prisma/client/runtime/library').Decimal)(22000),
      travel: new (require('@prisma/client/runtime/library').Decimal)(15000),
      officeExpenses: new (require('@prisma/client/runtime/library').Decimal)(18000),
      maintenance: new (require('@prisma/client/runtime/library').Decimal)(12000),
      supplies: new (require('@prisma/client/runtime/library').Decimal)(8000),
      other: new (require('@prisma/client/runtime/library').Decimal)(15000)
    },
    totalOperatingExpenses: new (require('@prisma/client/runtime/library').Decimal)(590000),
    operatingIncome: new (require('@prisma/client/runtime/library').Decimal)(210000),
    operatingMargin: 17.1,
    otherIncome: new (require('@prisma/client/runtime/library').Decimal)(8000),
    interestIncome: new (require('@prisma/client/runtime/library').Decimal)(3000),
    interestExpense: new (require('@prisma/client/runtime/library').Decimal)(12000),
    otherExpenses: new (require('@prisma/client/runtime/library').Decimal)(5000),
    earningsBeforeTax: new (require('@prisma/client/runtime/library').Decimal)(204000),
    incomeTaxExpense: new (require('@prisma/client/runtime/library').Decimal)(51000),
    effectiveTaxRate: 25.0,
    netIncome: new (require('@prisma/client/runtime/library').Decimal)(153000),
    netProfitMargin: 12.5,
    ebitda: new (require('@prisma/client/runtime/library').Decimal)(243000),
    ebitdaMargin: 19.8,
    priorPeriodComparison: {
      revenueGrowth: 8.5,
      grossProfitGrowth: 9.2,
      operatingIncomeGrowth: 15.3,
      netIncomeGrowth: 12.3,
      marginTrends: {
        grossMarginChange: 1.2,
        operatingMarginChange: 0.8,
        netMarginChange: 0.5
      }
    }
  },
  // ... (other mock data properties would continue here)
  // For brevity, I'm showing the structure but not all mock data
  balanceSheet: {} as any,
  cashFlowStatement: {} as any,
  liquidityRatios: {
    currentRatio: 2.3,
    quickRatio: 1.8,
    cashRatio: 0.9,
    workingCapitalRatio: 0.25,
    defensiveInterval: 45,
    cashConversionCycle: 42,
    daysOfCashOnHand: 67
  },
  leverageRatios: {
    debtToEquityRatio: 0.32,
    debtToAssetsRatio: 0.19,
    timesInterestEarned: 17.5,
    debtServiceCoverage: 8.2,
    longTermDebtToCapitalization: 0.15,
    capitalAdequacyRatio: 0.81,
    leverageMultiplier: 1.23
  },
  profitabilityRatios: {
    grossProfitMargin: 65.3,
    operatingProfitMargin: 17.1,
    netProfitMargin: 12.5,
    returnOnAssets: 8.9,
    returnOnEquity: 11.2,
    returnOnInvestedCapital: 13.8,
    ebitdaMargin: 19.8,
    economicValueAdded: new (require('@prisma/client/runtime/library').Decimal)(45000)
  },
  efficiencyRatios: {
    assetTurnover: 0.71,
    inventoryTurnover: 8.5,
    receivablesTurnover: 14.2,
    payablesTurnover: 12.8,
    fixedAssetTurnover: 1.2,
    workingCapitalTurnover: 2.8,
    cashCycle: 42,
    employeeProductivity: 185000
  },
  marketRatios: {},
  dupont: {
    returnOnEquity: 11.2,
    netProfitMargin: 12.5,
    assetTurnover: 0.71,
    equityMultiplier: 1.23,
    returnOnAssets: 8.9,
    leverageEffect: 0.23
  },
  commonSize: {
    incomeStatement: {
      'Cost of Goods Sold': 34.7,
      'Operating Expenses': 48.2,
      'Net Income': 12.5
    },
    balanceSheet: {
      'Current Assets': 42.5,
      'Fixed Assets': 57.5,
      'Current Liabilities': 18.9
    }
  },
  trendAnalysis: {
    period: 12,
    revenueGrowthTrend: [5.2, 6.1, 7.3, 8.1, 8.5, 9.2, 8.8, 8.3, 7.9, 8.4, 8.7, 8.5],
    profitabilityTrend: [12.1, 13.2, 14.1, 15.3, 14.8, 15.6, 16.2, 15.9, 16.4, 16.8, 17.1, 16.9],
    liquidityTrend: [2.1, 2.2, 2.3, 2.1, 2.4, 2.3, 2.5, 2.4, 2.6, 2.5, 2.4, 2.3],
    leverageTrend: [0.3, 0.32, 0.29, 0.31, 0.28, 0.30, 0.27, 0.29, 0.26, 0.28, 0.25, 0.27],
    seasonalPatterns: []
  },
  seasonalAnalysis: {
    quarterlyPatterns: [
      { period: 'Q1', revenueIndex: 95, expenseIndex: 102, profitabilityIndex: 88 },
      { period: 'Q2', revenueIndex: 103, expenseIndex: 98, profitabilityIndex: 108 },
      { period: 'Q3', revenueIndex: 108, expenseIndex: 96, profitabilityIndex: 112 },
      { period: 'Q4', revenueIndex: 112, expenseIndex: 104, profitabilityIndex: 118 }
    ],
    monthlyPatterns: [],
    revenueSeasonality: 15.2,
    expenseSeasonality: 8.3,
    seasonalityImpact: 'MEDIUM'
  },
  kpis: {
    revenueGrowthRate: 8.5,
    profitGrowthRate: 12.3,
    cashFlowGrowthRate: 9.8,
    marginExpansion: 1.2,
    operationalLeverage: 1.45,
    costOfCapital: 8.5,
    investmentReturn: 14.2,
    capitalEfficiency: 0.85,
    earningsVolatility: 0.15,
    businessRiskScore: 65,
    financialRiskScore: 45,
    overallRiskRating: 'MEDIUM',
    marketShareGrowth: 2.1,
    customerRetentionRate: 87.5,
    customerAcquisitionCost: new (require('@prisma/client/runtime/library').Decimal)(125),
    lifetimeValue: new (require('@prisma/client/runtime/library').Decimal)(2850),
    financialHealthScore: 87
  },
  benchmarks: {
    industryCode: 'RETAIL_441',
    industryName: 'Retail Trade',
    benchmarkMetrics: {
      medianGrossMargin: 35.2,
      medianOperatingMargin: 8.5,
      medianNetMargin: 5.2,
      medianCurrentRatio: 2.1,
      medianDebtToEquity: 0.45,
      medianROE: 15.8,
      medianROA: 8.2,
      medianAssetTurnover: 1.2
    },
    performanceVsBenchmark: {
      grossMargin: 'OUTPERFORMING',
      operatingMargin: 'OUTPERFORMING',
      netMargin: 'OUTPERFORMING',
      currentRatio: 'AT_BENCHMARK'
    }
  },
  riskMetrics: {
    creditRisk: 'LOW',
    liquidityRisk: 'LOW',
    operationalRisk: 'MEDIUM',
    marketRisk: 'MEDIUM',
    riskFactors: [
      {
        category: 'Market',
        description: 'Customer concentration risk',
        impact: 'MEDIUM',
        probability: 0.3,
        mitigationStrategy: 'Diversify customer base'
      }
    ],
    overallRiskScore: 65,
    recommendedActions: [
      'Monitor key customer relationships',
      'Maintain adequate cash reserves'
    ]
  },
  creditAnalysis: {
    creditScore: 750,
    creditRating: 'A-',
    probabilityOfDefault: 0.02,
    lossGivenDefault: 0.4,
    expectedLoss: new (require('@prisma/client/runtime/library').Decimal)(5000),
    creditLimits: {
      recommended: new (require('@prisma/client/runtime/library').Decimal)(500000),
      maximum: new (require('@prisma/client/runtime/library').Decimal)(750000),
      current: new (require('@prisma/client/runtime/library').Decimal)(300000)
    }
  },
  forecasts: {
    forecastPeriods: 12,
    methodology: 'LINEAR',
    revenueForecasts: [
      {
        period: 'Month 1',
        value: new (require('@prisma/client/runtime/library').Decimal)(1285000),
        confidenceLevel: 90,
        assumptions: ['Historical trends', 'Market stability']
      },
      {
        period: 'Month 2',
        value: new (require('@prisma/client/runtime/library').Decimal)(1345000),
        confidenceLevel: 88,
        assumptions: ['Historical trends', 'Market stability']
      },
      {
        period: 'Month 3',
        value: new (require('@prisma/client/runtime/library').Decimal)(1405000),
        confidenceLevel: 85,
        assumptions: ['Historical trends', 'Market stability']
      },
      {
        period: 'Month 4',
        value: new (require('@prisma/client/runtime/library').Decimal)(1465000),
        confidenceLevel: 82,
        assumptions: ['Historical trends', 'Market stability']
      },
      {
        period: 'Month 5',
        value: new (require('@prisma/client/runtime/library').Decimal)(1525000),
        confidenceLevel: 80,
        assumptions: ['Historical trends', 'Market stability']
      },
      {
        period: 'Month 6',
        value: new (require('@prisma/client/runtime/library').Decimal)(1585000),
        confidenceLevel: 78,
        assumptions: ['Historical trends', 'Market stability']
      }
    ],
    expenseForecasts: [],
    profitabilityForecasts: [],
    cashFlowForecasts: [],
    confidenceIntervals: {
      revenue: { lower: 0.85, upper: 1.15, confidence: 85 }
    }
  },
  scenarios: {
    baseCase: {
      scenarioName: 'Base Case',
      probability: 60,
      assumptions: ['Current trends continue', 'Stable market conditions'],
      financialImpact: {
        revenue: new (require('@prisma/client/runtime/library').Decimal)(1323000),
        expenses: new (require('@prisma/client/runtime/library').Decimal)(619500),
        profit: new (require('@prisma/client/runtime/library').Decimal)(171360),
        cashFlow: new (require('@prisma/client/runtime/library').Decimal)(168300)
      },
      keyMetrics: {
        revenueGrowth: 8.0,
        profitGrowth: 12.0,
        marginExpansion: 0.3
      }
    },
    optimisticCase: {
      scenarioName: 'Optimistic Case',
      probability: 25,
      assumptions: ['Market expansion', 'New product success'],
      financialImpact: {
        revenue: new (require('@prisma/client/runtime/library').Decimal)(1470000),
        expenses: new (require('@prisma/client/runtime/library').Decimal)(637200),
        profit: new (require('@prisma/client/runtime/library').Decimal)(206550),
        cashFlow: new (require('@prisma/client/runtime/library').Decimal)(191250)
      },
      keyMetrics: {
        revenueGrowth: 20.0,
        profitGrowth: 35.0,
        marginExpansion: 2.5
      }
    },
    pessimisticCase: {
      scenarioName: 'Pessimistic Case',
      probability: 15,
      assumptions: ['Economic downturn', 'Increased competition'],
      financialImpact: {
        revenue: new (require('@prisma/client/runtime/library').Decimal)(1127000),
        expenses: new (require('@prisma/client/runtime/library').Decimal)(601800),
        profit: new (require('@prisma/client/runtime/library').Decimal)(114750),
        cashFlow: new (require('@prisma/client/runtime/library').Decimal)(130050)
      },
      keyMetrics: {
        revenueGrowth: -8.0,
        profitGrowth: -25.0,
        marginExpansion: -1.8
      }
    },
    customScenarios: []
  },
  alerts: [
    {
      type: 'warning',
      category: 'Inventory',
      title: 'Inventory Turnover Below Target',
      message: 'Inventory turnover rate is 8.5x, below the target of 10x for retail businesses.',
      actionRequired: true,
      impact: 'medium',
      dueDate: new Date('2024-04-15')
    },
    {
      type: 'info',
      category: 'Performance',
      title: 'Strong Profit Margins',
      message: 'Net profit margin of 12.5% significantly exceeds industry average of 5.2%.',
      actionRequired: false,
      impact: 'low'
    }
  ],
  auditTrail: {
    reportGeneratedDate: new Date(),
    reportGeneratedBy: 'System',
    dataSourcesUsed: ['sales_orders', 'inventory', 'expenses'],
    calculationMethodologies: ['GAAP', 'Standard ratios'],
    assumptionsMade: ['Linear depreciation', 'Tax rate estimates'],
    limitations: ['Estimated expense allocations'],
    reviewStatus: 'DRAFT'
  },
  regulatoryCompliance: {
    gaapCompliance: true,
    ifrsCompliance: true,
    taxComplianceStatus: 'COMPLIANT',
    requiredFilings: [],
    complianceAlerts: []
  }
}

export default ComprehensiveFinancialDashboard