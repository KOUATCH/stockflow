// components/ui/groups/ItemListingWrapper.tsx (Server Component)
import getOrgItems from "@/actions/itemsShow/getOrgItems";
import DecentItemForm from "@/components/dashboard/items/DecentItemForm";
import { getAuthenticatedUser } from "@/config/useAuth";
import { BriefItemPayload } from "@/types/item";


export interface ItemListingWrapperProps {
  title: string;
  organizationId: string;
  params: Promise<{ itemId: string }>;
}



// Server component that fetches initial data
export async function ItemListingContent({ title, params }: ItemListingWrapperProps) {
  const user = await getAuthenticatedUser();
  const orgId = user?.organizationId;
  console.log(params, "params from ItemListingContent");
  const { itemId } = await params;
  console.log(itemId, "itemId from params in item listing wrapper");
  try {

    if (!user || !orgId) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="p-6 border border-red-200 rounded-lg bg-red-50 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Authentication Required</h2>
            <p className="text-red-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }
    if (!orgId) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="p-6 border border-red-200 rounded-lg bg-red-50 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Invalid Request</h2>
            <p className="text-red-600">No organization ID provided.</p>
          </div>
        </div>
      );
    }


    // Fetch initial data on the server
    const response = await getOrgItems(orgId);

    let initialItems: BriefItemPayload[] = [];

    if (response.success && response.data) {
      initialItems = response.data.map((item: any) => ({
        ...item,
        salesCount: item.salesCount ?? 0,
        salesTotal: item.salesTotal ?? 0,
        isActive: item.isActive ?? false,
        isSerialTracked: item.isSerialTracked ?? false,
      }));
    }

    return (
      <DecentItemForm
        title={title}
        organizationId={orgId}
        initialItems={response?.data ? initialItems : []}
      />
    );
  } catch (error) {
    console.error("Error fetching initial items:", error);

    // Return the client component with empty initial data
    // The client component will handle fetching and error states
    return (
      <DecentItemForm
        title={title}
        initialItems={[]}
        organizationId={orgId}
      />
    );
  }
}
