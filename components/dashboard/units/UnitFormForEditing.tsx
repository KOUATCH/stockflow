"use client"

import { type Column, ConfirmationDialog, DataTable, EntityForm, TableActions } from "@/components/ui/data-table"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCreateUnit, useDeleteUnit } from "@/hooks/unitHooks"
import { useOrgUnits, useUpdateUnit } from "@/hooks/useAllUnitQueries"
import type { BriefUnitPayload } from "@/types/unit"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { z } from "zod"

interface UnitProps {
  organizationId: string | undefined
  title: string
  editingId?: string
  initialData?: BriefUnitPayload[]
}

// Form schema for editing/adding categories
const unitFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Title is required"),
  symbol: z.string().optional(),

})

type UnitFormValues = z.infer<typeof unitFormSchema>

const UnitFormForEditing = ({ title, organizationId, editingId, initialData }: UnitProps) => {
  // Ensure organizationId is provided
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch categories")
  }

  console.log({ initialData })

  // Hooks
  const { refetch } = useOrgUnits(organizationId)
  const createUnitMutation = useCreateUnit()
  const updateUnitMutation = useUpdateUnit()
  const deleteUnitMutation = useDeleteUnit()

  // Local state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitToEdit, setUnitToEdit] = useState<BriefUnitPayload | null>(null)
  const [unitToDelete, setUnitToDelete] = useState<BriefUnitPayload | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Form for editing/adding categories
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
    },
  })

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      name: "",
      symbol: "",
    })
    setIsEditMode(false)
    setUnitToEdit(null)
  }, [form, organizationId])

  // Function to populate form with unit data
  const populateFormWithUnit = useCallback(
    (unit: BriefUnitPayload) => {
      const formData = {
        id: unit.id,
        name: unit.name || "",
        symbol: unit.symbol || "",
        organizationId: organizationId,
      };

      form.reset(formData);
      setIsEditMode(true);
      setUnitToEdit(unit);
    },
    [form, organizationId],
  )

  // Update form when dialog state changes
  useEffect(() => {
    if (!formDialogOpen) {
      return
    }

    if (!unitToEdit) {
      resetFormToDefaults()
    } else {
      populateFormWithUnit(unitToEdit)
    }
  }, [formDialogOpen, unitToEdit, resetFormToDefaults, populateFormWithUnit])

  // Handle form dialog close
  const handleFormDialogClose = (open: boolean) => {
    setFormDialogOpen(open)
    if (!open) {
      setTimeout(() => {
        resetFormToDefaults()
      }, 150)
    }
  }

  // Format date function - memoized and with consistent formatting
  const formatDate = useCallback(
    (date: Date | string) => {
      if (!mounted) return "" // Prevent hydration mismatch

      try {
        const dateObj = typeof date === "string" ? new Date(date) : date
        return format(dateObj, "MMM dd, yyyy")
      } catch (error) {
        return "Invalid Date"
      }
    },
    [mounted],
  )

  // Format currency - memoized and with consistent formatting
  const formatCurrency = useCallback(
    (amount: number) => {
      if (!mounted) return "" // Prevent hydration mismatch

      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "XAF",
          minimumFractionDigits: 0,
        }).format(amount)
      } catch (error) {
        return `${amount} XAF`
      }
    },
    [mounted],
  )

  // Export to Excel - wrapped in useCallback to prevent recreation
  const handleExport = useCallback(
    (filteredUnits: BriefUnitPayload[]) => {
      if (!mounted) return

      try {
        // Prepare data for export
        const exportData = filteredUnits.map((unit) => ({
          Name: unit.name,
          symbol: unit.symbol,
          "Date Added": formatDate(unit.createdAt),
        }))

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Units")

        // Generate filename with current date
        const fileName = `Units_${format(new Date(), "yyyy-MM-dd")}.xlsx`

        // Export to file
        XLSX.writeFile(workbook, fileName)

        toast.success("Export successful", {
          description: `Units exported to ${fileName}`,
        })
      } catch (error) {
        toast.error("Export failed", {
          description: error instanceof Error ? error.message : "Unknown error occurred",
        })
      }
    },
    [formatDate, mounted],
  )

  // Handle add new click
  const handleAddClick = () => {
    setUnitToEdit(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit click
  const handleEditClick = (unit: BriefUnitPayload) => {
    console.log("Editing unit:", unit)
    setUnitToEdit(unit)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (unit: BriefUnitPayload) => {
    setUnitToDelete(unit)
    setDeleteDialogOpen(true)
  }

  // Handle refresh - wrapped in useCallback
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])



  // Handle form submission (edit or add)
  const onSubmit = async (data: UnitFormValues) => {
    try {
      if (!isEditMode || !unitToEdit) {
        // Add new unit
        const { id } = data
        const newUnitData = {
          id: crypto.randomUUID(),
          name: data.name,
          symbol: data.symbol || "",
          organizationId: organizationId || "",
          createdAt: new Date(),
        }

        createUnitMutation.mutate(newUnitData, {
          onSuccess: async () => {
            toast.success("Unit added successfully")
            setFormDialogOpen(false)
            resetFormToDefaults()
            await refetch()
          },
          onError: (error: any) => {
            toast.error("Failed to add unit", {
              description: error?.message || "Unknown error occurred",
            })
          },
        })
      } else {
        // Edit existing unit
        const updateData = {
          ...data,
          id: unitToEdit.id,
          name: data.name,
          symbol: data.symbol || unitToEdit.symbol,
          createdAt: unitToEdit.createdAt, // Ensure createdAt is included
        }

        updateUnitMutation.mutate(
          {
            id: unitToEdit.id,
            data: updateData,
          },
          {
            onSuccess: async () => {
              toast.success("Unit updated successfully")
              setFormDialogOpen(false)
              resetFormToDefaults()
              await refetch()
            },
            onError: (error: any) => {
              toast.error("Failed to update unit", {
                description: error?.message || "Unknown error occurred",
              })
            },
          },
        )
      }
    } catch (error) {
      toast.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Define columns for the data table - memoized to prevent recreation
  const columns: Column<BriefUnitPayload>[] = useMemo(
    () => [

      {
        header: "Unit Name",
        accessorKey: "name",
        cell: (row) => (
          <span className="font-medium">{row.name.length > 20 ? `${row.name.substring(0, 20)}...` : row.name}</span>
        ),
      },
      {
        header: "Symbol",
        accessorKey: "symbol",
      },
      {
        header: "Date Added",
        accessorKey: (row) => formatDate(row.createdAt),
      },
    ],
    [formatDate],
  )

  // Generate subtitle with total value
  const getSubtitle = useCallback(
    (unitCount: number, totalValue: number) => {
      if (!mounted) return "Loading..."
      return `${unitCount} ${unitCount === 1 ? "unit" : "categories"} | Total Value: ${formatCurrency(totalValue)}`
    },
    [formatCurrency, mounted],
  )

  // If categories is not an array, handle it properly
  const categoriesArray = useMemo(() => {
    return Array.isArray(initialData) ? initialData : initialData || []
  }, [initialData])

  // Handle delete confirmation
  const handleDeleteUnitConfirmation = () => {
    if (unitToDelete) {
      deleteUnitMutation.mutate(unitToDelete.id, {
        onSuccess: () => {
          toast.success("Unit deleted successfully")
          refetch()
        },
        onError: (error: any) => {
          toast.error("Failed to delete unit", {
            description: error?.message || "Unknown error occurred",
          })
        },
      })
      setDeleteDialogOpen(false)
      setUnitToDelete(null)
    }
  }

  return (
    <>
      <DataTable<BriefUnitPayload>
        title={title}
        subtitle={`${categoriesArray.length} categories total`}
        data={categoriesArray}
        columns={columns}
        keyField="id"
        onRefresh={handleRefresh}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "symbol"],
          enableDateFilter: true,
          getItemDate: (unit) => unit.createdAt,
        }}
        renderRowActions={(unit) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(unit)}
            onDelete={() => handleDeleteClick(unit)}
            isDeleting={deleteUnitMutation.isPending && unitToDelete?.id === unit.id}
          />
        )}
      />

      {/* Unit Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title={isEditMode ? "Edit Unit" : "Add New Unit"}
        form={form}
        size="lg"
        onSubmit={onSubmit}
        isSubmitting={createUnitMutation.isPending || updateUnitMutation.isPending}
        submitLabel={isEditMode ? "Save Changes" : "Add Unit"}
      >
        <div className="grid md:grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit name *</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter unit name" {...field} />
                  </FormControl>
                  <FormDescription>Enter the unit name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Unit description"
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter unit symbol</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

      </EntityForm >

      {/* Delete Confirmation Dialog */}
      < ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Unit"
        description={
          unitToDelete ? (
            <>
              Are you sure you want to delete <strong>{unitToDelete.name}</strong> ({unitToDelete.symbol}) ? This
              action is irreversible.
            </>
          ) : (
            "Are you sure you want to delete this unit?"
          )
        }
        onConfirm={handleDeleteUnitConfirmation}
        isConfirming={deleteUnitMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}

export default UnitFormForEditing
