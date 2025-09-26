"use server";

import { db } from "@/prisma/db";
import { UnitProps } from "@/types/types";
import { revalidatePath } from "next/cache";


const updateUnitById=async (id: string, data: UnitProps) =>{
  try {
    const unit = await db.unit.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new Error("Unit not found");
    }
 await db.unit.update({
  where:{id},
  data:{...data}
 })
     revalidatePath("/inventory/units");
    return { success: true, data: unit };
  } catch (error) {
    console.error("Error fetching unit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch unit",
    };
  }
}
export default updateUnitById