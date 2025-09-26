import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ItemsManagement } from "@/components/sales-system/inventory/items-management"

export default function ItemsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto">
          <ItemsManagement />
        </main>
      </div>
    </div>
  )
}
