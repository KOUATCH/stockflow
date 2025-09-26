"use server";
import { db } from "@/prisma/db";


export async function getItemById(id: string) {
  try {
    const item = await db.item.findUnique({
      where: {
        id,
      },
    });
    return item;
  } catch (error) {
    console.log(error);
  }
}
 