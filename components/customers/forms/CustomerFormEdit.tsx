"use client"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { getLocaleFromPathname, localizePath } from "@/i18n/routing"
import { DEFAULT_LOCALE } from "@/types/bilingual"
import type { Customer } from "@/types/customerTypes"
import { customerEditSchema, type CustomerEditFormData } from "@/validations/customer"
import { zodResolver } from "@hookform/resolvers/zod"
import { Clock, CreditCard, DollarSign, Edit, FileText, Loader2, Mail, Phone, Save, User, X } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

interface CustomerFormEditProps {
  customer: Customer
  onSubmit: (data: CustomerEditFormData) => Promise<void>
  isLoading?: boolean
}

export function CustomerFormEdit({ customer, onSubmit, isLoading = false }: CustomerFormEditProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE
  const localizedHref = (href: string) => localizePath(href, locale)
  const { formSuccess, formError, operationStart } = useNotifications()

  const form = useForm<CustomerEditFormData>({
    resolver: zodResolver(customerEditSchema),
    defaultValues: {
      id: customer.id,
      name: customer.name,
      code: customer.code || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      taxId: customer.taxId || "",
      creditLimit: customer.creditLimit || undefined,
      paymentTerms: customer.paymentTerms,
      notes: customer.notes || "",
      isActive: customer.isActive,
    },
  })

  const handleSubmit = async (data: CustomerEditFormData) => {
    try {
      operationStart("Updating Customer")
      await onSubmit(data)
      formSuccess(
        "Customer Updated",
        `${data.name}'s information has been updated successfully`
      )
    } catch (error) {
      console.error("Failed to update customer:", error)
      formError(
        "Update Failed",
        "Failed to update customer information",
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(localizedHref(`/dashboard/customers/${customer.id}`))}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Edit Customer
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Update {customer.name}&apos;s information and settings
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Customer Information</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">Update customer details below</CardDescription>
              </div>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Basic Info
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Contact & Billing
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Notes & Settings
                        </TabsTrigger>
                      </TabsList>

                      {/* Basic Information Tab */}
                      <TabsContent value="basic" className="space-y-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-card-foreground font-sans">Basic Information</h3>

                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-card-foreground">Customer Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter customer name" className="bg-input" {...field} />
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
                                  <FormLabel className="text-card-foreground">Customer Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="CUST-001" className="bg-input" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-card-foreground">Email Address</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="customer@company.com" className="bg-input" {...field} />
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
                                  <FormLabel className="text-card-foreground">Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+1 (555) 123-4567" className="bg-input" {...field} />
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
                                <FormLabel className="text-card-foreground">Address</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter full address..."
                                    className="bg-input min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Contact & Billing Tab */}
                      <TabsContent value="billing" className="space-y-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-card-foreground font-sans">
                            Contact & Billing Information
                          </h3>

                          <FormField
                            control={form.control}
                            name="taxId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-card-foreground">Tax ID / VAT Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="TAX123456789" className="bg-input" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="creditLimit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-card-foreground">Credit Limit ($)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="50000"
                                      className="bg-input"
                                      {...field}
                                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="paymentTerms"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-card-foreground">Payment Terms (Days)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="30"
                                      className="bg-input"
                                      {...field}
                                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 30)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      {/* Notes & Settings Tab */}
                      <TabsContent value="settings" className="space-y-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-card-foreground font-sans">Notes & Settings</h3>

                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-card-foreground">Customer Notes</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Add any additional notes about this customer..."
                                    className="bg-input min-h-[120px]"
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
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-input">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base text-card-foreground">Active Customer</FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Enable this customer for new orders and transactions
                                  </div>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

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
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Update Customer
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(localizedHref(`/dashboard/customers/${customer.id}`))}
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
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Customer Preview</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">Live preview of changes</CardDescription>
              </div>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Customer Avatar and Name */}
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {(form.watch("name") || customer.name)
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {form.watch("name") || customer.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {(form.watch("code") || customer.code) && `#${form.watch("code") || customer.code}`}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(form.watch("isActive") ?? customer.isActive)
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${(form.watch("isActive") ?? customer.isActive) ? 'bg-green-500' : 'bg-slate-400'
                        }`}></div>
                      {(form.watch("isActive") ?? customer.isActive) ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {/* Contact Information Preview */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Preview</h4>
                    {(form.watch("email") || customer.email) && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
                          <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 truncate">
                          {form.watch("email") || customer.email}
                        </span>
                      </div>
                    )}
                    {(form.watch("phone") || customer.phone) && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1 rounded bg-green-100 dark:bg-green-900/30">
                          <Phone className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 truncate">
                          {form.watch("phone") || customer.phone}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Terms Preview */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Payment Info</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {form.watch("paymentTerms") || customer.paymentTerms} day terms
                      </span>
                    </div>
                    {(form.watch("creditLimit") || customer.creditLimit) && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">
                          ${(form.watch("creditLimit") || customer.creditLimit || 0).toLocaleString()} credit limit
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
