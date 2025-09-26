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
  ArrowLeft,
  Building,
  CheckCheck,
  CheckCircle,
  ChevronRight,
  Copy,
  Eye,
  FolderOpen,
  Hash,
  ImageIcon,
  Lightbulb,
  Loader2,
  Package,
  Palette,
  Save,
  Sparkles,
  Tag,
  Tags,
  TrendingUp,
  Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNotifications } from "../notifications/NotificationProvider"

// Enhanced validation schema for categories with comprehensive fields
const categoryCreationSchema = z.object({
  title: z.string().min(1, "Category title is required").max(100, "Title must be less than 100 characters").trim(),
  description: z.string().optional(),
  slug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  parentCategoryId: z.string().optional(),
  sortOrder: z.number().min(0, "Sort order must be positive").default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(60, "Meta title should be under 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description should be under 160 characters").optional(),
  keywords: z.string().optional(),
  thumbnail: z.string().optional(),
  bannerImage: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex code").optional(),
  icon: z.string().optional(),
})

export type CategoryCreationFormData = z.infer<typeof categoryCreationSchema>

interface ModernCategoryFormProps {
  action?: (formData: FormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  organizationId: string
  categories?: Array<{ id: string; title: string; level?: number }>
  mode?: 'create' | 'edit'
  editData?: Partial<CategoryCreationFormData>
}

const DEFAULT_THUMBNAIL_URL = "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd"
const DEFAULT_BANNER_URL = "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd"

const FORM_STEPS = [
  { id: 'basic', title: 'Basic Info', icon: FolderOpen, description: 'Category name and description' },
  { id: 'hierarchy', title: 'Organization', icon: Building, description: 'Parent category and structure' },
  { id: 'seo', title: 'SEO & Meta', icon: Tag, description: 'Search optimization settings' },
  { id: 'visual', title: 'Visual Design', icon: Palette, description: 'Images, colors, and icons' },
  { id: 'settings', title: 'Advanced', icon: Tags, description: 'Status and configuration' },
] as const

type FormStep = typeof FORM_STEPS[number]['id']

// Common category suggestions
const CATEGORY_SUGGESTIONS = [
  { title: "Electronics", description: "Electronic devices and gadgets", color: "#3B82F6", icon: "⚡" },
  { title: "Clothing", description: "Apparel and fashion items", color: "#EC4899", icon: "👕" },
  { title: "Books", description: "Books, magazines, and literature", color: "#10B981", icon: "📚" },
  { title: "Home & Garden", description: "Home improvement and gardening", color: "#F59E0B", icon: "🏠" },
  { title: "Sports & Outdoors", description: "Sports equipment and outdoor gear", color: "#EF4444", icon: "⚽" },
  { title: "Beauty & Personal Care", description: "Cosmetics and personal care items", color: "#A855F7", icon: "💄" },
  { title: "Automotive", description: "Car parts and automotive accessories", color: "#6B7280", icon: "🚗" },
  { title: "Food & Beverages", description: "Food items and drinks", color: "#F97316", icon: "🍎" },
]

export function ModernCategoryForm({
  action,
  isLoading = false,
  onCancel,
  organizationId,
  categories = [],
  mode = 'create',
  editData
}: ModernCategoryFormProps) {
  const router = useRouter()
  const [thumbnailUrl, setThumbnailUrl] = useState(DEFAULT_THUMBNAIL_URL)
  const [bannerUrl, setBannerUrl] = useState(DEFAULT_BANNER_URL)
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set())
  const { success, error, warning, info, operationStart, operationComplete } = useNotifications()

  // Welcome notification when component mounts
  useEffect(() => {
    if (mode === 'create') {
      info("Create Category", "Complete each step to create a comprehensive category. Start with the basic information!")
    } else {
      info("Edit Category", "Update your category information across different sections. Navigate using the tabs above.")
    }
  }, [info, mode])

  const form = useForm<CategoryCreationFormData>({
    resolver: zodResolver(categoryCreationSchema),
    defaultValues: {
      title: editData?.title || "",
      description: editData?.description || "",
      slug: editData?.slug || "",
      parentCategoryId: editData?.parentCategoryId || "",
      sortOrder: editData?.sortOrder || 0,
      isActive: editData?.isActive ?? true,
      isFeatured: editData?.isFeatured ?? false,
      metaTitle: editData?.metaTitle || "",
      metaDescription: editData?.metaDescription || "",
      keywords: editData?.keywords || "",
      thumbnail: editData?.thumbnail || "",
      bannerImage: editData?.bannerImage || "",
      color: editData?.color || "#3B82F6",
      icon: editData?.icon || "📁",
    },
    mode: "onChange"
  })

  const currentStepIndex = FORM_STEPS.findIndex(step => step.id === currentStep)
  const progressPercentage = ((currentStepIndex + 1) / FORM_STEPS.length) * 100

  // Watch form values for real-time feedback
  const watchedValues = form.watch()
  const { title, description, slug, color, isActive, isFeatured } = watchedValues

  // Form validation by step
  const validateStep = async (step: FormStep): Promise<boolean> => {
    const operationId = operationStart(`Validating ${FORM_STEPS.find(s => s.id === step)?.title}`)

    const fieldsByStep: Record<FormStep, (keyof CategoryCreationFormData)[]> = {
      basic: ['title', 'description'],
      hierarchy: ['slug', 'parentCategoryId', 'sortOrder'],
      seo: ['metaTitle', 'metaDescription', 'keywords'],
      visual: ['thumbnail', 'bannerImage', 'color', 'icon'],
      settings: ['isActive', 'isFeatured']
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

  const handleSubmit = async (data: CategoryCreationFormData) => {
    const operationId = operationStart(mode === 'create' ? "Creating Category" : "Updating Category")

    try {
      info("Processing Category", mode === 'create' ? "Creating your new category..." : "Updating category information...")

      const submitData = {
        ...data,
        thumbnail: thumbnailUrl || DEFAULT_THUMBNAIL_URL,
        bannerImage: bannerUrl || DEFAULT_BANNER_URL,
      }

      if (action) {
        // Server action approach
        const formData = new FormData()
        Object.entries(submitData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })
        await action(formData)
      }

      operationComplete(
        mode === 'create' ? "Category Created" : "Category Updated",
        `${data.title} has been successfully ${mode === 'create' ? 'added to' : 'updated in'} your categories!`
      )
    } catch (error) {
      console.log(`Failed to ${mode} category:`, error)
      operationComplete(
        mode === 'create' ? "Creation Failed" : "Update Failed",
        `Failed to ${mode} category. Please check your information and try again.`
      )
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  // Generate slug functionality
  const generateSlug = useCallback(() => {
    const newSlug = title
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : generateSimpleSKU(6, "cat").toLowerCase()
    form.setValue("slug", newSlug, { shouldValidate: true })
    success("Slug Generated", `Category slug created: ${newSlug}`)
  }, [form, title, success])

  // Auto-generate slug when title changes
  useEffect(() => {
    if (title && !slug) {
      const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      form.setValue("slug", autoSlug, { shouldValidate: true })
      info("Auto-Generated Slug", `Slug automatically created from category title: ${autoSlug}`)
    }
  }, [title, slug, form, info])

  // Copy slug to clipboard
  const copySlug = useCallback(async () => {
    const currentSlug = form.getValues("slug")
    if (currentSlug) {
      try {
        await navigator.clipboard.writeText(currentSlug)
        success("Copied to Clipboard", `Slug "${currentSlug}" has been copied to your clipboard`)
      } catch (err) {
        error("Copy Failed", "Failed to copy slug to clipboard. Please try selecting and copying manually.")
      }
    }
  }, [form, success, error])

  // Handle category suggestion selection
  const handleCategorySuggestion = (suggestion: typeof CATEGORY_SUGGESTIONS[0]) => {
    form.setValue("title", suggestion.title, { shouldValidate: true })
    form.setValue("description", suggestion.description, { shouldValidate: true })
    form.setValue("color", suggestion.color, { shouldValidate: true })
    form.setValue("icon", suggestion.icon, { shouldValidate: true })
    const autoSlug = suggestion.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    form.setValue("slug", autoSlug, { shouldValidate: true })
    success("Category Template Applied", `Applied ${suggestion.title} template to the form`)
  }

  // Calculate completion percentage based on completed steps
  const completionPercentage = (completedSteps.size / FORM_STEPS.length) * 100

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Basic Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Start with the essential details about your category</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      Category Title *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter category title (e.g., Electronics, Clothing, Books)"
                        className="h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      This will be the main name for your category
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
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300">
                      Category Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what types of products belong in this category..."
                        className="min-h-[120px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Helps customers understand what products they'll find here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Suggestions */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Popular Categories</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Click on any category below to automatically fill the form:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORY_SUGGESTIONS.map((suggestion, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCategorySuggestion(suggestion)}
                      className="flex flex-col h-auto p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-400 rounded-xl"
                    >
                      <span className="text-2xl mb-2">{suggestion.icon}</span>
                      <span className="font-medium text-slate-900 dark:text-white text-xs text-center">{suggestion.title}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {title && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-medium text-emerald-900 dark:text-emerald-100">Great! Your category title looks good</p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-200">URL slug will be auto-generated based on this title</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'hierarchy':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Category Organization</h3>
              <p className="text-slate-600 dark:text-slate-400">Configure the structure and hierarchy</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-500" />
                      URL Slug *
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="relative">
                          <Input
                            placeholder="auto-generated-slug"
                            className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm font-mono text-center"
                            {...field}
                            value={field.value || ""}
                          />
                          {field.value && (
                            <Button
                              type="button"
                              onClick={copySlug}
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
                            onClick={generateSlug}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Generate New Slug
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Used in URLs and navigation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="parentCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        Parent Category
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm">
                            <SelectValue placeholder="Select parent category (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No Parent (Top Level)</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {'  '.repeat((category.level || 0) * 2)}{category.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                        Choose a parent to create a subcategory
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Sort Order
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                        Lower numbers appear first in lists
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        )

      case 'seo':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg mb-4">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">SEO & Meta Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Optimize for search engines and social media</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Tags className="h-4 w-4 text-purple-500" />
                      Meta Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SEO-optimized page title (recommended: 50-60 characters)"
                        className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-sm"
                        {...field}
                        maxLength={60}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Appears in search results and browser tabs ({field.value?.length || 0}/60)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300">
                      Meta Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description for search engine results (recommended: 150-160 characters)"
                        className="min-h-[100px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-sm resize-none"
                        {...field}
                        maxLength={160}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Shown in search results below the title ({field.value?.length || 0}/160)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300">
                      Keywords
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Comma-separated keywords (e.g., electronics, gadgets, technology)"
                        className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Help search engines understand your category content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'visual':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Visual Design</h3>
              <p className="text-slate-600 dark:text-slate-400">Customize the appearance and branding</p>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <label className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-pink-500" />
                    Category Thumbnail
                  </label>
                  <ImageUploadButtonModernOriginal
                    title="Upload Thumbnail"
                    imageUrl={thumbnailUrl}
                    setImageUrl={(url: string) => {
                      setThumbnailUrl(url)
                      form.setValue("thumbnail", url)
                      if (url && url !== DEFAULT_THUMBNAIL_URL) {
                        success("Thumbnail Uploaded", "Category thumbnail has been successfully uploaded")
                      }
                    }}
                    endpoint="itemImageUpload"
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Small square image for category cards (recommended: 200x200px)
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-pink-500" />
                    Banner Image
                  </label>
                  <ImageUploadButtonModernOriginal
                    title="Upload Banner"
                    imageUrl={bannerUrl}
                    setImageUrl={(url: string) => {
                      setBannerUrl(url)
                      form.setValue("bannerImage", url)
                      if (url && url !== DEFAULT_BANNER_URL) {
                        success("Banner Uploaded", "Category banner has been successfully uploaded")
                      }
                    }}
                    endpoint="itemImageUpload"
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Wide banner for category pages (recommended: 1200x400px)
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Palette className="h-4 w-4 text-pink-500" />
                        Brand Color
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          <Input
                            type="color"
                            className="h-12 w-20 p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 dark:focus:border-pink-400 rounded-xl shadow-sm"
                            {...field}
                          />
                          <Input
                            placeholder="#3B82F6"
                            className="h-12 flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 dark:focus:border-pink-400 rounded-xl shadow-sm font-mono"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                        Primary color for this category's branding
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300">
                        Category Icon
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="📁 (emoji or text)"
                          className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 dark:focus:border-pink-400 rounded-xl shadow-sm text-center text-lg"
                          {...field}
                          maxLength={10}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                        Emoji or short text to represent this category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-700">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-6 w-6 text-pink-600 dark:text-pink-400 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-semibold text-pink-900 dark:text-pink-100 mb-2">Visual Design Tips</h4>
                    <ul className="text-sm text-pink-800 dark:text-pink-200 space-y-1">
                      <li>• Use consistent colors that match your brand</li>
                      <li>• Choose high-contrast icons for better visibility</li>
                      <li>• Optimize images for web (JPG/PNG, under 1MB)</li>
                      <li>• Test how your category looks on mobile devices</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg mb-4">
                <Tags className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Advanced Settings</h3>
              <p className="text-slate-600 dark:text-slate-400">Configure visibility and special features</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <div className="space-y-1">
                      <FormLabel className="text-lg text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Active Category
                      </FormLabel>
                      <FormDescription className="text-slate-600 dark:text-slate-400">
                        Make this category visible to customers and in navigation
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
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <div className="space-y-1">
                      <FormLabel className="text-lg text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-amber-500" />
                        Featured Category
                      </FormLabel>
                      <FormDescription className="text-slate-600 dark:text-slate-400">
                        Highlight this category on the homepage and in special sections
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-amber-500" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Category Preview */}
            {(title || description) && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Category Preview</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-600 dark:text-amber-400">Title:</span>
                    <span className="font-medium text-amber-900 dark:text-amber-100">{title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-600 dark:text-amber-400">URL:</span>
                    <span className="font-mono text-sm text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                      /categories/{slug || "auto-generated"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-600 dark:text-amber-400">Status:</span>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700">
                          Active
                        </Badge>
                      )}
                      {isFeatured && (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700">
                          Featured
                        </Badge>
                      )}
                      {!isActive && !isFeatured && (
                        <Badge variant="secondary">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  {description && (
                    <div className="pt-2 border-t border-amber-200 dark:border-amber-700">
                      <span className="text-sm text-amber-600 dark:text-amber-400">Description:</span>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">{description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                Back to Categories
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  {mode === 'create' ? 'Create New Category' : 'Edit Category'}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {mode === 'create' ? 'Add a comprehensive category to organize your products' : 'Update your category information and settings'}
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
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500 ease-out"
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
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : isCompleted
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20 hover:border-green-300'
                        : isAccessible
                        ? 'border-slate-200 bg-white dark:bg-slate-800 hover:border-slate-300 dark:border-slate-700'
                        : 'border-slate-100 bg-slate-50 dark:bg-slate-900 opacity-50 cursor-not-allowed dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`p-1 rounded-lg ${
                          isActive
                            ? 'bg-emerald-500 text-white'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {isCompleted ? <CheckCheck className="h-3 w-3" /> : <step.icon className="h-3 w-3" />}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    <p
                      className={`text-xs ${
                        isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
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
                            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                          >
                            {form.formState.isSubmitting || isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {mode === 'create' ? 'Creating Category...' : 'Updating Category...'}
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                {mode === 'create' ? 'Create Category' : 'Update Category'}
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
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

            {/* Enhanced Preview Panel */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-slate-50 to-emerald-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Live Preview
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    See how your category will look
                  </CardDescription>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Category Preview */}
                  <div className="text-center space-y-4">
                    <div className="relative mx-auto w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-center"
                         style={{ backgroundColor: color || '#3B82F6' }}>
                      {thumbnailUrl && thumbnailUrl !== DEFAULT_THUMBNAIL_URL ? (
                        <img
                          src={thumbnailUrl}
                          alt={title || "Category preview"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">{form.watch('icon') || '📁'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">
                        {title || "New Category"}
                      </h3>
                      {slug && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg inline-block">
                          /categories/{slug}
                        </p>
                      )}
                      {description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                    {isFeatured && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700">
                        Featured
                      </Badge>
                    )}
                  </div>

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
                      Complete all steps to {mode === 'create' ? 'create' : 'update'} your category
                    </p>
                  </div>

                  {/* SEO Preview */}
                  {(form.watch('metaTitle') || form.watch('metaDescription')) && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">SEO Preview:</h4>
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">/categories/{slug || 'category-slug'}</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                          {form.watch('metaTitle') || title || 'Category Title'}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                          {form.watch('metaDescription') || description || 'Category description will appear here in search results.'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Category Benefits */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Category Benefits:</h4>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Organize products effectively</li>
                      <li>• Improve customer navigation</li>
                      <li>• Enable better SEO and discoverability</li>
                      <li>• Support advanced filtering and reporting</li>
                      <li>• Create engaging visual experiences</li>
                    </ul>
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