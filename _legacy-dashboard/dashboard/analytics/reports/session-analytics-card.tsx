"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, ShoppingCart, Package, Clock, AlertTriangle, CheckCircle } from "lucide-react"

interface SessionAnalyticsProps {
  sessionData: {
    session: {
      id: string
      sessionNumber: string
      startTime: Date
      endTime: Date | null
      status: string
      cashierName: string
      terminalName: string
    }
    metrics: {
      totalSales: number
      totalTransactions: number
      averageTransaction: number
      totalItemsSold: number
      cashTotal: number
      cardTotal: number
      digitalTotal: number
      openingBalance: number
      closingBalance: number | null
      expectedBalance: number | null
      variance: number | null
      cashIn: number
      cashOut: number
    }
    topItems: Array<{
      itemId: string
      name: string
      sku: string
      quantity: number
      revenue: number
    }>
  }
  onReconcile?: (sessionId: string) => void
}

export function SessionAnalyticsCard({ sessionData, onReconcile }: SessionAnalyticsProps) {
  const { session, metrics, topItems } = sessionData

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const getVarianceStatus = (variance: number | null) => {
    if (variance === null) return { color: "text-muted-foreground", badge: "secondary", text: "Pending" }
    if (Math.abs(variance) <= 5) return { color: "text-green-600", badge: "default", text: "Good" }
    if (Math.abs(variance) <= 15) return { color: "text-yellow-600", badge: "secondary", text: "Acceptable" }
    return { color: "text-red-600", badge: "destructive", text: "High Variance" }
  }

  const varianceStatus = getVarianceStatus(metrics.variance)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{session.sessionNumber}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {session.terminalName} • {session.cashierName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : "Active"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={session.status === "ACTIVE" ? "default" : "secondary"}>{session.status}</Badge>
            {session.status === "SUSPENDED" && onReconcile && (
              <Button size="sm" onClick={() => onReconcile(session.id)}>
                Reconcile
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold">{formatCurrency(metrics.totalSales)}</div>
            <div className="text-xs text-muted-foreground">Total Sales</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold">{metrics.totalTransactions}</div>
            <div className="text-xs text-muted-foreground">Transactions</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold">{metrics.totalItemsSold}</div>
            <div className="text-xs text-muted-foreground">Items Sold</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-xl font-bold">{formatCurrency(metrics.averageTransaction)}</div>
            <div className="text-xs text-muted-foreground">Avg Transaction</div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h4 className="text-sm font-medium mb-3">Payment Methods</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{formatCurrency(metrics.cashTotal)}</div>
              <div className="text-xs text-muted-foreground">Cash</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{formatCurrency(metrics.cardTotal)}</div>
              <div className="text-xs text-muted-foreground">Card</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{formatCurrency(metrics.digitalTotal)}</div>
              <div className="text-xs text-muted-foreground">Digital</div>
            </div>
          </div>
        </div>

        {/* Cash Drawer Status */}
        <div>
          <h4 className="text-sm font-medium mb-3">Cash Drawer</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Opening Balance</span>
              <span className="font-medium">{formatCurrency(metrics.openingBalance)}</span>
            </div>

            {metrics.expectedBalance !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expected Balance</span>
                <span className="font-medium">{formatCurrency(metrics.expectedBalance)}</span>
              </div>
            )}

            {metrics.closingBalance !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Actual Balance</span>
                <span className="font-medium">{formatCurrency(metrics.closingBalance)}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Variance</span>
              <div className="flex items-center gap-2">
                {metrics.variance !== null ? (
                  <>
                    {Math.abs(metrics.variance) <= 5 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className={`font-medium ${varianceStatus.color}`}>
                      {formatCurrency(Math.abs(metrics.variance))}
                    </span>
                    <Badge variant={varianceStatus.badge as any} className="text-xs">
                      {varianceStatus.text}
                    </Badge>
                  </>
                ) : (
                  <span className="text-muted-foreground">Pending</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Items */}
        {topItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Top Selling Items</h4>
            <div className="space-y-2">
              {topItems.slice(0, 3).map((item, index) => (
                <div key={item.itemId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(item.revenue)}</div>
                    <div className="text-xs text-muted-foreground">{item.quantity} sold</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
