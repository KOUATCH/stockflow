"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart } from "@/components/analytics/dashboard/revenue-chart"
import { DashboardStats } from "@/components/analytics/dashboard/dashboard-stats"
import { TopProductsCard } from "@/components/analytics/dashboard/top-products-card"
import { RecentTransactionsCard } from "@/components/analytics/dashboard/recent-transactions-card"
import { CashierPerformanceCard } from "@/components/analytics/dashboard/cashier-performance-card"
import { AlertsCard } from "@/components/analytics/dashboard/alerts-card"

interface ComprehensiveSalesDashboardProps {
  organizationId?: string
  locationId?: string
}

export default function ComprehensiveSalesDashboard({ organizationId, locationId }: ComprehensiveSalesDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
      </div>

      {/* Key Metrics */}
      <DashboardStats organizationId={organizationId} locationId={locationId} />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart />
        <TopProductsCard />
      </div>

      {/* Performance and Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RecentTransactionsCard />
        <CashierPerformanceCard />
        <AlertsCard />
      </div>
    </div>
  )
}