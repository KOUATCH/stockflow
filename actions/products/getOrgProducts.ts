"use server";
import { db } from "@/prisma/db";

const getOrgProducts=async(organizationId:string)=> {

  try {
    const organizationProducts = await db.item.findMany({
    where:{
      organizationId:organizationId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
   
    });
     if (!organizationProducts) {
       return {
status:200,
error:null,
data:organizationProducts
       } 
    }
    return organizationProducts
  } catch (error) {
    console.error("Error fetching the Products:", error);
      return {
status:500,
error:"No Products found",
data:[]
       } 
  }
}
export default getOrgProducts
