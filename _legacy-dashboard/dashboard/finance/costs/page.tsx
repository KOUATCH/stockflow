import { checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import CostAnalysisClient from "./client"

export default async function CostAnalysisPage() {
  // Temporarily bypassed permission check
  // await checkPermission(PERMISSIONS.COST_ANALYTICS_READ);

  return <CostAnalysisClient />
}