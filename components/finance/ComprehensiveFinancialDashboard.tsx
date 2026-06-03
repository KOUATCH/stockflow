"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { getFinancialMetrics, type FinancialMetrics } from "@/actions/analytics/financial-analytics"
import { getPayableSummary } from "@/actions/finance/accounts-payable-actions"
import { getReceivableSummary } from "@/actions/finance/accounts-receivable-actions"
import { useClientAuth } from "@/hooks/useClientAuth"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subDays } from "date-fns"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpIcon,
  ArrowDownIcon,
  Calculator,
  Wallet,
  Target,
  AlertTriangle,
  Percent,
  Building2,
  Receipt,
  Activity,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Clock,
  Users,
  CreditCard,
  Calendar
} from "lucide-react"

interface ComprehensiveFinancialDashboardProps {
  organizationId?: string
  locationId?: string
}

const ComprehensiveFinancialDashboard = ({
  organizationId = "default-org",
  locationId = "1"
}: ComprehensiveFinancialDashboardProps) => {
  const { organizationId: authOrgId } = useClientAuth()
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedLocation, setSelectedLocation] = useState(locationId)
  const [activeView, setActiveView] = useState("overview")
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null)
  const [payableSummary, setPayableSummary] = useState<any>(null)
  const [receivableSummary, setReceivableSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const orgId = organizationId || authOrgId || ""
  const locId = locationId || "default-location"

  const getDateRange = (period: string) => {
    const now = new Date()
    switch (period) {
      case "week":
        return { start: startOfWeek(now), end: endOfWeek(now) }
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case "quarter":
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0)
        return { start: quarterStart, end: quarterEnd }
      case "year":
        return { start: startOfYear(now), end: endOfYear(now) }
      case "ytd":
        return { start: startOfYear(now), end: now }
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }

  useEffect(() => {
    async function fetchFinancialData() {
      if (!orgId) return

      try {
        setLoading(true)
        const { start, end } = getDateRange(selectedPeriod)

        // Fetch all financial data in parallel
        const [metricsData, payableData, receivableData] = await Promise.all([
          getFinancialMetrics(orgId, locId, start, end),
          getPayableSummary(orgId),
          getReceivableSummary(orgId)
        ])

        setFinancialMetrics(metricsData)
        setPayableSummary(payableData.success ? payableData.data : null)
        setReceivableSummary(receivableData.success ? receivableData.data : null)
      } catch (error) {
        console.error("Error fetching financial data:", error)
        // Set default data on error
        setFinancialMetrics({
          revenue: {
            total: 0,
            growth: 0,
            recurring: 0,
            oneTime: 0,
            forecast: 0,
            target: 0,
            achievement: 0
          },
          profitability: {
            grossProfit: 0,
            grossMargin: 0,
            netProfit: 0,
            netMargin: 0,
            ebitda: 0,
            ebitdaMargin: 0,
            operatingProfit: 0
          },
          expenses: {
            total: 0,
            cogs: 0,
            operational: 0,
            salaries: 0,
            rent: 0,
            utilities: 0,
            marketing: 0,
            other: 0
          },
          cashFlow: {
            operating: 0,
            investing: 0,
            financing: 0,
            netCashFlow: 0,
            cashOnHand: 0,
            burnRate: 0
          },
          assets: {
            total: 0,
            current: 0,
            inventory: 0,
            receivables: 0,
            cash: 0,
            fixedAssets: 0
          },
          liabilities: {
            total: 0,
            current: 0,
            payables: 0,
            accrued: 0,
            longTerm: 0,
            loans: 0
          },
          ratios: {
            currentRatio: 0,
            quickRatio: 0,
            debtToEquity: 0,
            roe: 0,
            roa: 0,
            grossMarginTrend: 0,
            inventoryTurnover: 0,
            receivablesTurnover: 0
          },
          taxes: {
            salesTax: 0,
            incomeTax: 0,
            payrollTax: 0,
            totalTaxLiability: 0,
            taxRate: 0
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialData()
  }, [orgId, locId, selectedPeriod])

  // Use real data or loading state
  const currentMetrics = financialMetrics || {
    revenue: { total: 0, growth: 0, recurring: 0, oneTime: 0, forecast: 0, target: 0, achievement: 0 },
    profitability: { grossProfit: 0, grossMargin: 0, netProfit: 0, netMargin: 0, ebitda: 0, ebitdaMargin: 0, operatingProfit: 0 },
    expenses: { total: 0, cogs: 0, operational: 0, salaries: 0, rent: 0, utilities: 0, marketing: 0, other: 0 },
    cashFlow: { operating: 0, investing: 0, financing: 0, netCashFlow: 0, cashOnHand: 0, burnRate: 0 },
    assets: { total: 0, current: 0, inventory: 0, receivables: 0, cash: 0, fixedAssets: 0 },
    liabilities: { total: 0, current: 0, payables: 0, accrued: 0, longTerm: 0, loans: 0 },
    ratios: { currentRatio: 0, quickRatio: 0, debtToEquity: 0, roe: 0, roa: 0, grossMarginTrend: 0, inventoryTurnover: 0, receivablesTurnover: 0 },
    taxes: { salesTax: 0, incomeTax: 0, payrollTax: 0, totalTaxLiability: 0, taxRate: 0 }
  }


  const getCardColors = (index: number) => {
    const colorSchemes = [
      {
        bg: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
        border: "border-emerald-200/40 dark:border-emerald-800/40",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        textColor: "text-emerald-600 dark:text-emerald-400",
        valueColor: "text-emerald-900 dark:text-emerald-100"
      },
      {
        bg: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
        border: "border-blue-200/40 dark:border-blue-800/40",
        iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
        iconColor: "text-blue-600 dark:text-blue-400",
        textColor: "text-blue-600 dark:text-blue-400",
        valueColor: "text-blue-900 dark:text-blue-100"
      },
      {
        bg: "from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20",
        border: "border-orange-200/40 dark:border-orange-800/40",
        iconBg: "bg-orange-500/10 dark:bg-orange-400/10",
        iconColor: "text-orange-600 dark:text-orange-400",
        textColor: "text-orange-600 dark:text-orange-400",
        valueColor: "text-orange-900 dark:text-orange-100"
      },
      {
        bg: "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20",
        border: "border-purple-200/40 dark:border-purple-800/40",
        iconBg: "bg-purple-500/10 dark:bg-purple-400/10",
        iconColor: "text-purple-600 dark:text-purple-400",
        textColor: "text-purple-600 dark:text-purple-400",
        valueColor: "text-purple-900 dark:text-purple-100"
      },
      {
        bg: "from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20",
        border: "border-teal-200/40 dark:border-teal-800/40",
        iconBg: "bg-teal-500/10 dark:bg-teal-400/10",
        iconColor: "text-teal-600 dark:text-teal-400",
        textColor: "text-teal-600 dark:text-teal-400",
        valueColor: "text-teal-900 dark:text-teal-100"
      }
    ]
    return colorSchemes[index % colorSchemes.length]
  }

  const financialStats = [
    {
      title: "Total Revenue",
      value: loading ? "Loading..." : `$${currentMetrics.revenue.total.toLocaleString()}`,
      change: loading ? "..." : `+${currentMetrics.revenue.growth.toFixed(1)}%`,
      trend: "up",
      icon: DollarSign,
      description: "vs last period",
    },
    {
      title: "Net Profit",
      value: loading ? "Loading..." : `$${currentMetrics.profitability.netProfit.toLocaleString()}`,
      change: loading ? "..." : `${currentMetrics.profitability.netMargin.toFixed(1)}%`,
      trend: "up",
      icon: TrendingUp,
      description: "profit margin",
    },
    {
      title: "Cash Flow",
      value: loading ? "Loading..." : `$${currentMetrics.cashFlow.netCashFlow.toLocaleString()}`,
      change: loading ? "..." : currentMetrics.cashFlow.netCashFlow >= 0 ? "Positive" : "Negative",
      trend: currentMetrics.cashFlow.netCashFlow >= 0 ? "up" : "down",
      icon: Wallet,
      description: "net cash flow",
    },
    {
      title: "Total Assets",
      value: loading ? "Loading..." : `$${(currentMetrics.assets.total / 1000000).toFixed(1)}M`,
      change: loading ? "..." : "Asset base",
      trend: "up",
      icon: Building2,
      description: "total assets",
    },
    {
      title: "A/P Outstanding",
      value: loading ? "Loading..." : `$${((payableSummary?.outstandingAmount || 0) / 1000).toFixed(0)}K`,
      change: loading ? "..." : payableSummary?.overdueCount ? `${payableSummary.overdueCount} overdue` : "All current",
      trend: (payableSummary?.overdueCount || 0) > 0 ? "down" : "up",
      icon: CreditCard,
      description: "accounts payable",
    },
    {
      title: "A/R Outstanding",
      value: loading ? "Loading..." : `$${((receivableSummary?.outstandingAmount || 0) / 1000).toFixed(0)}K`,
      change: loading ? "..." : receivableSummary?.overdueCount ? `${receivableSummary.overdueCount} overdue` : "All current",
      trend: (receivableSummary?.overdueCount || 0) > 0 ? "down" : "up",
      icon: Users,
      description: "accounts receivable",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {financialStats.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.trend === "up"
          const colors = getCardColors(index)

          return (
            <div key={index} className={`bg-gradient-to-br ${colors.bg} p-4 rounded-xl border ${colors.border}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                  <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${colors.textColor} uppercase tracking-wide`}>
                    {stat.title}
                  </p>
                  <p className={`text-xl font-bold ${colors.valueColor}`}>{stat.value}</p>
                </div>
                <div className="flex items-center text-xs">
                  {isPositive ? <ArrowUpIcon className="mr-1 h-3 w-3 text-emerald-600" /> : <ArrowDownIcon className="mr-1 h-3 w-3 text-red-600" />}
                  <span className={isPositive ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-red-700 dark:text-red-400 font-semibold"}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="payables">Accounts Payable</TabsTrigger>
          <TabsTrigger value="receivables">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Financial Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Cash Flow</p>
                    <p className="text-lg font-bold text-emerald-900">
                      {loading ? "..." : currentMetrics.cashFlow.netCashFlow >= 0 ? "Positive" : "Negative"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">Payables Due</p>
                    <p className="text-lg font-bold text-blue-900">
                      {loading ? "..." : `$${((payableSummary?.dueSoonAmount || 0) / 1000).toFixed(0)}K`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Receivables Due</p>
                    <p className="text-lg font-bold text-green-900">
                      {loading ? "..." : `$${((receivableSummary?.dueSoonAmount || 0) / 1000).toFixed(0)}K`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700">Working Capital</p>
                    <p className="text-lg font-bold text-purple-900">
                      {loading ? "..." : `$${((currentMetrics.assets.current - currentMetrics.liabilities.current) / 1000000).toFixed(1)}M`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Analysis Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profit & Loss Card */}
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Profit & Loss Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Revenue</span>
                    <span className="font-bold text-green-600">+${currentMetrics.revenue.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cost of Goods Sold</span>
                    <span className="font-medium text-red-600">-${currentMetrics.expenses.cogs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-medium">Gross Profit</span>
                    <span className="font-bold">${currentMetrics.profitability.grossProfit.toLocaleString()} ({currentMetrics.profitability.grossMargin.toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operating Expenses</span>
                    <span className="font-medium text-red-600">-${currentMetrics.expenses.operational.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2 bg-gray-50 p-2 rounded">
                    <span className="text-sm font-bold">Net Profit</span>
                    <span className="font-bold text-green-600">${currentMetrics.profitability.netProfit.toLocaleString()} ({currentMetrics.profitability.netMargin.toFixed(1)}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Cash Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">Operating</span>
                      <span className="font-bold text-green-700">+${currentMetrics.cashFlow.operating.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red-800">Investing</span>
                      <span className="font-bold text-red-700">${currentMetrics.cashFlow.investing.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">Financing</span>
                      <span className="font-bold text-blue-700">${currentMetrics.cashFlow.financing.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                      <span className="text-sm font-bold">Net Cash Flow</span>
                      <span className="font-bold text-green-600">+${currentMetrics.cashFlow.netCashFlow.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Ratios and Goals */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Financial Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Key Financial Ratios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{currentMetrics.ratios.currentRatio}</p>
                    <p className="text-xs text-green-600">Current Ratio</p>
                    <p className="text-xs text-gray-500">Excellent</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{currentMetrics.ratios.roe}%</p>
                    <p className="text-xs text-blue-600">ROE</p>
                    <p className="text-xs text-gray-500">Strong</p>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <p className="text-2xl font-bold text-teal-700">{currentMetrics.ratios.debtToEquity}</p>
                    <p className="text-xs text-teal-600">Debt-to-Equity</p>
                    <p className="text-xs text-gray-500">Low Risk</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-700">{currentMetrics.ratios.inventoryTurnover}x</p>
                    <p className="text-xs text-orange-600">Inventory Turnover</p>
                    <p className="text-xs text-gray-500">Efficient</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Financial Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Revenue Target</span>
                    <span>{currentMetrics.revenue.achievement}%</span>
                  </div>
                  <Progress value={currentMetrics.revenue.achievement} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Profit Margin</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cost Control</span>
                    <span>95.2%</span>
                  </div>
                  <Progress value={95.2} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cash Flow</span>
                    <span>88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payables" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Payables Summary Cards */}
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <CreditCard className="h-5 w-5" />
                  Total Payables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    ${loading ? "..." : (payableSummary?.totalAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {loading ? "..." : payableSummary?.totalCount || 0} invoices
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <Clock className="h-5 w-5" />
                  Outstanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    ${loading ? "..." : (payableSummary?.outstandingAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Unpaid balance
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    ${loading ? "..." : (payableSummary?.overdueAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {loading ? "..." : payableSummary?.overdueCount || 0} overdue invoices
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Calendar className="h-5 w-5" />
                  Due Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ${loading ? "..." : (payableSummary?.dueSoonAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Due next 7 days
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payables Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Accounts Payable Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col gap-2" variant="outline">
                  <CreditCard className="h-6 w-6" />
                  <span>Create Invoice</span>
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline">
                  <DollarSign className="h-6 w-6" />
                  <span>Record Payment</span>
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline">
                  <FileText className="h-6 w-6" />
                  <span>View All Payables</span>
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Recent Activities</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Payment processed - INV-2024-001</span>
                    </div>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Invoice overdue - INV-2024-002</span>
                    </div>
                    <span className="text-sm text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Receivables Summary Cards */}
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-200/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Users className="h-5 w-5" />
                  Total Receivables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ${loading ? "..." : (receivableSummary?.totalAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {loading ? "..." : receivableSummary?.totalCount || 0} invoices
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Clock className="h-5 w-5" />
                  Outstanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ${loading ? "..." : (receivableSummary?.outstandingAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Pending collection
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    ${loading ? "..." : (receivableSummary?.overdueAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {loading ? "..." : receivableSummary?.overdueCount || 0} overdue invoices
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <TrendingUp className="h-5 w-5" />
                  Collection Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {loading ? "..." : receivableSummary ?
                      ((receivableSummary.paidAmount / (receivableSummary.totalAmount || 1)) * 100).toFixed(1) + "%"
                      : "0%"
                    }
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Collection efficiency
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aging Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Aging Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {receivableSummary?.aging?.map((age: any, index: number) => (
                  <div key={age.range} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">${age.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{age.range} days</p>
                    <p className="text-xs text-gray-500">{age.count} invoices</p>
                  </div>
                )) || Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">$0</p>
                    <p className="text-sm text-gray-600">—</p>
                    <p className="text-xs text-gray-500">0 invoices</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Receivables Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Accounts Receivable Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col gap-2" variant="outline">
                  <FileText className="h-6 w-6" />
                  <span>Create Invoice</span>
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline">
                  <DollarSign className="h-6 w-6" />
                  <span>Record Payment</span>
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline">
                  <Activity className="h-6 w-6" />
                  <span>Send Reminder</span>
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Recent Activities</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Payment received - INV-R-2024-001</span>
                    </div>
                    <span className="text-sm text-gray-500">1 hour ago</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Reminder sent - INV-R-2024-002</span>
                    </div>
                    <span className="text-sm text-gray-500">3 hours ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Balance Sheet Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Balance Sheet Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Assets</h4>
                    <div className="space-y-2 ml-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Assets</span>
                        <span>${currentMetrics.assets.current.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fixed Assets</span>
                        <span>${currentMetrics.assets.fixedAssets.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total Assets</span>
                        <span>${currentMetrics.assets.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Liabilities</h4>
                    <div className="space-y-2 ml-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Liabilities</span>
                        <span>${currentMetrics.liabilities.current.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Long-term Liabilities</span>
                        <span>${currentMetrics.liabilities.longTerm.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total Liabilities</span>
                        <span>${currentMetrics.liabilities.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="flex justify-between font-bold">
                      <span>Shareholders' Equity</span>
                      <span>${(currentMetrics.assets.total - currentMetrics.liabilities.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Salaries & Benefits</span>
                    <span className="font-bold">${currentMetrics.expenses.salaries.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rent & Utilities</span>
                    <span className="font-bold">${(currentMetrics.expenses.rent + currentMetrics.expenses.utilities).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Marketing & Advertising</span>
                    <span className="font-bold">${currentMetrics.expenses.marketing.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Other Expenses</span>
                    <span className="font-bold">${currentMetrics.expenses.other.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2 bg-gray-50 p-2 rounded">
                    <span className="text-sm font-bold">Total Operating Expenses</span>
                    <span className="font-bold text-red-600">${currentMetrics.expenses.operational.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Month</span>
                    <span className="font-bold">${currentMetrics.revenue.forecast.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Quarter</span>
                    <span className="font-bold">${(currentMetrics.revenue.forecast * 3).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Year</span>
                    <span className="font-bold">${(currentMetrics.revenue.forecast * 12).toLocaleString()}</span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Growth Projection</p>
                    <p className="text-xs text-blue-600">Based on current trends: {currentMetrics.revenue.growth}% YoY growth expected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Expense Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Month COGS</span>
                    <span className="font-medium">${(currentMetrics.expenses.cogs * 1.05).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operating Expenses</span>
                    <span className="font-medium">${(currentMetrics.expenses.operational * 1.02).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Forecasted</span>
                    <span className="font-bold">${((currentMetrics.expenses.cogs * 1.05) + (currentMetrics.expenses.operational * 1.02)).toLocaleString()}</span>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Cost Control Target</p>
                    <p className="text-xs text-yellow-600">Maintain expenses below 70% of revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Receipt className="h-4 w-4 mr-2" />
                  Profit & Loss Statement
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  Balance Sheet
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Wallet className="h-4 w-4 mr-2" />
                  Cash Flow Statement
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Calculator className="h-4 w-4 mr-2" />
                  Financial Ratios Report
                </Button>
              </CardContent>
            </Card>

            {/* Financial Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Financial Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-green-800">Strong Performance</p>
                    <p className="text-xs text-green-600">Revenue target exceeded</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800">Expense Monitor</p>
                    <p className="text-xs text-yellow-600">Marketing costs increasing</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                  <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-800">Cash Flow</p>
                    <p className="text-xs text-blue-600">Positive trend continues</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tax Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sales Tax</span>
                  <span className="font-medium">${currentMetrics.taxes.salesTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Income Tax</span>
                  <span className="font-medium">${currentMetrics.taxes.incomeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Payroll Tax</span>
                  <span className="font-medium">${currentMetrics.taxes.payrollTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-bold">Total Tax Liability</span>
                  <span className="font-bold">${currentMetrics.taxes.totalTaxLiability.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  )
}

export default ComprehensiveFinancialDashboard