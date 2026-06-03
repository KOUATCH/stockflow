import { checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import ComprehensiveFinanceAnalyticsClient from "./client"

export default async function ComprehensiveFinanceAnalyticsPage() {
  // Temporarily bypassed permission check
  // await checkPermission(PERMISSIONS.DASHBOARD_READ);

  return <ComprehensiveFinanceAnalyticsClient />
}