import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { InventoryReports } from "@/components/reports/inventory-reports"

export default function InventoryReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto">
          <InventoryReports />
        </main>
      </div>
    </div>
  )
}
