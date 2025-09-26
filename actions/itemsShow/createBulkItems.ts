import { ItemCreateDTO } from "@/types/item";
import createItem from "./createActionItem";


const createBulkItems=async(items: ItemCreateDTO[])=> {
  try {
    for (const item of items) {
      await createItem(item);
    }
     return {
        success: true,
        error: null,
        data: items,
      };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch items",
    };
  }
}
export default createBulkItems