"use client";

import { notify } from "@/lib/notifications/notify"
import { useState } from "react";
import { useRouter } from "next/navigation";
import EnhancedRolePermissionsForm from "@/components/roles/EnhancedRolePermissionsForm";
import { Button } from "@/components/ui/button";
import { useClientAuth } from "@/hooks/useClientAuth";
import { ArrowLeft, Shield } from "lucide-react";
export default function CreateRolePage() {
  const router = useRouter();
  const { organizationId } = useClientAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const { createRoleWithPermissions } = await import("@/actions/roles/updateRolePermissions");

      if (!organizationId) {
        throw new Error("Organization not found");
      }

      const result = await createRoleWithPermissions({
        name: data.name,
        description: data.description,
        color: data.color,
        isActive: data.isActive,
        permissions: data.permissions,
        organizationId,
      });

      if (result.success) {
        notify.success(result.message || "Role created successfully!");
        router.push("/dashboard/settings/roles");
      } else {
        notify.error(result.error || "Failed to create role");
      }

    } catch (error) {
      console.error("Error creating role:", error);
      notify.error("Failed to create role");
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
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md bg-gradient-to-br from-purple-500 to-pink-600">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Create New Role
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Define a new role with custom permissions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Role Permissions Form */}
      <EnhancedRolePermissionsForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        mode="create"
      />
    </div>
  );
}
