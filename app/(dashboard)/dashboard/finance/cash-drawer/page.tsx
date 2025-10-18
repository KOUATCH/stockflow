import { checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import CashDrawerAnalyticsClient from "./client"

export default async function CashDrawerAnalyticsPage() {
  // Temporarily bypassed permission check
  // await checkPermission(PERMISSIONS.CASH_DRAWER_READ);

  return <CashDrawerAnalyticsClient />
}