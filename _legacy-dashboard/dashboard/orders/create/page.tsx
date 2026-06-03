import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"
import { CreateOrderForm } from "@/components/orders/CreateOrderForm"

export default async function CreateOrderPage() {
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <CreateOrderForm
        organizationId={user.organizationId}
        currentUserId={user.id}
      />
    </div>
  )
}