import { checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import ProfitabilityAnalysisClient from "./client"

export default async function ProfitabilityAnalysisPage() {
  // Temporarily bypassed permission check
  // await checkPermission(PERMISSIONS.PROFITABILITY_ANALYTICS_READ);

  return <ProfitabilityAnalysisClient />
}