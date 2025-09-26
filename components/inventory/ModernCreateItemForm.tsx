"use client"

import ImageUploadButtonModernOriginal from "@/components/FormInputs/ImageUploadButtonModernOriginal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import { generateSimpleSKU } from "@/lib/generateSKU"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Barcode,
  Boxes,
  Building,
  Calculator,
  CheckCheck,
  CheckCircle,
  ChevronRight,
  Copy,
  DollarSign,
  Eye,
  Hash,
  ImageIcon,
  Lightbulb,
  Loader2,
  Package,
  Percent,
  Ruler,
  Save,
  Scale,
  ShoppingCart,
  Sparkles,
  Tags,
  TrendingUp,
  Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNotifications } from "../notifications/NotificationProvider"

// Enhanced validation schema for items
const itemCreationSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name must be less than 100 characters").trim(),
  description: z.string().optional(),
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

interface ModernCreateItemFormProps {
  onSubmit?: (data: ItemCreationFormData) => Promise<void>
  action?: (formData: FormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  categories?: Array<{ id: string; title: string }>
  brands?: Array<{ id: string; brandName: string }>
  units?: Array<{ id: string; name: string; abbreviation: string }>
  taxRate?: Array<{ id: string; rate: number; name: string }>
  organizationId: string
}

const DEFAULT_IMAGE_URL = "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd"

const FORM_STEPS = [
  { id: 'basic', title: 'Basic Info', icon: Package, description: 'Product name and description' },
  { id: 'details', title: 'Details', icon: Hash, description: 'SKU, barcode, and specs' },
  { id: 'pricing', title: 'Pricing', icon: DollarSign, description: 'Cost and selling prices' },
  { id: 'inventory', title: 'Inventory', icon: Boxes, description: 'Stock levels and tracking' },
  { id: 'media', title: 'Media', icon: ImageIcon, description: 'Product images' },
] as const

type FormStep = typeof FORM_STEPS[number]['id']

export function ModernCreateItemForm({
  onSubmit,
  action,
  isLoading = false,
  onCancel,
  categories = [],
  brands = [],
  units = [],
  taxRate = [],
  organizationId
}: ModernCreateItemFormProps) {
  const router = useRouter()
  const [itemImageUrl, setItemImageUrl] = useState(DEFAULT_IMAGE_URL)
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set())
  const { success, error, warning, info, operationStart, operationComplete } = useNotifications()

  // Welcome notification when component mounts
  useEffect(() => {
    info("Get Started", "Complete each step to create your new product. Start with the basic information and work your way through!")
  }, [info])

  const form = useForm<ItemCreationFormData>({
    resolver: zodResolver(itemCreationSchema),
    defaultValues: {
      name: "",
      description: "",
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
    mode: "onChange"
  })

  const currentStepIndex = FORM_STEPS.findIndex(step => step.id === currentStep)
  const progressPercentage = ((currentStepIndex + 1) / FORM_STEPS.length) * 100

  // Watch form values for real-time calculations
  const watchedValues = form.watch()
  const { costPrice, sellingPrice, name, sku, isActive } = watchedValues

  // Calculate profit margin
  const profitMargin = sellingPrice && costPrice
    ? ((sellingPrice - costPrice) / sellingPrice * 100).toFixed(1)
    : "0"

  const profitAmount = sellingPrice && costPrice ? sellingPrice - costPrice : 0

  // Form validation by step
  const validateStep = async (step: FormStep): Promise<boolean> => {
    const operationId = operationStart(`Validating ${FORM_STEPS.find(s => s.id === step)?.title}`)

    const fieldsByStep: Record<FormStep, (keyof ItemCreationFormData)[]> = {
      basic: ['name', 'description'],
      details: ['sku', 'barcode', 'categoryId', 'brandId'],
      pricing: ['costPrice', 'sellingPrice', 'unitId', 'taxRateId'],
      inventory: ['minStockLevel', 'maxStockLevel', 'weight', 'dimensions'],
      media: []
    }

    const fieldsToValidate = fieldsByStep[step]
    const result = await form.trigger(fieldsToValidate)

    if (result) {
      setCompletedSteps(prev => new Set(prev).add(step))
      operationComplete("Step Validated", `${FORM_STEPS.find(s => s.id === step)?.title} section completed successfully`)
    } else {
      warning("Validation Required", `Please complete all required fields in the ${FORM_STEPS.find(s => s.id === step)?.title} section`)
    }

    return result
  }

  const handleNext = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStepIndex < FORM_STEPS.length - 1) {
      const nextStep = FORM_STEPS[currentStepIndex + 1]
      setCurrentStep(nextStep.id)
      info("Step Progress", `Moving to ${nextStep.title} - ${nextStep.description}`)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(FORM_STEPS[currentStepIndex - 1].id)
    }
  }

  const handleStepClick = async (stepId: FormStep) => {
    const stepIndex = FORM_STEPS.findIndex(step => step.id === stepId)
    const currentIndex = FORM_STEPS.findIndex(step => step.id === currentStep)
    const targetStep = FORM_STEPS.find(step => step.id === stepId)

    // Only allow forward navigation if current step is valid
    if (stepIndex > currentIndex) {
      const isValid = await validateStep(currentStep)
      if (!isValid) return
    }

    setCurrentStep(stepId)
    if (targetStep) {
      info("Step Navigation", `Switched to ${targetStep.title} section`)
    }
  }

  const handleSubmit = async (data: ItemCreationFormData) => {
    const operationId = operationStart("Creating Product")

    try {
      const submitData = {
        ...data,
        thumbnail: itemImageUrl || DEFAULT_IMAGE_URL,
        imageUrls: itemImageUrl || "",
      }

      info("Processing Product", "Validating product information and saving to inventory...")

      if (action) {
        // Server action approach
        const formData = new FormData()
        Object.entries(submitData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })
        await action(formData)
      } else if (onSubmit) {
        // Traditional callback approach
        await onSubmit(submitData)
      }

      operationComplete("Product Created", `${data.name} has been successfully added to your inventory with SKU: ${data.sku}`)
    } catch (error) {
      console.log("Failed to create item:", error)
      operationComplete("Creation Failed", "Failed to create product. Please check your information and try again.")
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
    success("SKU Generated", `New SKU created: ${newSku}`)
  }, [form, success])

  // Auto-generate SKU when name changes
  useEffect(() => {
    if (name && !sku) {
      const autoSku = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6) + Math.random().toString(36).substr(2, 3).toUpperCase()
      form.setValue("sku", autoSku, { shouldValidate: true })
      info("Auto-Generated SKU", `SKU automatically created from product name: ${autoSku}`)
    }
  }, [name, sku, form, info])

  // Provide helpful notifications based on form progress
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === "costPrice" || name === "sellingPrice") {
        const costPrice = value.costPrice || 0
        const sellingPrice = value.sellingPrice || 0

        if (costPrice > 0 && sellingPrice > 0) {
          const margin = ((sellingPrice - costPrice) / sellingPrice * 100)
          if (margin < 0) {
            warning("Selling Below Cost", "Your selling price is lower than cost price. This will result in a loss.")
          } else if (margin < 10) {
            warning("Low Profit Margin", `Current profit margin is ${margin.toFixed(1)}%. Consider reviewing your pricing strategy.`)
          } else if (margin > 50) {
            success("Excellent Margin", `Great profit margin of ${margin.toFixed(1)}%! This should be profitable.`)
          }
        }
      }

      if (name === "minStockLevel" && value.minStockLevel && value.minStockLevel > 0) {
        info("Stock Alert Set", `You'll be notified when stock falls below ${value.minStockLevel} units`)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, warning, success, info])

  // Form completion notification
  useEffect(() => {
    if (completedSteps.size === FORM_STEPS.length - 1 && currentStep === 'media') {
      success("Almost Done!", "You've completed all required sections. Add an image and you're ready to create the product!")
    }
  }, [completedSteps.size, currentStep, success])

  // Copy SKU to clipboard
  const copySKU = useCallback(async () => {
    const currentSku = form.getValues("sku")
    if (currentSku) {
      try {
        await navigator.clipboard.writeText(currentSku)
        success("Copied to Clipboard", `SKU "${currentSku}" has been copied to your clipboard`)
      } catch (err) {
        error("Copy Failed", "Failed to copy SKU to clipboard. Please try selecting and copying manually.")
      }
    }
  }, [form, success, error])

  // Generate preview initials
  const avatarFallback = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : "??"

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Basic Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Let's start with the essential details about your product</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      Product Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a catchy product name"
                        className="h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      This will be the main name customers see
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300">Product Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what makes this product special. Include key features, benefits, and any important details customers should know..."
                        className="min-h-[120px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      A good description helps customers understand your product better
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {name && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Great! Your product name looks good</p>
                      <p className="text-sm text-blue-700 dark:text-blue-200">SKU will be auto-generated based on this name</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'details':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg mb-4">
                <Hash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Product Details</h3>
              <p className="text-slate-600 dark:text-slate-400">Add unique identifiers and specifications</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Hash className="h-4 w-4 text-purple-500" />
                      SKU (Stock Keeping Unit) *
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="relative">
                          <Input
                            placeholder="AUTO-GENERATED"
                            className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-sm font-mono text-center font-bold tracking-wider"
                            {...field}
                            value={field.value || ""}
                          />
                          {field.value && (
                            <Button
                              type="button"
                              onClick={copySKU}
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={generateSKU}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Generate New SKU
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Unique identifier for inventory tracking
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Barcode className="h-4 w-4 text-purple-500" />
                      Barcode
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="UPC, EAN, or other barcode"
                        className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-sm font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Optional - for scanning and POS systems
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Tags className="h-4 w-4 text-purple-500" />
                      Category
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-sm">
                          <SelectValue placeholder="Choose a category" />
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
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Helps organize your inventory
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-500" />
                      Brand
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-sm">
                          <SelectValue placeholder="Select a brand" />
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
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Product manufacturer or brand
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pricing & Units</h3>
              <p className="text-slate-600 dark:text-slate-400">Set your costs, prices, and units of measurement</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-emerald-500" />
                      Cost Price *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="pl-12 h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Your cost to acquire this item
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
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-emerald-500" />
                      Selling Price *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="pl-12 h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Price customers will pay
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Profit Analysis */}
            {(costPrice > 0 || sellingPrice > 0) && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">Profit Analysis</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">Cost Price</div>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {formatCurrency(costPrice)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">Selling Price</div>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {formatCurrency(sellingPrice)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1 flex items-center justify-center gap-1">
                      <Percent className="h-4 w-4" />
                      Profit Margin
                    </div>
                    <div className={`text-2xl font-bold ${Number(profitMargin) > 0
                      ? 'text-emerald-900 dark:text-emerald-100'
                      : 'text-red-600 dark:text-red-400'
                      }`}>
                      {profitMargin}%
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                      {formatCurrency(profitAmount)} profit per unit
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
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-emerald-500" />
                      Unit of Measure
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm">
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
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      How this product is counted/measured
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxRateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Percent className="h-4 w-4 text-emerald-500" />
                      Tax Rate
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm">
                          <SelectValue placeholder="Select tax rate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taxRate.map((rate) => (
                          <SelectItem key={rate.id} value={rate.id}>
                            {rate.name} ({rate.rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Applicable tax rate for this product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg mb-4">
                <Boxes className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Inventory Settings</h3>
              <p className="text-slate-600 dark:text-slate-400">Configure stock levels and tracking options</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="minStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Minimum Stock Level
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl shadow-sm"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
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
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-amber-500" />
                      Maximum Stock Level
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl shadow-sm"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
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
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-amber-500" />
                      Weight (kg)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.0"
                        min="0"
                        step="0.1"
                        className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl shadow-sm"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      For shipping calculations
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
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-amber-500" />
                      Dimensions
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="L x W x H (e.g., 10 x 5 x 3 cm)"
                        className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-xl shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
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
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <div className="space-y-1">
                      <FormLabel className="text-lg text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        Active Product
                      </FormLabel>
                      <FormDescription className="text-slate-600 dark:text-slate-400">
                        Enable this product for sales and inventory tracking
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-green-500" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSerialTracked"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <div className="space-y-1">
                      <FormLabel className="text-lg text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                        <Hash className="h-5 w-5 text-blue-500" />
                        Serial Number Tracking
                      </FormLabel>
                      <FormDescription className="text-slate-600 dark:text-slate-400">
                        Track individual serial numbers for this product
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-blue-500" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'media':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg mb-4">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Product Media</h3>
              <p className="text-slate-600 dark:text-slate-400">Upload high-quality images to showcase your product</p>
            </div>

            <div className="text-center space-y-6">
              <div className="mx-auto max-w-md">
                <ImageUploadButtonModernOriginal
                  title="Upload Product Image"
                  imageUrl={itemImageUrl}
                  setImageUrl={(url: string) => {
                    setItemImageUrl(url)
                    if (url && url !== DEFAULT_IMAGE_URL) {
                      success("Image Uploaded", "Product image has been successfully uploaded and will be used for your product listing")
                    }
                  }}
                  endpoint="itemImageUpload"
                />
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-700">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-6 w-6 text-pink-600 dark:text-pink-400 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-semibold text-pink-900 dark:text-pink-100 mb-2">Image Tips for Better Sales</h4>
                    <ul className="text-sm text-pink-800 dark:text-pink-200 space-y-1">
                      <li>• Use high-resolution images (1024x1024px or larger)</li>
                      <li>• Ensure good lighting and clear product visibility</li>
                      <li>• Show the product from multiple angles if possible</li>
                      <li>• Use a clean, neutral background</li>
                      <li>• JPG or PNG formats work best</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Items
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Create New Product
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Add a new product to your inventory with comprehensive details
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Step {currentStepIndex + 1} of {FORM_STEPS.length}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {Math.round(progressPercentage)}% Complete
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Step Navigation */}
            <div className="mt-6 grid grid-cols-5 gap-2">
              {FORM_STEPS.map((step, index) => {
                const isActive = step.id === currentStep
                const isCompleted = completedSteps.has(step.id)
                const isAccessible = index <= currentStepIndex || isCompleted

                return (
                  <button
                    key={step.id}
                    onClick={() => isAccessible && handleStepClick(step.id)}
                    disabled={!isAccessible}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${isActive
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                      : isCompleted
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20 hover:border-green-300'
                        : isAccessible
                          ? 'border-slate-200 bg-white dark:bg-slate-800 hover:border-slate-300 dark:border-slate-700'
                          : 'border-slate-100 bg-slate-50 dark:bg-slate-900 opacity-50 cursor-not-allowed dark:border-slate-800'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1 rounded-lg ${isActive
                        ? 'bg-violet-500 text-white'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                        {isCompleted ? <CheckCheck className="h-3 w-3" /> : <step.icon className="h-3 w-3" />}
                      </div>
                      <span className={`text-xs font-medium ${isActive ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                        {step.title}
                      </span>
                    </div>
                    <p className={`text-xs ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                      {step.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-3">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                      {getCurrentStepComponent()}

                      {/* Form Navigation */}
                      <div className="flex justify-between items-center pt-8 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          type="button"
                          onClick={handlePrevious}
                          disabled={currentStepIndex === 0}
                          variant="outline"
                          className="px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>

                        {currentStepIndex === FORM_STEPS.length - 1 ? (
                          <Button
                            type="submit"
                            disabled={form.formState.isSubmitting || isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                          >
                            {form.formState.isSubmitting || isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Product...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Create Product
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                          >
                            Next Step
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-slate-50 to-violet-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    Live Preview
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    See how your product will look
                  </CardDescription>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Product Image and Name */}
                  <div className="text-center space-y-4">
                    <div className="relative mx-auto w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-xl">
                      <img
                        src={itemImageUrl || DEFAULT_IMAGE_URL}
                        alt={name || "Product preview"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">
                        {name || "New Product"}
                      </h3>
                      {sku && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg inline-block">
                          SKU: {sku}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={`px-3 py-1 ${isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                      {isActive ? "Active Product" : "Inactive Product"}
                    </Badge>
                  </div>

                  {/* Pricing Preview */}
                  {(costPrice > 0 || sellingPrice > 0) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Pricing Overview
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Cost Price</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(costPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Selling Price</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(sellingPrice)}
                          </span>
                        </div>
                        {Number(profitMargin) !== 0 && (
                          <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/20">
                            <span className="text-sm text-emerald-600 dark:text-emerald-400">Profit Margin</span>
                            <span className={`font-semibold ${Number(profitMargin) > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                              }`}>
                              {profitMargin}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Summary */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Completion</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
                      Complete all steps to create your product
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