import { Suspense } from 'react'
// import ItemCreateForm from '@/components/items/item-create-form'
// import { getOrgBrandsAction, getOrgCategoriesAction, getOrgLocationsAction, getOrgTaxRatesAction, getOrgUnitsAction } from '@/app/actions/item-lookups'
import getOrgBrands from '@/actions/brands/getOrgBrands'
import getOrgCategories from '@/actions/categories/getOrgCategories'
import { getOrgLocation } from '@/actions/locations/getOrgLocation'
import getOrgTaxRates from '@/actions/taxRate/getOrgTaxRates'
import getOrgUnits from '@/actions/units/getOrgUnits'
import ItemCreateForm from '@/components/inventory/item/itemCreateForm'
import { TableLoading } from '@/components/ui/data-table'

// This is a Server Component that loads initial select options then renders the client form.
// In your app, replace the hardcoded org fallback with your auth-derived org ID.
export default async function NewItemPage({
  searchParams,
}: {
  searchParams?: { org?: string }
}) {
  const organizationId = searchParams?.org || 'demo-org'

  const [brandsRes, categoriesRes, unitsRes, taxRatesRes, locationsRes] = await Promise.all([
    getOrgBrands(organizationId).catch(() => ({ success: true, data: [] })),
    getOrgCategories(organizationId).catch(() => ({ success: true, data: [] })),
    getOrgUnits(organizationId).catch(() => ({ success: true, data: [] })),
    getOrgTaxRates(organizationId).catch(() => ({ success: true, data: [] })),
    getOrgLocation(organizationId).catch(() => ({ success: true, data: [] })),
  ])

  // // Fetch reference data in parallel
  // const [brandsRes, unitsRes, taxRatesRes, catsRes] = await Promise.all([
  //   getOrgBrands(organizationId).catch(() => null),
  //   getOrgUnits(organizationId).catch(() => null),
  //   getOrgTaxRates(organizationId).catch(() => null),
  //   getOrgCategories(organizationId).catch(() => null),
  // ])

  return (
    <div className="container py-8">
      <Suspense fallback={<TableLoading title="Item form" />}>
        <ItemCreateForm
          organizationId={organizationId}
          initialBrandData={brandsRes.data}
          initialCategoryData={categoriesRes.data}
          initialUnitData={unitsRes.data}
          initialTaxRateData={taxRatesRes.data}
          initialLocations={locationsRes.data}
        />
      </Suspense>
    </div>
  )
}
