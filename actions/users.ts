"use server";

import { db } from "@/prisma/db";
import { CreateUserProps } from "@/types/types";
import { hashPassword, verifyPassword } from "@/lib/password";

// Get all users for an organization
export async function getUsers(organizationId: string) {
  try {

    const users = await db.user.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        image: true,
        jobTitle: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: users,
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

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            permissions: true,
          },
        },
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
      data: user,
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

    const {
      firstName,
      lastName,
      email,
      phone,
      image,
      organizationId,
      roleId,
      password,
      jobTitle,
      isActive = true,
    } = data;


    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: "User with this email already exists",
        success: false,
      };
    }

    // Verify the role exists and belongs to the organization
    const role = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.organizationId !== organizationId) {
      return {
        error: "Invalid role selected",
        success: false,
      };
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const newUser = await db.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone,
        image,
        password: hashedPassword,
        jobTitle,
        isActive,
        organizationId,
        isVerified: true, // Auto-verify created users
        roles: {
          connect: { id: roleId },
        },
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "User created successfully",
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        jobTitle: newUser.jobTitle,
        isActive: newUser.isActive,
        roles: newUser.roles,
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

    // Get the existing user
    const existingUser = await db.user.findUnique({
      where: { id: userId },
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

    // Update name if first or last name changed
    if (data.firstName || data.lastName) {
      updateData.name = `${data.firstName || existingUser.firstName} ${data.lastName || existingUser.lastName}`;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
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
            name: true,
            code: true,
            description: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "User updated successfully",
      data: updatedUser,
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
        name: true,
        email: true,
        isActive: true,
      },
    });

    return {
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser,
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

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        error: "User not found",
        success: false,
      };
    }

    // If current password is provided, verify it
    if (data.currentPassword) {
      const isValidPassword = await verifyPassword(user.password, data.currentPassword);
      if (!isValidPassword) {
        return {
          error: "Current password is incorrect",
          success: false,
        };
      }
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
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