// app/actions/createTaxRate.ts
"use server";

import { db } from "@/prisma/db";
import { TaxRateCreateDTO } from "@/types/taxRates";
import { revalidatePath } from "next/cache";

const DEFAULT_IMAGE_URL =
  "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd";

const createActionTaxRate = async (data: TaxRateCreateDTO & { organizationId: string }) => {
  const formattedData = {
    ...data,
    organizationId: data.organizationId,
  };

  try {
    const result = await db.$transaction(async (tx) => {
      const existingTaxRate = await tx.taxRate.findUnique({
         where: {
          organizationId_taxRateName: {
            taxRateName: data.taxRateName,
            organizationId: data.organizationId,
          }
        },
      });

      if (existingTaxRate) {
        return {
          success: false,
          error: `TaxRate "${data.taxRateName}" already exists for this organization`,
          data: null,
        };
      }

      const newTaxRate = await tx.taxRate.create({ data: formattedData });

      revalidatePath("/inventory/taxRates");

      return {
        success: true,
        error: null,
        data: newTaxRate,
      };
    });

    return result;
  } catch (error) {
    console.error("Error creating taxRate:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}
export default createActionTaxRate