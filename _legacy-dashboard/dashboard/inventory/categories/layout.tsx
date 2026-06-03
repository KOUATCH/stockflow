import { checkPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import { ReactNode } from "react"

export default async function Layout({ children }: { children: ReactNode }) {
  await checkPermission(PERMISSIONS.READ_CATEGORIES)
  return <div>{children}</div>
}
