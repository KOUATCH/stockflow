
"use server";
import { db } from "@/prisma/db";
import { UnitResponse } from "@/types/unit";

// const   getBriefOrgunits = async () => {
const getOrgUnits = async (orgId: string): Promise<UnitResponse> => {
  try {
   
    const units = await db.unit.findMany({
      where: {
        organizationId: orgId,
      },
     
      orderBy: {
        name: "desc",
      },
    });
    if (!units) {
      throw new Error("No units found for this organization");
    }
    return {
      success: true,
      error: null,
      data: units,
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
export default getOrgUnits