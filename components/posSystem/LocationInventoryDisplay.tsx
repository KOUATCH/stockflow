"use client"

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Search,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Tag,
  Barcode,
  TrendingDown,
  TrendingUp,
  Filter,
  Grid,
  List
} from 'lucide-react'

import {
  getLocationInventory,
  getLocationCategories,
  type LocationInventoryItem,
  type LocationInventoryFilters
} from '@/actions/posSystem/inventory/location-inventory-actions'
import { formatCurrency } from '@/actions/posSystem/utils/pos-utils'

interface LocationInventoryDisplayProps {
  locationId: string
  locationName: string
  onItemSelect?: (item: LocationInventoryItem) => void
  selectable?: boolean
}

export default function LocationInventoryDisplay({
  locationId,
  locationName,
  onItemSelect,
  selectable = false
}: LocationInventoryDisplayProps) {
  const [filters, setFilters] = useState<LocationInventoryFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Get location inventory
  const {
    data: inventory,
    isLoading: inventoryLoading,
    refetch: refetchInventory
  } = useQuery({
    queryKey: ['location-inventory', locationId, filters],
    queryFn: () => getLocationInventory(locationId, { ...filters, searchTerm }),
    enabled: !!locationId
  })

  // Get location categories
  const {
    data: categories,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['location-categories', locationId],
    queryFn: () => getLocationCategories(locationId),
    enabled: !!locationId
  })

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, searchTerm }))
  }

  const handleCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categoryId: categoryId === 'all' ? undefined : categoryId
    }))
  }

  const handleStockFilter = (stockFilter: string) => {
    switch (stockFilter) {
      case 'all':
        setFilters(prev => ({ ...prev, inStock: undefined, lowStock: undefined }))
        break
      case 'in-stock':
        setFilters(prev => ({ ...prev, inStock: true, lowStock: undefined }))
        break
      case 'low-stock':
        setFilters(prev => ({ ...prev, inStock: undefined, lowStock: true }))
        break
      case 'out-of-stock':
        setFilters(prev => ({ ...prev, inStock: false, lowStock: undefined }))
        break
    }
  }

  const getStockStatus = (item: LocationInventoryItem) => {
    if (item.availableStock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    }
    if (item.currentStock <= item.reorderPoint) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: TrendingDown }
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  }

  const getDisplayPrice = (item: LocationInventoryItem) => {
    if (item.promotionalPrice && item.promotionStartDate && item.promotionEndDate) {
      const now = new Date()
      if (now >= item.promotionStartDate && now <= item.promotionEndDate) {
        return { price: item.promotionalPrice, isPromo: true }
      }
    }
    return {
      price: item.locationPrice || item.price,
      isPromo: false
    }
  }

  if (inventoryLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading inventory...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            {locationName} Inventory
          </CardTitle>
          <CardDescription>
            {inventory?.length || 0} items available at this location
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                Search
              </Button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-600">Filters:</span>
              </div>

              <Select onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.itemCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={handleStockFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Stock Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 ml-auto">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {inventory?.map((item) => {
            const stockStatus = getStockStatus(item)
            const { price, isPromo } = getDisplayPrice(item)
            const StockIcon = stockStatus.icon

            return (
              <Card
                key={item.id}
                className={`transition-all hover:shadow-lg ${
                  selectable ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''
                }`}
                onClick={() => selectable && onItemSelect?.(item)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Item Image */}
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    {/* Item Info */}
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{item.sku}</p>
                      {item.barcode && (
                        <div className="flex items-center gap-1 mt-1">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{item.barcode}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{formatCurrency(price, 'USD')}</span>
                      {isPromo && item.price && (
                        <span className="text-sm text-slate-500 line-through">
                          {formatCurrency(item.price, 'USD')}
                        </span>
                      )}
                      {isPromo && (
                        <Badge variant="destructive" className="text-xs">
                          SALE
                        </Badge>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center justify-between">
                      <Badge className={`${stockStatus.color} border-0`}>
                        <StockIcon className="w-3 h-3 mr-1" />
                        {stockStatus.label}
                      </Badge>
                      <span className="text-sm text-slate-600">
                        {item.availableStock} available
                      </span>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{item.categoryName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-0">
              {inventory?.map((item, index) => {
                const stockStatus = getStockStatus(item)
                const { price, isPromo } = getDisplayPrice(item)
                const StockIcon = stockStatus.icon

                return (
                  <div
                    key={item.id}
                    className={`p-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      selectable ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => selectable && onItemSelect?.(item)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-sm">{item.name}</h3>
                            <p className="text-xs text-slate-500 mt-1">
                              SKU: {item.sku}
                              {item.barcode && ` | Barcode: ${item.barcode}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Tag className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500">{item.categoryName}</span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-lg">{formatCurrency(price, 'USD')}</span>
                              {isPromo && item.price && (
                                <span className="text-sm text-slate-500 line-through">
                                  {formatCurrency(item.price, 'USD')}
                                </span>
                              )}
                              {isPromo && (
                                <Badge variant="destructive" className="text-xs">
                                  SALE
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <Badge className={`${stockStatus.color} border-0 text-xs`}>
                                <StockIcon className="w-3 h-3 mr-1" />
                                {stockStatus.label}
                              </Badge>
                              <span className="text-sm text-slate-600">
                                {item.availableStock} available
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {inventory?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No Items Found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              No inventory items match your current filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}