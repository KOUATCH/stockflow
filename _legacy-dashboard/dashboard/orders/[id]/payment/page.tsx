import { auth } from "@/auth"
import { getOrderById } from "@/actions/orders/orderActions"
import { redirect } from "next/navigation"
import { OrderPaymentClient } from "@/components/payments/OrderPaymentClient"

interface OrderPaymentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderPaymentPage({ params }: OrderPaymentPageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.organizationId) {
    redirect("/unauthorized")
  }

  const orderResult = await getOrderById(id, session.user.organizationId)

  if (!orderResult.success || !orderResult.data) {
    redirect("/dashboard/orders?error=Order not found")
  }

  const order = orderResult.data

  return (
    <OrderPaymentClient
      order={order}
      organizationId={session.user.organizationId}
      userId={session.user.id}
    />
  )
}