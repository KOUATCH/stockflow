// config/useAuth.ts - Custom authentication utilities
import { getUserWithRoles } from "@/lib/auth-helpers";
import { verifySession } from "@/lib/session-auth";
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
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  // Get user with roles and permissions
  const userWithRoles = await getUserWithRoles(session.userId);
  if (!userWithRoles) {
    redirect("/login");
  }

  const userPermissions = userWithRoles?.roles?.map(role => role.permissions).flat() || [];

  if (!userPermissions.includes(requiredPermission)) {
    // Redirect to unauthorized page or return unauthorized component
    redirect("/unauthorized");
  }

  return true;
}

// Function to get authenticated user or redirect
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  // Get user with roles and permissions from database
  const userWithRoles = await getUserWithRoles(session.userId);
  if (!userWithRoles) {
    redirect("/login");
  }

  return {
    id: userWithRoles.id,
    firstName: userWithRoles.firstName || '',
    lastName: userWithRoles.lastName || '',
    phone: userWithRoles.phone || '',
    roles: userWithRoles.roles,
    permissions: userWithRoles?.roles?.map(role => role.permissions).flat() || [],
    name: userWithRoles.name,
    email: userWithRoles.email,
    image: userWithRoles.image,
    organizationId: userWithRoles.organizationId,
    organizationName: userWithRoles.organization?.name || null,
  } as AuthenticatedUser;
}

// Function to check multiple permissions (any)
export async function checkAnyPermission(permissions: string[]) {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  // Get user with roles and permissions
  const userWithRoles = await getUserWithRoles(session.userId);
  if (!userWithRoles) {
    redirect("/login");
  }

  const userPermissions = userWithRoles?.roles?.map(role => role.permissions ?? []).flat() || [];

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
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  // Get user with roles and permissions
  const userWithRoles = await getUserWithRoles(session.userId);
  if (!userWithRoles) {
    redirect("/login");
  }

  const userPermissions = userWithRoles?.roles?.map(role => role.permissions).flat() || [];

  const hasAllPermissions = permissions.every((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasAllPermissions) {
    redirect("/unauthorized");
  }

  return true;
}
