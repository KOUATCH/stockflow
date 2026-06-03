"use server";
import { adminPermissions } from "@/config/permissions";
import { getAuthenticatedUser } from "@/config/useAuth";
import { hasAppPermission, safeUserSelect } from "@/lib/security/server-authz";
import { db } from "@/prisma/db";
import { Resend } from "resend";

// import { generateNumericToken } from "@/lib/token";
const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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


export async function getAllUsers() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!hasAppPermission(authUser, "users.read")) {
      return [];
    }

    const users = await db.user.findMany({
      where: {
        organizationId: authUser.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: safeUserSelect,
    });
    return users;
  } catch (error) {
    console.error("Error fetching the count:", error);
    return [];
  }
}
