'use server'

import { db } from "@/prisma/db";
import { UpdateUserRoleResponse } from "@/types/types";
import { revalidatePath } from "next/cache";

export async function updateUserRole(
  userId: string,
  roleId: string
): Promise<UpdateUserRoleResponse> {
  try {
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!existingUser) {
      return {
        error: "User not found",
        status: 404,
        data: null,
      };
    }

    // Check if role exists
    const role = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return {
        error: "Role not found",
        status: 404,
        data: null,
      };
    }

    // Update user's roles
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: [], // First clear existing roles
          connect: { id: roleId }, // Then connect new role
        },
      },
      include: {
        roles: true,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard/users");
    revalidatePath(`/dashboard/users/${userId}`);

    return {
      error: null,
      status: 200,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      error: "Failed to update user role",
      status: 500,
      data: null,
    };
  }
}