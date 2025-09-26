"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface ProfitMarginChartProps {
  data: Array<{ period: string; value: number }>
}

export function ProfitMarginChart({ data }: ProfitMarginChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate profit margins (assuming 30% average margin)
  const marginData = data.map(item => ({
    ...item,
    margin: ((item.value * 0.38) / item.value) * 100, // 38% net margin
    grossMargin: ((item.value * 0.68) / item.value) * 100, // 68% gross margin
  }))

  const currentMargin = marginData[marginData.length - 1]?.margin || 0
  const targetMargin = 40 // Target 40% net margin
  const marginTrend = marginData.length > 1
    ? marginData[marginData.length - 1].margin - marginData[marginData.length - 2].margin
    : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            Net Profit: {formatCurrency(payload[0]?.payload?.value)}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Net Margin: {payload[1]?.value?.toFixed(1)}%
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Gross Margin: {payload[0]?.payload?.grossMargin?.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-purple-200/60 dark:border-purple-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Profit Analysis
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Profit trends and margin performance
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentMargin.toFixed(1)}%
            </div>
            <Badge className={`${marginTrend >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700'}`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {marginTrend >= 0 ? '+' : ''}{marginTrend.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={marginData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200 dark:stroke-slate-700"
                opacity={0.5}
              />
              <XAxis
                dataKey="period"
                className="text-slate-600 dark:text-slate-400"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-slate-600 dark:text-slate-400"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 80]}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Target Line */}
              <ReferenceLine
                y={targetMargin}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: "Target 40%", position: "topLeft" }}
              />

              {/* Gross Margin Area */}
              <Area
                type="monotone"
                dataKey="grossMargin"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#grossGradient)"
                fillOpacity={0.6}
              />

              {/* Net Margin Area */}
              <Area
                type="monotone"
                dataKey="margin"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#profitGradient)"
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Target Gap</p>
            <p className={`text-lg font-semibold ${currentMargin >= targetMargin ? 'text-green-600' : 'text-amber-600'}`}>
              {currentMargin >= targetMargin ? 'Exceeded' : `${(targetMargin - currentMargin).toFixed(1)}% to go`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gross Margin</p>
            <p className="text-lg font-semibold text-green-600">
              {marginData[marginData.length - 1]?.grossMargin?.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Best Month</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {marginData.reduce((best, current) => current.margin > best.margin ? current : best, marginData[0])?.period}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}