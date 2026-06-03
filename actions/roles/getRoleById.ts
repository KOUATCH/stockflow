"use server";

import { db } from "@/prisma/db";
import { withDisplayRoleName } from "./role-utils";


export async function getRoleById(id: string) {
  try {
    const role = await db.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new Error("Role not found");
    }

    return { success: true, data: withDisplayRoleName(role) };
  } catch (error) {
    console.error("Error fetching role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch role",
    };
  }
}
