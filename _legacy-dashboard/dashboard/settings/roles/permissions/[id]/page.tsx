import { notFound } from "next/navigation";
import getOrgRoles from "@/actions/roles/getOrgRoles";
import { getAuthenticatedUser } from "@/config/useAuth";
import RolePermissionsPageClient from "./client";

interface RolePermissionsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RolePermissionsPage({ params }: RolePermissionsPageProps) {
  const resolvedParams = await params;
  const user = await getAuthenticatedUser();
  const organizationId = user?.organizationId ?? "";

  if (!organizationId) {
    return notFound();
  }

  // Fetch role data
  const rolesResponse = await getOrgRoles(organizationId);
  const roles = rolesResponse.data || [];

  // Find the specific role
  const role = roles.find(r => r.id === resolvedParams.id);

  if (!role) {
    return notFound();
  }

  return (
    <RolePermissionsPageClient
      role={role}
      organizationId={organizationId}
    />
  );
}