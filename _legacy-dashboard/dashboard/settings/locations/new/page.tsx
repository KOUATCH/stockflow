import LocationsManagementDashboard from "@/components/locations/LocationsManagementDashboard"
import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Create Location | StockFlow",
  description: "Create an organization location with operating policies and management settings.",
}

export default async function NewLocationPage() {
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  return (
    <div className="dashboard-landing-theme min-h-screen overflow-x-hidden">
      <div className="dashboard-landing-content mx-auto flex w-full max-w-[92rem] min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <LocationsManagementDashboard organizationId={user.organizationId} locale="en" initialAction="create" />
      </div>
    </div>
  )
}
