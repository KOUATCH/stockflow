import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { FinancialReports } from "@/components/system/reports/financial-reports"

export default function FinancialReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto">
          <FinancialReports />
        </main>
      </div>
    </div>
  )
}
