"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { RevenueChart } from "@/components/analytics/dashboard/revenue-chart"
import { DashboardStats } from "@/components/analytics/dashboard/dashboard-stats"
import { TopProductsCard } from "@/components/analytics/dashboard/top-products-card"
import { RecentTransactionsCard } from "@/components/analytics/dashboard/recent-transactions-card"
import { CashierPerformanceCard } from "@/components/analytics/dashboard/cashier-performance-card"
import { AlertsCard } from "@/components/analytics/dashboard/alerts-card"

export default function ComprehensiveSalesDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-teal-50/30 dark:from-slate-800/80 dark:via-slate-700/40 dark:to-slate-600/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      {/* Enhanced Header Section */}
      <div className="relative z-10 sticky top-0 backdrop-blur-xl bg-gradient-to-r from-white/60 to-slate-50/40 dark:from-slate-800/60 dark:to-slate-700/40 border-b border-slate-200/60 dark:border-slate-700/60 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg ring-4 ring-teal-500/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Sales Analytics</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium">Comprehensive sales performance dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-8 space-y-8">
        {/* Key Metrics */}
        <DashboardStats />

        {/* Charts Row */}
        <div className="grid gap-8 md:grid-cols-2">
          <RevenueChart />
          <TopProductsCard />
        </div>

        {/* Performance and Activity */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <RecentTransactionsCard />
          <CashierPerformanceCard />
          <AlertsCard />
        </div>
      </div>
    </div>
  )
}