"use server";
import { PasswordProps } from "@/components/Forms/ChangePasswordForm";
import { adminPermissions } from "@/config/permissions";
import { getAuthenticatedUser } from "@/config/useAuth";
import { hasAppPermission } from "@/lib/security/server-authz";
import { db } from "@/prisma/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { checkPasswordPolicy } from "@/services/auth/password-policy";
import { revalidatePath } from "next/cache";
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

export async function updateUserPassword(id: string, data: PasswordProps) {
  const authUser = await getAuthenticatedUser();

  if (id !== authUser.id && !hasAppPermission(authUser, "users.password.reset")) {
    return { error: "Forbidden", status: 403 };
  }

  const existingUser = await db.user.findFirst({
    where: {
      id,
      organizationId: authUser.organizationId,
    },
  });

  if (!existingUser) {
    return { error: "User not found", status: 404 };
  }

  // Check if the Old Passw = User Pass
  let passwordMatch: boolean = false;
  //Check if Password is correct
  if (existingUser.password) {
    // if user exists and password exists
    passwordMatch = await verifyPassword(existingUser.password, data.oldPassword);
  }
  if (!passwordMatch) {
    return { error: "Old Password Incorrect", status: 403 };
  }
  const passwordPolicy = await checkPasswordPolicy({
    password: data.newPassword,
    userId: existingUser.id,
    email: existingUser.email,
  });

  if (!passwordPolicy.ok) {
    return { error: passwordPolicy.message, status: 400 };
  }

  const hashedPassword = await hashPassword(data.newPassword);
  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id,
        },
        data: {
          password: hashedPassword,
        },
      });

      await tx.passwordHistory.create({
        data: {
          userId: id,
          passwordHash: hashedPassword,
        },
      });
    });
    revalidatePath("/dashboard/clients");
    return { error: null, status: 200 };
  } catch (error) {
    console.log(error);
  }
}
export async function resetUserPassword(
  email: string,
  token: string,
  newPassword: string
) {
  const user = await db.user.findFirst({
    where: {
      email,
      verificationToken: token,
      verificationTokenExpires: { gt: new Date() },
    },
  });
  if (!user) {
    return {
      status: 404,
      error: "Please use a valid reset link",
      data: null,
    };
  }
  const passwordPolicy = await checkPasswordPolicy({
    password: newPassword,
    userId: user.id,
    email: user.email,
  });

  if (!passwordPolicy.ok) {
    return {
      status: 400,
      error: passwordPolicy.message,
      data: null,
    };
  }

  const hashedPassword = await hashPassword(newPassword);
  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });

      await tx.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: hashedPassword,
        },
      });
    });
    return {
      status: 200,
      error: null,
      data: null,
    };
  } catch (error) {
    console.log(error);
  }
}

