"use server";

import { db } from "@/prisma/db";
import { CreateUserProps } from "@/types/types";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getAuthenticatedUser } from "@/config/useAuth";
import { hasAppPermission, safeUserSelect } from "@/lib/security/server-authz";
import { checkPasswordPolicy } from "@/services/auth/password-policy";

const displayUserName = (user: { firstName: string | null; lastName: string | null; email: string }) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

const withDisplayRoleName = <T extends { nameEn: string; nameFr: string | null }>(role: T) => ({
  ...role,
  name: role.nameEn || role.nameFr || "",
});

async function requireUserPermission(permission: string) {
  const authUser = await getAuthenticatedUser()
  if (!hasAppPermission(authUser, permission)) {
    throw new Error("Forbidden")
  }
  return authUser
}

// Get all users for an organization
export async function getUsers(organizationId: string) {
  try {
    const authUser = await requireUserPermission("users.read")

    if (organizationId !== authUser.organizationId) {
      return {
        error: "Forbidden",
        success: false,
      }
    }

    const users = await db.user.findMany({
      where: {
        organizationId: authUser.organizationId,
      },
      select: safeUserSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: users.map((user) => ({
        ...user,
        name: displayUserName(user),
        roles: user.roles.map(withDisplayRoleName),
      })),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      error: "Failed to fetch users",
      success: false,
    };
  }
}

// Get a single user by ID
export async function getUser(userId: string) {
  try {
    const authUser = await getAuthenticatedUser()
    const canReadUsers = hasAppPermission(authUser, "users.read")

    if (userId !== authUser.id && !canReadUsers) {
      return {
        error: "Forbidden",
        success: false,
      }
    }

    const user = await db.user.findFirst({
      where: { id: userId, organizationId: authUser.organizationId },
      select: {
        ...safeUserSelect,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      return {
        error: "User not found",
        success: false,
      };
    }


    return {
      success: true,
      data: {
        ...user,
        name: displayUserName(user),
        roles: user.roles.map(withDisplayRoleName),
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      error: "Failed to fetch user",
      success: false,
    };
  }
}

// Create a new user directly
export async function createUser(data: CreateUserProps) {
  try {
    const authUser = await requireUserPermission("users.create")

    const {
      firstName,
      lastName,
      email,
      phone,
      image,
      roleId,
      password,
      jobTitle,
      isActive = true,
    } = data;


    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await db.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });

    if (existingUser) {
      return {
        error: "User with this email already exists",
        success: false,
      };
    }

    // Verify the role exists and belongs to the organization
    const role = await db.role.findFirst({
      where: { id: roleId, organizationId: authUser.organizationId },
    });

    if (!role) {
      return {
        error: "Invalid role selected",
        success: false,
      };
    }

    const passwordPolicy = await checkPasswordPolicy({ password, email: normalizedEmail })
    if (!passwordPolicy.ok) {
      return {
        error: passwordPolicy.message,
        success: false,
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const newUser = await db.user.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        phone,
        image,
        password: hashedPassword,
        jobTitle,
        isActive,
        organizationId: authUser.organizationId,
        isVerified: true, // Auto-verify created users
        roles: {
          connect: { id: roleId },
        },
      },
      include: {
        roles: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
            code: true,
            description: true,
          },
        },
      },
    });

    await db.passwordHistory.create({
      data: {
        userId: newUser.id,
        passwordHash: hashedPassword,
      },
    })

    return {
      success: true,
      message: "User created successfully",
      data: {
        id: newUser.id,
        email: newUser.email,
        name: displayUserName(newUser),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        jobTitle: newUser.jobTitle,
        isActive: newUser.isActive,
        roles: newUser.roles.map(withDisplayRoleName),
      },
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      error: "Failed to create user",
      success: false,
    };
  }
}

// Update user information
export async function updateUser(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    jobTitle?: string;
    image?: string;
  }
) {
  try {
    const authUser = await requireUserPermission("users.update")

    // Get the existing user
    const existingUser = await db.user.findFirst({
      where: { id: userId, organizationId: authUser.organizationId },
      include: { roles: true },
    });

    if (!existingUser) {
      return {
        error: "User not found",
        success: false,
      };
    }


    const updateData: any = {};

    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.phone) updateData.phone = data.phone;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.image !== undefined) updateData.image = data.image;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        image: true,
        jobTitle: true,
        isActive: true,
        isVerified: true,
        updatedAt: true,
        roles: {
          select: {
            id: true,
            nameEn: true,
            nameFr: true,
            code: true,
            description: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "User updated successfully",
      data: {
        ...updatedUser,
        name: displayUserName(updatedUser),
        roles: updatedUser.roles.map(withDisplayRoleName),
      },
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      error: "Failed to update user",
      success: false,
    };
  }
}

// Deactivate/Activate user
export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    const authUser = await requireUserPermission(isActive ? "users.activate" : "users.deactivate")

    // Get the user with roles
    const user = await db.user.findFirst({
      where: { id: userId, organizationId: authUser.organizationId },
      include: { roles: true },
    });

    if (!user) {
      return {
        error: "User not found",
        success: false,
      };
    }


    // Prevent deactivating last admin
    if (!isActive) {
      const isAdmin = user.roles.some(role =>
        ['administrator', 'super_admin'].includes(role.code)
      );

      if (isAdmin) {
        const activeAdmins = await db.user.count({
          where: {
            organizationId: user.organizationId,
            isActive: true,
            id: { not: userId },
            roles: {
              some: {
                code: { in: ['administrator', 'super_admin'] }
              }
            }
          }
        });

        if (activeAdmins === 0) {
          return {
            error: "Cannot deactivate the last active administrator",
            success: false,
          };
        }
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
      },
    });

    return {
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        ...updatedUser,
        name: displayUserName(updatedUser),
      },
    };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return {
      error: "Failed to update user status",
      success: false,
    };
  }
}

// Delete user (soft delete by deactivation)
export async function deleteUser(userId: string) {
  try {
    const authUser = await requireUserPermission("users.delete")

    // Get the user with roles
    const user = await db.user.findFirst({
      where: { id: userId, organizationId: authUser.organizationId },
      include: { roles: true },
    });

    if (!user) {
      return {
        error: "User not found",
        success: false,
      };
    }


    // Prevent deleting last admin
    const isAdmin = user.roles.some(role =>
      ['administrator', 'super_admin'].includes(role.code)
    );

    if (isAdmin) {
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
          error: "Cannot delete the last administrator",
          success: false,
        };
      }
    }

    // Instead of hard delete, we'll deactivate the user
    // This preserves data integrity for historical records
    await db.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        // Optionally anonymize data
        email: `deleted_${userId}@deleted.local`,
        phone: null,
      },
    });

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      error: "Failed to delete user",
      success: false,
    };
  }
}

// Update user password
export async function updateUserPassword(
  userId: string,
  data: {
    currentPassword?: string;
    newPassword: string;
  }
) {
  try {
    const authUser = await getAuthenticatedUser()

    if (userId !== authUser.id && !hasAppPermission(authUser, "users.password.reset")) {
      return {
        error: "Forbidden",
        success: false,
      }
    }

    const user = await db.user.findFirst({
      where: { id: userId, organizationId: authUser.organizationId },
    });

    if (!user) {
      return {
        error: "User not found",
        success: false,
      };
    }

    // If current password is provided, verify it
    if (userId === authUser.id && data.currentPassword) {
      const isValidPassword = await verifyPassword(user.password, data.currentPassword);
      if (!isValidPassword) {
        return {
          error: "Current password is incorrect",
          success: false,
        };
      }
    }

    if (userId === authUser.id && !data.currentPassword) {
      return {
        error: "Current password is required",
        success: false,
      }
    }

    const passwordPolicy = await checkPasswordPolicy({
      password: data.newPassword,
      userId: user.id,
      email: user.email,
    })

    if (!passwordPolicy.ok) {
      return {
        error: passwordPolicy.message,
        success: false,
      }
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })

      await tx.passwordHistory.create({
        data: {
          userId,
          passwordHash: hashedPassword,
        },
      })
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Error updating password:", error);
    return {
      error: "Failed to update password",
      success: false,
    };
  }
}
