"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Percent,
  Calculator
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, Area, AreaChart } from 'recharts'
import type { ProfitLossStatement } from "@/types/financialTypes"

// Mock P&L data
const mockPLStatement: ProfitLossStatement = {
  id: "pl-1",
  periodId: "current",
  period: {
    id: "current",
    name: "Current Quarter",
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 2, 31),
    isActive: true,
    isClosed: false
  },
  revenue: {
    totalSales: 1456780.50,
    returnsAndAllowances: 23450.25,
    netSales: 1433330.25,
    costOfGoodsSold: 573332.10,
    grossProfit: 859998.15,
    grossProfitMargin: 60.0
  },
  operatingExpenses: {
    salaries: 285600.00,
    rent: 45000.00,
    utilities: 12500.00,
    marketing: 78900.00,
    insurance: 8500.00,
    depreciation: 15200.00,
    other: 45800.00,
    total: 491500.00
  },
  operatingIncome: 368498.15,
  nonOperatingIncome: {
    interestIncome: 2500.00,
    investmentGains: 8900.00,
    other: 1200.00,
    total: 12600.00
  },
  nonOperatingExpenses: {
    interestExpense: 5600.00,
    taxes: 85450.00,
    other: 2800.00,
    total: 93850.00
  },
  netIncome: 287248.15,
  netProfitMargin: 20.0,
  ebitda: 449148.15,
  createdAt: new Date()
}

// Mock trend data for charts
const trendData = [
  { month: "Jan", revenue: 485420, expenses: 298750, profit: 186670, margin: 38.4 },
  { month: "Feb", revenue: 523180, expenses: 321330, profit: 201850, margin: 38.6 },
  { month: "Mar", revenue: 448180, expenses: 271420, profit: 176760, margin: 39.4 },
  { month: "Apr", revenue: 598750, expenses: 364250, profit: 234500, margin: 39.2 },
  { month: "May", revenue: 645320, expenses: 386420, profit: 258900, margin: 40.1 },
  { month: "Jun", revenue: 672100, expenses: 396500, profit: 275600, margin: 41.0 }
]

const categoryBreakdown = [
  { category: "Salaries", amount: 285600, percentage: 58.1, color: "#3b82f6" },
  { category: "Marketing", amount: 78900, percentage: 16.1, color: "#8b5cf6" },
  { category: "Rent", amount: 45000, percentage: 9.2, color: "#10b981" },
  { category: "Other", amount: 45800, percentage: 9.3, color: "#f59e0b" },
  { category: "Depreciation", amount: 15200, percentage: 3.1, color: "#ef4444" },
  { category: "Utilities", amount: 12500, percentage: 2.5, color: "#06b6d4" },
  { category: "Insurance", amount: 8500, percentage: 1.7, color: "#84cc16" }
]

export default function ProfitLossStatement() {
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [comparisonPeriod, setComparisonPeriod] = useState("previous")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { success, info, operationStart, operationComplete } = useNotifications()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const operationId = operationStart("Refreshing P&L Data")

    await new Promise(resolve => setTimeout(resolve, 2000))

    operationComplete("P&L Data Refreshed", "All profit and loss data has been updated")
    setIsRefreshing(false)
  }

  const handleExportStatement = () => {
    info("Generating Statement", "P&L statement is being prepared for download")
    setTimeout(() => {
      success("Statement Ready", "Profit & Loss statement has been generated and is ready for download")
    }, 3000)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={`text-sm`} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'margin' ? `${entry.value}%` : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Profit & Loss Statement
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Comprehensive income statement and profitability analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Quarter</SelectItem>
                  <SelectItem value="previous">Previous Quarter</SelectItem>
                  <SelectItem value="year">Current Year</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportStatement}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Net Sales
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(mockPLStatement.revenue.netSales)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+15.3%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">vs last quarter</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Gross Profit
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(mockPLStatement.revenue.grossProfit)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-sm text-green-600 font-medium">{formatPercentage(mockPLStatement.revenue.grossProfitMargin)}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">margin</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Operating Income
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(mockPLStatement.operatingIncome)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+18.7%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">vs target</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Net Income
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(mockPLStatement.netIncome)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-sm text-green-600 font-medium">{formatPercentage(mockPLStatement.netProfitMargin)}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">net margin</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="statement" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger value="statement" className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Statement
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="flex items-center gap-2 text-sm">
              <Percent className="h-4 w-4" />
              Breakdown
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Analysis
            </TabsTrigger>
          </TabsList>

          {/* Statement Tab */}
          <TabsContent value="statement" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/60 dark:border-green-700/60">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  Income Statement
                </CardTitle>
                <CardDescription>
                  Formal profit and loss statement for {mockPLStatement.period.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Revenue Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Revenue
                    </h3>
                    <div className="space-y-2 pl-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Total Sales</span>
                        <span className="font-medium">{formatCurrency(mockPLStatement.revenue.totalSales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Less: Returns & Allowances</span>
                        <span className="font-medium text-red-600">({formatCurrency(mockPLStatement.revenue.returnsAndAllowances)})</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Net Sales</span>
                          <span>{formatCurrency(mockPLStatement.revenue.netSales)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Less: Cost of Goods Sold</span>
                        <span className="font-medium text-red-600">({formatCurrency(mockPLStatement.revenue.costOfGoodsSold)})</span>
                      </div>
                      <div className="border-t border-slate-300 dark:border-slate-600 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-xl text-green-600">
                          <span>Gross Profit</span>
                          <span>{formatCurrency(mockPLStatement.revenue.grossProfit)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Gross Profit Margin</span>
                          <span>{formatPercentage(mockPLStatement.revenue.grossProfitMargin)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operating Expenses */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      Operating Expenses
                    </h3>
                    <div className="space-y-2 pl-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Salaries & Benefits</span>
                        <span className="font-medium text-red-600">{formatCurrency(mockPLStatement.operatingExpenses.salaries)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Rent</span>
                        <span className="font-medium text-red-600">{formatCurrency(mockPLStatement.operatingExpenses.rent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Marketing & Advertising</span>
                        <span className="font-medium text-red-600">{formatCurrency(mockPLStatement.operatingExpenses.marketing)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Utilities</span>
                        <span className="font-medium text-red-600">{formatCurrency(mockPLStatement.operatingExpenses.utilities)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Insurance</span>
                        <span className="font-medium text-red-600">{formatCurrency(mockPLStatement.operatingExpenses.insurance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Depreciation</span>
                        <span className="font-medium text-red-600">{formatCurrency(mockPLStatement.operatingExpenses.depreciation)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Other Operating Expenses</span>
                        <span className="font-medium text-red-600">{formatCurrency(mockPLStatement.operatingExpenses.other)}</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Operating Expenses</span>
                          <span className="text-red-600">{formatCurrency(mockPLStatement.operatingExpenses.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operating Income */}
                  <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-4">
                    <div className="flex justify-between font-bold text-xl text-blue-600">
                      <span>Operating Income</span>
                      <span>{formatCurrency(mockPLStatement.operatingIncome)}</span>
                    </div>
                  </div>

                  {/* Non-Operating Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Non-Operating Income</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Interest Income</span>
                          <span className="text-green-600">{formatCurrency(mockPLStatement.nonOperatingIncome.interestIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Investment Gains</span>
                          <span className="text-green-600">{formatCurrency(mockPLStatement.nonOperatingIncome.investmentGains)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Other</span>
                          <span className="text-green-600">{formatCurrency(mockPLStatement.nonOperatingIncome.other)}</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-1 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="text-green-600">{formatCurrency(mockPLStatement.nonOperatingIncome.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Non-Operating Expenses</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Interest Expense</span>
                          <span className="text-red-600">{formatCurrency(mockPLStatement.nonOperatingExpenses.interestExpense)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Taxes</span>
                          <span className="text-red-600">{formatCurrency(mockPLStatement.nonOperatingExpenses.taxes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Other</span>
                          <span className="text-red-600">{formatCurrency(mockPLStatement.nonOperatingExpenses.other)}</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-1 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="text-red-600">{formatCurrency(mockPLStatement.nonOperatingExpenses.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold text-2xl text-green-600 dark:text-green-400">
                        <span>Net Income</span>
                        <span>{formatCurrency(mockPLStatement.netIncome)}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-slate-600 dark:text-slate-400">Net Profit Margin</span>
                        <span className="font-semibold text-green-600">{formatPercentage(mockPLStatement.netProfitMargin)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">EBITDA</span>
                        <span className="font-medium">{formatCurrency(mockPLStatement.ebitda)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Revenue & Profit Trend */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Revenue & Profit Trends
                  </CardTitle>
                  <CardDescription>Monthly performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" opacity={0.5} />
                        <XAxis dataKey="month" className="text-slate-600 dark:text-slate-400" tick={{ fontSize: 12 }} />
                        <YAxis className="text-slate-600 dark:text-slate-400" tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#3b82f6" opacity={0.8} radius={[2, 2, 0, 0]} />
                        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Margin Trend */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-purple-500" />
                    Profit Margin Trend
                  </CardTitle>
                  <CardDescription>Monthly margin performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" opacity={0.5} />
                        <XAxis dataKey="month" className="text-slate-600 dark:text-slate-400" tick={{ fontSize: 12 }} />
                        <YAxis className="text-slate-600 dark:text-slate-400" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}%`} domain={[35, 45]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="margin" stroke="#8b5cf6" strokeWidth={3} fill="url(#marginGradient)" dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue-500" />
                  Expense Breakdown
                </CardTitle>
                <CardDescription>Operating expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span className="font-medium text-slate-900 dark:text-white">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(category.amount)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{category.percentage}% of total</p>
                        </div>
                        <div className="w-24">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${category.percentage}%`,
                                backgroundColor: category.color
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Performance Indicators
                  </CardTitle>
                  <CardDescription>Key profitability metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-900 dark:text-green-100">Gross Profit Margin</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-900 dark:text-green-100">{formatPercentage(mockPLStatement.revenue.grossProfitMargin)}</p>
                        <p className="text-xs text-green-700 dark:text-green-300">Target: 65%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">Operating Margin</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-900 dark:text-blue-100">{formatPercentage((mockPLStatement.operatingIncome / mockPLStatement.revenue.netSales) * 100)}</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Target: 25%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-900 dark:text-purple-100">Net Profit Margin</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-900 dark:text-purple-100">{formatPercentage(mockPLStatement.netProfitMargin)}</p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">Target: 18%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-amber-600" />
                        <span className="font-medium text-amber-900 dark:text-amber-100">EBITDA Margin</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-900 dark:text-amber-100">{formatPercentage((mockPLStatement.ebitda / mockPLStatement.revenue.netSales) * 100)}</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">Target: 30%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Key Insights
                  </CardTitle>
                  <CardDescription>Actionable business insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900 dark:text-green-100">Strong Performance</span>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Gross profit margin of 60% exceeds industry average of 45%. Continue focus on high-margin products.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-amber-900 dark:text-amber-100">Cost Management</span>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Operating expenses represent 34% of revenue. Consider reviewing salary costs and marketing efficiency.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">Growth Opportunity</span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Net margin improvement of 2.1% vs last quarter indicates strong operational efficiency gains.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}