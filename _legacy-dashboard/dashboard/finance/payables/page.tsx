import { checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import SupplierPayablesClient from "./client"

export default async function SupplierPayablesPage() {
  // Temporarily bypassed permission check
  // await checkPermission(PERMISSIONS.SUPPLIER_PAYABLES_READ);

  return <SupplierPayablesClient />
}