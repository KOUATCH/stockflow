"use server";
import { db } from "@/prisma/db";


export const getTaxRateById= async(id: string)=> {
  try {
    const taxRate = await db.taxRate.findUnique({
      where: {
        id,
      },
    });
   
    if (!taxRate) {
      return {
        success: false,
        data: null,
        error: "taxRate not found",
      };
    } 
    return { 
      success: true,
      data: taxRate,
      error: null, 
     };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch taxRate",
    };
  }
}
 export default getTaxRateById