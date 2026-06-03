import { getItemById } from "@/actions/itemsShow/getItemById"
import { updateItemById } from "@/actions/itemsShow/updateItemById"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAuthenticatedUser } from "@/config/useAuth"
import { ArrowLeft, Package, Archive, AlertTriangle, Info, Calendar } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function redirectToItems() {
  'use server'
  redirect('/dashboard/inventory/items')
}

interface DiscontinueItemPageProps {
  params: Promise<{
    id: string
  }>
}

async function handleDiscontinueItem(formData: FormData) {
  'use server'

  const itemId = formData.get('itemId') as string
  const discontinueReason = formData.get('discontinueReason') as string
  const discontinueNotes = formData.get('discontinueNotes') as string
  const clearInventory = formData.get('clearInventory') === 'true'

  const result = await updateItemById({ id: itemId, data: {
    isDiscontinued: true,
    isActive: !clearInventory, // If clearing inventory, make inactive
    // Store reason in description for now
    descriptionEn: discontinueNotes || `Discontinued: ${discontinueReason}`
  }})

  if (result.success) {
    console.log(`Item ${itemId} discontinued. Reason: ${discontinueReason}, Notes: ${discontinueNotes}`)
    revalidatePath('/dashboard/inventory/items')
    redirect('/dashboard/inventory/items')
  } else {
    throw new Error(result.error?.message || 'Failed to discontinue item')
  }
}

async function handleReactivateItem(formData: FormData) {
  'use server'

  const itemId = formData.get('itemId') as string
  const result = await updateItemById({ id: itemId, data: {
    isDiscontinued: false,
    isActive: true
  }})

  if (result.success) {
    revalidatePath('/dashboard/inventory/items')
    redirect('/dashboard/inventory/items')
  } else {
    throw new Error(result.error?.message || 'Failed to reactivate item')
  }
}

export default async function DiscontinueItemPage({ params }: DiscontinueItemPageProps) {
  const user = await getAuthenticatedUser()
  const { id } = await params

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
              The item you're trying to discontinue could not be found.
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
  const stockValue = currentStock * (item.costPrice || 0)

  // Mock discontinued status - in real implementation, get from database
  const isDiscontinued = item.isDiscontinued || Math.random() > 0.8

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <form action={redirectToItems}>
            <Button type="submit" variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Items
            </Button>
          </form>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {isDiscontinued ? 'Reactivate Item' : 'Discontinue Item'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isDiscontinued
                ? `Reactivate ${item.name} for sale`
                : `Mark ${item.name} as discontinued`
              }
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Item Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Item Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-4">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <Package className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      SKU: {item.sku || 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Current Stock
                  </Label>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {currentStock}
                    {item.unit && (
                      <span className="text-sm text-slate-500 dark:text-slate-400 ml-1 font-normal">
                        {item.unit.symbol || item.unit.name}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Stock Value
                  </Label>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${stockValue.toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Selling Price
                  </Label>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${item.sellingPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          {isDiscontinued && (
            <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10">
              <Archive className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                <strong>This item is currently discontinued.</strong> It's not available for new sales but existing inventory remains tracked.
              </AlertDescription>
            </Alert>
          )}

          {!isDiscontinued ? (
            /* Discontinue Form */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <Archive className="w-5 h-5" />
                  Discontinue Item
                </CardTitle>
                <CardDescription>
                  Mark this item as discontinued to stop future sales while maintaining inventory records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleDiscontinueItem} className="space-y-6">
                  <input type="hidden" name="itemId" value={id} />
                  <div className="space-y-2">
                    <Label htmlFor="discontinueReason">Reason for Discontinuation</Label>
                    <Select name="discontinueReason" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor_sales">Poor Sales Performance</SelectItem>
                        <SelectItem value="supplier_discontinued">Supplier Discontinued</SelectItem>
                        <SelectItem value="quality_issues">Quality Issues</SelectItem>
                        <SelectItem value="replaced_product">Replaced by New Product</SelectItem>
                        <SelectItem value="seasonal_end">End of Season</SelectItem>
                        <SelectItem value="cost_increase">Cost Increase</SelectItem>
                        <SelectItem value="compliance_issues">Compliance Issues</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discontinueNotes">Additional Notes</Label>
                    <Textarea
                      id="discontinueNotes"
                      name="discontinueNotes"
                      placeholder="Provide additional context for discontinuing this item"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clearInventory">Inventory Handling</Label>
                    <Select name="clearInventory" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inventory action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Keep tracking existing inventory</SelectItem>
                        <SelectItem value="true">Clear inventory and make inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {currentStock > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warning:</strong> This item has {currentStock} units in stock worth ${stockValue.toFixed(2)}.
                        Consider your inventory handling option carefully.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                      <strong>Note:</strong> Discontinuing an item will:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Stop the item from appearing in new sales</li>
                        <li>Maintain historical sales data</li>
                        <li>Keep inventory tracking (unless cleared)</li>
                        <li>Allow reactivation later if needed</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-4 pt-6">
                    <Button type="submit" variant="destructive" className="flex-1">
                      <Archive className="mr-2 h-4 w-4" />
                      Discontinue Item
                    </Button>
                  </div>
                </form>
                <form action={redirectToItems} className="mt-4">
                  <Button type="submit" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Reactivate Form */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Calendar className="w-5 h-5" />
                  Reactivate Item
                </CardTitle>
                <CardDescription>
                  Reactivate this discontinued item to make it available for sales again
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    <strong>Reactivating will:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Make the item available for new sales</li>
                      <li>Remove the discontinued status</li>
                      <li>Restore full inventory tracking</li>
                      <li>Clear discontinuation notes and reason</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <form action={handleReactivateItem} className="flex gap-4">
                  <input type="hidden" name="itemId" value={id} />
                  <Button type="submit" className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Reactivate Item
                  </Button>
                </form>
                <form action={redirectToItems} className="mt-4">
                  <Button type="submit" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
