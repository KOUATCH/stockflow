import { getAuthenticatedUser } from "@/config/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CreatePurchaseOrderForm from "@/components/inventory/CreatePurchaseOrderForm"
import {
  ArrowLeft,
  ShoppingCart,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type SearchParams = {
  items?: string;
  urgency?: string;
}

interface CreatePurchaseOrderPageProps {
  searchParams: Promise<SearchParams>
}

export default async function CreatePurchaseOrderPage({
  searchParams
}: CreatePurchaseOrderPageProps) {
  const user = await getAuthenticatedUser()
  const userOrg = user?.organizationId
  const params = await searchParams

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50/40 to-teal-50/60 dark:from-cyan-950 dark:via-teal-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Organization Required</h3>
            <p className="text-slate-600 dark:text-slate-400">No organization found for the current user.</p>
          </div>
        </div>
      </div>
    )
  }

  // Parse item IDs from search params
  const selectedItemIds = params.items ? params.items.split(',') : []
  const urgencyLevel = params.urgency || 'normal'

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50/40 to-teal-50/60 dark:from-cyan-950 dark:via-teal-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Create Purchase Order
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Generate purchase order for low stock items with intelligent supplier matching
              </p>
            </div>
          </div>
          <Link href="/dashboard/inventory/stock/low-stock">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Low Stock Analysis
            </Button>
          </Link>
        </div>

        {/* Purchase Order Form */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Purchase Order Details
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedItemIds.length > 0
                    ? `Creating order for ${selectedItemIds.length} selected item(s)`
                    : "Create a new purchase order for low stock items"
                  }
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CreatePurchaseOrderForm
              organizationId={userOrg}
              preSelectedItems={selectedItemIds}
              urgencyLevel={urgencyLevel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}