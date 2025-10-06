"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getItems,
  getItemsByOrganization,
  getBriefItems,
  createItem,
  updateItem,
  deleteItem
} from "@/actions/items";
import { useNotifications } from "@/components/notifications/NotificationProvider";

// Hook to fetch all items
export function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: getItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch items by organization
export function useItemsByOrganization(organizationId: string) {
  return useQuery({
    queryKey: ["items", "organization", organizationId],
    queryFn: () => getItemsByOrganization(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to fetch brief items
export function useBriefItems(organizationId?: string) {
  return useQuery({
    queryKey: ["items", "brief", organizationId],
    queryFn: () => getBriefItems(organizationId),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to create a new item
export function useCreateItem() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: createItem,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch items queries
        queryClient.invalidateQueries({ queryKey: ["items"] });
        success("Item Created", "Item has been created successfully");
      } else {
        error("Error", result.error || "Failed to create item");
      }
    },
    onError: (err: any) => {
      error("Error", err?.message || "Failed to create item");
    },
  });
}

// Hook to update an item
export function useUpdateItem() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: ({ itemId, itemData }: { itemId: string; itemData: any }) =>
      updateItem(itemId, itemData),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch items queries
        queryClient.invalidateQueries({ queryKey: ["items"] });
        success("Item Updated", "Item has been updated successfully");
      } else {
        error("Error", result.error || "Failed to update item");
      }
    },
    onError: (err: any) => {
      error("Error", err?.message || "Failed to update item");
    },
  });
}

// Hook to delete an item
export function useDeleteItem() {
  const queryClient = useQueryClient();
  const { success, error } = useNotifications();

  return useMutation({
    mutationFn: deleteItem,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch items queries
        queryClient.invalidateQueries({ queryKey: ["items"] });
        success("Item Deleted", "Item has been deleted successfully");
      } else {
        error("Error", result.error || "Failed to delete item");
      }
    },
    onError: (err: any) => {
      error("Error", err?.message || "Failed to delete item");
    },
  });
}

// Hook to get a single item by ID (from cache or refetch)
export function useItem(itemId: string) {
  const { data: itemsResult } = useItems();

  return {
    data: itemsResult?.data?.find((item: any) => item.id === itemId),
    isLoading: !itemsResult,
  };
}

// Custom hook for optimistic updates
export function useOptimisticItems() {
  const queryClient = useQueryClient();

  const addOptimisticItem = (newItem: any) => {
    queryClient.setQueryData(["items"], (old: any) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: [newItem, ...old.data],
      };
    });
  };

  const updateOptimisticItem = (itemId: string, updatedItem: any) => {
    queryClient.setQueryData(["items"], (old: any) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: old.data.map((item: any) =>
          item.id === itemId ? { ...item, ...updatedItem } : item
        ),
      };
    });
  };

  const removeOptimisticItem = (itemId: string) => {
    queryClient.setQueryData(["items"], (old: any) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: old.data.filter((item: any) => item.id !== itemId),
      };
    });
  };

  return {
    addOptimisticItem,
    updateOptimisticItem,
    removeOptimisticItem,
  };
}