

"use server";

import { db } from "@/prisma/db";


const deleteBrand = async (id: string) => {

  try {
      const brand = await db.brand.findUnique({
        where: { id },
      })

      if (!brand) {
        return {
          error: `Something went wrong, Brand not found`,
          success: false ,
          data: null,
        };
      }
     
      const deletedBrand = await db.brand.delete({
        where: {
          id,
        },
      });

      return {
        success: true,
        error: null,
        data: deletedBrand
      };

  } catch (error) {
    console.error("Error deleting Brand:", error);
    return {
      error: `Something went wrong, Please try again`,
      success: true,
      data: null,
    };
  }
}
export default deleteBrand
