import { getOrgItemsWithInventoryLevels } from "@/actions/itemsShow/getOrgItemsWithInventoryLevels"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthenticatedUser } from "@/config/useAuth"
import StockManagement from "@/components/inventory/StockManagement"
import {
  AlertTriangle,
  Warehouse
} from "lucide-react"
import { Suspense } from "react"

type SearchParams = Record<string, string | string[] | undefined>

function toStringParam(input: unknown): string {
  return typeof input === "string" ? input : ""
}

function toNumberParam(input: unknown, fallback: number, { min, max }: { min?: number; max?: number } = {}): number {
  const n = typeof input === "string" ? Number.parseInt(input, 10) : Number.NaN
  let value = Number.isFinite(n) ? n : fallback
  if (typeof min === "number") value = Math.max(min, value)
  if (typeof max === "number") value = Math.min(max, value)
  return value
}


export default async function CurrentStockPage(props: {
  searchParams?: Promise<SearchParams> | SearchParams
}) {
  const resolvedSearchParams: SearchParams =
    props?.searchParams && typeof (props.searchParams as Promise<SearchParams>)?.then === "function"
      ? await (props.searchParams as Promise<SearchParams>)
      : ((props?.searchParams as SearchParams) ?? {})

  const q = toStringParam(resolvedSearchParams.q)

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

  const itemsRes = await getOrgItemsWithInventoryLevels(userOrg).catch(() => null)
  const initialItemData = (itemsRes as any)?.data ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Warehouse className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Current Stock
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Monitor inventory levels and stock status with advanced analytics
              </p>
            </div>
          </div>
        </div>

        {/* Stock Management Component with TanStack Table */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Warehouse className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading stock data...</p>
            </div>
          </div>
        }>
          <StockManagement data={initialItemData} organizationId={userOrg} />
        </Suspense>
      </div>
    </div>
  )
}
