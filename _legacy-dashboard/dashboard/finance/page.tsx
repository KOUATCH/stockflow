"use client"

import { useState, useMemo } from "react"
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
  PiggyBank,
  CreditCard,
  BarChart3,
  LineChart,
  AlertTriangle,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Activity,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Settings,
  Bell
} from "lucide-react"
import { FinancialMetricsCard } from "@/components/finance/FinancialMetricsCard"
import { RevenueChart } from "@/components/finance/charts/RevenueChart"
import { CashFlowChart } from "@/components/finance/charts/CashFlowChart"
import { ProfitMarginChart } from "@/components/finance/charts/ProfitMarginChart"
import { CustomerPerformanceTable } from "@/components/finance/CustomerPerformanceTable"
import { ItemPerformanceTable } from "@/components/finance/ItemPerformanceTable"
import { FinancialAlertsPanel } from "@/components/finance/FinancialAlertsPanel"
import { KPIDashboard } from "@/components/finance/KPIDashboard"
import { FinancialForecastingDashboard } from "@/components/finance/FinancialForecastingDashboard"
import { FinancialReportExporter } from "@/components/finance/FinancialReportExporter"
import type { FinancialDashboardData, FinancialPeriod } from "@/types/financialTypes"

// Mock data - replace with actual API calls
const mockFinancialData: FinancialDashboardData = {
  period: {
    id: "current",
    name: "Current Month",
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),
    isActive: true,
    isClosed: false
  },
  summary: {
    totalRevenue: 485420.50,
    totalExpenses: 298750.25,
    netIncome: 186670.25,
    cashPosition: 145890.75,
    grossMargin: 68.5,
    netMargin: 38.4
  },
  trends: {
    revenue: [
      { period: "Jan", value: 485420 },
      { period: "Feb", value: 523180 },
      { period: "Mar", value: 598750 },
      { period: "Apr", value: 645320 },
      { period: "May", value: 672100 },
      { period: "Jun", value: 698500 }
    ],
    profit: [
      { period: "Jan", value: 186670 },
      { period: "Feb", value: 201850 },
      { period: "Mar", value: 234500 },
      { period: "Apr", value: 258900 },
      { period: "May", value: 275600 },
      { period: "Jun", value: 289350 }
    ],
    cashflow: [
      { period: "Jan", value: 145890 },
      { period: "Feb", value: 168750 },
      { period: "Mar", value: 192300 },
      { period: "Apr", value: 215850 },
      { period: "May", value: 234600 },
      { period: "Jun", value: 258900 }
    ],
    expenses: [
      { period: "Jan", value: 298750 },
      { period: "Feb", value: 321330 },
      { period: "Mar", value: 364250 },
      { period: "Apr", value: 386420 },
      { period: "May", value: 396500 },
      { period: "Jun", value: 409150 }
    ]
  },
  kpis: [],
  alerts: [],
  topCustomers: [],
  topItems: [],
  cashFlowForecast: {
    id: "forecast-1",
    type: "cashflow",
    periodType: "monthly",
    forecastData: [],
    methodology: "linear",
    accuracy: 0.85,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  metrics: {
    profitability: {
      grossProfitMargin: 68.5,
      netProfitMargin: 38.4,
      returnOnAssets: 12.8,
      returnOnEquity: 18.5,
      ebitdaMargin: 42.1
    },
    liquidity: {
      currentRatio: 2.8,
      quickRatio: 1.9,
      cashRatio: 0.75,
      workingCapital: 145890,
      cashConversionCycle: 45
    },
    efficiency: {
      inventoryTurnover: 8.5,
      receivablesTurnover: 12.3,
      payablesTurnover: 6.8,
      assetTurnover: 1.4,
      salesPerEmployee: 125000
    },
    leverage: {
      debtToEquity: 0.35,
      debtToAssets: 0.22,
      interestCoverage: 15.8,
      debtServiceCoverage: 4.2
    },
    growth: {
      revenueGrowth: 22.5,
      profitGrowth: 28.3,
      customerGrowth: 15.7,
      marketShare: 8.2
    }
  }
}

const availablePeriods: FinancialPeriod[] = [
  { id: "current", name: "Current Month", startDate: new Date(2024, 0, 1), endDate: new Date(2024, 0, 31), isActive: true, isClosed: false },
  { id: "last-month", name: "Last Month", startDate: new Date(2023, 11, 1), endDate: new Date(2023, 11, 31), isActive: false, isClosed: true },
  { id: "quarter", name: "Current Quarter", startDate: new Date(2024, 0, 1), endDate: new Date(2024, 2, 31), isActive: true, isClosed: false },
  { id: "year", name: "Current Year", startDate: new Date(2024, 0, 1), endDate: new Date(2024, 11, 31), isActive: true, isClosed: false }
]

export default function FinancialDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { success, info, operationStart, operationComplete } = useNotifications()

  const currentData = useMemo(() => mockFinancialData, [selectedPeriod])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const operationId = operationStart("Refreshing Financial Data")

    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 2000))

    operationComplete("Financial Data Refreshed", "All financial metrics have been updated with the latest data")
    setIsRefreshing(false)
  }

  const handleExportReport = (reportType: string) => {
    info("Generating Report", `Creating ${reportType} report for download`)
    // Simulate report generation
    setTimeout(() => {
      success("Report Ready", `${reportType} report has been generated and is ready for download`)
    }, 3000)
  }

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

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (current < previous) return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-slate-600" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Financial Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Comprehensive financial analysis and performance insights
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
                  {availablePeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
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
                onClick={() => handleExportReport("Comprehensive Financial")}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FinancialMetricsCard
            title="Total Revenue"
            value={formatCurrency(currentData.summary.totalRevenue)}
            trend={22.5}
            icon={DollarSign}
            iconColor="bg-green-500"
            description="Month-over-month growth"
          />
          <FinancialMetricsCard
            title="Net Income"
            value={formatCurrency(currentData.summary.netIncome)}
            trend={28.3}
            icon={TrendingUp}
            iconColor="bg-blue-500"
            description="Profit after expenses"
          />
          <FinancialMetricsCard
            title="Cash Position"
            value={formatCurrency(currentData.summary.cashPosition)}
            trend={15.7}
            icon={PiggyBank}
            iconColor="bg-emerald-500"
            description="Available liquidity"
          />
          <FinancialMetricsCard
            title="Gross Margin"
            value={formatPercentage(currentData.summary.grossMargin)}
            trend={2.1}
            icon={Target}
            iconColor="bg-purple-500"
            description="Profit margin trend"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 text-sm">
              <LineChart className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Forecasting
            </TabsTrigger>
            <TabsTrigger value="exports" className="flex items-center gap-2 text-sm">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Revenue Trend */}
              <div className="xl:col-span-2">
                <RevenueChart data={currentData.trends.revenue} />
              </div>

              {/* Alerts Panel */}
              <div className="xl:col-span-1">
                <FinancialAlertsPanel alerts={currentData.alerts} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Cash Flow Chart */}
              <CashFlowChart data={currentData.trends.cashflow} />

              {/* Profit Margin Chart */}
              <ProfitMarginChart data={currentData.trends.profit} />
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <KPIDashboard metrics={currentData.metrics} />
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <CustomerPerformanceTable customers={currentData.topCustomers} />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <ItemPerformanceTable items={currentData.topItems} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Profit & Loss", description: "Comprehensive P&L statement", icon: BarChart3 },
                { name: "Cash Flow", description: "Cash flow analysis and projections", icon: TrendingUp },
                { name: "Balance Sheet", description: "Assets, liabilities, and equity", icon: CreditCard },
                { name: "Customer Analysis", description: "Customer performance metrics", icon: Users },
                { name: "Product Analysis", description: "Product profitability analysis", icon: Package },
                { name: "Budget Variance", description: "Budget vs actual comparison", icon: Target }
              ].map((report) => (
                <Card key={report.name} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:from-blue-600 group-hover:to-indigo-700 transition-colors">
                        <report.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{report.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{report.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleExportReport(report.name)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => info("View Report", `Opening ${report.name} report`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Predictive Analytics
                  </CardTitle>
                  <CardDescription>AI-powered financial forecasting and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-amber-900 dark:text-amber-100">Revenue Forecast</span>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Based on current trends, revenue is projected to reach $750K next month with 87% confidence.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">Growth Opportunity</span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Customer segment "Premium" shows 45% higher lifetime value. Consider targeted marketing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-red-500" />
                    Smart Alerts
                  </CardTitle>
                  <CardDescription>Automated financial health monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900 dark:text-green-100">Cash Flow Healthy</span>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Cash conversion cycle improved by 12 days this quarter.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-700">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-900 dark:text-red-100">Inventory Alert</span>
                      </div>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Inventory carrying costs increased 8%. Review stock levels.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecasting Tab */}
          <TabsContent value="forecasting" className="space-y-6">
            <FinancialForecastingDashboard />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="exports" className="space-y-6">
            <FinancialReportExporter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}