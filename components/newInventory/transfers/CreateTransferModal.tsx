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
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useOrgItemsNew } from "@/hooks/useAllItemQueries"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { useTransferActions } from "@/hooks/useTransferQueries"
import { cn } from "@/lib/utils"
import type { ItemDTO } from "@/types/item"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, MapPin, Minus, Package, Plus, Search, Trash2, Truck } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

const transferSchema = z.object({
  fromLocationId: z.string().min(1, "Source location is required"),
  toLocationId: z.string().min(1, "Destination location is required"),
  notes: z.string().optional(),
})

type TransferFormData = z.infer<typeof transferSchema>

interface TransferLine {
  id: string
  item: ItemDTO
  quantity: number
  notes: string
  serialNumbers: string[]
}

interface CreateTransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateTransferModal({ open, onOpenChange, onSuccess }: CreateTransferModalProps) {
  const { data: session } = useSession()
  const orgId = session?.user?.organizationId || ""

  const [transferLines, setTransferLines] = useState<TransferLine[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showItemSearch, setShowItemSearch] = useState(false)

  // Fetch data
  const { data: itemsResponse } = useOrgItemsNew(orgId, { enabled: !!orgId })
  const { data: locationsResponse } = useOrgLocationsNew(orgId, { enabled: !!orgId })
  const { createTransfer, isCreating } = useTransferActions()

  const items = itemsResponse?.data || []
  const locations = locationsResponse?.data || []

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromLocationId: "",
      toLocationId: "",
      notes: "",
    },
  })

  const fromLocationId = form.watch("fromLocationId")
  const toLocationId = form.watch("toLocationId")

  // Filter items based on search and availability at source location
  const filteredItems = items.filter(
    (item) =>
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !transferLines.some((line) => line.item.id === item.id),
  )

  // Add item to transfer lines
  const addItem = useCallback((item: ItemDTO) => {
    const newLine: TransferLine = {
      id: `line_${Date.now()}_${Math.random()}`,
      item,
      quantity: 1,
      notes: "",
      serialNumbers: [],
    }
    setTransferLines((prev) => [...prev, newLine])
    setSearchTerm("")
    setShowItemSearch(false)
  }, [])

  // Update line quantity
  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setTransferLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, quantity: Math.max(1, quantity) } : line)),
    )
  }, [])

  // Update line notes
  const updateNotes = useCallback((lineId: string, notes: string) => {
    setTransferLines((prev) => prev.map((line) => (line.id === lineId ? { ...line, notes } : line)))
  }, [])

  // Remove line
  const removeLine = useCallback((lineId: string) => {
    setTransferLines((prev) => prev.filter((line) => line.id !== lineId))
  }, [])

  // Handle form submission
  const handleSubmit = (data: TransferFormData) => {
    if (transferLines.length === 0) {
      form.setError("root", { message: "At least one item is required" })
      return
    }

    if (data.fromLocationId === data.toLocationId) {
      form.setError("toLocationId", { message: "Destination must be different from source" })
      return
    }

    const lines = transferLines.map((line) => ({
      itemId: line.item.id,
      quantity: line.quantity,
      notes: line.notes,
      serialNumbers: line.serialNumbers,
    }))

    createTransfer(
      {
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        notes: data.notes,
        organizationId: orgId,
        createdById: session?.user?.id || "",
        lines,
      },
      {
        onSuccess: () => {
          form.reset()
          setTransferLines([])
          onSuccess()
        },
      },
    )
  }

  const handleClose = () => {
    form.reset()
    setTransferLines([])
    setSearchTerm("")
    setShowItemSearch(false)
    onOpenChange(false)
  }

  const totalItems = transferLines.reduce((sum, line) => sum + line.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Create Inventory Transfer
          </DialogTitle>
          <DialogDescription>
            Transfer inventory items between locations. Items will be moved from the source to destination location.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col space-y-6">
            {/* Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      From Location
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id} disabled={location.id === toLocationId}>
                            <div>
                              <p className="font-medium">{location.name}</p>
                              {location.address && <p className="text-xs text-muted-foreground">{location.address}</p>}
                            </div>
                          </SelectItem>
                        ))}
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
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      To Location
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id} disabled={location.id === fromLocationId}>
                            <div>
                              <p className="font-medium">{location.name}</p>
                              {location.address && <p className="text-xs text-muted-foreground">{location.address}</p>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Transfer Route Visualization */}
            {fromLocationId && toLocationId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-3 mb-2">
                      <MapPin className="h-6 w-6 text-blue-600 mx-auto" />
                    </div>
                    <p className="font-medium text-blue-800">{locations.find((l) => l.id === fromLocationId)?.name}</p>
                    <p className="text-xs text-blue-600">Source</p>
                  </div>
                  <ArrowRight className="h-8 w-8 text-blue-600" />
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-3 mb-2">
                      <MapPin className="h-6 w-6 text-blue-600 mx-auto" />
                    </div>
                    <p className="font-medium text-blue-800">{locations.find((l) => l.id === toLocationId)?.name}</p>
                    <p className="text-xs text-blue-600">Destination</p>
                  </div>
                </div>
              </div>
            )}

            {/* Item Search */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Transfer Items</h3>
                <div className="text-sm text-muted-foreground">
                  {transferLines.length} items ({totalItems} total quantity)
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items to add to transfer..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowItemSearch(true)
                  }}
                  onFocus={() => setShowItemSearch(true)}
                />
                {showItemSearch && searchTerm && filteredItems.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-auto">
                    {filteredItems.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => addItem(item)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Lines */}
            <div className="flex-1 overflow-hidden">
              {transferLines.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No items added</h3>
                  <p className="text-sm text-muted-foreground">Search and add items to transfer</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center w-32">Quantity</TableHead>
                        <TableHead className="w-48">Notes</TableHead>
                        <TableHead className="text-center w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferLines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{line.item.name}</p>
                              <p className="text-sm text-muted-foreground">{line.item.sku}</p>
                              <p className="text-xs text-muted-foreground">Available: {line.item.quantity}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 bg-transparent"
                                onClick={() => updateQuantity(line.id, line.quantity - 1)}
                                disabled={line.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max={line.item.quantity}
                                value={line.quantity}
                                onChange={(e) => updateQuantity(line.id, Number.parseInt(e.target.value) || 1)}
                                className={cn(
                                  "w-16 text-center h-8",
                                  line.quantity > line.item.quantity && "border-red-500 bg-red-50",
                                )}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 bg-transparent"
                                onClick={() => updateQuantity(line.id, line.quantity + 1)}
                                disabled={line.quantity >= line.item.quantity}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            {line.quantity > line.item.quantity && (
                              <p className="text-xs text-red-600 mt-1">Exceeds available quantity</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Optional notes..."
                              value={line.notes}
                              onChange={(e) => updateNotes(line.id, e.target.value)}
                              className="text-sm"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLine(line.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this transfer..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>
            )}

            <Separator />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isCreating ||
                  transferLines.length === 0 ||
                  transferLines.some((line) => line.quantity > line.item.quantity)
                }
              >
                {isCreating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                ) : (
                  <Truck className="h-4 w-4 mr-2" />
                )}
                {isCreating ? "Creating..." : `Create Transfer (${totalItems} items)`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
