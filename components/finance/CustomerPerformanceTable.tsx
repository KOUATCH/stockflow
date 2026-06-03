"use client"

import { useMemo } from "react"
import type { CellContext } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import {
  Users,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Eye,
  Download,
  Star,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import type { CustomerPerformance } from "@/types/financialTypes"

import {
  EnhancedDataTable,
  createTableConfig,
  createToolbarConfig,
  createTextFilter,
  createSelectFilter,
  type EnhancedColumnDef,
} from '@/components/ui/enhanced-data-table'

interface CustomerPerformanceTableProps {
  customers: CustomerPerformance[]
  loading?: boolean
  onViewCustomer?: (customerId: string) => void
  onExport?: (data: CustomerPerformance[], format: string) => void
}

type CustomerPerformanceCellContext = CellContext<CustomerPerformance, unknown>

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

export function CustomerPerformanceTable({
  customers = mockCustomerData,
  loading = false,
  onViewCustomer = (customerId: string) => console.log("View customer:", customerId),
  onExport = (data: CustomerPerformance[], format: string) => console.log("Export:", format, data)
}: CustomerPerformanceTableProps) {
  const { info, success } = useNotifications()

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

  const getRiskVariant = (risk: string) => {
    switch (risk) {
      case "low":
        return "default" as const
      case "medium":
        return "secondary" as const
      case "high":
        return "destructive" as const
      default:
        return "outline" as const
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

  const handleViewCustomer = (customer: CustomerPerformance) => {
    info("Customer Details", `Opening detailed analysis for ${customer.customerName}`)
    onViewCustomer(customer.customerId)
  }

  const handleExportData = (data: CustomerPerformance[], format: string) => {
    success("Export Started", `Customer performance data is being prepared for download as ${format}`)
    onExport(data, format)
  }

  const columns = useMemo<EnhancedColumnDef<CustomerPerformance>[]>(() => [
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }: CustomerPerformanceCellContext) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="font-semibold">{customer.customerName}</div>
            {customer.metrics.lifetimeValue > 400000 && (
              <span title="High Value Customer">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              </span>
            )}
          </div>
        );
      },
      options: {
        searchable: true,
        sortable: true,
        width: 200,
      },
    },
    {
      accessorKey: "metrics.totalRevenue",
      header: "Revenue",
      cell: ({ row }: CustomerPerformanceCellContext) => {
        const customer = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {formatCurrency(customer.metrics.totalRevenue)}
            </span>
            <span className="text-xs text-muted-foreground">
              Avg: {formatCurrency(customer.metrics.averageOrderValue)}
            </span>
          </div>
        );
      },
      options: {
        sortable: true,
        isNumeric: true,
        align: 'right',
        width: 140,
      },
    },
    {
      accessorKey: "metrics.totalOrders",
      header: "Orders",
      cell: ({ row }: CustomerPerformanceCellContext) => {
        const orders = row.original.metrics.totalOrders;
        return (
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{orders}</span>
          </div>
        );
      },
      options: {
        sortable: true,
        isNumeric: true,
        width: 100,
      },
    },
    {
      accessorKey: "metrics.grossProfitMargin",
      header: "Margin",
      cell: ({ row }: CustomerPerformanceCellContext) => {
        const customer = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {formatPercentage(customer.metrics.grossProfitMargin)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(customer.metrics.grossProfit)}
            </span>
          </div>
        );
      },
      options: {
        sortable: true,
        isNumeric: true,
        align: 'right',
        width: 120,
      },
    },
    {
      accessorKey: "metrics.lifetimeValue",
      header: "LTV",
      cell: ({ row }: CustomerPerformanceCellContext) => {
        const ltv = row.original.metrics.lifetimeValue;
        return (
          <div className="font-semibold">
            {formatCurrency(ltv)}
          </div>
        );
      },
      options: {
        sortable: true,
        isNumeric: true,
        align: 'right',
        width: 120,
      },
    },
    {
      accessorKey: "trends.revenueGrowth",
      header: "Growth",
      cell: ({ row }: CustomerPerformanceCellContext) => {
        const growth = row.original.trends.revenueGrowth;
        return (
          <div className="flex items-center gap-1">
            {getTrendIcon(growth)}
            <span className={`text-sm font-medium ${
              growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {growth > 0 ? '+' : ''}{formatPercentage(growth)}
            </span>
          </div>
        );
      },
      options: {
        sortable: true,
        isNumeric: true,
        width: 100,
      },
    },
    {
      accessorKey: "risk.creditRisk",
      header: "Risk",
      cell: ({ row }: CustomerPerformanceCellContext) => {
        const risk = row.original.risk.creditRisk;
        return (
          <Badge variant={getRiskVariant(risk)} className="flex items-center gap-1 w-fit">
            {getRiskIcon(risk)}
            <span className="capitalize">{risk}</span>
          </Badge>
        );
      },
      options: {
        filterable: true,
        width: 100,
      },
    },
  ], [formatCurrency, formatPercentage])

  const tableConfig = useMemo(() => createTableConfig({
    searchable: true,
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    paginated: true,
    showRowNumbers: false,
    stickyHeader: true,
    striped: true,
    hoverable: true,
  }), [])

  const toolbarConfig = useMemo(() => createToolbarConfig({
    title: "Customer Performance Analysis",
    description: "Detailed customer metrics and profitability analysis",
    actions: [
      {
        label: "Export",
        icon: <Download className="h-4 w-4" />,
        onClick: () => handleExportData(customers, 'xlsx'),
        variant: "outline",
      },
    ],
    bulkActions: [
      {
        label: "Export Selected",
        icon: <Download className="h-4 w-4" />,
        onClick: (selectedRows: CustomerPerformance[]) => handleExportData(selectedRows, 'csv'),
        variant: "outline",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (selectedRows: CustomerPerformance[]) => {
          selectedRows.forEach((customer) => onViewCustomer(customer.customerId));
        },
        variant: "outline",
      },
    ],
    filters: [
      createTextFilter("customerName", "Customer Name", "Search customers..."),
      createSelectFilter("risk.creditRisk", "Risk Level", [
        { label: "Low Risk", value: "low" },
        { label: "Medium Risk", value: "medium" },
        { label: "High Risk", value: "high" },
      ]),
      createSelectFilter("metrics.paymentHistory", "Payment History", [
        { label: "Excellent", value: "excellent" },
        { label: "Good", value: "good" },
        { label: "Poor", value: "poor" },
      ]),
    ],
    search: {
      enabled: true,
      placeholder: "Search customers...",
    },
    export: {
      enabled: true,
      formats: ["csv", "xlsx", "pdf"],
      filename: "customer-performance",
      customExporter: handleExportData,
    },
  }), [customers, onViewCustomer])

  // Summary stats
  const summary = useMemo(() => {
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.metrics.totalRevenue, 0)
    const totalOrders = customers.reduce((sum, customer) => sum + customer.metrics.totalOrders, 0)
    const avgMargin = customers.reduce((sum, customer) => sum + customer.metrics.grossProfitMargin, 0) / customers.length
    const highRiskCount = customers.filter(customer => customer.risk.creditRisk === 'high').length

    return {
      totalRevenue,
      totalOrders,
      avgMargin,
      highRiskCount,
      customerCount: customers.length,
    }
  }, [customers])

  return (
    <EnhancedDataTable
      data={customers}
      columns={columns}
      config={tableConfig}
      toolbar={toolbarConfig}
      loading={loading}
      onRowClick={handleViewCustomer}
      emptyStateConfig={{
        enabled: true,
        title: "No Customer Performance Data",
        description: "Customer performance metrics will appear here once data is available.",
        icon: <Users className="h-12 w-12 text-muted-foreground/50" />,
      }}
      loadingConfig={{
        enabled: true,
        skeletonRows: 8,
        loadingMessage: "Loading customer performance data...",
      }}
      customFooter={
        <div className="bg-gradient-to-r from-teal-50/50 to-cyan-50/50 dark:from-teal-900/10 dark:to-cyan-900/10 p-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-primary">{summary.customerCount}</div>
              <div className="text-xs text-muted-foreground">Total Customers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{formatCurrency(summary.totalRevenue)}</div>
              <div className="text-xs text-muted-foreground">Total Revenue</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600">{formatPercentage(summary.avgMargin)}</div>
              <div className="text-xs text-muted-foreground">Avg Margin</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">{summary.highRiskCount}</div>
              <div className="text-xs text-muted-foreground">High Risk</div>
            </div>
          </div>
        </div>
      }
      ariaLabel="Customer performance analysis table"
      ariaDescription="Table showing customer metrics, profitability analysis, and risk assessment"
    />
  )
}
