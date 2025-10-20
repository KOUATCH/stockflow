"use server"

import type { AuthResponse, LoginProps, OrgDataProps, RegisterUserProps } from "@/types/types"
// import createUser from "./create-user"
import { signIn } from "@/auth"
import { generateSlug } from "@/lib/generateSlug"
import { createUser } from "./users"

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

    // Prepare organization data with unique slug
    const orgData: OrgDataProps = {
      name: data.companyName,
      slug: generateSlug(data.companyName),
      email: data.email,
      phone: data.phone,
      address: "",
      logo: "",
    }

    // Prepare user data with required properties
    const userData = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      image: "",
      organizationId: orgData.slug, // or another unique identifier for the organization
      roleId: "user", // default role for new users
    }

    // Create user and organization
    const result = await createUser(userData)

    if (result.error) {
      return {
        success: false,
        error: result.error,
      }
    }

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      data: result.data,
    }
  } catch (error) {
    console.error("Registration error:", error)
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

    // Attempt sign in using Auth.js
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    // Check if sign in was successful
    // In NextAuth v5, signIn returns null on success when redirect: false
    if (result === null) {
      return {
        success: true,
        message: "Login successful! Redirecting to dashboard...",
      }
    }

    // If result is not null, it indicates an error
    return {
      success: false,
      error: "Authentication failed. Please check your credentials.",
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
