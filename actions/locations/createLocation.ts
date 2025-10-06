"use server";

import { getAuthenticatedUser } from "@/lib/auth-server";
import { db } from "@/prisma/db";
import { LocationDTO } from "@/types/location";
import { Location } from "@prisma/client";
import { revalidatePath } from "next/cache";

const createLocation = async (data: LocationDTO) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const user = await getAuthenticatedUser();

      // Check if the user is authenticated and has an organizationId
      if (!user || !user.organizationId) {
        return {
          error: "Authentication required or organization not found for user.",
          success: false,
          data: null,
        };
      }
    console.log({data})
      // Validate required fields from DTO
      if (!data.name || !data.code) {
        return {
          error: "Location name and/or code are required.",
          success: false,
          data: null,
        };
      }

      // Check if a Location with the same code already exists for this organization
      const existingLocation = await tx.location.findFirst({
        where: {
          organizationId: user.organizationId,
          code: data.code,
        },
      });

      if (existingLocation) {
        return {
          error: `A location with code '${data.code}' already exists for this organization.`,
          success: false,
          data: null,
        };
      }

      const newLocation: Location = await tx.location.create({
        data: {
          organizationId: user.organizationId,
          name: data.name,
          code: data.code,
          type: data.type,
          address: data.address,
          phone: data.phone,
          email: data.email,
          isActive: data.isActive,
          // add other fields explicitly if needed, but do NOT spread the whole data object
        },
      });

      // Revalidate the path to refresh the data
      revalidatePath("/dashboard/inventory/locations"); // Adjust path as needed

      console.log({ newLocation });
      return {
        success: true,
        error: null,
        data: newLocation,
      };
    });
  } catch (error) {
    console.error("Error creating Location:", error);
    return {
      success: false,
      error: `Failed to create location. Please try again.`,
      data: null,
    };
  }
};

export default createLocation;
