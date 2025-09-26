"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCreateStockTransfer } from "@/hooks/useStockTransfer"
import type { CreateStockTransferForm } from "@/types/stockTransferTypes"
import { zodResolver } from "@hookform/resolvers/zod"
import { Package, Plus, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

const stockTransferItemSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  quantityRequested: z.number().min(1, "Quantity must be greater than 0"),
  notes: z.string().optional(),
})

const stockTransferSchema = z.object({
  fromLocationId: z.string().min(1, "Source location is required"),
  toLocationId: z.string().min(1, "Destination location is required"),
  notes: z.string().optional(),
  items: z.array(stockTransferItemSchema).min(1, "At least one item is required"),
})

interface StockTransferFormProps {
  onSuccess?: () => void
  defaultFromLocationId?: string
}

export function StockTransferForm({ onSuccess, defaultFromLocationId }: StockTransferFormProps) {
  const createTransfer = useCreateStockTransfer()

  const form = useForm<CreateStockTransferForm>({
    resolver: zodResolver(stockTransferSchema),
    defaultValues: {
      fromLocationId: defaultFromLocationId || "",
      toLocationId: "",
      notes: "",
      items: [{ itemId: "", quantityRequested: 1, notes: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const onSubmit = async (data: CreateStockTransferForm) => {
    try {
      await createTransfer.mutateAsync(data)
      form.reset()
      onSuccess?.()
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const addItem = () => {
    append({ itemId: "", quantityRequested: 1, notes: "" })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Create Stock Transfer
        </CardTitle>
        <CardDescription>
          Transfer inventory between locations with detailed item tracking and approval workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Main Warehouse</SelectItem>
                        <SelectItem value="2">Store A</SelectItem>
                        <SelectItem value="3">Store B</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Main Warehouse</SelectItem>
                        <SelectItem value="2">Store A</SelectItem>
                        <SelectItem value="3">Store B</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Items to Transfer</h3>
                  <p className="text-sm text-muted-foreground">Add items and quantities for this transfer</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {fields.length} item{fields.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 bg-muted/30">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.itemId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select item" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">Wireless Headphones (WH-001)</SelectItem>
                                  <SelectItem value="2">Bluetooth Speaker (BS-001)</SelectItem>
                                  <SelectItem value="3">Smart Watch (SW-001)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.quantityRequested`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Item-specific notes..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={fields.length === 1}
                        className="mt-8 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Button type="button" variant="outline" onClick={addItem} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Item
              </Button>
            </div>

            <Separator />

            {/* Transfer Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this transfer request..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button type="submit" disabled={createTransfer.isPending} className="flex-1">
                {createTransfer.isPending ? "Creating Transfer..." : "Create Transfer Request"}
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset()} disabled={createTransfer.isPending}>
                Reset Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
