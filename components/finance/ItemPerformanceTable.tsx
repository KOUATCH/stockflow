"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Target,
  ArrowUpDown,
  Search,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Zap,
  Clock
} from "lucide-react"
import type { ItemPerformance } from "@/types/financialTypes"

interface ItemPerformanceTableProps {
  items: ItemPerformance[]
}

// Mock item performance data
const mockItemData: ItemPerformance[] = [
  {
    itemId: "item-1",
    itemName: "Premium Wireless Headphones",
    sku: "PWH-001",
    categoryId: "cat-1",
    categoryName: "Electronics",
    period: {
      id: "current",
      name: "Current Quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      isActive: true,
      isClosed: false
    },
    metrics: {
      totalSold: 485,
      totalRevenue: 72750.00,
      costOfGoodsSold: 29100.00,
      grossProfit: 43650.00,
      grossProfitMargin: 60.0,
      averageSellingPrice: 150.00,
      averageCostPrice: 60.00,
      turnoverRate: 8.5,
      daysToSell: 43,
      returnRate: 2.1,
      discountRate: 5.2
    },
    trends: {
      salesGrowth: 23.5,
      priceElasticity: 0.8,
      seasonality: { "Q1": 1.2, "Q2": 0.9, "Q3": 1.1, "Q4": 1.4 }
    },
    inventory: {
      currentStock: 125,
      averageStock: 180,
      stockValue: 7500.00,
      reorderPoint: 50,
      economicOrderQuantity: 200,
      carryingCost: 12.5
    }
  },
  {
    itemId: "item-2",
    itemName: "Smart Fitness Tracker",
    sku: "SFT-002",
    categoryId: "cat-1",
    categoryName: "Electronics",
    period: {
      id: "current",
      name: "Current Quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      isActive: true,
      isClosed: false
    },
    metrics: {
      totalSold: 342,
      totalRevenue: 51300.00,
      costOfGoodsSold: 20520.00,
      grossProfit: 30780.00,
      grossProfitMargin: 60.0,
      averageSellingPrice: 150.00,
      averageCostPrice: 60.00,
      turnoverRate: 12.2,
      daysToSell: 30,
      returnRate: 1.8,
      discountRate: 3.5
    },
    trends: {
      salesGrowth: 35.2,
      priceElasticity: 1.2,
      seasonality: { "Q1": 1.1, "Q2": 1.3, "Q3": 0.8, "Q4": 1.0 }
    },
    inventory: {
      currentStock: 89,
      averageStock: 120,
      stockValue: 5340.00,
      reorderPoint: 40,
      economicOrderQuantity: 150,
      carryingCost: 8.9
    }
  },
  {
    itemId: "item-3",
    itemName: "Ergonomic Office Chair",
    sku: "EOC-003",
    categoryId: "cat-2",
    categoryName: "Furniture",
    period: {
      id: "current",
      name: "Current Quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      isActive: true,
      isClosed: false
    },
    metrics: {
      totalSold: 156,
      totalRevenue: 62400.00,
      costOfGoodsSold: 31200.00,
      grossProfit: 31200.00,
      grossProfitMargin: 50.0,
      averageSellingPrice: 400.00,
      averageCostPrice: 200.00,
      turnoverRate: 4.2,
      daysToSell: 87,
      returnRate: 3.8,
      discountRate: 8.1
    },
    trends: {
      salesGrowth: -5.8,
      priceElasticity: 0.6,
      seasonality: { "Q1": 0.9, "Q2": 1.1, "Q3": 1.2, "Q4": 1.0 }
    },
    inventory: {
      currentStock: 45,
      averageStock: 65,
      stockValue: 9000.00,
      reorderPoint: 20,
      economicOrderQuantity: 80,
      carryingCost: 18.5
    }
  },
  {
    itemId: "item-4",
    itemName: "Organic Cotton T-Shirt",
    sku: "OCT-004",
    categoryId: "cat-3",
    categoryName: "Apparel",
    period: {
      id: "current",
      name: "Current Quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      isActive: true,
      isClosed: false
    },
    metrics: {
      totalSold: 1250,
      totalRevenue: 37500.00,
      costOfGoodsSold: 18750.00,
      grossProfit: 18750.00,
      grossProfitMargin: 50.0,
      averageSellingPrice: 30.00,
      averageCostPrice: 15.00,
      turnoverRate: 15.6,
      daysToSell: 23,
      returnRate: 4.2,
      discountRate: 12.5
    },
    trends: {
      salesGrowth: 18.9,
      priceElasticity: 1.5,
      seasonality: { "Q1": 0.8, "Q2": 1.2, "Q3": 1.4, "Q4": 0.9 }
    },
    inventory: {
      currentStock: 380,
      averageStock: 420,
      stockValue: 5700.00,
      reorderPoint: 150,
      economicOrderQuantity: 500,
      carryingCost: 6.8
    }
  },
  {
    itemId: "item-5",
    itemName: "Professional Coffee Machine",
    sku: "PCM-005",
    categoryId: "cat-4",
    categoryName: "Kitchen Appliances",
    period: {
      id: "current",
      name: "Current Quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      isActive: true,
      isClosed: false
    },
    metrics: {
      totalSold: 89,
      totalRevenue: 71200.00,
      costOfGoodsSold: 35600.00,
      grossProfit: 35600.00,
      grossProfitMargin: 50.0,
      averageSellingPrice: 800.00,
      averageCostPrice: 400.00,
      turnoverRate: 3.1,
      daysToSell: 118,
      returnRate: 1.2,
      discountRate: 2.8
    },
    trends: {
      salesGrowth: 42.7,
      priceElasticity: 0.4,
      seasonality: { "Q1": 1.3, "Q2": 0.8, "Q3": 0.9, "Q4": 1.2 }
    },
    inventory: {
      currentStock: 25,
      averageStock: 35,
      stockValue: 10000.00,
      reorderPoint: 10,
      economicOrderQuantity: 40,
      carryingCost: 28.5
    }
  }
]

export function ItemPerformanceTable({ items = mockItemData }: ItemPerformanceTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof ItemPerformance["metrics"]>("totalRevenue")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const { info, success } = useNotifications()

  const categories = Array.from(new Set(items.map(item => item.categoryName)))

  const filteredAndSortedItems = items
    .filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || item.categoryName === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const aValue = a.metrics[sortField] as number
      const bValue = b.metrics[sortField] as number

      if (sortDirection === "asc") {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

  const handleSort = (field: keyof ItemPerformance["metrics"]) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getPerformanceStatus = (margin: number) => {
    if (margin >= 60) return { status: "excellent", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" }
    if (margin >= 40) return { status: "good", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" }
    if (margin >= 20) return { status: "fair", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" }
    return { status: "poor", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" }
  }

  const getStockStatus = (current: number, reorder: number) => {
    if (current <= reorder) return { status: "low", icon: AlertTriangle, color: "text-red-600" }
    if (current <= reorder * 2) return { status: "medium", icon: AlertTriangle, color: "text-amber-600" }
    return { status: "good", icon: CheckCircle, color: "text-green-600" }
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (value < 0) return <TrendingDown className="h-3 w-3 text-red-600" />
    return <div className="h-3 w-3" />
  }

  const handleViewItem = (itemId: string) => {
    info("Item Details", `Opening detailed analysis for item ${itemId}`)
  }

  const handleExportData = () => {
    success("Export Started", "Item performance data is being prepared for download")
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-purple-200/60 dark:border-purple-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Product Performance Analysis
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Detailed product metrics and profitability insights
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Product</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent font-semibold"
                    onClick={() => handleSort("totalRevenue")}
                  >
                    Revenue
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent font-semibold"
                    onClick={() => handleSort("totalSold")}
                  >
                    Sold
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent font-semibold"
                    onClick={() => handleSort("grossProfitMargin")}
                  >
                    Margin
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent font-semibold"
                    onClick={() => handleSort("turnoverRate")}
                  >
                    Turnover
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Stock</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Growth</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedItems.map((item) => {
                const performance = getPerformanceStatus(item.metrics.grossProfitMargin)
                const stockStatus = getStockStatus(item.inventory.currentStock, item.inventory.reorderPoint)

                return (
                  <TableRow
                    key={item.itemId}
                    className="group border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.itemName}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="secondary" className="text-xs">
                            {item.sku}
                          </Badge>
                          <span className="text-slate-500 dark:text-slate-400">{item.categoryName}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(item.metrics.totalRevenue)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Avg: {formatCurrency(item.metrics.averageSellingPrice)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {item.metrics.totalSold.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${performance.color}`}>
                            {formatPercentage(item.metrics.grossProfitMargin)}
                          </span>
                          <Badge className={`${performance.bgColor} ${performance.color} border-0 text-xs`}>
                            {performance.status}
                          </Badge>
                        </div>
                        <Progress
                          value={Math.min(100, item.metrics.grossProfitMargin)}
                          className="h-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-blue-500" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {item.metrics.turnoverRate.toFixed(1)}x
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          {item.metrics.daysToSell} days
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <stockStatus.icon className={`h-3 w-3 ${stockStatus.color}`} />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {item.inventory.currentStock}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Reorder: {item.inventory.reorderPoint}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(item.trends.salesGrowth)}
                        <span className={`text-sm font-medium ${
                          item.trends.salesGrowth > 0 ? 'text-green-600' : item.trends.salesGrowth < 0 ? 'text-red-600' : 'text-slate-600'
                        }`}>
                          {item.trends.salesGrowth > 0 ? '+' : ''}{formatPercentage(item.trends.salesGrowth)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewItem(item.itemId)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Products Found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              No products match your current search and filter criteria.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}