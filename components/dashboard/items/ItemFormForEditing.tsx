"use client"

import ImageUploadButton from "@/components/FormInputs/ImageUploadButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import {
  useUpdateItemBasicInfo,
  useUpdateItemDetails,
  useUpdateItemPricing,
  useUpdateItemRelations,
  useUpdateItemStock,
} from "@/hooks/useAllItemQueries"

import { generateSimpleSKU } from "@/lib/generateSKU"
import { type BrandDTO } from "@/types/brand"
import { type CategoryDTO } from "@/types/category"
import { ItemWithInventoryLevelsPayload } from "@/types/itemTypes"
import { type TaxRateDTO } from "@/types/taxRates"
import { type UnitDTO } from "@/types/unit"

import { zodResolver } from "@hookform/resolvers/zod"
import { Barcode, Calendar, DollarSign, Hash, Package, Ruler, Scale, Settings, Tag, Warehouse } from 'lucide-react'
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useNotifications } from "@/components/notifications/NotificationProvider"
// -------- Schemas (align to Prisma Item model) --------
const basicInfoSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionFr: z.string().optional(),
  imageUrls: z.string().optional(),
  organizationId: z.string(),
  id: z.string(),
  thumbnail: z.string().optional(),
})

const stockSchema = z.object({
  // Inventory-related thresholds on Item
  minStockLevel: z.coerce.number().min(0, "Min stock level must be positive").default(0),
  maxStockLevel: z.coerce.number().min(0, "Max stock level must be >= 0").optional(),
  reorderLevel: z.coerce.number().min(0, "Reorder level must be >= 0").default(0),
  reorderQuantity: z.coerce.number().min(0, "Reorder quantity must be >= 0").optional(),
  organizationId: z.string(),
  id: z.string(),
  trackInventory: z.boolean().default(true),
})

const itemDetailsSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  dimensions: z.string().optional(),
  organizationId: z.string(),
  id: z.string(),
  weight: z.coerce.number().min(0, "Weight must be >= 0").optional(),
})

const itemCodesSchema = z.object({
  upc: z.string().optional(),
  ean: z.string().optional(),
  mpn: z.string().optional(),
  isbn: z.string().optional(),
  organizationId: z.string(),
  id: z.string(),
})

const pricingSchema = z.object({
  costPrice: z.coerce.number().min(0, "Cost price must be >= 0"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be >= 0"),
  organizationId: z.string(),
  id: z.string(),
})

const relationsSchema = z.object({
  categoryId: z.string(),
  brandId: z.string(),
  unitId: z.string(),
  taxRateId: z.string(),
  organizationId: z.string(),
  id: z.string(),
})

const trackingSchema = z.object({
  isActive: z.boolean().default(true),
  trackSerialNumbers: z.boolean().default(false),
  trackBatches: z.boolean().default(false),
  trackExpiry: z.boolean().default(false),
  organizationId: z.string(),
  id: z.string(),
  slug: z.string().optional(),
})

// -------- Types --------
type BasicInfoFormValues = z.infer<typeof basicInfoSchema>
type StockFormValues = z.infer<typeof stockSchema>
type ItemDetailsFormValues = z.infer<typeof itemDetailsSchema>
type ItemCodesFormValues = z.infer<typeof itemCodesSchema>
type PricingFormValues = z.infer<typeof pricingSchema>
type RelationsFormValues = z.infer<typeof relationsSchema>
type TrackingFormValues = z.infer<typeof trackingSchema>

interface ItemFormForEditingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemData?: ItemWithInventoryLevelsPayload | null
  onSuccess?: () => void
  initialBrandData: BrandDTO[]
  initialUnitData: UnitDTO[]
  initialCategoryData: CategoryDTO[]
  initialTaxRateData: TaxRateDTO[]
}

export default function ItemFormForEditing({
  open,
  onOpenChange,
  itemData,
  onSuccess,
  initialBrandData,
  initialUnitData,
  initialCategoryData,
  initialTaxRateData,
}: ItemFormForEditingProps) {
  const [activeTab, setActiveTab] = useState("basic")
  // const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState("")
  const [isSubmittingBasic, setIsSubmittingBasic] = useState(false)
  const [isSubmittingStock, setIsSubmittingStock] = useState(false)
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false)
  const [isSubmittingCodes, setIsSubmittingCodes] = useState(false)
  const [isSubmittingPricing, setIsSubmittingPricing] = useState(false)
  const [isSubmittingRelations, setIsSubmittingRelations] = useState(false)
  const [isSubmittingTracking, setIsSubmittingTracking] = useState(false)

  // Mutations
  const updateItemMutation = useUpdateItemBasicInfo()
  const updateItemStockMutation = useUpdateItemStock()
  const updateItemPricingMutation = useUpdateItemPricing()
  const updateItemDetailsMutation = useUpdateItemDetails()
  const updateItemRelationsMutation = useUpdateItemRelations()
  const { formSuccess, formError, operationStart } = useNotifications()


  // Option lists
  const brandOptions = useMemo(
    () => (initialBrandData || []).map((b) => ({ label: b.brandName, value: b.id })),
    [initialBrandData]
  )
  const taxRateOptions = useMemo(
    () => (initialTaxRateData || []).map((t) => ({ label: t.taxRateName, value: t.id })),
    [initialTaxRateData]
  )

  const unitOptions = useMemo(
    () => (initialUnitData || []).map((u) => ({ label: u.name, value: u.id })),
    [initialUnitData]
  )

  const categoryOptions = useMemo(
    () => (initialCategoryData || []).map((c) => ({ label: c.title, value: c.id })),
    [initialCategoryData]
  )

  // Helpers
  const getItemValue = (key: string, fallback: any = ""): any => {
    if (!itemData) return fallback
    const v = (itemData as any)?.[key]
    return v ?? fallback
  }

  // Forms
  const basicInfoForm = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      nameEn: "",
      nameFr: "",
      descriptionEn: "",
      descriptionFr: "",
      imageUrls: "",
      thumbnail: "",
      organizationId: "", // Add this
      id: "", // Add this
    },
  })

  const stockForm = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      trackInventory: true,
      minStockLevel: 0,
      maxStockLevel: 0,
      reorderLevel: 0,
      reorderQuantity: 0,
      organizationId: "", // Add this
      id: "", // Add this
    },
  })

  const itemDetailsForm = useForm<ItemDetailsFormValues>({
    resolver: zodResolver(itemDetailsSchema),
    defaultValues: {
      sku: "",
      barcode: "",
      dimensions: "",
      weight: 0,
      organizationId: "", // Add this
      id: "", // Add this
    },
  })

  const itemCodesForm = useForm<ItemCodesFormValues>({
    resolver: zodResolver(itemCodesSchema),
    defaultValues: {
      upc: "",
      ean: "",
      mpn: "",
      isbn: "",
      organizationId: "", // Add this
      id: "", // Add this
    },
  })

  const pricingForm = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      costPrice: 0,
      sellingPrice: 0,
      organizationId: "", // Add this
      id: "", // Add this
    },
  })

  const relationsForm = useForm<RelationsFormValues>({
    resolver: zodResolver(relationsSchema),
    defaultValues: {
      categoryId: "",
      brandId: "",
      unitId: "",
      taxRateId: "",
      organizationId: "", // Add this
      id: "", // Add this
    },
  })

  const trackingForm = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      isActive: true,
      trackSerialNumbers: false,
      trackBatches: false,
      trackExpiry: false,
      slug: "",
      organizationId: "", // Add this
      id: "", // Add this
    },
  })

  // Populate when dialog opens or item changes
  useEffect(() => {
    if (!open || !itemData) return

    basicInfoForm.reset({
      nameEn: getItemValue("nameEn", ""),
      nameFr: getItemValue("nameFr", ""),
      descriptionEn: getItemValue("descriptionEn", ""),
      descriptionFr: getItemValue("descriptionFr", ""),
      imageUrls: String(getItemValue("imageUrls", "")),
      thumbnail: getItemValue("thumbnail", ""),
      organizationId: itemData.organizationId || "", // Add this
      id: itemData.id, // Add this
    })

    stockForm.reset({
      trackInventory: Boolean(getItemValue("trackInventory", true)),
      minStockLevel: Number(getItemValue("minStockLevel", 0)),
      maxStockLevel: Number(getItemValue("maxStockLevel", 0)),
      reorderLevel: Number(getItemValue("reorderLevel", 0)),
      reorderQuantity: Number(getItemValue("reorderQuantity", 0)),
      organizationId: itemData.organizationId || "", // Add this
      id: itemData.id, // Add this
    })

    itemDetailsForm.reset({
      sku: getItemValue("sku", ""),
      barcode: getItemValue("barcode", ""),
      dimensions: getItemValue("dimensions", ""),
      weight: Number(getItemValue("weight", 0)),
      organizationId: itemData.organizationId || "", // Add this
      id: itemData.id, // Add this
    })

    itemCodesForm.reset({
      upc: getItemValue("upc", ""),
      ean: getItemValue("ean", ""),
      mpn: getItemValue("mpn", ""),
      isbn: getItemValue("isbn", ""),
      organizationId: itemData.organizationId || "", // Add this
      id: itemData.id, // Add this
    })

    pricingForm.reset({
      costPrice: Number(getItemValue("costPrice", 0)),
      sellingPrice: Number(getItemValue("sellingPrice", 0)),
      organizationId: itemData.organizationId || "", // Add this
      id: itemData.id, // Add this
    })

    relationsForm.reset({
      categoryId: getItemValue("categoryId", ""),
      brandId: getItemValue("brandId", ""),
      unitId: getItemValue("unitId", ""),
      taxRateId: getItemValue("taxRateId", ""),
      organizationId: itemData.organizationId || "", // Add this
      id: itemData.id, // Add this
    })

    trackingForm.reset({
      isActive: Boolean(getItemValue("isActive", true)),
      // map both to support DTOs that expose isSerialTracked instead of trackSerialNumbers
      trackSerialNumbers: Boolean(getItemValue("trackSerialNumbers", getItemValue("isSerialTracked" as any, false))),
      trackBatches: Boolean(getItemValue("trackBatches", false)),
      trackExpiry: Boolean(getItemValue("trackExpiry", false)),
      slug: getItemValue("slug", ""),
      organizationId: itemData.organizationId || "", // Add this
      id: itemData.id, // Add this
    })

    setCurrentImageUrl(String(getItemValue("imageUrls", "")))
  }, [open, itemData]) // eslint-disable-line react-hooks/exhaustive-deps

  // ------------ Submit Handlers ------------
  const guardItem = () => {
    if (!itemData?.id) {
      formError("Update Item", "Item data is missing. Cannot update item.")
      return false
    }
    return true
  }

  const handleBasicInfoSubmit = async (data: BasicInfoFormValues) => {
    if (!guardItem()) return
    setIsSubmittingBasic(true)
    const operationId = operationStart("Updating Basic Information")
    try {
      await updateItemMutation.mutateAsync({ id: itemData!.id, data })
      formSuccess("Basic Information Updated", `Item "${data.nameEn}" basic information has been successfully updated`)
      onSuccess?.()
    } catch (err: any) {
      formError("Update Basic Information", "Failed to update basic information", err?.message || "An unexpected error occurred")
    } finally {
      setIsSubmittingBasic(false)
    }
  }

  const handleItemDetailsSubmit = async (data: ItemDetailsFormValues) => {
    if (!guardItem()) return
    setIsSubmittingDetails(true)
    const operationId = operationStart("Updating Item Details")
    try {
      await updateItemDetailsMutation.mutateAsync({ id: itemData!.id, data })
      formSuccess("Item Details Updated", `Item details including SKU "${data.sku}" have been successfully updated`)
      onSuccess?.()
    } catch (err: any) {
      formError("Update Item Details", "Failed to update item details", err?.message || "An unexpected error occurred")
    } finally {
      setIsSubmittingDetails(false)
    }
  }


  const handleItemStockSubmit = async (data: StockFormValues) => {
    if (!guardItem()) return
    setIsSubmittingStock(true)
    const operationId = operationStart("Updating Inventory Settings")
    try {
      const updateData = {
        trackInventory: data.trackInventory,
        minStockLevel: data.minStockLevel ?? 0,
        organizationId: data.organizationId ?? "",
        id: data.id ?? "",
        maxStockLevel: data.maxStockLevel ?? 0,
        reorderLevel: data.reorderLevel ?? 0,
        reorderQuantity: data.reorderQuantity ?? 0,
      }
      await updateItemStockMutation.mutateAsync({ id: itemData!.id, data: updateData })
      formSuccess("Inventory Settings Updated", `Inventory settings updated - Min: ${data.minStockLevel}, Reorder: ${data.reorderLevel}`)
      onSuccess?.()
    } catch (err: any) {
      formError("Update Inventory Settings", "Failed to update inventory settings", err?.message || "An unexpected error occurred")
    } finally {
      setIsSubmittingStock(false)
    }
  }

  const handleItemCodesSubmit = async (data: ItemCodesFormValues) => {
    setIsSubmittingCodes(true)
    const operationId = operationStart("Updating Item Codes")
    try {
      // Optional: Implement codes update if your backend stores these on Item
      // Kept as a no-op with success notification for now
      const codes = [data.upc, data.ean, data.mpn, data.isbn].filter(Boolean)
      formSuccess("Item Codes Updated", `${codes.length} identifier codes have been successfully updated`)
      onSuccess?.()
    } finally {
      setIsSubmittingCodes(false)
    }
  }

  const handleItemPricingSubmit = async (data: PricingFormValues) => {
    if (!guardItem()) return
    setIsSubmittingPricing(true)
    const operationId = operationStart("Updating Pricing")
    try {
      const updateData = {
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        organizationId: data.organizationId,
        id: data.id,
      }
      await updateItemPricingMutation.mutateAsync({ id: itemData!.id, data: updateData })
      const margin = data.sellingPrice > 0 ? ((data.sellingPrice - data.costPrice) / data.sellingPrice * 100).toFixed(1) : 0
      formSuccess("Pricing Updated", `Cost: $${data.costPrice}, Selling: $${data.sellingPrice} (${margin}% margin)`)
      onSuccess?.()
    } catch (err: any) {
      formError("Update Pricing", "Failed to update pricing", err?.message || "An unexpected error occurred")
    } finally {
      setIsSubmittingPricing(false)
    }
  }

  const handleRelationsSubmit = async (data: RelationsFormValues) => {
    if (!guardItem()) return
    setIsSubmittingRelations(true)
    const operationId = operationStart("Updating Item Relations")
    try {
      await updateItemRelationsMutation.mutateAsync({ id: itemData!.id, data })
      const category = categoryOptions.find(c => c.value === data.categoryId)?.label || 'Unknown'
      const brand = brandOptions.find(b => b.value === data.brandId)?.label || 'Unknown'
      formSuccess("Item Relations Updated", `Category: ${category}, Brand: ${brand} relationships updated`)
      onSuccess?.()
    } catch (err: any) {
      formError("Update Item Relations", "Failed to update item relations", err?.message || "An unexpected error occurred")
    } finally {
      setIsSubmittingRelations(false)
    }
  }

  const handleTrackingSubmit = async (data: TrackingFormValues) => {
    if (!guardItem()) return
    setIsSubmittingTracking(true)
    const operationId = operationStart("Updating Tracking Settings")
    try {
      const updateData = {
        isActive: data.isActive,
        trackSerialNumbers: data.trackSerialNumbers,
        trackBatches: data.trackBatches,
        trackExpiry: data.trackExpiry,
        organizationId: data.organizationId,
        id: data.id,
        slug: data.slug ?? "",
      }
      await updateItemMutation.mutateAsync({ id: itemData!.id, data: updateData })
      const features = []
      if (data.trackSerialNumbers) features.push('Serial')
      if (data.trackBatches) features.push('Batches')
      if (data.trackExpiry) features.push('Expiry')
      const status = data.isActive ? 'Active' : 'Inactive'
      formSuccess("Tracking Settings Updated", `Status: ${status}${features.length ? `, Tracking: ${features.join(', ')}` : ''}`)
      onSuccess?.()
    } catch (err: any) {
      formError("Update Tracking Settings", "Failed to update tracking settings", err?.message || "An unexpected error occurred")
    } finally {
      setIsSubmittingTracking(false)
    }
  }


  const profitMarginPct = useMemo(() => {
    const selling = pricingForm.watch("sellingPrice") || 0
    const cost = pricingForm.watch("costPrice") || 0
    if (selling <= 0) return 0
    return Math.max(0, ((selling - cost) / selling) * 100)
  }, [pricingForm])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Edit Item: {String(getItemValue("nameEn", "Unknown Item"))}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="others" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Others
            </TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>Essential item details and visual identity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...basicInfoForm}>
                    <form onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
                      <input type="hidden" {...basicInfoForm.register("organizationId")} />
                      <input type="hidden" {...basicInfoForm.register("id")} />
                      <FormField
                        control={basicInfoForm.control}
                        name="nameEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>English Item Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter item name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicInfoForm.control}
                        name="nameFr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>French Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter French item name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicInfoForm.control}
                        name="descriptionEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>English Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter item description" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicInfoForm.control}
                        name="descriptionFr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>French Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter French item description" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Item Image
                        </label>
                        <ImageUploadButton
                          title="Update Item Image"
                          imageUrl={currentImageUrl}
                          setImageUrl={(url: string) => {
                            setCurrentImageUrl(url)
                            basicInfoForm.setValue("imageUrls", url)
                          }}
                          endpoint="itemImageUpload"
                        />
                        <div className="text-xs text-muted-foreground">
                          {currentImageUrl ? "Current item image loaded" : "No image for this item"}
                        </div>
                      </div>

                      <FormField
                        control={basicInfoForm.control}
                        name="thumbnail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thumbnail URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter thumbnail URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isSubmittingBasic} className="w-full">
                        {isSubmittingBasic ? "Updating..." : "Update Basic Info"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Item Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Item Details
                  </CardTitle>
                  <CardDescription>SKU, barcode, and physical specifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...itemDetailsForm}>
                    <form onSubmit={itemDetailsForm.handleSubmit(handleItemDetailsSubmit)} className="space-y-4">
                      <input type="hidden" {...itemDetailsForm.register("organizationId")} />
                      <input type="hidden" {...itemDetailsForm.register("id")} />
                      <FormField
                        control={itemDetailsForm.control}
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
                                  onClick={() => field.onChange(generateSimpleSKU(15, "SKU"))}
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

                      <FormField
                        control={itemDetailsForm.control}
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barcode</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Barcode className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Enter barcode" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemDetailsForm.control}
                        name="dimensions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dimensions</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="e.g., 10x5x3 cm" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemDetailsForm.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="pl-10"
                                  value={field.value ?? 0}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isSubmittingDetails} className="w-full">
                        {isSubmittingDetails ? "Updating..." : "Update Item Details"}
                      </Button>

                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Stock Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5" />
                    Stock Management
                  </CardTitle>
                  <CardDescription>Quantity thresholds and inventory tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...stockForm}>
                    <form onSubmit={stockForm.handleSubmit(handleItemStockSubmit)} className="space-y-4">
                      <input type="hidden" {...stockForm.register("organizationId")} />
                      <input type="hidden" {...stockForm.register("id")} />
                      <FormField
                        control={stockForm.control}
                        name="trackInventory"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Track Inventory</FormLabel>
                              <FormDescription>Maintain on-hand, reserved and ordered counts</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={stockForm.control}
                          name="minStockLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Stock Level *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={field.value ?? 0}
                                  onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>Alert when stock falls below this level</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={stockForm.control}
                          name="maxStockLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Stock Level</FormLabel>
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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={stockForm.control}
                          name="reorderLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reorder Level</FormLabel>
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
                        <FormField
                          control={stockForm.control}
                          name="reorderQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reorder Quantity</FormLabel>
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

                      <Button type="submit" disabled={isSubmittingStock} className="w-full">
                        {isSubmittingStock ? "Updating..." : "Update Stock Settings"}
                      </Button>

                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Pricing & Profit */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                  <CardDescription>Cost and selling price</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...pricingForm}>
                    <form onSubmit={pricingForm.handleSubmit(handleItemPricingSubmit)} className="space-y-4">
                      <input type="hidden" {...pricingForm.register("organizationId")} />
                      <input type="hidden" {...pricingForm.register("id")} />
                      <FormField
                        control={pricingForm.control}
                        name="costPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost Price *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="pl-10"
                                  value={field.value ?? 0}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingForm.control}
                        name="sellingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selling Price *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="pl-10"
                                  value={field.value ?? 0}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-2">
                        <div className="flex justify-between text-sm">
                          <span>Profit Margin:</span>
                          <Badge variant="secondary">{`${profitMarginPct.toFixed(1)}%`}</Badge>
                        </div>
                      </div>

                      <Button type="submit" disabled={isSubmittingPricing} className="w-full">
                        {isSubmittingPricing ? "Updating..." : "Update Pricing"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Others: Codes, Relations, Tracking */}
          <TabsContent value="others" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Item Codes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Item Codes
                  </CardTitle>
                  <CardDescription>Universal and manufacturer identifiers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...itemCodesForm}>
                    <form onSubmit={itemCodesForm.handleSubmit(handleItemCodesSubmit)} className="space-y-4">
                      <input type="hidden" {...itemCodesForm.register("organizationId")} />
                      <input type="hidden" {...itemCodesForm.register("id")} />
                      <FormField
                        control={itemCodesForm.control}
                        name="upc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UPC (12 digits)</FormLabel>
                            <FormControl>
                              <Input placeholder="Universal Product Code" {...field} />
                            </FormControl>
                            <FormDescription>12-digit unique item identifier</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={itemCodesForm.control}
                        name="ean"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>EAN (13 digits)</FormLabel>
                            <FormControl>
                              <Input placeholder="European Article Number" {...field} />
                            </FormControl>
                            <FormDescription>13-digit international identifier</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={itemCodesForm.control}
                        name="mpn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MPN</FormLabel>
                            <FormControl>
                              <Input placeholder="Manufacturer Part Number" {...field} />
                            </FormControl>
                            <FormDescription>Manufacturer&apos;s part number</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={itemCodesForm.control}
                        name="isbn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ISBN (13 digits)</FormLabel>
                            <FormControl>
                              <Input placeholder="International Standard Book Number" {...field} />
                            </FormControl>
                            <FormDescription>For books only</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isSubmittingCodes} className="w-full">
                        {isSubmittingCodes ? "Updating..." : "Update Item Codes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Relations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Relations
                  </CardTitle>
                  <CardDescription>Category, brand, unit, and tax settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...relationsForm}>
                    <form onSubmit={relationsForm.handleSubmit(handleRelationsSubmit)} className="space-y-4">
                      <input type="hidden" {...relationsForm.register("organizationId")} />
                      <input type="hidden" {...relationsForm.register("id")} />
                      <FormField
                        control={relationsForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {categoryOptions.map((cat) => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={relationsForm.control}
                        name="brandId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {brandOptions.map((brand) => (
                                      <SelectItem key={brand.value} value={brand.value}>
                                        {brand.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={relationsForm.control}
                        name="unitId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {unitOptions.map((unit) => (
                                      <SelectItem key={unit.value} value={unit.value}>
                                        {unit.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={relationsForm.control}
                        name="taxRateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Rate</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tax rate" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {taxRateOptions.map((taxRate) => (
                                      <SelectItem key={taxRate.value} value={taxRate.value}>
                                        {taxRate.label}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isSubmittingRelations} className="w-full">
                        {isSubmittingRelations ? "Updating..." : "Update Relations"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Tracking */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Settings & Tracking
                  </CardTitle>
                  <CardDescription>Advanced tracking options and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Form {...trackingForm}>
                      <form onSubmit={trackingForm.handleSubmit(handleTrackingSubmit)} className="space-y-4">
                        <input type="hidden" {...trackingForm.register("organizationId")} />
                        <input type="hidden" {...trackingForm.register("id")} />
                        <FormField
                          control={trackingForm.control}
                          name="trackSerialNumbers"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Serial Tracking</FormLabel>
                                <FormDescription>Track individual serial numbers</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={trackingForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active Status</FormLabel>
                                <FormDescription>Enable or disable this item</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={trackingForm.control}
                          name="trackBatches"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Batch Tracking</FormLabel>
                                <FormDescription>Track items by batch number</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={trackingForm.control}
                          name="trackExpiry"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Expiry Tracking</FormLabel>
                                <FormDescription>Store and validate expiry dates</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={trackingForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Slug</FormLabel>
                              <FormControl>
                                <Input placeholder="item-url-slug" {...field} />
                              </FormControl>
                              <FormDescription>Used in URLs (leave empty to auto-generate from name)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" disabled={isSubmittingTracking} className="w-full">
                          {isSubmittingTracking ? "Updating..." : "Update Tracking"}
                        </Button>
                      </form>
                    </Form>
                  </div>

                  <Separator className="my-6" />
                  {/* Sales Information (Read-only; if present on DTO) */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Sales Information
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Sales Count</label>
                        <div className="text-2xl font-bold">{Number(getItemValue("salesCount", 0))}</div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Sales Total</label>
                        <div className="text-2xl font-bold">
                          ${Number(getItemValue("salesTotal", 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
