"use server";

import { db } from "@/prisma/db";



// Helper function to get users by role
export async function getUsersByRole(roleId: string) {
  try {
    const users = await db.user.findMany({
      where: {
        roles: {
          some: {
            id: roleId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return {
      success: false,
      error: "Failed to fetch users",
    };
  }
}
