"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign, RotateCcw, Download } from "lucide-react"

const inventoryValueData = [
  { date: "2024-01-01", value: 245000, cost: 180000 },
  { date: "2024-01-02", value: 248000, cost: 182000 },
  { date: "2024-01-03", value: 251000, cost: 184000 },
  { date: "2024-01-04", value: 247000, cost: 181000 },
  { date: "2024-01-05", value: 253000, cost: 186000 },
  { date: "2024-01-06", value: 256000, cost: 188000 },
  { date: "2024-01-07", value: 259000, cost: 190000 },
  { date: "2024-01-08", value: 262000, cost: 192000 },
  { date: "2024-01-09", value: 258000, cost: 189000 },
  { date: "2024-01-10", value: 264000, cost: 194000 },
  { date: "2024-01-11", value: 267000, cost: 196000 },
  { date: "2024-01-12", value: 270000, cost: 198000 },
  { date: "2024-01-13", value: 273000, cost: 200000 },
  { date: "2024-01-14", value: 276000, cost: 202000 },
  { date: "2024-01-15", value: 279000, cost: 204000 },
]

const categoryInventory = [
  { name: "Smartphones", value: 125000, cost: 89000, units: 245, turnover: 8.5 },
  { name: "Laptops", value: 89000, cost: 67000, units: 67, turnover: 4.2 },
  { name: "Audio", value: 34000, cost: 25000, units: 156, turnover: 12.3 },
  { name: "Accessories", value: 18000, cost: 13000, units: 312, turnover: 15.7 },
  { name: "Tablets", value: 13000, cost: 10000, units: 45, turnover: 6.8 },
]

const lowStockItems = [
  { name: "iPhone 15 Pro 256GB", sku: "IPH15P-256", current: 5, min: 10, max: 50, value: 5495, status: "critical" },
  { name: "Samsung Galaxy S24", sku: "SGS24-128", current: 8, min: 15, max: 60, value: 6392, status: "low" },
  { name: "MacBook Air M3", sku: "MBA-M3-512", current: 12, min: 20, max: 40, value: 16788, status: "low" },
  { name: "AirPods Pro 3rd Gen", sku: "APP-GEN3", current: 3, min: 25, max: 100, value: 747, status: "critical" },
  { name: "iPad Air 11-inch", sku: "IPA-AIR-11", current: 7, min: 15, max: 50, value: 4193, status: "low" },
]

const movementData = [
  { date: "2024-01-01", inbound: 45, outbound: 38, adjustments: 2 },
  { date: "2024-01-02", inbound: 52, outbound: 44, adjustments: 1 },
  { date: "2024-01-03", inbound: 67, outbound: 58, adjustments: 3 },
  { date: "2024-01-04", inbound: 48, outbound: 41, adjustments: 0 },
  { date: "2024-01-05", inbound: 78, outbound: 65, adjustments: 2 },
  { date: "2024-01-06", inbound: 71, outbound: 59, adjustments: 1 },
  { date: "2024-01-07", inbound: 55, outbound: 47, adjustments: 4 },
]

export function InventoryReports() {
  const [dateRange, setDateRange] = useState("30d")
  const [locationFilter, setLocationFilter] = useState("all")

  const totalValue = inventoryValueData[inventoryValueData.length - 1]?.value || 0
  const totalCost = inventoryValueData[inventoryValueData.length - 1]?.cost || 0
  const totalUnits = categoryInventory.reduce((sum, cat) => sum + cat.units, 0)
  const avgTurnover = categoryInventory.reduce((sum, cat) => sum + cat.turnover, 0) / categoryInventory.length

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { label: "Out of Stock", variant: "destructive", color: "bg-destructive" }
    if (current <= min * 0.5) return { label: "Critical", variant: "destructive", color: "bg-destructive" }
    if (current <= min) return { label: "Low Stock", variant: "secondary", color: "bg-chart-4" }
    return { label: "Normal", variant: "default", color: "bg-primary" }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Inventory Reports</h1>
          <p className="text-muted-foreground">Comprehensive inventory analysis and valuation reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="main">Main Warehouse</SelectItem>
              <SelectItem value="store">Store Front</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${totalValue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">+5.2%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Units</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalUnits.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
              <span className="text-destructive">-2.1%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Avg Turnover Rate</CardTitle>
            <RotateCcw className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{avgTurnover.toFixed(1)}x</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">+8.3%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="valuation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="movement">Movement</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="valuation" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Inventory Value Trend</CardTitle>
              <CardDescription>Total inventory value and cost over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Market Value",
                    color: "hsl(var(--chart-1))",
                  },
                  cost: {
                    label: "Cost Value",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inventoryValueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => [
                        `$${value.toLocaleString()}`,
                        name === "value" ? "Market Value" : "Cost Value",
                      ]}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-1))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-2))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movement" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Inventory Movement</CardTitle>
              <CardDescription>Daily inbound, outbound, and adjustment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  inbound: {
                    label: "Inbound",
                    color: "hsl(var(--chart-1))",
                  },
                  outbound: {
                    label: "Outbound",
                    color: "hsl(var(--chart-2))",
                  },
                  adjustments: {
                    label: "Adjustments",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={movementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="inbound" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="outbound" fill="hsl(var(--chart-2))" />
                    <Bar dataKey="adjustments" fill="hsl(var(--chart-3))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Category Performance</CardTitle>
              <CardDescription>Inventory value, units, and turnover by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryInventory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-card-foreground">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.units} units</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-right">
                      <div>
                        <div className="text-sm text-muted-foreground">Value</div>
                        <div className="font-bold text-primary">${category.value.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Cost</div>
                        <div className="font-medium text-card-foreground">${category.cost.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Turnover</div>
                        <div className="font-medium text-card-foreground">{category.turnover}x</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <AlertTriangle className="h-5 w-5 text-chart-4" />
                Stock Level Alerts
              </CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Value at Risk</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.map((item, index) => {
                    const stockStatus = getStockStatus(item.current, item.min)
                    const stockPercentage = (item.current / item.max) * 100

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-card-foreground">{item.name}</div>
                            <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-card-foreground">
                                {item.current} / {item.max}
                              </span>
                            </div>
                            <Progress value={stockPercentage} className="h-2" />
                            <div className="text-xs text-muted-foreground">Min: {item.min} units</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-card-foreground">${item.value.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant as any}>{stockStatus.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Reorder
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
