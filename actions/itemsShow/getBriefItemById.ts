"use server";
import { db } from "@/prisma/db";


 const getBriefItemById= async(id: string)=> {
  try {
    const item = await db.item.findUnique({
      where: {
        id,
      },
      select:{
        name:true,
        sku:true,
        updatedAt:true,
        id:true,
      }
    });
    return { 
      success: true,
      data: item,
      error: null, 
     };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch item",
    };
  }
}
 export default getBriefItemById