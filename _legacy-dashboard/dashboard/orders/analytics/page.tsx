import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"
import { getOrderAnalytics } from "@/actions/orders/orderActions"
import { OrderAnalyticsDashboard } from "@/components/orders/OrderAnalyticsDashboard"

export default async function OrderAnalyticsPage() {
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  // Get analytics data
  const analyticsResult = await getOrderAnalytics(user.organizationId)
  const analytics = analyticsResult.success ? analyticsResult.data : {
    totalOrders: 0,
    ordersByStatus: {
      pending: 0,
      processing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0
    },
    revenue: {
      totalRevenue: 0,
      advancePayments: 0,
      balancePayments: 0
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <OrderAnalyticsDashboard
        analytics={analytics}
        organizationId={user.organizationId}
      />
    </div>
  )
}