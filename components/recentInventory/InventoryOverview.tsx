"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ItemWithInventoryLevelsPayload } from '@/types/itemTypes'
import { AlertTriangle, BarChart3, CheckCircle, Clock, Download, Edit, Eye, Package, RefreshCw, Search, Trash2, TrendingUp, Upload, XCircle } from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface ItemManagementProps {
  initialItemData: ItemWithInventoryLevelsPayload[] | null;
}
const categoryData = [
  { name: 'Electronics', value: 450, color: '#3B82F6' },
  { name: 'Footwear', value: 280, color: '#10B981' },
  { name: 'Clothing', value: 320, color: '#F59E0B' },
  { name: 'Books', value: 150, color: '#EF4444' },
  { name: 'Home & Garden', value: 200, color: '#8B5CF6' },
]

const stockMovements = [
  { date: '2024-01-15', inbound: 120, outbound: 85 },
  { date: '2024-01-14', inbound: 95, outbound: 110 },
  { date: '2024-01-13', inbound: 150, outbound: 75 },
  { date: '2024-01-12', inbound: 80, outbound: 95 },
  { date: '2024-01-11', inbound: 110, outbound: 120 },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_stock':
      return 'bg-green-100 text-green-800'
    case 'low_stock':
      return 'bg-yellow-100 text-yellow-800'
    case 'out_of_stock':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'in_stock':
      return <CheckCircle className="h-3 w-3" />
    case 'low_stock':
      return <AlertTriangle className="h-3 w-3" />
    case 'out_of_stock':
      return <XCircle className="h-3 w-3" />
    default:
      return <Clock className="h-3 w-3" />
  }
}

export default function InventoryOverview({ initialItemData }: ItemManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredItems = initialItemData?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item?.category?.title === selectedCategory
    // const matchesStatus = selectedStatus === 'all' || item?.status === selectedStatus
    // return matchesSearch && matchesCategory && matchesStatus
  })

  const totalValue = initialItemData?.reduce((sum, item) => sum + item?.inventoryLevels[0]?.quantityOnHand * item?.sellingPrice, 0)
  // const lowStockCount = initialItemData?.filter(item => item.status === 'low_stock').length
  // const outOfStockCount = initialItemData?.filter(item => item.status === 'out_of_stock').length

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your inventory across all locations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          {/* <Link href="/dashboard/inventory/items/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </Link> */}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Items</p>
                <p className="text-3xl font-bold text-blue-900">{initialItemData?.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Active products</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Value</p>
                <p className="text-3xl font-bold text-green-900">${totalValue?.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Inventory worth</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Low Stock</p>
                {/* <p className="text-3xl font-bold text-yellow-900">{lowStockCount}</p> */}
                <p className="text-sm text-muted-foreground mt-1">Items need reorder</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 
        to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Out of Stock</p>
                {/* <p className="text-3xl font-bold text-red-900">{outOfStockCount}</p> */}
                <p className="text-sm text-muted-foreground mt-1">Items unavailable</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Stock Movements
            </CardTitle>
            <CardDescription>Daily inbound and outbound inventory movements</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockMovements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inbound" fill="#10B981" name="Inbound" />
                <Bar dataKey="outbound" fill="#EF4444" name="Outbound" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-600" />
              Inventory by Category
            </CardTitle>
            <CardDescription>Distribution of items across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>Manage your product inventory</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name or SKU..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Footwear">Footwear</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Books">Books</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No items found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Add your first inventory item to get started'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  initialItemData?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.sku}</p>
                          <p className="text-xs text-muted-foreground">{item?.brand?.brandName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item?.category?.title}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{item?.inventoryLevels[0]?.quantityOnHand} / {item?.maxStockLevel}</span>
                            <span className="text-muted-foreground">
                              {((item?.inventoryLevels[0]?.quantityOnHand) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={(item?.inventoryLevels[0]?.quantityOnHand / (item?.maxStockLevel ?? 1)) * 100}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            Min: {item?.maxStockLevel}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* <Badge className={`gap-1 ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.)}
                          {item.status.replace('_', ' ')}
                        </Badge> */}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.costPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item?.inventoryLevels[0]?.totalValue?.toFixed(2) ?? '0.00'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
