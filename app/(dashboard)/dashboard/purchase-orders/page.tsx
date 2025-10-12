
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableLoading } from "@/components/ui/data-table"
import PurchaseOrderManagement from "@/components/ui/groups/purchase-orders/PurchaseOrderManagement"
import { getAuthenticatedUser } from "@/config/useAuth"
import { db } from "@/prisma/db"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  DollarSign,
  FileText,
  Package,
  Plus,
  ShoppingCart,
  Target,
  TrendingUp,
  Truck
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

export default async function PurchaseOrdersPage(props: {
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

  let user;
  let userOrg;

  try {
    user = await getAuthenticatedUser()
    userOrg = user?.organizationId
  } catch (error) {
    console.error('Auth error:', error)
    // Return a simple error page instead of crashing
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Authentication Error</h3>
            <p className="text-muted-foreground">Unable to verify user authentication. Please try refreshing the page or logging in again.</p>
          </div>
        </div>
      </div>
    )
  }

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

  // Fetch purchase orders data
  const [purchaseOrdersResult, suppliersResult, locationsResult] = await Promise.all([
    db.purchaseOrder.findMany({
      where: { organizationId: userOrg },
      include: {
        supplier: {
          select: { id: true, name: true, email: true, phone: true }
        },
        location: {
          select: { id: true, name: true, address: true }
        },
        createdBy: {
          select: { id: true, name: true }
        },
        lines: {
          include: {
            item: {
              select: { id: true, name: true, sku: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []),
    db.supplier.findMany({
      where: { organizationId: userOrg, isActive: true },
      select: { id: true, name: true, email: true, phone: true }
    }).catch(() => []),
    db.location.findMany({
      where: { organizationId: userOrg },
      select: { id: true, name: true, address: true }
    }).catch(() => [])
  ])

  const initialPurchaseOrderData = Array.isArray(purchaseOrdersResult) ? purchaseOrdersResult : []
  const initialSupplierData = Array.isArray(suppliersResult) ? suppliersResult : []
  const initialLocationData = Array.isArray(locationsResult) ? locationsResult : []

  // Calculate statistics
  const totalValue = initialPurchaseOrderData.reduce((total: number, po: any) => {
    return total + (Number(po?.total) || 0)
  }, 0)

  const draftOrders = initialPurchaseOrderData.filter((po: any) => po.status === 'DRAFT')
  const approvedOrders = initialPurchaseOrderData.filter((po: any) => po.status === 'APPROVED')
  const receivedOrders = initialPurchaseOrderData.filter((po: any) => po.status === 'RECEIVED')
  const submittedOrders = initialPurchaseOrderData.filter((po: any) => po.status === 'SUBMITTED')

  // Calculate overdue orders (past expected delivery date)
  const now = new Date()
  const overdueOrders = initialPurchaseOrderData.filter((po: any) =>
    po.expectedDeliveryDate && new Date(po.expectedDeliveryDate) < now &&
    !['RECEIVED', 'COMPLETED', 'CANCELLED'].includes(po.status)
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 space-y-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Enhanced Page Header with POSTerminal styling */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 rounded-2xl shadow-xl border border-emerald-200/60 dark:border-slate-600/60 backdrop-blur-sm mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                Purchase Orders
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Manage procurement and supplier orders with modern efficiency
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  {initialPurchaseOrderData.length} Total Orders
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 font-medium bg-white/80 backdrop-blur-sm">
                  Value: {formatCurrency(totalValue)}
                </Badge>
                {overdueOrders.length > 0 && (
                  <Badge variant="destructive" className="px-3 py-1 font-medium">
                    {overdueOrders.length} Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            <Link href="/dashboard/purchase-orders/new">
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all h-12 text-base font-semibold px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create PO
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Summary Card like POSTerminal */}
        <Card className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 border-0 shadow-xl text-white overflow-hidden relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-500/20 backdrop-blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{initialPurchaseOrderData.length}</div>
                <div className="text-teal-100 font-medium">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{formatCurrency(totalValue)}</div>
                <div className="text-teal-100 font-medium">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{approvedOrders.length}</div>
                <div className="text-teal-100 font-medium">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{overdueOrders.length}</div>
                <div className="text-teal-100 font-medium">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Overview with POSTerminal styling */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/20 dark:to-teal-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{initialPurchaseOrderData.length}</div>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">All purchase orders</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
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
                <p className="text-xs text-slate-600 dark:text-slate-400">Order value</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Draft Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{draftOrders.length}</div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Pending submission</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 dark:from-red-400/20 dark:to-rose-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Overdue Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{overdueOrders.length}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Need attention</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-400/20 dark:to-violet-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{initialSupplierData.length}</div>
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-purple-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Active suppliers</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Received Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{receivedOrders.length}</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Completed orders</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Purchase Orders Management with POSTerminal styling */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 px-6 py-5 border-b border-emerald-200/60 dark:border-slate-700/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Purchase Order Management</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {initialPurchaseOrderData.length} orders • {overdueOrders.length} overdue • {formatCurrency(totalValue)} total value
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-white/80 backdrop-blur-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 shadow-sm"
              >
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>

          <Suspense fallback={
            <div className="p-8">
              <TableLoading title="Loading purchase orders..." />
            </div>
          }>
            <div className="p-6">
              <PurchaseOrderManagement
                title="Purchase Orders"
                organizationId={userOrg}
                initialPurchaseOrderData={initialPurchaseOrderData}
                initialSupplierData={initialSupplierData}
                initialLocationData={initialLocationData}
              />
            </div>
          </Suspense>
        </Card>
      </div>
    </div>
  )
}