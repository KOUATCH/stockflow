"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInventoryManagement } from "@/hooks/use-inventory"
import type { StockAdjustmentType } from "@/types"
import { AlertTriangle, FileText, History, Package, Plus, RefreshCw, Search, TrendingUp, Warehouse } from "lucide-react"
import { useState } from "react"

interface InventoryManagementProps {
  organizationId: string
  locationId: string
  locations: Array<{ id: string; name: string; code: string }>
}

export default function InventoryManagement({
  organizationId,
  locationId: initialLocationId,
  locations,
}: InventoryManagementProps) {
  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustmentType>("COUNT")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [adjustmentLines, setAdjustmentLines] = useState<
    Array<{
      itemId: string
      itemName: string
      currentQuantity: number
      adjustedQuantity: number
      reason?: string
    }>
  >([])

  const {
    inventoryLevels,
    lowStockItems,
    adjustments,
    isInventoryLoading,
    isLowStockLoading,
    isCreatingAdjustment,
    createAdjustment,
    refreshInventory,
  } = useInventoryManagement(organizationId, selectedLocationId, searchTerm)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const handleCreateAdjustment = () => {
    if (adjustmentLines.length === 0) return

    createAdjustment({
      type: adjustmentType,
      reason: adjustmentReason,
      lines: adjustmentLines.map((line) => ({
        itemId: line.itemId,
        currentQuantity: line.currentQuantity,
        adjustedQuantity: line.adjustedQuantity,
        reason: line.reason,
      })),
    })

    setIsAdjustmentDialogOpen(false)
    setAdjustmentLines([])
    setAdjustmentReason("")
  }

  const addItemToAdjustment = (item: any) => {
    const existingLine = adjustmentLines.find((line) => line.itemId === item.itemId)
    if (existingLine) return

    setAdjustmentLines((prev) => [
      ...prev,
      {
        itemId: item.itemId,
        itemName: item.item.name,
        currentQuantity: item.quantityOnHand,
        adjustedQuantity: item.quantityOnHand,
        reason: "",
      },
    ])
  }

  const updateAdjustmentLine = (itemId: string, field: string, value: any) => {
    setAdjustmentLines((prev) => prev.map((line) => (line.itemId === itemId ? { ...line, [field]: value } : line)))
  }

  const removeAdjustmentLine = (itemId: string) => {
    setAdjustmentLines((prev) => prev.filter((line) => line.itemId !== itemId))
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Warehouse className="h-6 w-6" />
            </div>
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Track stock levels, manage adjustments, and monitor inventory health</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name} ({location.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={refreshInventory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Stock Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Stock Adjustment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Adjustment Type</Label>
                    <Select
                      value={adjustmentType}
                      onValueChange={(value: StockAdjustmentType) => setAdjustmentType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCREASE">Increase Stock</SelectItem>
                        <SelectItem value="DECREASE">Decrease Stock</SelectItem>
                        <SelectItem value="COUNT">Stock Count</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      placeholder="Enter reason for adjustment"
                    />
                  </div>
                </div>

                {adjustmentLines.length > 0 && (
                  <div className="space-y-2">
                    <Label>Adjustment Lines</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3">Item</th>
                            <th className="text-right p-3">Current</th>
                            <th className="text-right p-3">Adjusted</th>
                            <th className="text-right p-3">Difference</th>
                            <th className="text-left p-3">Reason</th>
                            <th className="text-center p-3">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adjustmentLines.map((line) => (
                            <tr key={line.itemId} className="border-t">
                              <td className="p-3 font-medium">{line.itemName}</td>
                              <td className="text-right p-3">{line.currentQuantity}</td>
                              <td className="text-right p-3">
                                <Input
                                  type="number"
                                  value={line.adjustedQuantity}
                                  onChange={(e) =>
                                    updateAdjustmentLine(
                                      line.itemId,
                                      "adjustedQuantity",
                                      Number.parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-20 text-right"
                                />
                              </td>
                              <td className="text-right p-3">
                                <span
                                  className={
                                    line.adjustedQuantity - line.currentQuantity >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {line.adjustedQuantity - line.currentQuantity > 0 ? "+" : ""}
                                  {line.adjustedQuantity - line.currentQuantity}
                                </span>
                              </td>
                              <td className="p-3">
                                <Input
                                  value={line.reason || ""}
                                  onChange={(e) => updateAdjustmentLine(line.itemId, "reason", e.target.value)}
                                  placeholder="Optional reason"
                                  className="w-32"
                                />
                              </td>
                              <td className="text-center p-3">
                                <Button variant="outline" size="sm" onClick={() => removeAdjustmentLine(line.itemId)}>
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAdjustment}
                    disabled={isCreatingAdjustment || adjustmentLines.length === 0}
                  >
                    Create Adjustment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryLevels.length}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(inventoryLevels.reduce((sum: number, item: { totalValue: number }) => sum + item.totalValue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items below reorder level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Adjustments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adjustments.filter((adj: { status: string }) => adj.status === "DRAFT").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock Alert</TabsTrigger>
          <TabsTrigger value="adjustments">Stock Adjustments</TabsTrigger>
        </TabsList>

        {/* Current Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4">Item</th>
                      <th className="text-right p-4">On Hand</th>
                      <th className="text-right p-4">Available</th>
                      <th className="text-right p-4">Reserved</th>
                      <th className="text-right p-4">On Order</th>
                      <th className="text-right p-4">Value</th>
                      <th className="text-center p-4">Status</th>
                      <th className="text-center p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryLevels.map((level: any) => (
                      <tr key={level.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{level.item.name}</div>
                            <div className="text-sm text-gray-500">{level.item.sku}</div>
                          </div>
                        </td>
                        <td className="text-right p-4 font-medium">{level.quantityOnHand}</td>
                        <td className="text-right p-4">{level.quantityAvailable}</td>
                        <td className="text-right p-4">{level.quantityReserved}</td>
                        <td className="text-right p-4">{level.quantityOnOrder}</td>
                        <td className="text-right p-4">{formatCurrency(level.totalValue)}</td>
                        <td className="text-center p-4">
                          {level.quantityOnHand <= level.reorderPoint ? (
                            <Badge variant="destructive">Low Stock</Badge>
                          ) : level.quantityOnHand <= level.item.minStockLevel ? (
                            <Badge variant="secondary">Reorder Soon</Badge>
                          ) : (
                            <Badge variant="default">In Stock</Badge>
                          )}
                        </td>
                        <td className="text-center p-4">
                          <Button variant="outline" size="sm" onClick={() => addItemToAdjustment(level)}>
                            Adjust
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Stock Tab */}
        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4">Item</th>
                      <th className="text-right p-4">Current Stock</th>
                      <th className="text-right p-4">Reorder Level</th>
                      <th className="text-right p-4">Suggested Order</th>
                      <th className="text-center p-4">Priority</th>
                      <th className="text-center p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((level) => (
                      <tr key={level.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{level.item.name}</div>
                            <div className="text-sm text-gray-500">{level.item.sku}</div>
                          </div>
                        </td>
                        <td className="text-right p-4 font-medium text-red-600">{level.quantityOnHand}</td>
                        <td className="text-right p-4">{level.reorderPoint}</td>
                        <td className="text-right p-4">{level.item.reorderQuantity || level.reorderPoint * 2}</td>
                        <td className="text-center p-4">
                          {level.quantityOnHand === 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : level.quantityOnHand <= level.reorderPoint / 2 ? (
                            <Badge variant="destructive">Critical</Badge>
                          ) : (
                            <Badge variant="secondary">Low</Badge>
                          )}
                        </td>
                        <td className="text-center p-4">
                          <Button variant="outline" size="sm">
                            Create PO
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Stock Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4">Adjustment #</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Reason</th>
                      <th className="text-right p-4">Items</th>
                      <th className="text-center p-4">Status</th>
                      <th className="text-left p-4">Created</th>
                      <th className="text-center p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.map((adjustment) => (
                      <tr key={adjustment.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{adjustment.adjustmentNumber}</td>
                        <td className="p-4">
                          <Badge variant="outline">{adjustment.type.replace("_", " ")}</Badge>
                        </td>
                        <td className="p-4">{adjustment.reason}</td>
                        <td className="text-right p-4">{adjustment.lines.length}</td>
                        <td className="text-center p-4">
                          <Badge
                            variant={
                              adjustment.status === "APPLIED"
                                ? "default"
                                : adjustment.status === "APPROVED"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {adjustment.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-500">{adjustment.createdAt.toLocaleDateString()}</td>
                        <td className="text-center p-4">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
