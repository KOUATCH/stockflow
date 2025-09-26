"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  PiggyBank,
  Zap,
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react"
import type { FinancialMetrics } from "@/types/financialTypes"

interface KPIDashboardProps {
  metrics: FinancialMetrics
}

export function KPIDashboard({ metrics }: KPIDashboardProps) {
  const kpiCategories = [
    {
      title: "Profitability",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      metrics: [
        { name: "Gross Profit Margin", value: metrics.profitability.grossProfitMargin, target: 70, unit: "%" },
        { name: "Net Profit Margin", value: metrics.profitability.netProfitMargin, target: 40, unit: "%" },
        { name: "Return on Assets", value: metrics.profitability.returnOnAssets, target: 15, unit: "%" },
        { name: "Return on Equity", value: metrics.profitability.returnOnEquity, target: 20, unit: "%" },
        { name: "EBITDA Margin", value: metrics.profitability.ebitdaMargin, target: 45, unit: "%" }
      ]
    },
    {
      title: "Liquidity",
      icon: PiggyBank,
      color: "from-blue-500 to-indigo-600",
      metrics: [
        { name: "Current Ratio", value: metrics.liquidity.currentRatio, target: 2.5, unit: ":1" },
        { name: "Quick Ratio", value: metrics.liquidity.quickRatio, target: 1.5, unit: ":1" },
        { name: "Cash Ratio", value: metrics.liquidity.cashRatio, target: 0.8, unit: ":1" },
        { name: "Working Capital", value: metrics.liquidity.workingCapital / 1000, target: 150, unit: "K" },
        { name: "Cash Conversion Cycle", value: metrics.liquidity.cashConversionCycle, target: 30, unit: " days" }
      ]
    },
    {
      title: "Efficiency",
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      metrics: [
        { name: "Inventory Turnover", value: metrics.efficiency.inventoryTurnover, target: 10, unit: "x" },
        { name: "Receivables Turnover", value: metrics.efficiency.receivablesTurnover, target: 15, unit: "x" },
        { name: "Payables Turnover", value: metrics.efficiency.payablesTurnover, target: 8, unit: "x" },
        { name: "Asset Turnover", value: metrics.efficiency.assetTurnover, target: 1.8, unit: "x" },
        { name: "Sales per Employee", value: metrics.efficiency.salesPerEmployee / 1000, target: 150, unit: "K" }
      ]
    },
    {
      title: "Leverage",
      icon: CreditCard,
      color: "from-amber-500 to-orange-600",
      metrics: [
        { name: "Debt to Equity", value: metrics.leverage.debtToEquity, target: 0.3, unit: ":1" },
        { name: "Debt to Assets", value: metrics.leverage.debtToAssets, target: 0.2, unit: ":1" },
        { name: "Interest Coverage", value: metrics.leverage.interestCoverage, target: 20, unit: "x" },
        { name: "Debt Service Coverage", value: metrics.leverage.debtServiceCoverage, target: 5, unit: "x" }
      ]
    },
    {
      title: "Growth",
      icon: TrendingUp,
      color: "from-teal-500 to-cyan-600",
      metrics: [
        { name: "Revenue Growth", value: metrics.growth.revenueGrowth, target: 25, unit: "%" },
        { name: "Profit Growth", value: metrics.growth.profitGrowth, target: 30, unit: "%" },
        { name: "Customer Growth", value: metrics.growth.customerGrowth, target: 20, unit: "%" },
        { name: "Market Share", value: metrics.growth.marketShare, target: 10, unit: "%" }
      ]
    }
  ]

  const getPerformanceStatus = (value: number, target: number) => {
    const percentage = (value / target) * 100
    if (percentage >= 100) return { status: "excellent", color: "text-green-600" }
    if (percentage >= 80) return { status: "good", color: "text-blue-600" }
    if (percentage >= 60) return { status: "warning", color: "text-amber-600" }
    return { status: "poor", color: "text-red-600" }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === "%") return `${value.toFixed(1)}%`
    if (unit === "K") return `$${value.toFixed(0)}K`
    if (unit === "x") return `${value.toFixed(1)}x`
    if (unit === ":1") return `${value.toFixed(1)}:1`
    if (unit === " days") return `${value.toFixed(0)} days`
    return `${value.toFixed(1)}${unit}`
  }

  const getTrendIcon = (value: number, target: number) => {
    if (value > target) return <ArrowUpRight className="h-3 w-3 text-green-600" />
    if (value < target * 0.8) return <ArrowDownRight className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-slate-600" />
  }

  return (
    <div className="space-y-6">
      {kpiCategories.map((category) => (
        <Card key={category.title} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader className={`bg-gradient-to-r ${category.color.replace('500', '50').replace('600', '50')} dark:${category.color.replace('500', '900/20').replace('600', '900/20')} border-b border-opacity-60`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color} shadow-lg`}>
                <category.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  {category.title} Metrics
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Key performance indicators for {category.title.toLowerCase()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {category.metrics.map((metric) => {
                const performance = getPerformanceStatus(metric.value, metric.target)
                const progressPercentage = Math.min(100, (metric.value / metric.target) * 100)

                return (
                  <div
                    key={metric.name}
                    className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                            {metric.name}
                          </p>
                        </div>
                        {getTrendIcon(metric.value, metric.target)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-bold text-slate-900 dark:text-white">
                            {formatValue(metric.value, metric.unit)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            / {formatValue(metric.target, metric.unit)}
                          </span>
                        </div>

                        <Progress
                          value={progressPercentage}
                          className="h-2"
                        />

                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className={`${
                              performance.status === "excellent"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                                : performance.status === "good"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                                : performance.status === "warning"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700"
                            } text-xs px-2 py-1`}
                          >
                            {performance.status}
                          </Badge>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {progressPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Category Summary */}
            <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {category.title} Score
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Average performance across all metrics
                  </p>
                </div>
                <div className="text-right">
                  {(() => {
                    const averagePerformance = category.metrics.reduce((sum, metric) =>
                      sum + Math.min(100, (metric.value / metric.target) * 100), 0
                    ) / category.metrics.length

                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {averagePerformance.toFixed(0)}%
                        </span>
                        <Badge
                          variant="secondary"
                          className={`${
                            averagePerformance >= 90
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : averagePerformance >= 70
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : averagePerformance >= 50
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {averagePerformance >= 90 ? "Excellent" : averagePerformance >= 70 ? "Good" : averagePerformance >= 50 ? "Fair" : "Poor"}
                        </Badge>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}