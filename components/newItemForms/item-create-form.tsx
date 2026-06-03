"use client"

import { notify } from "@/lib/notifications/notify"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import {
  useCreateItem,
  useGetItem,
  useUpdateItemBasicInfo,
  useUpdateItemDetails,
  useUpdateItemPricing,
  useUpdateItemRelations,
  useUpdateItemStock,
  useUpdateItemTracking
} from "@/hooks/itemsHooks/useItemHooks"

import { createItemSchema } from "@/lib/item/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { DollarSign, Hash, ImageIcon, Package, Ruler, Settings, Warehouse } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

// Props data minimal DTOs
type Brand = { id: string; brandName: string }
type Category = { id: string; title: string }
type Unit = { id: string; name: string; abbreviation?: string | null }
type TaxRate = { id: string; taxRateName: string; rate: number }
type Location = { id: string; name: string }

// Form Modes
type Mode = "create" | "edit"

const createSchema = createItemSchema

type CreateValues = z.infer<typeof createSchema> & {
  // For client-only string capture of date that we coerce on submit
  initialInventory?: {
    locationId: string
    quantity: number
    unitCost?: number
    notes?: string
    createdById?: string
    batchNumber?: string
    serialNumbers?: string[] | string
    expiryDate?: Date
    referenceNumber?: string
  }
}

function generateSimpleSKU(length = 12, prefix = "SKU"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let res = ""
  for (let i = 0; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length))
  return `${prefix}-${res}`
}

export type ItemCreateFormProps = {
  organizationId: string
  // Lists
  initialBrandData?: Brand[]
  initialUnitData?: Unit[]
  initialCategoryData?: Category[]
  initialTaxRateData?: TaxRate[]
  initialLocations?: Location[]
  // Behavior
  mode?: Mode
  itemId?: string | null
  onCreated?: (id: string) => void
  onUpdated?: (id: string) => void
  onClose?: () => void
}

export default function ItemCreateForm({
  organizationId,
  initialBrandData = [],
  initialUnitData = [],
  initialCategoryData = [],
  initialTaxRateData = [],
  initialLocations = [],
  mode = "create",
  itemId = null,
  onCreated,
  onUpdated,
  onClose,
}: ItemCreateFormProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [imagePreview, setImagePreview] = useState<string>("")

  // If editing, fetch the latest item to prefill safely
  const { data: existingItem } = useGetItem(itemId ?? undefined, organizationId, {
    enabled: mode === "edit" && !!itemId,
  })

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      organizationId,
      nameEn: "",
      nameFr: "",
      descriptionEn: "",
      descriptionFr: "",
      imageUrls: "",
      thumbnail: "",
      sku: "",
      barcode: "",
      dimensions: "",
      weight: 0,
      upc: "",
      ean: "",
      mpn: "",
      isbn: "",
      costPrice: 0,
      sellingPrice: 0,
      tax: 0,
      categoryId: undefined,
      brandId: undefined,
      unitId: undefined,
      taxRateId: undefined,
      minStockLevel: 0,
      maxStockLevel: 0,
      unitOfMeasure: "",
      isActive: true,
      isSerialTracked: false,
      slug: "",
      initialInventory: undefined,
    } as any,
  })

  // Mutations
  const { mutateAsync: createItem, isPending: isCreating } = useCreateItem()
  const updateBasic = useUpdateItemBasicInfo()
  const updateDetails = useUpdateItemDetails()
  const updatePricing = useUpdateItemPricing()
  const updateRelations = useUpdateItemRelations()
  const updateStock = useUpdateItemStock()
  const updateTracking = useUpdateItemTracking()

  // Prefill when editing data arrives
  useEffect(() => {
    if (mode !== "edit" || !existingItem) return
    form.reset({
      organizationId,
      nameEn: existingItem.nameEn ?? "",
      nameFr: existingItem.nameFr ?? "",
      descriptionEn: existingItem.descriptionEn ?? "",
      descriptionFr: existingItem.descriptionFr ?? "",
      imageUrls: (existingItem as any).imageUrls ?? "",
      thumbnail: (existingItem as any).thumbnail ?? "",
      sku: existingItem.sku ?? "",
      barcode: (existingItem as any).barcode ?? "",
      dimensions: (existingItem as any).dimensions ?? "",
      weight: Number((existingItem as any).weight ?? 0),
      upc: (existingItem as any).upc ?? "",
      ean: (existingItem as any).ean ?? "",
      mpn: (existingItem as any).mpn ?? "",
      isbn: (existingItem as any).isbn ?? "",
      costPrice: Number(existingItem.costPrice ?? 0),
      sellingPrice: Number(existingItem.sellingPrice ?? 0),
      tax: Number((existingItem as any).tax ?? 0),
      categoryId: (existingItem as any).categoryId ?? undefined,
      brandId: (existingItem as any).brandId ?? undefined,
      unitId: (existingItem as any).unitId ?? undefined,
      taxRateId: (existingItem as any).taxRateId ?? undefined,
      minStockLevel: Number((existingItem as any).minStockLevel ?? 0),
      maxStockLevel: (existingItem as any).maxStockLevel ?? undefined,
      unitOfMeasure: (existingItem as any).unitOfMeasure ?? "",
      isActive: Boolean((existingItem as any).isActive ?? true),
      isSerialTracked: Boolean((existingItem as any).isSerialTracked ?? false),
      slug: (existingItem as any).slug ?? "",
      initialInventory: undefined, // not used in edit
    } as any)
    setImagePreview(String((existingItem as any).imageUrls ?? ""))
  }, [mode, existingItem, organizationId]) // eslint-disable-line react-hooks/exhaustive-deps

  const profitMarginPct = useMemo(() => {
    const selling = Number(form.watch("sellingPrice") || 0)
    const cost = Number(form.watch("costPrice") || 0)
    if (selling <= 0) return 0
    return Math.max(0, ((selling - cost) / selling) * 100)
  }, [form])

  const isPending = isCreating // alias for submit button label in create mode

  const handleSubmit = async (values: CreateValues) => {
    try {
      // validation sanity for prices
      if ((values.sellingPrice ?? 0) < (values.costPrice ?? 0)) {
        notify.warning("Selling price is below cost", { description: "Consider adjusting your selling price." })
      }

      if (mode === "create") {
        // coerce serialNumbers and expiry (create only)
        const serials =
          typeof values.initialInventory?.serialNumbers === "string"
            ? (values.initialInventory?.serialNumbers as string)
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
            : (values.initialInventory?.serialNumbers as string[] | undefined)

        const expiry = values.initialInventory?.expiryDate || undefined

        const payload: any = {
          ...values,
          initialInventory: values.initialInventory
            ? {
              ...values.initialInventory,
              serialNumbers: serials,
              expiryDate: expiry,
            }
            : undefined,
        }

        const created = await createItem(payload)
        notify.success("Item created successfully")
        onCreated?.(created.id)

        form.reset({
          ...form.getValues(),
          nameEn: "",
          nameFr: "",
          descriptionEn: "",
          descriptionFr: "",
          imageUrls: "",
          thumbnail: "",
          sku: "",
          barcode: "",
          dimensions: "",
          weight: 0,
          upc: "",
          ean: "",
          mpn: "",
          isbn: "",
          costPrice: 0,
          sellingPrice: 0,
          tax: 0,
          categoryId: undefined,
          brandId: undefined,
          unitId: undefined,
          taxRateId: undefined,
          minStockLevel: 0,
          maxStockLevel: 0,
          unitOfMeasure: "",
          isActive: true,
          isSerialTracked: false,
          slug: "",
          initialInventory: undefined,
          organizationId,
        } as any)
        setImagePreview("")
        setActiveTab("basic")
        onClose?.()
        return
      }

      // Edit mode: split into dedicated update actions to keep payloads aligned with backend
      if (!itemId) {
        notify.error("No item selected for update")
        return
      }

      await Promise.all([
        updateBasic.mutateAsync({
          id: itemId,
          organizationId,
          nameEn: values.nameEn,
          nameFr: values.nameFr,
          descriptionEn: values.descriptionEn,
          descriptionFr: values.descriptionFr,
          imageUrls: values.imageUrls ?? "",
          thumbnail: values.thumbnail ?? "",
        }),
        updateDetails.mutateAsync({
          id: itemId,
          organizationId,
          sku: values.sku,
          barcode: values.barcode ?? "",
          dimensions: values.dimensions ?? "",
          weight: values.weight ?? 0,
          upc: values.upc ?? "",
          ean: values.ean ?? "",
          mpn: values.mpn ?? "",
          isbn: values.isbn ?? "",
        }),
        updatePricing.mutateAsync({
          id: itemId,
          organizationId,
          costPrice: values.costPrice ?? 0,
          sellingPrice: values.sellingPrice ?? 0,
          tax: values.tax ?? 0,
        }),
        updateRelations.mutateAsync({
          id: itemId,
          organizationId,
          categoryId: values.categoryId ?? null,
          brandId: values.brandId ?? null,
          unitId: values.unitId ?? null,
          taxRateId: values.taxRateId ?? null,
        }),
        updateStock.mutateAsync({
          id: itemId,
          organizationId,
          minStockLevel: values.minStockLevel ?? 0,
          maxStockLevel: values.maxStockLevel ?? null,
          unitOfMeasure: values.unitOfMeasure ?? "",
          // No inventory adjustment here from this screen
        }),
        updateTracking.mutateAsync({
          id: itemId,
          organizationId,
          isActive: !!values.isActive,
          isSerialTracked: !!values.isSerialTracked,
          slug: values.slug ?? "",
        }),
      ])

      notify.success("Item updated")
      onUpdated?.(itemId)
      onClose?.()
    } catch (err: any) {
      notify.error(mode === "create" ? "Failed to create item" : "Failed to update item", {
        description: err?.message || "Unknown error",
      })
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{mode === "create" ? "Create New Item" : "Edit Item"}</CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Enter product details, pricing, relationships, and optional initial inventory."
              : "Update product details, pricing, relationships, and settings."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                {/* Basic */}
                <TabsContent value="basic" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Basic Information
                        </CardTitle>
                        <CardDescription>Essential item details and visuals.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="nameEn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English Item Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Premium Flour 1kg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nameFr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French Item Name</FormLabel>
                              <FormControl>
                                <Input placeholder="ex. Farine premium 1kg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="descriptionEn"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the item" className="min-h-[100px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="descriptionFr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Decrivez l'article" className="min-h-[100px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="imageUrls"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      placeholder="https://..."
                                      value={field.value ?? ""}
                                      onChange={(e) => {
                                        const v = e.target.value
                                        field.onChange(v)
                                        setImagePreview(v)
                                      }}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>Direct link to the primary image.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="thumbnail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Thumbnail URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormDescription>Smaller image for lists.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {imagePreview ? (
                          <div className="rounded-md border p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt="Preview"
                              src={imagePreview || "/placeholder.svg?height=160&width=240&query=item-image-preview"}
                              className="h-40 w-auto object-contain mx-auto"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-muted-foreground gap-2 text-sm">
                            <ImageIcon className="h-4 w-4" />
                            No image preview
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Ruler className="h-5 w-5" />
                          Item Details
                        </CardTitle>
                        <CardDescription>Identifiers and physical specs.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU *</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input placeholder="Enter SKU" {...field} />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => field.onChange(generateSimpleSKU(12))}
                                    title="Generate SKU"
                                  >
                                    <Hash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="barcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Barcode</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 1234567890123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Weight (kg)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={field.value ?? 0}
                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="dimensions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dimensions</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 10x5x3 cm" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="upc"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>UPC</FormLabel>
                                <FormControl>
                                  <Input placeholder="Optional" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="ean"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>EAN</FormLabel>
                                <FormControl>
                                  <Input placeholder="Optional" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="mpn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>MPN</FormLabel>
                                <FormControl>
                                  <Input placeholder="Optional" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="isbn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ISBN</FormLabel>
                                <FormControl>
                                  <Input placeholder="Optional (for books)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pricing & Relations */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Pricing
                        </CardTitle>
                        <CardDescription>Costs and selling price.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="costPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost Price *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={field.value ?? 0}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sellingPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selling Price *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={field.value ?? 0}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-between text-sm">
                          <span>Profit Margin</span>
                          <Badge variant="secondary">{profitMarginPct.toFixed(1)}%</Badge>
                        </div>
                        <FormField
                          control={form.control}
                          name="tax"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={field.value ?? 0}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Relations</CardTitle>
                        <CardDescription>Category, brand, unit, and tax rates.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {initialCategoryData.map((c) => (
                                      <SelectItem key={c.id} value={c.id}>
                                        {c.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="brandId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brand</FormLabel>
                              <FormControl>
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select brand" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {initialBrandData.map((b) => (
                                      <SelectItem key={b.id} value={b.id}>
                                        {b.brandName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="unitId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit</FormLabel>
                              <FormControl>
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {initialUnitData.map((u) => (
                                      <SelectItem key={u.id} value={u.id}>
                                        {u.name} {u.abbreviation ? `(${u.abbreviation})` : ""}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="taxRateId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tax Rate</FormLabel>
                              <FormControl>
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select tax rate" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {initialTaxRateData.map((t) => (
                                      <SelectItem key={t.id} value={t.id}>
                                        {t.taxRateName} ({t.rate}%)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Inventory */}
                <TabsContent value="inventory" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Warehouse className="h-5 w-5" />
                          Stock Policy
                        </CardTitle>
                        <CardDescription>Minimum/maximum levels and unit of measure.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="minStockLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Level *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={field.value ?? 0}
                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>Alert when stock drops below this level.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="maxStockLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Level</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={field.value ?? 0}
                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="unitOfMeasure"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit of Measure (free text)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., pieces, kg, boxes" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Seed Initial Inventory</CardTitle>
                        <CardDescription>
                          Optional: add opening quantity at a location. (Create mode only)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="initialInventory.locationId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value ?? ""}
                                  onValueChange={(v) => {
                                    if (!v) {
                                      form.setValue("initialInventory", undefined as any)
                                      return
                                    }
                                    form.setValue("initialInventory", {
                                      ...(form.getValues().initialInventory || {}),
                                      locationId: v,
                                      quantity: Number(form.getValues().initialInventory?.quantity || 0),
                                    } as any)
                                    field.onChange(v)
                                  }}
                                  disabled={mode === "edit"}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select location (optional)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {initialLocations.map((loc) => (
                                      <SelectItem key={loc.id} value={loc.id}>
                                        {loc.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>Leave empty to skip seeding inventory.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="initialInventory.quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={field.value ?? 0}
                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                    disabled={mode === "edit"}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="initialInventory.unitCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit Cost</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={field.value ?? form.getValues().costPrice ?? 0}
                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                    disabled={mode === "edit"}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="initialInventory.notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Input placeholder="Optional note" {...field} disabled={mode === "edit"} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="initialInventory.batchNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Batch Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Optional" {...field} disabled={mode === "edit"} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="initialInventory.expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <DatePicker
                                    date={field.value}
                                    onDateChange={field.onChange}
                                    placeholder="Select expiry date"
                                    minDate={new Date()}
                                    disabled={mode === "edit"}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="initialInventory.serialNumbers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Serial Numbers</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="One serial per line (optional)"
                                  value={
                                    Array.isArray(field.value)
                                      ? (field.value as string[]).join("\n")
                                      : ((field.value as string | undefined) ?? "")
                                  }
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="min-h-[100px]"
                                  disabled={mode === "edit"}
                                />
                              </FormControl>
                              <FormDescription>Used if serial tracking is enabled.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Settings */}
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Status & URL
                      </CardTitle>
                      <CardDescription>Visibility and slug.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active</FormLabel>
                                <FormDescription>Enable or disable this item.</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="isSerialTracked"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Serial Tracking</FormLabel>
                                <FormDescription>Track unique serial numbers.</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Auto-generated from name if left empty"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset()
                    onClose?.()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {mode === "create" ? (isPending ? "Creating..." : "Create Item") : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
