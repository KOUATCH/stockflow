"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCreatePosStation, useLocationsByOrganization } from "@/hooks/posStation/use-pos-stations"
// import { useCreatePosStation, useLocationsByOrganization } from "@/hooks/posStation/usePosStationHooks"
import { posStationSchema, type CreatePosStationInput } from "@/validations/posStationTypes"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Terminal } from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useForm } from "react-hook-form"


export function PosStationForm() {
  const { session, user, organizationId } = useClientAuth()
  const userOrganizationId = authSession?.data?.user?.organizationId || ""

  const form = useForm<CreatePosStationInput>({
    resolver: zodResolver(posStationSchema),
    defaultValues: {
      name: "",
      isActive: true,
      hasCashDrawer: true,
      locationId: "",
      organizationId: "",
    },
  })

  const createPosStation = useCreatePosStation()
  const { data: locations, isLoading: locationsLoading } = useLocationsByOrganization(userOrganizationId)

  const onSubmit = async (data: CreatePosStationInput) => {
    await createPosStation.mutateAsync(data)
    form.reset()
  }


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Create POS Station
        </CardTitle>
        <CardDescription>Set up a new point-of-sale station with auto-generated terminal number</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Organization Selection */}


            {/* Location Selection */}
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={locationsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {userOrganizationId && locations?.length === 0 && "No locations available for this organization"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Station Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Station Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Counter, Drive-Thru, Checkout 1" {...field} />
                  </FormControl>
                  <FormDescription>A descriptive name for this POS station</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hardware Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hardware Configuration</h3>

              <FormField
                control={form.control}
                name="hasCashDrawer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Cash Drawer</FormLabel>
                      <FormDescription>Enable if this station has a connected cash drawer</FormDescription>
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
                      <FormDescription>Enable to make this station available for use</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Terminal Number Info */}
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium text-sm mb-2">Terminal Number</h4>
              <p className="text-sm text-muted-foreground">
                A unique terminal number will be automatically generated when you create this station. Format:
                POS-XXXXXX-XXXX
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={createPosStation.isPending}>
              {createPosStation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Station...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create POS Station
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
