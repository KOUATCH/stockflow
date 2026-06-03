
import { getItemById } from "@/actions/itemsShow/getItemById"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthenticatedUser } from "@/config/useAuth"
import { ArrowLeft, Package, Users, ExternalLink } from "lucide-react"
import { redirect } from "next/navigation"

async function redirectToItems() {
  'use server'
  redirect('/dashboard/inventory/items')
}

interface OthersPageProps {
  params: Promise<{
    id: string
  }>
}

const page = async ({ params }: OthersPageProps) => {
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
              The item you're looking for could not be found.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
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
              Additional Information
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Suppliers and other details for {item.name}
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Item Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Item Details
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
                  <p className="text-sm text-slate-600 dark:text-slate-400">Brand</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {item.brand?.name || 'No Brand'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Unit</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {item.unit?.name || 'No Unit'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suppliers Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Suppliers
              </CardTitle>
              <CardDescription>
                Suppliers and vendors for this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No Suppliers Configured
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  No suppliers have been associated with this item yet.
                </p>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>
                Other information and metadata for this item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Description</p>
                  <p className="text-slate-900 dark:text-white">
                    {item.description || 'No description provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Cost Price</p>
                  <p className="text-slate-900 dark:text-white">
                    ${item.costPrice?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Selling Price</p>
                  <p className="text-slate-900 dark:text-white">
                    ${item.sellingPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default page
