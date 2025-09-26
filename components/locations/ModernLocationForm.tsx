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
import { generateSimpleSKU } from "@/lib/generateSKU"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Activity,
  ArrowLeft,
  Building,
  CheckCheck,
  CheckCircle,
  ChevronRight,
  Copy,
  Eye,
  Hash,
  Lightbulb,
  Loader2,
  MapPin,
  Mail,
  Phone,
  Save,
  Sparkles,
  Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNotifications } from "../notifications/NotificationProvider"

// Enhanced validation schema for locations
const locationCreationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(100, "Name must be less than 100 characters").trim(),
  code: z.string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be less than 20 characters")
    .regex(/^[A-Z0-9-_]+$/, "Code can only contain uppercase letters, numbers, hyphens, and underscores"),
  type: z.enum(["WAREHOUSE", "STORE", "DISTRIBUTION_CENTER", "OFFICE"], {
    required_error: "Please select a location type"
  }),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
})

export type LocationCreationFormData = z.infer<typeof locationCreationSchema>

interface ModernLocationFormProps {
  action?: (formData: FormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  organizationId: string
}

const FORM_STEPS = [
  { id: 'basic', title: 'Basic Info', icon: MapPin, description: 'Location name and code' },
  { id: 'details', title: 'Details', icon: Building, description: 'Type and contact information' },
  { id: 'contact', title: 'Contact', icon: Phone, description: 'Address and communication' },
] as const

type FormStep = typeof FORM_STEPS[number]['id']

export function ModernLocationForm({
  action,
  isLoading = false,
  onCancel,
  organizationId
}: ModernLocationFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set())
  const { success, error, warning, info, operationStart, operationComplete } = useNotifications()

  // Welcome notification when component mounts
  useEffect(() => {
    info("Get Started", "Complete each step to create your new location. Start with the basic information!")
  }, [info])

  const form = useForm<LocationCreationFormData>({
    resolver: zodResolver(locationCreationSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "WAREHOUSE",
      address: "",
      phone: "",
      email: "",
      isActive: true,
    },
    mode: "onChange"
  })

  const currentStepIndex = FORM_STEPS.findIndex(step => step.id === currentStep)
  const progressPercentage = ((currentStepIndex + 1) / FORM_STEPS.length) * 100

  // Watch form values for real-time feedback
  const watchedValues = form.watch()
  const { name, code, type, isActive } = watchedValues

  // Form validation by step
  const validateStep = async (step: FormStep): Promise<boolean> => {
    const operationId = operationStart(`Validating ${FORM_STEPS.find(s => s.id === step)?.title}`)

    const fieldsByStep: Record<FormStep, (keyof LocationCreationFormData)[]> = {
      basic: ['name', 'code'],
      details: ['type'],
      contact: ['address', 'phone', 'email']
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

  const handleSubmit = async (data: LocationCreationFormData) => {
    const operationId = operationStart("Creating Location")

    try {
      info("Processing Location", "Validating location information and saving...")

      if (action) {
        // Server action approach
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })
        await action(formData)
      }

      operationComplete("Location Created", `${data.name} has been successfully created with code: ${data.code}`)
    } catch (error) {
      console.log("Failed to create location:", error)
      operationComplete("Creation Failed", "Failed to create location. Please check your information and try again.")
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  // Generate code functionality
  const generateCode = useCallback(() => {
    const newCode = generateSimpleSKU(6, "LOC")
    form.setValue("code", newCode, { shouldValidate: true })
    success("Code Generated", `New location code created: ${newCode}`)
  }, [form, success])

  // Auto-generate code when name changes
  useEffect(() => {
    if (name && !code) {
      const autoCode = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6)
      form.setValue("code", autoCode, { shouldValidate: true })
      info("Auto-Generated Code", `Code automatically created from location name: ${autoCode}`)
    }
  }, [name, code, form, info])

  // Copy code to clipboard
  const copyCode = useCallback(async () => {
    const currentCode = form.getValues("code")
    if (currentCode) {
      try {
        await navigator.clipboard.writeText(currentCode)
        success("Copied to Clipboard", `Code "${currentCode}" has been copied to your clipboard`)
      } catch (err) {
        error("Copy Failed", "Failed to copy code to clipboard. Please try selecting and copying manually.")
      }
    }
  }, [form, success, error])

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Basic Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Let's start with the essential details about your location</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      Location Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter location name (e.g., Main Warehouse, Downtown Store)"
                        className="h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      This will be the main name for your location
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
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-500" />
                      Location Code *
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="relative">
                          <Input
                            placeholder="AUTO-GENERATED"
                            className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm font-mono text-center font-bold tracking-wider"
                            {...field}
                            value={field.value || ""}
                          />
                          {field.value && (
                            <Button
                              type="button"
                              onClick={copyCode}
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
                            onClick={generateCode}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Generate New Code
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Unique identifier for this location
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
                      <p className="font-medium text-blue-900 dark:text-blue-100">Great! Your location name looks good</p>
                      <p className="text-sm text-blue-700 dark:text-blue-200">Code will be auto-generated based on this name</p>
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
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Location Details</h3>
              <p className="text-slate-600 dark:text-slate-400">Specify the type and purpose of this location</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-500" />
                      Location Type *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-sm">
                          <SelectValue placeholder="Select location type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WAREHOUSE">📦 Warehouse</SelectItem>
                        <SelectItem value="STORE">🏪 Store</SelectItem>
                        <SelectItem value="DISTRIBUTION_CENTER">🚚 Distribution Center</SelectItem>
                        <SelectItem value="OFFICE">🏢 Office</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Choose the type that best describes this location
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <div className="space-y-1">
                      <FormLabel className="text-lg text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        Active Location
                      </FormLabel>
                      <FormDescription className="text-slate-600 dark:text-slate-400">
                        Enable this location for inventory operations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-green-500" />
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
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Contact Information</h3>
              <p className="text-slate-600 dark:text-slate-400">Add address and communication details</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the full address of this location..."
                        className="min-h-[100px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Complete address for shipping and directions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-500" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
                          className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                        Main contact number for this location
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
                      <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-emerald-500" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="location@company.com"
                          className="h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                        Email for location-specific communications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                Back to Locations
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Create New Location
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Add a new location to your organization
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
            <div className="mt-6 grid grid-cols-3 gap-2">
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
                                Creating Location...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Create Location
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
                    See how your location will look
                  </CardDescription>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Location Preview */}
                  <div className="text-center space-y-4">
                    <div className="relative mx-auto w-20 h-20 rounded-2xl overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <MapPin className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">
                        {name || "New Location"}
                      </h3>
                      {code && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg inline-block">
                          {code}
                        </p>
                      )}
                      {type && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
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
                      {isActive ? "Active Location" : "Inactive Location"}
                    </Badge>
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
                      Complete all steps to create your location
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