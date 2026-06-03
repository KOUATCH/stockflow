import { getAuthenticatedUser } from "@/config/useAuth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck } from "lucide-react"

export default async function OrderDeliveriesPage() {
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    redirect("/unauthorized")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-700 shadow-lg shadow-indigo-500/25">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Order Deliveries
              </h1>
              <p className="text-muted-foreground mt-1">
                Track and manage all order deliveries and logistics
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
          <CardHeader>
            <CardTitle>Delivery Management</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Delivery Tracking Coming Soon</h3>
            <p className="text-muted-foreground">
              This comprehensive delivery management interface will be available soon.
              For now, you can manage deliveries from individual order detail pages.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}