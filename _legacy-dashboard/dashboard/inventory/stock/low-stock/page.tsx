import getLowStockItems from "@/actions/analytics/getLowStockItems"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthenticatedUser } from "@/config/useAuth"
import EnhancedLowStockManagement from "@/components/inventory/EnhancedLowStockManagement"
import {
  AlertTriangle,
  TrendingDown
} from "lucide-react"
import { Suspense } from "react"

export default async function LowStockPage() {
  const user = await getAuthenticatedUser()
  const userOrg = user?.organizationId

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

  // Fetch low stock items
  const lowStockResponse = await getLowStockItems(userOrg).catch((error) => {
    console.error('Error fetching low stock items:', error)
    return { data: [], success: false, error: error?.message || 'Failed to fetch low stock items' }
  })

  const lowStockItems = lowStockResponse?.data ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50/40 to-teal-50/60 dark:from-cyan-950 dark:via-teal-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Low Stock Analysis
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Advanced monitoring and analytics for inventory below reorder points
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Low Stock Management Component */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <TrendingDown className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading advanced low stock analysis...</p>
            </div>
          </div>
        }>
          <EnhancedLowStockManagement data={lowStockItems} organizationId={userOrg} />
        </Suspense>
      </div>
    </div>
  )
}