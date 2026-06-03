"use server";
import { adminPermissions } from "@/config/permissions";
import { db } from "@/prisma/db";
import { Resend } from "resend";

// import { generateNumericToken } from "@/lib/token";
const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const DEFAULT_USER_ROLE = {
  name: "User",
  code: "user",
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
  code: "admin",
  description: "Default Admin role with all permissions",
  permissions: adminPermissions
};




export async function getAllMembers() {
  try {
    const members = await db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    return members.map((member) => ({
      id: member.id,
      name: [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email,
    }));
  } catch (error) {
    console.error("Error fetching the count:", error);
    return 0;
  }
}
