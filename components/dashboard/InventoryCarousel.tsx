"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Grid3X3,
  List,
  Layers,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  ExternalLink,
  Star,
  Zap,
  Clock,
  DollarSign,
  ShoppingCart
} from 'lucide-react'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  brand: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderLevel: number
  costPrice: number
  sellingPrice: number
  totalValue: number
  margin: number
  sales30d: number
  trend: 'up' | 'down' | 'stable'
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
  lastSold: Date
  lastRestocked: Date
  turnoverRate: number
  imageUrl?: string
  supplier: string
  location: string
  velocity: 'fast' | 'medium' | 'slow'
}

interface InventoryCarouselProps {
  items: InventoryItem[]
  isLoading?: boolean
  className?: string
}

type ViewMode = 'cards' | 'grid' | 'list' | 'analytics'
type SortField = 'name' | 'stock' | 'value' | 'sales' | 'margin' | 'turnover'
type SortOrder = 'asc' | 'desc'

// Enhanced mock inventory data
const generateInventoryItems = (count: number = 50): InventoryItem[] => {
  const categories = ['Electronics', 'Clothing', 'Books & Media', 'Home & Garden', 'Sports & Recreation', 'Health & Beauty', 'Automotive', 'Toys & Games']
  const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Microsoft', 'Canon', 'Dell', 'HP', 'LG', 'Philips', 'Bosch']
  const suppliers = ['Tech Distributors Inc', 'Fashion Hub Ltd', 'Global Electronics', 'Sports Zone', 'Beauty Supplies Co', 'Home Essentials']
  const locations = ['Main Warehouse', 'Store #001', 'Store #002', 'Store #003', 'Distribution Center']

  const products = [
    'iPhone 15 Pro Max', 'Samsung Galaxy S24', 'MacBook Pro M3', 'iPad Air', 'AirPods Pro',
    'Nike Air Max 270', 'Adidas Ultraboost 22', 'Under Armour Hoodie', 'Levi\'s Jeans', 'Ray-Ban Sunglasses',
    'Sony WH-1000XM5', 'Bose QuietComfort', 'Canon EOS R6', 'Nikon D850', 'GoPro Hero 11',
    'Dyson V15 Detect', 'KitchenAid Mixer', 'Instant Pot Duo', 'Philips Air Fryer', 'Ninja Blender',
    'PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Steam Deck', 'Gaming Headset',
    'Protein Powder', 'Vitamin D3', 'Face Moisturizer', 'Shampoo & Conditioner', 'Electric Toothbrush',
    'Car Phone Mount', 'Tire Pressure Gauge', 'Jump Starter', 'Car Vacuum', 'Dashboard Cam',
    'LEGO Creator Set', 'Barbie Dreamhouse', 'Hot Wheels Track', 'Monopoly Board Game', 'Puzzle 1000pc'
  ]

  return Array.from({ length: count }, (_, index) => {
    const product = products[index % products.length]
    const category = categories[index % categories.length]
    const brand = brands[index % brands.length]
    const costPrice = 20 + Math.random() * 500
    const margin = 20 + Math.random() * 50
    const sellingPrice = costPrice * (1 + margin / 100)
    const currentStock = Math.floor(Math.random() * 200)
    const minStock = Math.floor(5 + Math.random() * 20)
    const maxStock = Math.floor(100 + Math.random() * 300)
    const sales30d = Math.floor(Math.random() * 100)
    const turnoverRate = Math.random() * 10

    let status: InventoryItem['status'] = 'in_stock'
    if (currentStock === 0) status = 'out_of_stock'
    else if (currentStock <= minStock) status = 'low_stock'
    else if (currentStock >= maxStock * 0.9) status = 'overstock'

    let velocity: InventoryItem['velocity'] = 'medium'
    if (turnoverRate > 6) velocity = 'fast'
    else if (turnoverRate < 3) velocity = 'slow'

    return {
      id: `item-${index + 1}`,
      name: `${product} ${index > products.length ? `#${index}` : ''}`.trim(),
      sku: `SKU${String(index + 1).padStart(6, '0')}`,
      category,
      brand,
      currentStock,
      minStock,
      maxStock,
      reorderLevel: minStock + 5,
      costPrice,
      sellingPrice,
      totalValue: currentStock * costPrice,
      margin,
      sales30d,
      trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable',
      status,
      lastSold: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastRestocked: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
      turnoverRate,
      imageUrl: `https://images.unsplash.com/400x300/?${category.toLowerCase()}`,
      supplier: suppliers[index % suppliers.length],
      location: locations[index % locations.length],
      velocity
    }
  })
}

export default function InventoryCarousel({ items: propItems, isLoading = false, className = "" }: InventoryCarouselProps) {
  const [items] = useState<InventoryItem[]>(propItems.length > 0 ? propItems : generateInventoryItems(50))
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const carouselRef = useRef<HTMLDivElement>(null)
  const itemsPerView = viewMode === 'cards' ? 4 : viewMode === 'grid' ? 6 : 8

  // Filter and sort items
  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'stock':
          aValue = a.currentStock
          bValue = b.currentStock
          break
        case 'value':
          aValue = a.totalValue
          bValue = b.totalValue
          break
        case 'sales':
          aValue = a.sales30d
          bValue = b.sales30d
          break
        case 'margin':
          aValue = a.margin
          bValue = b.margin
          break
        case 'turnover':
          aValue = a.turnoverRate
          bValue = b.turnoverRate
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [items, searchQuery, filterCategory, filterStatus, sortField, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerView)
  const currentItems = filteredAndSortedItems.slice(currentPage * itemsPerView, (currentPage + 1) * itemsPerView)

  const nextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages)
  }

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'out_of_stock': return 'bg-red-100 text-red-800 border-red-200'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'overstock': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getVelocityColor = (velocity: InventoryItem['velocity']) => {
    switch (velocity) {
      case 'fast': return 'bg-green-100 text-green-800'
      case 'slow': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getTrendIcon = (trend: InventoryItem['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />
      default: return <BarChart3 className="h-3 w-3 text-gray-600" />
    }
  }

  const categories = [...new Set(items.map(item => item.category))]
  const statuses = ['in_stock', 'low_stock', 'out_of_stock', 'overstock']

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full mb-4 rounded-lg" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-2xl font-bold flex items-center">
            <Package className="h-6 w-6 mr-2 text-purple-600" />
            Inventory Overview
          </h3>
          <p className="text-muted-foreground">
            {filteredAndSortedItems.length} of {items.length} items • Page {currentPage + 1} of {totalPages}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg bg-white/70 backdrop-blur-sm text-sm w-48"
            />
          </div>

          {/* Category Filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40 bg-white/70 backdrop-blur-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 bg-white/70 backdrop-blur-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              <SelectItem value="overstock">Overstock</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
            <SelectTrigger className="w-32 bg-white/70 backdrop-blur-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="margin">Margin</SelectItem>
              <SelectItem value="turnover">Turnover</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-white/70 backdrop-blur-sm"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          {/* View Mode */}
          <div className="flex border rounded-lg bg-white/70 backdrop-blur-sm">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="border-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="border-0"
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="border-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('analytics')}
              className="border-0"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={prevPage}
          disabled={totalPages <= 1}
          className="bg-white/70 backdrop-blur-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
            const pageIndex = totalPages <= 5 ? index :
              currentPage < 3 ? index :
              currentPage > totalPages - 3 ? totalPages - 5 + index :
              currentPage - 2 + index

            return (
              <Button
                key={pageIndex}
                variant={currentPage === pageIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(pageIndex)}
                className="w-8 h-8 p-0 bg-white/70 backdrop-blur-sm"
              >
                {pageIndex + 1}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={totalPages <= 1}
          className="bg-white/70 backdrop-blur-sm"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Inventory Items Display */}
      <div ref={carouselRef} className="overflow-hidden">
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentItems.map((item) => (
              <Card key={item.id} className="group border-0 shadow-lg bg-white/70 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.sku} • {item.category}</p>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    </div>
                    <Badge className={`ml-2 text-xs ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Stock Level</span>
                      <span className="text-sm font-semibold">{formatNumber(item.currentStock)}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Min: {item.minStock}</span>
                        <span>Max: {item.maxStock}</span>
                      </div>
                      <Progress
                        value={(item.currentStock / item.maxStock) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Value</span>
                      <span className="text-sm font-semibold">{formatCurrency(item.totalValue)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">30d Sales</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(item.trend)}
                        <span className="text-sm font-semibold">{formatNumber(item.sales30d)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Margin</span>
                      <Badge variant="outline">{formatPercentage(item.margin)}</Badge>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Badge className={`text-xs ${getVelocityColor(item.velocity)}`}>
                        {item.velocity} moving
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {currentItems.map((item) => (
              <Card key={item.id} className="group border-0 shadow-md bg-white/70 backdrop-blur-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-xs truncate">{item.name}</h4>
                      <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                        {item.currentStock}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                    <div className="flex justify-between text-xs">
                      <span>{formatCurrency(item.totalValue)}</span>
                      <span className="flex items-center">
                        {getTrendIcon(item.trend)}
                        <span className="ml-1">{item.sales30d}</span>
                      </span>
                    </div>
                    <Progress value={(item.currentStock / item.maxStock) * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">SKU</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Stock</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Value</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Sales</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => (
                      <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50/50 ${index % 2 === 0 ? 'bg-white/30' : ''}`}>
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.brand}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-mono">{item.sku}</td>
                        <td className="p-4 text-sm">{item.category}</td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">{formatNumber(item.currentStock)}</p>
                            <Progress value={(item.currentStock / item.maxStock) * 100} className="h-1 w-16" />
                          </div>
                        </td>
                        <td className="p-4 text-sm font-semibold">{formatCurrency(item.totalValue)}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(item.trend)}
                            <span className="text-sm">{formatNumber(item.sales30d)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentItems.map((item) => (
              <Card key={item.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <Badge className={`text-xs ${getVelocityColor(item.velocity)}`}>
                        <Zap className="h-3 w-3 mr-1" />
                        {item.velocity}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Turnover</p>
                        <p className="text-lg font-bold">{item.turnoverRate.toFixed(1)}x</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Margin</p>
                        <p className="text-lg font-bold">{formatPercentage(item.margin)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Stock Health</span>
                        <span>{((item.currentStock / item.maxStock) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(item.currentStock / item.maxStock) * 100} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Value</p>
                        <p className="text-sm font-semibold">{formatCurrency(item.totalValue)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Sales</p>
                        <p className="text-sm font-semibold">{item.sales30d}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Stock</p>
                        <p className="text-sm font-semibold">{item.currentStock}</p>
                      </div>
                    </div>

                    <Badge className={`w-full justify-center text-xs ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{filteredAndSortedItems.length}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredAndSortedItems.filter(i => i.status === 'in_stock').length}
              </p>
              <p className="text-xs text-muted-foreground">In Stock</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {filteredAndSortedItems.filter(i => i.status === 'low_stock').length}
              </p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {filteredAndSortedItems.filter(i => i.status === 'out_of_stock').length}
              </p>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(filteredAndSortedItems.reduce((sum, i) => sum + i.totalValue, 0))}
              </p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">
                {formatPercentage(filteredAndSortedItems.reduce((sum, i) => sum + i.margin, 0) / filteredAndSortedItems.length)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Margin</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}