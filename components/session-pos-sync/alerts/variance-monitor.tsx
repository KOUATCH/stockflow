"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface VarianceMonitorProps {
  terminalId: string
  sessionId: string
}

interface VarianceData {
  expectedBalance: number
  actualBalance: number
  variance: number
  variancePercentage: number
  lastCount: Date
  status: "normal" | "warning" | "critical"
  transactions: Array<{
    id: string
    amount: number
    type: "sale" | "return" | "adjustment"
    timestamp: Date
  }>
}

export function VarianceMonitor({ terminalId, sessionId }: VarianceMonitorProps) {
  const [varianceData, setVarianceData] = useState<VarianceData>({
    expectedBalance: 850.0,
    actualBalance: 847.25,
    variance: -2.75,
    variancePercentage: -0.32,
    lastCount: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    status: "normal",
    transactions: [
      {
        id: "txn-1",
        amount: 45.99,
        type: "sale",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: "txn-2",
        amount: 23.5,
        type: "sale",
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        id: "txn-3",
        amount: -12.99,
        type: "return",
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
      },
    ],
  })

  const getVarianceStatus = (variance: number) => {
    const absVariance = Math.abs(variance)
    if (absVariance < 1) return "normal"
    if (absVariance < 5) return "warning"
    return "critical"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  useEffect(() => {
    const status = getVarianceStatus(varianceData.variance)
    setVarianceData((prev) => ({ ...prev, status }))
  }, [varianceData.variance])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Cash Variance Monitor
            <Badge className={getStatusColor(varianceData.status)}>{varianceData.status.toUpperCase()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Expected Balance</p>
              <p className="text-2xl font-bold text-gray-900">${varianceData.expectedBalance.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Actual Balance</p>
              <p className="text-2xl font-bold text-gray-900">${varianceData.actualBalance.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Variance</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(varianceData.status)}
                <span className={`font-bold ${varianceData.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {varianceData.variance >= 0 ? "+" : ""}${varianceData.variance.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  ({varianceData.variancePercentage >= 0 ? "+" : ""}
                  {varianceData.variancePercentage.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Variance Tolerance</span>
                <span>±$5.00</span>
              </div>
              <Progress value={Math.min(100, (Math.abs(varianceData.variance) / 5) * 100)} className="h-2" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">Last Count: {varianceData.lastCount.toLocaleString()}</div>
            <Button variant="outline" size="sm">
              Perform Count
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {varianceData.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {transaction.amount >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm capitalize">{transaction.type}</p>
                    <p className="text-xs text-gray-500">{transaction.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {transaction.amount >= 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
