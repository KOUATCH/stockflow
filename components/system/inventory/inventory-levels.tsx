"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Package, AlertTriangle, TrendingUp, RotateCcw } from "lucide-react"

interface InventoryLevel {
  id: string
  itemName: string
  sku: string
  location: string
  currentStock: number
  minStock: number
  maxStock: number
  reservedStock: number
  availableStock: number
  lastUpdated: string
  averageCost: number
  totalValue: number
}

const mockInventoryLevels: InventoryLevel[] = [
  {
    id: "1",
    itemName: "iPhone 15 Pro 256GB",
    sku: "IPH15P-256",
    location: "Main Warehouse",
    currentStock: 5,
    minStock: 10,
    maxStock: 50,
    reservedStock: 2,
    availableStock: 3,
    lastUpdated: "2024-01-15T10:30:00Z",
    averageCost: 899,
    totalValue: 4495,
  },
  {
    id: "2",
    itemName: "Samsung Galaxy S24 128GB",
    sku: "SGS24-128",
    location: "Main Warehouse",
    currentStock: 8,
    minStock: 15,
    maxStock: 60,
    reservedStock: 1,
    availableStock: 7,
    lastUpdated: "2024-01-14T15:45:00Z",
    averageCost: 649,
    totalValue: 5192,
  },
  {
    id: "3",
    itemName: "MacBook Air M3 512GB",
    sku: "MBA-M3-512",
    location: "Store Front",
    currentStock: 12,
    minStock: 20,
    maxStock: 40,
    reservedStock: 3,
    availableStock: 9,
    lastUpdated: "2024-01-13T09:15:00Z",
    averageCost: 1199,
    totalValue: 14388,
  },
  {
    id: "4",
    itemName: "AirPods Pro 3rd Gen",
    sku: "APP-GEN3",
    location: "Main Warehouse",
    currentStock: 3,
    minStock: 25,
    maxStock: 100,
    reservedStock: 0,
    availableStock: 3,
    lastUpdated: "2024-01-12T14:20:00Z",
    averageCost: 199,
    totalValue: 597,
  },
]

export function InventoryLevels() {
  const [levels, setLevels] = useState<InventoryLevel[]>(mockInventoryLevels)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<InventoryLevel | null>(null)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)

  const filteredLevels = levels.filter((level) => {
    const matchesSearch =
      level.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === "all" || level.location === locationFilter

    let matchesStock = true
    if (stockFilter === "low") {
      matchesStock = level.currentStock <= level.minStock
    } else if (stockFilter === "critical") {
      matchesStock = level.currentStock <= level.minStock * 0.5
    } else if (stockFilter === "out") {
      matchesStock = level.currentStock === 0
    }

    return matchesSearch && matchesLocation && matchesStock
  })

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { label: "Out of Stock", variant: "destructive", color: "bg-destructive" }
    if (current <= min * 0.5) return { label: "Critical", variant: "destructive", color: "bg-destructive" }
    if (current <= min) return { label: "Low Stock", variant: "secondary", color: "bg-chart-4" }
    return { label: "Normal", variant: "default", color: "bg-primary" }
  }

  const getStockPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  const locations = Array.from(new Set(levels.map((level) => level.location)))

  const handleAdjustStock = (item: InventoryLevel) => {
    setSelectedItem(item)
    setIsAdjustDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Inventory Levels</h1>
          <p className="text-muted-foreground">Monitor and manage stock levels across all locations</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <RotateCcw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{levels.length}</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {levels.filter((l) => l.currentStock <= l.minStock).length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              ${levels.reduce((sum, l) => sum + l.totalValue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Reserved Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {levels.reduce((sum, l) => sum + l.reservedStock, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Units reserved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Stock Levels ({filteredLevels.length})</CardTitle>
          <CardDescription>Current inventory status across all locations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLevels.map((level) => {
                const stockStatus = getStockStatus(level.currentStock, level.minStock)
                const stockPercentage = getStockPercentage(level.currentStock, level.maxStock)

                return (
                  <TableRow key={level.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground">{level.itemName}</div>
                          <div className="text-sm text-muted-foreground">SKU: {level.sku}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{level.location}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-card-foreground">
                            {level.currentStock} / {level.maxStock}
                          </span>
                          <Badge variant={stockStatus.variant as any}>{stockStatus.label}</Badge>
                        </div>
                        <Progress value={stockPercentage} className="h-2" />
                        <div className="text-xs text-muted-foreground">Min: {level.minStock} units</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-card-foreground">{level.availableStock}</div>
                        <div className="text-sm text-muted-foreground">Reserved: {level.reservedStock}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-card-foreground">${level.totalValue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Avg: ${level.averageCost}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleAdjustStock(level)}>
                        Adjust Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
            <DialogDescription>{selectedItem && `Adjust inventory for ${selectedItem.itemName}`}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Stock</Label>
                  <Input value={selectedItem.currentStock} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Available Stock</Label>
                  <Input value={selectedItem.availableStock} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjustment">Adjustment Quantity</Label>
                <Input id="adjustment" type="number" placeholder="Enter positive or negative number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damaged">Damaged Goods</SelectItem>
                    <SelectItem value="expired">Expired Items</SelectItem>
                    <SelectItem value="theft">Theft/Loss</SelectItem>
                    <SelectItem value="found">Found Items</SelectItem>
                    <SelectItem value="correction">Inventory Correction</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes (optional)" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Apply Adjustment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
