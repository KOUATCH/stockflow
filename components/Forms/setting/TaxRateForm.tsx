"use client"

import { type Column, ConfirmationDialog, DataTable, EntityForm, TableActions } from "@/components/ui/data-table"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCreateATaxRate, useDeleteATaxRate } from "@/hooks/taxRateHooks"
import { useOrgTaxRates, useUpdateATaxRate } from "@/hooks/useAllTaxRateQueries"
import { BriefTaxRatePayload } from "@/types/taxRates"
// import { useCreateATaxRate, useDeleteATaxRate } from "@/hooks/TaxRateHooks"
// import { useOrgTaxRates, useUpdateATaxRate } from "@/hooks/useAllTaxRateQueries"
// import type { BriefTaxRatePayload } from "@/types/TaxRates"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Scale } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { z } from "zod"

interface TaxRateProps {
  organizationId: string | undefined
  title: string
  editingId?: string
  initialData?: BriefTaxRatePayload[]
}

// Form schema for editing/adding categories
const TaxRateFormSchema = z.object({
  id: z.string().optional(),
  taxRateName: z.string().min(1, "Title is required"),
  rate: z.number(),

})

type TaxRateFormValues = z.infer<typeof TaxRateFormSchema>

const TaxRateForm = ({ title, organizationId, editingId, initialData }: TaxRateProps) => {
  // Ensure organizationId is provided
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch categories")
  }

  console.log({ initialData })

  // Hooks
  const { refetch } = useOrgTaxRates(organizationId)
  const createTaxRateMutation = useCreateATaxRate()
  const updateTaxRateMutation = useUpdateATaxRate()
  const deleteTaxRateMutation = useDeleteATaxRate()

  // Local state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [TaxRateToEdit, setTaxRateToEdit] = useState<BriefTaxRatePayload | null>(null)
  const [TaxRateToDelete, setTaxRateToDelete] = useState<BriefTaxRatePayload | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Form for editing/adding categories
  const form = useForm<TaxRateFormValues>({
    resolver: zodResolver(TaxRateFormSchema),
    defaultValues: {
      taxRateName: "",
      rate: 0,
    },
  })

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      taxRateName: "",
      rate: 0,
    })
    setIsEditMode(false)
    setTaxRateToEdit(null)
  }, [form, organizationId])

  // Function to populate form with TaxRate data
  const populateFormWithTaxRate = useCallback(
    (TaxRate: BriefTaxRatePayload) => {
      const formData = {
        id: TaxRate.id,
        taxRateName: TaxRate.taxRateName || "",
        rate: TaxRate.rate || 0,
      };

      form.reset(formData);
      setIsEditMode(true);
      setTaxRateToEdit(TaxRate);
    },
    [form, organizationId],
  )

  // Update form when dialog state changes
  useEffect(() => {
    if (!formDialogOpen) {
      return
    }

    if (!TaxRateToEdit) {
      resetFormToDefaults()
    } else {
      populateFormWithTaxRate(TaxRateToEdit)
    }
  }, [formDialogOpen, TaxRateToEdit, resetFormToDefaults, populateFormWithTaxRate])

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
    (filteredTaxRates: BriefTaxRatePayload[]) => {
      if (!mounted) return

      try {
        // Prepare data for export
        const exportData = filteredTaxRates.map((TaxRate) => ({
          Name: TaxRate.taxRateName,
          symbol: TaxRate.rate,
          "Date Added": formatDate(TaxRate.createdAt),
        }))

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "TaxRates")

        // Generate filename with current date
        const fileName = `TaxRates_${format(new Date(), "yyyy-MM-dd")}.xlsx`

        // Export to file
        XLSX.writeFile(workbook, fileName)

        toast.success("Export successful", {
          description: `TaxRates exported to ${fileName}`,
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
    setTaxRateToEdit(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit click
  const handleEditClick = (TaxRate: BriefTaxRatePayload) => {
    console.log("Editing TaxRate:", TaxRate)
    setTaxRateToEdit(TaxRate)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (TaxRate: BriefTaxRatePayload) => {
    setTaxRateToDelete(TaxRate)
    setDeleteDialogOpen(true)
  }

  // Handle refresh - wrapped in useCallback
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])



  // Handle form submission (edit or add)
  const onSubmit = async (data: TaxRateFormValues) => {
    try {
      if (!isEditMode || !TaxRateToEdit) {
        // Add new TaxRate
        const { id } = data
        const newTaxRateData = {
          id: crypto.randomUUID(),
          taxRateName: data.taxRateName,
          rate: Number(data.rate) || 0,
          organizationId: organizationId || "",
          createdAt: new Date(),
        }

        createTaxRateMutation.mutate(newTaxRateData, {
          onSuccess: async () => {
            toast.success("TaxRate added successfully")
            setFormDialogOpen(false)
            resetFormToDefaults()
            await refetch()
          },
          onError: (error: any) => {
            toast.error("Failed to add TaxRate", {
              description: error?.message || "Unknown error occurred",
            })
          },
        })
      } else {
        // Edit existing TaxRate
        const updateData = {
          ...data,
          id: TaxRateToEdit.id,
          taxRateName: data.taxRateName,
          rate: Number(data.rate) || Number(TaxRateToEdit.rate),
          createdAt: TaxRateToEdit.createdAt, // Ensure createdAt is included
          organizationId: organizationId || "", // Add organizationId as required
        }

        updateTaxRateMutation.mutate(
          {
            id: TaxRateToEdit.id,
            data: updateData,
          },
          {
            onSuccess: async () => {
              toast.success("TaxRate updated successfully")
              setFormDialogOpen(false)
              resetFormToDefaults()
              await refetch()
            },
            onError: (error: any) => {
              toast.error("Failed to update TaxRate", {
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
  const columns: Column<BriefTaxRatePayload>[] = useMemo(
    () => [

      {
        header: "TaxRate Name",
        accessorKey: "taxRateName",
        cell: (row) => (
          <span className="font-medium">{row.taxRateName.length > 20 ? `${row.taxRateName.substring(0, 20)}...` : row.taxRateName}</span>
        ),
      },
      {
        header: "Rate",
        accessorKey: "rate",
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
    (TaxRateCount: number, totalValue: number) => {
      if (!mounted) return "Loading..."
      return `${TaxRateCount} ${TaxRateCount === 1 ? "TaxRate" : "categories"} | Total Value: ${formatCurrency(totalValue)}`
    },
    [formatCurrency, mounted],
  )

  // If categories is not an array, handle it properly
  const categoriesArray = useMemo(() => {
    return Array.isArray(initialData) ? initialData : initialData || []
  }, [initialData])

  // Handle delete confirmation
  const handleDeleteTaxRateConfirmation = () => {
    if (TaxRateToDelete) {
      deleteTaxRateMutation.mutate(TaxRateToDelete.id, {
        onSuccess: () => {
          toast.success("TaxRate deleted successfully")
          refetch()
        },
        onError: (error: any) => {
          toast.error("Failed to delete TaxRate", {
            description: error?.message || "Unknown error occurred",
          })
        },
      })
      setDeleteDialogOpen(false)
      setTaxRateToDelete(null)
    }
  }

  return (
    <>
      <DataTable<BriefTaxRatePayload>
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
          searchFields: ["taxRateName", "rate"],
          enableDateFilter: true,
          getItemDate: (TaxRate) => TaxRate.createdAt,
        }}
        renderRowActions={(TaxRate) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(TaxRate)}
            onDelete={() => handleDeleteClick(TaxRate)}
            isDeleting={deleteTaxRateMutation.isPending && TaxRateToDelete?.id === TaxRate.id}
          />
        )}
      />

      {/* TaxRate Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title={isEditMode ? "Edit TaxRate" : "New TaxRate"}
        form={form}
        size="lg"

        onSubmit={onSubmit}
        isSubmitting={createTaxRateMutation.isPending || updateTaxRateMutation.isPending}
        submitLabel={isEditMode ? "Save Changes" : "Add TaxRate"}
      >
        <div className="grid md:grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="taxRateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TaxRate Name *</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter TaxRate name"
                      {...field}
                    />

                  </FormControl>
                  <FormDescription>Enter the TaxRate name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate %</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
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
        title="Delete TaxRate"
        description={
          TaxRateToDelete ? (
            <>
              Are you sure you want to delete <strong>{TaxRateToDelete.taxRateName}</strong> ({TaxRateToDelete.rate}) ? This
              action is irreversible.
            </>
          ) : (
            "Are you sure you want to delete this TaxRate?"
          )
        }
        onConfirm={handleDeleteTaxRateConfirmation}
        isConfirming={deleteTaxRateMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}

export default TaxRateForm
