// In your server action file
"use server";
import { db } from "@/prisma/db";
import { LocationResponse } from "@/types/location";

export const getOrgLocations = async (orgId: string): Promise<LocationResponse> => {
  try {
    const locations = await db.location.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        name: "desc",
      },
    });
    
    return {
      success: true,
      error: null,
      data: locations,
    };  
  } catch (error) {
    console.error("Error fetching locations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
    };
  }
}