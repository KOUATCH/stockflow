"use client"

import LocationFormForEditing from "@/components/dashboard/location/locationFormForEditing"
import { ConfirmationDialog, DataTable, EntityForm, TableActions, type Column } from "@/components/ui/data-table"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCreateALocation, useDeleteALocation, useUpdateALocation } from "@/hooks/locationHooks"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { generateSimpleSKU } from "@/lib/generateSKU"
import type { LocationDTO } from "@/types/location"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Phone } from "lucide-react"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { z } from "zod"
import { Button } from "../button"


interface LocationDetailProps {
  title: string
  editingId: string
  organizationId: string
  initialLocationData: LocationDTO[] | undefined
}

// Form schema for adding new locations - aligned with LocationDTO
const locationFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  organizationId: z.string().optional(),
  isActive: z.boolean().optional(),
})

type LocationFormValues = z.infer<typeof locationFormSchema>

export default function LocationFormWithEditing({
  title,
  organizationId,
  editingId,
  initialLocationData,
}: LocationDetailProps) {
  // Ensure organizationId is provided
  console.log(organizationId)
  console.log(initialLocationData)
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch locations")
  }

  // Ensure initialLocationData is always an array
  const locationsArray = Array.isArray(initialLocationData) ? initialLocationData : []

  const { refetch } = useOrgLocationsNew(organizationId)
  const createLocationMutation = useCreateALocation()
  const updateLocationMutation = useUpdateALocation()
  const deleteLocationMutation = useDeleteALocation()

  // Local state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [comprehensiveFormOpen, setComprehensiveFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [locationToEdit, setLocationToEdit] = useState<LocationDTO | null>(null)
  const [locationToDelete, setLocationToDelete] = useState<LocationDTO | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Form for adding new locations
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      email: "",
      code: "",
      organizationId: "",
      address: "",
      phone: "",
      isActive: true,
    },
  })

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      name: "",
      email: "",
      code: "",
      organizationId: "",
      address: "",
      phone: "",
      isActive: true,
    })
    setIsEditMode(false)
    setLocationToEdit(null)
  }, [form])

  // Handle form dialog close
  const handleFormDialogClose = (open: boolean) => {
    setFormDialogOpen(open)
    if (!open) {
      setTimeout(() => {
        resetFormToDefaults()
      }, 150)
    }
  }

  // Format date function
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, "MMM dd, yyyy")
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Export to Excel
  const handleExport = useCallback((filteredLocations: LocationDTO[]) => {
    try {
      const exportData = filteredLocations.map((location) => ({
        Name: location.name,
        Address: location.address || "",
        Phone: location.phone || "",
        Email: location.email || "",
        "Date Added": formatDate(location.createdAt),
        Active: location.isActive ? "Yes" : "No",
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Locations")

      const fileName = `Locations_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast.success("Export successful", {
        description: `Locations exported to ${fileName}`,
      })
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }, [])

  // Calculate total locations count (removed invalid price calculation)
  const getTotalValue = useCallback((locations: LocationDTO[]) => {
    return locations.length // Just return count since email shouldn't be used for pricing
  }, [])

  // Handle add new click
  const handleAddClick = () => {
    setLocationToEdit(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit click
  const handleEditClick = (location: LocationDTO) => {
    console.log("Opening comprehensive edit form for:", location)
    setLocationToEdit(location)
    setIsEditMode(true)
    setComprehensiveFormOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (location: LocationDTO) => {
    setLocationToDelete(location)
    setDeleteDialogOpen(true)
  }

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle form submission
  const onSubmit = async (data: LocationFormValues) => {
    try {
      const { id, ...rest } = data
      const newLocationData: Omit<LocationDTO, "id"> & { id?: string } = {
        id: crypto.randomUUID(),
        name: data.name,
        code: data.code,
        address: data.address,
        organizationId: organizationId,
        createdAt: new Date(),
        phone: data.phone,
        email: data.email,
        isActive: data.isActive ?? true,
      }

      createLocationMutation.mutate(newLocationData as LocationDTO, {
        onSuccess: async () => {
          toast.success("Location added successfully")
          setFormDialogOpen(false)
          resetFormToDefaults()
          await refetch()
        },
        onError: (error: any) => {
          toast.error("Failed to add location", {
            description: error?.message || "Unknown error occurred",
          })
        },
      })
    } catch (error) {
      toast.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Define columns for the data table
  const columns: Column<LocationDTO>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (row) => (
        <span className="font-medium">
          {row?.name ? (row.name.length > 20 ? `${row.name.substring(0, 20)}...` : row.name) : ""}
        </span>
      ),
    },

    {
      header: "Address",
      accessorKey: "address",
      cell: (row) => row.address || "—",
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (row) => row.phone || "—",
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (row) => row.email || "—",
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${row.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Date Added",
      accessorKey: "createdAt",
      cell: (row) => formatDate(row.createdAt),
    },
  ]
  const copyToClipboard = useCallback(async (): Promise<void> => {
    const currentSku = form.getValues("code")
    if (currentSku) {
      try {
        await navigator.clipboard.writeText(currentSku)
        toast.success("SKU copied to clipboard!")
      } catch (err) {
        console.error("Failed to copy SKU:", err)
        toast.error("Failed to copy SKU to clipboard")
      }
    }
  }, [form])
  const generateSKU = useCallback(() => {
    const newSku = generateSimpleSKU(9, "Loc")
    form.setValue("code", newSku, { shouldValidate: true })
  }, [form])

  // Generate subtitle
  const getSubtitle = useCallback((locationCount: number) => {
    return `${locationCount} ${locationCount === 1 ? "location" : "locations"}`
  }, [])

  // Handle delete confirmation
  const handleDeleteLocationConfirmation = () => {
    if (locationToDelete) {
      deleteLocationMutation.mutate(locationToDelete.code, {
        onSuccess: () => {
          toast.success("Location deleted successfully")
          refetch()
        },
        onError: (error: any) => {
          toast.error("Failed to delete location", {
            description: error?.message || "Unknown error occurred",
          })
        },
      })
      setDeleteDialogOpen(false)
      setLocationToDelete(null)
    }
  }

  return (
    <>
      <DataTable<LocationDTO>
        title="Locations Information"
        subtitle={locationsArray.length > 0 ? getSubtitle(locationsArray.length) : "No locations found"}
        data={locationsArray}
        columns={columns}
        keyField="code"
        onRefresh={handleRefresh}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "email"],
          enableDateFilter: true,
          getItemDate: (location) => location.createdAt,
        }}
        renderRowActions={(location) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(location)}
            onDelete={() => handleDeleteClick(location)}
            isDeleting={deleteLocationMutation.isPending && locationToDelete?.code === location.code}
          />
        )}
      />

      {/* Add Location Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title="New Location"
        form={form}
        size="lg"
        onSubmit={onSubmit}
        isSubmitting={createLocationMutation.isPending}
        submitLabel="Add Location"
      >
        <div className="grid md:grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location name" {...field} />
                  </FormControl>
                  <FormDescription>Enter the name of the location</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Enter phone number" className="pl-8" {...field} value={field.value || ""} />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the location phone number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter location email" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>Enter the email for the location</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location address" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>Enter the full address of the location</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="">

            {/* SKU Generation */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Code</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Input
                        type="text"
                        placeholder="Generated SKU will appear here..."
                        className="font-mono transition-colors"
                        {...field}
                      />

                      <div className="flex gap-2">
                        <Button type="button" onClick={generateSKU} variant="outline" className="flex-1 bg-transparent">
                          Generate SKU
                        </Button>

                        {field.value && (
                          <Button
                            type="button"
                            onClick={copyToClipboard}
                            variant="outline"
                            size="icon"
                            title="Copy to clipboard"
                          >
                            📋
                          </Button>
                        )}
                      </div>

                      {field.value && (
                        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Generated SKU:</strong> <code className="font-mono">{field.value}</code>
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Unique identifier for this item</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </EntityForm>

      {/* Comprehensive Edit Form Dialog */}
      <LocationFormForEditing
        open={comprehensiveFormOpen}
        onOpenChange={setComprehensiveFormOpen}
        locationData={locationToEdit}
        onSuccess={() => {
          refetch()
          setComprehensiveFormOpen(false)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Location"
        description={
          locationToDelete ? (
            <>
              Are you sure you want to delete <strong>{locationToDelete.name}</strong>? This action is irreversible.
            </>
          ) : (
            "Are you sure you want to delete this location?"
          )
        }
        onConfirm={handleDeleteLocationConfirmation}
        isConfirming={deleteLocationMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
