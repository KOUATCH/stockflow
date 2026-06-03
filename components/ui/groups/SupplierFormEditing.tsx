"use client"

import { notify } from "@/lib/notifications/notify"
import SupplierFormForEditingReal from "@/components/dashboard/suppliers/SupplierFormForEditingReal"
import { type Column, ConfirmationDialog, DataTable, TableActions } from "@/components/ui/data-table"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCreateSupplier, } from "@/hooks/supplierHooks"
import { useDeleteSupplier, useOrgSuppliers, useUpdateSupplier } from "@/hooks/useAllSupplierQueries"

import type { SupplierDTO } from "@/types/supplier"
import { TaxRateDTO } from "@/types/taxRates"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { DollarSign, Mail, MapPin, Phone, User } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import * as XLSX from "xlsx"
import { z } from "zod"

interface SupplierDetailProps {
  title: string
  editingId: string
  organizationId: string
  initialSupplierData: SupplierDTO[] | undefined
  initialTaxRateData: TaxRateDTO[]
}

// Form schema for adding new suppliers
const supplierFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Supplier name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  paymentTerms: z.number().min(0, "Payment terms must be positive").optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
  organizationId: z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>

const SupplierFormEditing = ({
  title,
  organizationId,
  editingId,
  initialSupplierData,
  initialTaxRateData
}: SupplierDetailProps) => {
  // Validate organizationId
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch suppliers")
  }

  // Hooks
  const { refetch } = useOrgSuppliers(organizationId)
  const createSupplierMutation = useCreateSupplier()
  const updateSupplierMutation = useUpdateSupplier()
  const deleteSupplierMutation = useDeleteSupplier()

  // State management
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [comprehensiveFormOpen, setComprehensiveFormOpen] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToEdit, setSupplierToEdit] = useState<SupplierDTO | null>(null)
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierDTO | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Ensure we have an array of suppliers
  const suppliersArray = Array.isArray(initialSupplierData) ? initialSupplierData : []

  // Form setup
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      paymentTerms: 0,
      address: "",
      phone: "",
      notes: "",
      isActive: true,
      organizationId: organizationId,
    },
  })

  // Reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      name: "",
      contactPerson: "",
      email: "",
      paymentTerms: 0,
      address: "",
      phone: "",
      notes: "",
      isActive: true,
      organizationId: organizationId,
    })
    setSupplierToEdit(null)
    setIsEditMode(false)
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

  // Handle comprehensive form close
  const handleComprehensiveFormClose = (open: boolean) => {
    setComprehensiveFormOpen(open)
    if (!open) {
      setTimeout(() => {
        setSupplierToEdit(null)
        setIsEditMode(false)
      }, 150)
    }
  }

  // Utility functions
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, "MMM dd, yyyy")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Export functionality
  const handleExport = useCallback((filteredSuppliers: SupplierDTO[]) => {
    try {
      const exportData = filteredSuppliers.map((supplier) => ({
        Name: supplier.name,
        Contact: supplier.contactPerson || "",
        Email: supplier.email || "",
        Phone: supplier.phone || "",
        Address: supplier.address || "",
        "Payment Terms": supplier.paymentTerms || 0,
        "Date Added": formatDate(supplier.createdAt),
        Status: supplier.isActive ? "Active" : "Inactive",
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

  // Action handlers
  const handleAddClick = () => {
    console.log("Opening add supplier form")
    setSupplierToEdit(null)
    setIsEditMode(false)
    resetFormToDefaults()
    setFormDialogOpen(true)
  }

  const handleEditClick = (supplier: SupplierDTO) => {
    console.log("Opening comprehensive edit form for:", supplier)
    console.log("Current comprehensiveFormOpen state:", comprehensiveFormOpen)

    // Set the supplier to edit
    setSupplierToEdit(supplier)
    setIsEditMode(true)

    // Force open the comprehensive form
    setComprehensiveFormOpen(true)

    // Log state after setting
    console.log("After setting - supplierToEdit:", supplier)
    console.log("After setting - isEditMode:", true)
  }

  const handleDeleteClick = (supplier: SupplierDTO) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Form submission for new supplier
  const onSubmit = async (data: SupplierFormValues) => {
    try {
      const newSupplierData = {
        id: crypto.randomUUID(),
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        paymentTerms: data.paymentTerms || 0,
        notes: data.notes || null,
        isActive: data.isActive ?? true,
        organizationId: organizationId,
        createdAt: new Date(),
      }

      await createSupplierMutation.mutateAsync(newSupplierData, {
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

  // Delete confirmation handler
  const handleDeleteSupplierConfirmation = async () => {
    if (supplierToDelete) {
      try {
        await deleteSupplierMutation.mutateAsync(supplierToDelete.id, {
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
      } catch (error) {
        notify.error("Delete failed", {
          description: error instanceof Error ? error.message : "Unknown error",
        })
      } finally {
        setDeleteDialogOpen(false)
        setSupplierToDelete(null)
      }
    }
  }

  // Table columns configuration
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
            : "N/A"}
        </span>
      ),
    },
    {
      header: "Contact Person",
      accessorKey: "contactPerson",
      cell: (row) => (
        <span>{row?.contactPerson || "N/A"}</span>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row?.email || "N/A"}
        </span>
      ),
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (row) => (
        <span className="text-sm">{row?.phone || "N/A"}</span>
      ),
    },
    {
      header: "Address",
      accessorKey: "address",
      cell: (row) => {
        const address = row?.address || "";
        return (
          <span className="text-sm">
            {address.length > 30 ? `${address.substring(0, 30)}...` : address || "N/A"}
          </span>
        );
      },
    },
    {
      header: "Payment Terms",
      accessorKey: "paymentTerms",
      cell: (row) => (
        <span>{row?.paymentTerms ? `${row.paymentTerms} days` : "N/A"}</span>
      ),
    },
    {
      header: "Notes",
      accessorKey: "notes",
      cell: (row) => {
        const notes = row?.notes || "";
        return (
          <span className="text-sm text-muted-foreground">
            {notes.length > 30 ? `${notes.substring(0, 30)}...` : notes || "N/A"}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${row?.isActive
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
          }`}>
          {row?.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Date Added",
      accessorKey: "createdAt",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ]

  // Subtitle generation
  const getSubtitle = useCallback((supplierCount: number) => {
    return `${supplierCount} ${supplierCount === 1 ? "supplier" : "suppliers"}`
  }, [])

  // Debug effect for comprehensive form
  useEffect(() => {
    console.log("Comprehensive form state changed:", {
      comprehensiveFormOpen,
      supplierToEdit,
      isEditMode
    })
  }, [comprehensiveFormOpen, supplierToEdit, isEditMode])

  return (
    <>
      <DataTable<SupplierDTO>
        title="Suppliers Information"
        subtitle={getSubtitle(suppliersArray.length)}
        data={suppliersArray}
        columns={columns}
        keyField="id"
        onRefresh={handleRefresh}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "email", "phone", "contactPerson"],
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

      {/* Add New Supplier Form Dialog */}
      {formDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => handleFormDialogClose(false)} />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Add New Supplier</h2>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier Name *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Enter supplier name" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>Enter the name of the supplier</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Enter contact person" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>Enter the contact person's name</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="Enter email address"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Enter the supplier's email address</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="Enter phone number"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Enter the supplier's phone number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Enter address"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Enter the supplier's address</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms (Days)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="30"
                              className="pl-10"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Enter payment terms in days</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter additional notes"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Enter any additional notes about the supplier</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => handleFormDialogClose(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSupplierMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createSupplierMutation.isPending ? "Adding..." : "Add Supplier"}
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}

      {/* Comprehensive Edit Form Dialog */}
      <SupplierFormForEditingReal
        title="Edit Supplier"
        open={comprehensiveFormOpen}
        onOpenChange={handleComprehensiveFormClose}
        supplierData={supplierToEdit}
        onSuccess={() => {
          refetch()
          setComprehensiveFormOpen(false)
          setSupplierToEdit(null)
          setIsEditMode(false)
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
              Are you sure you want to delete <strong>{supplierToDelete.name}</strong>
              {supplierToDelete.email && (
                <> ({supplierToDelete.email})</>
              )}? This action cannot be undone.
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

export default SupplierFormEditing