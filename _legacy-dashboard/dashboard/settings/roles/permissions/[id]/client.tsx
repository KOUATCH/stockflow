"use client";

import { notify } from "@/lib/notifications/notify"
import { useState } from "react";
import { useRouter } from "next/navigation";
import EnhancedRolePermissionsForm from "@/components/roles/EnhancedRolePermissionsForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
interface Role {
  id: string;
  name: string;
  description: string;
  color?: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions?: string[];
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RolePermissionsPageClientProps {
  role: Role;
  organizationId: string;
}

export default function RolePermissionsPageClient({
  role,
  organizationId
}: RolePermissionsPageClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const { updateRolePermissions } = await import("@/actions/roles/updateRolePermissions");

      const result = await updateRolePermissions(role.id, {
        name: data.name,
        description: data.description,
        color: data.color,
        isActive: data.isActive,
        permissions: data.permissions,
      });

      if (result.success) {
        notify.success(result.message || "Role permissions updated successfully!");
        router.push("/dashboard/settings/roles");
      } else {
        notify.error(result.error || "Failed to update role permissions");
      }

    } catch (error) {
      console.error("Error updating role:", error);
      notify.error("Failed to update role permissions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/settings/roles");
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 mb-6">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Roles
              </Button>

              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: role.color || "#3b82f6" }}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {role.name} Permissions
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage permissions for this role
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Role Permissions Form */}
      <EnhancedRolePermissionsForm
        initialData={{
          id: role.id,
          name: role.name,
          description: role.description,
          color: role.color,
          isSystemRole: role.isSystemRole,
          isActive: role.isActive,
          permissions: role.permissions || [],
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        mode="edit"
      />
    </div>
  );
}