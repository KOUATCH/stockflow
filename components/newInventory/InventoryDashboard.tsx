"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInventory, useInventorySummary } from "@/hooks/useInventoryQueries"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { cn, formatCurrency } from "@/lib/utils"
import {
  AlertTriangle,
  BarChart3,
  Box,
  DollarSign,
  MapPin,
  Package,
  Search,
  TrendingDown,
  TrendingUp,
  Warehouse,
} from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useState } from "react"
import { InventoryAdjustmentModal } from "./InventoryAdjustmentModal"
import { InventoryTransactionsTab } from "./InventoryTransactionsTab"
import { ReorderLevelModal } from "./ReorderLevelModal"

export function InventoryDashboard() {
  const { data: session } = useSession()
  const orgId = user || ""

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<string>("all") // Updated default value to "all"
  const [showLowStock, setShowLowStock] = useState(false)
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<any>(null)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [showReorderModal, setShowReorderModal] = useState(false)

  // Fetch data
  const { data: inventoryData, isLoading: inventoryLoading } = useInventory({
    organizationId: orgId,
    search: searchTerm,
    locationId: selectedLocation,
    lowStock: showLowStock,
    outOfStock: showOutOfStock,
    page: 1,
    limit: 50,
  })

  const { data: summary, isLoading: summaryLoading } = useInventorySummary(orgId)
  const { data: locationsResponse } = useOrgLocationsNew(orgId, { enabled: !!orgId })
  const locations = locationsResponse?.data || []

  const handleAdjustment = (inventory: any) => {
    setSelectedInventory(inventory)
    setShowAdjustmentModal(true)
  }

  const handleReorderLevel = (inventory: any) => {
    setSelectedInventory(inventory)
    setShowReorderModal(true)
  }

  if (inventoryLoading || summaryLoading) {
    return <InventoryLoadingSkeleton />
  }

  const inventory = inventoryData?.data || []

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage your inventory levels across all locations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">Across {summary?.totalLocations || 0} locations</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary?.lowStockItems || 0}</div>
            <p className="text-xs text-muted-foreground">Items below reorder level</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary?.outOfStockItems || 0}</div>
            <p className="text-xs text-muted-foreground">Items with zero quantity</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Inventory Overview
              </CardTitle>
              <CardDescription>View and manage your current inventory levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items by name, SKU, or description..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem> {/* Updated value to "all" */}
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant={showLowStock ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setShowLowStock(!showLowStock)
                      setShowOutOfStock(false)
                    }}
                  >
                    Low Stock
                  </Button>
                  <Button
                    variant={showOutOfStock ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setShowOutOfStock(!showOutOfStock)
                      setShowLowStock(false)
                    }}
                  >
                    Out of Stock
                  </Button>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Avg Cost</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead className="text-center">Reorder Level</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-lg font-medium">No inventory found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm || selectedLocation !== "all" || showLowStock || showOutOfStock
                              ? "Try adjusting your filters"
                              : "Start by receiving some purchase orders"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventory.map((item) => {
                        const isOutOfStock = item.quantity === 0
                        const isLowStock = item.quantity <= item.reorderLevel && item.quantity > 0
                        const isOverStock = item.maxLevel > 0 && item.quantity > item.maxLevel

                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.item.sku}</p>
                                {item.item.category && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {item.item.category.name}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{item.location.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={cn(
                                  "font-medium",
                                  isOutOfStock
                                    ? "text-red-600"
                                    : isLowStock
                                      ? "text-orange-600"
                                      : isOverStock
                                        ? "text-purple-600"
                                        : "text-green-600",
                                )}
                              >
                                {item.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.averageCost)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(item.totalValue)}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReorderLevel(item)}
                                className="text-xs"
                              >
                                {item.reorderLevel}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              {isOutOfStock ? (
                                <Badge variant="destructive" className="text-xs">
                                  Out of Stock
                                </Badge>
                              ) : isLowStock ? (
                                <Badge className="bg-orange-100 text-orange-800 text-xs">Low Stock</Badge>
                              ) : isOverStock ? (
                                <Badge className="bg-purple-100 text-purple-800 text-xs">Over Stock</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 text-xs">In Stock</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAdjustment(item)}
                                className="text-xs"
                              >
                                Adjust
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <InventoryTransactionsTab organizationId={orgId} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Inventory Trends
                </CardTitle>
                <CardDescription>Track inventory movement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium mt-4">Analytics Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    Detailed analytics and reporting features will be available here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Top Moving Items
                </CardTitle>
                <CardDescription>Items with highest transaction volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium mt-4">Reports Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    Top moving items and velocity reports will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedInventory && (
        <>
          <InventoryAdjustmentModal
            open={showAdjustmentModal}
            onOpenChange={setShowAdjustmentModal}
            inventory={selectedInventory}
            onSuccess={() => {
              setShowAdjustmentModal(false)
              setSelectedInventory(null)
            }}
          />

          <ReorderLevelModal
            open={showReorderModal}
            onOpenChange={setShowReorderModal}
            inventory={selectedInventory}
            onSuccess={() => {
              setShowReorderModal(false)
              setSelectedInventory(null)
            }}
          />
        </>
      )}
    </div>
  )
}

const InventoryLoadingSkeleton = () => (
  <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
)
