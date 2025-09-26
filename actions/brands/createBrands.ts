"use server";
import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { BrandCreateDTO } from "@/types/brand";
import { Brand } from "@prisma/client";


const createBrand = async (data: BrandCreateDTO) => {
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


      //check if the Brand already exists
      const existingBrand = await tx.brand.findFirst({
        where: {
          brandName: data.brandName,
          organizationId: user.organizationId,
        },
      });

      console.log({ existingBrand })
      if (existingBrand) {
        return {
          error: `This Brand ${data?.brandName} already  exists for this organization`,
          success: false,
          data: null,
        };
      }

      const newBrand:Brand = await tx.brand.create({
        data: {
          ...data,
          organizationId: user?.organizationId,
          slug: data.brandName, // Ensure 'slug' is provided in BrandCreateDTO
        },
      });
      // Revalidate the path to refresh the data
// revalidatePath("/dashboard/inventory/Brands");

      console.log({ data })
      return {
        success: true,
        error: null,
        data: newBrand,
      };
    });
  } catch (error) {
    console.error("Error creating Brand:", error);
    return {
      success: false,
      error: `Something went wrong, Did not create the Brand, Please try again`,
      data: null,
    };
  }
}

export default createBrand

