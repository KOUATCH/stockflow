import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrgSuppliersClientSafe } from "@/actions/suppliers/clientSafeSuppliersActions"
import EnhancedSuppliersManagement from "@/components/inventory/EnhancedSuppliersManagement"
import {
  AlertTriangle,
  Building2,
  Settings
} from "lucide-react"
import { Suspense } from "react"

type SearchParams = Record<string, string | string[] | undefined>

export default async function PurchasesSuppliersPage(props: {
  searchParams?: Promise<SearchParams> | SearchParams
}) {
  const resolvedSearchParams: SearchParams =
    props?.searchParams && typeof (props.searchParams as Promise<SearchParams>)?.then === "function"
      ? await (props.searchParams as Promise<SearchParams>)
      : ((props?.searchParams as SearchParams) ?? {})

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

  const initialSuppliers = await getOrgSuppliersClientSafe(userOrg).catch(() => ({ data: [] }));
  const { data: suppliersData } = initialSuppliers;
  const initialSupplierData = suppliersData ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Supplier Network
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage supplier relationships and procurement analytics
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Suppliers Management Component with TanStack Table */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading supplier network...</p>
            </div>
          </div>
        }>
          <EnhancedSuppliersManagement data={initialSupplierData} organizationId={userOrg} />
        </Suspense>
      </div>
    </div>
  )
}