import getOrgBrands from "@/actions/brands/getOrgBrands"
import getOrgCategories from "@/actions/categories/getOrgCategories"
import listAllItems from "@/actions/item/listAllItems"
import { TableLoading } from "@/components/ui/data-table"
import ItemManagement from "@/components/ui/groups/inventory/ItemManagement"
import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrgTaxRates } from "@/services/taxRateAPI"
import { getOrgUnits } from "@/services/unitAPI"
import { Suspense } from "react"

// Helpers to parse/clamp search params safely
function toStringParam(input: unknown): string {
  return typeof input === "string" ? input : ""
}
function toNumberParam(input: unknown, fallback: number, { min, max }: { min?: number; max?: number } = {}): number {
  const n = typeof input === "string" ? Number.parseInt(input, 10) : Number.NaN
  let value = Number.isFinite(n) ? n : fallback
  if (typeof min === "number") value = Math.max(min, value)
  if (typeof max === "number") value = Math.min(max, value)
  return value
}

type SearchParams = Record<string, string | string[] | undefined>

export default async function ItemsPage(props: {
  // Next.js 15 commonly types params/searchParams as Promise in Server Components. We'll support both to be robust. [^4]
  searchParams?: Promise<SearchParams> | SearchParams
}) {
  // Resolve search params whether they are a Promise or a plain object
  const resolvedSearchParams: SearchParams =
    props?.searchParams && typeof (props.searchParams as Promise<SearchParams>)?.then === "function"
      ? await (props.searchParams as Promise<SearchParams>)
      : ((props?.searchParams as SearchParams) ?? {})

  const q = toStringParam(resolvedSearchParams.q)
  const page = toNumberParam(resolvedSearchParams.page, 1, { min: 1 })
  const pageSize = toNumberParam(resolvedSearchParams.pageSize, 20, { min: 1, max: 200 })

  const user = await getAuthenticatedUser()
  const userOrg = user?.organizationId
  if (!userOrg) {
    // You could redirect to sign-in or throw for the nearest error boundary; here we render an empty management shell.
    return (
      <div className="container py-8">
        <div className="text-sm text-muted-foreground">No organization found for the current user.</div>
      </div>
    )
  }

  // Fetch data in parallel for a faster TTFB
  const [itemsRes, brandsRes, unitsRes, taxRatesRes, catsRes] = await Promise.all([
    listAllItems(userOrg, "", 1, 25),
    getOrgBrands(userOrg).catch(() => null),
    getOrgUnits(userOrg).catch(() => null),
    getOrgTaxRates(userOrg).catch(() => null),
    getOrgCategories(userOrg).catch(() => null),
  ])

  const initialItemData = (itemsRes as any)?.data ?? []
  const initialCategoryData = (catsRes as any)?.data ?? []
  const initialBrandData = (brandsRes as any)?.data ?? []
  const initialUnitData = (unitsRes as any)?.data ?? []
  const initialTaxRateData = (taxRatesRes as any)?.data ?? []

  return (
    <div className="container py-8">
      <Suspense fallback={<TableLoading title="Item data" />}>
        <ItemManagement
          title="Items"
          editingId={""}
          organizationId={userOrg}
          initialItemData={initialItemData}
          initialCategoryData={initialCategoryData}
          initialBrandData={initialBrandData}
          initialUnitData={initialUnitData}
          initialTaxRateData={initialTaxRateData}
        // If ItemManagement supports pagination/search props, pass them here to hydrate its initial state
        // currentPage={page}
        // pageSize={pageSize}
        // query={q}
        />
      </Suspense>
    </div>
  )
}
