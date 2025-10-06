"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Get all organizations
export async function getOrganizations() {
  try {

    const organizations = await db.organization.findMany({
      orderBy: {
        name: "desc",
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          }
        },
        _count: {
          select: {
            users: true,
            items: true,
            locations: true,
          }
        }
      }
    });

    return {
      success: true,
      data: organizations,
    };
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return {
      success: false,
      error: "Failed to fetch organizations",
    };
  }
}

// Get organization by ID
export async function getOrganizationById(organizationId: string) {
  try {

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            roles: true,
          }
        },
        locations: true,
        items: {
          take: 10, // Get first 10 items
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: {
            users: true,
            items: true,
            locations: true,
          }
        }
      }
    });

    if (!organization) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    console.error("Error fetching organization:", error);
    return {
      success: false,
      error: "Failed to fetch organization",
    };
  }
}

// Create a new organization
export async function createOrganization(organizationData: {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}) {
  try {

    const newOrganization = await db.organization.create({
      data: organizationData,
    });

    revalidatePath("/dashboard/settings/organizations");

    return {
      success: true,
      data: newOrganization,
    };
  } catch (error) {
    console.error("Error creating organization:", error);
    return {
      success: false,
      error: "Failed to create organization",
    };
  }
}

// Update an organization
export async function updateOrganization(organizationId: string, organizationData: Partial<{
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}>) {
  try {

    const updatedOrganization = await db.organization.update({
      where: { id: organizationId },
      data: organizationData,
    });

    revalidatePath("/dashboard/settings/organizations");

    return {
      success: true,
      data: updatedOrganization,
    };
  } catch (error) {
    console.error("Error updating organization:", error);
    return {
      success: false,
      error: "Failed to update organization",
    };
  }
}

// Delete an organization
export async function deleteOrganization(organizationId: string) {
  try {

    // Check if organization has dependencies
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            users: true,
            items: true,
            locations: true,
          }
        }
      }
    });

    if (!organization) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Prevent deletion if organization has users, items, or locations
    if (organization._count.users > 0 || organization._count.items > 0 || organization._count.locations > 0) {
      return {
        success: false,
        error: "Cannot delete organization with existing users, items, or locations",
      };
    }

    await db.organization.delete({
      where: { id: organizationId },
    });

    revalidatePath("/dashboard/settings/organizations");

    return {
      success: true,
      message: "Organization deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting organization:", error);
    return {
      success: false,
      error: "Failed to delete organization",
    };
  }
}