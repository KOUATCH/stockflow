"use client"

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
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  Building2,
  Calculator,
  CheckCircle,
  ChevronRight,
  Contact,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  Hash,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  User,
  Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNotifications } from "../notifications/NotificationProvider"

// Enhanced validation schema for suppliers
const supplierCreationSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(100, "Name must be less than 100 characters").trim(),
  code: z.string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be less than 20 characters")
    .regex(/^[A-Z0-9-_]+$/, "Code can only contain uppercase letters, numbers, hyphens, and underscores")
    .optional()
    .or(z.literal("")),
  contactPerson: z.string().max(100, "Contact person name must be less than 100 characters").optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number must be less than 20 characters").optional().or(z.literal("")),
  address: z.string().max(200, "Address must be less than 200 characters").optional().or(z.literal("")),
  city: z.string().max(100, "City must be less than 100 characters").optional().or(z.literal("")),
  state: z.string().max(100, "State must be less than 100 characters").optional().or(z.literal("")),
  zipCode: z.string().max(20, "Zip code must be less than 20 characters").optional().or(z.literal("")),
  country: z.string().max(100, "Country must be less than 100 characters").optional().or(z.literal("")),
  taxId: z.string().max(50, "Tax ID must be less than 50 characters").optional().or(z.literal("")),
  paymentTerms: z.number().min(0, "Payment terms must be positive").max(365, "Payment terms cannot exceed 365 days").optional(),
  creditLimit: z.number().min(0, "Credit limit must be positive").max(10000000, "Credit limit seems too high").optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  organizationId: z.string().min(1, "Organization ID is required"),
})

export type SupplierCreationFormData = z.infer<typeof supplierCreationSchema>

interface ModernCreateSupplierFormProps {
  onSubmit?: (data: SupplierCreationFormData) => Promise<void>
  action?: (formData: FormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  organizationId: string
  // Edit mode props
  initialData?: Partial<SupplierCreationFormData>
  isEditMode?: boolean
  supplierId?: string
}

const FORM_STEPS = [
  { id: 'basic', title: 'Basic Info', icon: Building2, description: 'Company name and identifier' },
  { id: 'contact', title: 'Contact', icon: Contact, description: 'Contact person and details' },
  { id: 'address', title: 'Address', icon: MapPin, description: 'Physical location details' },
  { id: 'business', title: 'Business', icon: Calculator, description: 'Payment terms and credit' },
  { id: 'notes', title: 'Additional', icon: FileText, description: 'Notes and preferences' },
] as const

type FormStep = typeof FORM_STEPS[number]['id']

// Common countries for quick selection
const COMMON_COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
  'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico'
]

// Common payment terms
const COMMON_PAYMENT_TERMS = [
  { value: 15, label: '15 days (Net 15)' },
  { value: 30, label: '30 days (Net 30)' },
  { value: 45, label: '45 days (Net 45)' },
  { value: 60, label: '60 days (Net 60)' },
  { value: 90, label: '90 days (Net 90)' },
]

export function ModernCreateSupplierForm({
  onSubmit,
  action,
  isLoading = false,
  onCancel,
  organizationId,
  initialData,
  isEditMode = false,
  supplierId
}: ModernCreateSupplierFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set())
  const { success, error, warning, info, operationStart, operationComplete } = useNotifications()

  // Welcome notification when component mounts (only for create mode)
  useEffect(() => {
    if (!isEditMode) {
      info("Create Supplier", "Complete each step to add a new supplier to your system. Start with the basic information!")
    }
  }, [info, isEditMode])

  const form = useForm<SupplierCreationFormData>({
    resolver: zodResolver(supplierCreationSchema),
    defaultValues: initialData ? {
      name: initialData.name || "",
      code: initialData.code || "",
      contactPerson: initialData.contactPerson || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      address: initialData.address || "",
      city: initialData.city || "",
      state: initialData.state || "",
      zipCode: initialData.zipCode || "",
      country: initialData.country || "",
      taxId: initialData.taxId || "",
      paymentTerms: initialData.paymentTerms || 30,
      creditLimit: initialData.creditLimit || 0,
      notes: initialData.notes || "",
      isActive: initialData.isActive ?? true,
      organizationId: initialData.organizationId || organizationId,
    } : {
      name: "",
      code: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      taxId: "",
      paymentTerms: 30,
      creditLimit: 0,
      notes: "",
      isActive: true,
      organizationId,
    },
    mode: "onChange"
  })

  const currentStepIndex = FORM_STEPS.findIndex(step => step.id === currentStep)
  const progressPercentage = ((currentStepIndex + 1) / FORM_STEPS.length) * 100

  // Watch form values for auto-generating code
  const watchName = form.watch('name')

  // Auto-generate supplier code from name
  const generateSupplierCode = useCallback(() => {
    if (!watchName) return

    const code = watchName
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.substring(0, 4))
      .join('')
      .substring(0, 10)

    if (code && !form.getValues('code')) {
      form.setValue('code', code)
      info("Auto-generated", `Supplier code: ${code}`)
    }
  }, [watchName, form, info])

  // Validation for each step
  const validateStep = async (step: FormStep) => {
    const values = form.getValues()
    let isValid = true

    switch (step) {
      case 'basic':
        isValid = !!values.name && values.name.trim().length > 0
        break
      case 'contact':
        // Contact step is optional but validate email format if provided
        if (values.email && values.email.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          isValid = emailRegex.test(values.email)
        }
        break
      case 'address':
        // Address is optional
        isValid = true
        break
      case 'business':
        // Business terms are optional with defaults
        isValid = true
        break
      case 'notes':
        // Notes are optional
        isValid = true
        break
    }

    if (isValid) {
      setCompletedSteps(prev => new Set([...prev, step]))
    }

    return isValid
  }

  const nextStep = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStepIndex < FORM_STEPS.length - 1) {
      setCurrentStep(FORM_STEPS[currentStepIndex + 1].id)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(FORM_STEPS[currentStepIndex - 1].id)
    }
  }

  const goToStep = (stepId: FormStep) => {
    setCurrentStep(stepId)
  }

  // Handle form submission
  const handleSubmit = async (data: SupplierCreationFormData) => {
    try {
      operationStart(isEditMode ? "Updating supplier..." : "Creating supplier...")

      if (action) {
        // Convert to FormData for server action
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            formData.append(key, typeof value === 'boolean' ? value.toString() : value.toString())
          }
        })

        if (isEditMode && supplierId) {
          formData.append('id', supplierId)
        }

        await action(formData)
        operationComplete(isEditMode ? "Supplier updated successfully!" : "Supplier created successfully!")
      } else if (onSubmit) {
        await onSubmit(data)
        operationComplete(isEditMode ? "Supplier updated successfully!" : "Supplier created successfully!")
      }

      // Navigate back to suppliers list
      router.push('/dashboard/purchases/suppliers')
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      operationComplete("Supplier Operation Failed", message)
      error("Operation Failed", message)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/dashboard/purchases/suppliers')
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Basic Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Start by entering the supplier's basic details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Supplier Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Acme Corporation"
                        {...field}
                        onBlur={() => {
                          field.onBlur()
                          generateSupplierCode()
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      The official name of the supplier company
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Supplier Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. ACME"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for quick reference
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <FormLabel className="flex items-center gap-2 font-medium">
                        <Settings className="w-4 h-4" />
                        Active Status
                      </FormLabel>
                      <FormDescription className="mt-1">
                        Whether this supplier is currently active
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Contact className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Contact Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Add contact details for communication</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Contact Person
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. John Smith"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Primary contact person at the supplier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g. john@supplier.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Email for communication and orders
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. +1 (555) 123-4567"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Primary phone number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'address':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Address Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Physical location and shipping details</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Street Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 123 Business Street"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Street address and building number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. New York"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. NY"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip/Postal Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 10001"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Country
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMMON_COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calculator className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Business Terms</h3>
              <p className="text-slate-600 dark:text-slate-400">Payment terms and financial details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Tax ID / VAT Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 12-3456789"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tax identification number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Payment Terms (Days)
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMON_PAYMENT_TERMS.map((term) => (
                          <SelectItem key={term.value} value={term.value.toString()}>
                            {term.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Standard payment terms for invoices
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Credit Limit
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum credit amount for this supplier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )

      case 'notes':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Additional Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Notes and special requirements</p>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes & Comments
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any special notes, requirements, or important information about this supplier..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Special requirements, delivery instructions, or other important notes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600">
              <CardContent className="p-6">
                <CardTitle className="text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Summary
                </CardTitle>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Name:</span>
                    <p className="text-slate-900 dark:text-white">{form.watch('name') || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Code:</span>
                    <p className="text-slate-900 dark:text-white">{form.watch('code') || 'Auto-generated'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Contact:</span>
                    <p className="text-slate-900 dark:text-white">{form.watch('contactPerson') || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">Payment Terms:</span>
                    <p className="text-slate-900 dark:text-white">{form.watch('paymentTerms') || 30} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  {isEditMode ? 'Edit Supplier' : 'Create New Supplier'}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {isEditMode ? 'Update supplier information' : 'Add a new supplier to your system'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Step {currentStepIndex + 1} of {FORM_STEPS.length}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="grid grid-cols-5 gap-2 mb-8">
            {FORM_STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = completedSteps.has(step.id)
              const isCurrent = currentStep === step.id
              const isAccessible = index <= currentStepIndex || isCompleted

              return (
                <button
                  key={step.id}
                  onClick={() => isAccessible && goToStep(step.id)}
                  disabled={!isAccessible}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                      : isCompleted
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      : isAccessible
                      ? 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                      : 'bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className={`p-1 rounded ${
                      isCurrent
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-slate-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-medium ${
                      isCurrent
                        ? 'text-blue-900 dark:text-blue-100'
                        : isCompleted
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Form Content */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200 dark:border-slate-700 mb-8">
                <CardContent className="p-6 sm:p-8">
                  {renderStepContent()}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex gap-3">
                  {currentStepIndex === FORM_STEPS.length - 1 ? (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isEditMode ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {isEditMode ? 'Update Supplier' : 'Create Supplier'}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </TooltipProvider>
  )
}
