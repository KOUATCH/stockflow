"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
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
  Building,
  Calendar,
  CheckCheck,
  CheckCircle,
  ChevronRight,
  Copy,
  CreditCard,
  DollarSign,
  Eye,
  Hash,
  Loader2,
  Mail,
  Phone,
  Save,
  Shield,
  Sparkles,
  User,
  UserCheck,
  Users,
  Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNotifications } from "../notifications/NotificationProvider"
import { createEmployee, updateEmployee } from '@/actions/payroll/payrollManagement'

// Enhanced validation schema for employees
const employeeCreationSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters").trim(),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters").trim(),
  email: z.string().email("Please enter a valid email address").trim(),
  phone: z.string().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  hireDate: z.date({ required_error: "Hire date is required" }),
  baseSalary: z.number().min(0, "Base salary must be positive").max(1000000, "Salary seems too high"),
  payFrequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).default('MONTHLY'),
  currency: z.string().default('USD'),
  taxId: z.string().min(1, "Tax ID is required").refine((val) => {
    // Allow flexible format for existing data, but prefer standard format
    return /^\d{3}-\d{2}-\d{4}$/.test(val) || /^\*+/.test(val) || val.length >= 3
  }, "Tax ID must be in format 123-45-6789"),
  exemptions: z.number().min(0, "Exemptions must be positive").max(20, "Too many exemptions"),
  additionalWithholding: z.number().min(0, "Additional withholding must be positive"),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  accountType: z.enum(['CHECKING', 'SAVINGS']).optional(),
  isActive: z.boolean().default(true),
  organizationId: z.string().min(1, "Organization ID is required"),
}).refine((data) => {
  // If any bank info is provided, all bank fields should be provided
  const hasBankInfo = data.bankName || data.accountNumber || data.routingNumber
  if (hasBankInfo) {
    return data.bankName && data.accountNumber && data.routingNumber && data.accountType
  }
  return true
}, {
  message: "If providing bank information, all fields (bank name, account number, routing number, account type) are required",
  path: ["bankName"],
})

export type EmployeeCreationFormData = z.infer<typeof employeeCreationSchema>

interface ModernEmployeeFormProps {
  onSubmit?: (data: EmployeeCreationFormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  organizationId: string
  initialData?: Partial<EmployeeCreationFormData>
  isEditMode?: boolean
  employeeId?: string
}

const FORM_STEPS = [
  { id: 'personal', title: 'Personal Info', icon: User, description: 'Name and contact details' },
  { id: 'employment', title: 'Employment', icon: Building, description: 'Job title and department' },
  { id: 'compensation', title: 'Compensation', icon: DollarSign, description: 'Salary and benefits' },
  { id: 'tax', title: 'Tax Information', icon: Shield, description: 'Tax ID and withholdings' },
  { id: 'banking', title: 'Banking', icon: CreditCard, description: 'Direct deposit setup' },
] as const

type FormStep = typeof FORM_STEPS[number]['id']

// Mock departments and job titles - replace with actual data
const departments = [
  'Sales',
  'Marketing',
  'Operations',
  'IT',
  'HR',
  'Finance',
  'Customer Service',
  'Management'
]

const jobTitles = [
  'Sales Associate',
  'Senior Sales Associate',
  'Marketing Specialist',
  'Operations Manager',
  'IT Specialist',
  'HR Coordinator',
  'Financial Analyst',
  'Customer Service Rep',
  'Store Manager',
  'Assistant Manager'
]

export function ModernEmployeeForm({
  onSubmit,
  isLoading = false,
  onCancel,
  organizationId,
  initialData,
  isEditMode = false,
  employeeId
}: ModernEmployeeFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<FormStep>('personal')
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set())
  const { success, error, warning, info, operationStart, operationComplete } = useNotifications()

  // Welcome notification when component mounts (only for create mode)
  useEffect(() => {
    if (!isEditMode) {
      info("Get Started", "Complete each step to add your new employee. Start with personal information and work your way through!")
    }
  }, [info, isEditMode])

  // Initialize edit mode with completed steps
  useEffect(() => {
    if (isEditMode && initialData) {
      // Silently validate and mark completed steps without notifications
      const initializeEditMode = async () => {
        const completedStepsList: FormStep[] = []

        // Check each step silently
        for (const step of FORM_STEPS) {
          const isValid = await validateStep(step.id, true) // silent = true
          if (isValid) {
            completedStepsList.push(step.id)
          }
        }

        // Update completed steps without triggering notifications
        if (completedStepsList.length > 0) {
          setCompletedSteps(new Set(completedStepsList))
        }
      }

      // Small delay to ensure form is mounted
      const timeoutId = setTimeout(initializeEditMode, 50)
      return () => clearTimeout(timeoutId)
    }
  }, [isEditMode, initialData])

  const form = useForm<EmployeeCreationFormData>({
    resolver: zodResolver(employeeCreationSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      jobTitle: initialData.jobTitle || "",
      department: initialData.department || "",
      hireDate: initialData.hireDate ? new Date(initialData.hireDate) : undefined,
      baseSalary: initialData.baseSalary || 0,
      payFrequency: initialData.payFrequency || 'MONTHLY',
      currency: initialData.currency || 'USD',
      taxId: initialData.taxId || "",
      exemptions: initialData.exemptions || 0,
      additionalWithholding: initialData.additionalWithholding || 0,
      bankName: initialData.bankName || "",
      accountNumber: initialData.accountNumber || "",
      routingNumber: initialData.routingNumber || "",
      accountType: initialData.accountType || 'CHECKING',
      isActive: initialData.isActive ?? true,
      organizationId: initialData.organizationId || organizationId,
    } : {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      department: "",
      hireDate: new Date(),
      baseSalary: 0,
      payFrequency: 'MONTHLY',
      currency: 'USD',
      taxId: "",
      exemptions: 0,
      additionalWithholding: 0,
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: 'CHECKING',
      isActive: true,
      organizationId,
    },
    mode: "onChange"
  })

  const currentStepIndex = FORM_STEPS.findIndex(step => step.id === currentStep)
  const progressPercentage = ((currentStepIndex + 1) / FORM_STEPS.length) * 100

  // Watch form values for real-time calculations
  const watchedValues = form.watch()
  const { firstName, lastName, baseSalary, payFrequency, taxId, isActive } = watchedValues

  // Calculate yearly salary
  const yearlySalary = baseSalary ? (() => {
    switch (payFrequency) {
      case 'WEEKLY': return baseSalary * 52
      case 'BIWEEKLY': return baseSalary * 26
      case 'MONTHLY': return baseSalary * 12
      default: return baseSalary * 12
    }
  })() : 0

  // Form validation by step
  const validateStep = async (step: FormStep, silent = false): Promise<boolean> => {
    const operationId = !silent ? operationStart(`Validating ${FORM_STEPS.find(s => s.id === step)?.title}`) : null

    const fieldsByStep: Record<FormStep, (keyof EmployeeCreationFormData)[]> = {
      personal: ['firstName', 'lastName', 'email'],
      employment: ['jobTitle', 'department', 'hireDate'],
      compensation: ['baseSalary'],
      tax: ['taxId'],
      banking: [] // Optional fields
    }

    const fieldsToValidate = fieldsByStep[step]
    const result = fieldsToValidate.length === 0 ? true : await form.trigger(fieldsToValidate)

    if (result) {
      setCompletedSteps(prev => new Set(prev).add(step))
      if (!silent) {
        operationComplete("Step Validated", `${FORM_STEPS.find(s => s.id === step)?.title} section completed successfully`)
      }
    } else {
      if (!silent) {
        warning("Validation Required", `Please complete all required fields in the ${FORM_STEPS.find(s => s.id === step)?.title} section`)
      }
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

    if (!isEditMode && stepIndex > currentIndex) {
      const isValid = await validateStep(currentStep)
      if (!isValid) return
    }

    setCurrentStep(stepId)
    if (targetStep) {
      info("Step Navigation", `Switched to ${targetStep.title} section`)
    }
  }

  const handleSubmit = async (data: EmployeeCreationFormData) => {
    const operationId = operationStart(isEditMode ? "Updating Employee" : "Creating Employee")

    try {
      if (onSubmit) {
        await onSubmit(data)
      } else if (isEditMode && employeeId) {
        // Update existing employee
        const result = await updateEmployee({
          employeeId: employeeId,
          organizationId: data.organizationId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          jobTitle: data.jobTitle,
          department: data.department,
          hireDate: data.hireDate,
          baseSalary: data.baseSalary,
          payFrequency: data.payFrequency,
          taxId: data.taxId,
          bankInfo: data.bankName ? {
            bankName: data.bankName,
            accountNumber: data.accountNumber!,
            routingNumber: data.routingNumber!,
            accountType: data.accountType!
          } : undefined
        })

        if (result.success) {
          operationComplete("Employee Updated", `${data.firstName} ${data.lastName}'s information has been successfully updated!`)
          // Navigate back to employees list
          router.push('/dashboard/payroll/employees')
        } else {
          throw new Error(result.error || "Failed to update employee")
        }
      } else {
        // Create new employee
        const result = await createEmployee({
          organizationId: data.organizationId,
          employeeCode: `EMP${Date.now()}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          jobTitle: data.jobTitle,
          department: data.department,
          hireDate: data.hireDate,
          baseSalary: data.baseSalary,
          payFrequency: data.payFrequency,
          taxId: data.taxId,
          bankInfo: data.bankName ? {
            bankName: data.bankName,
            accountNumber: data.accountNumber!,
            routingNumber: data.routingNumber!,
            accountType: data.accountType!
          } : undefined
        })

        if (result.success) {
          operationComplete("Employee Created", `${data.firstName} ${data.lastName} has been successfully added to your team!`)
          // Navigate back to employees list
          router.push('/dashboard/payroll/employees')
        } else {
          throw new Error(result.error || "Failed to create employee")
        }
      }
    } catch (err) {
      console.error("Error submitting employee form:", err)
      error("Save Failed", err instanceof Error ? err.message : "Failed to save employee information. Please try again.")
    }
  }

  // Generate employee code preview
  const employeeCodePreview = firstName && lastName
    ? `EMP${firstName.substring(0, 2).toUpperCase()}${lastName.substring(0, 2).toUpperCase()}${Date.now().toString().slice(-4)}`
    : "EMP----"

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-lg shadow-emerald-500/25 mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Personal Information</h3>
              <p className="text-muted-foreground">Let's start with the employee's basic details</p>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        First Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter first name"
                          className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground">
                        Employee's legal first name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        Last Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter last name"
                          className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground">
                        Employee's legal last name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="employee@company.com"
                        className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      This will be used for payroll notifications and login
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
                    <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Optional - for emergency contact
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {firstName && lastName && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-medium text-emerald-900 dark:text-emerald-100">
                        Welcome {firstName} {lastName}!
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-200">
                        Employee code will be: {employeeCodePreview}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'employment':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-lg shadow-emerald-500/25 mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Employment Details</h3>
              <p className="text-muted-foreground">Define the employee's role and start date</p>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Building className="h-4 w-4 text-emerald-600" />
                        Department *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm text-muted-foreground">
                        Which department will they work in?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        Job Title *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm">
                            <SelectValue placeholder="Select job title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {jobTitles.map((title) => (
                            <SelectItem key={title} value={title}>{title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm text-muted-foreground">
                        What position will they hold?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      Hire Date *
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select hire date"
                        className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                        maxDate={new Date()} // Can't hire for future dates
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      When will they start working?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-semibold">Active Employee</FormLabel>
                      <FormDescription>
                        Set to active to include in payroll and reports
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

      case 'compensation':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-lg shadow-emerald-500/25 mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Compensation</h3>
              <p className="text-muted-foreground">Set salary and payment frequency</p>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="baseSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        Base Salary *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5000"
                          className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground">
                        Amount per pay period
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        Pay Frequency
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WEEKLY">Weekly</SelectItem>
                          <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm text-muted-foreground">
                        How often will they be paid?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {baseSalary > 0 && (
                <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Salary Summary</h4>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-200">Per Pay Period</p>
                        <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                          {formatCurrency(baseSalary)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-200">Yearly Total</p>
                        <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                          {formatCurrency(yearlySalary)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-200">Frequency</p>
                        <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                          {payFrequency}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'tax':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-lg shadow-emerald-500/25 mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Tax Information</h3>
              <p className="text-muted-foreground">Tax ID and withholding preferences</p>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4 text-emerald-600" />
                      Tax ID / SSN *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123-45-6789"
                        className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Format: 123-45-6789 (this information is encrypted)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="exemptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground">Tax Exemptions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground">
                        Number of tax exemptions claimed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalWithholding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground">Additional Withholding</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground">
                        Extra amount to withhold per pay period
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Security Notice</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      All tax information is encrypted and stored securely. This data is used only for payroll tax calculations and compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'banking':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-lg shadow-emerald-500/25 mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Banking Information</h3>
              <p className="text-muted-foreground">Direct deposit setup (optional)</p>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground">Bank Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bank of America"
                          className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground">
                        Name of the employee's bank
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground">Account Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CHECKING">Checking</SelectItem>
                          <SelectItem value="SAVINGS">Savings</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm text-muted-foreground">
                        Type of bank account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground">Routing Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="021000021"
                          className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground">
                        Bank's 9-digit routing number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-foreground">Account Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234567890"
                          className="h-12 text-lg bg-background border-2 border-border focus:border-emerald-500 rounded-xl shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground">
                        Employee's bank account number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">Direct Deposit Benefits</h4>
                    <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                      Banking information is optional but enables automatic direct deposit for faster, more convenient payments. All data is encrypted and secure.
                    </p>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 shadow-xl shadow-emerald-500/25">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    {isEditMode ? 'Update employee information' : 'Complete the steps below to add a new team member'}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <Card className="border-2 border-emerald-200/50 dark:border-emerald-800/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Step {currentStepIndex + 1} of {FORM_STEPS.length}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {Math.round(progressPercentage)}% Complete
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Step Navigation */}
              <Card className="border-2 border-emerald-200/50 dark:border-emerald-800/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-xl">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {FORM_STEPS.map((step, index) => {
                      const Icon = step.icon
                      const isActive = step.id === currentStep
                      const isCompleted = completedSteps.has(step.id)
                      const isClickable = isEditMode || index <= currentStepIndex || isCompleted

                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => isClickable && handleStepClick(step.id)}
                          disabled={!isClickable}
                          className={`
                            flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all
                            ${isActive
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                              : isCompleted
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : isClickable
                                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                  : 'bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500 cursor-not-allowed'
                            }
                          `}
                        >
                          {isCompleted ? (
                            <CheckCheck className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">{step.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Current Step Content */}
              <Card className="border-2 border-emerald-200/50 dark:border-emerald-800/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-8">
                  {getCurrentStepComponent()}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      if (onCancel) {
                        onCancel()
                      } else {
                        router.push('/dashboard/payroll/employees')
                      }
                    }}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 shadow-lg"
                  >
                    Cancel
                  </Button>

                  {currentStepIndex === FORM_STEPS.length - 1 ? (
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-800 text-white shadow-lg shadow-emerald-500/25 border-0"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditMode ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isEditMode ? 'Update Employee' : 'Create Employee'}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleNext}
                      className="bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-800 text-white shadow-lg shadow-emerald-500/25 border-0"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
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