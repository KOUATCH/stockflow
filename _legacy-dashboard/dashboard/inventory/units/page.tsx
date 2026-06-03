import UnitsManagementDashboard from "@/components/units/UnitsManagementDashboard"
import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Units | StockFlow",
  description: "Manage organization measurement units, conversions, status, and item usage.",
}

export default async function UnitsPage() {
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  return (
    <div className="dashboard-landing-theme min-h-screen overflow-x-hidden">
      <div className="dashboard-landing-content mx-auto flex w-full max-w-[92rem] min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <UnitsManagementDashboard organizationId={user.organizationId} locale="en" />
      </div>
    </div>
  )
}
