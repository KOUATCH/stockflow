"use server";

import { db } from "@/prisma/db";
import { displayUserName } from "./role-utils";



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
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return {
      success: true,
      data: users.map((user) => ({
        ...user,
        name: displayUserName(user),
      })),
    };
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return {
      success: false,
      error: "Failed to fetch users",
    };
  }
}
