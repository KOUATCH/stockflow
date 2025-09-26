"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Clock,
  Eye,
  X
} from "lucide-react"
import type { FinancialAlert } from "@/types/financialTypes"

interface FinancialAlertsPanelProps {
  alerts: FinancialAlert[]
}

// Mock alerts data
const mockAlerts: FinancialAlert[] = [
  {
    id: "alert-1",
    type: "cashflow",
    severity: "high",
    title: "Cash Flow Warning",
    description: "Cash flow is projected to turn negative in 45 days based on current trends.",
    value: -15420,
    threshold: 0,
    metric: "Net Cash Flow",
    recommendations: [
      "Accelerate accounts receivable collection",
      "Negotiate extended payment terms with suppliers",
      "Consider short-term financing options"
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: "alert-2",
    type: "profitability",
    severity: "medium",
    title: "Margin Decline",
    description: "Gross profit margin has decreased by 3.2% over the last quarter.",
    value: 65.3,
    threshold: 68.5,
    metric: "Gross Profit Margin",
    recommendations: [
      "Review pricing strategy for key products",
      "Analyze cost structure for optimization opportunities",
      "Focus on higher-margin product categories"
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: "alert-3",
    type: "expense",
    severity: "low",
    title: "Operating Expense Increase",
    description: "Monthly operating expenses increased by 8% compared to budget.",
    value: 32500,
    threshold: 30000,
    metric: "Operating Expenses",
    recommendations: [
      "Review discretionary spending categories",
      "Evaluate vendor contracts for cost savings",
      "Implement expense approval workflow"
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: "alert-4",
    type: "kpi",
    severity: "critical",
    title: "Customer Acquisition Cost Rising",
    description: "CAC has increased 45% while customer lifetime value remains flat.",
    value: 145,
    threshold: 100,
    metric: "Customer Acquisition Cost",
    recommendations: [
      "Optimize marketing channel mix",
      "Improve conversion rates",
      "Focus on retention to increase LTV"
    ],
    isActive: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
]

export function FinancialAlertsPanel({ alerts = mockAlerts }: FinancialAlertsPanelProps) {
  const { info, warning, success } = useNotifications()

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4" />
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <Info className="h-4 w-4" />
      case "low":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700"
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700"
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700"
      case "low":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cashflow":
        return <DollarSign className="h-4 w-4" />
      case "profitability":
        return <TrendingUp className="h-4 w-4" />
      case "expense":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const formatValue = (value: number, metric: string) => {
    if (metric.toLowerCase().includes("margin") || metric.toLowerCase().includes("rate")) {
      return `${value.toFixed(1)}%`
    }
    if (metric.toLowerCase().includes("cost") || metric.toLowerCase().includes("cash") || metric.toLowerCase().includes("expense")) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(value)
    }
    return value.toString()
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const handleViewDetails = (alert: FinancialAlert) => {
    info("Alert Details", `Opening detailed analysis for ${alert.title}`)
  }

  const handleDismissAlert = (alertId: string) => {
    warning("Alert Dismissed", "Alert has been marked as acknowledged")
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-red-200/60 dark:border-red-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Financial Alerts
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Critical insights and recommendations
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700">
            {alerts.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">All Clear!</h3>
            <p className="text-slate-600 dark:text-slate-400">
              No financial alerts at this time. Your business metrics are looking healthy.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {getSeverityIcon(alert.severity)}
                      <span className="ml-1 capitalize">{alert.severity}</span>
                    </Badge>
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      {getTypeIcon(alert.type)}
                      <span className="text-xs uppercase tracking-wide">{alert.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewDetails(alert)}
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDismissAlert(alert.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{alert.description}</p>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(alert.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">Current:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatValue(alert.value, alert.metric)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">Target:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatValue(alert.threshold, alert.metric)}
                      </span>
                    </div>
                  </div>

                  {alert.recommendations.length > 0 && (
                    <div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">Recommendations:</p>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                        {alert.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-blue-500 mt-0.5">•</span>
                            {rec}
                          </li>
                        ))}
                        {alert.recommendations.length > 2 && (
                          <li className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
                            +{alert.recommendations.length - 2} more recommendations
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {alerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => success("Report Generated", "Comprehensive financial health report is ready for download")}
              className="w-full"
            >
              Generate Financial Health Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}