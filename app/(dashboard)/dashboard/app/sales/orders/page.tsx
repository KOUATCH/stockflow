import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { SalesOrders } from "@/components/sales/sales-orders"

export default function SalesOrdersPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto">
          <SalesOrders />
        </main>
      </div>
    </div>
  )
}
