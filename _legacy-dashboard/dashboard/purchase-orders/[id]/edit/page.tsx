import getOrgItems from "@/actions/itemsShow/getOrgItems"
import { getOrgPurchaseOrderById } from "@/actions/purchaseOrderWorkflow/purchaseOrderSystemAction"
import { getSuppliersByOrgId } from "@/actions/suppliers/getSuppliersByOrgId"
import { ModernEditPurchaseOrderForm } from "@/components/purchase-orders/ModernEditPurchaseOrderForm"
import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrgLocations } from "@/actions/locations/locationActions"
import { notFound } from "next/navigation"

interface PurchaseOrderEditPageProps {
  params: {
    id: string
  }
  searchParams?: {
    organizationId?: string
  }
}

export default async function PurchaseOrderEditPage({
  params,
  searchParams
}: PurchaseOrderEditPageProps) {
  const id = (await params)?.id

  // Get organizationId from authenticated user session first, fallback to searchParams
  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId || searchParams?.organizationId

  if (!id) {
    console.error("Missing purchase order ID")
    notFound()
  }

  if (!organizationId || !user) {
    console.error("Missing organizationId or user not authenticated")
    notFound()
  }

  // Fetch purchase order data
  const purchaseOrder = await getOrgPurchaseOrderById(id, organizationId).catch(() => null)
  if (!purchaseOrder) {
    notFound()
  }

  // Only allow editing of DRAFT purchase orders
  if (purchaseOrder.status !== 'DRAFT') {
    notFound()
  }

  // Fetch supporting data in parallel
  const [suppliersRes, locationsRes, itemsRes] = await Promise.all([
    getSuppliersByOrgId(organizationId),
    getOrgLocations(organizationId),
    getOrgItems(organizationId)
  ])

  const suppliers = (suppliersRes?.data || []).map(supplier => ({
    id: supplier.id,
    name: supplier.name,
    email: supplier.email ?? undefined
  }))
  const locations = locationsRes?.data || []
  const items = itemsRes?.data || []

  return (
    <ModernEditPurchaseOrderForm
      purchaseOrder={purchaseOrder}
      suppliers={suppliers}
      locations={locations}
      items={items}
      organizationId={organizationId}
    />
  )
}