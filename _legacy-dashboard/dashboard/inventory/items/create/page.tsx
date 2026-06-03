import getOrgBrands from "@/actions/brands/getOrgBrands"
import getOrgCategories from "@/actions/categories/getOrgCategories"
import { createItemAction } from "@/actions/item/items"
import { ModernCreateItemForm } from "@/components/inventory/ModernCreateItemForm"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/config/useAuth"
import getOrgTaxRates from "@/actions/taxRate/getOrgTaxRates"
import getOrgUnits from "@/actions/units/getOrgUnits"
import { ArrowLeft, Package } from "lucide-react"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function handleCreateItem(formData: FormData) {
  'use server'

  // Helper function to get string value or null for empty/null values
  const getStringOrNull = (key: string): string | null => {
    const value = formData.get(key) as string
    return value && value.trim() !== '' ? value : null
  }

  const data = {
    nameEn: formData.get('nameEn') as string,
    nameFr: getStringOrNull('nameFr'),
    sku: formData.get('sku') as string,
    descriptionEn: getStringOrNull('descriptionEn'),
    descriptionFr: getStringOrNull('descriptionFr'),
    costPrice: parseFloat(formData.get('costPrice') as string) || 0,
    sellingPrice: parseFloat(formData.get('sellingPrice') as string) || 0,
    thumbnail: formData.get('thumbnail') as string,
    imageUrls: formData.get('imageUrls') as string,
    organizationId: formData.get('organizationId') as string,
    categoryId: getStringOrNull('categoryId'),
    brandId: getStringOrNull('brandId'),
    unitId: getStringOrNull('unitId'),
    taxRateId: getStringOrNull('taxRateId'),
    barcode: getStringOrNull('barcode'),
    weight: parseFloat(formData.get('weight') as string) || 0,
    dimensions: getStringOrNull('dimensions'),
    minStockLevel: parseInt(formData.get('minStockLevel') as string) || 0,
    maxStockLevel: formData.get('maxStockLevel') ? parseInt(formData.get('maxStockLevel') as string) : null,
    isActive: formData.get('isActive') === 'true'
  }

  const result = await createItemAction(data)

  if (result.success) {
    revalidatePath('/dashboard/inventory/items')
    return { success: true, redirect: '/dashboard/inventory/items' }
  } else {
    return { success: false, error: result.error }
  }
}

export default async function CreateItemPage() {
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

  return (
    <ModernCreateItemForm
      action={handleCreateItem}
      isLoading={false}
      categories={categories}
      brands={brands}
      units={units.map((unit: { id: string; name?: string; nameEn?: string; nameFr?: string | null; symbol: string }) => ({
        id: unit.id,
        nameEn: unit.nameEn ?? unit.name ?? "",
        nameFr: unit.nameFr ?? null,
        symbol: unit.symbol,
      }))}
      taxRate={taxRate.map((tr: { id: string; rate: number; taxRateName?: string; nameEn?: string; nameFr?: string | null }) => ({
        id: tr.id,
        rate: Number(tr.rate),
        nameEn: tr.nameEn ?? tr.taxRateName ?? "",
        nameFr: tr.nameFr ?? null,
      }))}
      organizationId={organizationId}
    />
  )
}
