import { getOrgCustomersClientSafe } from "@/actions/customers/clientSafeCustomerActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthenticatedUser } from "@/config/useAuth"
import EnhancedCustomersManagement from "@/components/inventory/EnhancedCustomersManagement"
import {
  AlertTriangle,
  Users,
  Settings
} from "lucide-react"
import { Suspense } from "react"

export default async function EnhancedCustomersPage() {
  const user = await getAuthenticatedUser()
  const userOrg = user?.organizationId

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Organization Required</h3>
            <p className="text-muted-foreground">No organization found for the current user.</p>
          </div>
        </div>
      </div>
    )
  }

  const customersRes = await getOrgCustomersClientSafe(userOrg).catch(() => null)
  const initialCustomerData = (customersRes as any)?.data ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Customer Portfolio
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage customer relationships and track engagement analytics
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Customers Management Component with TanStack Table */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading customer portfolio...</p>
            </div>
          </div>
        }>
          <EnhancedCustomersManagement data={initialCustomerData} organizationId={userOrg} />
        </Suspense>
      </div>
    </div>
  )
}
