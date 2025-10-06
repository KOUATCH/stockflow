"use server";
import { db } from "@/prisma/db";


const getOrgTaxRates=async(organizationId: string)=> {
  try {
  //   const user =  await getAuthenticatedUser()
  //  const  userOrg= user.organizationId
    const taxRates = await db.taxRate.findMany({
      where:{
        organizationId:organizationId
      },
      orderBy: {
        createdAt: "desc",
      },
      
    });
    return {
      error:null,
      success:true,
      data:taxRates};
  } catch (error) {
    console.error("Error fetching the count:", error);
   return {
    error: error instanceof Error ? error.message : "Unknown error",
      success:false,
      data:null};
  }
}
export default getOrgTaxRates