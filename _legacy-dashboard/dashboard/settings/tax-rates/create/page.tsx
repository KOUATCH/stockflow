import TaxRatesManagementDashboard from "@/components/tax-rates/TaxRatesManagementDashboard"
import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Create Tax Rate | StockFlow",
  description: "Create an organization tax rate for item, sales, purchasing, and reporting workflows.",
}

export default async function CreateTaxRatePage() {
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  return (
    <div className="dashboard-landing-theme min-h-screen overflow-x-hidden">
      <div className="dashboard-landing-content mx-auto flex w-full max-w-[92rem] min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <TaxRatesManagementDashboard
          organizationId={user.organizationId}
          locale="en"
          initialAction="create"
        />
      </div>
    </div>
  )
}
