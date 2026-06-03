"use server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { generateSlug } from "@/lib/generateSlug";
import { db } from "@/prisma/db";
import { OrganizationProps } from "@/types/types";
import { Locale as PrismaLocale } from "@prisma/client";
import { randomUUID } from "crypto";

function cleanText(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toPrismaLocale(value?: string | null) {
  return value === "fr" ? PrismaLocale.FR : PrismaLocale.EN
}


const createOrganization = async (data: OrganizationProps) => {
  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      const user = await getAuthenticatedUser();
      // Check if the user is authenticated and has an organizationId
      if (!user || !user.organizationId) {
        return {
          error: `User not found`,
          status: 404,
          data: null,
        };
      }


      const requestedSlug = data.slug || generateSlug(data.name).replace(/^-+|-+$/g, "")
      const slug = requestedSlug || `organization-${randomUUID().slice(0, 8)}`
      const existingOrganization = await tx.organization.findFirst({
        where: {
          OR: [
            ...(data.id ? [{ id: data.id }] : []),
            { slug },
          ],
        },
      });

      console.log({ existingOrganization })
      if (existingOrganization) {
        return {
          error: `This Organization ${data?.name} already  exists for this organization`,
          status: 409,
          data: null,
        };
      }

      const newOrganization = await tx.organization.create({
        data: {
          id: data.id || randomUUID(),
          name: data.name,
          slug,
          industry: cleanText(data.industry),
          country: cleanText(data.country),
          state: cleanText(data.state),
          address: cleanText(data.address),
          currency: data.currency || "XAF",
          timezone: data.timezone || "Africa/Douala",
          defaultLocale: toPrismaLocale(data.defaultLocale),
          inventoryStartDate: data.inventoryStartDate,
          fiscalYearStart: data.fiscalYearStart,
          isActive: data.isActive ?? true,
          updatedAt: new Date(),
        },
      });
      // Revalidate the path to refresh the data


      console.log({ data })
      return {
        error: null,
        status: 200,
        data: { id: newOrganization?.id, email: newOrganization?.name },
      };
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}

export default createOrganization
