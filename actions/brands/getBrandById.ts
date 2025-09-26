"use server";
import { db } from "@/prisma/db";


export const getBrandById= async(id: string)=> {
  try {
    const brand = await db.brand.findUnique({
      where: {
        id,
      },
    });
   
    if (!brand) {
      return {
        success: false,
        data: null,
        error: "Brand not found",
      };
    } 
    return { 
      success: true,
      data: brand,
      error: null, 
     };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch Brand",
    };
  }
}
 export default getBrandById