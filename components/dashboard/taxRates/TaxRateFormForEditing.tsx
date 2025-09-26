"use client"

import { Badge } from "@/components/ui/badge"
import { type Column, ConfirmationDialog, DataTable, EntityForm, TableActions } from "@/components/ui/data-table"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCreateTaxRate, useDeleteTaxRate, useUpdateTaxRate } from "@/hooks/taxRateHooks"
import { useOrgTaxRates } from "@/hooks/useAllTaxRateQueries"
import type { BriefTaxRatePayload } from "@/types/taxRates"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Calendar, FileText, Percent, Scale } from "lucide-react"
import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { z } from "zod"

interface TaxRateProps {
  organizationId: string
  title: string
  editingId?: string
  initialData?: BriefTaxRatePayload[]
}

const TaxRateFormSchema = z.object({
  id: z.string().optional(),
  taxRateName: z
    .string()
    .min(1, "Tax rate name is required")
    .max(50, "Tax rate name must be 50 characters or less")
    .regex(/^[a-zA-Z0-9\s\-_()]+$/, "Tax rate name contains invalid characters"),
  rate: z
    .number()
    .min(0, "Rate must be 0 or greater")
    .max(100, "Rate cannot exceed 100%")
    .refine((val) => Number.isFinite(val), "Rate must be a valid number")
    .refine(
      (val) => val.toString().split(".")[1]?.length <= 4 || !val.toString().includes("."),
      "Rate can have at most 4 decimal places",
    ),
})

type TaxRateFormValues = z.infer<typeof TaxRateFormSchema>

const TaxRateFormModern = ({ title, organizationId, editingId, initialData }: TaxRateProps) => {
  const [isPending, startTransition] = useTransition()

  // Hooks - properly initialize mutations
  const { data: taxRatesData, refetch, isLoading, isError, error } = useOrgTaxRates(organizationId)
  const createTaxRateMutation = useCreateTaxRate()
  const updateTaxRateMutation = useUpdateTaxRate()
  const deleteTaxRateMutation = useDeleteTaxRate()

  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taxRateToEdit, setTaxRateToEdit] = useState<BriefTaxRatePayload | null>(null)
  const [taxRateToDelete, setTaxRateToDelete] = useState<BriefTaxRatePayload | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const form = useForm<TaxRateFormValues>({
    resolver: zodResolver(TaxRateFormSchema),
    defaultValues: {
      taxRateName: "",
      rate: 0,
    },
    mode: "onChange", // Real-time validation
  })

  const resetFormToDefaults = useCallback(() => {
    startTransition(() => {
      form.reset({
        taxRateName: "",
        rate: 0,
      })
      setIsEditMode(false)
      setTaxRateToEdit(null)
    })
  }, [form])

  const populateFormWithTaxRate = useCallback(
    (taxRate: BriefTaxRatePayload) => {
      try {
        const formData: TaxRateFormValues = {
          id: taxRate.id,
          taxRateName: taxRate.taxRateName || "",
          rate: Number(taxRate.rate) || 0,
        }

        startTransition(() => {
          form.reset(formData)
          setIsEditMode(true)
          setTaxRateToEdit(taxRate)
        })
      } catch (error) {
        console.error("[v0] Error populating form:", error)
        toast.error("Failed to load tax rate data")
      }
    },
    [form],
  )

  // Update form when dialog state changes
  useEffect(() => {
    if (!formDialogOpen) return

    if (!taxRateToEdit) {
      resetFormToDefaults()
    } else {
      populateFormWithTaxRate(taxRateToEdit)
    }
  }, [formDialogOpen, taxRateToEdit, resetFormToDefaults, populateFormWithTaxRate])

  const handleFormDialogClose = useCallback(
    (open: boolean) => {
      setFormDialogOpen(open)
      if (!open) {
        // Cleanup with slight delay to prevent visual glitches
        setTimeout(() => {
          resetFormToDefaults()
        }, 150)
      }
    },
    [resetFormToDefaults],
  )

  const formatDate = useCallback((date: Date | string | null | undefined) => {
    if (!date) return "N/A"

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "Invalid Date"
      return format(dateObj, "MMM dd, yyyy")
    } catch (error) {
      console.error("[v0] Date formatting error:", error)
      return "Invalid Date"
    }
  }, [])

  const handleExport = useCallback(
    async (filteredTaxRates: BriefTaxRatePayload[]) => {
      try {
        if (filteredTaxRates.length === 0) {
          toast.warning("No tax rates to export")
          return
        }

        // Show loading toast
        const loadingToast = toast.loading("Preparing export...")

        // Prepare data for export with enhanced formatting
        const exportData = filteredTaxRates.map((taxRate, index) => ({
          "#": index + 1,
          "Tax Rate Name": taxRate.taxRateName || "N/A",
          "Rate (%)": Number(taxRate.rate || 0).toFixed(4),
          "Date Added": formatDate(taxRate.createdAt),
          "Last Modified": formatDate(taxRate.updatedAt),
          ID: taxRate.id,
        }))

        // Create workbook and worksheet with styling
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()

        // Set column widths
        worksheet["!cols"] = [
          { wch: 5 }, // #
          { wch: 25 }, // Tax Rate Name
          { wch: 12 }, // Rate (%)
          { wch: 15 }, // Date Added
          { wch: 15 }, // Last Modified
          { wch: 20 }, // ID
        ]

        XLSX.utils.book_append_sheet(workbook, worksheet, "Tax Rates")

        // Generate filename with current date and organization
        const fileName = `TaxRates_${organizationId.slice(0, 8)}_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`

        // Export to file
        XLSX.writeFile(workbook, fileName)

        // Dismiss loading toast and show success
        toast.dismiss(loadingToast)
        toast.success("Export successful", {
          description: `${filteredTaxRates.length} tax rates exported to ${fileName}`,
        })
      } catch (error) {
        console.error("[v0] Export error:", error)
        toast.error("Export failed", {
          description: error instanceof Error ? error.message : "Unknown error occurred during export",
        })
      }
    },
    [formatDate, organizationId],
  )

  const handleAddClick = useCallback(() => {
    startTransition(() => {
      setTaxRateToEdit(null)
      setIsEditMode(false)
      setFormDialogOpen(true)
    })
  }, [])

  const handleEditClick = useCallback((taxRate: BriefTaxRatePayload) => {
    startTransition(() => {
      setTaxRateToEdit(taxRate)
      setIsEditMode(true)
      setFormDialogOpen(true)
    })
  }, [])

  const handleDeleteClick = useCallback((taxRate: BriefTaxRatePayload) => {
    startTransition(() => {
      setTaxRateToDelete(taxRate)
      setDeleteDialogOpen(true)
    })
  }, [])

  const handleRefresh = useCallback(async () => {
    try {
      const refreshToast = toast.loading("Refreshing tax rates...")
      await refetch()
      setLastRefresh(new Date())
      toast.dismiss(refreshToast)
      toast.success("Tax rates refreshed successfully")
    } catch (error) {
      console.error("[v0] Refresh error:", error)
      toast.error("Failed to refresh tax rates", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }, [refetch])

  const onSubmit = async (data: TaxRateFormValues) => {
    try {
      // Additional client-side validation
      if (!data.taxRateName.trim()) {
        toast.error("Tax rate name cannot be empty")
        return
      }

      if (data.rate < 0 || data.rate > 100) {
        toast.error("Tax rate must be between 0% and 100%")
        return
      }

      const submitToast = toast.loading(isEditMode ? "Updating tax rate..." : "Adding tax rate...")

      if (!isEditMode) {
        // Add new tax rate
        await createTaxRateMutation.mutateAsync({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          taxRateName: data.taxRateName.trim(),
          rate: Number(data.rate),
          organizationId,
        })
        toast.dismiss(submitToast)
        toast.success("Tax rate added successfully", {
          description: `${data.taxRateName} (${data.rate}%) has been added`,
        })
      } else {
        // Edit existing tax rate
        if (!taxRateToEdit?.id) {
          throw new Error("No tax rate selected for editing")
        }

        await updateTaxRateMutation.mutateAsync({
          id: taxRateToEdit.id,
          data: {
            id: taxRateToEdit.id,
            createdAt: taxRateToEdit.createdAt,
            organizationId: organizationId,
            taxRateName: data.taxRateName.trim(),
            rate: Number(data.rate),
          },
        })
        toast.dismiss(submitToast)
        toast.success("Tax rate updated successfully", {
          description: `${data.taxRateName} has been updated`,
        })
      }

      setFormDialogOpen(false)
      resetFormToDefaults()
      await refetch()
    } catch (error) {
      console.error("[v0] Form submission error:", error)
      toast.error(isEditMode ? "Failed to update tax rate" : "Failed to add tax rate", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }

  const columns: Column<BriefTaxRatePayload>[] = useMemo(
    () => [
      {
        header: "Tax Rate Name",
        accessorKey: "taxRateName",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium" title={row.taxRateName}>
              {row.taxRateName && row.taxRateName.length > 25
                ? `${row.taxRateName.substring(0, 25)}...`
                : row.taxRateName || "N/A"}
            </span>
          </div>
        ),
      },
      {
        header: "Rate",
        accessorKey: "rate",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="font-mono">
              {Number(row.rate || 0).toFixed(2)}%
            </Badge>
          </div>
        ),
      },
      {
        header: "Date Added",
        accessorKey: "createdAt",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>
          </div>
        ),
      },
    ],
    [formatDate],
  )

  const taxRatesArray = useMemo(() => {
    try {
      const dataToUse = taxRatesData || initialData || []
      const validData = Array.isArray(dataToUse) ? dataToUse : []

      // Sort by creation date (newest first)
      return validData.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      })
    } catch (error) {
      console.error("[v0] Data processing error:", error)
      return []
    }
  }, [taxRatesData, initialData])

  const getSubtitle = useCallback(
    (taxRateCount: number) => {
      if (isLoading) return "Loading tax rates..."
      if (isError) return `Error loading tax rates: ${error?.message || "Unknown error"}`

      const lastRefreshText = `Last updated: ${format(lastRefresh, "HH:mm:ss")}`
      return `${taxRateCount} ${taxRateCount === 1 ? "tax rate" : "tax rates"} • ${lastRefreshText}`
    },
    [isLoading, isError, error, lastRefresh],
  )

  const handleDeleteTaxRateConfirmation = async () => {
    if (!taxRateToDelete) return

    try {
      const deleteToast = toast.loading("Deleting tax rate...")

      await deleteTaxRateMutation.mutateAsync(taxRateToDelete.id)

      toast.dismiss(deleteToast)
      toast.success("Tax rate deleted successfully", {
        description: `${taxRateToDelete.taxRateName} has been removed`,
      })

      await refetch()
      setDeleteDialogOpen(false)
      setTaxRateToDelete(null)
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast.error("Failed to delete tax rate", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }

  return (
    <>
      <DataTable<BriefTaxRatePayload>
        title={title}
        subtitle={getSubtitle(taxRatesArray.length)}
        data={taxRatesArray}
        columns={columns}
        keyField="id"
        onRefresh={handleRefresh}
        isLoading={isLoading || isPending}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["taxRateName"],
          enableDateFilter: true,
          getItemDate: (taxRate) => taxRate.createdAt,
        }}
        renderRowActions={(taxRate) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(taxRate)}
            onDelete={() => handleDeleteClick(taxRate)}
            isDeleting={deleteTaxRateMutation.isPending && taxRateToDelete?.id === taxRate.id}
          />
        )}
      />

      <EntityForm<TaxRateFormValues>
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title={isEditMode ? "Edit Tax Rate" : "New Tax Rate"}
        form={form}
        size="lg"
        onSubmit={onSubmit}
        isSubmitting={createTaxRateMutation.isPending || updateTaxRateMutation.isPending}
        submitLabel={isEditMode ? "Save Changes" : "Add Tax Rate"}
      >
        <div className="grid md:grid-cols-12 gap-6">
          <div className="col-span-7">
            <FormField
              control={form.control}
              name="taxRateName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Tax Rate Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., VAT, Sales Tax, GST"
                      maxLength={50}
                      {...field}
                      aria-describedby="taxRateName-description"
                    />
                  </FormControl>
                  <FormDescription id="taxRateName-description">
                    Enter a descriptive name for this tax rate (max 50 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-5">
            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Rate (%) *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.0001"
                        min="0"
                        max="100"
                        placeholder="0.0000"
                        className="pl-10"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === "" ? 0 : Number.parseFloat(value))
                        }}
                        aria-describedby="rate-description"
                      />
                    </div>
                  </FormControl>
                  <FormDescription id="rate-description">
                    Enter the tax rate percentage (0-100%, up to 4 decimal places)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </EntityForm>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Tax Rate"
        description={
          taxRateToDelete ? (
            <div className="space-y-2">
              <p>
                Are you sure you want to delete{" "}
                <strong className="text-foreground">{taxRateToDelete.taxRateName}</strong> (
                {Number(taxRateToDelete.rate || 0).toFixed(2)}%)?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone and may affect existing transactions.
              </p>
            </div>
          ) : (
            "Are you sure you want to delete this tax rate?"
          )
        }
        onConfirm={handleDeleteTaxRateConfirmation}
        isConfirming={deleteTaxRateMutation.isPending}
        confirmLabel="Delete Tax Rate"
        variant="destructive"
      />
    </>
  )
}

export default TaxRateFormModern
