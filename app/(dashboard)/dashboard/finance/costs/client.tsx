"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  TrendingDown,
  Package,
  Truck,
  Users,
  Building,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  AlertTriangle
} from "lucide-react"

const mockCostData = {
  overview: {
    totalCosts: 324580,
    costOfGoodsSold: 195480,
    operatingExpenses: 89240,
    overheadCosts: 39860,
    costGrowth: -3.2
  },
  categories: [
    { name: "Cost of Goods Sold", amount: 195480, percentage: 60.2, trend: "stable" },
    { name: "Labor Costs", amount: 45280, percentage: 13.9, trend: "up" },
    { name: "Rent & Utilities", amount: 28400, percentage: 8.8, trend: "stable" },
    { name: "Marketing", amount: 18650, percentage: 5.7, trend: "up" },
    { name: "Technology", amount: 15420, percentage: 4.8, trend: "down" },
    { name: "Insurance", amount: 12380, percentage: 3.8, trend: "stable" },
    { name: "Other", amount: 9000, percentage: 2.8, trend: "stable" }
  ],
  monthlyTrends: [
    { month: "Jan", totalCosts: 318000, cogs: 190800, operating: 85200, overhead: 42000 },
    { month: "Feb", totalCosts: 325000, cogs: 195000, operating: 87000, overhead: 43000 },
    { month: "Mar", totalCosts: 312000, cogs: 187200, operating: 83600, overhead: 41200 },
    { month: "Apr", totalCosts: 328000, cogs: 196800, operating: 88200, overhead: 43000 },
    { month: "May", totalCosts: 320000, cogs: 192000, operating: 86000, overhead: 42000 },
    { month: "Jun", totalCosts: 324580, cogs: 195480, operating: 89240, overhead: 39860 }
  ],
  costCenters: [
    { name: "Warehouse Operations", budget: 45000, actual: 47200, variance: 2200, variancePercent: 4.9 },
    { name: "Sales Department", budget: 35000, actual: 33800, variance: -1200, variancePercent: -3.4 },
    { name: "Customer Service", budget: 18000, actual: 19500, variance: 1500, variancePercent: 8.3 },
    { name: "IT Department", budget: 25000, actual: 24100, variance: -900, variancePercent: -3.6 }
  ]
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
    case "up":
      return <TrendingDown className="h-4 w-4 text-red-600" />
    case "down":
      return <TrendingDown className="h-4 w-4 text-green-600 rotate-180" />
    default:
      return <div className="h-4 w-4"></div>
  }
}

export default function CostAnalysisClient() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Cost Analysis
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Comprehensive cost breakdown and optimization insights
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
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                    <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Costs</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(mockCostData.overview.totalCosts)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingDown className="h-4 w-4 text-green-600 rotate-180" />
                  <span className="text-green-600">
                    {formatPercentage(Math.abs(mockCostData.overview.costGrowth))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Cost of Goods Sold</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(mockCostData.overview.costOfGoodsSold)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatPercentage((mockCostData.overview.costOfGoodsSold / mockCostData.overview.totalCosts) * 100)} of total
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Operating Expenses</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(mockCostData.overview.operatingExpenses)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatPercentage((mockCostData.overview.operatingExpenses / mockCostData.overview.totalCosts) * 100)} of total
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Overhead Costs</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(mockCostData.overview.overheadCosts)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatPercentage((mockCostData.overview.overheadCosts / mockCostData.overview.totalCosts) * 100)} of total
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="breakdown" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="centers">Cost Centers</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Cost Category Breakdown
                </CardTitle>
                <CardDescription>Detailed breakdown of costs by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCostData.categories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                          index === 0 ? 'from-red-500 to-orange-500' :
                          index === 1 ? 'from-blue-500 to-indigo-500' :
                          index === 2 ? 'from-green-500 to-emerald-500' :
                          index === 3 ? 'from-purple-500 to-violet-500' :
                          index === 4 ? 'from-yellow-500 to-amber-500' :
                          index === 5 ? 'from-pink-500 to-rose-500' :
                          'from-gray-500 to-slate-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-slate-600">{formatPercentage(category.percentage)} of total</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTrendIcon(category.trend)}
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(category.amount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Cost Trends
                </CardTitle>
                <CardDescription>Cost trends over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCostData.monthlyTrends.map((trend) => (
                    <div key={trend.month} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-lg">{trend.month}</h4>
                        <p className="text-xl font-bold">{formatCurrency(trend.totalCosts)}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">COGS</p>
                          <p className="font-medium">{formatCurrency(trend.cogs)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Operating</p>
                          <p className="font-medium">{formatCurrency(trend.operating)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Overhead</p>
                          <p className="font-medium">{formatCurrency(trend.overhead)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="centers" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Cost Center Performance</CardTitle>
                <CardDescription>Budget vs actual comparison by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCostData.costCenters.map((center) => (
                    <div key={center.name} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{center.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {center.variance > 0 ? (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm">Over Budget</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-green-600">
                                <span className="text-sm">Under Budget</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{formatCurrency(center.actual)}</p>
                          <p className="text-sm text-slate-600">Actual Spend</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Budget</p>
                          <p className="font-medium">{formatCurrency(center.budget)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Variance</p>
                          <p className={`font-medium ${center.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {center.variance > 0 ? '+' : ''}{formatCurrency(center.variance)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Variance %</p>
                          <p className={`font-medium ${center.variancePercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {center.variancePercent > 0 ? '+' : ''}{formatPercentage(center.variancePercent)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Cost Optimization Opportunities</CardTitle>
                <CardDescription>Identified areas for potential cost reduction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">High Warehouse Costs</h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                          Warehouse operations are 4.9% over budget. Consider optimizing storage layout and automation.
                        </p>
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mt-2">
                          Potential savings: {formatCurrency(2200)} per month
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Vendor Negotiations</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                          Review supplier contracts for better pricing on high-volume items.
                        </p>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mt-2">
                          Potential savings: {formatCurrency(8500)} per month
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100">Logistics Optimization</h4>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                          Consolidate shipments and optimize delivery routes to reduce transportation costs.
                        </p>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mt-2">
                          Potential savings: {formatCurrency(3200)} per month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <h4 className="font-medium mb-2">Total Optimization Potential</h4>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(13900)} per month</p>
                  <p className="text-sm text-slate-600">Annual potential savings: {formatCurrency(13900 * 12)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}