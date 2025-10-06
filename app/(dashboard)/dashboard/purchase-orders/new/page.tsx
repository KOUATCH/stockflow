
import { createPurchaseOrder } from "@/actions/purchaseOrderWorkflow/purchaseOrderSystemAction"
import { ModernCreatePurchaseOrderForm } from "@/components/purchase-orders/ModernCreatePurchaseOrderForm"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import { db } from "@/prisma/db"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function handleCreatePurchaseOrder(formData: FormData) {
  'use server'

  const user = await getAuthenticatedUser()
  if (!user?.organizationId) {
    throw new Error("Organization ID is required")
  }

  const data = {
    poNumber: formData.get('poNumber') as string,
    organizationId: user.organizationId,
    supplierId: formData.get('supplierId') as string,
    locationId: formData.get('locationId') as string,
    date: formData.get('date') as string,
    expectedDeliveryDate: formData.get('expectedDeliveryDate') as string,
    paymentTerms: formData.get('paymentTerms') as string || 'Net 30 days',
    notes: formData.get('notes') as string || '',
    shippingCost: parseFloat(formData.get('shippingCost') as string) || 0,
    createdBy: user.id,
    orderLines: JSON.parse(formData.get('orderLines') as string || '[]')
  }

  const result = await createPurchaseOrder(data)

  if (result.success) {
    revalidatePath('/dashboard/purchase-orders')
    redirect('/dashboard/purchase-orders')
  } else {
    throw new Error(result?.error || 'Failed to create purchase order')
  }
}

export default async function CreatePurchaseOrderPage() {
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 space-y-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Organization Required</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              No organization found for the current user.
            </p>
            <form action={() => redirect('/dashboard/purchase-orders')}>
              <Button type="submit" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Purchase Orders
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const organizationId = user.organizationId

  // Fetch all required data on the server
  const [suppliersResult, locationsResult, itemsResult] = await Promise.all([
    db.supplier.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, email: true, phone: true }
    }),
    db.location.findMany({
      where: { organizationId },
      select: { id: true, name: true, address: true, type: true }
    }),
    db.item.findMany({
      where: { organizationId, isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        costPrice: true,
        thumbnail: true
      }
    })
  ])

  return (
    <ModernCreatePurchaseOrderForm
      action={handleCreatePurchaseOrder}
      isLoading={false}
      suppliers={Array.isArray(suppliersResult) ? suppliersResult.map(supplier => ({
        ...supplier,
        email: supplier.email ?? undefined,
        phone: supplier.phone ?? undefined
      })) : []}
      locations={Array.isArray(locationsResult) ? locationsResult.map(location => ({
        ...location,
        address: location.address ?? undefined,
        type: location.type ?? undefined
      })) : []}
      items={Array.isArray(itemsResult)
        ? itemsResult.map(item => ({
          ...item,
          description: item.description ?? undefined,
          thumbnail: item.thumbnail ?? undefined,
          costPrice: item.costPrice ?? undefined
        }))
        : []
      }
      organizationId={organizationId}
    />
  )

}