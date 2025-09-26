"use server";
import { db } from "@/prisma/db";


export const getItemById= async(id: string)=> {
  try {
    const item = await db.item.findUnique({
      where: {
        id,
      },
    });
    return { 
      status:200,
      success: true,
      data: item,
      error: null, 
     };
  } catch (error) {
    return {
      status:500,
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch item",
    };
  }
}
 export default getItemById