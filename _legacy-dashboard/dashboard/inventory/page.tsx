
"user Server"

import { getOrgItemsWithInventoryLevels } from '@/actions/itemsShow/getOrgItemsWithInventoryLevels';
import InventoryOverview from '@/components/recentInventory/InventoryOverview';
import { getAuthenticatedUser } from '@/config/useAuth';
import { Suspense } from 'react';

export default async function InventoryPage() {

  const user = await getAuthenticatedUser();
  const userOrgId = user?.organizationId;

  const itemResponse = await getOrgItemsWithInventoryLevels(userOrgId);
  const items = itemResponse?.data;
  if (!items || items.length === 0) {
    return <div>No items found</div>;
  }
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory levels, track stock movements, and monitor locations
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      }>
        <InventoryOverview initialItemData={items} />
      </Suspense>
    </div>
  );
}
