"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CompleteIntegratedDailySalesDashboard from "@/components/analytics/CompleteIntegratedDailySalesDashboard"
import ComprehensiveSalesDashboard from "@/components/analytics/ComprehensiveSalesDashboard"
import ComprehensiveFinancialDashboard from "@/components/finance/ComprehensiveFinancialDashboard"

export default function SalesPage() {
  return (
    <div className="w-full">
      <Tabs defaultValue="comprehensive" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comprehensive">Sales Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial Analytics</TabsTrigger>
          <TabsTrigger value="daily">Daily Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="comprehensive" className="mt-6">
          <ComprehensiveSalesDashboard />
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <ComprehensiveFinancialDashboard />
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <CompleteIntegratedDailySalesDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
