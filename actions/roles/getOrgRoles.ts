

"use server";

import { db } from "@/prisma/db";
import { withDisplayRoleName } from "./role-utils";


const getOrgRoles=async(orgId:string)=> {
  try {
    const orgRoles = await db.role.findMany({
      where:{organizationId:orgId},
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: orgRoles.map(withDisplayRoleName) };
  } catch (error) {
    console.error("Error fetching org roles:", error);
    return {
      success: false,
      error: "Failed to fetch org roles",
    };
  }
}
export default getOrgRoles 
