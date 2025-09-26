"use server";
import VerifyEmail from "@/components/email-templates/verify-email";
import { OrgDataProps } from "@/components/Forms/RegisterForm";
import { adminPermissions } from "@/config/permissions";
import { generateOtp } from "@/lib/generateOtp";
import { db } from "@/prisma/db";
import { UserProps } from "@/types/types";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

// import { generateNumericToken } from "@/lib/token";
const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const ADMIN_USER_ROLE = {
  name: "Admin",
  description: "Default Admin role with all permissions",
  permissions: adminPermissions,
  // organization:""
};

const createUser = async (data: UserProps, orgData: OrgDataProps) => {
  const { email, password, firstName, lastName, name, phone, image } = data;

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      // Check for existing users
      const existingUserByEmail = await tx.user.findUnique({
        where: { email },
      });

      const existingUserByPhone = await tx.user.findUnique({
        where: { phone },
      });

      if (existingUserByEmail) {
        return {
          error: `This email ${email} is already in use`,
          status: 409,
          data: null,
        };
      }

      if (existingUserByPhone) {
        return {
          error: `This Phone number ${phone} is already in use`,
          status: 409,
          data: null,
        };
      }

      // Create  an Organization
      const existingOrg = await tx.organization.findUnique({
        where: { slug: orgData.slug },
      });
      if (existingOrg) {
        return {
          error: `This organization name ${orgData.slug} already exists, so it is not available`,
          status: 409,
          data: null,
        };
      }
      console.log("Creating an Organization...");
      const org = await tx.organization.create({ data: orgData })
      // Find or create default role

      // Find or create default admin  role
      let defaultRole = await tx.role.findFirst({
        where: { name: ADMIN_USER_ROLE.name },
      });

      // Create default role if it doesn't exist
      if (!defaultRole) {
        defaultRole = await tx.role.create({
          data: {
            ...ADMIN_USER_ROLE,
            code:"",
            organizationId: org.id
          },
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      //  generate a 6-digit token for otp then add it to the User
      const token = generateOtp();

      // Create user with role
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          organizationId: org.id,
          token,
          name,
          phone,
          image,
          isVerified: true,
          // Add the default role to the user   
          roles: {
            connect: {
              id: defaultRole.id,
            },
          },
        },
        include: {
          roles: true, // Include roles in the response
        },
      });
      // send verification email
      const verificationCode = newUser?.token ?? ""

      const { data, error } = await resend.emails.send({
        // from:"PosInvent <kouatch@posinvent.com>",
        from: "onboarding@resend.dev",
        to: email,
        subject: "Verify your account.",
        react: VerifyEmail({ verificationCode })
      })
      if (error) {
        console.log({ error })
      }
      console.log({ data })
      return {
        error: null,
        status: 200,
        data: { id: newUser?.id, email: newUser?.email },
      };
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}

export default createUser

