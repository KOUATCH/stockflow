// app/actions/createBrand.ts
"use server";

import { db } from "@/prisma/db";
import { BrandCreateDTO } from "@/types/brand";
import { revalidatePath } from "next/cache";

const DEFAULT_IMAGE_URL =
  "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd";

const createActionBrand = async (data: BrandCreateDTO & { organizationId: string }) => {
  const formattedData = {
    ...data,
    organizationId: data.organizationId,
  };

  try {
    const result = await db.$transaction(async (tx) => {
      //check if the Brand already exists
      const existingBrand = await tx.brand.findFirst({
        where: {
          brandName: data.brandName,
          organizationId: data.organizationId,
        },
      });


      if (existingBrand) {
        return {
          success: false,
          error: `Brand "${data.brandName}" already exists for this organization`,
          data: null,
        };
      }

      const newBrand = await tx.brand.create({ data: formattedData });

      revalidatePath("/inventory/brands");

      return {
        success: true,
        error: null,
        data: newBrand,
      };
    });

    return result;
  } catch (error) {
    console.error("Error creating brand:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}
export default createActionBrand