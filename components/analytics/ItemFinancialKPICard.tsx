"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Target,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ItemFinancialMetrics } from "@/actions/analytics/daily-sales-financial-analytics"

interface ItemFinancialKPICardProps {
  item: ItemFinancialMetrics
  showDetails?: boolean
  compareMode?: boolean
  onViewDetails?: (itemId: string) => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const formatPercentage = (value: number, showSign = true) =>
  `${showSign && value >= 0 ? '+' : ''}${value.toFixed(1)}%`

const TrendIcon = ({ value, size = "h-4 w-4" }: { value: number; size?: string }) => {
  if (value > 0) return <TrendingUp className={cn(size, "text-emerald-600")} />
  if (value < 0) return <TrendingDown className={cn(size, "text-red-600")} />
  return <Minus className={cn(size, "text-gray-500")} />
}

const KPIMetric = ({
  label,
  value,
  prefix = "",
  suffix = "",
  trend,
  target,
  className
}: {
  label: string
  value: number | string
  prefix?: string
  suffix?: string
  trend?: number
  target?: number
  className?: string
}) => (
  <div className={cn("space-y-1", className)}>
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          <TrendIcon value={trend} size="h-3 w-3" />
          <span className={cn(
            "text-xs",
            trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-600" : "text-gray-500"
          )}>
            {formatPercentage(trend)}
          </span>
        </div>
      )}
    </div>
    <div className="font-semibold text-sm">
      {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
    </div>
    {target && (
      <Progress value={(Number(value) / target) * 100} className="h-1" />
    )}
  </div>
)

const ProfitabilityIndicator = ({ margin }: { margin: number }) => {
  const getColor = (margin: number) => {
    if (margin >= 30) return "text-emerald-600 bg-emerald-100"
    if (margin >= 15) return "text-blue-600 bg-blue-100"
    if (margin >= 5) return "text-amber-600 bg-amber-100"
    return "text-red-600 bg-red-100"
  }

  const getLabel = (margin: number) => {
    if (margin >= 30) return "Excellent"
    if (margin >= 15) return "Good"
    if (margin >= 5) return "Fair"
    return "Poor"
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">Profitability</span>
      <Badge className={cn("text-xs px-2 py-1", getColor(margin))}>
        {getLabel(margin)}
      </Badge>
    </div>
  )
}

export default function ItemFinancialKPICard({
  item,
  showDetails = false,
  compareMode = false,
  onViewDetails
}: ItemFinancialKPICardProps) {
  const profitabilityScore = (item.grossMargin + item.profitability.roi) / 2
  const performanceScore = item.performance.efficiency

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg border-0",
      item.grossProfit < 0 ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200" :
      item.grossMargin >= 30 ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200" :
      "bg-gradient-to-br from-white to-gray-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium line-clamp-1">
                {item.name}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                #{item.performance.ranking}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.sku}</span>
              <Separator orientation="vertical" className="h-3" />
              <span>{item.category}</span>
            </div>
          </div>
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(item.id)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ProfitabilityIndicator margin={item.grossMargin} />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Financial Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <KPIMetric
            label="Revenue"
            value={item.grossRevenue}
            prefix="$"
            trend={item.performance.growth}
          />
          <KPIMetric
            label="Profit"
            value={item.grossProfit}
            prefix="$"
          />
          <KPIMetric
            label="Margin"
            value={item.grossMargin}
            suffix="%"
          />
          <KPIMetric
            label="Units Sold"
            value={item.quantitySold}
          />
        </div>

        {showDetails && (
          <>
            <Separator />

            {/* Advanced Metrics */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Avg. Selling Price</span>
                  <div className="font-medium">{formatCurrency(item.averageSellingPrice)}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Avg. Cost</span>
                  <div className="font-medium">{formatCurrency(item.averageCostPrice)}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Revenue Share</span>
                  <div className="font-medium">{item.revenueShare}%</div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">ROI</span>
                  <div className={cn(
                    "font-medium",
                    item.profitability.roi > 0 ? "text-emerald-600" : "text-red-600"
                  )}>
                    {item.profitability.roi}%
                  </div>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Performance Score</span>
                  <span className="text-xs font-medium">{performanceScore}%</span>
                </div>
                <Progress value={performanceScore} className="h-1.5" />
              </div>

              {/* Stock Movement */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <h5 className="text-xs font-medium text-gray-700">Stock Movement</h5>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium">{item.stockMovement.opening}</div>
                    <div className="text-muted-foreground">Opening</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">-{item.stockMovement.movement}</div>
                    <div className="text-muted-foreground">Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{item.stockMovement.closing}</div>
                    <div className="text-muted-foreground">Closing</div>
                  </div>
                </div>
              </div>

              {/* Transaction Analysis */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Transactions</span>
                  <div className="font-medium">{item.transactionCount}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Avg. Units/Txn</span>
                  <div className="font-medium">{item.averageUnitsPerTransaction}</div>
                </div>
              </div>

              {/* Profitability Insights */}
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                <h5 className="text-xs font-medium text-blue-700">Profitability Analysis</h5>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">Contribution</span>
                    <span className="font-medium">{formatCurrency(item.profitability.contribution)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">Break-even Units</span>
                    <span className="font-medium">{item.profitability.breakeven}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">Margin Trend</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs h-5",
                        item.profitability.marginTrend === "improving" ? "text-emerald-600 border-emerald-200" :
                        item.profitability.marginTrend === "declining" ? "text-red-600 border-red-200" :
                        "text-gray-600 border-gray-200"
                      )}
                    >
                      {item.profitability.marginTrend}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Action Insights */}
        {!showDetails && (
          <div className="space-y-2">
            {item.grossMargin < 10 && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded p-2">
                <AlertTriangle className="h-3 w-3" />
                <span>Low margin - review pricing</span>
              </div>
            )}
            {item.quantitySold > 50 && (
              <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded p-2">
                <Zap className="h-3 w-3" />
                <span>High volume seller</span>
              </div>
            )}
            {item.performance.growth > 20 && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded p-2">
                <ArrowUpRight className="h-3 w-3" />
                <span>Strong growth trend</span>
              </div>
            )}
          </div>
        )}

        {/* Performance Summary Bar */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Overall Score</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={profitabilityScore} className="w-16 h-1.5" />
              <span className="font-medium">{profitabilityScore.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}