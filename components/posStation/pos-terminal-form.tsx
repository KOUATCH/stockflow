"use client"

import type { PosStationWithRelations } from "@/actions/posStation/pos-terminal-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  useCreatePosStation,
  useLocations,
  useUpdatePosStation
} from "@/hooks/posStation/use-pos-terminals"
import { pOSStationSchema, type CreatePosStationInput } from "@/validations/pos-terminal"
import { zodResolver } from "@hookform/resolvers/zod"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
interface POSStationFormProps {
  terminal?: PosStationWithRelations
  onSuccess?: () => void
}

export function POSStationForm({ terminal, onSuccess }: POSStationFormProps) {
  const isEditing = !!terminal
  // const { data: locations, isLoading: locationsLoading } = useLocationsByOrganization(selectedOrganizationId)



  const { session, user, organizationId } = useClientAuth()
  const userOrganizationId = authSession.data?.user?.organizationId || ""

  const form = useForm<CreatePosStationInput>({
    resolver: zodResolver(pOSStationSchema),
    defaultValues: {
      terminalNumber: terminal?.terminalNumber || "",
      name: terminal?.name || "",
      isActive: terminal?.isActive ?? true,
      hasCashDrawer: terminal?.hasCashDrawer ?? true,

      locationId: terminal?.locationId || "",
      organizationId: userOrganizationId || "",
    },
  })

  const organizationId = form.watch("organizationId")

  const { data: locations, isLoading: locationsLoading } = useLocations(userOrganizationId)

  const createMutation = useCreatePosStation()
  const updateMutation = useUpdatePosStation()

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Reset location when organization changes
  useEffect(() => {
    if (userOrganizationId && !isEditing) {
      form.setValue("locationId", "")
    }
  }, [userOrganizationId, form, isEditing])

  const onSubmit = async (data: CreatePosStationInput) => {
    if (isEditing && terminal) {
      const result = await updateMutation.mutateAsync({
        id: terminal.id,
        ...data,
      })
      if (result.success) {
        onSuccess?.()
      }
    } else {
      const result = await createMutation.mutateAsync(data)
      if (result.success) {
        form.reset()
        onSuccess?.()
      }
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit POS Terminal" : "Create POS Terminal"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the terminal configuration and hardware settings."
            : "Configure a new POS terminal with hardware settings and location assignment."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="terminalNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terminal Number</FormLabel>
                      <FormControl>
                        <Input placeholder="T001" {...field} />
                      </FormControl>
                      <FormDescription>Unique identifier for this terminal</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terminal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Front Counter Terminal" {...field} />
                      </FormControl>
                      <FormDescription>Display name for this terminal</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!organizationId}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locationsLoading ? (
                            <SelectItem value="" disabled>
                              Loading locations...
                            </SelectItem>
                          ) : locations?.data?.length === 0 ? (
                            <SelectItem value="" disabled>
                              No locations found
                            </SelectItem>
                          ) : (
                            locations?.data?.map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Terminal</FormLabel>
                      <FormDescription>Enable this terminal for POS operations</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Hardware Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hardware Configuration</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasCashDrawer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Cash Drawer</FormLabel>
                        <FormDescription>Terminal has a connected cash drawer</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasReceiptPrinter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Receipt Printer</FormLabel>
                        <FormDescription>Terminal has a connected receipt printer</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasBarcodeScanner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Barcode Scanner</FormLabel>
                        <FormDescription>Terminal has a connected barcode scanner</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasCardReader"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Card Reader</FormLabel>
                        <FormDescription>Terminal has a connected card payment reader</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading ? "Saving..." : isEditing ? "Update Terminal" : "Create Terminal"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
