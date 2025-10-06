"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Clock,
  MapPin,
  Star,
  AlertTriangle,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Zap,
  UserCheck,
  Activity,
  Percent,
  Award,
  ThumbsUp,
  TrendingUpIcon
} from "lucide-react"

interface ComprehensiveSalesDashboardProps {
  organizationId?: string
  locationId?: string
}

const ComprehensiveSalesDashboard = ({
  organizationId = "default-org",
  locationId = "1"
}: ComprehensiveSalesDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("today")
  const [selectedLocation, setSelectedLocation] = useState(locationId)
  const [activeView, setActiveView] = useState("overview")

  // Mock data - replace with real data hooks
  const salesMetrics = {
    revenue: {
      total: 245750.89,
      change: 12.5,
      trend: "up",
      target: 250000,
      progress: 98.3
    },
    transactions: {
      total: 1247,
      change: 8.3,
      trend: "up",
      avgValue: 197.19,
      peakHour: "2:00 PM"
    },
    customers: {
      total: 892,
      new: 156,
      returning: 736,
      loyalty: 68.5,
      satisfaction: 4.7
    },
    products: {
      sold: 3245,
      categories: 23,
      topSelling: "Electronics",
      lowStock: 12,
      outOfStock: 3
    },
    staff: {
      active: 15,
      topPerformer: "Sarah Johnson",
      avgSalesPerStaff: 16383.39,
      totalHours: 120
    },
    payments: {
      cash: 45.2,
      card: 38.7,
      digital: 16.1,
      fastestMethod: "Contactless"
    }
  }

  const salesAspects = [
    {
      id: "revenue",
      title: "Revenue Analytics",
      icon: DollarSign,
      color: "bg-green-500",
      metrics: [
        { label: "Total Revenue", value: `$${salesMetrics.revenue.total.toLocaleString()}`, change: `+${salesMetrics.revenue.change}%` },
        { label: "Target Progress", value: `${salesMetrics.revenue.progress}%`, change: "98.3% complete" },
        { label: "Avg. Order Value", value: "$197.19", change: "+5.2%" },
        { label: "Revenue per Hour", value: "$2,048", change: "+8.1%" }
      ]
    },
    {
      id: "transactions",
      title: "Transaction Insights",
      icon: ShoppingCart,
      color: "bg-blue-500",
      metrics: [
        { label: "Total Transactions", value: salesMetrics.transactions.total.toLocaleString(), change: `+${salesMetrics.transactions.change}%` },
        { label: "Avg Transaction Value", value: `$${salesMetrics.transactions.avgValue}`, change: "+3.7%" },
        { label: "Peak Hour", value: salesMetrics.transactions.peakHour, change: "Highest traffic" },
        { label: "Conversion Rate", value: "73.2%", change: "+2.1%" }
      ]
    },
    {
      id: "customers",
      title: "Customer Analytics",
      icon: Users,
      color: "bg-purple-500",
      metrics: [
        { label: "Total Customers", value: salesMetrics.customers.total.toLocaleString(), change: "+15.3%" },
        { label: "New Customers", value: salesMetrics.customers.new.toLocaleString(), change: "+22.8%" },
        { label: "Returning Customers", value: salesMetrics.customers.returning.toLocaleString(), change: "+12.1%" },
        { label: "Customer Satisfaction", value: `${salesMetrics.customers.satisfaction}/5`, change: "+0.3 points" }
      ]
    },
    {
      id: "products",
      title: "Product Performance",
      icon: Package,
      color: "bg-orange-500",
      metrics: [
        { label: "Items Sold", value: salesMetrics.products.sold.toLocaleString(), change: "+18.7%" },
        { label: "Top Category", value: salesMetrics.products.topSelling, change: "45% of sales" },
        { label: "Low Stock Items", value: salesMetrics.products.lowStock.toString(), change: "Needs attention" },
        { label: "Out of Stock", value: salesMetrics.products.outOfStock.toString(), change: "Immediate action" }
      ]
    },
    {
      id: "staff",
      title: "Staff Performance",
      icon: UserCheck,
      color: "bg-indigo-500",
      metrics: [
        { label: "Active Staff", value: salesMetrics.staff.active.toString(), change: "15 members" },
        { label: "Top Performer", value: salesMetrics.staff.topPerformer, change: "$23,450 sales" },
        { label: "Avg Sales/Staff", value: `$${salesMetrics.staff.avgSalesPerStaff.toLocaleString()}`, change: "+12.5%" },
        { label: "Total Hours", value: `${salesMetrics.staff.totalHours}h`, change: "This shift" }
      ]
    },
    {
      id: "payments",
      title: "Payment Methods",
      icon: CreditCard,
      color: "bg-pink-500",
      metrics: [
        { label: "Cash Payments", value: `${salesMetrics.payments.cash}%`, change: "Down 3.2%" },
        { label: "Card Payments", value: `${salesMetrics.payments.card}%`, change: "Up 2.1%" },
        { label: "Digital Payments", value: `${salesMetrics.payments.digital}%`, change: "Up 5.8%" },
        { label: "Fastest Method", value: salesMetrics.payments.fastestMethod, change: "Avg 15s" }
      ]
    },
    {
      id: "geography",
      title: "Geographic Sales",
      icon: MapPin,
      color: "bg-teal-500",
      metrics: [
        { label: "Top Location", value: "Downtown Store", change: "$45,230 sales" },
        { label: "Growth Leader", value: "Mall Branch", change: "+28.5% growth" },
        { label: "Underperforming", value: "Suburb Store", change: "-8.2% decline" },
        { label: "New Markets", value: "2 locations", change: "Opening soon" }
      ]
    },
    {
      id: "timing",
      title: "Time-based Analytics",
      icon: Clock,
      color: "bg-yellow-500",
      metrics: [
        { label: "Peak Day", value: "Saturday", change: "35% of weekly sales" },
        { label: "Peak Hour", value: "2:00-3:00 PM", change: "18% of daily sales" },
        { label: "Slowest Period", value: "Tuesday 10-11 AM", change: "2% of daily sales" },
        { label: "Weekend vs Weekday", value: "65% vs 35%", change: "Weekend dominance" }
      ]
    },
    {
      id: "promotions",
      title: "Promotions & Discounts",
      icon: Percent,
      color: "bg-red-500",
      metrics: [
        { label: "Active Promotions", value: "8 campaigns", change: "Running now" },
        { label: "Discount Impact", value: "$12,450", change: "Revenue from discounts" },
        { label: "Most Effective", value: "Buy 2 Get 1", change: "34% conversion" },
        { label: "Avg Discount", value: "15.7%", change: "Per transaction" }
      ]
    },
    {
      id: "loyalty",
      title: "Customer Loyalty",
      icon: Award,
      color: "bg-amber-500",
      metrics: [
        { label: "Loyalty Members", value: "2,847", change: "+156 this week" },
        { label: "Points Redeemed", value: "45,230", change: "Worth $2,261" },
        { label: "Member Purchases", value: "68.5%", change: "Of total sales" },
        { label: "Avg Spend/Member", value: "$287", change: "+12.3%" }
      ]
    }
  ]

  const renderMetricCard = (aspect: typeof salesAspects[0]) => {
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
                  variant={metric.change.includes('+') ? 'default' : metric.change.includes('-') ? 'destructive' : 'secondary'}
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            Comprehensive Sales Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Complete sales analytics and performance tracking</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">All Locations</SelectItem>
              <SelectItem value="downtown">Downtown Store</SelectItem>
              <SelectItem value="mall">Mall Branch</SelectItem>
              <SelectItem value="suburb">Suburb Store</SelectItem>
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

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesMetrics.revenue.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+{salesMetrics.revenue.change}% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesMetrics.transactions.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+{salesMetrics.transactions.change}% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesMetrics.customers.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Star className="h-3 w-3 mr-1 text-yellow-600" />
              <span>{salesMetrics.customers.satisfaction}/5 satisfaction</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesMetrics.staff.active}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ThumbsUp className="h-3 w-3 mr-1 text-blue-600" />
              <span>Active staff members</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Sales Aspects Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
          <TabsTrigger value="reports">Performance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sales Tracking Aspects</h2>
            <Badge variant="outline" className="text-sm">
              {salesAspects.length} tracking areas
            </Badge>
          </div>

          {/* Carousel for Sales Aspects */}
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {salesAspects.map((aspect) => (
                <CarouselItem key={aspect.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  {renderMetricCard(aspect)}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Product Sales</span>
                    <span className="font-medium">$198,450 (80.7%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Service Sales</span>
                    <span className="font-medium">$32,100 (13.1%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Shipping & Handling</span>
                    <span className="font-medium">$8,950 (3.6%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tax Collected</span>
                    <span className="font-medium">$6,251 (2.5%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Segments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">VIP Customers</span>
                    <Badge variant="default">156 (17.5%)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Regular Customers</span>
                    <Badge variant="secondary">580 (65.0%)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Customers</span>
                    <Badge variant="outline">156 (17.5%)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Top Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Wireless Headphones", sales: "$12,450", qty: "89 units" },
                    { name: "Smart Watch Series 5", sales: "$8,920", qty: "34 units" },
                    { name: "Bluetooth Speaker", sales: "$6,780", qty: "67 units" },
                    { name: "Phone Case Set", sales: "$4,560", qty: "152 units" },
                    { name: "Charging Cable", sales: "$3,210", qty: "201 units" }
                  ].map((product, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.qty}</p>
                      </div>
                      <span className="font-bold">{product.sales}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Staff Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Staff Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Sarah Johnson", sales: "$23,450", badge: "🥇" },
                    { name: "Mike Chen", sales: "$21,890", badge: "🥈" },
                    { name: "Emma Davis", sales: "$19,670", badge: "🥉" },
                    { name: "James Wilson", sales: "$18,240", badge: "🏆" },
                    { name: "Lisa Garcia", sales: "$17,890", badge: "⭐" }
                  ].map((staff, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{staff.badge}</span>
                        <span className="font-medium text-sm">{staff.name}</span>
                      </div>
                      <span className="font-bold">{staff.sales}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sales Target Achievement</span>
                    <Badge variant="default">98.3%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Retention Rate</span>
                    <Badge variant="default">82.5%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <Badge variant="secondary">2.3 min</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Return Rate</span>
                    <Badge variant="outline">3.2%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trends & Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5" />
                  Trends & Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Growth Trend</p>
                    <p className="text-xs text-green-600">12.5% increase in weekly sales</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Peak Performance</p>
                    <p className="text-xs text-blue-600">Weekends show 65% of total sales</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Opportunity</p>
                    <p className="text-xs text-yellow-600">Morning hours underperforming</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts & Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alerts & Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-2 bg-red-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-red-800">Low Stock Alert</p>
                      <p className="text-xs text-red-600">12 items need restocking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                    <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-yellow-800">Shift Change</p>
                      <p className="text-xs text-yellow-600">3 staff ending shifts soon</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                    <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-800">High Demand</p>
                      <p className="text-xs text-blue-600">Electronics category trending</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ComprehensiveSalesDashboard