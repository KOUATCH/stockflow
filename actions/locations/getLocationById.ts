"use server";
import { db } from "@/prisma/db";


export const getLocationById= async(id: string)=> {
  try {
    const location = await db.location.findUnique({
      where: {
        id,
      },
    });
   
    if (!location) {
      return {
        success: false,
        data: null,
        error: "Location not found",
      };
    } 
    return { 
      success: true,
      data: location,
      error: null, 
     };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch Location",
    };
  }
}
 export default getLocationById