"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRealTimeBalanceTracking } from "@/hooks/cashDrawer/use-real-time-tracking"
import { format } from "date-fns"
import { AlertTriangle, RefreshCw, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface VarianceDataPoint {
  timestamp: string
  variance: number
  currentBalance: number
  expectedBalance: number
}

interface VarianceMonitorProps {
  terminalId?: string
  sessionId?: string
  maxDataPoints?: number
}

export function VarianceMonitor({ terminalId, sessionId, maxDataPoints = 50 }: VarianceMonitorProps) {
  const [varianceHistory, setVarianceHistory] = useState<VarianceDataPoint[]>([])
  const [isRecording, setIsRecording] = useState(true)

  const { realTimeState, summary } = useRealTimeBalanceTracking(terminalId, sessionId, {
    pollingInterval: 15000, // More frequent updates for variance monitoring
  })

  // Record variance history
  useEffect(() => {
    if (summary && isRecording) {
      const newDataPoint: VarianceDataPoint = {
        timestamp: format(new Date(), "HH:mm:ss"),
        variance: summary.variance || 0,
        currentBalance: summary.currentBalance,
        expectedBalance: summary.currentBalance,
      }

      setVarianceHistory((prev) => {
        const updated = [...prev, newDataPoint]
        return updated.slice(-maxDataPoints) // Keep only the last N data points
      })
    }
  }, [summary, isRecording, maxDataPoints])

  const clearHistory = () => {
    setVarianceHistory([])
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const currentVariance = realTimeState.variance
  const absVariance = Math.abs(currentVariance)
  const variancePercentage = realTimeState.expectedBalance > 0 ? (absVariance / realTimeState.expectedBalance) * 100 : 0

  const getVarianceLevel = () => {
    if (absVariance < 1)
      return { level: "excellent", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" }
    if (absVariance < 5)
      return { level: "good", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" }
    if (absVariance < 10)
      return { level: "warning", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" }
    return { level: "critical", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" }
  }

  const varianceLevel = getVarianceLevel()

  return (
    <div className="space-y-4">
      {/* Current Variance Status */}
      <Card className={`${varianceLevel.bgColor} ${varianceLevel.borderColor}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${varianceLevel.color}`} />
              Variance Monitor
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRecording}
                className={isRecording ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
              <Button variant="outline" size="sm" onClick={clearHistory}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
          </div>
          <CardDescription>Real-time cash drawer variance monitoring and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${varianceLevel.color}`}>
                {currentVariance >= 0 ? "+" : ""}${currentVariance.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Current Variance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${realTimeState.currentBalance.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Current Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">${realTimeState.expectedBalance.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Expected Balance</div>
            </div>
          </div>

          {/* Variance Level Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                Variance Level:{" "}
                <span className={`font-medium ${varianceLevel.color}`}>{varianceLevel.level.toUpperCase()}</span>
              </span>
              <span className={varianceLevel.color}>{variancePercentage.toFixed(1)}% of expected</span>
            </div>
            <Progress
              value={Math.min(variancePercentage * 2, 100)} // Scale for better visualization
              className="h-3"
            />
          </div>

          {/* Variance Alerts */}
          {absVariance > 5 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>High Variance Detected:</strong> The cash drawer variance of ${currentVariance.toFixed(2)}
                exceeds the recommended threshold. Please verify cash counts and recent transactions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Variance History Chart */}
      {varianceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Variance Trend
            </CardTitle>
            <CardDescription>Historical variance data over time ({varianceHistory.length} data points)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={varianceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`,
                    name === "variance"
                      ? "Variance"
                      : name === "currentBalance"
                        ? "Current Balance"
                        : "Expected Balance",
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="variance"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                  name="variance"
                />
                <Line
                  type="monotone"
                  dataKey="currentBalance"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="currentBalance"
                />
                <Line
                  type="monotone"
                  dataKey="expectedBalance"
                  stroke="#6b7280"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="expectedBalance"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
