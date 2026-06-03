"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Plus,
  Minus,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3
} from "lucide-react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts'
import type { CashFlowEntry, CashFlowStatement } from "@/types/financialTypes"

// Mock cash flow data
const mockCashFlowEntries: CashFlowEntry[] = [
  {
    id: "cf-1",
    date: new Date(2024, 0, 15),
    type: "inflow",
    category: "sales",
    subcategory: "Product Sales",
    amount: 45620.50,
    description: "Daily sales revenue",
    customerId: "cust-1",
    orderId: "ord-123",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "cf-2",
    date: new Date(2024, 0, 16),
    type: "outflow",
    category: "expenses",
    subcategory: "Rent",
    amount: 8500.00,
    description: "Monthly office rent",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "cf-3",
    date: new Date(2024, 0, 17),
    type: "inflow",
    category: "sales",
    subcategory: "Service Revenue",
    amount: 12800.00,
    description: "Consulting services",
    customerId: "cust-2",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "cf-4",
    date: new Date(2024, 0, 18),
    type: "outflow",
    category: "expenses",
    subcategory: "Payroll",
    amount: 28500.00,
    description: "Employee salaries",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "cf-5",
    date: new Date(2024, 0, 19),
    type: "outflow",
    category: "expenses",
    subcategory: "Inventory Purchase",
    amount: 15600.00,
    description: "Raw materials",
    supplierId: "sup-1",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockCashFlowStatement: CashFlowStatement = {
  id: "cfs-1",
  periodId: "current",
  period: {
    id: "current",
    name: "Current Month",
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 31),
    isActive: true,
    isClosed: false
  },
  operatingActivities: {
    netIncome: 186670.25,
    depreciation: 5200.00,
    accountsReceivableChange: -8500.00,
    inventoryChange: -12300.00,
    accountsPayableChange: 6800.00,
    other: 2100.00,
    netCashFromOperating: 179970.25
  },
  investingActivities: {
    equipmentPurchases: -25000.00,
    equipmentSales: 0,
    investments: -15000.00,
    other: 0,
    netCashFromInvesting: -40000.00
  },
  financingActivities: {
    loans: 0,
    loanRepayments: -8500.00,
    ownerWithdrawals: -15000.00,
    ownerContributions: 0,
    other: 0,
    netCashFromFinancing: -23500.00
  },
  netCashFlow: 116470.25,
  beginningCash: 145890.75,
  endingCash: 262361.00,
  createdAt: new Date()
}

// Mock forecast data
const forecastData = [
  { month: "Jan", actual: 145890, projected: 145890 },
  { month: "Feb", actual: 168750, projected: 172000 },
  { month: "Mar", actual: 192300, projected: 198500 },
  { month: "Apr", actual: null, projected: 225800 },
  { month: "May", actual: null, projected: 252100 },
  { month: "Jun", actual: null, projected: 278900 }
]

export default function CashFlowManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [showAddEntryForm, setShowAddEntryForm] = useState(false)
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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const operationId = operationStart("Refreshing Cash Flow Data")

    await new Promise(resolve => setTimeout(resolve, 2000))

    operationComplete("Cash Flow Data Refreshed", "All cash flow data has been updated")
    setIsRefreshing(false)
  }

  const handleAddEntry = () => {
    success("Cash Flow Entry Added", "New cash flow entry has been recorded successfully")
    setShowAddEntryForm(false)
  }

  const handleExportStatement = () => {
    info("Generating Statement", "Cash flow statement is being prepared for download")
    setTimeout(() => {
      success("Statement Ready", "Cash flow statement has been generated and is ready for download")
    }, 3000)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={`text-sm ${entry.dataKey === 'actual' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
              {entry.dataKey === 'actual' ? 'Actual' : 'Projected'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <PiggyBank className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Cash Flow Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Comprehensive cash flow tracking and forecasting
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
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="quarter">Current Quarter</SelectItem>
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

              <Button
                size="sm"
                onClick={() => setShowAddEntryForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
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
                    Net Cash Flow
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(mockCashFlowStatement.netCashFlow)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+18.2%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Operating Cash Flow
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(mockCashFlowStatement.operatingActivities.netCashFromOperating)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">vs target</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Cash Position
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(mockCashFlowStatement.endingCash)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+79.8%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">vs beginning</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Burn Rate
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(45200)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3 text-red-600" />
                <span className="text-sm text-red-600 font-medium">-5.8%</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">monthly</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="statement" className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4" />
              Statement
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Cash Flow Trend */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Cash Flow Trend
                  </CardTitle>
                  <CardDescription>Monthly cash flow performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={forecastData.slice(0, 3)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" opacity={0.5} />
                        <XAxis dataKey="month" className="text-slate-600 dark:text-slate-400" tick={{ fontSize: 12 }} />
                        <YAxis className="text-slate-600 dark:text-slate-400" tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="actual" fill="#3b82f6" opacity={0.8} radius={[2, 2, 0, 0]} />
                        <Line type="monotone" dataKey="projected" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Cash Flow Components */}
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    Cash Flow Components
                  </CardTitle>
                  <CardDescription>Breakdown by activity type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-500">
                          <Activity className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-100">Operating Activities</p>
                          <p className="text-sm text-green-700 dark:text-green-300">Core business operations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-900 dark:text-green-100">
                          {formatCurrency(mockCashFlowStatement.operatingActivities.netCashFromOperating)}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">+12.5%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-red-500">
                          <TrendingDown className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">Investing Activities</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Equipment and investments</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-900 dark:text-red-100">
                          {formatCurrency(mockCashFlowStatement.investingActivities.netCashFromInvesting)}
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">-18.9%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-amber-500">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-amber-900 dark:text-amber-100">Financing Activities</p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">Loans and equity</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-900 dark:text-amber-100">
                          {formatCurrency(mockCashFlowStatement.financingActivities.netCashFromFinancing)}
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">-5.2%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Cash Flow Forecast
                </CardTitle>
                <CardDescription>6-month cash flow projection with scenario analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" opacity={0.5} />
                      <XAxis dataKey="month" className="text-slate-600 dark:text-slate-400" tick={{ fontSize: 12 }} />
                      <YAxis className="text-slate-600 dark:text-slate-400" tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} fill="url(#actualGradient)" />
                      <Area type="monotone" dataKey="projected" stroke="#8b5cf6" strokeWidth={3} fill="url(#projectedGradient)" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Conservative Scenario</h4>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(245000)}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">6-month projection</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Realistic Scenario</h4>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(278900)}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">6-month projection</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Optimistic Scenario</h4>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(315600)}</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">6-month projection</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Recent Cash Flow Entries
                </CardTitle>
                <CardDescription>Latest cash inflows and outflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCashFlowEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${entry.type === 'inflow' ? 'bg-green-500' : 'bg-red-500'}`}>
                          {entry.type === 'inflow' ? <Plus className="h-4 w-4 text-white" /> : <Minus className="h-4 w-4 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{entry.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {entry.subcategory}
                            </Badge>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {entry.date.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${entry.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.type === 'inflow' ? '+' : '-'}{formatCurrency(entry.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statement Tab */}
          <TabsContent value="statement" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  Cash Flow Statement
                </CardTitle>
                <CardDescription>Formal cash flow statement for the current period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Operating Activities */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Operating Activities</h3>
                    <div className="space-y-2 pl-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Net Income</span>
                        <span className="font-medium">{formatCurrency(mockCashFlowStatement.operatingActivities.netIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Depreciation</span>
                        <span className="font-medium">{formatCurrency(mockCashFlowStatement.operatingActivities.depreciation)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Change in Accounts Receivable</span>
                        <span className="font-medium">{formatCurrency(mockCashFlowStatement.operatingActivities.accountsReceivableChange)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Change in Inventory</span>
                        <span className="font-medium">{formatCurrency(mockCashFlowStatement.operatingActivities.inventoryChange)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Change in Accounts Payable</span>
                        <span className="font-medium">{formatCurrency(mockCashFlowStatement.operatingActivities.accountsPayableChange)}</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Net Cash from Operating Activities</span>
                          <span>{formatCurrency(mockCashFlowStatement.operatingActivities.netCashFromOperating)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Investing Activities */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Investing Activities</h3>
                    <div className="space-y-2 pl-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Equipment Purchases</span>
                        <span className="font-medium">{formatCurrency(mockCashFlowStatement.investingActivities.equipmentPurchases)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Investments</span>
                        <span className="font-medium">{formatCurrency(mockCashFlowStatement.investingActivities.investments)}</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Net Cash from Investing Activities</span>
                          <span>{formatCurrency(mockCashFlowStatement.investingActivities.netCashFromInvesting)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financing Activities */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Financing Activities</h3>
                    <div className="space-y-2 pl-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Loan Repayments</span>
                        <span className="font-medium">{formatCurrency(mockCashFlowStatement.financingActivities.loanRepayments)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Owner Withdrawals</span>
                        <span className="font-medium">{formatCurrency(mockCashFlowStatement.financingActivities.ownerWithdrawals)}</span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Net Cash from Financing Activities</span>
                          <span>{formatCurrency(mockCashFlowStatement.financingActivities.netCashFromFinancing)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Change */}
                  <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Net Change in Cash</span>
                        <span>{formatCurrency(mockCashFlowStatement.netCashFlow)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Cash at Beginning of Period</span>
                        <span className="font-medium">{formatCurrency(mockCashFlowStatement.beginningCash)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-xl text-blue-600 dark:text-blue-400">
                        <span>Cash at End of Period</span>
                        <span>{formatCurrency(mockCashFlowStatement.endingCash)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Entry Form Modal */}
        {showAddEntryForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white dark:bg-slate-800 shadow-xl">
              <CardHeader>
                <CardTitle>Add Cash Flow Entry</CardTitle>
                <CardDescription>Record a new cash inflow or outflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inflow">Inflow</SelectItem>
                        <SelectItem value="outflow">Outflow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="expenses">Expenses</SelectItem>
                      <SelectItem value="investments">Investments</SelectItem>
                      <SelectItem value="loans">Loans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter description..." />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddEntry} className="flex-1">Add Entry</Button>
                  <Button variant="outline" onClick={() => setShowAddEntryForm(false)} className="flex-1">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}