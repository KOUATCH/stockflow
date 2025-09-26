"use client"

import { useNotifications } from "@/components/notifications/NotificationProvider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import { customerSchema, type CustomerFormData } from "@/validations/customer"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Activity,
  Building,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Star,
  User,
  X
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

interface CreateCustomerFormProps {
  onSubmit: (data: CustomerFormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function CreateCustomerForm({ onSubmit, isLoading = false, onCancel }: CreateCustomerFormProps) {
  const router = useRouter()
  const { formSuccess, formError, operationStart } = useNotifications()

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      code: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
      creditLimit: undefined,
      paymentTerms: 30,
      notes: "",
      isActive: true,
    },
  })

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      operationStart("Creating Customer")
      await onSubmit(data)
      formSuccess(
        "Customer Created",
        `${data.name} has been added to your customer database`
      )
    } catch (error) {
      console.error("Failed to create customer:", error)
      formError(
        "Creation Failed",
        "Failed to create new customer",
        error instanceof Error ? error.message : "An unexpected error occurred"
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

  // Generate preview avatar
  const customerName = form.watch("name")
  const isActive = form.watch("isActive")
  const paymentTerms = form.watch("paymentTerms")
  const creditLimit = form.watch("creditLimit")

  const avatarFallback = customerName
    ? customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : "??"

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Create New Customer
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Add a new customer with all essential information and settings
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Customer Information
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    Fill in the customer details below
                  </CardDescription>
                </div>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                      {/* Basic Information Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h3>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Customer Name *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter customer name"
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                  <Hash className="h-4 w-4" />
                                  Customer Code
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="CUST-001 (auto-generated if empty)"
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                  Leave empty to auto-generate a unique code
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  Email Address
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="customer@company.com"
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  Phone Number
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+1 (555) 123-4567"
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Address
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter full customer address..."
                                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="bg-slate-200 dark:bg-slate-700" />

                      {/* Billing Information Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2">
                          <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Billing Information</h3>
                        </div>

                        <FormField
                          control={form.control}
                          name="taxId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Tax ID / VAT Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="TAX123456789"
                                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                            name="creditLimit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  Credit Limit ($)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="50000"
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                                  Maximum credit amount for this customer
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
                                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Payment Terms
                                </FormLabel>
                                <Select onValueChange={(value) => field.onChange(Number.parseInt(value))} defaultValue="30">
                                  <FormControl>
                                    <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                      <SelectValue placeholder="Select payment terms" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="15">15 days</SelectItem>
                                    <SelectItem value="30">30 days (Standard)</SelectItem>
                                    <SelectItem value="45">45 days</SelectItem>
                                    <SelectItem value="60">60 days</SelectItem>
                                    <SelectItem value="90">90 days</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator className="bg-slate-200 dark:bg-slate-700" />

                      {/* Notes and Settings Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2">
                          <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notes & Settings</h3>
                        </div>

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Customer Notes</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Add any additional notes about this customer..."
                                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                  <Activity className="h-4 w-4" />
                                  Active Customer
                                </FormLabel>
                                <FormDescription className="text-sm text-slate-600 dark:text-slate-400">
                                  Enable this customer for new orders and transactions
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          type="submit"
                          disabled={form.formState.isSubmitting || isLoading}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        >
                          {form.formState.isSubmitting || isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Create Customer
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={form.formState.isSubmitting || isLoading}
                          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80"
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
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Customer Preview
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    How this customer will appear
                  </CardDescription>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Customer Avatar and Name */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-slate-200 dark:ring-slate-700">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {avatarFallback}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {customerName || "New Customer"}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {form.watch("code") && `#${form.watch("code")}`}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={
                          isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }
                      >
                        <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Info</h4>
                      {form.watch("email") && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                            <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{form.watch("email")}</span>
                        </div>
                      )}
                      {form.watch("phone") && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-1 rounded bg-green-100 dark:bg-green-900/30">
                            <Phone className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{form.watch("phone")}</span>
                        </div>
                      )}
                    </div>

                    {/* Payment Terms */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Payment Info</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">{paymentTerms} day terms</span>
                      </div>
                      {creditLimit && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">${creditLimit.toLocaleString()} credit limit</span>
                        </div>
                      )}
                    </div>

                    {/* Help Text */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        This preview shows how the customer will appear in the customer table and throughout the system.
                      </p>
                    </div>
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