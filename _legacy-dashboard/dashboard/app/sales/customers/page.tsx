import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { CustomersManagement } from "@/components/system/sales/customers-management"

export default function CustomersPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto">
          <CustomersManagement />
        </main>
      </div>
    </div>
  )
}
