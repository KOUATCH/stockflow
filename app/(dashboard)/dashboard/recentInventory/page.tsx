


import getOrgItemsWithInventoryLevels from '@/actions/itemsShow/getOrgItemsWithInventoryLevels';
import InventoryOverview from '@/components/recentInventory/InventoryOverview';
import { getAuthenticatedUser } from '@/config/useAuth';

export default async function InventoryPage() {
  const user = await getAuthenticatedUser();
  const userOrgId = user?.organizationId;

  const items = await getOrgItemsWithInventoryLevels(userOrgId);
  if (!items || items?.data?.length === 0) {
    return <div>No items found</div>;
  }
  const itemData = items.data || [];

  return <InventoryOverview initialItemData={itemData} />
}
