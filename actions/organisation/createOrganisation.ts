"use server";
import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { OrganizationProps } from "@/types/types";


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


      //check if the organization already exists
      const existingOrganization = await tx.organization.findUnique({

        where: {
        id: data?.id,
        }
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
          ...data,
          // name: data?.name ,
          // slug: data?.slug,
        
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

