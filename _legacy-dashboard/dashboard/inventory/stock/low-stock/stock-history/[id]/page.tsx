import getItemById from "@/actions/itemsShow/getItemById"
import { getAuthenticatedUser } from "@/config/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import StockHistoryChart from "@/components/inventory/StockHistoryChart"
import StockMovementTable from "@/components/inventory/StockMovementTable"
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Activity,
  Target
} from "lucide-react"
import Link from "next/link"

interface StockHistoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function StockHistoryPage({ params }: StockHistoryPageProps) {
  const user = await getAuthenticatedUser()
  const { id } = await params

  if (!user?.organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50/40 to-teal-50/60 dark:from-cyan-950 dark:via-teal-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Organization Required</h3>
            <p className="text-slate-600 dark:text-slate-400">No organization found for the current user.</p>
          </div>
        </div>
      </div>
    )
  }

  const itemResult = await getItemById(id)

  if (!itemResult.success || !itemResult.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50/40 to-teal-50/60 dark:from-cyan-950 dark:via-teal-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Item Not Found</h3>
            <p className="text-slate-600 dark:text-slate-400">The item could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  const item = itemResult.data
  const currentStock = item.inventoryLevels?.[0]?.quantityOnHand || 0
  const reorderPoint = item.inventoryLevels?.[0]?.reorderPoint || item.minStockLevel || 0

  // Mock historical data - In a real app, this would come from a database query
  const mockHistoricalData = [
    { date: '2024-01-01', stock: 150, transactions: 5 },
    { date: '2024-01-05', stock: 120, transactions: 8 },
    { date: '2024-01-10', stock: 95, transactions: 3 },
    { date: '2024-01-15', stock: 200, transactions: 1 }, // Restocked
    { date: '2024-01-20', stock: 175, transactions: 6 },
    { date: '2024-01-25', stock: 140, transactions: 7 },
    { date: '2024-02-01', stock: 110, transactions: 4 },
    { date: '2024-02-05', stock: 85, transactions: 9 },
    { date: '2024-02-10', stock: 60, transactions: 5 },
    { date: '2024-02-15', stock: 35, transactions: 8 },
    { date: '2024-02-20', stock: currentStock, transactions: 2 }
  ]

  const mockMovements = [
    {
      id: '1',
      date: '2024-02-20',
      type: 'OUTBOUND',
      quantity: -5,
      reason: 'Sales Order #SO-2024-001',
      user: 'John Doe',
      stockAfter: currentStock + 5
    },
    {
      id: '2',
      date: '2024-02-19',
      type: 'OUTBOUND',
      quantity: -8,
      reason: 'Sales Order #SO-2024-002',
      user: 'Jane Smith',
      stockAfter: currentStock + 13
    },
    {
      id: '3',
      date: '2024-02-18',
      type: 'ADJUSTMENT_OUT',
      quantity: -2,
      reason: 'Damaged goods',
      user: 'Mike Johnson',
      stockAfter: currentStock + 15
    },
    {
      id: '4',
      date: '2024-02-15',
      type: 'OUTBOUND',
      quantity: -25,
      reason: 'Bulk Sales Order #SO-2024-003',
      user: 'Sarah Wilson',
      stockAfter: currentStock + 40
    },
    {
      id: '5',
      date: '2024-02-10',
      type: 'INBOUND',
      quantity: 100,
      reason: 'Purchase Order #PO-2024-001',
      user: 'System',
      stockAfter: currentStock + 100
    }
  ]

  // Calculate analytics
  const totalMovements = mockMovements.length
  const totalInbound = mockMovements.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0)
  const totalOutbound = Math.abs(mockMovements.filter(m => m.quantity < 0).reduce((sum, m) => sum + m.quantity, 0))
  const averageDaily = totalOutbound / 30 // Assuming 30-day period

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50/40 to-teal-50/60 dark:from-cyan-950 dark:via-teal-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Stock History Analytics
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Historical trends and movement analysis for {item.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/inventory/stock/low-stock">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Low Stock
              </Button>
            </Link>
            <Link href={`/dashboard/inventory/stock/low-stock/item-details/${item.id}`}>
              <Button variant="outline" size="sm">
                <Package className="mr-2 h-4 w-4" />
                Item Details
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Total Movements
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {totalMovements}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Last 30 days
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Total Inbound
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {totalInbound}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Units received
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Total Outbound
                    </div>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {totalOutbound}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Units consumed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Daily Average
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {averageDaily.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Units per day
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Status Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                  <Package className="w-5 h-5 text-white" />
                </div>
                Current Status: {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Current Stock</span>
                    <Badge variant={currentStock <= reorderPoint ? "destructive" : "default"}>
                      {currentStock}
                      {item.unit && <span className="ml-1">{item.unit.symbol}</span>}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Reorder Point</span>
                    <span className="font-medium">{reorderPoint}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Min Stock Level</span>
                    <span className="font-medium">{item.minStockLevel}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">SKU</span>
                    <code className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {item.sku}
                    </code>
                  </div>
                  {item.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Category</span>
                      <Badge variant="outline">{item.category.title}</Badge>
                    </div>
                  )}
                  {item.brand && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Brand</span>
                      <span className="font-medium">{item.brand.brandName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {currentStock <= reorderPoint && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">
                          Below reorder point
                        </span>
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-500 mt-1">
                        Consider restocking soon
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-500">
                    Estimated {Math.ceil(currentStock / (averageDaily || 1))} days remaining at current consumption rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock History Chart */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                Stock Level Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockHistoryChart
                data={mockHistoricalData}
                reorderPoint={reorderPoint}
                minStockLevel={item.minStockLevel}
                itemName={item.name}
              />
            </CardContent>
          </Card>

          {/* Recent Stock Movements */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                Recent Stock Movements
                <Badge variant="secondary">{mockMovements.length} transactions</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockMovementTable movements={mockMovements} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}