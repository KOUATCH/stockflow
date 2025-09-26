"use server";

import { getAllPermissions } from "@/config/permissions";
import { createRoleName } from "@/lib/createRoleName";
import { db } from "@/prisma/db";
import { RoleFormData } from "@/types/types";
import { revalidatePath } from "next/cache";

export async function updateRole(id: string, data: Partial<RoleFormData>) {
  try {
    // Validate permissions if they're being updated
    if (data.permissions) {
      const validPermissions = getAllPermissions();
      const invalidPermissions = data.permissions.filter(
        (permission) => !validPermissions.includes(permission)
      );

      if (invalidPermissions.length > 0) {
        throw new Error(
          `Invalid permissions detected: ${invalidPermissions.join(", ")}`
        );
      }
    }

    // Check if new name conflicts with existing role
    if (data.name) {
      const existingRole = await db.role.findFirst({
        where: {
          name: data.name,
          NOT: {
            id: id,
          },
        },
      });

      if (existingRole) {
        throw new Error("A role with this name already exists");
      }
    }

    // Update role
    const role = await db.role.update({
      where: { id },
      data: {
        ...(data.name && {
          name: data.name,
          roleName: createRoleName(data.name),
        }),
        ...(data.description && { description: data.description }),
        ...(data.permissions && { permissions: data.permissions }),
      },
    });

    revalidatePath("/dashboard/settings/roles");
    return { success: true, data: role };
  } catch (error) {
    console.error("Error updating role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}
