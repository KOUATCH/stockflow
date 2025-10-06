"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calculator,
  CreditCard,
  Wallet,
  Target,
  AlertTriangle,
  ArrowUpDown,
  Percent,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  Building2,
  Banknote,
  Receipt,
  ShoppingCart,
  Package,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Activity
} from "lucide-react"

interface ComprehensiveFinancialDashboardProps {
  organizationId?: string
  locationId?: string
}

const ComprehensiveFinancialDashboard = ({
  organizationId = "default-org",
  locationId = "1"
}: ComprehensiveFinancialDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedLocation, setSelectedLocation] = useState(locationId)
  const [activeView, setActiveView] = useState("overview")

  // Mock financial data - replace with real API calls
  const financialMetrics = {
    revenue: {
      total: 1247850.67,
      growth: 15.7,
      recurring: 892450.23,
      oneTime: 355400.44,
      forecast: 1350000,
      target: 1200000,
      achievement: 103.9
    },
    profitability: {
      grossProfit: 523890.45,
      grossMargin: 42.0,
      netProfit: 187234.12,
      netMargin: 15.0,
      ebitda: 234567.89,
      ebitdaMargin: 18.8,
      operatingProfit: 198765.43
    },
    expenses: {
      total: 450123.78,
      cogs: 723960.22,
      operational: 156890.34,
      salaries: 187432.15,
      rent: 45000,
      utilities: 12890.87,
      marketing: 23456.78,
      other: 24384.42
    },
    cashFlow: {
      operating: 345678.90,
      investing: -89123.45,
      financing: -45678.90,
      netCashFlow: 210876.55,
      cashOnHand: 567890.12,
      burnRate: 12345.67
    },
    assets: {
      total: 2456789.01,
      current: 987654.32,
      inventory: 456789.12,
      receivables: 234567.89,
      cash: 567890.12,
      fixedAssets: 1469134.69
    },
    liabilities: {
      total: 567890.12,
      current: 234567.89,
      payables: 156789.45,
      accrued: 67890.12,
      longTerm: 333322.23,
      loans: 234567.89
    },
    ratios: {
      currentRatio: 4.2,
      quickRatio: 2.3,
      debtToEquity: 0.3,
      roe: 12.5,
      roa: 7.8,
      grossMarginTrend: 2.1,
      inventoryTurnover: 8.4,
      receivablesTurnover: 12.3
    },
    taxes: {
      salesTax: 89765.43,
      incomeTax: 45678.90,
      payrollTax: 23456.78,
      totalTaxLiability: 158901.11,
      taxRate: 22.5
    }
  }

  const financialAspects = [
    {
      id: "revenue",
      title: "Revenue Analysis",
      icon: DollarSign,
      color: "bg-green-500",
      metrics: [
        { label: "Total Revenue", value: `$${financialMetrics.revenue.total.toLocaleString()}`, change: `+${financialMetrics.revenue.growth}%` },
        { label: "Target Achievement", value: `${financialMetrics.revenue.achievement}%`, change: "Above target" },
        { label: "Recurring Revenue", value: `$${financialMetrics.revenue.recurring.toLocaleString()}`, change: "71.5% of total" },
        { label: "Forecast", value: `$${financialMetrics.revenue.forecast.toLocaleString()}`, change: "Next period" }
      ]
    },
    {
      id: "profitability",
      title: "Profitability Metrics",
      icon: TrendingUp,
      color: "bg-blue-500",
      metrics: [
        { label: "Gross Profit", value: `$${financialMetrics.profitability.grossProfit.toLocaleString()}`, change: `${financialMetrics.profitability.grossMargin}% margin` },
        { label: "Net Profit", value: `$${financialMetrics.profitability.netProfit.toLocaleString()}`, change: `${financialMetrics.profitability.netMargin}% margin` },
        { label: "EBITDA", value: `$${financialMetrics.profitability.ebitda.toLocaleString()}`, change: `${financialMetrics.profitability.ebitdaMargin}% margin` },
        { label: "Operating Profit", value: `$${financialMetrics.profitability.operatingProfit.toLocaleString()}`, change: "+8.2%" }
      ]
    },
    {
      id: "expenses",
      title: "Expense Management",
      icon: Receipt,
      color: "bg-red-500",
      metrics: [
        { label: "Total Expenses", value: `$${financialMetrics.expenses.total.toLocaleString()}`, change: "-3.2%" },
        { label: "COGS", value: `$${financialMetrics.expenses.cogs.toLocaleString()}`, change: "58% of revenue" },
        { label: "Operational", value: `$${financialMetrics.expenses.operational.toLocaleString()}`, change: "12.6% of revenue" },
        { label: "Salaries", value: `$${financialMetrics.expenses.salaries.toLocaleString()}`, change: "15% of revenue" }
      ]
    },
    {
      id: "cashflow",
      title: "Cash Flow Analysis",
      icon: Wallet,
      color: "bg-purple-500",
      metrics: [
        { label: "Operating Cash Flow", value: `$${financialMetrics.cashFlow.operating.toLocaleString()}`, change: "+12.3%" },
        { label: "Net Cash Flow", value: `$${financialMetrics.cashFlow.netCashFlow.toLocaleString()}`, change: "+8.7%" },
        { label: "Cash on Hand", value: `$${financialMetrics.cashFlow.cashOnHand.toLocaleString()}`, change: "3.2 months runway" },
        { label: "Burn Rate", value: `$${financialMetrics.cashFlow.burnRate.toLocaleString()}/month`, change: "Stable" }
      ]
    },
    {
      id: "balance",
      title: "Balance Sheet",
      icon: Building2,
      color: "bg-orange-500",
      metrics: [
        { label: "Total Assets", value: `$${financialMetrics.assets.total.toLocaleString()}`, change: "+5.4%" },
        { label: "Current Assets", value: `$${financialMetrics.assets.current.toLocaleString()}`, change: "40.2% of total" },
        { label: "Total Liabilities", value: `$${financialMetrics.liabilities.total.toLocaleString()}`, change: "23.1% of assets" },
        { label: "Equity", value: `$${(financialMetrics.assets.total - financialMetrics.liabilities.total).toLocaleString()}`, change: "76.9% equity ratio" }
      ]
    },
    {
      id: "ratios",
      title: "Financial Ratios",
      icon: Calculator,
      color: "bg-indigo-500",
      metrics: [
        { label: "Current Ratio", value: financialMetrics.ratios.currentRatio.toString(), change: "Excellent liquidity" },
        { label: "ROE", value: `${financialMetrics.ratios.roe}%`, change: "Strong returns" },
        { label: "Debt-to-Equity", value: financialMetrics.ratios.debtToEquity.toString(), change: "Low leverage" },
        { label: "Inventory Turnover", value: `${financialMetrics.ratios.inventoryTurnover}x`, change: "Efficient management" }
      ]
    },
    {
      id: "taxes",
      title: "Tax Management",
      icon: FileText,
      color: "bg-pink-500",
      metrics: [
        { label: "Total Tax Liability", value: `$${financialMetrics.taxes.totalTaxLiability.toLocaleString()}`, change: "Current period" },
        { label: "Sales Tax", value: `$${financialMetrics.taxes.salesTax.toLocaleString()}`, change: "56.5% of total" },
        { label: "Income Tax", value: `$${financialMetrics.taxes.incomeTax.toLocaleString()}`, change: "28.7% of total" },
        { label: "Effective Tax Rate", value: `${financialMetrics.taxes.taxRate}%`, change: "Competitive rate" }
      ]
    },
    {
      id: "working-capital",
      title: "Working Capital",
      icon: ArrowUpDown,
      color: "bg-teal-500",
      metrics: [
        { label: "Working Capital", value: `$${(financialMetrics.assets.current - financialMetrics.liabilities.current).toLocaleString()}`, change: "+15.2%" },
        { label: "Inventory Value", value: `$${financialMetrics.assets.inventory.toLocaleString()}`, change: "46.3% of current assets" },
        { label: "Receivables", value: `$${financialMetrics.assets.receivables.toLocaleString()}`, change: "23.8% of current assets" },
        { label: "Payables", value: `$${financialMetrics.liabilities.payables.toLocaleString()}`, change: "66.8% of current liabilities" }
      ]
    },
    {
      id: "kpis",
      title: "Financial KPIs",
      icon: Target,
      color: "bg-yellow-500",
      metrics: [
        { label: "Revenue Growth", value: `${financialMetrics.revenue.growth}%`, change: "YoY growth" },
        { label: "Profit Margin Trend", value: `+${financialMetrics.ratios.grossMarginTrend}%`, change: "Improving" },
        { label: "Cost Control", value: "95.2%", change: "Target achievement" },
        { label: "Financial Health Score", value: "87/100", change: "Strong position" }
      ]
    }
  ]

  const renderFinancialCard = (aspect: typeof financialAspects[0]) => {
    const IconComponent = aspect.icon
    return (
      <Card key={aspect.id} className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">{aspect.title}</CardTitle>
          <div className={`p-2 rounded-lg ${aspect.color} text-white`}>
            <IconComponent className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {aspect.metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    metric.change.includes('+') ? 'default' :
                    metric.change.includes('-') ? 'destructive' :
                    'secondary'
                  }
                  className="text-xs"
                >
                  {metric.change}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <PieChart className="h-6 w-6" />
            </div>
            Financial Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive financial tracking and analysis</p>
        </div>

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

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialMetrics.revenue.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+{financialMetrics.revenue.growth}% from last period</span>
            </div>
            <div className="mt-2">
              <Progress value={financialMetrics.revenue.achievement} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{financialMetrics.revenue.achievement}% of target</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialMetrics.profitability.netProfit.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Percent className="h-3 w-3 mr-1 text-blue-600" />
              <span className="text-blue-600">{financialMetrics.profitability.netMargin}% margin</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialMetrics.cashFlow.netCashFlow.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1 text-purple-600" />
              <span className="text-purple-600">Positive flow</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialMetrics.assets.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">Strong balance sheet</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87/100</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Zap className="h-3 w-3 mr-1 text-yellow-600" />
              <span className="text-yellow-600">Excellent rating</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Financial Tracking Areas</h2>
            <Badge variant="outline" className="text-sm">
              {financialAspects.length} financial aspects
            </Badge>
          </div>

          {/* Carousel for Financial Aspects */}
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {financialAspects.map((aspect) => (
                <CarouselItem key={aspect.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  {renderFinancialCard(aspect)}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit & Loss Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Profit & Loss Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Revenue</span>
                    <span className="font-bold text-green-600">+$1,247,851</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cost of Goods Sold</span>
                    <span className="font-medium text-red-600">-$723,960</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-medium">Gross Profit</span>
                    <span className="font-bold">$523,891 (42.0%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operating Expenses</span>
                    <span className="font-medium text-red-600">-$325,125</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-medium">Operating Profit</span>
                    <span className="font-bold">$198,766 (15.9%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Other Income/Expenses</span>
                    <span className="font-medium text-red-600">-$11,532</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2 bg-gray-50 p-2 rounded">
                    <span className="text-sm font-bold">Net Profit</span>
                    <span className="font-bold text-green-600">$187,234 (15.0%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Cash Flow Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">Operating Activities</span>
                      <span className="font-bold text-green-700">+$345,679</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Cash from core operations</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red-800">Investing Activities</span>
                      <span className="font-bold text-red-700">-$89,123</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">Equipment and asset purchases</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">Financing Activities</span>
                      <span className="font-bold text-blue-700">-$45,679</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Loan payments and equity</p>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                      <span className="text-sm font-bold">Net Cash Flow</span>
                      <span className="font-bold text-green-600">+$210,877</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        <span>$987,654</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fixed Assets</span>
                        <span>$1,469,135</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total Assets</span>
                        <span>$2,456,789</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Liabilities</h4>
                    <div className="space-y-2 ml-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Liabilities</span>
                        <span>$234,568</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Long-term Liabilities</span>
                        <span>$333,322</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total Liabilities</span>
                        <span>$567,890</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="flex justify-between font-bold">
                      <span>Shareholders' Equity</span>
                      <span>$1,888,899</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    <p className="text-2xl font-bold text-green-700">{financialMetrics.ratios.currentRatio}</p>
                    <p className="text-xs text-green-600">Current Ratio</p>
                    <p className="text-xs text-gray-500">Excellent</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{financialMetrics.ratios.roe}%</p>
                    <p className="text-xs text-blue-600">ROE</p>
                    <p className="text-xs text-gray-500">Strong</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-700">{financialMetrics.ratios.debtToEquity}</p>
                    <p className="text-xs text-purple-600">Debt-to-Equity</p>
                    <p className="text-xs text-gray-500">Low Risk</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-700">{financialMetrics.ratios.inventoryTurnover}x</p>
                    <p className="text-xs text-orange-600">Inventory Turnover</p>
                    <p className="text-xs text-gray-500">Efficient</p>
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
                    <span className="font-bold">$1,350,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Quarter</span>
                    <span className="font-bold">$3,890,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Year</span>
                    <span className="font-bold">$16,250,000</span>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Growth Projection</p>
                    <p className="text-xs text-blue-600">Based on current trends: 15.7% YoY growth expected</p>
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
                    <span className="font-medium">$785,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Operating Expenses</span>
                    <span className="font-medium">$165,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Forecasted</span>
                    <span className="font-bold">$950,000</span>
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
                    <span>103.9%</span>
                  </div>
                  <Progress value={103.9} className="h-2" />
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
      </Tabs>
    </div>
  )
}

export default ComprehensiveFinancialDashboard