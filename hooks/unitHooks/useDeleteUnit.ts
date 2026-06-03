import { useDeleteUnit as useDeleteUnitMutation } from "@/hooks/useUnits"
import { useNotifications } from "@/components/notifications/NotificationProvider"

export function useDeleteUnit() {
  const { success, error } = useNotifications();
  const deleteUnitMutation = useDeleteUnitMutation();

  return {
    ...deleteUnitMutation,
    mutate: (id: string) => {
      deleteUnitMutation.mutate(id, {
        onSuccess: () => {
          success("Unit Deleted", "Unit has been successfully removed");
        },
        onError: (err: Error) => {
          error(
            "Delete Failed",
            err.message || "Unknown error occurred",
            {
              category: "error",
              priority: "normal",
              action: {
                label: "Try Again",
                onClick: () => console.log("Retry delete unit")
              }
            }
          );
        }
      });
    },
    mutateAsync: async (id: string) => {
      try {
        const result = await deleteUnitMutation.mutateAsync(id);
        success("Unit Deleted", "Unit has been successfully removed");
        return result;
      } catch (err: any) {
        error(
          "Delete Failed",
          err.message || "Unknown error occurred",
          {
            category: "error",
            priority: "normal",
            action: {
              label: "Try Again",
              onClick: () => console.log("Retry delete unit")
            }
          }
        );
        throw err;
      }
    }
  };
}
