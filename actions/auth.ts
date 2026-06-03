"use server"

import { Locale as PrismaLocale } from "@prisma/client"
import { randomUUID } from "crypto"
import type { AuthResponse, LoginProps, RegisterUserProps } from "@/types/types"
// import createUser from "./create-user"
import { signIn } from "../auth"
import { generateSlug } from "@/lib/generateSlug"

function cleanText(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeSlug(value: string) {
  const slug = generateSlug(value).replace(/^-+|-+$/g, "")
  return slug || `organization-${randomUUID().slice(0, 8)}`
}

function toPrismaLocale(value?: string | null) {
  return value === "fr" ? PrismaLocale.FR : PrismaLocale.EN
}

async function resolveUniqueOrganizationSlug(tx: any, organizationName: string) {
  const baseSlug = normalizeSlug(organizationName)
  let candidate = baseSlug
  let suffix = 2

  while (await tx.organization.findUnique({ where: { slug: candidate } })) {
    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return candidate
}

/**
 * Register a new user with organization
 */
export async function registerUser(data: RegisterUserProps): Promise<AuthResponse> {
  try {
    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        error: "Passwords do not match",
      }
    }

    // Validate terms acceptance
    if (!data.termsAccepted) {
      return {
        success: false,
        error: "You must accept the terms and conditions",
      }
    }

    const { db } = await import("../prisma/db")
    const { hashPassword } = await import("../lib/password")
    const { checkPasswordPolicy } = await import("@/services/auth/password-policy")
    const email = data.email.trim().toLowerCase()

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    })

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      }
    }

    const existingPhone = await db.user.findUnique({
      where: { phone: data.phone },
    })

    if (existingPhone) {
      return {
        success: false,
        error: "User with this phone number already exists",
      }
    }

    const passwordPolicy = await checkPasswordPolicy({
      password: data.password,
      email,
    })

    if (!passwordPolicy.ok) {
      return {
        success: false,
        error: passwordPolicy.message,
      }
    }

    // Hash the password
    const hashedPassword = await hashPassword(data.password)

    // Generate unique slug for organization
    const defaultLocale = toPrismaLocale(data.defaultLocale)

    // Create organization and user in a transaction
    const result = await db.$transaction(async (tx) => {
      const now = new Date()
      const orgSlug = await resolveUniqueOrganizationSlug(tx, data.companyName)

      // Create organization
      const organization = await tx.organization.create({
        data: {
          id: randomUUID(),
          name: data.companyName,
          slug: orgSlug,
          industry: cleanText(data.industry),
          country: cleanText(data.country),
          state: cleanText(data.state),
          address: cleanText(data.address),
          currency: data.currency || "XAF",
          timezone: data.timezone || "Africa/Douala",
          defaultLocale,
          isActive: true,
          updatedAt: now,
        },
      })

      // Create default admin role for the organization
      const adminRole = await tx.role.create({
        data: {
          id: randomUUID(),
          nameEn: "Administrator",
          nameFr: "Administrateur",
          code: "administrator",
          description: "Organization administrator with full access",
          permissions: ["*"], // Full permissions
          organizationId: organization.id,
          updatedAt: now,
        },
      })

      // Create the user
      const user = await tx.user.create({
        data: {
          id: randomUUID(),
          firstName: data.firstName,
          lastName: data.lastName,
          email,
          phone: data.phone,
          password: hashedPassword,
          image: "",
          organizationId: organization.id,
          isActive: true,
          isVerified: false, // User needs to verify email
          preferredLocale: defaultLocale,
          updatedAt: now,
        },
      })

      // Assign admin role to the user (many-to-many relationship)
      await tx.user.update({
        where: { id: user.id },
        data: {
          roles: {
            connect: { id: adminRole.id }
          }
        }
      })

      await tx.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: hashedPassword,
        },
      })

      return { user, organization, role: adminRole }
    })

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      data: {
        userId: result.user.id,
        organizationId: result.organization.id,
        email: result.user.email,
      },
    }
  } catch (error: any) {
    console.error("Registration error:", error)

    // Handle specific database errors
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        return {
          success: false,
          error: "An account with this email already exists",
        }
      }
      if (error.meta?.target?.includes('slug')) {
        return {
          success: false,
          error: "Organization name already exists, please choose a different name",
        }
      }
      if (error.meta?.target?.includes('phone')) {
        return {
          success: false,
          error: "An account with this phone number already exists",
        }
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred during registration. Please try again.",
    }
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithCredentials(data: LoginProps): Promise<AuthResponse> {
  try {
    // Validate input
    if (!data.email || !data.password) {
      return {
        success: false,
        error: "Email and password are required",
      }
    }

    try {
      // Attempt sign in using Auth.js
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      // In NextAuth v5, successful signIn with redirect: false typically returns:
      // - null/undefined for success
      // - an object with error property for failures
      // - or throws an error

      // If we reach here without throwing, it means authentication was successful
      return {
        success: true,
        message: "Login successful! Redirecting to dashboard...",
      }
    } catch (signInError: any) {
      // Check if this is a redirect (which means success in some cases)
      if (signInError.type === "Redirect") {
        return {
          success: true,
          message: "Login successful! Redirecting to dashboard...",
        }
      }

      // Handle other specific error types
      if (signInError.type === "CredentialsSignin") {
        return {
          success: false,
          error: "Invalid email or password. Please check your credentials and try again.",
        }
      }

      // Re-throw unexpected errors to be caught by outer catch
      throw signInError
    }
  } catch (error: any) {
    console.error("Login error:", error)

    // Handle NextAuth v5 specific error types
    if (error.type === "CredentialsSignin") {
      return {
        success: false,
        error: "Invalid email or password. Please check your credentials and try again.",
      }
    }

    // Handle specific error cases
    if (error.message?.includes("Invalid credentials")) {
      return {
        success: false,
        error: "Invalid email or password. Please check your credentials and try again.",
      }
    }

    if (error.message?.includes("not verified")) {
      return {
        success: false,
        error: "Please verify your email address before logging in.",
      }
    }

    return {
      success: false,
      error: "Unable to sign in. Please try again later.",
    }
  }
}
