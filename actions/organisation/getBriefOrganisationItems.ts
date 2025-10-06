"use server";
import { db } from "@/prisma/db";
import { Resend } from "resend";

// import { generateNumericToken } from "@/lib/token";
const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;


const getBriefOrgItems = async (orgId:string) => {
  try {
    // const user = await getAuthenticatedUser();
    // if (!user) {
    //   throw new Error("User not authenticated");
    // }
    // const userOrg = user.organizationId || user.organizationId;
    // if (!userOrg) {
    //   throw new Error("User does not belong to an organization");
    // }
    // // Check if the user belongs to an organization 
    // const org = await db.organization.findUnique({
    //   where: {
    //     id: userOrg,
    //   },
    // });
    // if (!org) {
    //   throw new Error("Organization not found");
    // }
    // Fetch items for the organization
    const items = await db.item.findMany({
      where: {
        organizationId: orgId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        thumbnail: true,
        costPrice: true,
        sellingPrice: true,
        slug: true,
       
      },
      orderBy: {
        name: "desc",
      },
    });
    if (!items) {
      throw new Error("No items found for this organization");
    }
    return items
  } catch (error) {
    console.error("Error fetching the count:", error);
    return 0;
  }
}
export default getBriefOrgItems