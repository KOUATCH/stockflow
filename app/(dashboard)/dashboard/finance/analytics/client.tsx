"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Package,
  Users,
  ShoppingCart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  AlertTriangle,
  Calendar,
  Filter,
  Eye,
  Zap,
  Award,
  Activity
} from "lucide-react"

// Enhanced mock data with cross-functional analytics
const mockFinanceData = {
  overview: {
    totalRevenue: 773650,
    totalCosts: 324580,
    grossProfit: 449070,
    netProfit: 298420,
    grossMargin: 58.1,
    netMargin: 38.6,
    roiPercentage: 91.9,
    revenueGrowth: 22.5,
    profitGrowth: 18.5,
    costOptimization: 13.2
  },

  performanceMetrics: [
    {
      title: "Revenue Velocity",
      value: 22.5,
      trend: "up",
      description: "Month-over-month growth",
      color: "emerald",
      target: 20.0,
      achievement: 112.5
    },
    {
      title: "Cost Efficiency",
      value: 41.9,
      trend: "up",
      description: "Cost as % of revenue",
      color: "blue",
      target: 45.0,
      achievement: 106.9
    },
    {
      title: "Profit Optimization",
      value: 38.6,
      trend: "up",
      description: "Net profit margin",
      color: "violet",
      target: 35.0,
      achievement: 110.3
    },
    {
      title: "ROI Performance",
      value: 91.9,
      trend: "up",
      description: "Return on investment",
      color: "amber",
      target: 85.0,
      achievement: 108.1
    }
  ],

  productPerformance: [
    {
      product: "Wireless Headphones",
      revenue: 45680,
      cost: 27408,
      profit: 18272,
      margin: 40.0,
      units: 285,
      growth: 15.2,
      category: "Electronics",
      trend: "up"
    },
    {
      product: "Smart Watch",
      revenue: 38240,
      cost: 24504,
      profit: 13736,
      margin: 35.9,
      units: 156,
      growth: 22.1,
      category: "Electronics",
      trend: "up"
    },
    {
      product: "Laptop Stand",
      revenue: 28900,
      cost: 15295,
      profit: 13605,
      margin: 47.1,
      units: 198,
      growth: 8.7,
      category: "Accessories",
      trend: "stable"
    },
    {
      product: "Phone Case",
      revenue: 22340,
      cost: 11170,
      profit: 11170,
      margin: 50.0,
      units: 445,
      growth: 18.3,
      category: "Accessories",
      trend: "up"
    },
    {
      product: "Tablet Holder",
      revenue: 18750,
      cost: 11250,
      profit: 7500,
      margin: 40.0,
      units: 125,
      growth: -5.2,
      category: "Accessories",
      trend: "down"
    }
  ],

  locationAnalytics: [
    {
      location: "Downtown Store",
      revenue: 285420,
      costs: 118580,
      profit: 166840,
      margin: 58.5,
      efficiency: 92.3,
      trend: "up"
    },
    {
      location: "Mall Location",
      revenue: 234680,
      costs: 102340,
      profit: 132340,
      margin: 56.4,
      efficiency: 89.7,
      trend: "up"
    },
    {
      location: "Online Store",
      revenue: 189340,
      costs: 78920,
      profit: 110420,
      margin: 58.3,
      efficiency: 94.1,
      trend: "stable"
    },
    {
      location: "Warehouse Outlet",
      revenue: 64210,
      costs: 24740,
      profit: 39470,
      margin: 61.5,
      efficiency: 87.2,
      trend: "up"
    }
  ],

  trendAnalysis: [
    { month: "Jan", revenue: 689000, costs: 318000, profit: 268200, margin: 38.9 },
    { month: "Feb", revenue: 715000, costs: 325000, profit: 275500, margin: 38.5 },
    { month: "Mar", revenue: 698000, costs: 312000, profit: 262800, margin: 37.7 },
    { month: "Apr", revenue: 742000, costs: 328000, profit: 289200, margin: 39.0 },
    { month: "May", revenue: 756000, costs: 320000, profit: 297600, margin: 39.4 },
    { month: "Jun", revenue: 773650, costs: 324580, profit: 298420, margin: 38.6 }
  ],

  insights: [
    {
      type: "opportunity",
      title: "High-Margin Product Focus",
      description: "Phone Cases have 50% margin - increase marketing for 18% profit boost potential",
      impact: "high",
      value: 24500
    },
    {
      type: "warning",
      title: "Tablet Holder Decline",
      description: "5.2% decline in growth - review pricing strategy and customer feedback",
      impact: "medium",
      value: -5200
    },
    {
      type: "success",
      title: "Downtown Store Excellence",
      description: "Highest efficiency at 92.3% - replicate best practices across locations",
      impact: "high",
      value: 18900
    },
    {
      type: "optimization",
      title: "Cost Center Alignment",
      description: "Optimize warehouse operations for 2.2% cost reduction opportunity",
      impact: "medium",
      value: 8500
    }
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

const getTrendIcon = (trend: string, size = "w-4 h-4") => {
  switch (trend) {
    case "up":
      return <ArrowUpRight className={`${size} text-green-600`} />
    case "down":
      return <ArrowDownRight className={`${size} text-red-600`} />
    default:
      return <div className={size}></div>
  }
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case "opportunity":
      return <Zap className="w-5 h-5 text-amber-600" />
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-red-600" />
    case "success":
      return <Award className="w-5 h-5 text-green-600" />
    case "optimization":
      return <Target className="w-5 h-5 text-blue-600" />
    default:
      return <Activity className="w-5 h-5 text-slate-600" />
  }
}

const getColorClasses = (color: string) => {
  switch (color) {
    case "emerald":
      return {
        border: "border-emerald-300/30",
        gradient: "bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20",
        pulse: "bg-emerald-500/20"
      }
    case "blue":
      return {
        border: "border-blue-300/30",
        gradient: "bg-gradient-to-br from-blue-400/20 via-cyan-400/10 to-indigo-400/20",
        pulse: "bg-blue-500/20"
      }
    case "violet":
      return {
        border: "border-violet-300/30",
        gradient: "bg-gradient-to-br from-violet-400/20 via-purple-400/10 to-indigo-400/20",
        pulse: "bg-violet-500/20"
      }
    case "amber":
      return {
        border: "border-amber-300/30",
        gradient: "bg-gradient-to-br from-amber-400/20 via-yellow-400/10 to-orange-400/20",
        pulse: "bg-amber-500/20"
      }
    case "red":
      return {
        border: "border-red-300/30",
        gradient: "bg-gradient-to-br from-red-400/20 via-rose-400/10 to-pink-400/20",
        pulse: "bg-red-500/20"
      }
    case "teal":
      return {
        border: "border-teal-300/30",
        gradient: "bg-gradient-to-br from-teal-400/20 via-emerald-400/10 to-green-400/20",
        pulse: "bg-teal-500/20"
      }
    case "indigo":
      return {
        border: "border-indigo-300/30",
        gradient: "bg-gradient-to-br from-indigo-400/20 via-purple-400/10 to-violet-400/20",
        pulse: "bg-indigo-500/20"
      }
    case "cyan":
      return {
        border: "border-cyan-300/30",
        gradient: "bg-gradient-to-br from-cyan-400/20 via-blue-400/10 to-indigo-400/20",
        pulse: "bg-cyan-500/20"
      }
    default:
      return {
        border: "border-slate-300/30",
        gradient: "bg-gradient-to-br from-slate-400/20 via-gray-400/10 to-zinc-400/20",
        pulse: "bg-slate-500/20"
      }
  }
}

export default function ComprehensiveFinanceAnalyticsClient() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const filteredProducts = useMemo(() => {
    let filtered = mockFinanceData.productPerformance
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    return filtered.sort((a, b) => b.profit - a.profit)
  }, [selectedCategory])

  const filteredLocations = useMemo(() => {
    return mockFinanceData.locationAnalytics.sort((a, b) => b.profit - a.profit)
  }, [selectedLocation])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 shadow-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Comprehensive Finance Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Unified sales, cost, and profitability intelligence dashboard
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Revenue +{formatPercentage(mockFinanceData.overview.revenueGrowth)}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    <Target className="w-3 h-3 mr-1" />
                    ROI {formatPercentage(mockFinanceData.overview.roiPercentage)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="downtown">Downtown Store</SelectItem>
                  <SelectItem value="mall">Mall Location</SelectItem>
                  <SelectItem value="online">Online Store</SelectItem>
                  <SelectItem value="warehouse">Warehouse Outlet</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators - Receivables/Payables Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockFinanceData.performanceMetrics.map((metric, index) => {
            const colors = getColorClasses(metric.color)
            return (
              <Card key={metric.title} className={`relative overflow-hidden border-2 ${colors.border} ${colors.gradient} backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
                <div className="absolute inset-0 opacity-20">
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${colors.pulse} animate-pulse`} />
                  <div className={`absolute top-8 right-8 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-200`} />
                  <div className={`absolute bottom-4 left-4 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-500`} />
                </div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                      {index === 0 && <TrendingUp className="w-6 h-6 text-emerald-600" />}
                      {index === 1 && <DollarSign className="w-6 h-6 text-blue-600" />}
                      {index === 2 && <Target className="w-6 h-6 text-violet-600" />}
                      {index === 3 && <Award className="w-6 h-6 text-amber-600" />}
                    </div>
                    {getTrendIcon(metric.trend, "w-5 h-5")}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{metric.title}</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {formatPercentage(metric.value)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">vs Target</span>
                        <span className="font-medium text-green-600">{formatPercentage(metric.achievement)}</span>
                      </div>
                      <Progress
                        value={Math.min(metric.achievement, 120)}
                        className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
                      />
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">{metric.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Overview Cards - Receivables/Payables Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-emerald-500/20 animate-pulse" />
              <div className="absolute top-12 right-12 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse delay-500" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                Financial Overview
                <Badge className="bg-green-100/80 text-green-800 dark:bg-green-900/20 dark:text-green-300 backdrop-blur-sm">
                  Live Data
                </Badge>
              </CardTitle>
              <CardDescription>Real-time financial performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/30 dark:bg-slate-800/30 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(mockFinanceData.overview.totalRevenue)}</p>
                </div>
                <div className="text-center p-4 bg-white/30 dark:bg-slate-800/30 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Costs</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(mockFinanceData.overview.totalCosts)}</p>
                </div>
                <div className="text-center p-4 bg-white/30 dark:bg-slate-800/30 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Gross Profit</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(mockFinanceData.overview.grossProfit)}</p>
                </div>
                <div className="text-center p-4 bg-white/30 dark:bg-slate-800/30 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Net Profit</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(mockFinanceData.overview.netProfit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-blue-300/30 bg-gradient-to-br from-blue-400/20 via-cyan-400/10 to-indigo-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 ease-out group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-blue-500/20 animate-pulse delay-200" />
              <div className="absolute bottom-4 left-4 w-1 h-1 rounded-full bg-blue-500/20 animate-pulse delay-500" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                {mockFinanceData.insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{insight.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{insight.description}</p>
                      {insight.value > 0 && (
                        <p className="text-xs font-medium text-green-600 mt-1">+{formatCurrency(insight.value)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <Card className="relative overflow-hidden border-2 border-violet-300/30 bg-gradient-to-br from-violet-400/20 via-purple-400/10 to-indigo-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-violet-500/20 animate-pulse delay-200" />
            </div>
            <CardContent className="p-4 relative z-10">
              <TabsList className="grid w-full grid-cols-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/30">
                <TabsTrigger value="products" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30">
                  Product Analytics
                </TabsTrigger>
                <TabsTrigger value="locations" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30">
                  Location Performance
                </TabsTrigger>
                <TabsTrigger value="trends" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30">
                  Trend Analysis
                </TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30">
                  AI Insights
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Product Performance Analysis</h2>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredProducts.map((product, index) => {
                const colors = getColorClasses(index % 2 === 0 ? "indigo" : "cyan")
                return (
                  <Card key={product.product} className={`relative overflow-hidden border-2 ${colors.border} ${colors.gradient} backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
                    <div className="absolute inset-0 opacity-20">
                      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${colors.pulse} animate-pulse`} />
                      <div className={`absolute top-8 right-8 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-200`} />
                      <div className={`absolute bottom-4 left-4 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-500`} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-900 dark:text-white text-lg font-bold shadow-lg border border-white/30">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{product.product}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="secondary" className="text-xs bg-white/30 backdrop-blur-sm">
                                {product.category}
                              </Badge>
                              <Badge
                                variant={product.margin >= 40 ? "default" : "secondary"}
                                className={product.margin >= 40 ? "bg-green-100/80 text-green-800 dark:bg-green-900/20 dark:text-green-300 backdrop-blur-sm" : "bg-white/30 backdrop-blur-sm"}
                              >
                                {formatPercentage(product.margin)} margin
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {getTrendIcon(product.trend)}
                            <span className={`text-sm font-medium ${
                              product.growth > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {product.growth > 0 ? '+' : ''}{formatPercentage(product.growth)}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(product.profit)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Profit</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                          { label: "Revenue", value: formatCurrency(product.revenue), color: "text-slate-900 dark:text-white" },
                          { label: "Cost", value: formatCurrency(product.cost), color: "text-red-600" },
                          { label: "Units Sold", value: product.units.toLocaleString(), color: "text-blue-600" },
                          { label: "Profit/Unit", value: formatCurrency(product.profit / product.units), color: "text-purple-600" },
                          { label: "Efficiency", value: formatPercentage(product.margin), color: "text-emerald-600" }
                        ].map((item, idx) => (
                          <div key={idx} className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{item.label}</p>
                            <p className={`font-bold ${item.color}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                          <span>Profit Margin</span>
                          <span>{formatPercentage(product.margin)}</span>
                        </div>
                        <Progress
                          value={Math.min(product.margin, 60)}
                          className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Location Performance Analysis</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredLocations.map((location, index) => {
                const colors = getColorClasses(index % 4 === 0 ? "blue" : index % 4 === 1 ? "emerald" : index % 4 === 2 ? "violet" : "amber")
                return (
                  <Card key={location.location} className={`relative overflow-hidden border-2 ${colors.border} ${colors.gradient} backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
                    <div className="absolute inset-0 opacity-20">
                      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${colors.pulse} animate-pulse`} />
                      <div className={`absolute top-8 right-8 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-200`} />
                      <div className={`absolute bottom-4 left-4 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-500`} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{location.location}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getTrendIcon(location.trend)}
                            <Badge variant="secondary" className="text-xs bg-white/30 backdrop-blur-sm">
                              {formatPercentage(location.efficiency)} efficiency
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(location.profit)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Net Profit</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Revenue</p>
                          <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(location.revenue)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Costs</p>
                          <p className="font-bold text-red-600">{formatCurrency(location.costs)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Margin</p>
                          <p className="font-bold text-green-600">{formatPercentage(location.margin)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Profit Margin</span>
                          <span>{formatPercentage(location.margin)}</span>
                        </div>
                        <Progress
                          value={Math.min(location.margin, 70)}
                          className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
                        />

                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Operational Efficiency</span>
                          <span>{formatPercentage(location.efficiency)}</span>
                        </div>
                        <Progress
                          value={location.efficiency}
                          className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Trend Analysis</h2>

            <Card className="relative overflow-hidden border-2 border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 ease-out group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-emerald-500/20 animate-pulse" />
                <div className="absolute top-12 right-12 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse delay-200" />
                <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse delay-500" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  6-Month Financial Performance
                </CardTitle>
                <CardDescription>Revenue, costs, and profit trends over time</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {mockFinanceData.trendAnalysis.map((trend, index) => (
                    <div key={trend.month} className="p-4 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">{trend.month} 2024</h4>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">{formatCurrency(trend.profit)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{formatPercentage(trend.margin)} margin</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white/40 dark:bg-slate-700/40 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Revenue</p>
                          <p className="text-lg font-bold text-blue-600">{formatCurrency(trend.revenue)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/40 dark:bg-slate-700/40 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Costs</p>
                          <p className="text-lg font-bold text-red-600">{formatCurrency(trend.costs)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/40 dark:bg-slate-700/40 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Profit</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(trend.profit)}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                          <span>Profit Margin</span>
                          <span>{formatPercentage(trend.margin)}</span>
                        </div>
                        <Progress
                          value={Math.min(trend.margin, 50)}
                          className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-white/40 dark:bg-slate-800/40 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg">
                  <h4 className="font-bold text-green-900 dark:text-green-100 mb-2">Performance Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-green-700 dark:text-green-300">Average Monthly Revenue</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(mockFinanceData.trendAnalysis.reduce((acc, t) => acc + t.revenue, 0) / mockFinanceData.trendAnalysis.length)}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700 dark:text-green-300">Best Performing Month</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        {mockFinanceData.trendAnalysis.reduce((max, t) => t.profit > max.profit ? t : max).month}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700 dark:text-green-300">Growth Trajectory</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        +{formatPercentage(22.5)} YoY
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI-Powered Business Insights</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockFinanceData.insights.map((insight, index) => {
                const colors = getColorClasses(
                  insight.type === 'opportunity' ? 'amber' :
                  insight.type === 'warning' ? 'red' :
                  insight.type === 'success' ? 'emerald' : 'blue'
                )
                return (
                  <Card key={index} className={`relative overflow-hidden border-2 ${colors.border} ${colors.gradient} backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
                    <div className="absolute inset-0 opacity-20">
                      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${colors.pulse} animate-pulse`} />
                      <div className={`absolute top-8 right-8 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-200`} />
                      <div className={`absolute bottom-4 left-4 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-500`} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                          {getInsightIcon(insight.type)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{insight.title}</h3>
                            <Badge variant={
                              insight.impact === 'high' ? 'default' :
                              insight.impact === 'medium' ? 'secondary' : 'outline'
                            } className="bg-white/30 backdrop-blur-sm">
                              {insight.impact} impact
                            </Badge>
                          </div>

                          <p className="text-slate-700 dark:text-slate-300 mb-3">{insight.description}</p>

                          {insight.value !== 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Potential impact:</span>
                              <span className={`font-bold ${insight.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {insight.value > 0 ? '+' : ''}{formatCurrency(Math.abs(insight.value))}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card className="relative overflow-hidden border-2 border-violet-300/30 bg-gradient-to-br from-violet-400/20 via-purple-400/10 to-indigo-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 ease-out group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-violet-500/20 animate-pulse" />
                <div className="absolute top-12 right-12 w-2 h-2 rounded-full bg-violet-500/20 animate-pulse delay-200" />
                <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-violet-500/20 animate-pulse delay-500" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                    <Target className="w-5 h-5 text-violet-600" />
                  </div>
                  Strategic Recommendations
                </CardTitle>
                <CardDescription>AI-generated action items for business optimization</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {[
                    { title: "🎯 Priority Actions", items: [
                      "Increase marketing spend on Phone Cases (+50% margin potential)",
                      "Implement Downtown Store best practices across all locations",
                      "Review Tablet Holder pricing and positioning strategy"
                    ]},
                    { title: "📈 Growth Opportunities", items: [
                      "Scale successful electronics category expansion",
                      "Optimize inventory levels for high-margin products",
                      "Explore cross-selling opportunities between categories"
                    ]},
                    { title: "⚡ Quick Wins", items: [
                      "Negotiate better supplier terms for high-volume items",
                      "Implement dynamic pricing for seasonal products",
                      "Reduce warehouse operational costs through automation"
                    ]}
                  ].map((section, idx) => (
                    <div key={idx} className="p-4 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">{section.title}</h4>
                      <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}