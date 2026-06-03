import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrderById } from "@/actions/orders/orderActions"
import { getCustomersForOrder, getItemsForOrder } from "@/actions/orders/getOrderFormData"
import { redirect } from "next/navigation"
import { EditOrderClient } from "@/components/orders/EditOrderClient"

interface EditOrderPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const user = await getAuthenticatedUser()
  const { id } = await params

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  // Get order data and form data
  const [orderResult, customersResult, itemsResult] = await Promise.all([
    getOrderById(id, user.organizationId),
    getCustomersForOrder(user.organizationId),
    getItemsForOrder(user.organizationId)
  ])

  if (!orderResult.success || !orderResult.data) {
    redirect("/dashboard/orders?error=Order not found")
  }

  const order = orderResult.data
  const customers = customersResult.success ? customersResult.data : []
  const items = itemsResult.success ? itemsResult.data : []

  // Check if order can be edited
  const canEdit = ['DRAFT', 'PENDING'].includes(order.status)

  if (!canEdit) {
    redirect(`/dashboard/orders/${id}?error=Order cannot be edited in current status`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <EditOrderClient
        order={order}
        customers={customers}
        items={items}
        organizationId={user.organizationId}
        currentUserId={user.id}
      />
    </div>
  )
}