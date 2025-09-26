"use server";

import { db } from "@/prisma/db";
import { SavingProps } from "@/types/types";
import { revalidatePath } from "next/cache";

const  createSaving=async(data: SavingProps)=> {
  try {
    const newSaving = await db.saving.create({
      data,
    });
    // console.log(newCategory);
    revalidatePath("/dashboard/savings");
    return newSaving;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export default createSaving;

