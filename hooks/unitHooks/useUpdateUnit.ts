import { useUpdateUnit as useUpdateUnitMutation } from "@/hooks/useUnits"
import { useNotifications } from "@/components/notifications/NotificationProvider"

export function useUpdateUnit() {
  const { formSuccess, formError } = useNotifications()
  const updateUnitMutation = useUpdateUnitMutation()

  return {
    ...updateUnitMutation,
    mutate: (data: any) => {
      updateUnitMutation.mutate(data, {
        onSuccess: () => {
          formSuccess("Unit Update", "Unit has been updated successfully")
        },
        onError: (error: Error) => {
          formError(
            "Unit Update",
            error.message || "Unknown error occurred",
            "Failed to update unit",
          )
        },
      })
    },
    mutateAsync: async (data: any) => {
      try {
        const result = await updateUnitMutation.mutateAsync(data)
        formSuccess("Unit Update", "Unit has been updated successfully")
        return result
      } catch (error: any) {
        formError(
          "Unit Update",
          error.message || "Unknown error occurred",
          "Failed to update unit",
        )
        throw error
      }
    },
  }
}
