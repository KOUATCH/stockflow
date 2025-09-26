import { ItemCreateDTO } from "@/types/item";
import createActionItem from "../itemsShow/createActionItem";
// import { createActionItem } from "../items/createActionItem";


const createBulkItems=async(items: ItemCreateDTO[])=> {
  try {
    for (const item of items) {
      await createActionItem(item);
    }
     return {
        error: null,
        status: 200,
        data: items,
      };
  } catch (error) {
    console.log(error);
  }
}
export default createBulkItems