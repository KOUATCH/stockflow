"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Package2,
  Truck,
  DollarSign,
  Calendar,
  BarChart3,
  Scale
} from 'lucide-react'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface InventoryLevel {
  id: string
  quantityOnHand: number
  quantityAvailable: number
  quantityReserved: number
  reorderPoint: number
  maxStock: number
  location: {
    id: string
    name: string
    code: string
  }
}

interface Item {
  id: string
  name: string
  sku: string
  description?: string | null
  costPrice: number
  sellingPrice: number
  minStockLevel: number
  maxStockLevel: number | null
  reorderLevel: number
  category?: {
    id: string
    title: string
  } | null
  brand?: {
    id: string
    brandName: string
  } | null
  unit?: {
    id: string
    name: string
    symbol: string
  } | null
  inventoryLevels: InventoryLevel[]
}

interface Category {
  id: string
  title: string
}

interface Supplier {
  id: string
  name: string
  email?: string | null
  phone?: string | null
}

interface RawMaterialsManagementProps {
  rawMaterials: Item[]
  allItems: Item[]
  categories: Category[]
  suppliers: Supplier[]
  organizationId: string
  currentUserId: string
}

export function RawMaterialsManagement({
  rawMaterials,
  allItems,
  categories,
  suppliers,
  organizationId,
  currentUserId
}: RawMaterialsManagementProps) {
  const notifications = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Filter raw materials
  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = !searchTerm ||
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.category?.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'ALL' || material.category?.id === categoryFilter

    // Calculate total stock across all locations
    const totalStock = material.inventoryLevels.reduce((sum, level) => sum + level.quantityOnHand, 0)

    let matchesStatus = true
    if (statusFilter === 'LOW_STOCK') {
      matchesStatus = totalStock <= material.minStockLevel
    } else if (statusFilter === 'OUT_OF_STOCK') {
      matchesStatus = totalStock === 0
    } else if (statusFilter === 'IN_STOCK') {
      matchesStatus = totalStock > material.minStockLevel
    } else if (statusFilter === 'OVERSTOCK') {
      matchesStatus = material.maxStockLevel ? totalStock >= material.maxStockLevel : false
    }

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Calculate summary statistics
  const totalMaterials = rawMaterials.length
  const lowStockCount = rawMaterials.filter(m => {
    const totalStock = m.inventoryLevels.reduce((sum, level) => sum + level.quantityOnHand, 0)
    return totalStock <= m.minStockLevel && totalStock > 0
  }).length
  const outOfStockCount = rawMaterials.filter(m => {
    const totalStock = m.inventoryLevels.reduce((sum, level) => sum + level.quantityOnHand, 0)
    return totalStock === 0
  }).length
  const totalValue = rawMaterials.reduce((sum, material) => {
    const totalStock = material.inventoryLevels.reduce((stockSum, level) => stockSum + level.quantityOnHand, 0)
    return sum + (totalStock * material.costPrice)
  }, 0)

  const getStockStatus = (material: Item) => {
    const totalStock = material.inventoryLevels.reduce((sum, level) => sum + level.quantityOnHand, 0)

    if (totalStock === 0) return { status: 'OUT_OF_STOCK', color: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700', icon: AlertTriangle }
    if (totalStock <= material.minStockLevel) return { status: 'LOW_STOCK', color: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700', icon: TrendingDown }
    if (material.maxStockLevel && totalStock >= material.maxStockLevel) return { status: 'OVERSTOCK', color: 'bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700', icon: TrendingUp }
    return { status: 'IN_STOCK', color: 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700', icon: CheckCircle }
  }

  const getTotalStock = (material: Item) => {
    return material.inventoryLevels.reduce((sum, level) => sum + level.quantityOnHand, 0)
  }

  const getTotalValue = (material: Item) => {
    const totalStock = getTotalStock(material)
    return totalStock * material.costPrice
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-emerald-500/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Materials</CardTitle>
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-lg">
              <Package2 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{totalMaterials}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Raw material types</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Low Stock</CardTitle>
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{lowStockCount}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Need reordering</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-rose-500/5 to-pink-500/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Out of Stock</CardTitle>
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg shadow-lg">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{outOfStockCount}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Urgent restock</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Value</CardTitle>
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Raw Materials Inventory</CardTitle>
              <CardDescription>Monitor and manage your bakery's raw materials</CardDescription>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                <SelectItem value="OVERSTOCK">Overstock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Materials Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Package2 className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">
                          {rawMaterials.length === 0
                            ? "No raw materials found. Items with 'ingredient', 'raw', or 'material' in their category or common baking ingredients will appear here."
                            : "No materials match your current filters"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterials.map((material) => {
                    const stockStatus = getStockStatus(material)
                    const totalStock = getTotalStock(material)
                    const totalValue = getTotalValue(material)
                    const Icon = stockStatus.icon

                    return (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{material.name}</div>
                            <div className="text-sm text-gray-500">{material.sku}</div>
                            {material.brand && (
                              <div className="text-xs text-gray-400">{material.brand.brandName}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {material.category?.title || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatNumber(totalStock)}</div>
                          {material.inventoryLevels.length > 1 && (
                            <div className="text-xs text-gray-500">
                              Across {material.inventoryLevels.length} locations
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={stockStatus.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {stockStatus.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(material.costPrice)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(totalValue)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Min: {formatNumber(material.minStockLevel)}</div>
                            <div>Reorder: {formatNumber(material.reorderLevel)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {material.unit?.symbol || material.unit?.name || 'Unit'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {stockStatus.status === 'LOW_STOCK' || stockStatus.status === 'OUT_OF_STOCK' ? (
                              <Button variant="ghost" size="sm" className="text-orange-600">
                                <Truck className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Reorder Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              {lowStockCount + outOfStockCount} materials need attention
            </p>
            <Button variant="outline" className="w-full">
              Generate Purchase Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              View material consumption patterns
            </p>
            <Button variant="outline" className="w-full">
              View Usage Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Scale className="h-5 w-5 mr-2 text-green-500" />
              Recipe Costing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Calculate recipe costs with current prices
            </p>
            <Button variant="outline" className="w-full">
              Update Recipe Costs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}