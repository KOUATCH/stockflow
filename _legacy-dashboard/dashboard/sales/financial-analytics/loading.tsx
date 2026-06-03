import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, BarChart3, DollarSign, TrendingUp } from "lucide-react"

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header Loading */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <Skeleton className="h-8 w-80" />
            </div>
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      {/* Status Message */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">Loading Financial Analytics</p>
              <p className="text-xs text-blue-700">
                Analyzing sales data, calculating KPIs, and generating insights...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, title: "Total Revenue", color: "bg-emerald-100" },
          { icon: TrendingUp, title: "Gross Profit", color: "bg-blue-100" },
          { icon: BarChart3, title: "Profit Margin", color: "bg-purple-100" },
          { icon: BarChart3, title: "Items Sold", color: "bg-amber-100" }
        ].map((metric, i) => (
          <Card key={i} className="border-0 bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${metric.color}`}>
                  <metric.icon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Score and Alerts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              </div>
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-8 border-blue-200 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-amber-100 rounded-full">
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-600" />
                </div>
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 bg-amber-50 rounded-lg">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-0 bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading Progress Indicator */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-gray-600" />
              <span className="text-sm text-gray-700">Processing financial data...</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse w-3/4" />
              </div>
              <span className="text-xs text-gray-500">75%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}