"use server";
import { adminPermissions } from "@/config/permissions";
import { db } from "@/prisma/db";


const DEFAULT_USER_ROLE = {
  name: "User",
  roleName: "user",
  description: "Default user role with basic permissions",
  permissions: [
    "dashboard.read",
    "profile.read",
    "profile.update",
    "orders.read",
  ],
};

const ADMIN_USER_ROLE = {
  name: "Admin",
  roleName: "admin",
  description: "Default Admin role with all permissions",
  permissions: adminPermissions
};


const getOrgUsers=async(organizationId:string)=> {

  try {
    const organizationUsers = await db.user.findMany({
    where:{
      organizationId:organizationId  
    },
    include:{
      roles:true
    }
    });
    //  if (!organizationUsers) {
    //   return {
    //     status: 404,
    //     error: "No users for this organization",
    //     data: null,
    //   };
    // }
    return organizationUsers
  } catch (error) {
    console.error("Error fetching the Users:", error);
    return 0;
  }
}
export default getOrgUsers