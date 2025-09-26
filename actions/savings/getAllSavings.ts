"use server";

import { db } from "@/prisma/db";

export async function getAllSavings() {
  try {
    const savings = await db.saving.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return savings;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getSavingById(id: string) {
  try {
    const saving = await db.saving.findUnique({
      where: {
        id,
      },
    });
    return saving;
  } catch (error) {
    console.log(error);
    return null;
  }
}