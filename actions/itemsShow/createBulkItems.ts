import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";
import { ItemCreateDTO } from "@/types/item";
import { createActionItem } from "./createActionItem";

export const createBulkItems = inventoryAction(
  async (items: ItemCreateDTO[]): Promise<ServerActionResult<ItemCreateDTO[]>> => {
    for (const item of items) {
      await createActionItem(item);
    }

    return {
      success: true,
      data: items,
    };
  },
  {
    actionName: 'createBulkItems',
    component: 'InventoryManagement',
    businessContext: {
      domain: 'inventory',
      operation: 'create',
      resourceType: 'item'
    }
  }
)