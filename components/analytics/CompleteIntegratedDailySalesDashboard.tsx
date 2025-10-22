"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialSummaryReportComponent } from "@/components/reports/financial-summary-report"
import { CashierPerformanceReportComponent } from "@/components/reports/cashier-performance-report"
import { ItemPerformanceReportComponent } from "@/components/reports/item-performance-report"
import { SessionAnalyticsCard } from "@/components/reports/session-analytics-card"

export default function CompleteIntegratedDailySalesDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Daily Sales Reports</h1>
      </div>

      {/* Session Overview */}
      <SessionAnalyticsCard
        sessionData={{
          session: {
            id: "1",
            sessionNumber: "POS-001",
            startTime: new Date(),
            endTime: null,
            status: "active",
            cashierName: "Current User",
            terminalName: "Terminal 1"
          },
          metrics: {
            totalSales: 0,
            totalTransactions: 0,
            averageTransaction: 0,
            totalItemsSold: 0,
            cashTotal: 0,
            cardTotal: 0,
            digitalTotal: 0,
            openingBalance: 200,
            closingBalance: null,
            expectedBalance: null,
            variance: null,
            cashIn: 0,
            cashOut: 0
          },
          topItems: []
        }}
      />

      {/* Financial Summary */}
      <FinancialSummaryReportComponent
        report={{
          period: "Today",
          totalRevenue: 0,
          totalCost: 0,
          grossProfit: 0,
          grossMargin: 0,
          totalTransactions: 0,
          averageTransactionValue: 0,
          totalItemsSold: 0,
          cashSales: 0,
          cardSales: 0,
          digitalSales: 0,
          revenueChange: 0,
          transactionChange: 0,
          profitChange: 0,
          topSellingItems: [],
          hourlyBreakdown: []
        }}
      />

      {/* Performance Reports */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CashierPerformanceReportComponent reports={[]} />
        <ItemPerformanceReportComponent reports={[]} />
      </div>
    </div>
  )
}