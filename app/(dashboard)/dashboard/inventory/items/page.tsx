"use server"

import getOrgBrands from "@/actions/brands/getOrgBrands"
import getOrgCategories from "@/actions/categories/getOrgCategories"
import getOrgItemsWithInventoryLevels from "@/actions/itemsShow/getOrgItemsWithInventoryLevels"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableLoading } from "@/components/ui/data-table"
import ItemManagement from "@/components/ui/groups/inventory/ItemManagement"
import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrgTaxRates } from "@/services/taxRateAPI"
import { getOrgUnits } from "@/services/unitAPI"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  DollarSign,
  FileText,
  Package,
  Plus,
  ShoppingCart,
  Target,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

// Helpers to parse/clamp search params safely
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

type SearchParams = Record<string, string | string[] | undefined>

export default async function ItemsPage(props: {
  searchParams?: Promise<SearchParams> | SearchParams
}) {
  // Resolve search params whether they are a Promise or a plain object
  const resolvedSearchParams: SearchParams =
    props?.searchParams && typeof (props.searchParams as Promise<SearchParams>)?.then === "function"
      ? await (props.searchParams as Promise<SearchParams>)
      : ((props?.searchParams as SearchParams) ?? {})

  const q = toStringParam(resolvedSearchParams.q)
  const page = toNumberParam(resolvedSearchParams.page, 1, { min: 1 })
  const pageSize = toNumberParam(resolvedSearchParams.pageSize, 20, { min: 1, max: 200 })

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

  // Fetch data in parallel for a faster TTFB
  const [itemsRes, brandsRes, unitsRes, taxRatesRes, catsRes] = await Promise.all([
    getOrgItemsWithInventoryLevels(userOrg).catch(() => null),
    getOrgBrands(userOrg).catch(() => null),
    getOrgUnits(userOrg).catch(() => null),
    getOrgTaxRates(userOrg).catch(() => null),
    getOrgCategories(userOrg).catch(() => null),
  ])

  const initialItemData = (itemsRes as any)?.data ?? []
  const initialCategoryData = (catsRes as any)?.data ?? []
  const initialBrandData = (brandsRes as any)?.data ?? []
  const initialUnitData = (unitsRes as any)?.data ?? []
  const initialTaxRateData = (taxRatesRes as any)?.data ?? []

  // Calculate statistics
  const totalValue = initialItemData.reduce((total: number, item: any) => {
    const value = (Number(item?.sellingPrice) || 0) * (Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0)
    return total + (isNaN(value) ? 0 : value)
  }, 0)
  // Calculate statistics
  const totalProfit = initialItemData.reduce((total: number, item: any) => {
    const profit = (Number(item?.sellingPrice) || 0) * (Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0) - (Number(item?.costPrice) || 0) * (Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0)
    return total + (isNaN(profit) ? 0 : profit)
  }, 0)

  const lowStockItems = initialItemData.filter((item: any) =>
    (Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0) < 10
  )
  const outOfStockItems = initialItemData.filter((item: any) =>
    (Number(item?.inventoryLevels?.[0]?.quantityOnHand) || 0) === 0
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Inventory Items
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Manage your product catalog and stock levels
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Link href="/dashboard/inventory/items/create">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Item</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-400/20 dark:to-purple-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
              <Package className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{initialItemData.length}</div>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Active products</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(totalValue)}</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Inventory worth</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{lowStockItems.length}</div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Need attention</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-400/20 dark:to-rose-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
              <ShoppingCart className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{outOfStockItems.length}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Unavailable</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-400/20 dark:to-violet-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{initialCategoryData.length}</div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-purple-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Product groups</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Profit Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(totalProfit)}</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Total potential</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions
          <Card className="bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-white/80">
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">Add Item</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-white/80">
                  <Package className="w-6 h-6" />
                  <span className="text-sm">Stock Check</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-white/80">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Export Data</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-white/80">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card> */}

        {/* Main Items Management */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Inventory Management</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {initialItemData.length} products • {lowStockItems.length} low stock • {formatCurrency(totalValue)} total value
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-700"
              >
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>

          <Suspense fallback={
            <div className="p-8">
              <TableLoading title="Loading inventory data..." />
            </div>
          }>
            <div className="p-6">
              <ItemManagement
                title="Items"
                editingId=""
                organizationId={userOrg}
                initialItemData={initialItemData}
                initialCategoryData={initialCategoryData}
                initialBrandData={initialBrandData}
                initialUnitData={initialUnitData}
                initialTaxRateData={initialTaxRateData}
              />
            </div>
          </Suspense>
        </Card>
      </div>
    </div>
  )
}