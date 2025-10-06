"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUpdateReorderLevels } from "@/hooks/useInventoryQueries"
import type { InventoryWithRelations } from "@/actions/inventory/inventoryActions"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, Settings } from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useForm } from "react-hook-form"
import * as z from "zod"

const reorderSchema = z
  .object({
    reorderLevel: z.number().min(0, "Reorder level cannot be negative"),
    maxLevel: z.number().min(0, "Max level cannot be negative"),
  })
  .refine((data) => data.maxLevel >= data.reorderLevel, {
    message: "Max level must be greater than or equal to reorder level",
    path: ["maxLevel"],
  })

type ReorderFormData = z.infer<typeof reorderSchema>

interface ReorderLevelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventory: InventoryWithRelations
  onSuccess: () => void
}

export function ReorderLevelModal({ open, onOpenChange, inventory, onSuccess }: ReorderLevelModalProps) {
  const { data: session } = useSession()
  const { mutate: updateLevels, isPending } = useUpdateReorderLevels()

  const form = useForm<ReorderFormData>({
    resolver: zodResolver(reorderSchema),
    defaultValues: {
      reorderLevel: inventory.reorderLevel,
      maxLevel: inventory.maxLevel,
    },
  })

  const reorderLevel = form.watch("reorderLevel")
  const maxLevel = form.watch("maxLevel")

  const handleSubmit = (data: ReorderFormData) => {
    if (!user) return

    updateLevels(
      {
        inventoryId: inventory.id,
        reorderLevel: data.reorderLevel,
        maxLevel: data.maxLevel,
        organizationId: session.user.organizationId,
      },
      {
        onSuccess: () => {
          onSuccess()
        },
      },
    )
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  const currentStatus =
    inventory.quantity <= reorderLevel
      ? inventory.quantity === 0
        ? "Out of Stock"
        : "Low Stock"
      : maxLevel > 0 && inventory.quantity > maxLevel
        ? "Over Stock"
        : "In Stock"

  const newStatus =
    inventory.quantity <= reorderLevel
      ? inventory.quantity === 0
        ? "Out of Stock"
        : "Low Stock"
      : maxLevel > 0 && inventory.quantity > maxLevel
        ? "Over Stock"
        : "In Stock"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Update Reorder Levels
          </DialogTitle>
          <DialogDescription>
            Set reorder and maximum levels for {inventory.item.name} at {inventory.location.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Current Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Item:</span>
                <span>
                  {inventory.item.name} ({inventory.item.sku})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Location:</span>
                <span>{inventory.location.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Current Quantity:</span>
                <span className="font-semibold">{inventory.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Current Status:</span>
                <span
                  className={`font-semibold ${
                    currentStatus === "Out of Stock"
                      ? "text-red-600"
                      : currentStatus === "Low Stock"
                        ? "text-orange-600"
                        : currentStatus === "Over Stock"
                          ? "text-purple-600"
                          : "text-green-600"
                  }`}
                >
                  {currentStatus}
                </span>
              </div>
            </div>

            {/* Reorder Level */}
            <FormField
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Trigger reorder when quantity falls to or below this level
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Level */}
            <FormField
              control={form.control}
              name="maxLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Alert when quantity exceeds this level (0 = no maximum)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-blue-800">Level Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Reorder at:</span>
                  <span className="font-semibold text-blue-800">{reorderLevel} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Maximum:</span>
                  <span className="font-semibold text-blue-800">
                    {maxLevel === 0 ? "No limit" : `${maxLevel} units`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Status with new levels:</span>
                  <span
                    className={`font-semibold ${
                      newStatus === "Out of Stock"
                        ? "text-red-600"
                        : newStatus === "Low Stock"
                          ? "text-orange-600"
                          : newStatus === "Over Stock"
                            ? "text-purple-600"
                            : "text-green-600"
                    }`}
                  >
                    {newStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning */}
            {maxLevel > 0 && maxLevel < reorderLevel && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Invalid Configuration</p>
                  <p className="text-red-700 mt-1">Maximum level must be greater than or equal to reorder level.</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                {isPending ? "Updating..." : "Update Levels"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
