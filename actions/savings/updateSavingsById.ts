"use server";

import { db } from "@/prisma/db";
import { SavingProps } from "@/types/types";
import { revalidatePath } from "next/cache";


const updateSavingById=async (id: string, data: SavingProps) =>{
  try {
    const saving = await db.saving.findUnique({
      where: { id },
    });

    if (!saving) {
      throw new Error("Saving not found");
    }
 await db.saving.update({
  where:{id},
  data:{...data}
 })
     revalidatePath("/dashboard/inventory/savings");
    return { success: true, data: saving };
  } catch (error) {
    console.error("Error fetching saving:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch saving",
    };
  }
}
export default updateSavingById