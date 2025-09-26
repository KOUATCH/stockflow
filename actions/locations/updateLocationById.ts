"use server";

import { db } from "@/prisma/db";
import { LocationDTO } from "@/types/location";
import { revalidatePath } from "next/cache";

const updateLocationById = async (id: string, data: LocationDTO) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const location = await tx.location.findUnique({
        where: { id },
      });
  
      if (!location) {
        throw new Error("location not found");
      }
      await tx.location.update({
        where: { id },
        data: { ...data }
      })
      revalidatePath("/inventory/locations");
      return {
        data: location,
        success: true,
        error: null,
      }
     })
    } catch (error) {
      console.error("Error fetching location:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Failed to update location",
      };
    }
  }

export default updateLocationById