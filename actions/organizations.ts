"use server";

import { Locale as PrismaLocale } from "@prisma/client";
import { randomUUID } from "crypto";
import { db } from "@/prisma/db";
import { generateSlug } from "@/lib/generateSlug";
import { revalidatePath } from "next/cache";

type OrganizationMutationData = {
  name: string;
  slug?: string;
  industry?: string | null;
  country?: string | null;
  state?: string | null;
  address?: string | null;
  currency?: string;
  timezone?: string;
  defaultLocale?: "en" | "fr";
  inventoryStartDate?: Date | null;
  fiscalYearStart?: string | null;
  isActive?: boolean;
};

function cleanText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeSlug(value: string) {
  const slug = generateSlug(value).replace(/^-+|-+$/g, "");
  return slug || `organization-${randomUUID().slice(0, 8)}`;
}

function toPrismaLocale(value?: string | null) {
  return value === "fr" ? PrismaLocale.FR : PrismaLocale.EN;
}

function revalidateOrganizationPaths() {
  revalidatePath("/[locale]/dashboard/settings/company", "page");
  revalidatePath("/[locale]/dashboard/settings/organization", "page");
}

function userDisplayName(user: { firstName: string | null; lastName: string | null; email: string }) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

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
            firstName: true,
            lastName: true,
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
      data: organizations.map((organization) => ({
        ...organization,
        users: organization.users.map((user) => ({
          ...user,
          name: userDisplayName(user),
        })),
      })),
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
            firstName: true,
            lastName: true,
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
      data: {
        ...organization,
        users: organization.users.map((user) => ({
          ...user,
          name: userDisplayName(user),
        })),
      },
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
  slug?: string;
  industry?: string | null;
  country?: string | null;
  state?: string | null;
  address?: string | null;
  currency?: string;
  timezone?: string;
  defaultLocale?: "en" | "fr";
}) {
  try {
    const slug = organizationData.slug || normalizeSlug(organizationData.name);

    const newOrganization = await db.organization.create({
      data: {
        id: randomUUID(),
        name: organizationData.name,
        slug,
        industry: cleanText(organizationData.industry),
        country: cleanText(organizationData.country),
        state: cleanText(organizationData.state),
        address: cleanText(organizationData.address),
        currency: organizationData.currency || "XAF",
        timezone: organizationData.timezone || "Africa/Douala",
        defaultLocale: toPrismaLocale(organizationData.defaultLocale),
        isActive: true,
        updatedAt: new Date(),
      },
    });

    revalidateOrganizationPaths();

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
  slug: string;
  industry: string | null;
  country: string | null;
  state: string | null;
  address: string;
  currency: string;
  timezone: string;
  defaultLocale: "en" | "fr";
  inventoryStartDate: Date | null;
  fiscalYearStart: string | null;
  isActive: boolean;
}>) {
  try {
    const updateData: Partial<OrganizationMutationData> = {
      ...(organizationData.name !== undefined ? { name: organizationData.name } : {}),
      ...(organizationData.slug !== undefined ? { slug: organizationData.slug } : {}),
      ...(organizationData.industry !== undefined ? { industry: cleanText(organizationData.industry) } : {}),
      ...(organizationData.country !== undefined ? { country: cleanText(organizationData.country) } : {}),
      ...(organizationData.state !== undefined ? { state: cleanText(organizationData.state) } : {}),
      ...(organizationData.address !== undefined ? { address: cleanText(organizationData.address) } : {}),
      ...(organizationData.currency !== undefined ? { currency: organizationData.currency } : {}),
      ...(organizationData.timezone !== undefined ? { timezone: organizationData.timezone } : {}),
      ...(organizationData.defaultLocale !== undefined ? { defaultLocale: organizationData.defaultLocale } : {}),
      ...(organizationData.inventoryStartDate !== undefined ? { inventoryStartDate: organizationData.inventoryStartDate } : {}),
      ...(organizationData.fiscalYearStart !== undefined ? { fiscalYearStart: organizationData.fiscalYearStart } : {}),
      ...(organizationData.isActive !== undefined ? { isActive: organizationData.isActive } : {}),
    };

    const updatedOrganization = await db.organization.update({
      where: { id: organizationId },
      data: {
        ...updateData,
        defaultLocale: updateData.defaultLocale ? toPrismaLocale(updateData.defaultLocale) : undefined,
        updatedAt: new Date(),
      },
    });

    revalidateOrganizationPaths();

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

    revalidateOrganizationPaths();

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
