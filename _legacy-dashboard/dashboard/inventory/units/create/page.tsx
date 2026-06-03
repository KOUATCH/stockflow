import UnitsManagementDashboard from "@/components/units/UnitsManagementDashboard"
import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Create Unit | StockFlow",
  description: "Create a measurement unit for item, purchasing, sales, and POS workflows.",
}

export default async function CreateUnitPage() {
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  return (
    <div className="dashboard-landing-theme min-h-screen overflow-x-hidden">
      <div className="dashboard-landing-content mx-auto flex w-full max-w-[92rem] min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <UnitsManagementDashboard organizationId={user.organizationId} locale="en" initialAction="create" />
      </div>
    </div>
  )
}
