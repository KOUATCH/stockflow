

"use server";

import { db } from "@/prisma/db";


const deleteItem = async (id: string) => {

  try {
      const item = await db.item.findUnique({
        where: { id },
      })

      if (!item) {
        return {
          error: `Something went wrong, Item not found`,
          success: false ,
          data: null,
        };
      }
      if (item.salesCount > 0) {
        return {
          error: `Item has related records so should not be deleted`,
          success: false ,
          data: null,
        };
      }
      const deletedItem = await db.item.delete({
        where: {  id },
      });

      return {
        success: true,
        error: null,
        data: deletedItem
      };

  } catch (error) {
    console.error("Error deleting item:", error);
    return {
      error: `Something went wrong, Please try again`,
      success: true,
      data: null,
    };
  }
}
export default deleteItem
