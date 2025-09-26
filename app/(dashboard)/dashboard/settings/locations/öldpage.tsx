
import getOrgBrands from "@/actions/brands/getOrgBrands";
import getOrgCategories from "@/actions/categories/getOrgCategories";
import getBriefOrgItems from "@/actions/itemsShow/getBriefOrgItems";
import { TableLoading } from "@/components/ui/data-table";
import ItemListingWithEditing from "@/components/ui/groups/ItemListingWithEditing";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgTaxRates } from "@/services/taxRateAPI";
import { getOrgUnits } from "@/services/unitAPI";
// import { useOrgItems } from "@/hooks/useAllItemQueries";
import { Suspense } from "react";

const page = async () => {

  const user = await getAuthenticatedUser();
  const userOrg = user.organizationId; // e.g., fetch from session, context, or props

  const res = (await getBriefOrgItems(userOrg)) || {};
  const items = res.data || []; // Ensure items is an array, even if empty

  const brandDataRes = (await getOrgBrands(userOrg)) || {};
  const brands = brandDataRes.data || []; // Ensure items is an array, even if empty

  const unitDataRes = (await getOrgUnits(userOrg)) || {};
  const units = unitDataRes.data || []; // Ensure items is an array, even if empty

  const taxRateDataRes = (await getOrgTaxRates(userOrg)) || {};
  const taxRates = taxRateDataRes.data || []; // Ensure items is an array, even if empty

  const catDataRes = (await getOrgCategories(userOrg)) || {};
  const categories = catDataRes.data || []; // Ensure items is an array, even if empty
  return (
    <div className="container py-8">
      <Suspense fallback={<TableLoading title="Item data" />}>
        <ItemListingWithEditing
          title={""}
          editingId={""}
          organizationId={userOrg}
          initialItemData={items}
          initialCategoryData={categories}
          initialBrandData={brands}
          initialUnitData={units}
          initialTaxRateData={taxRates} />
      </Suspense>
    </div>
  );
}
export default page;
