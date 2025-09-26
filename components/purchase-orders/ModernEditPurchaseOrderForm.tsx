"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useUpdatePurchaseOrder } from "@/hooks/useRecentPurchaseOrderQueries"
import { cn } from "@/lib/utils"
import { PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ArrowLeft, CalendarIcon, CheckCircle, Plus, Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const lineItemSchema = z.object({
  id: z.string().optional(),
  itemId: z.string().min(1, "Item is required"),
  itemName: z.string().optional(),
  orderedQuantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitCost: z.number().min(0, "Unit cost must be 0 or greater"),
  taxAmount: z.number().min(0, "Tax amount must be 0 or greater"),
  discount: z.number().min(0, "Discount must be 0 or greater").default(0),
  lineTotal: z.number().optional(),
})

const purchaseOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  locationId: z.string().min(1, "Location is required"),
  expectedDeliveryDate: z.date().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  reference: z.string().optional(),
  paymentTerms: z.string().optional(),
  shippingMethod: z.string().optional(),
  shippingCost: z.number().min(0, "Shipping cost must be 0 or greater").default(0),
  discount: z.number().min(0, "Discount must be 0 or greater").default(0),
  lines: z.array(lineItemSchema).min(1, "At least one line item is required"),
})

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>

interface ModernEditPurchaseOrderFormProps {
  purchaseOrder: PurchaseOrderWithRelations
  suppliers: Array<{ id: string; name: string; email?: string }>
  locations: Array<{ id: string; name: string }>
  items: Array<{ id: string; name: string; sku: string; sellingPrice?: number }>
  organizationId: string
}

export function ModernEditPurchaseOrderForm({
  purchaseOrder,
  suppliers,
  locations,
  items,
  organizationId
}: ModernEditPurchaseOrderFormProps) {
  const router = useRouter()
  const { mutate: updatePurchaseOrder, isPending } = useUpdatePurchaseOrder()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { title: "Order Details", description: "Basic purchase order information" },
    { title: "Supplier & Location", description: "Select supplier and delivery location" },
    { title: "Line Items", description: "Add items to your purchase order" },
    { title: "Additional Info", description: "Shipping, payment terms, and notes" }
  ]

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      orderNumber: purchaseOrder.orderNumber,
      supplierId: purchaseOrder.supplier?.id || "",
      locationId: purchaseOrder.locationId || "",
      expectedDeliveryDate: purchaseOrder.expectedDeliveryDate ? new Date(purchaseOrder.expectedDeliveryDate) : undefined,
      notes: purchaseOrder.notes || "",
      internalNotes: "", // This field might not exist in the type
      reference: "", // This field might not exist in the type
      paymentTerms: purchaseOrder.paymentTerms || "",
      shippingMethod: "", // This field might not exist in the type
      shippingCost: purchaseOrder.shippingCost || 0,
      discount: purchaseOrder.discount || 0,
      lines: purchaseOrder.lines.map(line => ({
        id: line.id,
        itemId: line.itemId || "",
        itemName: line.item?.name || "",
        orderedQuantity: line.orderedQuantity || 0,
        unitCost: line.unitCost || 0,
        taxAmount: line.taxAmount || 0,
        discount: line.discount || 0,
        lineTotal: line.lineTotal || 0,
      }))
    }
  })

  const { watch, setValue, getValues } = form
  const watchedLines = watch("lines")
  const watchedShippingCost = watch("shippingCost")
  const watchedDiscount = watch("discount")

  // Calculate totals
  const { subtotal, taxTotal, total } = useMemo(() => {
    const lineSubtotal = watchedLines.reduce((sum, line) => sum + (line.orderedQuantity * line.unitCost), 0)
    const lineTaxTotal = watchedLines.reduce((sum, line) => sum + line.taxAmount, 0)
    const lineDiscount = watchedLines.reduce((sum, line) => sum + (line.discount || 0), 0)

    const subtotal = lineSubtotal - lineDiscount
    const taxTotal = lineTaxTotal
    const total = subtotal + taxTotal + (watchedShippingCost || 0) - (watchedDiscount || 0)

    return { subtotal, taxTotal, total }
  }, [watchedLines, watchedShippingCost, watchedDiscount])

  // Update line totals when quantities or costs change
  useEffect(() => {
    const lines = getValues("lines")
    lines.forEach((line, index) => {
      const lineTotal = (line.orderedQuantity * line.unitCost) - (line.discount || 0) + line.taxAmount
      setValue(`lines.${index}.lineTotal`, lineTotal)
    })
  }, [watchedLines, setValue, getValues])

  const addLineItem = () => {
    const currentLines = getValues("lines")
    setValue("lines", [...currentLines, {
      itemId: "",
      orderedQuantity: 1,
      unitCost: 0,
      taxAmount: 0,
      discount: 0,
    }])
  }

  const removeLineItem = (index: number) => {
    const currentLines = getValues("lines")
    if (currentLines.length > 1) {
      setValue("lines", currentLines.filter((_, i) => i !== index))
    }
  }

  const onSubmit = (data: PurchaseOrderFormData) => {
    const updateData = {
      id: purchaseOrder.id,
      organizationId,
      supplierId: data.supplierId,
      locationId: data.locationId,
      date: typeof purchaseOrder.orderDate === "string"
        ? purchaseOrder.orderDate
        : (purchaseOrder.orderDate instanceof Date
          ? purchaseOrder.orderDate.toISOString()
          : new Date().toISOString()),
      expectedDeliveryDate: data.expectedDeliveryDate?.toISOString() || "",
      paymentTerms: data.paymentTerms,
      notes: data.notes,
      shippingCost: data.shippingCost,
      orderLines: data.lines.map(line => ({
        itemId: line.itemId,
        quantity: line.orderedQuantity,
        unitPrice: line.unitCost,
        discount: line.discount,
        taxRate: line.taxAmount / (line.orderedQuantity * line.unitCost) || 0,
        notes: line.itemName
      }))
    }

    updatePurchaseOrder(updateData, {
      onSuccess: () => {
        toast.success("Purchase order updated successfully!")
        router.push(`/dashboard/purchase-orders/${purchaseOrder.id}`)
      },
      onError: (error: any) => {
        if (error?.message?.includes("NEXT_REDIRECT")) {
          toast.success("Purchase order updated successfully!")
          router.push(`/dashboard/purchase-orders/${purchaseOrder.id}`)
        } else {
          toast.error(error?.message || "Failed to update purchase order")
        }
      }
    })
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const selectedSupplier = suppliers.find(s => s.id === watch("supplierId"))
  const selectedLocation = locations.find(l => l.id === watch("locationId"))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 space-y-6 transition-colors duration-300">
      <div className="container mx-auto max-w-5xl p-6">
        {/* Enhanced Header with POSTerminal styling */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 rounded-2xl shadow-xl border border-emerald-200/60 dark:border-slate-600/60 backdrop-blur-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <Save className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                Edit Purchase Order
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Modify your purchase order with modern efficiency
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {purchaseOrder.orderNumber}
                </Badge>
                <Badge variant={purchaseOrder.status === 'DRAFT' ? 'secondary' : 'default'} className="px-3 py-1 font-medium bg-white/80 backdrop-blur-sm">
                  {purchaseOrder.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-300 shadow-lg",
                  index === currentStep
                    ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30"
                    : index < currentStep
                      ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-emerald-500/20"
                      : "border-slate-300 bg-white text-slate-400 shadow-slate-300/20"
                )}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "h-1 w-20 ml-4",
                    index < currentStep ? "bg-green-500" : "bg-slate-200"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-slate-900">{steps[currentStep].title}</h3>
            <p className="text-sm text-slate-600">{steps[currentStep].description}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardContent className="p-8">
                {/* Step 1: Order Details */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="orderNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Order Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                                placeholder="PO-001"
                                disabled={purchaseOrder.status !== 'DRAFT'}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Reference</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                                placeholder="External reference"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="expectedDeliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Expected Delivery Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal border-slate-200 focus:border-blue-500",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Supplier & Location */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Supplier</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue placeholder="Select a supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{supplier.name}</span>
                                    {supplier.email && (
                                      <span className="text-sm text-slate-500">{supplier.email}</span>
                                    )}
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
                      name="locationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Delivery Location</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {(selectedSupplier || selectedLocation) && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Selection Summary</h4>
                        {selectedSupplier && (
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Supplier:</span> {selectedSupplier.name}
                          </p>
                        )}
                        {selectedLocation && (
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Location:</span> {selectedLocation.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Line Items */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Line Items</h3>
                      <Button
                        type="button"
                        onClick={addLineItem}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {watchedLines.map((line, index) => (
                        <Card key={index} className="border border-slate-200 bg-slate-50/50">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                              <div className="md:col-span-2">
                                <FormField
                                  control={form.control}
                                  name={`lines.${index}.itemId`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm text-slate-700">Item</FormLabel>
                                      <Select
                                        onValueChange={(value) => {
                                          field.onChange(value)
                                          const selectedItem = items.find(item => item.id === value)
                                          if (selectedItem) {
                                            setValue(`lines.${index}.itemName`, selectedItem.name)
                                            if (selectedItem.sellingPrice) {
                                              setValue(`lines.${index}.unitCost`, selectedItem.sellingPrice)
                                            }
                                          }
                                        }}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="text-sm">
                                            <SelectValue placeholder="Select item" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {items.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                              <div className="flex flex-col">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-xs text-slate-500">{item.sku}</span>
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
                              <FormField
                                control={form.control}
                                name={`lines.${index}.orderedQuantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-slate-700">Quantity</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        className="text-sm"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`lines.${index}.unitCost`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-slate-700">Unit Cost</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        className="text-sm"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`lines.${index}.taxAmount`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm text-slate-700">Tax</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        className="text-sm"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex items-end gap-2">
                                <div className="flex-1">
                                  <FormLabel className="text-sm text-slate-700">Line Total</FormLabel>
                                  <div className="text-sm font-medium text-slate-900 mt-2">
                                    ${((line.orderedQuantity * line.unitCost) - (line.discount || 0) + line.taxAmount).toFixed(2)}
                                  </div>
                                </div>
                                {watchedLines.length > 1 && (
                                  <Button
                                    type="button"
                                    onClick={() => removeLineItem(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Summary */}
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-slate-600">Subtotal</div>
                            <div className="font-semibold text-slate-900">${subtotal.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-slate-600">Tax Total</div>
                            <div className="font-semibold text-slate-900">${taxTotal.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-slate-600">Total</div>
                            <div className="font-semibold text-lg text-blue-900">${total.toFixed(2)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Step 4: Additional Info */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="shippingMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Shipping Method</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                                placeholder="e.g., Standard, Express"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shippingCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Shipping Cost</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="paymentTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Payment Terms</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                                placeholder="e.g., Net 30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-medium">Order Discount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                              placeholder="Public notes visible to supplier"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="internalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Internal Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                              placeholder="Internal notes (not visible to supplier)"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Final Summary */}
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-green-900">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Subtotal:</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Tax:</span>
                                <span className="font-medium">${taxTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Shipping:</span>
                                <span className="font-medium">${(watchedShippingCost || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Discount:</span>
                                <span className="font-medium">-${(watchedDiscount || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="font-semibold text-green-900">Total:</span>
                                <span className="font-bold text-lg text-green-900">${total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <div><span className="font-medium">Items:</span> {watchedLines.length}</div>
                              <div><span className="font-medium">Supplier:</span> {selectedSupplier?.name}</div>
                              <div><span className="font-medium">Location:</span> {selectedLocation?.name}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="min-w-24"
                  >
                    Previous
                  </Button>

                  <div className="flex gap-3">
                    {currentStep < steps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="min-w-24 bg-blue-600 hover:bg-blue-700"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="min-w-32 bg-green-600 hover:bg-green-700"
                      >
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Updating...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Update Purchase Order
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  )
}