"use server";
import { db } from "@/prisma/db";
// import { ItemPayload } from "@/types/types";

const getOrgItems=async(orgId:string)=> {
  try {
  
    // Fetch items for the organization
    const items= await db.item.findMany({
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
export default getOrgItems