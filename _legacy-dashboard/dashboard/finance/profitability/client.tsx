"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Target
} from "lucide-react"

const mockProfitabilityData = {
  overview: {
    grossProfit: 289420,
    grossMargin: 37.4,
    netProfit: 156780,
    netMargin: 20.3,
    operatingProfit: 198340,
    operatingMargin: 25.6,
    profitGrowth: 18.5
  },
  productProfitability: [
    { name: "Wireless Headphones", revenue: 45680, cost: 27408, profit: 18272, margin: 40.0 },
    { name: "Smart Watch", revenue: 38240, cost: 24504, profit: 13736, margin: 35.9 },
    { name: "Laptop Stand", revenue: 28900, cost: 15295, profit: 13605, margin: 47.1 },
    { name: "Phone Case", revenue: 22340, cost: 11170, profit: 11170, margin: 50.0 },
    { name: "Tablet Holder", revenue: 18750, cost: 11250, profit: 7500, margin: 40.0 }
  ],
  categoryProfitability: [
    { category: "Electronics", revenue: 185420, profit: 74168, margin: 40.0, trend: "up" },
    { category: "Accessories", revenue: 124680, profit: 43638, margin: 35.0, trend: "stable" },
    { category: "Home & Office", revenue: 89340, profit: 26802, margin: 30.0, trend: "down" },
    { category: "Sports & Fitness", revenue: 67230, profit: 20169, margin: 30.0, trend: "up" }
  ],
  customerSegments: [
    { segment: "Premium Customers", revenue: 156780, profit: 62712, margin: 40.0, count: 245 },
    { segment: "Regular Customers", revenue: 234560, profit: 70368, margin: 30.0, count: 867 },
    { segment: "Wholesale", revenue: 89340, profit: 17868, margin: 20.0, count: 45 }
  ],
  monthlyTrends: [
    { month: "Jan", grossProfit: 268000, netProfit: 145200, margin: 24.2 },
    { month: "Feb", grossProfit: 275000, netProfit: 148500, margin: 24.8 },
    { month: "Mar", grossProfit: 262000, netProfit: 141480, margin: 23.6 },
    { month: "Apr", grossProfit: 278000, netProfit: 150120, margin: 25.0 },
    { month: "May", grossProfit: 285000, netProfit: 153900, margin: 25.7 },
    { month: "Jun", grossProfit: 289420, netProfit: 156780, margin: 26.1 }
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
      return <ArrowUpRight className="h-4 w-4 text-green-600" />
    case "down":
      return <ArrowDownRight className="h-4 w-4 text-red-600" />
    default:
      return <div className="h-4 w-4"></div>
  }
}

export default function ProfitabilityAnalysisClient() {
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Profitability Analysis
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Detailed profit analysis across products, categories, and segments
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
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Gross Profit</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(mockProfitabilityData.overview.grossProfit)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatPercentage(mockProfitabilityData.overview.grossMargin)} margin
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">
                    {formatPercentage(mockProfitabilityData.overview.profitGrowth)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Operating Profit</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(mockProfitabilityData.overview.operatingProfit)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatPercentage(mockProfitabilityData.overview.operatingMargin)} margin
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
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Net Profit</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(mockProfitabilityData.overview.netProfit)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatPercentage(mockProfitabilityData.overview.netMargin)} margin
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
                    <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Profit Growth</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatPercentage(mockProfitabilityData.overview.profitGrowth)}
                    </p>
                    <p className="text-xs text-green-500">vs last period</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Profitability
                </CardTitle>
                <CardDescription>Top performing products by profit margin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProfitabilityData.productProfitability.map((product, index) => (
                    <div key={product.name} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">{product.name}</h4>
                            <p className="text-sm text-green-600 font-medium">{formatPercentage(product.margin)} margin</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">{formatCurrency(product.profit)}</p>
                          <p className="text-sm text-slate-600">Profit</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Revenue</p>
                          <p className="font-medium">{formatCurrency(product.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Cost</p>
                          <p className="font-medium">{formatCurrency(product.cost)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Margin</p>
                          <p className="font-medium text-green-600">{formatPercentage(product.margin)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Category Profitability
                </CardTitle>
                <CardDescription>Profit performance by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProfitabilityData.categoryProfitability.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                          index === 0 ? 'from-green-500 to-emerald-500' :
                          index === 1 ? 'from-blue-500 to-indigo-500' :
                          index === 2 ? 'from-purple-500 to-violet-500' :
                          'from-orange-500 to-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-slate-600">Revenue: {formatCurrency(category.revenue)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTrendIcon(category.trend)}
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(category.profit)}</p>
                          <p className="text-sm text-slate-600">{formatPercentage(category.margin)} margin</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Segment Profitability
                </CardTitle>
                <CardDescription>Profit analysis by customer segments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProfitabilityData.customerSegments.map((segment, index) => (
                    <div key={segment.segment} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{segment.segment}</h4>
                          <p className="text-sm text-slate-600">{segment.count} customers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">{formatCurrency(segment.profit)}</p>
                          <p className="text-sm text-slate-600">Total Profit</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Revenue</p>
                          <p className="font-medium">{formatCurrency(segment.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Profit</p>
                          <p className="font-medium text-green-600">{formatCurrency(segment.profit)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Margin</p>
                          <p className="font-medium">{formatPercentage(segment.margin)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Avg per Customer</p>
                          <p className="font-medium">{formatCurrency(segment.profit / segment.count)}</p>
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
                  Profitability Trends
                </CardTitle>
                <CardDescription>Monthly profit trends and margin analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProfitabilityData.monthlyTrends.map((trend) => (
                    <div key={trend.month} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-lg">{trend.month}</h4>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">{formatCurrency(trend.netProfit)}</p>
                          <p className="text-sm text-slate-600">{formatPercentage(trend.margin)} margin</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Gross Profit</p>
                          <p className="font-medium">{formatCurrency(trend.grossProfit)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Net Profit</p>
                          <p className="font-medium text-green-600">{formatCurrency(trend.netProfit)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Profitability Summary</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-green-700 dark:text-green-300">Average Monthly Profit</p>
                      <p className="font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(mockProfitabilityData.monthlyTrends.reduce((acc, t) => acc + t.netProfit, 0) / mockProfitabilityData.monthlyTrends.length)}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700 dark:text-green-300">Best Month</p>
                      <p className="font-bold text-green-900 dark:text-green-100">
                        {mockProfitabilityData.monthlyTrends.reduce((max, t) => t.netProfit > max.netProfit ? t : max).month}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700 dark:text-green-300">Growth Trend</p>
                      <p className="font-bold text-green-900 dark:text-green-100">+{formatPercentage(18.5)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}