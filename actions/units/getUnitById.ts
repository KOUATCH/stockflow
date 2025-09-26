"use server";
import { db } from "@/prisma/db";


export const getUnitById= async(id: string)=> {
  try {
    const unit = await db.unit.findUnique({
      where: {
        id,
      },
    });
   
    if (!unit) {
      return {
        success: false,
        data: null,
        error: "Unit not found",
      };
    } 
    return { 
      success: true,
      data: unit,
      error: null, 
     };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch Unit",
    };
  }
}
 export default getUnitById