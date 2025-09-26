"use server";
import { db } from "@/prisma/db";
import { ItemDTO } from "@/types/itemTypes";

const getOrgItemsDTO=async(orgId:string)=> {
  try {
  
    // Fetch items for the organization
    const items:ItemDTO[] = await db.item.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!items) {
      throw new Error("No items found for this organization");
    }  
    return {data:items , success: true, error: null};  
  } catch (error) {
    console.error("Error fetching the count:", error);
       return {data:null , success: false, error: error instanceof Error ? error.message : "Unknown error occurred"};  

  }
}
export default getOrgItemsDTO