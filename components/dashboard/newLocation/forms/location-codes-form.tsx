"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Hash } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import type { LocationCodesFormValues } from "@/types/location-form"

interface LocationCodesFormProps {
  form: UseFormReturn<LocationCodesFormValues>
  onSubmit: (data: LocationCodesFormValues) => Promise<void>
  isSubmitting: boolean
}

export function LocationCodesForm({ form, onSubmit, isSubmitting }: LocationCodesFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Location Codes
        </CardTitle>
        <CardDescription>Universal location identifiers</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="upc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPC (12 digits)</FormLabel>
                  <FormControl>
                    <Input placeholder="Universal Product Code" {...field} />
                  </FormControl>
                  <FormDescription>12-digit unique product identifier</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ean"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EAN (13 digits)</FormLabel>
                  <FormControl>
                    <Input placeholder="International Article Number" {...field} />
                  </FormControl>
                  <FormDescription>13-digit international identifier</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mpn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MPN</FormLabel>
                  <FormControl>
                    <Input placeholder="Manufacturing Part Number" {...field} />
                  </FormControl>
                  <FormDescription>Manufacturer's part number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN (13 digits)</FormLabel>
                  <FormControl>
                    <Input placeholder="International Standard Book Number" {...field} />
                  </FormControl>
                  <FormDescription>For books only</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Updating..." : "Update Location Codes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
