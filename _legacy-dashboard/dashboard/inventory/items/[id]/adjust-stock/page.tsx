import { getItemById } from "@/actions/itemsShow/getItemById"
import { updateItemStockById } from "@/actions/itemsShow/updateItemStockById"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getAuthenticatedUser } from "@/config/useAuth"
import { ArrowLeft, Package, Plus, Minus, RotateCcw, AlertTriangle, TrendingUp, Star, Settings } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import Link from "next/link"


interface AdjustStockPageProps {
  params: Promise<{
    id: string
  }>
}

async function handleStockAdjustment(formData: FormData) {
  'use server'

  const itemId = formData.get('itemId') as string
  const adjustmentType = formData.get('adjustmentType') as string
  const quantity = parseInt(formData.get('quantity') as string) || 0
  const reason = formData.get('reason') as string
  const notes = formData.get('notes') as string

  let finalQuantity = quantity

  if (adjustmentType === 'decrease') {
    finalQuantity = -quantity
  } else if (adjustmentType === 'set') {
    // For set type, we need to calculate the difference from current stock
    // This will be handled in the updateItemStockById function
    finalQuantity = quantity // Pass the target quantity
  }

  const result = await updateItemStockById({ id: itemId, data: {
    quantityChange: finalQuantity,
    reason,
    notes,
    adjustmentType // Pass the type so the function knows how to handle it
  }})

  if (result.success) {
    revalidatePath('/dashboard/inventory/items')
    redirect('/dashboard/inventory/items')
  } else {
    throw new Error(result.error?.message || 'Failed to adjust stock')
  }
}

export default async function AdjustStockPage({ params }: AdjustStockPageProps) {
  const user = await getAuthenticatedUser()
  const { id } = await params

  if (!user?.organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Organization Required</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              No organization found for the current user.
            </p>
            <Link href="/dashboard/inventory/items">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Items
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const itemResult = await getItemById(id)

  if (!itemResult.success || !itemResult.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Item Not Found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The item you're trying to adjust could not be found.
            </p>
            <Link href="/dashboard/inventory/items">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Items
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const item = itemResult.data
  const currentStock = item.inventoryLevels?.[0]?.quantityOnHand || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Stock Adjustment
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Adjust inventory levels for {item.name}
              </p>
            </div>
          </div>
          <Link href="/dashboard/inventory/items">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Items
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Current Stock Info */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Current Stock Information
                  </span>
                </CardTitle>
                <Badge variant={currentStock > 0 ? currentStock <= 10 ? "destructive" : "default" : "secondary"} className="px-3 py-1">
                  {currentStock > 0 ? currentStock <= 10 ? "Low Stock" : "In Stock" : "Out of Stock"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Product Name
                    </Label>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{item.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    SKU: {item.sku || 'Auto-generated'}
                  </p>
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {item.category.title}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Current Stock
                    </Label>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {currentStock.toLocaleString()}
                    {item.unit && (
                      <span className="text-sm text-slate-500 dark:text-slate-400 ml-2 font-normal">
                        {item.unit.symbol || item.unit.name}
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    currentStock > 0 ? currentStock <= 10 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400" : "text-slate-500"
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {currentStock > 0 ? currentStock <= 10 ? "Low inventory" : "Available" : "Needs restock"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-500" />
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Cost Value
                    </Label>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${(currentStock * (item.costPrice || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    @ ${(item.costPrice || 0).toFixed(2)} per unit
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Retail Value
                    </Label>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${(currentStock * (item.sellingPrice || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    @ ${(item.sellingPrice || 0).toFixed(2)} per unit
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Adjustment Form */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Stock Adjustment
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Make precise adjustments to inventory levels with detailed tracking
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form action={handleStockAdjustment} className="space-y-8">
                <input type="hidden" name="itemId" value={id} />

                {/* Adjustment Type and Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="adjustmentType" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Adjustment Type
                    </Label>
                    <Select name="adjustmentType" required>
                      <SelectTrigger className="h-12 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <SelectValue placeholder="Select how you want to adjust stock" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase">
                          <div className="flex items-center gap-3 py-1">
                            <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                              <Plus className="w-3 h-3 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">Increase Stock</div>
                              <div className="text-xs text-slate-500">Add items to inventory</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="decrease">
                          <div className="flex items-center gap-3 py-1">
                            <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
                              <Minus className="w-3 h-3 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">Decrease Stock</div>
                              <div className="text-xs text-slate-500">Remove items from inventory</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="set">
                          <div className="flex items-center gap-3 py-1">
                            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <RotateCcw className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">Set Stock Level</div>
                              <div className="text-xs text-slate-500">Set exact inventory count</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Quantity
                      {item.unit && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-normal">
                          (in {item.unit.symbol || item.unit.name})
                        </span>
                      )}
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="Enter quantity"
                      className="h-12 text-center text-lg font-semibold border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Current stock: <span className="font-medium">{currentStock.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* Reason Selection */}
                <div className="space-y-3">
                  <Label htmlFor="reason" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Reason for Adjustment
                  </Label>
                  <Select name="reason" required>
                    <SelectTrigger className="h-12 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                      <SelectValue placeholder="Why are you adjusting the stock?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="damaged">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span>Damaged Goods</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="expired">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span>Expired Items</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="lost">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span>Lost/Stolen</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="found">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-green-500" />
                          <span>Found Stock</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="recount">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-blue-500" />
                          <span>Physical Count Adjustment</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="returned">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-purple-500" />
                          <span>Customer Returns</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="supplier_return">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-indigo-500" />
                          <span>Supplier Returns</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="other">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>Other</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Additional Notes
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1 font-normal">(Optional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any additional details about this stock adjustment..."
                    className="min-h-[120px] border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors resize-none"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    These notes will be recorded in the inventory audit trail
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Apply Stock Adjustment
                  </Button>
                  <Link href="/dashboard/inventory/items" className="sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto h-12 border-2 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
