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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useInventoryAdjustment } from "@/hooks/useInventoryQueries"
import { formatCurrency } from "@/lib/utils"
import type { InventoryLevel } from "@/types/inventory"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, Package, Plus, Minus } from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useForm } from "react-hook-form"
import * as z from "zod"

const adjustmentSchema = z.object({
  adjustmentType: z.enum(["increase", "decrease"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().min(5, "Please provide a detailed reason (minimum 5 characters)"),
})

type AdjustmentFormData = z.infer<typeof adjustmentSchema>

type InventoryLevelForAdjustment = InventoryLevel & {
  item: NonNullable<InventoryLevel["item"]>
  location: NonNullable<InventoryLevel["location"]>
}

interface InventoryAdjustmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventory: InventoryLevelForAdjustment
  onSuccess: () => void
}

export function InventoryAdjustmentModal({ open, onOpenChange, inventory, onSuccess }: InventoryAdjustmentModalProps) {
  const { user, organizationId } = useClientAuth()
  const { mutate: createAdjustment, isPending } = useInventoryAdjustment()
  const currentQuantity = inventory.quantityOnHand

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      adjustmentType: "increase",
      quantity: 1,
      reason: "",
    },
  })

  const adjustmentType = form.watch("adjustmentType")
  const quantity = form.watch("quantity")

  const handleSubmit = (data: AdjustmentFormData) => {
    if (!user?.id || !organizationId) return

    const adjustmentQuantity = data.adjustmentType === "increase" ? data.quantity : -data.quantity

    createAdjustment(
      {
        itemId: inventory.itemId,
        locationId: inventory.locationId,
        adjustmentQuantity,
        reason: data.reason,
        organizationId,
        userId: user.id,
      },
      {
        onSuccess: () => {
          form.reset()
          onSuccess()
        },
      },
    )
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  const newQuantity =
    adjustmentType === "increase" ? currentQuantity + quantity : Math.max(0, currentQuantity - quantity)

  const estimatedValueChange =
    adjustmentType === "increase" ? quantity * inventory.averageCost : -(quantity * inventory.averageCost)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Inventory Adjustment
          </DialogTitle>
          <DialogDescription>
            Adjust the inventory quantity for {inventory.item.name} at {inventory.location.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Current Inventory Info */}
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
                <span className="font-semibold">{currentQuantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Average Cost:</span>
                <span>{formatCurrency(inventory.averageCost)}</span>
              </div>
            </div>

            {/* Adjustment Type */}
            <FormField
              control={form.control}
              name="adjustmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="increase">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-green-600" />
                          Increase Quantity
                        </div>
                      </SelectItem>
                      <SelectItem value="decrease">
                        <div className="flex items-center gap-2">
                          <Minus className="h-4 w-4 text-red-600" />
                          Decrease Quantity
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to {adjustmentType === "increase" ? "Add" : "Remove"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={adjustmentType === "decrease" ? currentQuantity : undefined}
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Adjustment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Damaged goods, Found during cycle count, Theft, etc."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-blue-800">Adjustment Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">New Quantity:</span>
                  <p className="font-semibold text-blue-800">{newQuantity}</p>
                </div>
                <div>
                  <span className="text-blue-700">Value Change:</span>
                  <p className={`font-semibold ${estimatedValueChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {estimatedValueChange >= 0 ? "+" : ""}
                    {formatCurrency(estimatedValueChange)}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning for decrease */}
            {adjustmentType === "decrease" && quantity > currentQuantity && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Invalid Quantity</p>
                  <p className="text-red-700 mt-1">
                    Cannot remove {quantity} items. Only {currentQuantity} available.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || (adjustmentType === "decrease" && quantity > currentQuantity)}
              >
                {isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                ) : (
                  <Package className="h-4 w-4 mr-2" />
                )}
                {isPending ? "Processing..." : "Apply Adjustment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
