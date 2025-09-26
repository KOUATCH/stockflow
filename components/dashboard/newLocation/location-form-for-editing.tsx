"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { Hash, Package, Settings, Warehouse } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useUpdateLocationBasicInfo, useUpdateLocationTracking } from "@/hooks/locationHooks/use-form-mutations"
import { BasicInfoFormValues, basicInfoSchema, LocationDTO, TrackingFormValues, trackingSchema } from "@/types/location"
import { BasicInfoForm } from "./forms/basic-info-form"
import { TrackingForm } from "./forms/tracking-form"
// import {
//   useUpdateLocationBasicInfo,
//   useUpdateLocationTracking,
// } from "@/hooks/use-form-mutations"
// import {
//   basicInfoSchema,

//   trackingSchema,
//   type BasicInfoFormValues,

//   type TrackingFormValues,
//   type LocationDTO,

// } from "@/types/location-form"

interface LocationFormForEditingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locationData?: LocationDTO | null
  onSuccess?: () => void

}

export default function LocationFormForEditing({
  open,
  onOpenChange,
  locationData,
  onSuccess,
}: LocationFormForEditingProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mutations
  const updateBasicInfoMutation = useUpdateLocationBasicInfo()
  const updateTrackingMutation = useUpdateLocationTracking()

  // Forms
  const basicInfoForm = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      type: "",
      address: "",
      email: "",
    },
  })

  const trackingForm = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      isActive: true,
      phone: "670328227"
    },
  })


  const getLocationValue = <K extends keyof LocationDTO>(key: K, defaultValue?: LocationDTO[K]): LocationDTO[K] => {
    if (!locationData) {
      // Handle different default values based on the key type
      if (key === "name" || key === "address" || key === "email" || key === "phone") {
        return (defaultValue !== undefined ? defaultValue : "") as LocationDTO[K]
      }
      if (key === "type") {
        return (defaultValue !== undefined ? defaultValue : "WAREHOUSE") as LocationDTO[K]
      }
      if (key === "isActive") {
        return (defaultValue !== undefined ? defaultValue : true) as LocationDTO[K]
      }
      return defaultValue as LocationDTO[K]
    }

    const value = locationData[key]

    // Fixed the redundant null check
    if (value !== null && value !== undefined) {
      return value
    }

    // Return appropriate defaults for nullable fields
    if (key === "name" || key === "address" || key === "email" || key === "phone") {
      return (defaultValue !== undefined ? defaultValue : "") as LocationDTO[K]
    }
    if (key === "type") {
      return (defaultValue !== undefined ? defaultValue : "WAREHOUSE") as LocationDTO[K]
    }
    if (key === "isActive") {
      return (defaultValue !== undefined ? defaultValue : true) as LocationDTO[K]
    }

    return defaultValue as LocationDTO[K]
  }

  // // Helper function to safely get values from locationData
  // const getLocationValue = <K extends keyof LocationDTO>(
  //   key: K,
  //   defaultValue: LocationDTO[K] = "" as LocationDTO[K],
  // ): LocationDTO[K] => {
  //   if (!locationData) return defaultValue
  //   const value = locationData[key]
  //   return value !== null && value !== null ? value : defaultValue
  // }

  // Populate forms when locationData changes
  useEffect(() => {
    if (locationData && open) {
      basicInfoForm.reset({
        name: getLocationValue("name", ""),
        type: getLocationValue("type",),
        address: getLocationValue("address", ""), // Added default value
        email: getLocationValue("email", "john@gmail.com"), // Added
      })
      trackingForm.reset({
        isActive: getLocationValue("isActive", true),
        phone: "670328227"
      })
    }
  }, [locationData, open, basicInfoForm, trackingForm])

  // Generic form submission handler
  const createSubmissionHandler = <T,>(mutation: any, successMessage: string, errorMessage: string) => {
    return async (data: T) => {
      if (!locationData) {
        toast.error("Location data is missing. Cannot update location.")
        return
      }

      setIsSubmitting(true)
      try {
        const updateData = {
          ...data,
          id: locationData.id,
        }

        mutation.mutate(
          {
            id: locationData.id,
            data: updateData,
          },
          {
            onSuccess: () => {
              toast.success(successMessage)
              onSuccess?.()
            },
            onError: (error: any) => {
              toast.error(errorMessage, {
                description: error?.message || "Unknown error occurred",
              })
            },
          },
        )
      } catch (error) {
        toast.error(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Form submission handlers
  const handleBasicInfoSubmit = createSubmissionHandler<BasicInfoFormValues>(
    updateBasicInfoMutation,
    "Location updated successfully",
    "Failed to update location",
  )


  const handleTrackingSubmit = createSubmissionHandler<TrackingFormValues>(
    updateTrackingMutation,
    "Settings updated successfully",
    "Failed to update settings",
  )

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
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1">
              <BasicInfoForm form={basicInfoForm} onSubmit={handleBasicInfoSubmit} isSubmitting={isSubmitting} />
            </div>
          </TabsContent>



          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1">
              <TrackingForm form={trackingForm} onSubmit={handleTrackingSubmit} isSubmitting={isSubmitting} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
