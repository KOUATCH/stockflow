import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrderById } from "@/actions/orders/orderActions"
import { redirect } from "next/navigation"
import { OrderDetails } from "@/components/orders/OrderDetails"

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getAuthenticatedUser()
  const { id } = await params

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  const orderResult = await getOrderById(id, user.organizationId)

  if (!orderResult.success || !orderResult.data) {
    redirect("/dashboard/orders?error=Order not found")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <OrderDetails
        order={orderResult.data}
        organizationId={user.organizationId}
        currentUserId={user.id}
      />
    </div>
  )
}