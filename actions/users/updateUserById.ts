"use server";

import { db } from "@/prisma/db";


const updateUserById=async (id: string) =>{
  try {
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    };
  }
}
export default updateUserById