"use server";

import { getAllPermissions } from "@/config/permissions";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/config/useAuth";
import { createRoleName } from "@/lib/createRoleName";
import { withDisplayRoleName } from "./role-utils";

interface UpdateRolePermissionsData {
  name: string;
  description: string;
  color?: string;
  isActive: boolean;
  permissions: string[];
}

export async function updateRolePermissions(id: string, data: UpdateRolePermissionsData) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate permissions
    const validPermissions = getAllPermissions();
    const invalidPermissions = data.permissions.filter(
      (permission) => !validPermissions.includes(permission)
    );

    if (invalidPermissions.length > 0) {
      throw new Error(
        `Invalid permissions detected: ${invalidPermissions.join(", ")}`
      );
    }

    // Check if the role exists and user has permission to modify it
    const existingRole = await db.role.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
    });

    if (!existingRole) {
      throw new Error("Role not found or access denied");
    }

    // Prevent modification of core roles.
    if (["ADMIN", "MANAGER", "SUPERVISOR", "CASHIER", "VIEWER"].includes(existingRole.code.toUpperCase())) {
      throw new Error("System roles cannot be modified");
    }

    // Check if new name conflicts with existing role (if name is being changed)
    if (data.name !== existingRole.nameEn) {
      const nameConflict = await db.role.findFirst({
        where: {
          nameEn: data.name,
          organizationId: user.organizationId,
          NOT: {
            id: id,
          },
        },
      });

      if (nameConflict) {
        throw new Error("A role with this name already exists");
      }
    }

    // Update role with new permissions and details
    const updatedRole = await db.role.update({
      where: {
        id,
        organizationId: user.organizationId,
      },
      data: {
        nameEn: data.name,
        code: createRoleName(data.name),
        description: data.description,
        permissions: data.permissions,
      },
      include: {
        _count: {
          select: {
            users: true,
          }
        }
      }
    });

    // Revalidate relevant pages
    revalidatePath("/dashboard/settings/roles");
    revalidatePath(`/dashboard/settings/roles/permissions/${id}`);

    return {
      success: true,
      data: withDisplayRoleName(updatedRole),
      message: `Role "${data.name}" updated successfully with ${data.permissions.length} permissions`
    };

  } catch (error) {
    console.error("Error updating role permissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role permissions",
    };
  }
}

export async function createRoleWithPermissions(data: UpdateRolePermissionsData & { organizationId: string }) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate permissions
    const validPermissions = getAllPermissions();
    const invalidPermissions = data.permissions.filter(
      (permission) => !validPermissions.includes(permission)
    );

    if (invalidPermissions.length > 0) {
      throw new Error(
        `Invalid permissions detected: ${invalidPermissions.join(", ")}`
      );
    }

    // Check if role name already exists
    const existingRole = await db.role.findFirst({
      where: {
        nameEn: data.name,
        organizationId: user.organizationId,
      },
    });

    if (existingRole) {
      throw new Error("A role with this name already exists");
    }

    // Create new role
    const newRole = await db.role.create({
      data: {
        nameEn: data.name,
        code: createRoleName(data.name),
        description: data.description,
        permissions: data.permissions,
        organizationId: user.organizationId,
      },
      include: {
        _count: {
          select: {
            users: true,
          }
        }
      }
    });

    // Revalidate relevant pages
    revalidatePath("/dashboard/settings/roles");

    return {
      success: true,
      data: withDisplayRoleName(newRole),
      message: `Role "${data.name}" created successfully with ${data.permissions.length} permissions`
    };

  } catch (error) {
    console.error("Error creating role with permissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create role",
    };
  }
}
