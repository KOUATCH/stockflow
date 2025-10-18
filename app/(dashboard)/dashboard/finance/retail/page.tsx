import { checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import RetailFinancialDashboardClient from "./client"

export default async function RetailFinancialDashboard() {
  // Temporarily bypassed permission check for debugging
  // await checkPermission(PERMISSIONS.FINANCIAL_READ);

  return <RetailFinancialDashboardClient />
}