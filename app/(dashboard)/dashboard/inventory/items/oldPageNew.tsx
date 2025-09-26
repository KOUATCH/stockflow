"use server"

import getOrgBrands from "@/actions/brands/getOrgBrands"
import getOrgCategories from "@/actions/categories/getOrgCategories"
import getOrgItemsWithInventoryLevels from "@/actions/itemsShow/getOrgItemsWithInventoryLevels"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableLoading } from "@/components/ui/data-table"
import ItemManagementOld from "@/components/ui/groups/inventory/ItemManagementOld"
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
  RefreshCw,
  Settings,
  ShoppingCart,
  Target,
  TrendingUp
} from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Enhanced Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg">
                <Package className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>Complete product catalog and stock control</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <Activity className="w-3 h-3 mr-1" />
                    Live Data
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2 border-green-200 bg-green-50">
                <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                System Online
              </Badge>

              <Button variant="ghost" size="sm" className="flex items-center gap-2 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                Sync
              </Button>

              <Button variant="ghost" size="sm" className="bg-transparent">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.firstName || "User"} {user?.lastName || ""}
              </h2>
              <p className="text-muted-foreground mt-2 flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Inventory Manager
                </Badge>
                <span>•</span>
                <span className="text-sm">{new Date().toLocaleDateString()}</span>
                <span>•</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {initialItemData.length} Total Items
                </Badge>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-card/80"
              >
                <FileText className="w-4 h-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-card/80"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </Button>
              <Button
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-bl-full"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">{initialItemData.length}</div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-600 font-medium">Active products</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-bl-full"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
                  <DollarSign className="w-4 h-4" />
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800">{formatCurrency(totalValue)}</div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-600">Inventory worth</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-bl-full"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Low Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-800">{lowStockItems.length}</div>
                <div className="flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-orange-600 font-medium">Items need attention</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-bl-full"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-800">{outOfStockItems.length}</div>
                <div className="flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600 font-medium">Items unavailable</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-bl-full"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800">{initialCategoryData.length}</div>
                <div className="flex items-center gap-1 mt-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <p className="text-sm text-purple-600 font-medium">Product groups</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
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
          </Card>

          {/* Main Items Management */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border shadow-xl">
            <Suspense fallback={
              <div className="p-8">
                <TableLoading title="Loading inventory data..." />
              </div>
            }>
              <ItemManagementOld
                title="Items"
                editingId=""
                organizationId={userOrg}
                initialItemData={initialItemData}
                initialCategoryData={initialCategoryData}
                initialBrandData={initialBrandData}
                initialUnitData={initialUnitData}
                initialTaxRateData={initialTaxRateData}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}