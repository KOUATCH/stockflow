"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization
} from "@/actions/organizations";
import { useNotifications } from "@/components/notifications/NotificationProvider";

// Hook to fetch all organizations
export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch organization by ID
export function useOrganization(organizationId: string) {
  return useQuery({
    queryKey: ["organizations", organizationId],
    queryFn: () => getOrganizationById(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to create a new organization
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch organizations queries
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        success("Organization Created", "Organization has been created successfully");
      } else {
        error("Error", result.error || "Failed to create organization");
      }
    },
    onError: (err: any) => {
      error("Error", err?.message || "Failed to create organization");
    },
  });
}

// Hook to update an organization
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: ({ organizationId, organizationData }: {
      organizationId: string;
      organizationData: any
    }) => updateOrganization(organizationId, organizationData),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch organizations queries
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        success("Organization Updated", "Organization has been updated successfully");
      } else {
        error("Error", result.error || "Failed to update organization");
      }
    },
    onError: (err: any) => {
      error("Error", err?.message || "Failed to update organization");
    },
  });
}

// Hook to delete an organization
export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const { success, error, warning } = useNotifications();

  return useMutation({
    mutationFn: deleteOrganization,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch organizations queries
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        success("Organization Deleted", "Organization has been deleted successfully");
      } else {
        if (result.error?.includes("existing users, items, or locations")) {
          warning("Cannot Delete", result.error);
        } else {
          error("Error", result.error || "Failed to delete organization");
        }
      }
    },
    onError: (err: any) => {
      error("Error", err?.message || "Failed to delete organization");
    },
  });
}

// Hook for optimistic updates
export function useOptimisticOrganizations() {
  const queryClient = useQueryClient();

  const addOptimisticOrganization = (newOrganization: any) => {
    queryClient.setQueryData(["organizations"], (old: any) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: [newOrganization, ...old.data],
      };
    });
  };

  const updateOptimisticOrganization = (organizationId: string, updatedOrganization: any) => {
    queryClient.setQueryData(["organizations"], (old: any) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: old.data.map((org: any) =>
          org.id === organizationId ? { ...org, ...updatedOrganization } : org
        ),
      };
    });

    // Also update individual organization cache
    queryClient.setQueryData(["organizations", organizationId], (old: any) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: { ...old.data, ...updatedOrganization },
      };
    });
  };

  const removeOptimisticOrganization = (organizationId: string) => {
    queryClient.setQueryData(["organizations"], (old: any) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: old.data.filter((org: any) => org.id !== organizationId),
      };
    });

    // Remove individual organization cache
    queryClient.removeQueries({ queryKey: ["organizations", organizationId] });
  };

  return {
    addOptimisticOrganization,
    updateOptimisticOrganization,
    removeOptimisticOrganization,
  };
}

// Hook to get organization statistics
export function useOrganizationStats(organizationId: string) {
  const { data: organization } = useOrganization(organizationId);

  return {
    userCount: organization?.data?._count?.users || 0,
    itemCount: organization?.data?._count?.items || 0,
    locationCount: organization?.data?._count?.locations || 0,
    isLoading: !organization,
  };
}