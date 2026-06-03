import { auth } from "@/auth"
import { localizedRedirect } from "@/i18n/server-routing"

async function redirectTo(path: string): Promise<never> {
  await localizedRedirect(path)
  throw new Error(`Redirected to ${path}`)
}

// Server-side authentication helper for NextAuth v5
export async function getAuthenticatedUser() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirectTo("/login")
  }

  if (!user.organizationId) {
    return redirectTo("/register")
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    roles: user.roles || [],
    permissions: user.permissions || []
  }
}

// Check if user has permission
export async function checkPermission(permission: string) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirectTo("/login")
  }

  const userPermissions = user.permissions || []
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
