"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUpdateLocationBasicInfo } from "@/hooks/useAllLocationsQueries"
import { LocationDTO } from "@/types/location"
import { zodResolver } from "@hookform/resolvers/zod"
import { Hash, Package, Settings, Warehouse } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNotifications } from "@/components/notifications/NotificationProvider"

// // Mock hooks - replace with your actual implementations
// const useUpdateLocationBasicInfo = () => ({
//   mutate: (data: any, callbacks: any) => {
//     // Mock implementation
//     setTimeout(() => callbacks.onSuccess(), 1000)
//   },
// })

// const useUpdateLocationOther = () => ({
//   mutate: (data: any, callbacks: any) => {
//     // Mock implementation
//     setTimeout(() => callbacks.onSuccess(), 1000)
//   },
// })


// interface LocationDTO {
//   id: string
//   name: string
//   address?: string
//   email?: string
//   type?: string
//   phone?: string
//   isActive: boolean
// }

// Schema definitions
const basicInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  isActive: z.boolean(),
  phone: z.string().optional(),
})


type BasicInfoFormValues = z.infer<typeof basicInfoSchema>

interface ComprehensiveLocationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locationData?: LocationDTO | null | undefined
  onSuccess?: () => void

}

export default function LocationFormForEditing({
  open,
  onOpenChange,
  locationData,
  onSuccess,
}: ComprehensiveLocationFormProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateLocationMutation = useUpdateLocationBasicInfo()
  const { formSuccess, formError, operationStart } = useNotifications()
  // const updateLocationOtherMutation = useUpdateLocationOther()

  // Helper function to safely get values from locationData
  const getLocationValue = (key: keyof LocationDTO, defaultValue: any = "") => {
    if (!locationData) return defaultValue
    const value = locationData[key]
    return value !== undefined && value !== null ? value : defaultValue
  }

  // Individual forms for each tab with proper default values
  const basicInfoForm = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      address: "",
      email: "",
    },
  })



  // Effect to populate forms when locationData changes
  useEffect(() => {
    if (locationData && open) {
      console.log("Populating forms with location data:", locationData)

      // Reset and populate basic info form
      basicInfoForm.reset({
        name: getLocationValue("name", ""),
        address: getLocationValue("address", ""),
        email: getLocationValue("email", ""),
        isActive: getLocationValue("isActive", true),
        phone: getLocationValue("phone", ""),
      })

    }
  }, [locationData, open, basicInfoForm])

  // Handle individual form submissions
  const handleBasicInfoSubmit = async (data: BasicInfoFormValues) => {
    setIsSubmitting(true)
    const operationId = operationStart("Updating Location")

    try {
      if (!locationData) {
        formError("Missing Location Data", "Location data is missing. Cannot update location.")
        return
      }

      const updateData = {
        ...data,
        id: locationData.id,
      }

      updateLocationMutation.mutate(
        {
          id: locationData.id,
          data: updateData,
        },
        {
          onSuccess: async () => {
            formSuccess("Location Updated", `Location "${data.name}" has been successfully updated with new information`)
            onSuccess?.()
          },
          onError: (error: any) => {
            formError(
              "Failed to Update Location",
              "Could not save the location changes",
              error?.message || "An unexpected error occurred"
            )
          },
        },
      )
    } catch (error) {
      formError(
        "Update Failed",
        "Failed to update basic information",
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // const handleTrackingSubmit = async (data: TrackingFormValues) => {
  //   setIsSubmitting(true)
  //   try {
  //     if (!locationData) {
  //       toast.error("Location data is missing. Cannot update tracking.")
  //       return
  //     }

  //     const updateData = {
  //       ...data,
  //       id: locationData.id,
  //     }

  //     updateLocationOtherMutation.mutate(
  //       {
  //         id: locationData.id,
  //         data: updateData,
  //       },
  //       {
  //         onSuccess: async () => {
  //           toast.success("Tracking information updated successfully")
  //           onSuccess?.()
  //         },
  //         onError: (error: any) => {
  //           toast.error("Failed to update tracking information", {
  //             description: error?.message || "Unknown error occurred",
  //           })
  //         },
  //       },
  //     )
  //   } catch (error) {
  //     toast.error("Failed to update tracking information")
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Location: {getLocationValue("name", "Unknown Location")}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="codes" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Codes
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Tracking
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Essential location details and description</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...basicInfoForm}>
                  <form onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
                    <FormField
                      control={basicInfoForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter location name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <FormField
                      control={basicInfoForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter location address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicInfoForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Updating..." : "Update Basic Info"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking Tab */}

        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
