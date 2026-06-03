"use client"

import { notify } from "@/lib/notifications/notify"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Loader2,
  Save,
  X,
  Package,
  DollarSign,
  Hash,
  ImageIcon,
  Barcode,
  ShoppingCart,
  FileText,
  Star,
  Activity,
  Camera,
  Upload,
  Copy,
  Zap,
  TrendingUp,
  Calculator,
  Percent,
  Eye,
  AlertTriangle,
  CheckCircle,
  Scale,
  Ruler,
  Tags,
  Building,
  Calendar
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useState, useCallback } from "react"
import { z } from "zod"
import { generateSimpleSKU } from "@/lib/generateSKU"
import ImageUploadButtonModernOriginal from "@/components/FormInputs/ImageUploadButtonModernOriginal"

// Enhanced validation schema for items
const itemCreationSchema = z.object({
  nameEn: z.string().min(1, "English product name is required").max(100, "Name must be less than 100 characters").trim(),
  nameFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionFr: z.string().optional(),
  sku: z.string()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU must be less than 50 characters")
    .regex(/^[A-Z0-9-_]+$/, "SKU can only contain uppercase letters, numbers, hyphens, and underscores"),
  barcode: z.string().optional(),
  costPrice: z.number().min(0, "Cost price must be positive").max(1000000, "Cost price seems too high"),
  sellingPrice: z.number().min(0, "Selling price must be positive").max(1000000, "Selling price seems too high"),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  unitId: z.string().optional(),
  taxRateId: z.string().optional(),
  minStockLevel: z.number().min(0, "Minimum stock must be positive").optional(),
  maxStockLevel: z.number().min(0, "Maximum stock must be positive").optional(),
  weight: z.number().min(0, "Weight must be positive").optional(),
  dimensions: z.string().optional(),
  isActive: z.boolean().default(true),
  isSerialTracked: z.boolean().default(false),
  thumbnail: z.string().optional(),
  imageUrls: z.string().optional(),
  organizationId: z.string().min(1, "Organization ID is required"),
}).refine((data) => data.sellingPrice >= data.costPrice, {
  message: "Selling price should be greater than or equal to cost price",
  path: ["sellingPrice"],
}).refine((data) => {
  if (data.maxStockLevel && data.minStockLevel) {
    return data.maxStockLevel >= data.minStockLevel
  }
  return true
}, {
  message: "Maximum stock level should be greater than minimum stock level",
  path: ["maxStockLevel"],
})

export type ItemCreationFormData = z.infer<typeof itemCreationSchema>

interface CreateItemFormProps {
  onSubmit: (data: ItemCreationFormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  categories?: Array<{ id: string; title: string }>
  brands?: Array<{ id: string; brandName: string }>
  units?: Array<{ id: string; name: string; abbreviation: string }>
  taxRates?: Array<{ id: string; rate: number; name: string }>
  organizationId: string
}

const DEFAULT_IMAGE_URL = "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd"

export function CreateItemForm({
  onSubmit,
  isLoading = false,
  onCancel,
  categories = [],
  brands = [],
  units = [],
  taxRates = [],
  organizationId
}: CreateItemFormProps) {
  const router = useRouter()
  const [itemImageUrl, setItemImageUrl] = useState(DEFAULT_IMAGE_URL)

  const form = useForm<ItemCreationFormData>({
    resolver: zodResolver(itemCreationSchema),
    defaultValues: {
      nameEn: "",
      nameFr: "",
      descriptionEn: "",
      descriptionFr: "",
      sku: "",
      barcode: "",
      costPrice: 0,
      sellingPrice: 0,
      categoryId: "",
      brandId: "",
      unitId: "",
      taxRateId: "",
      minStockLevel: 0,
      maxStockLevel: undefined,
      weight: undefined,
      dimensions: "",
      isActive: true,
      isSerialTracked: false,
      thumbnail: "",
      imageUrls: "",
      organizationId,
    },
  })

  const handleSubmit = async (data: ItemCreationFormData) => {
    try {
      const submitData = {
        ...data,
        thumbnail: itemImageUrl || DEFAULT_IMAGE_URL,
        imageUrls: itemImageUrl || "",
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error("Failed to create item:", error)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  // Generate SKU functionality
  const generateSKU = useCallback(() => {
    const newSku = generateSimpleSKU(9, "ITEM")
    form.setValue("sku", newSku, { shouldValidate: true })
    notify.success("SKU generated successfully")
  }, [form])

  // Copy SKU to clipboard
  const copySKU = useCallback(async () => {
    const currentSku = form.getValues("sku")
    if (currentSku) {
      try {
        await navigator.clipboard.writeText(currentSku)
        notify.success("SKU copied to clipboard!")
      } catch (err) {
        notify.error("Failed to copy SKU to clipboard")
      }
    }
  }, [form])

  // Calculate profit margin
  const watchedCostPrice = form.watch("costPrice")
  const watchedSellingPrice = form.watch("sellingPrice")
  const profitMargin = watchedSellingPrice && watchedCostPrice
    ? ((watchedSellingPrice - watchedCostPrice) / watchedSellingPrice * 100).toFixed(1)
    : "0"

  // Generate preview initials
  const itemName = form.watch("nameEn")
  const itemSKU = form.watch("sku")
  const isActiveItem = form.watch("isActive")

  const avatarFallback = itemName
    ? itemName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : "??"

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Create New Item
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Add a new product to your inventory with complete details
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-violet-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    Product Information
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    Fill in the product details below
                  </CardDescription>
                </div>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                      <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-100/80 dark:bg-slate-800/80">
                          <TabsTrigger value="basic" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="hidden sm:inline">Basic Info</span>
                          </TabsTrigger>
                          <TabsTrigger value="pricing" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="hidden sm:inline">Pricing</span>
                          </TabsTrigger>
                          <TabsTrigger value="inventory" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">Inventory</span>
                          </TabsTrigger>
                          <TabsTrigger value="media" className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Media</span>
                          </TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-6 mt-6">
                          <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="nameEn"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    English Product Name *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter product name"
                                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                      {...field}
                                    />
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
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                                    French Product Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter French product name"
                                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="sku"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    SKU (Stock Keeping Unit) *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="space-y-2">
                                      <Input
                                        placeholder="Enter or generate SKU"
                                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-mono"
                                        {...field}
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          onClick={generateSKU}
                                          variant="outline"
                                          size="sm"
                                          className="flex-1"
                                        >
                                          <Zap className="h-3 w-3 mr-1" />
                                          Generate
                                        </Button>
                                        {field.value && (
                                          <Button
                                            type="button"
                                            onClick={copySKU}
                                            variant="outline"
                                            size="sm"
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Unique identifier for this product
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="descriptionEn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">English Product Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe the product features, benefits, and details..."
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[100px]"
                                    {...field}
                                  />
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
                                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">French Product Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe the product in French..."
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="categoryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <Tags className="h-4 w-4" />
                                    Category
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                          {category.title}
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
                              name="brandId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    Brand
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                                        <SelectValue placeholder="Select brand" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id}>
                                          {brand.brandName}
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
                            name="barcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                  <Barcode className="h-4 w-4" />
                                  Barcode
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter barcode (UPC, EAN, etc.)"
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-mono"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                  Optional barcode for scanning and identification
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>

                        {/* Pricing Tab */}
                        <TabsContent value="pricing" className="space-y-6 mt-6">
                          <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="costPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <Calculator className="h-4 w-4" />
                                    Cost Price *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                      <Input
                                        type="number"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Your cost to acquire or produce this item
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="sellingPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    Selling Price *
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                      <Input
                                        type="number"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Price you sell this item for
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Profit Margin Display */}
                          {(watchedCostPrice > 0 || watchedSellingPrice > 0) && (
                            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Pricing Analysis</h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="text-emerald-600 dark:text-emerald-400 font-medium">Cost Price</div>
                                  <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                                    {formatCurrency(watchedCostPrice)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-emerald-600 dark:text-emerald-400 font-medium">Selling Price</div>
                                  <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                                    {formatCurrency(watchedSellingPrice)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                    <Percent className="h-3 w-3" />
                                    Profit Margin
                                  </div>
                                  <div className={`text-lg font-bold ${
                                    Number(profitMargin) > 0
                                      ? 'text-emerald-900 dark:text-emerald-100'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {profitMargin}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="unitId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <Scale className="h-4 w-4" />
                                    Unit of Measure
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                                        <SelectValue placeholder="Select unit" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {units.map((unit) => (
                                        <SelectItem key={unit.id} value={unit.id}>
                                          {unit.name} ({unit.abbreviation})
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
                              name="taxRateId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <Percent className="h-4 w-4" />
                                    Tax Rate
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                                        <SelectValue placeholder="Select tax rate" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {taxRates.map((rate) => (
                                        <SelectItem key={rate.id} value={rate.id}>
                                          {rate.name} ({rate.rate}%)
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>

                        {/* Inventory Tab */}
                        <TabsContent value="inventory" className="space-y-6 mt-6">
                          <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="minStockLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Minimum Stock Level
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      min="0"
                                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Alert when stock falls below this level
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="maxStockLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Maximum Stock Level
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      min="0"
                                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Maximum stock to maintain
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="weight"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <Scale className="h-4 w-4" />
                                    Weight (kg)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0.0"
                                      min="0"
                                      step="0.1"
                                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Item weight for shipping calculations
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="dimensions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                    <Ruler className="h-4 w-4" />
                                    Dimensions
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="L x W x H (e.g., 10 x 5 x 3 cm)"
                                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Physical dimensions of the item
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="isActive"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                      <Activity className="h-4 w-4" />
                                      Active Product
                                    </FormLabel>
                                    <FormDescription className="text-sm text-slate-600 dark:text-slate-400">
                                      Enable this product for sales and inventory tracking
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="isSerialTracked"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                      <Hash className="h-4 w-4" />
                                      Serial Number Tracking
                                    </FormLabel>
                                    <FormDescription className="text-sm text-slate-600 dark:text-slate-400">
                                      Track individual serial numbers for this product
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>

                        {/* Media Tab */}
                        <TabsContent value="media" className="space-y-6 mt-6">
                          <div className="space-y-4">
                            <div className="text-center">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Product Images</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                Upload high-quality images to showcase your product
                              </p>
                            </div>

                            <div className="flex justify-center">
                              <ImageUploadButtonModernOriginal
                                title="Upload Product Image"
                                imageUrl={itemImageUrl}
                                setImageUrl={setItemImageUrl}
                                endpoint="itemImageUpload"
                              />
                            </div>

                            <div className="text-center">
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Recommended: High-resolution images (1024x1024px or larger) in JPG or PNG format
                              </p>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Form Actions */}
                      <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          type="submit"
                          disabled={form.formState.isSubmitting || isLoading}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                        >
                          {form.formState.isSubmitting || isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Create Product
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={form.formState.isSubmitting || isLoading}
                          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-slate-50 to-violet-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    Product Preview
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    Live preview of your product
                  </CardDescription>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Product Image and Name */}
                  <div className="text-center space-y-3">
                    <div className="relative mx-auto w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                      <img
                        src={itemImageUrl || DEFAULT_IMAGE_URL}
                        alt={itemName || "Product preview"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        {itemName || "New Product"}
                      </h3>
                      {itemSKU && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          SKU: {itemSKU}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <Badge
                      variant={isActiveItem ? "default" : "secondary"}
                      className={
                        isActiveItem
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${isActiveItem ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                      {isActiveItem ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Pricing Preview */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Pricing
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Cost Price</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(watchedCostPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Selling Price</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(watchedSellingPrice)}
                        </span>
                      </div>
                      {Number(profitMargin) !== 0 && (
                        <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-900/20">
                          <span className="text-sm text-emerald-600 dark:text-emerald-400">Profit Margin</span>
                          <span className={`font-semibold ${
                            Number(profitMargin) > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {profitMargin}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      This preview shows how your product will appear in the inventory table and throughout the system.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
