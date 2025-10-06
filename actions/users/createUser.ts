"use server"

import VerifyEmail from "@/components/email-templates/verify-email"
// import { adminPermissions } from "@/config/permissions"
import { hashPassword } from "@/lib/argon2-server"
import { generateOtp } from "@/lib/generateOtp"
import { db } from "@/prisma/db"
import type { OrgDataProps, UserProps } from "@/types/types"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const ADMIN_USER_ROLE = {
  name: "Admin",
  description: "Default Admin role with all permissions",
  permissions: [], // Provide an array of permission strings, e.g. ["read", "write", "delete"]
}

/**
 * Creates a new user with organization and default admin role
 */
const createUser = async (data: UserProps, orgData: OrgDataProps) => {
  const { email, password, firstName, lastName, name, phone, image } = data

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
      // Check for existing users
      const existingUserByEmail = await tx.user.findUnique({
        where: { email },
      })

      if (existingUserByEmail) {
        return {
          error: `This email ${email} is already in use`,
          status: 409,
          data: null,
        }
      }

      const existingUserByPhone = await tx.user.findUnique({
        where: { phone },
      })

      if (existingUserByPhone) {
        return {
          error: `This phone number ${phone} is already in use`,
          status: 409,
          data: null,
        }
      }

      // Check for existing organization
      const existingOrg = await tx.organization.findUnique({
        where: { slug: orgData.slug },
      })

      if (existingOrg) {
        return {
          error: `This organization name is not available. Please choose a different name.`,
          status: 409,
          data: null,
        }
      }

      // Create organization
      console.log("Creating organization...")
      const org = await tx.organization.create({
        data: orgData,
      })

      // Find or create default admin role
      let defaultRole = await tx.role.findFirst({
        where: {
          name: ADMIN_USER_ROLE.name,
          organizationId: org.id,
        },
      })

      // Create default role if it doesn't exist
      if (!defaultRole) {
        defaultRole = await tx.role.create({
          data: {
            ...ADMIN_USER_ROLE,
            code: "ADMIN",
            organizationId: org.id,
            permissions: ADMIN_USER_ROLE.permissions, // Ensure this is a string array
          },
        })
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Generate OTP for email verification
      const token = generateOtp()

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
          image: image || "",
          isVerified: false, // Set to false to require email verification
          roles: {
            connect: {
              id: defaultRole.id,
            },
          },
        },
        include: {
          roles: true,
        },
      })

      // Send verification email
      const verificationCode = newUser?.token ?? ""

      try {
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: email,
          subject: "Verify your StockFlow account",
          react: VerifyEmail({ verificationCode }),
        })

        if (emailError) {
          console.error("Email sending error:", emailError)
          // Don't fail the registration if email fails
        } else {
          console.log("Verification email sent:", emailData)
        }
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError)
        // Continue with registration even if email fails
      }

      return {
        error: null,
        status: 200,
        data: {
          id: newUser?.id,
          email: newUser?.email,
          organizationId: org.id,
        },
      }
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      error: `Something went wrong. Please try again.`,
      status: 500,
      data: null,
    }
  }
}

export default createUser
