// config/useAuth.ts - Unified authentication utilities using NextAuth
import { auth } from "@/auth";
import { db } from "@/prisma/db";
import { LOCALE_COOKIE, localizePath, pickLocale } from "@/i18n/routing";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type AuthenticatedRole = {
  id: string;
  name: string;
  nameEn?: string | null;
  nameFr?: string | null;
  code: string;
  permissions: string[];
};

// Type for authenticated user with permissions
export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  // token: number;
  roles: AuthenticatedRole[];
  permissions: string[];
  name?: string | null;
  email?: string | null;
  image?: string | null;
  organizationId:string;
  organizationName:string  | null;
}

async function redirectWithRequestLocale(path: string): Promise<never> {
  const cookieStore = await cookies();
  const locale = pickLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  redirect(localizePath(path, locale));
}

// Function to check authorization and return NotAuthorized component if needed
export async function checkPermission(requiredPermission: string) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return redirectWithRequestLocale("/login");
  }

  const userPermissions = user.permissions || [];

  // Check for exact permission match OR wildcard permission for superadmins
  if (!userPermissions.includes(requiredPermission) && !userPermissions.includes('*')) {
    // Redirect to unauthorized page or return unauthorized component
    return redirectWithRequestLocale("/unauthorized");
  }

  return true;
}

// Function to get authenticated user or redirect
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  // Use unified NextAuth session
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return redirectWithRequestLocale("/login");
  }

  const databaseUser = await db.user.findFirst({
    where: {
      isActive: true,
      OR: [
        { id: user.id },
        ...(user.email ? [{ email: user.email }] : []),
      ],
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      image: true,
      organizationId: true,
      organization: {
        select: {
          name: true,
        },
      },
      roles: {
        select: {
          id: true,
          nameEn: true,
          nameFr: true,
          code: true,
          permissions: true,
        },
      },
    },
  });

  if (databaseUser) {
    const permissions = Array.from(
      new Set(databaseUser.roles.flatMap((role) => role.permissions || []))
    );

    return {
      id: databaseUser.id,
      firstName: databaseUser.firstName || '',
      lastName: databaseUser.lastName || '',
      phone: databaseUser.phone || '',
      roles: databaseUser.roles.map((role) => ({
        id: role.id,
        name: role.nameEn || role.nameFr || role.code,
        nameEn: role.nameEn,
        nameFr: role.nameFr,
        code: role.code,
        permissions: role.permissions || [],
      })),
      permissions,
      name: [databaseUser.firstName, databaseUser.lastName].filter(Boolean).join(" ") || databaseUser.email,
      email: databaseUser.email,
      image: databaseUser.image,
      organizationId: databaseUser.organizationId,
      organizationName: databaseUser.organization?.name || null,
    };
  }

  return {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    roles: user.roles || [],
    permissions: user.permissions || [],
    name: user.name,
    email: user.email,
    image: user.image,
    organizationId: user.organizationId,
    organizationName: user.organizationName || null,
  };
}

// Function to check multiple permissions (any)
export async function checkAnyPermission(permissions: string[]) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return redirectWithRequestLocale("/login");
  }

  const userPermissions = user.permissions || [];

  // Check for wildcard permission first (superadmin access)
  if (userPermissions.includes('*')) {
    return true;
  }

  const hasAnyPermission = permissions.some((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasAnyPermission) {
    return redirectWithRequestLocale("/unauthorized");
  }

  return true;
}

// Function to check multiple permissions (all)
export async function checkAllPermissions(permissions: string[]) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return redirectWithRequestLocale("/login");
  }

  const userPermissions = user.permissions || [];

  // Check for wildcard permission first (superadmin access)
  if (userPermissions.includes('*')) {
    return true;
  }

  const hasAllPermissions = permissions.every((permission) =>
    userPermissions.includes(permission)
  );

  if (!hasAllPermissions) {
    return redirectWithRequestLocale("/unauthorized");
  }

  return true;
}
