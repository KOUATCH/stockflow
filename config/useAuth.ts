// config/useAuth.ts - Unified authentication utilities using NextAuth
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

// Type for authenticated user with permissions
export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  // token: number;
  roles: Role[];
  permissions: string[];
  name?: string | null;
  email?: string | null;
  image?: string | null;
  organizationId:string;
  organizationName:string  | null;
}

// Function to check authorization and return NotAuthorized component if needed
export async function checkPermission(requiredPermission: string) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userPermissions = session.user.permissions || [];

  // Check for exact permission match OR wildcard permission for superadmins
  if (!userPermissions.includes(requiredPermission) && !userPermissions.includes('*')) {
    // Redirect to unauthorized page or return unauthorized component
    redirect("/unauthorized");
  }

  return true;
}

// Function to get authenticated user or redirect
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  // Use unified NextAuth session
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // NextAuth session already contains all user data and permissions
  return {
    id: session.user.id,
    firstName: session.user.firstName || '',
    lastName: session.user.lastName || '',
    phone: session.user.phone || '',
    roles: session.user.roles || [],
    permissions: session.user.permissions || [],
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    organizationId: session.user.organizationId,
    organizationName: session.user.organizationName || null,
  } as AuthenticatedUser;
}

// Function to check multiple permissions (any)
export async function checkAnyPermission(permissions: string[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userPermissions = session.user.permissions || [];

  // Check for wildcard permission first (superadmin access)
  if (userPermissions.includes('*')) {
    return true;
  }

  const hasAnyPermission = permissions.some((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasAnyPermission) {
    redirect("/unauthorized");
  }

  return true;
}

// Function to check multiple permissions (all)
export async function checkAllPermissions(permissions: string[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userPermissions = session.user.permissions || [];

  // Check for wildcard permission first (superadmin access)
  if (userPermissions.includes('*')) {
    return true;
  }

  const hasAllPermissions = permissions.every((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasAllPermissions) {
    redirect("/unauthorized");
  }

  return true;
}
