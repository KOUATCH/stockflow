"use client"

import { notify } from "@/lib/notifications/notify"
import SupplierFormForEditingReal from "@/components/dashboard/suppliers/SupplierFormForEditingReal"
import { type Column, ConfirmationDialog, DataTable, EntityForm, TableActions } from "@/components/ui/data-table"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/supplierHooks"
import { useDeleteSupplier, useOrgSuppliers } from "@/hooks/useAllSupplierQueries"

import type { SupplierDTO } from "@/types/supplier"
import { TaxRateDTO } from "@/types/taxRates"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { DollarSign } from "lucide-react"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import * as XLSX from "xlsx"
import { z } from "zod"



interface SupplierDetailProps {
  title: string
  editingId: string
  organizationId: string
  initialSupplierData: SupplierDTO[] | undefined
  initialTaxRateData: TaxRateDTO[]
}

// Simple form schema for adding new suppliers (basic fields only)
const supplierFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  paymentTerms: z.number().min(0, "Selling price must be positive"),
  createdAt: z.date().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
  organizationId: z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>

const SupplierListingWithEditing = ({
  title,
  organizationId,
  editingId,
  initialSupplierData,
  initialTaxRateData

}: SupplierDetailProps) => {

  // Ensure organizationId is provided
  console.log(organizationId)
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch suppliers")
  }

  console.log({ initialTaxRateData })
  // Use custom hook to fetch suppliers
  const { refetch } = useOrgSuppliers(organizationId)
  const createSupplierMutation = useCreateSupplier()
  const updateSupplierMutation = useUpdateSupplier()
  const deleteSupplierMutation = useDeleteSupplier()

  // Local state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [comprehensiveFormOpen, setComprehensiveFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToEdit, setSupplierToEdit] = useState<SupplierDTO | null>(null)
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierDTO | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const suppliersArray = Array.isArray(initialSupplierData) ? initialSupplierData : initialSupplierData || []




  // Form for adding new suppliers (simple form)
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      email: "",
      paymentTerms: 0,
      // createdAt: Date(),
      address: "",
      phone: "",
      notes: "",
      isActive: true,
      organizationId: organizationId,
    },
  })

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      name: "",
      email: "",
      paymentTerms: 0,
      // createdAt: Date(),
      address: "",
      phone: "",
      notes: "",
      isActive: true,
      organizationId: organizationId,
    })

    setSupplierToEdit(null)
  }, [form, organizationId])

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
  const handleExport = useCallback((filteredSuppliers: SupplierDTO[]) => {
    try {
      const exportData = filteredSuppliers.map((supplier) => ({
        Name: supplier.name,
        Contact: supplier.contactPerson,
        Email: supplier.email,
        "Date Added": formatDate(supplier.createdAt),
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers")

      const fileName = `Suppliers_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      XLSX.writeFile(workbook, fileName)

      notify.success("Export successful", {
        description: `Suppliers exported to ${fileName}`,
      })
    } catch (error) {
      notify.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }, [])

  // Handle add new click (simple form)
  const handleAddClick = () => {
    setSupplierToEdit(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit click (comprehensive form)
  const handleEditClick = (supplier: SupplierDTO) => {
    console.log("Opening comprehensive edit form for:", supplier)

    setSupplierToEdit(supplier)
    setIsEditMode(true)
    setComprehensiveFormOpen(true)
  }


  // Handle delete click
  const handleDeleteClick = (supplier: SupplierDTO) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle form submission (add new supplier only)
  const onSubmit = async (data: SupplierFormValues) => {
    try {
      const { id, ...rest } = data
      const newSupplierData = {
        id: crypto.randomUUID(),
        ...rest,
        organizationId: organizationId || "",
        createdAt: new Date(),
        paymentTerms: Number(data.paymentTerms) || 0,
        // contactPerson: data.contactPerson,
        // email: data.email,
        // address: data.address,
        // phone: data.phone,
        // notes: data.notes,
      }

      createSupplierMutation.mutateAsync(newSupplierData, {
        onSuccess: async () => {
          notify.success("Supplier added successfully")
          setFormDialogOpen(false)
          resetFormToDefaults()
          await refetch()
        },
        onError: (error: any) => {
          notify.error("Failed to add supplier", {
            description: error?.message || "Unknown error occurred",
          })
        },
      })
    } catch (error) {
      notify.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }



  // Define columns for the data table
  const columns: Column<SupplierDTO>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (row) => (
        <span className="font-medium">
          {row?.name
            ? row.name.length > 20
              ? `${row.name.substring(0, 20)}...`
              : row.name
            : ""}
        </span>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contactPerson",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Address",
      accessorKey: "address",
    },
    {
      header: "Payment terms",
      accessorKey: "paymentTerms",
    },
    {
      header: "Notes",
      accessorKey: "notes",
      cell: (row) => {
        const desc = row.notes ?? "";
        return <span className="font-medium">{desc.length > 30 ? `${desc.substring(0, 50)}...` : desc}</span>;
      },

    },


    {
      header: "Phone",
      accessorKey: (row: SupplierDTO) => Number(row.phone) || 0,
    },

    {
      header: "Date Added",
      accessorKey: (row) => formatDate(row.createdAt),
    },
  ]

  // Generate subtitle with total value
  const getSubtitle = useCallback((supplierCount: number, totalValue: number) => {
    return `${supplierCount} ${supplierCount === 1 ? "supplier" : "suppliers"} | Total Value: ${formatCurrency(totalValue)}`
  }, [])


  // Handle delete confirmation
  const handleDeleteSupplierConfirmation = () => {
    if (supplierToDelete) {
      deleteSupplierMutation.mutate(supplierToDelete.id!, {
        onSuccess: () => {
          notify.success("Supplier deleted successfully")
          refetch()
        },
        onError: (error: any) => {
          notify.error("Failed to delete supplier", {
            description: error?.message || "Unknown error occurred",
          })
        },
      })
      setDeleteDialogOpen(false)
      setSupplierToDelete(null)
    }
  }

  return (
    <>
      <DataTable<SupplierDTO>
        title={"Suppliers Information"}
        subtitle={"Take it easy"}
        // subtitle={suppliersArray.length > 0 ? getSubtitle(suppliersArray.length, 0) : "No suppliers found"}
        data={suppliersArray}
        columns={columns}
        keyField="id"
        onRefresh={handleRefresh}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "email", "phone"],
          enableDateFilter: true,
          getItemDate: (supplier) => supplier.createdAt,
        }}
        renderRowActions={(supplier) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(supplier)}
            onDelete={() => handleDeleteClick(supplier)}
            isDeleting={deleteSupplierMutation.isPending && supplierToDelete?.id === supplier.id}
          />
        )}
      />

      {/* Simple Add Supplier Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title="New Supplier"
        form={form}
        size="lg"
        onSubmit={onSubmit}
        isSubmitting={createSupplierMutation.isPending}
        submitLabel="Add New Supplier"
      >
        <div className="grid md:grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
                  </FormControl>
                  <FormDescription>Enter the name of the supplier</FormDescription>
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
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="0"
                        className="pl-8"
                        {...field}
                      // onChange={(e) => {
                      //   const value = e.target.value === "" ? 0 : Number(e.target.value)
                      //   field.onChange(value)
                      // }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the supplier Email</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="0"
                        className="pl-8"
                        {...field}
                      // onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the supplier  contact Person</FormDescription>
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
                  <FormLabel>address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="0"
                        className="pl-8"
                        {...field}
                      // onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the supplier selling price in XAF</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

      </EntityForm>

      {/* Comprehensive Edit Form Dialog */}
      <SupplierFormForEditingReal
        title={"Supplier Editing"}
        open={comprehensiveFormOpen}
        onOpenChange={setComprehensiveFormOpen}
        supplierData={supplierToEdit}
        onSuccess={() => {
          refetch()
          setComprehensiveFormOpen(false)
        }}
        initialTaxRateData={initialTaxRateData}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Supplier"
        description={
          supplierToDelete ? (
            <>
              Are you sure you want to delete <strong>{supplierToDelete.name}</strong> ({supplierToDelete.email})? This action is
              irreversible.
            </>
          ) : (
            "Are you sure you want to delete this supplier?"
          )
        }
        onConfirm={handleDeleteSupplierConfirmation}
        isConfirming={deleteSupplierMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}

export default SupplierListingWithEditing
