import { getItemById } from "@/actions/itemsShow/getItemById"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAuthenticatedUser } from "@/config/useAuth"
import {
  ArrowLeft,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  BarChart3,
  Activity,
  AlertCircle
} from "lucide-react"
import { redirect } from "next/navigation"

async function redirectToItems() {
  'use server'
  redirect('/dashboard/inventory/items')
}

interface ItemAnalyticsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ItemAnalyticsPage({ params }: ItemAnalyticsPageProps) {
  const { id } = await params
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Organization Required</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              No organization found for the current user.
            </p>
            <form action={redirectToItems}>
              <Button type="submit" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Items
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const itemResult = await getItemById(id)

  if (!itemResult.success || !itemResult.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Item Not Found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The item you're trying to view analytics for could not be found.
            </p>
            <form action={redirectToItems}>
              <Button type="submit" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Items
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const item = itemResult.data
  const currentStock = item.inventoryLevels?.[0]?.quantityOnHand || 0

  // Mock analytics data - in real implementation, fetch from analytics service
  const mockAnalytics = {
    totalSold: Math.floor(Math.random() * 500) + 50,
    revenue: Math.floor(Math.random() * 50000) + 5000,
    averageOrderValue: Math.floor(Math.random() * 100) + 20,
    customerCount: Math.floor(Math.random() * 200) + 10,
    profitMargin: ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100).toFixed(1),
    turnoverRate: (Math.random() * 10 + 1).toFixed(1),
    monthlyTrend: Math.random() > 0.5 ? 'up' : 'down',
    trendPercentage: (Math.random() * 30 + 5).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <form action={redirectToItems}>
            <Button type="submit" variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Items
            </Button>
          </form>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Item Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Detailed performance insights for {item.name}
            </p>
          </div>
          <Badge
            variant={mockAnalytics.monthlyTrend === 'up' ? 'default' : 'destructive'}
            className={`flex items-center gap-1 ${
              mockAnalytics.monthlyTrend === 'up'
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-red-100 text-red-700 border-red-200'
            }`}
          >
            {mockAnalytics.monthlyTrend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {mockAnalytics.trendPercentage}% this month
          </Badge>
        </div>

        {/* Item Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Item Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">SKU: {item.sku || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Current Stock</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentStock}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Selling Price</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${item.sellingPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Profit Margin</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mockAnalytics.profitMargin}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Sold</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {mockAnalytics.totalSold}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        ${mockAnalytics.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Customers</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {mockAnalytics.customerCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Turnover Rate</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {mockAnalytics.turnoverRate}x
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>Detailed sales performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Average Order Value</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${mockAnalytics.averageOrderValue}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Units per Order</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {(mockAnalytics.averageOrderValue / item.sellingPrice).toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Conversion Rate</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {(Math.random() * 15 + 5).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Analytics</CardTitle>
                <CardDescription>Stock levels and inventory management insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Stock Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Current Stock</span>
                        <span className="font-semibold">{currentStock} units</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Stock Value</span>
                        <span className="font-semibold">${(currentStock * item.costPrice).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Days of Stock</span>
                        <span className="font-semibold">{Math.floor(currentStock / (mockAnalytics.totalSold / 30))} days</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Reorder Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Reorder Point</span>
                        <span className="font-semibold">{item.inventoryLevels?.[0]?.reorderPoint || 10} units</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Lead Time</span>
                        <span className="font-semibold">7 days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Safety Stock</span>
                        <span className="font-semibold">5 units</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Strong Performance</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        This item has shown consistent sales growth over the past month with a {mockAnalytics.trendPercentage}% increase.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">High Turnover</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Inventory turnover rate of {mockAnalytics.turnoverRate}x indicates efficient stock management.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">Stock Alert</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Consider reordering soon as current stock will last approximately {Math.floor(currentStock / (mockAnalytics.totalSold / 30))} days at current sales rate.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Optimize pricing</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Current profit margin of {mockAnalytics.profitMargin}% is healthy. Consider A/B testing price increases.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Increase marketing</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          High performance indicates potential for scaled marketing campaigns.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Monitor competitors</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Keep track of competitor pricing and stock levels for this popular item.
                        </p>
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
