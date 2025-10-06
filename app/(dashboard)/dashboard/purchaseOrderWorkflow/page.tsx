"use client"

import { PurchaseOrderWorkflowPanelModern } from "@/components/purchaseOrderWorkflow/PurchaseOrderWorkflowPanelModern"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInventoryStats } from "@/hooks/inventoryHooks/useInventoryDataHooks"
import { useInventoryLevels, useInventoryTransactions } from "@/hooks/inventoryHooks/useInventoryHooks"
import { useWorkflowData } from "@/hooks/purchaseOrderWorkflowHooks/useWorkflowData"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { useClientAuth } from "@/hooks/useClientAuth"
import type { PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"
import { formatDate } from "date-fns"
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle,
  Clipboard,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  Package,
  PiggyBank,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const STATUS_COLORS = {
  DRAFT: "bg-gray-500",
  SUBMITTED: "bg-blue-500",
  APPROVED: "bg-green-500",
  PARTIALLY_RECEIVED: "bg-yellow-500",
  RECEIVED: "bg-green-600",
  COMPLETED: "bg-green-700",
  CANCELLED: "bg-red-500",
} as const

interface PurchaseOrderCardProps {
  po: PurchaseOrderWithRelations
  isSelected: boolean
  onSelect: () => void
}

function PurchaseOrderCard({ po, isSelected, onSelect }: PurchaseOrderCardProps) {
  // Safety checks for data integrity
  if (!po || !po.id || !po.orderNumber) {
    console.error("Invalid purchase order data:", po)
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="text-red-600 text-sm">Invalid purchase order data</div>
        </CardContent>
      </Card>
    )
  }

  const statusColor = STATUS_COLORS[po.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.DRAFT

  return (
    <Card
      className={`hover:shadow-md transition-all cursor-pointer border-emerald-200/50 hover:border-emerald-300/70 ${isSelected ? "ring-2 ring-emerald-500" : ""
        }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-emerald-800">{po.orderNumber || "N/A"}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1 bg-white border border-emerald-200">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="text-emerald-700">{po.status || "UNKNOWN"}</span>
          </Badge>
        </div>
        <CardDescription className="text-slate-600">{po?.supplier?.name || "No supplier"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium text-emerald-700">${(po.total || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expected:</span>
            <span className="text-slate-700">
              {po.expectedDeliveryDate ? formatDate(new Date(po.expectedDeliveryDate), "dd/MM/yyyy") : "TBD"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span className="text-slate-700">{po?.location?.name || "No location"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items:</span>
            <span className="text-slate-700">{(po.lines || []).length} items</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardStatsProps {
  purchaseOrders: PurchaseOrderWithRelations[]
  locationId?: string
}

function DashboardStats({ purchaseOrders, locationId }: DashboardStatsProps) {
  const { session, status, organizationId } = useClientAuth()
  const orgId = organizationId || ""
  const { stats: inventoryStats, loading: inventoryLoading } = useInventoryStats(orgId)

  // Filter purchase orders by location if locationId is provided
  const filteredPurchaseOrders = locationId
    ? purchaseOrders.filter((po) => po.locationId === locationId)
    : purchaseOrders

  // Don't render stats until session is loaded to prevent hydration mismatch
  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalOrders = filteredPurchaseOrders.length
  const pendingApproval = filteredPurchaseOrders.filter((po) => po.status === "SUBMITTED").length
  const inTransit = filteredPurchaseOrders.filter((po) => ["APPROVED", "PARTIALLY_RECEIVED"].includes(po.status)).length
  const totalValue = filteredPurchaseOrders.reduce((sum, po) => sum + po.total, 0)

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      change: "+12%",
      icon: ShoppingCart,
      color: "text-emerald-700",
      bgGradient: "from-emerald-400/20 via-teal-400/10 to-cyan-400/20",
      iconBg: "bg-emerald-500/20",
      borderColor: "border-emerald-300/30",
    },
    {
      title: "Pending Approval",
      value: pendingApproval.toString(),
      change: `${pendingApproval > 0 ? "+" : ""}${pendingApproval}`,
      icon: Clock,
      color: "text-amber-700",
      bgGradient: "from-amber-400/20 via-yellow-400/10 to-orange-400/20",
      iconBg: "bg-amber-500/20",
      borderColor: "border-amber-300/30",
    },
    {
      title: "In Transit",
      value: inTransit.toString(),
      change: `${inTransit > 0 ? "+" : ""}${inTransit}`,
      icon: Package,
      color: "text-teal-700",
      bgGradient: "from-teal-400/20 via-emerald-400/10 to-green-400/20",
      iconBg: "bg-teal-500/20",
      borderColor: "border-teal-300/30",
    },
    {
      title: "Order Value",
      value: `$${totalValue.toLocaleString()}`,
      change: "+18%",
      icon: TrendingUp,
      color: "text-cyan-700",
      bgGradient: "from-cyan-400/20 via-blue-400/10 to-indigo-400/20",
      iconBg: "bg-cyan-500/20",
      borderColor: "border-cyan-300/30",
    },
  ]

  if (inventoryStats && !inventoryLoading) {
    stats.push(
      {
        title: "Inventory Value",
        value: `$${(inventoryStats?.totalValue ?? 0).toLocaleString()}`,
        change: "+5%",
        icon: Package,
        color: "text-indigo-700",
        bgGradient: "from-indigo-400/20 via-purple-400/10 to-violet-400/20",
        iconBg: "bg-indigo-500/20",
        borderColor: "border-indigo-300/30",
      },
      {
        title: "Low Stock Items",
        value: (inventoryStats?.lowStockItems ?? 0).toString(),
        change: (inventoryStats?.lowStockItems ?? 0) > 0 ? `${inventoryStats?.lowStockItems ?? 0} items` : "None",
        icon: AlertTriangle,
        color: (inventoryStats?.lowStockItems ?? 0) > 0 ? "text-red-700" : "text-emerald-700",
        bgGradient:
          (inventoryStats?.lowStockItems ?? 0) > 0
            ? "from-red-400/20 via-rose-400/10 to-pink-400/20"
            : "from-emerald-400/20 via-teal-400/10 to-cyan-400/20",
        iconBg: (inventoryStats?.lowStockItems ?? 0) > 0 ? "bg-red-500/20" : "bg-emerald-500/20",
        borderColor: (inventoryStats?.lowStockItems ?? 0) > 0 ? "border-red-300/30" : "border-emerald-300/30",
      },
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className={`
            relative overflow-hidden border-2 ${stat.borderColor}
            bg-gradient-to-br ${stat.bgGradient}
            backdrop-blur-xl shadow-2xl ring-1 ring-white/20
            hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1
            transition-all duration-300 ease-out group
            before:absolute before:inset-0 before:bg-gradient-to-br before:${stat.bgGradient} before:opacity-50
            after:absolute after:inset-0 after:bg-white/10 after:backdrop-blur-sm
          `}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-tr-full" />

          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${stat.iconBg} animate-pulse`} />
            <div className={`absolute top-8 right-8 w-1 h-1 rounded-full ${stat.iconBg} animate-pulse delay-200`} />
            <div
              className={`absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full ${stat.iconBg} animate-pulse delay-500`}
            />
          </div>

          <CardContent className="relative z-10 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`p-2 rounded-xl ${stat.iconBg} ring-2 ring-white/30 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color} group-hover:animate-pulse`} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{stat.title}</p>
                </div>

                <div className="space-y-2">
                  <p
                    className={`text-3xl font-black ${stat.color} tracking-tight group-hover:scale-105 transition-transform duration-300`}
                  >
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1">
                    <div
                      className={`px-2 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-300/30`}
                    >
                      <span className="text-xs font-bold text-emerald-700">{stat.change}</span>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">vs last month</span>
                  </div>
                </div>
              </div>

              {/* Large decorative icon */}
              <div className="relative">
                <div
                  className={`absolute inset-0 ${stat.iconBg} rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300`}
                />
                <div
                  className={`relative p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 group-hover:rotate-12 transition-transform duration-500`}
                >
                  <stat.icon className={`h-8 w-8 ${stat.color} drop-shadow-lg`} />
                </div>
              </div>
            </div>
          </CardContent>

          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
          </div>
        </Card>
      ))}
    </div>
  )
}

function WorkflowDemo({ locationId }: { locationId?: string }) {
  const { session, status, user, organizationId } = useClientAuth()
  const orgId = organizationId || ""
  const [selectedPOId, setSelectedPOId] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { purchaseOrders, loading, error, refetch, updateOrderStatus } = useWorkflowData(orgId, locationId ?? "")

  console.log({ purchaseOrders })
  // Debug logging
  console.log("WorkflowDemo Debug:", {
    orgId,
    purchaseOrdersCount: purchaseOrders.length,
    loading,
    error,
    locationId,
    purchaseOrders: purchaseOrders.slice(0, 3), // Log first 3 orders
  })

  // Filter purchase orders by status and search (location filtering is handled by the hook)
  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesStatus = statusFilter === "all" || po.status === statusFilter
    const matchesSearch =
      searchTerm === "" ||
      po.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Auto-select first order if none selected
  const selectedPO = selectedPOId ? purchaseOrders.find((po) => po.id === selectedPOId) : filteredOrders[0]
  console.log({ filteredOrders })

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading purchase orders...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <AlertTriangle className="h-8 w-8 mr-2" />
        <span>Error: {error}</span>
        <Button variant="outline" size="sm" onClick={refetch} className="ml-4 bg-transparent">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Link href="/dashboard/purchase-orders/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
        <Link href="/dashboard/purchase-orders">
          <Button size="sm">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Order List
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Purchase Order Workflow</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/dashboard/purchase-orders/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders or suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
            <SelectItem value="RECEIVED">Received</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Orders List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders ({filteredOrders.length})</CardTitle>
              <CardDescription>
                {statusFilter !== "all" ? `Filtered by: ${statusFilter}` : "All purchase orders"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No purchase orders found</p>
                  {searchTerm && (
                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="mt-2">
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {purchaseOrders.map((po) => (
                    <PurchaseOrderCard
                      key={po.id}
                      po={po}
                      isSelected={selectedPO?.id === po.id}
                      onSelect={() => setSelectedPOId(po.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Workflow Panel */}
        <div className="lg:col-span-1">
          {selectedPO ? (
            <PurchaseOrderWorkflowPanelModern
              purchaseOrderId={selectedPO.id}
              organizationId={orgId}
              currentUserId={user?.id || ""}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Clipboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a purchase order to view workflow options</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

interface InventoryOverviewProps {
  organizationId: string
  locationId?: string | undefined
  locationName?: string
}

function InventoryOverview({ organizationId, locationId, locationName }: InventoryOverviewProps) {
  const {
    data: inventoryLevels,
    isLoading: loading,
    error: queryError,
  } = useInventoryLevels(organizationId, locationId)
  const error = queryError?.message || null

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Overview
          </CardTitle>
          <CardDescription className="font-sans font-extrabold">
            ` Current stock levels and availability for ${locationName}`
            {/* {selectedLocationId ? `for ${locations.find(l => l.id === selectedLocationId)?.name || 'selected location'}` : 'across all locations'} */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading inventory...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Overview
          </CardTitle>
          <CardDescription className="font-sans font-extrabold">

            Current stock levels and availability
            {locationName && ` for ${locationName}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-red-600">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (

    <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
      <CardHeader className="bg-gradient-to-r from-amber-400/20 via-yellow-400/10 to-orange-400/20">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Overview
        </CardTitle>
        <CardDescription>
          Current stock levels and availability
          {locationName && ` for ${locationName}`}

        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inventoryLevels && inventoryLevels.length > 0 ? (
            inventoryLevels.map((level) => {
              const isLowStock = level?.quantityOnHand <= (level?.reorderPoint || 0) && level?.quantityAvailable > 0
              const isOutOfStock = level?.quantityAvailable === 0
              const status = isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"
              const statusVariant = isOutOfStock ? "destructive" : isLowStock ? "destructive" : "secondary"

              return (
                <div key={level.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1 ">
                    <div className="flex justify-between gap-4 text-sm text-muted-foreground mt-1">
                      <p className="font-bold text-md ">{level?.item?.name}</p>
                      {/* <p className="font-medium text-sm text-blue-800">{level?.location?.name}</p> */}
                      <span>Reserved: {level?.quantityReserved}</span>
                      <span>On Hand: {level?.quantityOnHand}</span>
                      <span>Available: {level?.quantityAvailable}</span>
                      <p className="font-medium">${level.totalValue?.toLocaleString()}</p>
                      <Badge variant={statusVariant} className="text-xs">
                        {status}
                      </Badge>
                    </div>

                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No inventory data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentTransactions({ locationId }: { locationId?: string }) {
  const { session, status, organizationId } = useClientAuth()
  const userOrgId = organizationId || ""
  const {
    data: transactions,
    isLoading: loading,
    error: queryError,
  } = useInventoryTransactions(userOrgId, undefined, locationId)
  const error = queryError?.message || null

  if (status === "loading") {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-white/20">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Latest inventory movements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-white/20">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Latest inventory movements {locationId && "for selected location"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading transactions...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-white/20">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Latest inventory movements {locationId && "for selected location"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-red-600">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
      <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-700" />
          Recent Transactions
        </CardTitle>
        <CardDescription>Latest inventory movements {locationId && "for selected location"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => {
              const isPositive = transaction.quantity > 0
              const timeAgo = Math.floor((Date.now() - transaction.createdAt.getTime()) / (1000 * 60 * 60))

              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{transaction?.item?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.type
                        .replace("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      {transaction.referenceType && ` - ${transaction.referenceId}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {isPositive ? "+" : ""}
                      {transaction.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo === 0 ? "Just now" : `${timeAgo} hours ago`}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PurchaseOrderDashboard() {
  const [selectedLocationId, setSelectedLocationId] = useState<string>("")
  const [locationName, setLocationName] = useState<string>("")
  const { session, status, user, organizationId, isAuthenticated, isLoading } = useClientAuth()
  const orgId = organizationId || ""

  // Handle authentication states properly
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Authenticating...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-semibold mb-2">Organization Required</h2>
          <p className="text-muted-foreground">Please set up an organization to continue.</p>
        </div>
      </div>
    )
  }
  const { purchaseOrders, loading, error } = useWorkflowData(orgId, selectedLocationId)

  console.log({ purchaseOrders })
  // Debug logging
  console.log("Main Dashboard Debug:", {
    orgId,
    purchaseOrdersCount: purchaseOrders.length,
    loading,
    error,
    user,
    session: !!session,
  })

  // Get locations for the selector
  const { data: locationResponse, isLoading: locationsLoading } = useOrgLocationsNew(orgId, { enabled: !!orgId })
  const locations = locationResponse?.data || []
  // Auto-select first location if none selected
  useEffect(() => {
    if (!selectedLocationId && locations.length > 0 && !locationsLoading) {
      setSelectedLocationId(locations[0]?.id)
      // setLocationName(locations[0]?.name)
    }
  }, [selectedLocationId, locations, locationsLoading])


  useEffect(() => {
    setLocationName(locations[0]?.name)
  }, [selectedLocationId, locations, locationsLoading])

  // Prevent hydration mismatch by not rendering until session is loaded
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Purchase Order Management Systems</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive workflow management with real-time status tracking
            </p>
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-slate-500 mt-2 font-mono">
                Debug: {purchaseOrders?.length || 0} POs loaded | Location: {locationName || "All"} | Status:{" "}
                {status}
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/dashboard/purchase-orders/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Purchase Order
              </Button>
            </Link>
            <Link href="/dashboard/purchase-orders">
              <Button size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                All Purchase orders
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Dashboard */}
        {!loading && <DashboardStats purchaseOrders={purchaseOrders || []} locationId={selectedLocationId} />}

        {/* Main Content Tabs */}
        <Tabs defaultValue="workflow" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/95 backdrop-blur-xl border-emerald-200/40 shadow-2xl ring-2 ring-teal-300/30">
            <TabsTrigger
              value="workflow"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              Workflow
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              Sales
            </TabsTrigger>
            <TabsTrigger
              value="cashdrawer"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              Cash Drawer
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              Analytics
            </TabsTrigger>
          </TabsList>P

          <TabsContent value="workflow">
            <WorkflowDemo locationId={selectedLocationId} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* <div className=" flex gap-6"> */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">

                <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
                  <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-emerald-700" />
                      Recent Purchase Orders
                    </CardTitle>
                    <CardDescription>
                      Latest orders {selectedLocationId ? `for ${locations.find(l => l.id === selectedLocationId)?.name || 'selected location'}` : 'across all locations'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading purchase orders...</span>
                      </div>
                    ) : error ? (
                      <div className="text-center p-4 text-red-600">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-medium">Error loading purchase orders</p>
                        <p className="text-sm mt-1">{error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          // onClick={() => fetchPurchaseOrders()}
                          className="mt-2"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          // Filter orders by location if selected
                          const filteredOrders = selectedLocationId
                            ? purchaseOrders.filter(po => po.locationId === selectedLocationId)
                            : purchaseOrders

                          console.log("[DEBUG] Overview Tab Filtering:", {
                            totalOrders: purchaseOrders.length,
                            filteredOrders: purchaseOrders.length,
                            selectedLocationId,
                            hasLocationFilter: !!selectedLocationId,
                            sampleOrders: purchaseOrders.slice(0, 2).map(po => ({
                              id: po.id,
                              orderNumber: po.orderNumber,
                              locationId: po.locationId,
                              status: po.status
                            }))
                          })

                          if (purchaseOrders.length === 0) {
                            return (
                              <div className="text-center p-8 text-muted-foreground">
                                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                  <ShoppingCart className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="font-medium mb-2">
                                  {selectedLocationId ? "No purchase orders for this location" : "No purchase orders found"}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {selectedLocationId
                                    ? "Try selecting a different location or create a new purchase order."
                                    : "Create your first purchase order to get started."
                                  }
                                </p>
                                {purchaseOrders.length > 0 && purchaseOrders.length === 0 && selectedLocationId && (
                                  <p className="text-xs text-amber-600 mt-2">
                                    Note: There are {purchaseOrders.length} orders in other locations
                                  </p>
                                )}
                                <Link href="/dashboard/purchase-orders/new">
                                  <Button size="sm" className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Purchase Order
                                  </Button>
                                </Link>
                              </div>
                            )
                          }

                          // Get recent orders (latest first)
                          const recentOrders = purchaseOrders
                            .sort(
                              (a, b) =>
                                new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime()
                            )
                            .slice(0, 5)
                          console.log({ recentOrders })
                          return (
                            <>
                              {recentOrders.map((po) => (
                                <PurchaseOrderCard
                                  key={po.id}
                                  po={po}
                                  isSelected={false}
                                  onSelect={() => {
                                    console.log("Selected PO:", po.orderNumber)
                                    // You can add navigation logic here if needed
                                  }}
                                />
                              ))}

                              {purchaseOrders.length > 5 && (
                                <div className="text-center pt-4 border-t">
                                  <Link href="/dashboard/purchase-orders">
                                    <Button variant="outline" size="sm">
                                      View All Orders ({purchaseOrders.length})
                                    </Button>
                                  </Link>
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              {/* </div> */}
              {/* <div className="grid grid-cols-1 lg:grid-cols-4 gap-2"> */}
              <div className="lg:col-span-3">

                <div className="space-y-6">
                  <InventoryOverview locationId={selectedLocationId} organizationId={orgId} locationName={locationName} />

                  {/* Attention Required Card */}
                  <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
                    <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Attention Required
                      </CardTitle>
                      <CardDescription>Orders needing your action</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          if (loading) {
                            return (
                              <div className="flex items-center justify-center h-20">
                                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                                <span className="text-sm text-muted-foreground">Loading...</span>
                              </div>
                            )
                          }

                          if (error) {
                            return (
                              <div className="text-center text-red-600 py-4">
                                <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                                <p className="text-sm">Error loading data</p>
                              </div>
                            )
                          }

                          const attentionOrders = purchaseOrders.filter(po =>
                            ["SUBMITTED", "DRAFT"].includes(po.status)
                          ).slice(0, 3) // Limit to 3 items

                          if (attentionOrders.length === 0) {
                            return (
                              <div className="text-center py-6 text-muted-foreground">
                                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                <p className="text-sm">All caught up! No actions required.</p>
                              </div>
                            )
                          }

                          return attentionOrders.map((po) => (
                            <div
                              key={po.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/50 border-amber-200/50"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-slate-800">{po.orderNumber}</p>
                                <p className="text-sm text-amber-700 capitalize">{po.status.toLowerCase()} • {po.supplier?.name}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  ${po.total.toLocaleString()} • {po.location?.name}
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                                {po.status === "SUBMITTED" ? "Pending Approval" : "Draft"}
                              </Badge>
                            </div>
                          ))
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="inventory">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InventoryOverview locationId={selectedLocationId} organizationId={orgId} locationName={locationName} />
              <RecentTransactions locationId={selectedLocationId} />
            </div>
          </TabsContent>

          <TabsContent value="cashdrawer">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
                <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-700" />
                    Cash Summary {selectedLocationId && "(Selected Location)"}
                  </CardTitle>
                  <CardDescription>Current cash drawer status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mt-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200/30">
                      <div className="text-3xl font-bold text-emerald-700">$2,450.75</div>
                      <div className="text-sm text-emerald-600">Total Cash Balance</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-teal-50 rounded-lg border border-teal-200/30">
                        <div className="text-lg font-bold text-teal-700">$345.25</div>
                        <div className="text-xs text-teal-600">Today's Sales</div>
                      </div>
                      <div className="text-center p-3 bg-cyan-50 rounded-lg border border-cyan-200/30">
                        <div className="text-lg font-bold text-cyan-700">15</div>
                        <div className="text-xs text-cyan-600">Transactions</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
                <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-teal-700" />
                    Terminal Activity
                  </CardTitle>
                  <CardDescription>Per terminal breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-4">
                    {selectedLocationId ? (
                      <>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200/30">
                          <div>
                            <p className="font-medium text-emerald-800">Terminal #001</p>
                            <p className="text-sm text-emerald-600">Active Session</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-700">$1,250.50</div>
                            <div className="text-xs text-emerald-600">8 transactions</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200/30">
                          <div>
                            <p className="font-medium text-teal-800">Terminal #002</p>
                            <p className="text-sm text-teal-600">Active Session</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-teal-700">$1,200.25</div>
                            <div className="text-xs text-teal-600">7 transactions</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        Select a location to view terminal details
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
                <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-cyan-700" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Transaction breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200/30">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-emerald-800">Cash</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-700">$1,450.50</div>
                        <div className="text-xs text-emerald-600">9 transactions</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200/30">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-teal-600" />
                        <span className="font-medium text-teal-800">Card</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-teal-700">$1,000.25</div>
                        <div className="text-xs text-teal-600">6 transactions</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40 lg:col-span-2 xl:col-span-3">
                <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-emerald-700" />
                    Cash Flow Analysis
                  </CardTitle>
                  <CardDescription>
                    Daily cash flow trends for {selectedLocationId ? "selected location" : "all locations"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200/30">
                      <div className="text-xl font-bold text-emerald-700">$2,450.75</div>
                      <div className="text-sm text-emerald-600 mt-1">Opening Balance</div>
                      <div className="text-xs text-muted-foreground mt-1">Today</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-200/30">
                      <div className="text-xl font-bold text-teal-700">$345.25</div>
                      <div className="text-sm text-teal-600 mt-1">Total Sales</div>
                      <div className="text-xs text-muted-foreground mt-1">Today</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-lg border border-cyan-200/30">
                      <div className="text-xl font-bold text-cyan-700">$125.00</div>
                      <div className="text-sm text-cyan-600 mt-1">Cash Out</div>
                      <div className="text-xs text-muted-foreground mt-1">Expenses</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-lg border border-emerald-200/30">
                      <div className="text-xl font-bold text-emerald-700">$2,671.00</div>
                      <div className="text-sm text-emerald-600 mt-1">Expected Balance</div>
                      <div className="text-xs text-muted-foreground mt-1">End of Day</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
                <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-700" />
                    Order Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart visualization would go here
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
                <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-700" />
                    Top Suppliers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(selectedLocationId
                      ? purchaseOrders.filter((po) => po.locationId === selectedLocationId)
                      : purchaseOrders
                    )
                      .reduce(
                        (acc, po) => {
                          const existing = acc.find((s) => s.name === po.supplier.name)
                          if (existing) {
                            existing.total += po.total
                          } else {
                            acc.push({ name: po.supplier.name, total: po.total })
                          }
                          return acc
                        },
                        [] as { name: string; total: number }[],
                      )
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 3)
                      .map((supplier) => (
                        <div key={supplier.name} className="flex items-center justify-between">
                          <span>{supplier.name}</span>
                          <span className="font-medium">${supplier.total.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
                <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-700" />
                    Sales Overview {selectedLocationId && "(Selected Location)"}
                  </CardTitle>
                  <CardDescription>
                    Revenue and sales metrics for {selectedLocationId ? "this location" : "all locations"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200/30">
                      <div className="text-2xl font-bold text-emerald-700">
                        ${selectedLocationId ? "4,250.75" : "12,450.25"}
                      </div>
                      <div className="text-sm text-emerald-600">Total Sales Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200/30">
                      <div className="text-2xl font-bold text-teal-700">{selectedLocationId ? "35" : "127"}</div>
                      <div className="text-sm text-teal-600">Sales Transactions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-xl border-emerald-200/50 shadow-2xl ring-2 ring-teal-300/40">
                <CardHeader className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b border-teal-200/50">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-cyan-700" />
                    Sales Performance
                  </CardTitle>
                  <CardDescription>Performance metrics by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-4">
                    {(selectedLocationId
                      ? [
                        { category: "Product Sales", value: "$3,250.50", count: "28 items" },
                        { category: "Service Revenue", value: "$1,000.25", count: "7 services" },
                      ]
                      : [
                        { category: "Product Sales", value: "$9,850.75", count: "89 items" },
                        { category: "Service Revenue", value: "$2,599.50", count: "38 services" },
                      ]
                    ).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border border-cyan-200/30"
                      >
                        <div>
                          <p className="font-medium text-cyan-800">{item.category}</p>
                          <p className="text-sm text-cyan-600">{item.count}</p>
                        </div>
                        <div className="text-lg font-bold text-cyan-700">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  )
}
