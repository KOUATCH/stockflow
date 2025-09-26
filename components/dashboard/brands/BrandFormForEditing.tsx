// components/ui/groups/item-listing-suspense.tsx
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
import { useCreateABrand, useDeleteABrand, useOrgBrands, useUpdateBrand } from "@/hooks/useAllBrandQueries";
import { BriefBrandPayload } from "@/types/brand";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { z } from "zod";
import { generateSlug } from '../../../lib/generateSlug';
import { useNotifications } from "@/components/notifications/NotificationProvider";

interface BrandDetailProps {
  title: string;
  editingId: string;
  organizationId: string;
  initialData?: BriefBrandPayload[];
}

// Form schema for editing/adding items
const itemFormSchema = z.object({
  id: z.string().optional(),
  brandName: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  createdAt: z.date().optional(),
  organizationId: z.string().optional(),
});

type BrandFormValues = z.infer<typeof itemFormSchema>;

const BrandFormForEditing = ({ title, organizationId, editingId, initialData }: BrandDetailProps) => {
  // Ensure organizationId is provided
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch items");
  }

  console.log({ initialData })

  // Use custom hook to fetch items
  const { refetch } = useOrgBrands(organizationId);
  const createBrandMutation = useCreateABrand();
  const updateBrandMutation = useUpdateBrand();
  const deleteBrandMutation = useDeleteABrand();
  const { formSuccess, formError, operationStart } = useNotifications();

  // Local state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [itemToEdit, setBrandToEdit] = useState<BriefBrandPayload | null>(null);
  const [itemToDelete, setBrandToDelete] = useState<BriefBrandPayload | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form for editing/adding items
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      brandName: "",
      slug: "",
      organizationId: "",
    },
  });

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      brandName: "",
      slug: "",
      organizationId: organizationId,
    });
    setIsEditMode(false);
    setBrandToEdit(null);
  }, [form, organizationId]);

  // Function to populate form with item data
  const populateFormWithBrand = useCallback((item: BriefBrandPayload) => {
    const formData = {
      id: item.id,
      brandName: item.brandName || "",
      slug: item.slug || item.brandName?.toLowerCase().replace(/\s+/g, "-") || "",
      organizationId: organizationId,
    };

    form.reset(formData);
    setIsEditMode(true);
    setBrandToEdit(item);
  }, [form, organizationId]);

  // Update form when dialog state changes
  useEffect(() => {
    if (!formDialogOpen) {
      return;
    }

    if (!itemToEdit) {
      resetFormToDefaults();
    } else {
      populateFormWithBrand(itemToEdit);
    }
  }, [formDialogOpen, itemToEdit, resetFormToDefaults, populateFormWithBrand]);

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
  const handleExport = useCallback((filteredBrands: BriefBrandPayload[]) => {
    if (!mounted) return;

    try {
      // Prepare data for export
      const exportData = filteredBrands.map((item) => ({
        Name: item.brandName,
        Slug: item.slug,
        "Date Added": formatDate(item.createdAt),
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");

      // Generate filename with current date
      const fileName = `Brands_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      // Export to file
      XLSX.writeFile(workbook, fileName);

      formSuccess("Export Successful", `Brands exported to ${fileName}`);
    } catch (error) {
      formError(
        "Export Failed",
        "Failed to export brands",
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }, [formatDate, mounted]);

  // Handle add new click
  const handleAddClick = () => {
    setBrandToEdit(null);
    setIsEditMode(false);
    setFormDialogOpen(true);
  };

  const router = useRouter();

  // Handle edit click
  const handleEditClick = (item: BriefBrandPayload) => {
    console.log("Editing item:", item);
    setBrandToEdit(item);
    setIsEditMode(true);
    setFormDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (item: BriefBrandPayload) => {
    setBrandToDelete(item);
    setDeleteDialogOpen(true);
  };

  // Handle refresh - wrapped in useCallback
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle form submission (edit or add)
  const onSubmit = async (data: BrandFormValues) => {
    const operationId = operationStart(isEditMode ? "Updating Brand" : "Creating Brand");

    try {
      if (!isEditMode || !itemToEdit) {
        // Add new item - avoid crypto.randomUUID() for hydration consistency
        const { id, ...rest } = data;
        const newBrandData = {
          id: `brand_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // More predictable ID generation
          ...rest,
          brandName: data.brandName,
          slug: generateSlug(data.brandName),
          organizationId: organizationId || "",
          createdAt: new Date(),
        };

        createBrandMutation.mutate(
          newBrandData,
          {
            onSuccess: async () => {
              formSuccess("Brand Created", `Brand "${data.brandName}" has been successfully added to the system`);
              setFormDialogOpen(false);
              resetFormToDefaults();
              await refetch();
            },
            onError: (error: any) => {
              formError(
                "Failed to Create Brand",
                "Could not add the new brand",
                error?.message || "An unexpected error occurred"
              );
            },
          }
        );
      } else {
        // Edit existing item
        const updateData = {
          ...data,
          id: itemToEdit.id,
          brandName: data.brandName,
          slug: data.slug ?? data.brandName.toLowerCase().replace(/\s+/g, "-"),
          createdAt: data.createdAt ?? new Date(itemToEdit.createdAt ?? Date.now()),
          organizationId: organizationId || "",
        };

        updateBrandMutation.mutate(
          {
            id: itemToEdit.id,
            data: updateData,
          },
          {
            onSuccess: async () => {
              formSuccess("Brand Updated", `Brand "${data.brandName}" information has been successfully updated`);
              setFormDialogOpen(false);
              resetFormToDefaults();
              await refetch();
            },
            onError: (error: any) => {
              formError(
                "Failed to Update Brand",
                "Could not save the brand changes",
                error?.message || "An unexpected error occurred"
              );
            },
          }
        );
      }
    } catch (error) {
      formError(
        "Unexpected Error",
        "An unexpected error occurred while processing the brand",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  // Define columns for the data table - memoized to prevent recreation
  const columns: Column<BriefBrandPayload>[] = useMemo(() => [
    {
      header: "Brand Name",
      accessorKey: "brandName",
      cell: (row) => (
        <span className="font-medium">
          {row.brandName.length > 20 ? `${row.brandName.substring(0, 20)}...` : row.brandName}
        </span>
      ),
    },
    {
      header: "Slug",
      accessorKey: "slug",
    },
    {
      header: "Date Added",
      accessorKey: (row) => formatDate(row.createdAt),
    },
  ], [formatDate]);

  // Generate subtitle with total value
  const getSubtitle = useCallback((itemCount: number, totalValue: number) => {
    if (!mounted) return "Loading...";
    return `${itemCount} ${itemCount === 1 ? "item" : "items"} | Total Value: ${formatCurrency(totalValue)}`;
  }, [formatCurrency, mounted]);

  // If items is not an array, handle it properly
  const itemsArray = useMemo(() => {
    return Array.isArray(initialData) ? initialData : initialData || [];
  }, [initialData]);

  // Handle delete confirmation
  const handleDeleteBrandConfirmation = () => {
    if (itemToDelete) {
      const operationId = operationStart("Deleting Brand");

      deleteBrandMutation.mutate(itemToDelete.id, {
        onSuccess: () => {
          formSuccess("Brand Deleted", `Brand "${itemToDelete.brandName}" has been permanently removed from the system`);
          refetch();
        },
        onError: (error: any) => {
          formError(
            "Failed to Delete Brand",
            "Could not remove the brand",
            error?.message || "An unexpected error occurred"
          );
        }
      });
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    }
  };


  return (
    <>
      <DataTable<BriefBrandPayload>
        title={title}
        subtitle={"Sleak Modifications"}
        data={itemsArray}
        columns={columns}
        keyField="id"
        onRefresh={handleRefresh}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["brandName", "slug"],
          enableDateFilter: true,
          getItemDate: (item) => item.createdAt,
        }}
        renderRowActions={(item) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(item)}
            onDelete={() => handleDeleteClick(item)}
            isDeleting={deleteBrandMutation.isPending && itemToDelete?.id === item.id}
          />
        )}
      />

      {/* Brand Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title={isEditMode ? "Edit Brand" : "Add New Brand"}
        form={form}
        size="lg"
        onSubmit={onSubmit}
        isSubmitting={createBrandMutation.isPending || updateBrandMutation.isPending}
        submitLabel={isEditMode ? "Save Changes" : "Add Brand"}
      >
        <div className="grid md:grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand name *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the brand name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </EntityForm>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Brand"
        description={
          itemToDelete ? (
            <>
              Are you sure you want to delete{" "}
              <strong>{itemToDelete.brandName}</strong>{" "}
              ({itemToDelete.slug})? This action is irreversible.
            </>
          ) : (
            "Are you sure you want to delete this item?"
          )
        }
        onConfirm={handleDeleteBrandConfirmation}
        isConfirming={deleteBrandMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
};

export default BrandFormForEditing;