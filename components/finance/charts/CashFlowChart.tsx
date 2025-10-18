"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PiggyBank, TrendingUp, TrendingDown } from "lucide-react"
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface CashFlowChartProps {
  data: Array<{ period: string; value: number }>
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Transform data to show cash flow changes
  const cashFlowData = data.map((item, index) => {
    const previousValue = index > 0 ? data[index - 1].value : item.value
    const change = item.value - previousValue
    return {
      ...item,
      change,
      isPositive: change >= 0
    }
  })

  const currentCashFlow = data[data.length - 1]?.value || 0
  const totalChange = data.length > 1 ? currentCashFlow - data[0].value : 0
  const averageChange = totalChange / (data.length - 1)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const cashFlow = payload.find((p: any) => p.dataKey === 'value')
      const change = payload.find((p: any) => p.dataKey === 'change')

      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Cash Position: {formatCurrency(cashFlow?.value || 0)}
          </p>
          {change && (
            <p className={`text-sm ${change.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              Change: {change.value >= 0 ? '+' : ''}{formatCurrency(change.value)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-b border-teal-200/60 dark:border-teal-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Cash Flow Analysis
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Cash position and monthly changes
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(currentCashFlow)}
            </div>
            <Badge className={`${totalChange >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700'}`}>
              {totalChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                yAxisId="cashflow"
                className="text-slate-600 dark:text-slate-400"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <YAxis
                yAxisId="change"
                orientation="right"
                className="text-slate-600 dark:text-slate-400"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} yAxisId="change" stroke="#64748b" strokeDasharray="2 2" />

              {/* Cash Flow Line */}
              <Line
                yAxisId="cashflow"
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
              />

              {/* Cash Flow Change Bars */}
              <Bar
                yAxisId="change"
                dataKey="change"
                fill={(entry: any) => entry.isPositive ? '#10b981' : '#ef4444'}
                opacity={0.7}
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avg Change</p>
            <p className={`text-lg font-semibold ${averageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {averageChange >= 0 ? '+' : ''}{formatCurrency(averageChange)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Best Month</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {cashFlowData.reduce((best, current) => current.change > best.change ? current : best, cashFlowData[0])?.period}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Liquidity Ratio</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">2.8:1</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}