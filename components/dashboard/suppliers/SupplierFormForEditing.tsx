// components/ui/groups/supplier-listing-suspense.tsx
"use client";

import {
  Column,
  ConfirmationDialog,
  DataTable,
  EntityForm,
  TableActions,
} from "@/components/ui/data-table";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { useCreateASupplier, useDeleteASupplier, useOrgSuppliers, useUpdateSupplier } from "@/hooks/useAllSupplierQueries";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSupplier } from "@/hooks/supplierHooks/useCreateSupplier";
import { useDeleteSupplier } from "@/hooks/supplierHooks/useDeleteSupplier";
import { useUpdateSupplier } from "@/hooks/supplierHooks/useUpdateSupplier";
import { useOrgSuppliers } from "@/hooks/useAllSupplierQueries";
import { SupplierDTO } from "@/types/supplier";
import { TaxRateDTO } from "@/types/taxRates";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { z } from "zod";
import { useNotifications } from "@/components/notifications/NotificationProvider";

interface SupplierDetailProps {
  title: string;
  editingId: string;
  organizationId: string;
  initialData?: SupplierDTO[];
  initialTaxRateData: TaxRateDTO[]

}

// Form schema for editing/adding suppliers
const supplierFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().min(1, "Name is required").optional(),
  createdAt: z.date().optional(),
  organizationId: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.number().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional()
})


type SupplierFormValues = z.infer<typeof supplierFormSchema>;

const SupplierFormForEditing = ({ title, organizationId, editingId, initialData, initialTaxRateData }: SupplierDetailProps) => {
  // Ensure organizationId is provided
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch suppliers");
  }

  console.log({ initialData })

  // Use custom hook to fetch suppliers
  const { refetch } = useOrgSuppliers(organizationId);
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();
  const { formSuccess, formError, operationStart } = useNotifications();

  // Local state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [supplierToEdit, setSupplierToEdit] = useState<SupplierDTO | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierDTO | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const taxRateOptions = initialTaxRateData?.map(taxRate => {
    return {
      label: taxRate.taxRateName,
      value: taxRate.id
    }
  })

  // Form for editing/adding suppliers
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      organizationId: "",
    },
  });

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      name: "",
      contactPerson: "",
      organizationId: organizationId,
    });
    setIsEditMode(false);
    setSupplierToEdit(null);
  }, [form, organizationId]);

  // Function to populate form with supplier data
  const populateFormWithSupplier = useCallback((supplier: SupplierDTO) => {
    const formData = {
      id: supplier.id,
      name: supplier.name || "",
      contactPerson: supplier.contactPerson || "",
      organizationId: organizationId,
    };

    form.reset(formData);
    setIsEditMode(true);
    setSupplierToEdit(supplier);
  }, [form, organizationId]);

  // Update form when dialog state changes
  useEffect(() => {
    if (!formDialogOpen) {
      return;
    }

    if (!supplierToEdit) {
      resetFormToDefaults();
    } else {
      populateFormWithSupplier(supplierToEdit);
    }
  }, [formDialogOpen, supplierToEdit, resetFormToDefaults, populateFormWithSupplier]);

  // Handle form dialog close
  const handleFormDialogClose = (open: boolean) => {
    setFormDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        resetFormToDefaults();
      }, 150);
    }
  };

  // Format date function - memoized and with consistent formatting
  const formatDate = useCallback((date: Date | string) => {
    if (!mounted) return ""; // Prevent hydration mismatch

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      // Use a consistent date format to avoid locale issues
      return format(dateObj, "MMM dd, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  }, [mounted]);

  // Format currency - memoized and with consistent formatting
  const formatCurrency = useCallback((amount: number) => {
    if (!mounted) return ""; // Prevent hydration mismatch

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "XAF",
        minimumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `${amount} XAF`;
    }
  }, [mounted]);

  // Export to Excel - wrapped in useCallback to prevent recreation
  const handleExport = useCallback((filteredSuppliers: SupplierDTO[]) => {
    if (!mounted) return;

    try {
      // Prepare data for export
      const exportData = filteredSuppliers.map((supplier) => ({
        Name: supplier.name,
        contactPerson: supplier.contactPerson || "",
        "Date Added": formatDate(supplier.createdAt),
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");

      // Generate filename with current date
      const fileName = `Suppliers_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      // Export to file
      XLSX.writeFile(workbook, fileName);

      formSuccess("Export Successful", `Suppliers exported to ${fileName}`);
    } catch (error) {
      formError(
        "Export Failed",
        "Failed to export suppliers",
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }, [formatDate, mounted]);

  // Handle add new click
  const handleAddClick = () => {
    setSupplierToEdit(null);
    setIsEditMode(false);
    setFormDialogOpen(true);
  };

  const router = useRouter();

  // Handle edit click
  const handleEditClick = (supplier: SupplierDTO) => {
    console.log("Editing supplier:", supplier);
    setSupplierToEdit(supplier);
    setIsEditMode(true);
    setFormDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (supplier: SupplierDTO) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  // Handle refresh - wrapped in useCallback
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle form submission (edit or add)
  const onSubmit = async (data: SupplierFormValues) => {
    const operationId = operationStart(isEditMode ? "Updating Supplier" : "Creating Supplier");

    try {
      if (!isEditMode || !supplierToEdit) {
        // Add new supplier - avoid crypto.randomUUID() for hydration consistency
        const { id, ...rest } = data;
        const newSupplierData = {
          id: `supplier_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // More predictable ID generation
          ...rest,
          name: data.name,
          contactPerson: supplierToEdit?.contactPerson || "",
          organizationId: organizationId || "",
          createdAt: new Date(),
        };

        createSupplierMutation.mutate(
          newSupplierData,
          {
            onSuccess: async () => {
              formSuccess("Supplier Created", `Supplier "${data.name}" has been successfully added to the system`);
              setFormDialogOpen(false);
              resetFormToDefaults();
              await refetch();
            },
            onError: (error: any) => {
              formError(
                "Failed to Create Supplier",
                "Could not add the new supplier",
                error?.message || "An unexpected error occurred"
              );
            },
          }
        );
      } else {
        // Edit existing supplier
        const updateData = {
          ...data,
          id: supplierToEdit.id,
          name: data.name,
          contactPerson: data.contactPerson ?? data.name.toLowerCase().replace(/\s+/g, "-"),
          createdAt: data.createdAt ?? new Date(supplierToEdit.createdAt ?? Date.now()),
          organizationId: organizationId || "",
        };

        updateSupplierMutation.mutate(
          {
            id: supplierToEdit.id,
            data: updateData,
          },
          {
            onSuccess: async () => {
              formSuccess("Supplier Updated", `Supplier "${data.name}" information has been successfully updated`);
              setFormDialogOpen(false);
              resetFormToDefaults();
              await refetch();
            },
            onError: (error: any) => {
              formError(
                "Failed to Update Supplier",
                "Could not save the supplier changes",
                error?.message || "An unexpected error occurred"
              );
            },
          }
        );
      }
    } catch (error) {
      formError(
        "Unexpected Error",
        "An unexpected error occurred while processing the supplier",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  // Define columns for the data table - memoized to prevent recreation
  const columns: Column<SupplierDTO>[] = useMemo(() => [
    {
      header: "Supplier Name",
      accessorKey: "name",
      cell: (row) => (
        <span className="font-medium">
          {row.name.length > 20 ? `${row.name.substring(0, 20)}...` : row.name}
        </span>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contactPerson",
    },
    {
      header: "Date Added",
      accessorKey: (row) => formatDate(row.createdAt),
    },
  ], [formatDate]);

  // Generate subtitle with total value
  const getSubtitle = useCallback((supplierCount: number, totalValue: number) => {
    if (!mounted) return "Loading...";
    return `${supplierCount} ${supplierCount === 1 ? "supplier" : "suppliers"} | Total Value: ${formatCurrency(totalValue)}`;
  }, [formatCurrency, mounted]);

  // If suppliers is not an array, handle it properly
  const suppliersArray = useMemo(() => {
    return Array.isArray(initialData) ? initialData : initialData || [];
  }, [initialData]);

  // Handle delete confirmation
  const handleDeleteSupplierConfirmation = () => {
    if (supplierToDelete) {
      const operationId = operationStart("Deleting Supplier");

      deleteSupplierMutation.mutate(supplierToDelete.id, {
        onSuccess: () => {
          formSuccess("Supplier Deleted", `Supplier "${supplierToDelete.name}" has been permanently removed from the system`);
          refetch();
        },
        onError: (error: any) => {
          formError(
            "Failed to Delete Supplier",
            "Could not remove the supplier",
            error?.message || "An unexpected error occurred"
          );
        }
      });
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };


  return (
    <>
      <DataTable<SupplierDTO>
        title={title}
        subtitle={"Sleak Modifications"}
        data={suppliersArray}
        columns={columns}
        keyField="id"
        onRefresh={handleRefresh}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "contactPerson"],
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

      {/* Supplier Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title={isEditMode ? "Edit Supplier" : "Add New Supplier"}
        form={form}
        size="lg"
        onSubmit={onSubmit}
        isSubmitting={createSupplierMutation.isPending || updateSupplierMutation.isPending}
        submitLabel={isEditMode ? "Save Changes" : "Add Supplier"}
      >
        <div className="grid md:grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier name *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the supplier name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier contact person</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter contact person</FormDescription>
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
                  <FormLabel>Supplier contact person Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter contact person Email</FormDescription>
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
                  <FormLabel>Supplier contact person phone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        className="pl-8"
                        {...field}
                      // onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter contact person phone</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Notes</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter Any notes</FormDescription>
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
                  <FormLabel>Supplier  Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        className="pl-8"
                        rows={5}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter supplier address</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-6">

            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {
                            taxRateOptions.map((taxRate) =>
                            (
                              <SelectItem key={taxRate.value} value={taxRate.value}>{taxRate.label}</SelectItem>
                            ))
                          }
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div >
      </EntityForm >

      {/* Delete Confirmation Dialog */}
      < ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Supplier"
        description={
          supplierToDelete ? (
            <>
              Are you sure you want to delete {" "}
              <strong> {supplierToDelete.name}</strong> {" "}
              ({supplierToDelete.contactPerson}) ? This action is irreversible.
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
  );
};

export default SupplierFormForEditing;