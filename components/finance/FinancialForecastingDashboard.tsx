"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  ScatterChart
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Gem
} from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"

interface ForecastData {
  period: string
  actualRevenue?: number
  forecastRevenue: number
  actualProfit?: number
  forecastProfit: number
  actualCashFlow?: number
  forecastCashFlow: number
  confidence: number
  lowerBound: number
  upperBound: number
}

interface ScenarioData {
  scenario: string
  revenue: number
  profit: number
  cashFlow: number
  probability: number
  impact: "high" | "medium" | "low"
}

interface ForecastAccuracy {
  metric: string
  accuracy: number
  mape: number
  trend: "improving" | "declining" | "stable"
}

export function FinancialForecastingDashboard() {
  const [forecastPeriod, setForecastPeriod] = useState("12")
  const [selectedModel, setSelectedModel] = useState("arima")
  const [isGenerating, setIsGenerating] = useState(false)
  const { success, info } = useNotifications()

  const forecastData: ForecastData[] = [
    { period: "Jan 2024", actualRevenue: 125000, forecastRevenue: 123500, actualProfit: 25000, forecastProfit: 24200, actualCashFlow: 18000, forecastCashFlow: 17800, confidence: 95, lowerBound: 115000, upperBound: 132000 },
    { period: "Feb 2024", actualRevenue: 132000, forecastRevenue: 131200, actualProfit: 28000, forecastProfit: 27500, actualCashFlow: 22000, forecastCashFlow: 21500, confidence: 92, lowerBound: 122000, upperBound: 141000 },
    { period: "Mar 2024", actualRevenue: 128000, forecastRevenue: 135800, actualProfit: 26500, forecastProfit: 29200, actualCashFlow: 19500, forecastCashFlow: 23100, confidence: 89, lowerBound: 126000, upperBound: 145000 },
    { period: "Apr 2024", forecastRevenue: 142000, forecastProfit: 31500, forecastCashFlow: 25200, confidence: 87, lowerBound: 132000, upperBound: 152000 },
    { period: "May 2024", forecastRevenue: 148000, forecastProfit: 34200, forecastCashFlow: 28100, confidence: 84, lowerBound: 137000, upperBound: 159000 },
    { period: "Jun 2024", forecastRevenue: 155000, forecastProfit: 37800, forecastCashFlow: 31500, confidence: 81, lowerBound: 143000, upperBound: 167000 },
    { period: "Jul 2024", forecastRevenue: 162000, forecastProfit: 41200, forecastCashFlow: 34800, confidence: 78, lowerBound: 149000, upperBound: 175000 },
    { period: "Aug 2024", forecastRevenue: 168000, forecastProfit: 44100, forecastCashFlow: 37200, confidence: 75, lowerBound: 154000, upperBound: 182000 }
  ]

  const scenarioData: ScenarioData[] = [
    { scenario: "Best Case", revenue: 2100000, profit: 485000, cashFlow: 425000, probability: 15, impact: "high" },
    { scenario: "Optimistic", revenue: 1950000, profit: 420000, cashFlow: 385000, probability: 25, impact: "high" },
    { scenario: "Base Case", revenue: 1800000, profit: 375000, cashFlow: 345000, probability: 40, impact: "medium" },
    { scenario: "Conservative", revenue: 1650000, profit: 315000, cashFlow: 285000, probability: 15, impact: "medium" },
    { scenario: "Worst Case", revenue: 1450000, profit: 245000, cashFlow: 215000, probability: 5, impact: "low" }
  ]

  const accuracyMetrics: ForecastAccuracy[] = [
    { metric: "Revenue", accuracy: 94.2, mape: 5.8, trend: "improving" },
    { metric: "Profit", accuracy: 91.7, mape: 8.3, trend: "stable" },
    { metric: "Cash Flow", accuracy: 88.9, mape: 11.1, trend: "improving" },
    { metric: "Expenses", accuracy: 92.5, mape: 7.5, trend: "declining" }
  ]

  const handleGenerateForecast = async () => {
    setIsGenerating(true)
    info("Generating Forecast", "Financial forecast generation is in progress.")

    setTimeout(() => {
      setIsGenerating(false)
      success("Forecast Generated", "Financial forecast generated successfully.")
    }, 2000)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 80) return "text-blue-600"
    if (confidence >= 70) return "text-amber-600"
    return "text-red-600"
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      case "low": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-b border-opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  Financial Forecasting
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Predictive analytics and scenario planning
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                  <SelectItem value="36">36 Months</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arima">ARIMA</SelectItem>
                  <SelectItem value="prophet">Prophet</SelectItem>
                  <SelectItem value="lstm">LSTM Neural</SelectItem>
                  <SelectItem value="regression">Regression</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateForecast} disabled={isGenerating} className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                <Brain className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Forecast"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-0 shadow-lg">
          <TabsTrigger value="forecast" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            Forecast Analysis
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            Scenario Planning
          </TabsTrigger>
          <TabsTrigger value="accuracy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            Model Accuracy
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            Trend Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6">
          {/* Forecast Chart */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Revenue Forecast with Confidence Intervals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: string) => [formatCurrency(value), name]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Legend />

                  {/* Confidence Interval */}
                  <Area
                    dataKey="upperBound"
                    stackId="confidence"
                    stroke="none"
                    fill="url(#confidenceGradient)"
                    fillOpacity={0.1}
                  />
                  <Area
                    dataKey="lowerBound"
                    stackId="confidence"
                    stroke="none"
                    fill="white"
                    fillOpacity={1}
                  />

                  {/* Actual Revenue */}
                  <Line
                    type="monotone"
                    dataKey="actualRevenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    name="Actual Revenue"
                  />

                  {/* Forecast Revenue */}
                  <Line
                    type="monotone"
                    dataKey="forecastRevenue"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    name="Forecast Revenue"
                  />

                  <defs>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Forecast Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {forecastData.slice(-4).map((item, index) => (
              <Card key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.period}</span>
                      <Badge variant="secondary" className={getConfidenceColor(item.confidence)}>
                        {item.confidence}% confidence
                      </Badge>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.forecastRevenue)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Revenue Forecast
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Range</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {formatCurrency(item.lowerBound)} - {formatCurrency(item.upperBound)}
                        </span>
                      </div>
                      <Progress value={item.confidence} className="h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Scenario Analysis */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                Scenario Analysis
              </CardTitle>
              <CardDescription>
                Financial projections under different market conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenarioData.map((scenario, index) => (
                  <div key={index} className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{scenario.scenario}</h4>
                        <Badge variant="secondary" className={getImpactColor(scenario.impact)}>
                          {scenario.impact} impact
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {scenario.probability}% probability
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Revenue</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatCurrency(scenario.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Profit</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatCurrency(scenario.profit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Cash Flow</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatCurrency(scenario.cashFlow)}
                        </p>
                      </div>
                    </div>

                    <Progress value={scenario.probability} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scenario Comparison Chart */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scenarioData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scenario" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
                  <Bar dataKey="profit" fill="#10b981" name="Profit" />
                  <Bar dataKey="cashFlow" fill="#f59e0b" name="Cash Flow" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy" className="space-y-6">
          {/* Model Accuracy */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {accuracyMetrics.map((metric, index) => (
              <Card key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{metric.metric}</span>
                      {metric.trend === "improving" ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : metric.trend === "declining" ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : (
                        <Activity className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {metric.accuracy.toFixed(1)}%
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Accuracy Rate
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        MAPE: {metric.mape.toFixed(1)}%
                      </p>
                      <Progress value={metric.accuracy} className="h-2 mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Forecast vs Actual Chart */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                Forecast vs Actual Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={forecastData.slice(0, 3)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="actualRevenue" fill="#10b981" name="Actual Revenue" />
                  <Bar dataKey="forecastRevenue" fill="#8b5cf6" name="Forecast Revenue" />
                  <Line type="monotone" dataKey="actualProfit" stroke="#f59e0b" strokeWidth={3} name="Actual Profit" />
                  <Line type="monotone" dataKey="forecastProfit" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" name="Forecast Profit" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Trend Analysis */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Key Financial Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Revenue Growth Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={forecastData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Area
                        type="monotone"
                        dataKey="forecastRevenue"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Profit Trend */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Profit Margin Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={forecastData}>
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: any) => `${((value / forecastData[0].forecastRevenue) * 100).toFixed(1)}%`} />
                      <Line
                        type="monotone"
                        dataKey="forecastProfit"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend Insights */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-600" />
                Trend Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-300">Strong Revenue Growth</h4>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        Revenue is forecasted to grow by 24% over the next 12 months, driven by expanding customer base and increased order values.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-300">Margin Pressure Alert</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                        Profit margins show slight compression due to increased operational costs. Consider cost optimization strategies.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300">Seasonal Patterns Detected</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        Analysis shows strong Q4 performance patterns. Plan inventory and cash flow accordingly for holiday season.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
