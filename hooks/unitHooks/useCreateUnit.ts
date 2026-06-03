import { useCreateUnit as useCreateUnitMutation } from "@/hooks/useUnits"
import { useNotifications } from "@/components/notifications/NotificationProvider"

export function useCreateUnit() {
  const { formSuccess, formError } = useNotifications();
  const createUnitMutation = useCreateUnitMutation();

  return {
    ...createUnitMutation,
    mutate: (data: any) => {
      createUnitMutation.mutate(data, {
        onSuccess: (newUnit) => {
          formSuccess("Unit Creation", "Unit has been created successfully");
        },
        onError: (error: Error) => {
          formError(
            "Unit Creation",
            error.message || "Unknown error occurred",
            "Failed to create unit"
          );
        }
      });
    },
    mutateAsync: async (data: any) => {
      try {
        const result = await createUnitMutation.mutateAsync(data);
        formSuccess("Unit Creation", "Unit has been created successfully");
        return result;
      } catch (error: any) {
        formError(
          "Unit Creation",
          error.message || "Unknown error occurred",
          "Failed to create unit"
        );
        throw error;
      }
    }
  };
}
