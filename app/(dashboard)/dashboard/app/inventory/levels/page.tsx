import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { InventoryLevels } from "@/components/inventory/inventory-levels"

export default function InventoryLevelsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto">
          <InventoryLevels />
        </main>
      </div>
    </div>
  )
}
