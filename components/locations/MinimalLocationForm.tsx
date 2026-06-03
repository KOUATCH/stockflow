"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Save } from "lucide-react"

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  code: z.string().min(2, "Code must be at least 2 characters").max(20, "Code must be less than 20 characters"),
  type: z.enum(["WAREHOUSE", "STORE", "DISTRIBUTION_CENTER", "SUPPLIER", "CUSTOMER", "MANUFACTURING", "QUARANTINE", "DAMAGED", "TRANSIT", "VIRTUAL"]),
  isActive: z.boolean().default(true),
})

type LocationFormData = z.infer<typeof locationSchema>

interface MinimalLocationFormProps {
  action?: (formData: FormData) => Promise<void>
  organizationId: string
}

export function MinimalLocationForm({ action, organizationId }: MinimalLocationFormProps) {
  const notifications = useNotifications()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "WAREHOUSE",
      isActive: true,
    },
  })

  const handleSubmit = async (data: LocationFormData) => {
    if (!action) {
      notifications.error("Configuration Error", "No action provided for location creation")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('code', data.code)
      formData.append('type', data.type)
      formData.append('isActive', String(data.isActive))

      await action(formData)
      notifications.success("Location Created", `${data.name} has been created successfully`)
    } catch (error) {
      console.error("Failed to create location:", error)
      notifications.error("Creation Failed", error instanceof Error ? error.message : "Failed to create location")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50">
      <div className="max-w-2xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Location</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location name" {...field} />
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
                      <FormLabel>Location Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter location code"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                          <SelectItem value="STORE">Store</SelectItem>
                          <SelectItem value="DISTRIBUTION_CENTER">Distribution Center</SelectItem>
                          <SelectItem value="SUPPLIER">Supplier</SelectItem>
                          <SelectItem value="CUSTOMER">Customer</SelectItem>
                          <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                          <SelectItem value="QUARANTINE">Quarantine</SelectItem>
                          <SelectItem value="DAMAGED">Damaged</SelectItem>
                          <SelectItem value="TRANSIT">Transit</SelectItem>
                          <SelectItem value="VIRTUAL">Virtual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
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

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
