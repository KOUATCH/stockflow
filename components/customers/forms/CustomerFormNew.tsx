"use client"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { customerSchema, type CustomerFormData } from "@/validations/customer"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

interface CustomerFormNewProps {
  onSubmit: (data: CustomerFormData) => Promise<void>
  isLoading?: boolean
}

export function CustomerFormNew({ onSubmit, isLoading = false }: CustomerFormNewProps) {
  const router = useRouter()
  const { formSuccess, formError, operationStart } = useNotifications()

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      paymentTerms: 30,
      isActive: true,
    },
  })

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await onSubmit(data)
      form.reset()
      router.push("/dashboard/customers")
      formSuccess("Customer created", `${data.name} has been added to your customer database`)

    } catch (error) {
      console.error("Failed to create customer:", error)
      formError("Error", "Failed to create customer. Please try again.")
      throw error
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground font-sans">Add New Customer</CardTitle>
          <CardDescription>Create a new customer record with essential information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Essential Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground font-sans">Essential Information</h3>

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

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-card-foreground">Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes about this customer..."
                          className="bg-input min-h-[100px]"
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

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-border">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
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
                  onClick={() => router.back()}
                  disabled={form.formState.isSubmitting || isLoading}
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
  )
}
