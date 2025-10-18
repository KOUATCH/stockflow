"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Download,
  Calculator,
  PieChart,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"
import { useNotifications } from "@/components/notifications/NotificationProvider"

// Mock data - replace with actual API calls
const mockFinancialData = {
  kpis: {
    revenue: {
      current: 485420,
      growth: 22.5,
      trend: 'UP'
    },
    profit: {
      current: 186670,
      margin: 38.4,
      growth: 28.3,
      trend: 'UP'
    },
    cashFlow: {
      current: 145890,
      netFlow: 25680,
      projected: 189430,
      trend: 'POSITIVE'
    },
    receivables: {
      total: 45680,
      overdue: 8920,
      overduePercentage: 19.5
    },
    payables: {
      total: 23450,
      overdue: 2340,
      upcomingInWeek: 3
    }
  },
  alerts: [
    {
      id: '1',
      type: 'OVERDUE_RECEIVABLE',
      severity: 'HIGH',
      title: 'Overdue Customer Payment',
      description: 'ABC Corp has $5,200 overdue for 45 days',
      amount: 5200,
      actionRequired: 'Contact customer for payment'
    },
    {
      id: '2',
      type: 'PAYMENT_DUE',
      severity: 'MEDIUM',
      title: 'Supplier Payment Due',
      description: 'Payment of $3,800 due to Office Supplies Inc in 3 days',
      amount: 3800,
      actionRequired: 'Prepare payment'
    }
  ],
  salesSummary: {
    totalRevenue: 485420,
    totalTransactions: 1247,
    averageTransactionValue: 389.2,
    salesGrowth: 22.5,
    topCategories: [
      { categoryName: 'Electronics', totalSales: 125680, growth: 18.5 },
      { categoryName: 'Clothing', totalSales: 98240, growth: 28.2 },
      { categoryName: 'Books', totalSales: 67890, growth: 15.7 }
    ]
  },
  customerFinances: {
    totalReceivables: 45680,
    overdueReceivables: 8920,
    topDebtors: [
      { customerName: 'ABC Corp', totalOwed: 5200, daysPastDue: 45 },
      { customerName: 'XYZ Ltd', totalOwed: 3780, daysPastDue: 32 },
      { customerName: 'Tech Solutions', totalOwed: 2340, daysPastDue: 28 }
    ]
  },
  supplierFinances: {
    totalPayables: 23450,
    upcomingPayments: [
      { supplierName: 'Office Supplies Inc', amount: 3800, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { supplierName: 'Tech Distributors', amount: 5600, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    ]
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatPercentage = (value: number) => `${value.toFixed(1)}%`

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'UP':
    case 'POSITIVE':
      return <ArrowUpRight className="h-4 w-4 text-green-600" />
    case 'DOWN':
    case 'NEGATIVE':
      return <ArrowDownRight className="h-4 w-4 text-red-600" />
    default:
      return <Minus className="h-4 w-4 text-slate-600" />
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-50 border-red-200 text-red-800'
    case 'HIGH':
      return 'bg-orange-50 border-orange-200 text-orange-800'
    case 'MEDIUM':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800'
  }
}

export default function RetailFinancialDashboardClient() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { info, success, operationStart, operationComplete } = useNotifications()

  const financialData = useMemo(() => mockFinancialData, [selectedPeriod])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const operationId = operationStart("Refreshing Financial Data")

    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 2000))

    operationComplete("Financial Data Refreshed", "All financial metrics have been updated")
    setIsRefreshing(false)
  }

  const handleExportReport = (reportType: string) => {
    info("Generating Report", `Creating ${reportType} report for download`)
    setTimeout(() => {
      success("Report Ready", `${reportType} report is ready for download`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Financial Overview
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Essential financial metrics for your retail business
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReport("Financial Summary")}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">

          {/* Revenue */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Revenue</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(financialData.kpis.revenue.current)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(financialData.kpis.revenue.trend)}
                  <span className={financialData.kpis.revenue.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(Math.abs(financialData.kpis.revenue.growth))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Gross Profit</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(financialData.kpis.profit.current)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatPercentage(financialData.kpis.profit.margin)} margin
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(financialData.kpis.profit.trend)}
                  <span className={financialData.kpis.profit.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(Math.abs(financialData.kpis.profit.growth))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                    <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Cash Position</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(financialData.kpis.cashFlow.current)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Net: {formatCurrency(financialData.kpis.cashFlow.netFlow)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(financialData.kpis.cashFlow.trend)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receivables */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Receivables</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(financialData.kpis.receivables.total)}
                    </p>
                    <p className="text-xs text-red-500">
                      {formatPercentage(financialData.kpis.receivables.overduePercentage)} overdue
                    </p>
                  </div>
                </div>
                {financialData.kpis.receivables.overduePercentage > 15 && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payables */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Payables</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(financialData.kpis.payables.total)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {financialData.kpis.payables.upcomingInWeek} due this week
                    </p>
                  </div>
                </div>
                {financialData.kpis.payables.upcomingInWeek > 0 && (
                  <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {financialData.kpis.payables.upcomingInWeek}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Alerts */}
        {financialData.alerts.length > 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Financial Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm opacity-90 mt-1">{alert.description}</p>
                        <p className="text-xs opacity-75 mt-2">{alert.actionRequired}</p>
                      </div>
                      {alert.amount && (
                        <div className="font-bold text-lg">
                          {formatCurrency(alert.amount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Analysis
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Sales Summary */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Revenue</span>
                      <span className="font-bold">{formatCurrency(financialData.salesSummary.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Transactions</span>
                      <span className="font-bold">{financialData.salesSummary.totalTransactions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Avg Transaction</span>
                      <span className="font-bold">{formatCurrency(financialData.salesSummary.averageTransactionValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Growth</span>
                      <span className="font-bold text-green-600">{formatPercentage(financialData.salesSummary.salesGrowth)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Top Selling Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {financialData.salesSummary.topCategories.map((category, index) => (
                      <div key={category.categoryName} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{category.categoryName}</p>
                            <p className="text-sm text-green-600">{formatPercentage(category.growth)} growth</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(category.totalSales)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Customer Receivables</CardTitle>
                <CardDescription>
                  Outstanding amounts owed by customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Receivables</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(financialData.customerFinances.totalReceivables)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(financialData.customerFinances.overdueReceivables)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Collection Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPercentage(100 - (financialData.customerFinances.overdueReceivables / financialData.customerFinances.totalReceivables) * 100)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Top Outstanding Accounts</h4>
                    <div className="space-y-2">
                      {financialData.customerFinances.topDebtors.map((customer) => (
                        <div key={customer.customerName} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">{customer.customerName}</p>
                            <p className="text-sm text-slate-600">{customer.daysPastDue} days overdue</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{formatCurrency(customer.totalOwed)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Supplier Payments</CardTitle>
                <CardDescription>
                  Outstanding amounts owed to suppliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Payables</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(financialData.supplierFinances.totalPayables)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Due This Week</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {financialData.kpis.payables.upcomingInWeek}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Upcoming Payments</h4>
                    <div className="space-y-2">
                      {financialData.supplierFinances.upcomingPayments.map((payment) => (
                        <div key={payment.supplierName} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">{payment.supplierName}</p>
                            <p className="text-sm text-slate-600">
                              Due {payment.dueDate.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(payment.amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Profit Analysis */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Profitability Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Gross Profit</span>
                      <span className="font-bold">{formatCurrency(financialData.kpis.profit.current)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Gross Margin</span>
                      <span className="font-bold">{formatPercentage(financialData.kpis.profit.margin)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Revenue</span>
                      <span className="font-bold">{formatCurrency(financialData.kpis.revenue.current)}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-slate-600 mb-2">Profit Growth</p>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(financialData.kpis.profit.trend)}
                        <span className={`font-bold ${financialData.kpis.profit.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(Math.abs(financialData.kpis.profit.growth))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cash Flow Analysis */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Cash Flow Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Current Position</span>
                      <span className="font-bold">{formatCurrency(financialData.kpis.cashFlow.current)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Net Flow</span>
                      <span className={`font-bold ${financialData.kpis.cashFlow.netFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(financialData.kpis.cashFlow.netFlow)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Projected (30 days)</span>
                      <span className="font-bold">{formatCurrency(financialData.kpis.cashFlow.projected)}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-slate-600 mb-2">Cash Trend</p>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(financialData.kpis.cashFlow.trend)}
                        <span className={`font-medium ${financialData.kpis.cashFlow.trend === 'POSITIVE' ? 'text-green-600' : 'text-red-600'}`}>
                          {financialData.kpis.cashFlow.trend}
                        </span>
                      </div>
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