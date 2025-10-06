

import getOrgBrands from "@/actions/brands/getOrgBrands"
import getOrgCategories from "@/actions/categories/getOrgCategories"
import getOrgItemsWithInventoryLevels from "@/actions/itemsShow/getOrgItemsWithInventoryLevels"
import { TableLoading } from "@/components/ui/data-table"
import ItemManagement from "@/components/ui/groups/inventory/ItemManagement"
import { getAuthenticatedUser } from "@/config/useAuth"
import { getOrgTaxRates } from "@/services/taxRateAPI"
import { getOrgUnits } from "@/services/unitAPI"
import { Suspense } from "react"

export default async function ItemsPage() {
  // You may also need to define itemToEdit and refetch if they are not defined elsewhere
  const user = await getAuthenticatedUser();
  const userOrg = user?.organizationId;


  const res = (await getOrgItemsWithInventoryLevels(userOrg));
  const items = res.data || []; // Ensure items is an array, even if empty

  const brandDataRes = (await getOrgBrands(userOrg));
  const brands = brandDataRes.data || []; // Ensure items is an array, even if empty

  const unitDataRes = (await getOrgUnits(userOrg));
  const units = unitDataRes.data || []; // Ensure items is an array, even if empty

  const taxRateDataRes = (await getOrgTaxRates(userOrg));
  const taxRates = taxRateDataRes.data || []; // Ensure items is an array, even if empty

  const catDataRes = (await getOrgCategories(userOrg));
  const categories = catDataRes.data || []; // Ensure items is an array, even if empty


  // // Fetch data in parallel for a faster TTFB
  // const [itemsRes, brandsRes, unitsRes, taxRatesRes, catsRes] = await Promise.all([
  //   // listItemsAction signature assumed: (organizationId: string, q?: string, page?: number, pageSize?: number)
  //   getOrgItemsWithInventoryLevels(userOrg).catch(() => null),
  //   getOrgBrands(userOrg).catch(() => null),
  //   getOrgUnits(userOrg).catch(() => null),
  //   getOrgTaxRates(userOrg).catch(() => null),
  //   getOrgCategories(userOrg).catch(() => null),
  // ])

  // const initialItemData = (itemsRes as any)?.data ?? []
  // const initialCategoryData = (catsRes as any)?.data ?? []
  // const initialBrandData = (brandsRes as any)?.data ?? []
  // const initialUnitData = (unitsRes as any)?.data ?? []
  // const initialTaxRateData = (taxRatesRes as any)?.data ?? []

  return (
    <div className="container py-8">
      <Suspense fallback={<TableLoading title="Item data" />}>
        <ItemManagement
          title="Items"
          editingId=""
          organizationId={userOrg}
          initialItemData={items}
          initialCategoryData={categories}
          initialBrandData={brands}
          initialUnitData={units}
          initialTaxRateData={taxRates}

        />
      </Suspense>
    </div>

  )
}
