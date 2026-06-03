import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { SalesAnalytics } from "@/components/system/reports/sales-analytics"

export default function SalesReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto">
          <SalesAnalytics />
        </main>
      </div>
    </div>
  )
}
