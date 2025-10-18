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
  ShoppingCart,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Package,
  MapPin,
  Calendar,
  Filter,
  Target,
  Award,
  Zap,
  AlertTriangle,
  Clock,
  CreditCard,
  Store,
  Smartphone
} from "lucide-react"

// Enhanced comprehensive sales data
const mockSalesData = {
  overview: {
    totalRevenue: 847650,
    totalTransactions: 2847,
    averageOrderValue: 297.6,
    revenueGrowth: 28.7,
    transactionGrowth: 24.3,
    conversionRate: 3.8,
    customerRetention: 78.4,
    avgTransactionTime: 3.2
  },

  locationSales: [
    {
      location: "Downtown Store",
      revenue: 298420,
      transactions: 1247,
      avgOrderValue: 239.3,
      growth: 31.2,
      conversionRate: 4.2,
      topCategory: "Electronics",
      efficiency: 94.2
    },
    {
      location: "Mall Location",
      revenue: 234680,
      transactions: 986,
      avgOrderValue: 238.0,
      growth: 22.8,
      conversionRate: 3.6,
      topCategory: "Fashion",
      efficiency: 88.7
    },
    {
      location: "Online Store",
      revenue: 189340,
      transactions: 456,
      avgOrderValue: 415.1,
      growth: 45.6,
      conversionRate: 2.8,
      topCategory: "Electronics",
      efficiency: 96.1
    },
    {
      location: "Airport Branch",
      revenue: 125210,
      transactions: 158,
      avgOrderValue: 792.5,
      growth: 18.4,
      conversionRate: 5.2,
      topCategory: "Luxury",
      efficiency: 91.5
    }
  ],

  productPerformance: [
    {
      product: "Wireless Headphones Pro",
      category: "Electronics",
      revenue: 67890,
      units: 234,
      avgPrice: 290.2,
      growth: 34.2,
      margin: 42.1,
      inventory: 89,
      rating: 4.8,
      trend: "up"
    },
    {
      product: "Smart Watch Ultra",
      category: "Electronics",
      revenue: 58420,
      units: 145,
      avgPrice: 402.9,
      growth: 28.6,
      margin: 38.5,
      inventory: 156,
      rating: 4.6,
      trend: "up"
    },
    {
      product: "Premium Laptop Stand",
      category: "Accessories",
      revenue: 45670,
      units: 298,
      avgPrice: 153.3,
      growth: 15.4,
      margin: 51.2,
      inventory: 67,
      rating: 4.7,
      trend: "stable"
    },
    {
      product: "Designer Phone Case",
      category: "Accessories",
      revenue: 38950,
      units: 567,
      avgPrice: 68.7,
      growth: 41.8,
      margin: 55.3,
      inventory: 234,
      rating: 4.5,
      trend: "up"
    },
    {
      product: "Wireless Charger",
      category: "Electronics",
      revenue: 29340,
      units: 189,
      avgPrice: 155.2,
      growth: -8.2,
      margin: 33.1,
      inventory: 45,
      rating: 4.2,
      trend: "down"
    }
  ],

  salesChannels: [
    {
      channel: "In-Store POS",
      revenue: 456780,
      transactions: 1945,
      percentage: 53.9,
      growth: 22.4,
      avgOrderValue: 234.8,
      conversionRate: 4.1
    },
    {
      channel: "E-commerce Website",
      revenue: 234890,
      transactions: 567,
      percentage: 27.7,
      growth: 45.3,
      avgOrderValue: 414.3,
      conversionRate: 2.8
    },
    {
      channel: "Mobile App",
      revenue: 98450,
      transactions: 234,
      percentage: 11.6,
      growth: 67.8,
      avgOrderValue: 420.7,
      conversionRate: 3.2
    },
    {
      channel: "Phone Orders",
      revenue: 57530,
      transactions: 101,
      percentage: 6.8,
      growth: 8.9,
      avgOrderValue: 569.6,
      conversionRate: 5.4
    }
  ],

  customerSegments: [
    {
      segment: "VIP Customers",
      revenue: 289340,
      customers: 156,
      avgSpend: 1854.2,
      transactions: 845,
      retentionRate: 94.2,
      growth: 23.1
    },
    {
      segment: "Regular Customers",
      revenue: 345780,
      customers: 1247,
      avgSpend: 277.3,
      transactions: 1567,
      retentionRate: 78.6,
      growth: 31.4
    },
    {
      segment: "New Customers",
      revenue: 189320,
      customers: 567,
      avgSpend: 334.0,
      transactions: 435,
      retentionRate: 45.8,
      growth: 42.7
    },
    {
      segment: "Seasonal Customers",
      revenue: 23210,
      customers: 89,
      avgSpend: 260.8,
      transactions: 89,
      retentionRate: 23.4,
      growth: 15.6
    }
  ],

  timeAnalysis: [
    { period: "Jan 2024", revenue: 678000, transactions: 1823, growth: 18.4, conversionRate: 3.2 },
    { period: "Feb 2024", revenue: 715000, transactions: 1945, growth: 22.1, conversionRate: 3.4 },
    { period: "Mar 2024", revenue: 698000, transactions: 1756, growth: 19.8, conversionRate: 3.1 },
    { period: "Apr 2024", revenue: 742000, transactions: 2134, growth: 25.3, conversionRate: 3.6 },
    { period: "May 2024", revenue: 789000, transactions: 2287, growth: 28.1, conversionRate: 3.7 },
    { period: "Jun 2024", revenue: 847650, transactions: 2847, growth: 28.7, conversionRate: 3.8 }
  ],

  insights: [
    {
      type: "opportunity",
      title: "Mobile App Revenue Surge",
      description: "Mobile app sales grew 67.8% with highest conversion rate potential",
      impact: "high",
      value: 45600,
      action: "Increase mobile marketing budget"
    },
    {
      type: "success",
      title: "VIP Customer Performance",
      description: "VIP segment shows 94.2% retention with premium spending patterns",
      impact: "high",
      value: 28900,
      action: "Expand VIP program benefits"
    },
    {
      type: "warning",
      title: "Wireless Charger Decline",
      description: "8.2% revenue drop and low inventory levels need attention",
      impact: "medium",
      value: -8200,
      action: "Review pricing and inventory strategy"
    },
    {
      type: "optimization",
      title: "Online Store Efficiency",
      description: "Highest average order value at $415 - optimize for scale",
      impact: "high",
      value: 35400,
      action: "Enhance online user experience"
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
      return <BarChart3 className="w-5 h-5 text-slate-600" />
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

export default function SalesAnalyticsClient() {
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
    let filtered = mockSalesData.productPerformance
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }
    return filtered.sort((a, b) => b.revenue - a.revenue)
  }, [selectedCategory])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 shadow-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Advanced Sales Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Comprehensive sales performance intelligence with location-based insights
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Revenue +{formatPercentage(mockSalesData.overview.revenueGrowth)}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    {mockSalesData.overview.totalTransactions.toLocaleString()} Transactions
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
                  <SelectItem value="airport">Airport Branch</SelectItem>
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

        {/* Key Metrics - Receivables/Payables Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Revenue", value: formatCurrency(mockSalesData.overview.totalRevenue), growth: mockSalesData.overview.revenueGrowth, icon: DollarSign, color: "emerald" },
            { title: "Total Transactions", value: mockSalesData.overview.totalTransactions.toLocaleString(), growth: mockSalesData.overview.transactionGrowth, icon: ShoppingCart, color: "blue" },
            { title: "Avg Order Value", value: formatCurrency(mockSalesData.overview.averageOrderValue), growth: 12.4, icon: BarChart3, color: "violet" },
            { title: "Conversion Rate", value: formatPercentage(mockSalesData.overview.conversionRate), growth: 8.7, icon: Target, color: "amber" }
          ].map((metric, index) => {
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
                      <metric.icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        +{formatPercentage(metric.growth)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{metric.title}</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Sales Performance Overview */}
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
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                Sales Performance Overview
                <Badge className="bg-green-100/80 text-green-800 dark:bg-green-900/20 dark:text-green-300 backdrop-blur-sm">
                  Live Data
                </Badge>
              </CardTitle>
              <CardDescription>Real-time sales metrics across all channels</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/30 dark:bg-slate-800/30 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Customer Retention</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatPercentage(mockSalesData.overview.customerRetention)}</p>
                </div>
                <div className="text-center p-4 bg-white/30 dark:bg-slate-800/30 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Transaction Time</p>
                  <p className="text-2xl font-bold text-blue-600">{mockSalesData.overview.avgTransactionTime}min</p>
                </div>
                <div className="text-center p-4 bg-white/30 dark:bg-slate-800/30 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Daily Average</p>
                  <p className="text-2xl font-bold text-violet-600">{formatCurrency(mockSalesData.overview.totalRevenue / 30)}</p>
                </div>
                <div className="text-center p-4 bg-white/30 dark:bg-slate-800/30 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Revenue/Transaction</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(mockSalesData.overview.totalRevenue / mockSalesData.overview.totalTransactions)}</p>
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
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                Sales Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                {mockSalesData.insights.slice(0, 3).map((insight, index) => (
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
        <Tabs defaultValue="locations" className="space-y-6">
          <Card className="relative overflow-hidden border-2 border-violet-300/30 bg-gradient-to-br from-violet-400/20 via-purple-400/10 to-indigo-400/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-500/20 animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-violet-500/20 animate-pulse delay-200" />
            </div>
            <CardContent className="p-4 relative z-10">
              <TabsList className="grid w-full grid-cols-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/30">
                <TabsTrigger value="locations" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30">
                  Locations
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30">
                  Products
                </TabsTrigger>
                <TabsTrigger value="channels" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30">
                  Channels
                </TabsTrigger>
                <TabsTrigger value="customers" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30">
                  Customers
                </TabsTrigger>
                <TabsTrigger value="trends" className="data-[state=active]:bg-white/70 data-[state=active]:backdrop-blur-sm data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30">
                  Trends
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          <TabsContent value="locations" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Location-Based Sales Analysis</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockSalesData.locationSales.map((location, index) => {
                const colors = getColorClasses(index % 4 === 0 ? "emerald" : index % 4 === 1 ? "blue" : index % 4 === 2 ? "violet" : "amber")
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
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                            <Store className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{location.location}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs bg-white/30 backdrop-blur-sm">
                                {location.topCategory}
                              </Badge>
                              <Badge variant="secondary" className="text-xs bg-white/30 backdrop-blur-sm">
                                {formatPercentage(location.efficiency)} efficiency
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">+{formatPercentage(location.growth)}</span>
                          </div>
                          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(location.revenue)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Transactions</p>
                          <p className="font-bold text-slate-900 dark:text-white">{location.transactions.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Order</p>
                          <p className="font-bold text-blue-600">{formatCurrency(location.avgOrderValue)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Conversion</p>
                          <p className="font-bold text-green-600">{formatPercentage(location.conversionRate)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Performance vs Target</span>
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
                              <Badge className="text-xs bg-amber-100/80 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 backdrop-blur-sm">
                                ⭐ {product.rating}
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
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Units Sold</p>
                          <p className="font-bold text-slate-900 dark:text-white">{product.units.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Price</p>
                          <p className="font-bold text-blue-600">{formatCurrency(product.avgPrice)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Margin</p>
                          <p className="font-bold text-green-600">{formatPercentage(product.margin)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Inventory</p>
                          <p className={`font-bold ${product.inventory < 100 ? 'text-red-600' : 'text-emerald-600'}`}>{product.inventory}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Performance</p>
                          <p className="font-bold text-purple-600">{formatPercentage(product.margin * 2)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Sales Performance</span>
                          <span>{formatPercentage(product.margin * 1.8)}</span>
                        </div>
                        <Progress
                          value={Math.min(product.margin * 1.8, 100)}
                          className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sales Channel Performance</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockSalesData.salesChannels.map((channel, index) => {
                const colors = getColorClasses(index % 4 === 0 ? "blue" : index % 4 === 1 ? "emerald" : index % 4 === 2 ? "violet" : "amber")
                return (
                  <Card key={channel.channel} className={`relative overflow-hidden border-2 ${colors.border} ${colors.gradient} backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
                    <div className="absolute inset-0 opacity-20">
                      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${colors.pulse} animate-pulse`} />
                      <div className={`absolute top-8 right-8 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-200`} />
                      <div className={`absolute bottom-4 left-4 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-500`} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                            {index === 0 && <Store className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                            {index === 1 && <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                            {index === 2 && <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                            {index === 3 && <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{channel.channel}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs bg-white/30 backdrop-blur-sm">
                                {formatPercentage(channel.percentage)} share
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">+{formatPercentage(channel.growth)}</span>
                          </div>
                          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(channel.revenue)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Revenue</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Transactions</p>
                          <p className="font-bold text-slate-900 dark:text-white">{channel.transactions.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Order</p>
                          <p className="font-bold text-blue-600">{formatCurrency(channel.avgOrderValue)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Conversion</p>
                          <p className="font-bold text-green-600">{formatPercentage(channel.conversionRate)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Market Share</span>
                          <span>{formatPercentage(channel.percentage)}</span>
                        </div>
                        <Progress
                          value={channel.percentage}
                          className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Segment Analysis</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockSalesData.customerSegments.map((segment, index) => {
                const colors = getColorClasses(index % 4 === 0 ? "violet" : index % 4 === 1 ? "emerald" : index % 4 === 2 ? "blue" : "amber")
                return (
                  <Card key={segment.segment} className={`relative overflow-hidden border-2 ${colors.border} ${colors.gradient} backdrop-blur-xl shadow-2xl ring-1 ring-white/20 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />
                    <div className="absolute inset-0 opacity-20">
                      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${colors.pulse} animate-pulse`} />
                      <div className={`absolute top-8 right-8 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-200`} />
                      <div className={`absolute bottom-4 left-4 w-1 h-1 rounded-full ${colors.pulse} animate-pulse delay-500`} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
                            <Users className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{segment.segment}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{segment.customers.toLocaleString()} customers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">+{formatPercentage(segment.growth)}</span>
                          </div>
                          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(segment.revenue)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Spend</p>
                          <p className="font-bold text-blue-600">{formatCurrency(segment.avgSpend)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Transactions</p>
                          <p className="font-bold text-slate-900 dark:text-white">{segment.transactions.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Retention Rate</span>
                          <span>{formatPercentage(segment.retentionRate)}</span>
                        </div>
                        <Progress
                          value={segment.retentionRate}
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sales Trend Analysis</h2>

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
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  6-Month Sales Performance
                </CardTitle>
                <CardDescription>Revenue and transaction trends over time</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {mockSalesData.timeAnalysis.map((trend, index) => (
                    <div key={trend.period} className="p-4 bg-white/30 dark:bg-slate-800/30 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">{trend.period}</h4>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">{formatCurrency(trend.revenue)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">+{formatPercentage(trend.growth)} growth</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-white/40 dark:bg-slate-700/40 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Transactions</p>
                          <p className="text-lg font-bold text-blue-600">{trend.transactions.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-white/40 dark:bg-slate-700/40 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Order Value</p>
                          <p className="text-lg font-bold text-purple-600">{formatCurrency(trend.revenue / trend.transactions)}</p>
                        </div>
                        <div className="text-center p-3 bg-white/40 dark:bg-slate-700/40 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg">
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Conversion Rate</p>
                          <p className="text-lg font-bold text-amber-600">{formatPercentage(trend.conversionRate)}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                          <span>Performance Growth</span>
                          <span>+{formatPercentage(trend.growth)}</span>
                        </div>
                        <Progress
                          value={Math.min(trend.growth, 50)}
                          className="h-2 bg-slate-200/50 dark:bg-slate-700/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-white/40 dark:bg-slate-800/40 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg">
                  <h4 className="font-bold text-green-900 dark:text-green-100 mb-2">Sales Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-green-700 dark:text-green-300">Average Monthly Revenue</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(mockSalesData.timeAnalysis.reduce((acc, t) => acc + t.revenue, 0) / mockSalesData.timeAnalysis.length)}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700 dark:text-green-300">Best Performing Month</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        {mockSalesData.timeAnalysis.reduce((max, t) => t.revenue > max.revenue ? t : max).period}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-700 dark:text-green-300">Growth Trajectory</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        +{formatPercentage(28.7)} YoY
                      </p>
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