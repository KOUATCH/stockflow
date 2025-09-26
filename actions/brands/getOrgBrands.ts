
"use server";
import { db } from "@/prisma/db";
import { BrandResponse } from "@/types/brand";

// const   getBriefOrgbrands = async () => {
const getOrgBrands = async (orgId: string): Promise<BrandResponse> => {
  try {
   
    const brands = await db.brand.findMany({
      where: {
        organizationId: orgId,
      },
     
      orderBy: {
        brandName: "desc",
      },
    });
    if (!brands) {
      throw new Error("No brands found for this organization");
    }
    return {
      success: true,
      error: null,
      data: brands,
    };
  } catch (error) {
    console.error("Error fetching the count:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}
export default getOrgBrands