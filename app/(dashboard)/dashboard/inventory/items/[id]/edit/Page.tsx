
import getOrgItems from "@/actions/itemsShow/getOrgItems";
import ModernItemFormForEditing from "@/components/dashboard/items/ModernItemFormForEditing";

import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgBrands } from "@/services/brandAPI";
import { getOrgCategories } from "@/services/categoryAPI";
import { getOrgTaxRates } from "@/services/taxRateAPI";
import { getOrgUnits } from "@/services/unitAPI";

import { useState } from "react";

export default async function ItemsPage() {
  const [comprehensiveFormOpen, setComprehensiveFormOpen] = useState(false);
  // You may also need to define itemToEdit and refetch if they are not defined elsewhere
  const user = await getAuthenticatedUser();
  const userOrg = user?.organizationId;


  const res = (await getOrgItems(userOrg)) || {};
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
    <div className="container mx-auto py-8">
      <ModernItemFormForEditing
        open={comprehensiveFormOpen}
        onOpenChange={setComprehensiveFormOpen}
        itemData={null}
        onSuccess={() => {
          //  fetch()
          setComprehensiveFormOpen(false);
        }}
        initialBrandData={brands}
        initialUnitData={units}
        initialCategoryData={categories}
        initialTaxRateData={taxRates}
      />
    </div>

  )
}
