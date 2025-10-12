import { unitAPI } from "@/services/unitAPI"
import { UnitKeys } from "@/types/queryKeys"
import { UnitCreateDTO } from "@/types/unit"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/components/notifications/NotificationProvider"

export function useCreateUnit() {
  const queryClient = useQueryClient()
  const { formSuccess, formError } = useNotifications();

  return useMutation({
    mutationFn: async (data: UnitCreateDTO) => {
      return await unitAPI.createUnit(data)
    },
    onSuccess: (newUnit) => {
      formSuccess("Unit Creation", "Unit has been created successfully");

      // Invalidate and refetch unit list
      queryClient.invalidateQueries({ queryKey: UnitKeys.lists() })

      if (newUnit?.organizationId) {
        queryClient.invalidateQueries({
          queryKey: UnitKeys.orgUnits(newUnit.organizationId),
        })
      }
    },
    onError: (error: Error) => {
      formError(
        "Unit Creation",
        error.message || "Unknown error occurred",
        "Failed to create unit"
      );
    },
  })
}
