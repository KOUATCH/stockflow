"use client"

import { createItemAction } from "@/actions/item/items"
import { itemKeys } from "@/lib/item/itemKeys"
import type { CreateItemInput, ItemWithRelations } from "@/lib/item/schemas"
import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query"

type CreateOptions = Omit<UseMutationOptions<ItemWithRelations, Error, CreateItemInput, unknown>, "mutationFn">
type ActionResult<T> = { success: true; data: T; message?: string } | { success: false; error: string }

async function callAction<T>(action: (input: unknown) => Promise<ActionResult<T>>, input: unknown): Promise<T> {
  const result = await action(input)
  if (!result.success) {
    throw new Error(result.error || "Unknown error")
  }
  return result.data
}

/**
 * useCreateItemHook
 * - Calls the server action to create an item
 * - Invalidates list and detail queries on success
 */
export function useCreateItemHook(options?: CreateOptions) {
  const qc = useQueryClient()

  return useMutation<ItemWithRelations, Error, CreateItemInput>({
    meta: { operation: 'create', entity: 'Item' },
    ...options,
    mutationFn: (vars) => callAction(createItemAction, vars),
    onSuccess: async (data, variables, onMutateResult, context) => {
      // Invalidate the items list and this item's detail cache
      await Promise.all([
        qc.invalidateQueries({ queryKey: itemKeys.all }),
        qc.invalidateQueries({ queryKey: itemKeys.detail(data.id) }),
      ])
      // Allow consumers to add more behavior
      if (options?.onSuccess) {
        await options.onSuccess(data, variables, onMutateResult, context)
      }
    },
  })
}
