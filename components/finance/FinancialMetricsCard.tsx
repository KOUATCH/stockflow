"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react"

interface FinancialMetricsCardProps {
  title: string
  value: string
  trend: number
  icon: LucideIcon
  iconColor: string
  description: string
  target?: number
  className?: string
}

export function FinancialMetricsCard({
  title,
  value,
  trend,
  icon: Icon,
  iconColor,
  description,
  target,
  className = ""
}: FinancialMetricsCardProps) {
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="h-4 w-4" />
    if (trend < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (trend > 0) return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300"
    if (trend < 0) return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300"
    return "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400"
  }

  const formatTrend = (value: number) => {
    const abs = Math.abs(value)
    const sign = value >= 0 ? "+" : "-"
    return `${sign}${abs.toFixed(1)}%`
  }

  return (
    <Card className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${iconColor} shadow-lg group-hover:shadow-xl transition-shadow`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {title}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {value}
                </span>
                {target && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    / {target}%
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {description}
                </p>
                <Badge
                  variant="secondary"
                  className={`${getTrendColor()} border-0 font-medium text-xs px-2 py-1`}
                >
                  <span className="flex items-center gap-1">
                    {getTrendIcon()}
                    {formatTrend(trend)}
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {target && (
          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Target Progress</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {Math.min(100, Math.max(0, (parseFloat(value.replace(/[^0-9.-]/g, '')) / target) * 100)).toFixed(0)}%
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, (parseFloat(value.replace(/[^0-9.-]/g, '')) / target) * 100))}%`
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}