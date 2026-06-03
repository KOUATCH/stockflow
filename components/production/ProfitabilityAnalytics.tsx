"use client"

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Clock,
  AlertTriangle,
  ChefHat,
  Calculator,
  Target,
  Factory,
  PieChart as PieChartIcon,
  Activity,
  Download,
  Filter,
  Calendar
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/types/production'
import type {
  ProfitabilityReport,
  ProductRevenue,
  RecipePerformance,
  ProductionAnalytics,
} from '@/types/production'

interface ProfitabilityAnalyticsProps {
  organizationId: string
}

interface AnalyticsFilters {
  dateFrom: Date
  dateTo: Date
  recipeId?: string
  locationId?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function ProfitabilityAnalytics({ organizationId }: ProfitabilityAnalyticsProps) {
  const [profitabilityData, setProfitabilityData] = useState<ProfitabilityReport | null>(null)
  const [analyticsData, setAnalyticsData] = useState<ProductionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)),
    dateTo: new Date(),
  })

  useEffect(() => {
    fetchAnalyticsData()
  }, [filters, organizationId])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [profitabilityResponse, analyticsResponse] = await Promise.all([
        fetch('/api/production/profitability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId,
            ...filters,
          }),
        }),
        fetch('/api/production/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId,
            ...filters,
          }),
        }),
      ])

      if (!profitabilityResponse.ok || !analyticsResponse.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const [profitability, analytics] = await Promise.all([
        profitabilityResponse.json(),
        analyticsResponse.json(),
      ])

      setProfitabilityData(profitability)
      setAnalyticsData(analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      const response = await fetch('/api/production/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          ...filters,
          type: 'profitability',
        }),
      })

      if (!response.ok) throw new Error('Failed to generate report')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `profitability-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error generating report:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Factory className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading profitability analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !profitabilityData || !analyticsData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Failed to load analytics data'}</p>
            <Button onClick={fetchAnalyticsData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const revenueByProductData = profitabilityData.revenueByProduct.map(item => ({
    name: item.itemName.length > 15 ? item.itemName.substring(0, 15) + '...' : item.itemName,
    revenue: item.totalRevenue,
    profit: item.grossProfit,
    margin: item.marginPercentage,
  }))

  const costBredownData = [
    { name: 'Raw Materials', value: profitabilityData.rawMaterialCosts, color: '#0088FE' },
    { name: 'Labor', value: profitabilityData.laborCosts, color: '#00C49F' },
    { name: 'Overhead', value: profitabilityData.overheadCosts, color: '#FFBB28' },
    { name: 'Other', value: profitabilityData.otherCosts, color: '#FF8042' },
  ]

  const recipePerformanceData = analyticsData.recipePerformance.map(recipe => ({
    name: recipe.recipeName.length > 20 ? recipe.recipeName.substring(0, 20) + '...' : recipe.recipeName,
    batches: recipe.batchesProduced,
    units: recipe.totalUnitsProduced,
    cost: recipe.averageCostPerUnit,
    margin: recipe.marginPercentage,
    quality: recipe.averageQualityScore,
  }))

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profitability Analytics</h1>
          <p className="text-gray-600">Analyze production costs, margins, and profitability</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="dateFrom">From:</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom.toISOString().split('T')[0]}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: new Date(e.target.value) }))}
              className="w-auto"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="dateTo">To:</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo.toISOString().split('T')[0]}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: new Date(e.target.value) }))}
              className="w-auto"
            />
          </div>

          <Button onClick={generateReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitabilityData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatPercentage(12.5)} from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitabilityData.grossProfit)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(profitabilityData.grossMargin)} margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Efficiency</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(profitabilityData.productionEfficiency)}</div>
            <Progress value={profitabilityData.productionEfficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Produced</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitabilityData.totalUnitsProduced.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {profitabilityData.totalUnitsSold.toLocaleString()} sold
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="recipes">Recipe Analysis</TabsTrigger>
          <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Profit Trends</CardTitle>
                <CardDescription>Revenue and profit performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueByProductData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="profit" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
                <CardDescription>Breakdown of production costs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBredownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBredownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Production Metrics Summary</CardTitle>
              <CardDescription>Key performance indicators for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analyticsData.totalBatches}</div>
                  <p className="text-sm text-gray-600">Total Batches</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatPercentage(analyticsData.averageYieldPercentage)}</div>
                  <p className="text-sm text-gray-600">Avg Yield</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{formatPercentage(analyticsData.capacityUtilization)}</div>
                  <p className="text-sm text-gray-600">Capacity Used</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analyticsData.averageQualityScore.toFixed(1)}/10</div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Revenue Performance</CardTitle>
              <CardDescription>Revenue and profitability by product</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueByProductData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar yAxisId="left" dataKey="profit" fill="#82ca9d" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Performance Table</CardTitle>
              <CardDescription>Detailed breakdown of product performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg Price</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitabilityData.revenueByProduct.map((product) => (
                    <TableRow key={product.itemId}>
                      <TableCell className="font-medium">{product.itemName}</TableCell>
                      <TableCell>{product.unitsSold.toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(product.totalRevenue)}</TableCell>
                      <TableCell>{formatCurrency(product.averageSellingPrice)}</TableCell>
                      <TableCell>{formatCurrency(product.grossProfit)}</TableCell>
                      <TableCell>
                        <Badge variant={product.marginPercentage > 30 ? "default" : product.marginPercentage > 15 ? "secondary" : "destructive"}>
                          {formatPercentage(product.marginPercentage)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recipe Performance Analysis</CardTitle>
              <CardDescription>Production efficiency and profitability by recipe</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={recipePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="batches" fill="#8884d8" name="Batches Produced" />
                  <Bar dataKey="margin" fill="#82ca9d" name="Margin %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recipe Performance Details</CardTitle>
              <CardDescription>Comprehensive analysis of recipe efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipe</TableHead>
                    <TableHead>Batches</TableHead>
                    <TableHead>Units Produced</TableHead>
                    <TableHead>Avg Cost/Unit</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Quality Score</TableHead>
                    <TableHead>Profitability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData.recipePerformance.map((recipe) => (
                    <TableRow key={recipe.recipeId}>
                      <TableCell className="font-medium">{recipe.recipeName}</TableCell>
                      <TableCell>{recipe.batchesProduced}</TableCell>
                      <TableCell>{recipe.totalUnitsProduced.toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(recipe.averageCostPerUnit)}</TableCell>
                      <TableCell>
                        <Badge variant={recipe.marginPercentage > 30 ? "default" : recipe.marginPercentage > 15 ? "secondary" : "destructive"}>
                          {formatPercentage(recipe.marginPercentage)}
                        </Badge>
                      </TableCell>
                      <TableCell>{recipe.averageQualityScore.toFixed(1)}/10</TableCell>
                      <TableCell>{formatCurrency(recipe.profitability)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Detailed cost analysis by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costBredownData.map((cost, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: cost.color }} />
                        <span className="font-medium">{cost.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(cost.value)}</div>
                        <div className="text-sm text-gray-500">
                          {formatPercentage((cost.value / profitabilityData.totalCosts) * 100)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Waste Analysis</CardTitle>
                <CardDescription>Production waste tracking and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{formatPercentage(analyticsData.wastePercentage)}</div>
                    <p className="text-sm text-gray-600">Total Waste</p>
                  </div>

                  <div className="space-y-2">
                    {analyticsData.wasteByReason.map((waste, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{waste.reason}</span>
                        <div className="text-right">
                          <div className="font-medium">{waste.amount.toFixed(2)} kg</div>
                          <div className="text-xs text-gray-500">{formatPercentage(waste.percentage)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Unit Economics</CardTitle>
              <CardDescription>Cost and profitability per unit analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(profitabilityData.averageSellingPrice)}</div>
                  <p className="text-sm text-gray-600">Avg Selling Price</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(profitabilityData.averageCostPerUnit)}</div>
                  <p className="text-sm text-gray-600">Avg Cost per Unit</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(profitabilityData.averageProfitPerUnit)}</div>
                  <p className="text-sm text-gray-600">Avg Profit per Unit</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{formatPercentage(profitabilityData.averageMarginPerUnit)}</div>
                  <p className="text-sm text-gray-600">Avg Margin per Unit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}