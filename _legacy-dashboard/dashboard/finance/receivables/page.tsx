import { checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import CustomerReceivablesClient from "./client"

export default async function CustomerReceivablesPage() {
  // Temporarily bypassed permission check
  // await checkPermission(PERMISSIONS.CUSTOMER_RECEIVABLES_READ);

  return <CustomerReceivablesClient />
}