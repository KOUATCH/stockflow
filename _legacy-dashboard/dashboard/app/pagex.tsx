import DashboardOverview from "@/components/dashboard/DashboardOverview"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto">
          <DashboardOverview />
        </main>
      </div>
    </div>
  )
}
