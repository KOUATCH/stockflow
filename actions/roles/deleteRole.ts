"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export async function deleteRole(id: string) {
  try {
    // Check if role is assigned to any users
    const usersWithRole = await db.user.findMany({
      where: {
        roles: {
          some: {
            id: id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (usersWithRole.length > 0) {
      throw new Error("Cannot delete role as it is assigned to users");
    }

    // Delete role
    await db.role.delete({
      where: { id },
    });
    revalidatePath("/dashboard/settings/roles");
    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete role",
    };
  }
}
