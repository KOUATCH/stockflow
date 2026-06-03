import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrderById } from "@/actions/orders/orderActions"
import { redirect } from "next/navigation"
import { OrderDeliveryClient } from "@/components/orders/OrderDeliveryClient"

interface OrderDeliveryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderDeliveryPage({ params }: OrderDeliveryPageProps) {
  const user = await getAuthenticatedUser()
  const { id } = await params

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  const orderResult = await getOrderById(id, user.organizationId)

  if (!orderResult.success || !orderResult.data) {
    redirect("/dashboard/orders?error=Order not found")
  }

  const order = orderResult.data

  // Check if order can have deliveries
  const canCreateDelivery = ['CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'PARTIALLY_DELIVERED'].includes(order.status)

  if (!canCreateDelivery) {
    redirect(`/dashboard/orders/${id}?error=Order cannot be delivered in current status`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <OrderDeliveryClient
        order={order}
        organizationId={user.organizationId}
        currentUserId={user.id}
      />
    </div>
  )
}