"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { DollarSign, TrendingUp, TrendingDown, PieChart, Download, Calculator, Target } from "lucide-react"

const profitLossData = [
  { month: "Jan", revenue: 125000, cogs: 75000, expenses: 25000, profit: 25000 },
  { month: "Feb", revenue: 132000, cogs: 79200, expenses: 26000, profit: 26800 },
  { month: "Mar", revenue: 145000, cogs: 87000, expenses: 28000, profit: 30000 },
  { month: "Apr", revenue: 138000, cogs: 82800, expenses: 27000, profit: 28200 },
  { month: "May", revenue: 156000, cogs: 93600, expenses: 29000, profit: 33400 },
  { month: "Jun", revenue: 162000, cogs: 97200, expenses: 30000, profit: 34800 },
  { month: "Jul", revenue: 148000, cogs: 88800, expenses: 28500, profit: 30700 },
  { month: "Aug", revenue: 171000, cogs: 102600, expenses: 31000, profit: 37400 },
  { month: "Sep", revenue: 165000, cogs: 99000, expenses: 30500, profit: 35500 },
  { month: "Oct", revenue: 178000, cogs: 106800, expenses: 32000, profit: 39200 },
  { month: "Nov", revenue: 185000, cogs: 111000, expenses: 33000, profit: 41000 },
  { month: "Dec", revenue: 192000, cogs: 115200, expenses: 34000, profit: 42800 },
]

const cashFlowData = [
  { month: "Jan", inflow: 125000, outflow: 100000, net: 25000 },
  { month: "Feb", inflow: 132000, outflow: 105200, net: 26800 },
  { month: "Mar", inflow: 145000, outflow: 115000, net: 30000 },
  { month: "Apr", inflow: 138000, outflow: 109800, net: 28200 },
  { month: "May", inflow: 156000, outflow: 122600, net: 33400 },
  { month: "Jun", inflow: 162000, outflow: 127200, net: 34800 },
  { month: "Jul", inflow: 148000, outflow: 117300, net: 30700 },
  { month: "Aug", inflow: 171000, outflow: 133600, net: 37400 },
  { month: "Sep", inflow: 165000, outflow: 129500, net: 35500 },
  { month: "Oct", inflow: 178000, outflow: 138800, net: 39200 },
  { month: "Nov", inflow: 185000, outflow: 144000, net: 41000 },
  { month: "Dec", inflow: 192000, outflow: 149200, net: 42800 },
]

const expenseBreakdown = [
  { category: "Cost of Goods Sold", amount: 1158000, percentage: 65.2, change: 2.3 },
  { category: "Salaries & Benefits", amount: 180000, percentage: 10.1, change: 5.1 },
  { category: "Rent & Utilities", amount: 96000, percentage: 5.4, change: 1.2 },
  { category: "Marketing", amount: 72000, percentage: 4.1, change: 12.8 },
  { category: "Technology", amount: 48000, percentage: 2.7, change: -3.2 },
  { category: "Insurance", amount: 36000, percentage: 2.0, change: 0.8 },
  { category: "Other", amount: 186000, percentage: 10.5, change: 4.7 },
]

const kpiData = [
  { metric: "Gross Profit Margin", current: 38.2, target: 40.0, previous: 36.8, unit: "%" },
  { metric: "Net Profit Margin", current: 22.1, target: 25.0, previous: 20.5, unit: "%" },
  { metric: "Return on Investment", current: 15.8, target: 18.0, previous: 14.2, unit: "%" },
  { metric: "Current Ratio", current: 2.4, target: 2.0, previous: 2.1, unit: "x" },
  { metric: "Inventory Turnover", current: 8.5, target: 10.0, previous: 7.8, unit: "x" },
  { metric: "Days Sales Outstanding", current: 28, target: 30, previous: 32, unit: "days" },
]

export function FinancialReports() {
  const [dateRange, setDateRange] = useState("12m")
  const [reportType, setReportType] = useState("monthly")

  const currentYear = profitLossData.reduce((sum, month) => sum + month.revenue, 0)
  const currentProfit = profitLossData.reduce((sum, month) => sum + month.profit, 0)
  const profitMargin = (currentProfit / currentYear) * 100
  const avgMonthlyGrowth = 5.2

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive financial analysis and business performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="2y">Last 2 years</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${currentYear.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">+{avgMonthlyGrowth}%</span>
              <span className="ml-1">from last year</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Net Profit</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${currentProfit.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">+8.2%</span>
              <span className="ml-1">from last year</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Profit Margin</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{profitMargin.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">+1.3%</span>
              <span className="ml-1">from last year</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Monthly Growth</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{avgMonthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">Average monthly growth</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profit-loss" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Profit & Loss Statement</CardTitle>
              <CardDescription>Monthly revenue, costs, and profit analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                  cogs: {
                    label: "Cost of Goods Sold",
                    color: "hsl(var(--chart-2))",
                  },
                  expenses: {
                    label: "Operating Expenses",
                    color: "hsl(var(--chart-3))",
                  },
                  profit: {
                    label: "Net Profit",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitLossData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="2"
                      stroke="hsl(var(--chart-4))"
                      fill="hsl(var(--chart-4))"
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Cash Flow Analysis</CardTitle>
              <CardDescription>Monthly cash inflows, outflows, and net cash flow</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  inflow: {
                    label: "Cash Inflow",
                    color: "hsl(var(--chart-1))",
                  },
                  outflow: {
                    label: "Cash Outflow",
                    color: "hsl(var(--chart-2))",
                  },
                  net: {
                    label: "Net Cash Flow",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="inflow" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="outflow" fill="hsl(var(--chart-2))" />
                    <Bar dataKey="net" fill="hsl(var(--chart-3))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Expense Breakdown</CardTitle>
              <CardDescription>Detailed analysis of business expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseBreakdown.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-card-foreground">{expense.category}</div>
                        <div className="text-sm text-muted-foreground">{expense.percentage}% of total expenses</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">${expense.amount.toLocaleString()}</div>
                      <div className="flex items-center text-sm">
                        {expense.change > 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-primary" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
                        )}
                        <span className={expense.change > 0 ? "text-primary" : "text-destructive"}>
                          {expense.change > 0 ? "+" : ""}
                          {expense.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Key Performance Indicators</CardTitle>
              <CardDescription>Critical financial metrics and performance targets</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpiData.map((kpi, index) => {
                    const isOnTarget = kpi.current >= kpi.target
                    const isImproving = kpi.current > kpi.previous

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium text-card-foreground">{kpi.metric}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-primary">
                            {kpi.current}
                            {kpi.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-card-foreground">
                            {kpi.target}
                            {kpi.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-muted-foreground">
                            {kpi.previous}
                            {kpi.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={isOnTarget ? "default" : "secondary"}>
                              {isOnTarget ? "On Target" : "Below Target"}
                            </Badge>
                            {isImproving ? (
                              <TrendingUp className="h-4 w-4 text-primary" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                          </div>
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
