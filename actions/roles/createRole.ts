"use server";

import { getAllPermissions } from "@/config/permissions";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { createRoleName } from "@/lib/createRoleName";
import { db } from "@/prisma/db";
import { RoleFormData } from "@/types/types";
import { revalidatePath } from "next/cache";
import { withDisplayRoleName } from "./role-utils";

const  createRole=async(data: RoleFormData)=> {
  const user = await getAuthenticatedUser()
  try {
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
  console.log(user.organizationId)
    // Check if role with same name exists in the organization
    const existingRole = await db.role.findFirst({
      where: {
        nameEn: data.name,
        organizationId:user.organizationId
      },
    });

    if (existingRole) {
      throw new Error("A role with this name already exists");
    }

    // Create role with permissions
    const role = await db.role.create({
      data: {
        code: createRoleName(data.name),
        nameEn: data.name,
        description: data.description,
        permissions: data.permissions,
        organizationId:user.organizationId

      },
    });

    revalidatePath("/dashboard/settings/roles");
    return { success: true, data: withDisplayRoleName(role) };
  } catch (error) {
    console.error("Error creating role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create role",
    };
  }
}
export default createRole
