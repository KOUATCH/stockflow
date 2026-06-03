import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrders } from "@/actions/orders/orderActions"
import { redirect } from "next/navigation"
import { OrderPaymentsClient } from "@/components/orders/OrderPaymentsClient"

export default async function OrderPaymentsPage() {
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  // Get orders with payments data
  const ordersResult = await getOrders(user.organizationId)
  const orders = ordersResult.success ? ordersResult.data : []

  // Filter orders that have payments or are awaiting payment
  const ordersWithPayments = orders.filter(order =>
    order.payments && order.payments.length > 0 || order.balanceAmount > 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <OrderPaymentsClient
        orders={ordersWithPayments}
        organizationId={user.organizationId}
      />
    </div>
  )
}