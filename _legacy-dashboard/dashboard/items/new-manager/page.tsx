import getOrgBrands from "@/actions/brands/getOrgBrands"
import getOrgCategories from "@/actions/categories/getOrgCategories"
import ItemsTableWithForm from "@/components/newItemForms/items-table-with-form"
import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrgTaxRates } from "@/actions/taxRate/getOrgTaxRates"
import { getOrgUnits } from "@/actions/units/getOrgUnits"
// import ItemsTableWithForm from "@/components/items/items-table-with-form"

// This page composes a Server Component that fetches initial option lists,
// and a Client Component that renders the table and form. This pattern
// aligns with the App Router approach of using Server Components by default,
// layering in client interactivity where needed. [^1]
export default async function ItemsManagerPage() {
  const user = await getAuthenticatedUser()
  const organizationId = user?.organizationId

  if (!organizationId) {
    return (
      <div className="container py-8">
        <div className="text-sm text-muted-foreground">No organization found for the current user.</div>
      </div>
    )
  }

  // Fetch reference data in parallel
  const [brandsRes, unitsRes, taxRatesRes, catsRes] = await Promise.all([
    getOrgBrands(organizationId).catch(() => null),
    getOrgUnits(organizationId).catch(() => null),
    getOrgTaxRates(organizationId).catch(() => null),
    getOrgCategories(organizationId).catch(() => null),
  ])

  const initialCategoryData = (catsRes as any)?.data ?? []
  const initialBrandData = (brandsRes as any)?.data ?? []
  const initialUnitData = (unitsRes as any)?.data ?? []
  const initialTaxRateData = (taxRatesRes as any)?.data ?? []

  return (
    <div className="container py-8">
      <ItemsTableWithForm
        organizationId={organizationId}
        initialBrandData={initialBrandData}
        initialUnitData={initialUnitData}
        initialCategoryData={initialCategoryData}
        initialTaxRateData={initialTaxRateData}
        initialLocations={[]}
      />
    </div>
  )
}
