"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInventoryTransactions, useStockMovementSummary } from "@/hooks/useInventoryMovementQueries"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { useOrgItemsNew } from "@/hooks/useAllItemQueries"
import { formatCurrency } from "@/lib/utils"
import type { TransactionType } from "@/types/inventoryMovementTypes"
import { Activity, ArrowDown, ArrowUp, BarChart3, RefreshCw, TrendingDown, TrendingUp } from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useState } from "react"
import { format } from "date-fns"

const transactionTypeConfig = {
  INBOUND: {
    icon: <ArrowDown className="h-3 w-3" />,
    color: "bg-green-100 text-green-800",
    label: "Inbound",
    description: "Goods received",
  },
  OUTBOUND: {
    icon: <ArrowUp className="h-3 w-3" />,
    color: "bg-red-100 text-red-800",
    label: "Outbound",
    description: "Sales/consumption",
  },
  TRANSFER_IN: {
    icon: <ArrowDown className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-800",
    label: "Transfer In",
    description: "Received from transfer",
  },
  TRANSFER_OUT: {
    icon: <ArrowUp className="h-3 w-3" />,
    color: "bg-orange-100 text-orange-800",
    label: "Transfer Out",
    description: "Sent via transfer",
  },
  ADJUSTMENT_IN: {
    icon: <ArrowDown className="h-3 w-3" />,
    color: "bg-purple-100 text-purple-800",
    label: "Adjustment In",
    description: "Positive adjustment",
  },
  ADJUSTMENT_OUT: {
    icon: <ArrowUp className="h-3 w-3" />,
    color: "bg-yellow-100 text-yellow-800",
    label: "Adjustment Out",
    description: "Negative adjustment",
  },
  RESERVED: {
    icon: <RefreshCw className="h-3 w-3" />,
    color: "bg-indigo-100 text-indigo-800",
    label: "Reserved",
    description: "Reserved for orders",
  },
  UNRESERVED: {
    icon: <RefreshCw className="h-3 w-3" />,
    color: "bg-gray-100 text-gray-800",
    label: "Unreserved",
    description: "Released from reservation",
  },
  DAMAGED: {
    icon: <ArrowUp className="h-3 w-3" />,
    color: "bg-red-100 text-red-800",
    label: "Damaged",
    description: "Damaged goods",
  },
  EXPIRED: {
    icon: <ArrowUp className="h-3 w-3" />,
    color: "bg-red-100 text-red-800",
    label: "Expired",
    description: "Expired items",
  },
  THEFT: {
    icon: <ArrowUp className="h-3 w-3" />,
    color: "bg-red-100 text-red-800",
    label: "Theft",
    description: "Theft/loss",
  },
  CORRECTION: {
    icon: <RefreshCw className="h-3 w-3" />,
    color: "bg-gray-100 text-gray-800",
    label: "Correction",
    description: "Correction entry",
  },
}

type StockMovementTransactionRow = {
  id: string
  type: string
  quantity: number
  reservedQuantity?: number
  unitPrice: number
  totalValue: number
  reference?: string | null
  referenceNumber?: string | null
  notes?: string | null
  createdAt: Date | string
  item: {
    name: string
    sku: string
  }
  location?: {
    name?: string | null
  } | null
}

export function StockMovementDashboard() {
  const { organizationId } = useClientAuth()
  const orgId = organizationId || ""

  const [selectedItem, setSelectedItem] = useState<string>("all")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<TransactionType | "all">("all")
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)

  // Fetch data
  const { data: transactions, isLoading: transactionsLoading } = useInventoryTransactions(orgId, {
    itemId: selectedItem === "all" ? undefined : selectedItem,
    locationId: selectedLocation === "all" ? undefined : selectedLocation,
    type: selectedType === "all" ? undefined : selectedType,
    dateFrom: dateFrom?.toISOString().split('T')[0] || undefined,
    dateTo: dateTo?.toISOString().split('T')[0] || undefined,
    limit: 100,
  })

  const { data: summary, isLoading: summaryLoading } = useStockMovementSummary(orgId, {
    itemId: selectedItem === "all" ? undefined : selectedItem,
    locationId: selectedLocation === "all" ? undefined : selectedLocation,
    dateFrom: dateFrom?.toISOString().split('T')[0] || undefined,
    dateTo: dateTo?.toISOString().split('T')[0] || undefined,
  })

  const { data: itemsResponse } = useOrgItemsNew(orgId, { enabled: !!orgId })
  const { data: locationsResponse } = useOrgLocationsNew(orgId, { enabled: !!orgId })

  const items = itemsResponse?.data || []
  const locations = locationsResponse?.data || []

  if (transactionsLoading || summaryLoading) {
    return <StockMovementLoadingSkeleton />
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
        <p className="text-muted-foreground mt-1">Track all inventory movements and transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inbound</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary?.totalInbound || 0}</div>
            <p className="text-xs text-muted-foreground">Items received</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outbound</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary?.totalOutbound || 0}</div>
            <p className="text-xs text-muted-foreground">Items consumed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Movement</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(summary?.netMovement || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {summary?.netMovement || 0}
            </div>
            <p className="text-xs text-muted-foreground">Net change</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value Change</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(summary?.valueChange || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(summary?.valueChange || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Net value change</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="analytics">Movement Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Stock Movement History
              </CardTitle>
              <CardDescription>View detailed history of all inventory movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as TransactionType | "all")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(transactionTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {config.icon}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DatePicker
                  date={dateFrom}
                  onDateChange={setDateFrom}
                  placeholder="From Date"
                  maxDate={dateTo || new Date()}
                />

                <DatePicker
                  date={dateTo}
                  onDateChange={setDateTo}
                  placeholder="To Date"
                  minDate={dateFrom}
                  maxDate={new Date()}
                />
              </div>

              {/* Transactions Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-center">Reserved</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!transactions || transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-lg font-medium">No transactions found</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedItem !== "all" ||
                            selectedLocation !== "all" ||
                            selectedType !== "all" ||
                            dateFrom ||
                            dateTo
                              ? "Try adjusting your filters"
                              : "No inventory movements recorded yet"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction: StockMovementTransactionRow) => {
                        const typeConfig = transactionTypeConfig[transaction.type as keyof typeof transactionTypeConfig]
                        const isInbound = ["INBOUND", "TRANSFER_IN", "ADJUSTMENT_IN"].includes(transaction.type)
                        const reservedQuantity = transaction.reservedQuantity ?? 0

                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{format(new Date(transaction.createdAt), "MMM dd, yyyy")}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(transaction.createdAt), "HH:mm:ss")}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{transaction.item.name}</p>
                                <p className="text-sm text-muted-foreground">{transaction.item.sku}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{transaction.location?.name || "No Location"}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={`gap-1.5 ${typeConfig?.color || "bg-gray-100 text-gray-800"}`}>
                                {typeConfig?.icon}
                                {typeConfig?.label || transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {transaction.quantity > 0 && (
                                <span className={`font-medium ${isInbound ? "text-green-600" : "text-red-600"}`}>
                                  {isInbound ? "+" : "-"}
                                  {transaction.quantity}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {reservedQuantity > 0 && (
                                <span className="font-medium text-indigo-600">{reservedQuantity}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(transaction.unitPrice)}</TableCell>
                            <TableCell className="text-right">
                              <span className={`font-medium ${isInbound ? "text-green-600" : "text-red-600"}`}>
                                {isInbound ? "+" : "-"}
                                {formatCurrency(transaction.totalValue)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">{transaction.reference || "N/A"}</p>
                                {transaction.notes && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">{transaction.notes}</p>
                                )}
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Movement Trends
                </CardTitle>
                <CardDescription>Track movement patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium mt-4">Analytics Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    Detailed movement analytics and reporting features will be available here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Movement Velocity
                </CardTitle>
                <CardDescription>Monitor inventory turnover rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium mt-4">Velocity Metrics Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    Inventory velocity and turnover metrics will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const StockMovementLoadingSkeleton = () => (
  <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
)
