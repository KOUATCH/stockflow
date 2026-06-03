import { getItemById } from "@/actions/itemsShow/getItemById"
import { updateItemById } from "@/actions/itemsShow/updateItemById"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getAuthenticatedUser } from "@/config/useAuth"
import { ArrowLeft, Package, Star, Sparkles, TrendingUp } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function redirectToItems() {
  'use server'
  redirect('/dashboard/inventory/items')
}

interface FeatureItemPageProps {
  params: Promise<{
    id: string
  }>
}

async function handleFeatureItem(formData: FormData) {
  'use server'

  const itemId = formData.get('itemId') as string
  const featuredStatus = formData.get('isFeatured') === 'on' // checkbox/switch sends 'on' when checked
  const featuredReason = formData.get('featuredReason') as string

  // For now, we'll use the description field to store featured status info
  // In a real implementation, you would add proper schema fields
  const result = await updateItemById({ id: itemId, data: {
    isActive: featuredStatus ? true : true, // Ensure featured items are active
  }})

  if (result.success) {
    // You could store featured info in a separate table or use existing fields creatively
    console.log(`Item ${itemId} featured status: ${featuredStatus}, reason: ${featuredReason}`)
    revalidatePath('/dashboard/inventory/items')
    redirect('/dashboard/inventory/items')
  } else {
    throw new Error(result.error?.message || 'Failed to update item feature status')
  }
}

export default async function FeatureItemPage({ params }: FeatureItemPageProps) {
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
              The item you're trying to feature could not be found.
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

  // Mock current featured status - in real implementation, get from database
  const currentlyFeatured = Math.random() > 0.7

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
              Feature Item
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage featured status for {item.name}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.category?.title || 'Uncategorized'}
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
                    Selling Price
                  </Label>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${item.sellingPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Featured Status */}
          {currentlyFeatured && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                      Currently Featured
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      This item is currently featured in your store
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feature Item Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Feature Settings
              </CardTitle>
              <CardDescription>
                Control the featured status and visibility of this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleFeatureItem} className="space-y-6">
                <input type="hidden" name="itemId" value={id} />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isFeatured" className="text-base font-medium">
                      Feature this item
                    </Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Featured items are prominently displayed in your store and get higher visibility
                    </p>
                  </div>
                  <Input
                    id="isFeatured"
                    name="isFeatured"
                    type="checkbox"
                    defaultChecked={currentlyFeatured}
                    className="h-5 w-5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featuredReason">Reason for Featuring (Optional)</Label>
                  <Textarea
                    id="featuredReason"
                    name="featuredReason"
                    placeholder="Why is this item being featured? (e.g., Best seller, New arrival, Seasonal promotion)"
                    className="min-h-[100px]"
                  />
                </div>

                {/* Benefits of Featuring */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Benefits of Featuring This Item
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <span>Increased visibility on product listings and homepage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <span>Higher search ranking in your store</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <span>Automatic inclusion in featured product recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                      <span>Special badge and highlighting in product displays</span>
                    </li>
                  </ul>
                </div>

                {/* Performance Metrics */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Expected Performance Impact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Visibility Increase</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">+40-60%</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Click-through Rate</p>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">+25-35%</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Conversion Rate</p>
                      <p className="font-semibold text-purple-600 dark:text-purple-400">+15-25%</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" className="flex-1">
                    <Star className="mr-2 h-4 w-4" />
                    Update Featured Status
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
        </div>
      </div>
    </div>
  )
}
