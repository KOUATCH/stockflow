

"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";

const deleteUnit = async (id: string) => {
try {
  // Use a transaction for atomic operations
  return await db.$transaction(async (tx) => {
 const user = await getAuthenticatedUser();
      // Check if the user is authenticated and has an organizationId
      if (!user || !user.organizationId) {
        return {
          error: `User not found`,
          success: false,
          data: null,
        };
      }
      //check if the unit already exists
      const existingUnit = await tx.unit.findUnique({
        where: {
          id: id,
          organizationId: user.organizationId,
        },
      });

      if (!existingUnit) {
        return {
          error: `Something went wrong, Unit not found`,
          success: false,
          data: null,
        };
      }

      const deletedUnit = await tx.unit.delete({
        where: {
          id: id,
        },
      });

      return {
        success: true,  
        error: null,
        data: deletedUnit,
      };
    });
  } catch (error) {
    console.error("Error deleting Unit:", error);
    return {
      error: `Something went wrong, Please try again`,
      success: false,
      data: null,
    };
  }
};
export default deleteUnit   