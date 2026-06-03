import getOrgCustomers from "@/actions/customers/clientSafeCustomerActions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthenticatedUser } from "@/config/useAuth"
import EnhancedCustomersManagement from "@/components/settings/EnhancedCustomersManagement"
import {
  AlertTriangle,
  Users,
  UserCheck,
  Crown,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Target,
  Star
} from "lucide-react"
import { Suspense } from "react"

type SearchParams = Record<string, string | string[] | undefined>

export default async function EnhancedCustomersSettingsPage(props: {
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

  const customersRes = await getOrgCustomers(userOrg).catch(() => null)
  const initialCustomerData = (customersRes as any)?.data ?? []

  // Calculate statistics
  const totalCustomers = initialCustomerData.length
  const activeCustomers = initialCustomerData.filter((c: any) => c.status === 'Active').length
  const vipCustomers = initialCustomerData.filter((c: any) => c.isVip).length
  const totalRevenue = initialCustomerData.reduce((sum: number, c: any) => sum + (c.totalSpent || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Customer Management Center
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Comprehensive customer relationship management and analytics dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {totalCustomers.toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Registered customers
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Active Customers
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {activeCustomers.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}% active rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                VIP Customers
              </CardTitle>
              <Crown className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {vipCustomers.toLocaleString()}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Premium tier customers
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  notation: "compact",
                  maximumFractionDigits: 1
                }).format(totalRevenue)}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Customer lifetime value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Customers Management Component with TanStack Table */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-600 dark:text-slate-400">Loading customer management center...</p>
            </div>
          </div>
        }>
          <EnhancedCustomersManagement data={initialCustomerData} organizationId={userOrg} />
        </Suspense>
      </div>
    </div>
  )
}