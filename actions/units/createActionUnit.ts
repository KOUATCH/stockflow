// app/actions/createUnit.ts
"use server";

import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";
import { UnitCreateDTO } from "@/types/unit";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

const DEFAULT_IMAGE_URL =
  "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd";

const createActionUnit = async (data: UnitCreateDTO) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.organizationId) {
    return {
      success: false,
      error: "User not authenticated or missing organization",
      data: null,
    };
  }

  const formattedData = {
    ...data,
    organizationId: session.user.organizationId,
  };

  try {
    const result = await db.$transaction(async (tx) => {
      const existingUnit = await tx.unit.findUnique({
        where: {
          organizationId_name: {
            name: data.name,
            organizationId: session.user.organizationId,
          }
        },
      });

      if (existingUnit) {
        return {
          success: false,
          error: `Unit "${data.name}" already exists for this organization`,
          data: null,
        };
      }

      const newUnit = await tx.unit.create({ data: formattedData });

      revalidatePath("/inventory/units");

      return {
        success: true,
        error: null,
        data: newUnit,
      };
    });

    return result;
  } catch (error) {
    console.error("Error creating unit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}
export default createActionUnit