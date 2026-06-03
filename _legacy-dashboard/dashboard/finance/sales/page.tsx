import { checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import SalesAnalyticsClient from "./client"

export default async function SalesAnalyticsPage() {
  // Temporarily bypassed permission check
  // await checkPermission(PERMISSIONS.SALES_ANALYTICS_READ);

  return <SalesAnalyticsClient />
}