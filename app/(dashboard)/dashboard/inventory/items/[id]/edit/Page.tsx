
import getOrgBrands from "@/actions/brands/getOrgBrands"
import getOrgCategories from "@/actions/categories/getOrgCategories"
import getItemById from "@/actions/itemsShow/getItemById"
import updateItemById from "@/actions/itemsShow/updateItemById"
import { ModernEditItemForm } from "@/components/inventory/ModernEditItemForm"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrgTaxRates } from "@/services/taxRateAPI"
import { getOrgUnits } from "@/services/unitAPI"
import { ArrowLeft, Package } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface EditItemPageProps {
  params: {
    id: string
  }
}

async function handleUpdateItem(itemId: string, formData: FormData) {
  'use server'

  const data = {
    name: formData.get('name') as string,
    sku: formData.get('sku') as string,
    description: formData.get('description') as string,
    costPrice: parseFloat(formData.get('costPrice') as string) || 0,
    sellingPrice: parseFloat(formData.get('sellingPrice') as string) || 0,
    thumbnail: formData.get('thumbnail') as string,
    imageUrls: formData.get('imageUrls') as string,
    organizationId: formData.get('organizationId') as string,
    categoryId: formData.get('categoryId') as string || null,
    brandId: formData.get('brandId') as string || null,
    unitId: formData.get('unitId') as string || null,
    taxRateId: formData.get('taxRateId') as string || null,
    barcode: formData.get('barcode') as string || null,
    weight: parseFloat(formData.get('weight') as string) || 0,
    dimensions: formData.get('dimensions') as string || null,
    minStockLevel: parseInt(formData.get('minStockLevel') as string) || 0,
    maxStockLevel: formData.get('maxStockLevel') ? parseInt(formData.get('maxStockLevel') as string) : null,
    isActive: formData.get('isActive') === 'true'
  }

  const result = await updateItemById(itemId, data)

  if (result.success) {
    revalidatePath('/dashboard/inventory/items')
    redirect('/dashboard/inventory/items')
  } else {
    throw new Error(result.error || 'Failed to update item')
  }
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  // Get authenticated user and organization
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Organization Required</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              No organization found for the current user.
            </p>
            <form action={() => redirect('/dashboard/inventory/items')}>
              <Button type="submit" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Items
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const organizationId = user.organizationId

  // Fetch the specific item data using the ID from params
  const itemResult = await getItemById(params.id)

  if (!itemResult.success || !itemResult.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Item Not Found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The item you're trying to edit could not be found.
            </p>
            <form action={() => redirect('/dashboard/inventory/items')}>
              <Button type="submit" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Items
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Fetch all required data on the server
  const [categoriesResult, brandsResult, unitsResult, taxRatesResult] = await Promise.all([
    getOrgCategories(organizationId),
    getOrgBrands(organizationId),
    getOrgUnits(organizationId),
    getOrgTaxRates(organizationId)
  ])

  const categories = categoriesResult?.data || []
  const brands = brandsResult?.data || []
  const units = unitsResult?.data || []
  const taxRate = taxRatesResult?.data || []

  // Create action with bound itemId
  const updateItemAction = handleUpdateItem.bind(null, params.id)

  return (
    <ModernEditItemForm
      itemData={itemResult.data}
      action={updateItemAction}
      isLoading={false}
      categories={categories}
      brands={brands}
      units={units}
      taxRate={taxRate.map((tr: { id: string; rate: number; taxRateName: string }) => ({
        id: tr.id,
        rate: tr.rate,
        name: tr.taxRateName
      }))}
      organizationId={organizationId}
    />
  )
}
