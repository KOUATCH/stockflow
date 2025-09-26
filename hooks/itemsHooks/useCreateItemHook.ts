"use client"

import { createItemAction } from "@/actions/item/createItemAction"
import { callAction } from "@/lib/call-action"
import { itemKeys } from "@/lib/item/itemKeys"
import type { CreateItemInput, ItemWithRelations } from "@/lib/item/schemas"
import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query"

type CreateOptions = Omit<UseMutationOptions<ItemWithRelations, Error, CreateItemInput, unknown>, "mutationFn">

/**
 * useCreateItemHook
 * - Calls the server action to create an item
 * - Invalidates list and detail queries on success
 */
export function useCreateItemHook(options?: CreateOptions) {
  const qc = useQueryClient()

  return useMutation<ItemWithRelations, Error, CreateItemInput>({
    mutationFn: (vars) => callAction(createItemAction, vars),
    onSuccess: async (data) => {
      // Invalidate the items list and this item's detail cache
      await Promise.all([
        qc.invalidateQueries({ queryKey: itemKeys.all }),
        qc.invalidateQueries({ queryKey: itemKeys.detail(data.id) }),
      ])
      // Allow consumers to add more behavior
      if (options?.onSuccess) {
        await options.onSuccess(data, undefined as unknown as CreateItemInput, undefined as unknown as unknown)
      }
    },
    ...options,
  })
}
