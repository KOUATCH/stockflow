"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { TrackingFormValues } from "@/types/location"
import { Settings } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
// import type { TrackingFormValues } from "@/types/location-form"

interface TrackingFormProps {
  form: UseFormReturn<TrackingFormValues>
  onSubmit: (data: TrackingFormValues) => Promise<void>
  isSubmitting: boolean
}

export function TrackingForm({ form, onSubmit, isSubmitting }: TrackingFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Settings & Tracking
        </CardTitle>
        <CardDescription>Advanced settings and tracking information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="isSerialTracked"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Serial Tracking</FormLabel>
                    <FormDescription>Track individual serial numbers</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>Enable or disable this location</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Updating..." : "Update Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
