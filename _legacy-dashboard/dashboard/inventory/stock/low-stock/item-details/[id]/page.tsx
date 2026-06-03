import getItemById from "@/actions/itemsShow/getItemById"
import { getAuthenticatedUser } from "@/config/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  Warehouse,
  DollarSign,
  TrendingUp,
  Calendar,
  Star,
  Settings,
  ShoppingCart,
  Plus
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ItemDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ItemDetailsPage({ params }: ItemDetailsPageProps) {
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
  const stockDeficit = Math.max(reorderPoint - currentStock, 0)
  const stockPercentage = reorderPoint > 0 ? (currentStock / reorderPoint) * 100 : 0

  const getStockStatus = () => {
    if (currentStock === 0) return { label: "Out of Stock", variant: "destructive" as const, color: "text-red-600" }
    if (stockPercentage <= 30) return { label: "Critical", variant: "destructive" as const, color: "text-red-600" }
    if (stockPercentage <= 60) return { label: "Low Stock", variant: "secondary" as const, color: "text-amber-600" }
    return { label: "In Stock", variant: "default" as const, color: "text-green-600" }
  }

  const stockStatus = getStockStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50/40 to-teal-50/60 dark:from-cyan-950 dark:via-teal-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {item.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Detailed inventory analysis and management options
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
            <Link href={`/dashboard/inventory/items/${item.id}/adjust-stock`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Adjust Stock
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Item Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Product Name</Label>
                  <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">SKU</Label>
                  <code className="block font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mt-1">
                    {item.sku}
                  </code>
                </div>

                {item.category && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</Label>
                    <Badge variant="outline" className="mt-1">{item.category.title}</Badge>
                  </div>
                )}

                {item.brand && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Brand</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-slate-900 dark:text-white">{item.brand.brandName}</span>
                    </div>
                  </div>
                )}

                {item.unit && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Unit of Measure</Label>
                    <div className="text-slate-900 dark:text-white mt-1">
                      {item.unit.name} ({item.unit.symbol})
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Status */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                    <Warehouse className="w-5 h-5 text-white" />
                  </div>
                  Stock Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</Label>
                  <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Current Stock</span>
                    <span className={`font-bold ${stockStatus.color}`}>
                      {currentStock.toLocaleString()}
                      {item.unit && <span className="text-xs ml-1">{item.unit.symbol}</span>}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(stockPercentage, 100)}
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs mt-1 text-slate-500">
                    <span>0</span>
                    <span>Reorder Point: {reorderPoint}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <Label className="text-xs text-slate-500">Minimum Level</Label>
                    <div className="font-semibold">{item.minStockLevel}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Reorder Point</Label>
                    <div className="font-semibold">{reorderPoint}</div>
                  </div>
                </div>

                {stockDeficit > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">
                        {stockDeficit} units needed to reach reorder point
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Cost Price</Label>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${(item.costPrice || 0).toFixed(2)}
                    </div>
                    <span className="text-xs text-slate-500">per unit</span>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Selling Price</Label>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ${(item.sellingPrice || 0).toFixed(2)}
                    </div>
                    <span className="text-xs text-slate-500">per unit</span>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Stock Value</Label>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      ${(currentStock * (item.costPrice || 0)).toFixed(2)}
                    </div>
                  </div>

                  {stockDeficit > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Restock Cost</Label>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        ${(stockDeficit * (item.costPrice || 0)).toFixed(2)}
                      </div>
                      <span className="text-xs text-slate-500">to reach reorder point</span>
                    </div>
                  )}
                </div>

                {item.costPrice && item.sellingPrice && item.costPrice > 0 && (
                  <div className="pt-3 border-t">
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Profit Margin</Label>
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Location & Activity Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Information */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                    <Warehouse className="w-5 h-5 text-white" />
                  </div>
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {item.inventoryLevels && item.inventoryLevels.length > 0 ? (
                  <div className="space-y-4">
                    {item.inventoryLevels.map((level, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {level.location?.name || `Location ${index + 1}`}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              Last updated: {level.lastTransactionAt
                                ? formatDistanceToNow(new Date(level.lastTransactionAt), { addSuffix: true })
                                : 'Never'
                              }
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                              {level.quantityOnHand}
                              {item.unit && <span className="text-xs ml-1">{item.unit.symbol}</span>}
                            </div>
                            <div className="text-xs text-slate-500">Available</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div>
                            <div className="text-xs text-slate-500">Reserved</div>
                            <div className="font-medium">{level.quantityReserved || 0}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">In Transit</div>
                            <div className="font-medium">{level.quantityInTransit || 0}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">On Order</div>
                            <div className="font-medium">{level.quantityOnOrder || 0}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Warehouse className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">No location data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Link href={`/dashboard/inventory/items/${item.id}/adjust-stock`}>
                    <Button className="w-full justify-start bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Adjust Stock Levels
                    </Button>
                  </Link>

                  <Link href={`/dashboard/inventory/stock/low-stock/create-purchase-order?items=${item.id}&urgency=${stockStatus.label.toLowerCase()}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Create Purchase Order
                    </Button>
                  </Link>

                  <Link href={`/dashboard/inventory/stock/low-stock/stock-history/${item.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Stock History
                    </Button>
                  </Link>

                  <Link href={`/dashboard/inventory/items/${item.id}/edit`}>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Item Details
                    </Button>
                  </Link>
                </div>

                {stockDeficit > 0 && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-amber-800 dark:text-amber-400 text-sm">
                          Immediate Action Required
                        </div>
                        <div className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                          This item is below the reorder point. Consider creating a purchase order or adjusting stock levels.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}