"use client"

import LocationFormForEditing from "@/components/dashboard/location/locationFormForEditing"
import { ConfirmationDialog, DataTable, EntityForm, TableActions, type Column } from "@/components/ui/data-table"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCreateALocation, useDeleteALocation, useUpdateALocation } from "@/hooks/locationHooks"
import { useOrgLocations } from "@/hooks/useAllLocationsQueries"
import { LocationDTO } from "@/types/location"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { DollarSign } from "lucide-react"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { z } from "zod"

interface LocationDetailProps {
  title: string
  editingId: string
  organizationId: string
  initialLocationData: LocationDTO[];
}

// Simple form schema for adding new locations (basic fields only)
const locationFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "location type is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().optional(),
  organizationId: z.string().optional(),
  isActive: z.boolean().optional(),
})

type LocationFormValues = z.infer<typeof locationFormSchema>

const LocationListingWithEditing = ({ title, organizationId, editingId, initialLocationData }: LocationDetailProps) => {
  // Ensure organizationId is provided
  console.log(organizationId)
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch locations")
  }
  const itemsArray = Array?.isArray(initialLocationData) ? initialLocationData : initialLocationData

  const { refetch } = useOrgLocations(organizationId)
  const createLocationMutation = useCreateALocation()
  const updateLocationMutation = useUpdateALocation()
  const deleteLocationMutation = useDeleteALocation()

  // Local state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [comprehensiveFormOpen, setComprehensiveFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [locationToEdit, setLocationToEdit] = useState<LocationDTO | null>(null)
  const [locationToDelete, setLocationToDelete] = useState<LocationDTO | null>(null)
  const [sku, setSku] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState(false)

  // Form for adding new locations (simple form)
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      type: "",
      email: "",
      organizationId: "",
      address: "",
      phone: 0,
    },
  })

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      type: "",
      name: "",
      email: "",
      organizationId: "",
      address: "",
      phone: 0,
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
        type: location.type,
        address: location.address,
        phone: location.phone,
        email: location.email,
        "Date Added": formatDate(location.createdAt),
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

  // Calculate total locations value
  const getTotalValue = useCallback((locations: LocationDTO[]) => {
    return locations.reduce((total, location) => {
      const price = Number(location.email)
      if (isNaN(price)) {
        console.warn(`Invalid sellingPrice or quantity for location ${location.id}:`, location)
        return total
      }
      return total + price
    }, 0)
  }, [])

  // Handle add new click (simple form)
  const handleAddClick = () => {
    setLocationToEdit(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit click (comprehensive form)
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

  // Handle form submission (add new location only)
  const onSubmit = async (data: LocationFormValues) => {
    try {
      const { id, ...rest } = data
      const newLocationData = {
        id: crypto.randomUUID(),
        ...rest,
        name: data.name.toLowerCase().replace(/\s+/g, "-"),
        address: data.address,
        organizationId: organizationId || "",
        createdAt: new Date(),
        phone: data.phone,
        type: data?.type ?? "WAREHOUSE",
      }

      createLocationMutation.mutate(newLocationData, {
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
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "Type",
      accessorKey: "type",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Date Added",
      accessorKey: (row) => formatDate(row.createdAt),
    },
  ]

  // Generate subtitle with total value
  const getSubtitle = useCallback((locationCount: number, totalValue: number) => {
    return `${locationCount} ${locationCount === 1 ? "location" : "locations"} | Total Value: ${formatCurrency(totalValue)}`
  }, [])

  // Handle delete confirmation
  const handleDeleteLocationConfirmation = () => {
    if (locationToDelete) {
      deleteLocationMutation.mutate(locationToDelete.id!, {
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
        title={"Locations Information"}
        // subtitle={
        //   initialLocationData ? length > 0
        //     ? getSubtitle(initialLocationData ? length, getTotalValue(initialLocationData))
        //     : "No locations found"
        // } 



        subtitle={itemsArray?.length > 0 ? getSubtitle(itemsArray?.length, getTotalValue(itemsArray)) : "No items found"}
        data={initialLocationData}
        columns={columns}
        keyField="id"
        onRefresh={handleRefresh}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "type", "email"],
          enableDateFilter: true,
          getItemDate: (location) => location.createdAt,
        }}
        renderRowActions={(location) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(location)}
            onDelete={() => handleDeleteClick(location)}
            isDeleting={deleteLocationMutation.isPending && locationToDelete?.id === location.id}
          />
        )}
      />

      {/* Simple Add Location Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title="New Location"
        form={form}
        size="lg"
        onSubmit={onSubmit}
        isSubmitting={createLocationMutation.isPending}
        submitLabel="Add New Location"
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
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="0"
                        className="pl-8"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : Number(e.target.value)
                          field.onChange(value)
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the location Phone</FormDescription>
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
                    <Input placeholder="Enter location address" {...field} />
                  </FormControl>
                  <FormDescription>Enter address of the location</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location type" {...field} />
                  </FormControl>
                  <FormDescription>Enter the type of the location</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-12">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location email" {...field} />
                  </FormControl>
                  <FormDescription>Enter the email for the location</FormDescription>
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

export default LocationListingWithEditing
