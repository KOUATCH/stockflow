import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/prisma/db"

// Server-side authentication helper for NextAuth v5
export async function getAuthenticatedUser() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.organizationId) {
    redirect("/register")
  }

  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    phone: session.user.phone,
    organizationId: session.user.organizationId,
    organizationName: session.user.organizationName,
    roles: session.user.roles || [],
    permissions: session.user.permissions || []
  }
}

// Check if user has permission
export async function checkPermission(permission: string) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const userPermissions = session.user.permissions || []
  const hasPermission = userPermissions.includes('*') || userPermissions.includes(permission)

  if (!hasPermission) {
    throw new Error(`Access denied: Missing permission ${permission}`)
  }

  return true
}

// Get session without redirecting (returns null if not authenticated)
export async function getSession() {
  return await auth()
}

// Check if user is authenticated (returns boolean)
export async function isAuthenticated() {
  const session = await auth()
  return !!session?.user?.organizationId
}