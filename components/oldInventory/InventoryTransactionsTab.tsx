"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInventoryTransactions } from "@/hooks/useInventoryQueries"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Activity, ArrowDown, ArrowUp, Package, RefreshCw } from "lucide-react"

interface InventoryTransactionsTabProps {
  organizationId: string
}

const transactionTypeConfig = {
  INBOUND: {
    icon: <ArrowDown className="h-3 w-3" />,
    color: "bg-green-100 text-green-800",
    label: "Inbound",
  },
  OUTBOUND: {
    icon: <ArrowUp className="h-3 w-3" />,
    color: "bg-red-100 text-red-800",
    label: "Outbound",
  },
  ADJUSTMENT_IN: {
    icon: <ArrowDown className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-800",
    label: "Adjustment In",
  },
  ADJUSTMENT_OUT: {
    icon: <ArrowUp className="h-3 w-3" />,
    color: "bg-orange-100 text-orange-800",
    label: "Adjustment Out",
  },
  TRANSFER_IN: {
    icon: <RefreshCw className="h-3 w-3" />,
    color: "bg-purple-100 text-purple-800",
    label: "Transfer In",
  },
  TRANSFER_OUT: {
    icon: <RefreshCw className="h-3 w-3" />,
    color: "bg-purple-100 text-purple-800",
    label: "Transfer Out",
  },
}

export function InventoryTransactionsTab({ organizationId }: InventoryTransactionsTabProps) {
  const { data: transactions, isLoading, error } = useInventoryTransactions(organizationId)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Latest inventory movements and adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-medium">Error Loading Transactions</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Latest inventory movements and adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Transactions Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Inventory transactions will appear here as items are received, adjusted, or transferred.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Transactions
          <Badge variant="secondary">{transactions.length} transactions</Badge>
        </CardTitle>
        <CardDescription>Latest inventory movements and adjustments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const typeConfig = transactionTypeConfig[transaction.type as keyof typeof transactionTypeConfig]
                const isInbound = transaction.type.includes("IN") || transaction.type === "INBOUND"

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
                      <span className="text-sm">{transaction.location.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1.5 ${typeConfig?.color || "bg-gray-100 text-gray-800"}`}>
                        {typeConfig?.icon}
                        {typeConfig?.label || transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-medium ${isInbound ? "text-green-600" : "text-red-600"}`}>
                        {isInbound ? "+" : "-"}
                        {transaction.quantity}
                      </span>
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
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
