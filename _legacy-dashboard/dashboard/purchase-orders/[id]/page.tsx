import ModernPurchaseOrderDetailPage from "@/components/purchase-orders/ModernPurchaseOrderDetailPage"
import { getAuthenticatedUser } from "@/config/useAuth"
import { notFound } from "next/navigation"

interface PurchaseOrderDetailPageProps {
  params: {
    id: string
  }
  searchParams?: {
    organizationId?: string
    tab?: string
  }
}

export default async function PurchaseOrderDetailPage({ params, searchParams }: PurchaseOrderDetailPageProps) {
  const id = (await params)?.id

  // Get organizationId from authenticated user session first, fallback to searchParams
  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId || searchParams?.organizationId

  console.log("Detail Page - id:", id, "organizationId:", organizationId, "user:", user?.id)

  if (!id) {
    console.error("Missing purchase order ID")
    notFound()
  }

  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view this purchase order.</p>
        </div>
      </div>
    )
  }

  return <ModernPurchaseOrderDetailPage id={id} organizationId={organizationId} />
}
