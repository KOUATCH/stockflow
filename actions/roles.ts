"use server";

import { ROLE_TEMPLATES } from "@/lib/permissions";
import { db } from "@/prisma/db";
import { RoleFormData } from "@/types/types";

const displayUserName = (user: { firstName: string | null; lastName: string | null; email: string }) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

const withDisplayRoleName = <T extends { nameEn: string; nameFr: string | null }>(role: T) => ({
  ...role,
  name: role.nameEn || role.nameFr || "",
});

// Get all roles for an organization
export async function getRoles(organizationId: string) {
  try {

    const roles = await db.role.findMany({
      where: {
        organizationId,
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: roles.map((role) => ({
        ...withDisplayRoleName(role),
        users: role.users.map((user) => ({
          ...user,
          name: displayUserName(user),
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return {
      error: "Failed to fetch roles",
      success: false,
    };
  }
}

// Create a new role
export async function createRole(data: RoleFormData) {
  try {
    const { name, description, permissions, organizationId } = data;

    // Generate a unique code from the name
    const code = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Check if role with same code already exists
    const existingRole = await db.role.findFirst({
      where: {
        organizationId,
        code,
      },
    });

    if (existingRole) {
      return {
        error: "A role with this name already exists",
        success: false,
      };
    }

    const newRole = await db.role.create({
      data: {
        nameEn: name,
        code,
        description,
        permissions,
        organizationId,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Role created successfully",
      data: withDisplayRoleName(newRole),
    };
  } catch (error) {
    console.error("Error creating role:", error);
    return {
      error: "Failed to create role",
      success: false,
    };
  }
}

// Update an existing role
export async function updateRole(roleId: string, data: Partial<RoleFormData>) {
  try {
    // Get the existing role
    const existingRole = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return {
        error: "Role not found",
        success: false,
      };
    }

    const updateData: any = {};

    if (data.name) {
      updateData.nameEn = data.name;
      updateData.code = data.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

      // Check if another role with same code exists
      const codeExists = await db.role.findFirst({
        where: {
          organizationId: existingRole.organizationId,
          code: updateData.code,
          id: { not: roleId },
        },
      });

      if (codeExists) {
        return {
          error: "A role with this name already exists",
          success: false,
        };
      }
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.permissions) {
      updateData.permissions = data.permissions;
    }

    const updatedRole = await db.role.update({
      where: { id: roleId },
      data: updateData,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Role updated successfully",
      data: withDisplayRoleName(updatedRole),
    };
  } catch (error) {
    console.error("Error updating role:", error);
    return {
      error: "Failed to update role",
      success: false,
    };
  }
}

// Delete a role
export async function deleteRole(roleId: string) {
  try {
    // Get the role with user count
    const role = await db.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      return {
        error: "Role not found",
        success: false,
      };
    }

    // Check if role has users assigned
    if (role._count.users > 0) {
      return {
        error: "Cannot delete role with assigned users. Please reassign users first.",
        success: false,
      };
    }

    // Prevent deletion of essential roles
    if (['administrator', 'super_admin'].includes(role.code)) {
      return {
        error: "Cannot delete essential system roles",
        success: false,
      };
    }

    await db.role.delete({
      where: { id: roleId },
    });

    return {
      success: true,
      message: "Role deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting role:", error);
    return {
      error: "Failed to delete role",
      success: false,
    };
  }
}

// Assign role to user
export async function assignRoleToUser(userId: string, roleId: string) {
  try {
    // Get the role and user
    const [role, user] = await Promise.all([
      db.role.findUnique({ where: { id: roleId } }),
      db.user.findUnique({
        where: { id: userId },
        include: { roles: true }
      }),
    ]);

    if (!role || !user) {
      return {
        error: "Role or user not found",
        success: false,
      };
    }

    // Check if user already has this role
    if (user.roles.some(r => r.id === roleId)) {
      return {
        error: "User already has this role",
        success: false,
      };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId },
        },
      },
    });

    return {
      success: true,
      message: "Role assigned successfully",
    };
  } catch (error) {
    console.error("Error assigning role:", error);
    return {
      error: "Failed to assign role",
      success: false,
    };
  }
}

// Remove role from user
export async function removeRoleFromUser(userId: string, roleId: string) {
  try {
    // Get the user with roles
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      return {
        error: "User not found",
        success: false,
      };
    }

    // Check if user has this role
    if (!user.roles.some(r => r.id === roleId)) {
      return {
        error: "User doesn't have this role",
        success: false,
      };
    }

    // Prevent removing last admin role
    const adminRoles = user.roles.filter(r =>
      ['administrator', 'super_admin'].includes(r.code)
    );

    if (adminRoles.length === 1 && adminRoles[0].id === roleId) {
      const otherAdmins = await db.user.count({
        where: {
          organizationId: user.organizationId,
          id: { not: userId },
          roles: {
            some: {
              code: { in: ['administrator', 'super_admin'] }
            }
          }
        }
      });

      if (otherAdmins === 0) {
        return {
          error: "Cannot remove the last administrator role from organization",
          success: false,
        };
      }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        roles: {
          disconnect: { id: roleId },
        },
      },
    });

    return {
      success: true,
      message: "Role removed successfully",
    };
  } catch (error) {
    console.error("Error removing role:", error);
    return {
      error: "Failed to remove role",
      success: false,
    };
  }
}

// Initialize default roles for organization
export async function initializeDefaultRoles(organizationId: string) {
  try {
    const existingRoles = await db.role.findMany({
      where: { organizationId },
    });

    // If roles already exist, don't create defaults
    if (existingRoles.length > 0) {
      return {
        success: true,
        message: "Roles already exist",
      };
    }

    // Create default roles from templates
    const defaultRoles = [
      ROLE_TEMPLATES.ADMIN,
      ROLE_TEMPLATES.MANAGER,
      ROLE_TEMPLATES.SUPERVISOR,
      ROLE_TEMPLATES.EMPLOYEE,
      ROLE_TEMPLATES.CASHIER,
      ROLE_TEMPLATES.VIEWER,
    ];

    const createdRoles = await Promise.all(
      defaultRoles.map(template =>
        db.role.create({
          data: {
            nameEn: template.name,
            code: template.code,
            description: template.description,
            permissions: Array.from(template.permissions),
            organizationId,
          },
        })
      )
    );

    return {
      success: true,
      message: "Default roles created successfully",
      data: createdRoles.map(withDisplayRoleName),
    };
  } catch (error) {
    console.error("Error initializing default roles:", error);
    return {
      error: "Failed to initialize default roles",
      success: false,
    };
  }
}

// Get role templates for creating new roles
export async function getRoleTemplates() {
  return {
    success: true,
    data: Object.values(ROLE_TEMPLATES),
  };
}

// Get all available permissions grouped by category
export async function getAvailablePermissions() {
  // Return empty array since permissions are disabled
  return {
    success: true,
    data: [],
  };
}
