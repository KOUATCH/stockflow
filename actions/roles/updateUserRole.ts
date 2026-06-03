'use server'

import { getAuthenticatedUser } from "@/config/useAuth";
import { hasAppPermission, safeUserSelect } from "@/lib/security/server-authz";
import { logSecurityEvent, SecurityEventType } from "@/lib/security/audit-log";
import { db } from "@/prisma/db";
import { UpdateUserRoleResponse } from "@/types/types";
import { revalidatePath } from "next/cache";

export async function updateUserRole(
  userId: string,
  roleId: string
): Promise<UpdateUserRoleResponse> {
  try {
    const authUser = await getAuthenticatedUser();

    if (!hasAppPermission(authUser, "users.roles.assign")) {
      return {
        error: "Forbidden",
        status: 403,
        data: null,
      };
    }

    // Check if user exists
    const existingUser = await db.user.findFirst({
      where: { id: userId, organizationId: authUser.organizationId },
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
    const role = await db.role.findFirst({
      where: { id: roleId, organizationId: authUser.organizationId },
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
      select: safeUserSelect,
    });

    void logSecurityEvent({
      type: SecurityEventType.ROLE_CHANGED,
      userId: authUser.id,
      organizationId: authUser.organizationId,
      resource: userId,
      details: {
        previousRoleIds: existingUser.roles.map((userRole) => userRole.id),
        nextRoleId: role.id,
      },
    })

    // Revalidate relevant paths
    revalidatePath("/dashboard/users");
    revalidatePath(`/dashboard/users/${userId}`);

    return {
      error: null,
      status: 200,
      data: updatedUser as unknown as UpdateUserRoleResponse["data"],
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
