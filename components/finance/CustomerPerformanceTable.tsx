"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Target,
  ArrowUpDown,
  Search,
  Eye,
  Download,
  Star,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import type { CustomerPerformance } from "@/types/financialTypes"

interface CustomerPerformanceTableProps {
  customers: CustomerPerformance[]
}

// Mock customer performance data
const mockCustomerData: CustomerPerformance[] = [
  {
    customerId: "cust-1",
    customerName: "TechCorp Solutions",
    period: {
      id: "current",
      name: "Current Quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      isActive: true,
      isClosed: false
    },
    metrics: {
      totalOrders: 45,
      totalRevenue: 125420.50,
      averageOrderValue: 2787.12,
      totalItems: 1250,
      grossProfit: 85794.34,
      grossProfitMargin: 68.4,
      acquisitionCost: 245.50,
      lifetimeValue: 425600.00,
      returnRate: 2.1,
      paymentTermsCompliance: 98.5,
      creditUtilization: 45.2
    },
    trends: {
      revenueGrowth: 23.5,
      orderFrequency: 15.2,
      seasonality: { "Q1": 1.2, "Q2": 0.9, "Q3": 1.1, "Q4": 1.3 }
    },
    risk: {
      creditRisk: "low",
      churnProbability: 8.5,
      paymentHistory: "excellent"
    }
  },
  {
    customerId: "cust-2",
    customerName: "Global Retailers Inc",
    period: {
      id: "current",
      name: "Current Quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      isActive: true,
      isClosed: false
    },
    metrics: {
      totalOrders: 32,
      totalRevenue: 89650.25,
      averageOrderValue: 2801.57,
      totalItems: 890,
      grossProfit: 58172.66,
      grossProfitMargin: 64.9,
      acquisitionCost: 189.75,
      lifetimeValue: 312450.00,
      returnRate: 1.8,
      paymentTermsCompliance: 95.2,
      creditUtilization: 62.8
    },
    trends: {
      revenueGrowth: 18.7,
      orderFrequency: 12.8,
      seasonality: { "Q1": 1.1, "Q2": 1.0, "Q3": 0.9, "Q4": 1.2 }
    },
    risk: {
      creditRisk: "low",
      churnProbability: 12.3,
      paymentHistory: "good"
    }
  },
  {
    customerId: "cust-3",
    customerName: "Metro Distributors",
    period: {
      id: "current",
      name: "Current Quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      isActive: true,
      isClosed: false
    },
    metrics: {
      totalOrders: 28,
      totalRevenue: 67890.75,
      averageOrderValue: 2424.67,
      totalItems: 720,
      grossProfit: 42408.17,
      grossProfitMargin: 62.5,
      acquisitionCost: 298.25,
      lifetimeValue: 198750.00,
      returnRate: 4.2,
      paymentTermsCompliance: 87.5,
      creditUtilization: 78.9
    },
    trends: {
      revenueGrowth: -5.2,
      orderFrequency: 8.9,
      seasonality: { "Q1": 0.9, "Q2": 1.1, "Q3": 1.2, "Q4": 1.0 }
    },
    risk: {
      creditRisk: "medium",
      churnProbability: 28.7,
      paymentHistory: "good"
    }
  },
  {
    customerId: "cust-4",
    customerName: "Premium Outlets Ltd",
    period: {
      id: "current",
      name: "Current Quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      isActive: true,
      isClosed: false
    },
    metrics: {
      totalOrders: 52,
      totalRevenue: 156780.90,
      averageOrderValue: 3015.02,
      totalItems: 1580,
      grossProfit: 109746.63,
      grossProfitMargin: 70.0,
      acquisitionCost: 156.80,
      lifetimeValue: 598320.00,
      returnRate: 1.5,
      paymentTermsCompliance: 99.2,
      creditUtilization: 32.1
    },
    trends: {
      revenueGrowth: 31.8,
      orderFrequency: 18.6,
      seasonality: { "Q1": 1.3, "Q2": 0.8, "Q3": 1.0, "Q4": 1.4 }
    },
    risk: {
      creditRisk: "low",
      churnProbability: 4.2,
      paymentHistory: "excellent"
    }
  },
  {
    customerId: "cust-5",
    customerName: "Budget Superstore",
    period: {
      id: "current",
      name: "Current Quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      isActive: true,
      isClosed: false
    },
    metrics: {
      totalOrders: 18,
      totalRevenue: 34580.40,
      averageOrderValue: 1921.13,
      totalItems: 480,
      grossProfit: 18659.42,
      grossProfitMargin: 53.9,
      acquisitionCost: 425.60,
      lifetimeValue: 89450.00,
      returnRate: 6.8,
      paymentTermsCompliance: 78.3,
      creditUtilization: 89.5
    },
    trends: {
      revenueGrowth: -12.4,
      orderFrequency: 6.2,
      seasonality: { "Q1": 0.8, "Q2": 1.2, "Q3": 1.1, "Q4": 0.9 }
    },
    risk: {
      creditRisk: "high",
      churnProbability: 45.8,
      paymentHistory: "poor"
    }
  }
]

export function CustomerPerformanceTable({ customers = mockCustomerData }: CustomerPerformanceTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof CustomerPerformance["metrics"]>("totalRevenue")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const { info, success } = useNotifications()

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRisk = riskFilter === "all" || customer.risk.creditRisk === riskFilter
      return matchesSearch && matchesRisk
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

  const handleSort = (field: keyof CustomerPerformance["metrics"]) => {
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700"
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700"
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low":
        return <CheckCircle className="h-3 w-3" />
      case "medium":
        return <AlertTriangle className="h-3 w-3" />
      case "high":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <AlertTriangle className="h-3 w-3" />
    }
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (value < 0) return <TrendingDown className="h-3 w-3 text-red-600" />
    return <div className="h-3 w-3" />
  }

  const handleViewCustomer = (customerId: string) => {
    info("Customer Details", `Opening detailed analysis for customer ${customerId}`)
  }

  const handleExportData = () => {
    success("Export Started", "Customer performance data is being prepared for download")
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-b border-teal-200/60 dark:border-teal-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Customer Performance Analysis
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Detailed customer metrics and profitability analysis
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
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            />
          </div>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <SelectValue placeholder="All Risk Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Customer</TableHead>
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
                    onClick={() => handleSort("totalOrders")}
                  >
                    Orders
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
                    onClick={() => handleSort("lifetimeValue")}
                  >
                    LTV
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Growth</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Risk</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCustomers.map((customer) => (
                <TableRow
                  key={customer.customerId}
                  className="group border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {customer.customerName}
                        </div>
                        {customer.metrics.lifetimeValue > 400000 && (
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(customer.metrics.totalRevenue)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Avg: {formatCurrency(customer.metrics.averageOrderValue)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {customer.metrics.totalOrders}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatPercentage(customer.metrics.grossProfitMargin)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatCurrency(customer.metrics.grossProfit)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(customer.metrics.lifetimeValue)}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(customer.trends.revenueGrowth)}
                      <span className={`text-sm font-medium ${
                        customer.trends.revenueGrowth > 0 ? 'text-green-600' : customer.trends.revenueGrowth < 0 ? 'text-red-600' : 'text-slate-600'
                      }`}>
                        {customer.trends.revenueGrowth > 0 ? '+' : ''}{formatPercentage(customer.trends.revenueGrowth)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge className={getRiskColor(customer.risk.creditRisk)}>
                      {getRiskIcon(customer.risk.creditRisk)}
                      <span className="ml-1 capitalize">{customer.risk.creditRisk}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewCustomer(customer.customerId)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Customers Found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              No customers match your current search and filter criteria.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}