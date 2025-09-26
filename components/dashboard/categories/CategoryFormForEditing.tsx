"use client"

import ImageUploadButton from "@/components/FormInputs/ImageUploadButton"
import { type Column, ConfirmationDialog, DataTable, EntityForm, TableActions } from "@/components/ui/data-table"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateACategory, useDeleteACategory } from "@/hooks/categoriesHooks"
import { useOrgCategories, useUpdateACategory } from "@/hooks/useAllCategoriesQueries"
import { generateSlug } from "@/lib/generateSlug"
import type { BriefCategoryPayload } from "@/types/category"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { z } from "zod"

interface CategoryDetailProps {
  organizationId: string | undefined
  title: string
  editingId?: string
  initialData?: BriefCategoryPayload[]
}

// Form schema for editing/adding categories
const categoryFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  createdAt: z.date().optional(),
  organizationId: z.string().optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

const CategoryFormForEditing = ({ title, organizationId, editingId, initialData }: CategoryDetailProps) => {
  // Ensure organizationId is provided
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch categories")
  }

  console.log({ initialData })

  // Hooks
  const { refetch } = useOrgCategories(organizationId)
  const createCategoryMutation = useCreateACategory()
  const updateCategoryMutation = useUpdateACategory()
  const deleteCategoryMutation = useDeleteACategory()

  // Local state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState("/placeholder.png")
  const [categoryToEdit, setCategoryToEdit] = useState<BriefCategoryPayload | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<BriefCategoryPayload | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Form for editing/adding categories
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      organizationId: organizationId || "",
      description: "",
      imageUrl: "",
    },
  })

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      title: "",
      slug: "",
      organizationId: organizationId || "",
      description: "",
      imageUrl: "",
    })
    setIsEditMode(false)
    setCategoryToEdit(null)
    setCurrentImageUrl("/placeholder.png")
  }, [form, organizationId])

  // Function to populate form with category data
  const populateFormWithCategory = useCallback(
    (category: BriefCategoryPayload) => {
      const formData = {
        id: category.id,
        title: category.title || "",
        slug: category.slug || category.title?.toLowerCase().replace(/\s+/g, "-") || "",
        organizationId: organizationId || "",
        description: category.description || "",
        imageUrl: category.imageUrl || "",
      }

      form.reset(formData)
      setCurrentImageUrl(category.imageUrl || "/placeholder.png")
      setIsEditMode(true)
      setCategoryToEdit(category)
    },
    [form, organizationId],
  )

  // Update form when dialog state changes
  useEffect(() => {
    if (!formDialogOpen) {
      return
    }

    if (!categoryToEdit) {
      resetFormToDefaults()
    } else {
      populateFormWithCategory(categoryToEdit)
    }
  }, [formDialogOpen, categoryToEdit, resetFormToDefaults, populateFormWithCategory])

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
    (filteredCategories: BriefCategoryPayload[]) => {
      if (!mounted) return

      try {
        // Prepare data for export
        const exportData = filteredCategories.map((category) => ({
          Name: category.title,
          Slug: category.slug,
          Description: category.description || "",
          "Date Added": formatDate(category.createdAt),
        }))

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Categories")

        // Generate filename with current date
        const fileName = `Categories_${format(new Date(), "yyyy-MM-dd")}.xlsx`

        // Export to file
        XLSX.writeFile(workbook, fileName)

        toast.success("Export successful", {
          description: `Categories exported to ${fileName}`,
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
    setCategoryToEdit(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit click
  const handleEditClick = (category: BriefCategoryPayload) => {
    console.log("Editing category:", category)
    setCategoryToEdit(category)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (category: BriefCategoryPayload) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  // Handle refresh - wrapped in useCallback
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle image URL change
  const handleImageUrlChange = useCallback(
    (url: string) => {
      setCurrentImageUrl(url)
      form.setValue("imageUrl", url)
    },
    [form],
  )

  // Handle form submission (edit or add)
  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (!isEditMode || !categoryToEdit) {
        // Add new category
        const { id, ...rest } = data
        const newCategoryData = {
          id: crypto.randomUUID(),
          ...rest,
          title: data.title,
          slug: generateSlug(data.title, data.description),
          organizationId: organizationId || "",
          createdAt: new Date(),
          description: data.description || "",
          imageUrl: data.imageUrl || "",
        }

        createCategoryMutation.mutate(newCategoryData, {
          onSuccess: async () => {
            toast.success("Category added successfully")
            setFormDialogOpen(false)
            resetFormToDefaults()
            await refetch()
          },
          onError: (error: any) => {
            toast.error("Failed to add category", {
              description: error?.message || "Unknown error occurred",
            })
          },
        })
      } else {
        // Edit existing category
        const updateData = {
          ...data,
          id: categoryToEdit.id,
          title: data.title,
          description: data.description || categoryToEdit.description,
          slug: generateSlug(data.title, data.description || ""),
          imageUrl: data.imageUrl || categoryToEdit.imageUrl,
          createdAt: data.createdAt || new Date(categoryToEdit.createdAt || Date.now()),
          organizationId: organizationId || "",
        }

        updateCategoryMutation.mutate(
          {
            id: categoryToEdit.id,
            data: updateData,
          },
          {
            onSuccess: async () => {
              toast.success("Category updated successfully")
              setFormDialogOpen(false)
              resetFormToDefaults()
              await refetch()
            },
            onError: (error: any) => {
              toast.error("Failed to update category", {
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
  const columns: Column<BriefCategoryPayload>[] = useMemo(
    () => [
      {
        header: "Image",
        accessorKey: "imageUrl",
        cell: (row) => (
          <img
            src={row.imageUrl || "/placeholder.png"}
            alt={row?.title || "Category image"}
            className="h-10 w-10 rounded-md object-cover"
          />
        ),
      },
      {
        header: "Category Name",
        accessorKey: "title",
        cell: (row) => (
          <span className="font-medium">{row.title.length > 20 ? `${row.title.substring(0, 20)}...` : row.title}</span>
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
    ],
    [formatDate],
  )

  // Generate subtitle with total value
  const getSubtitle = useCallback(
    (categoryCount: number, totalValue: number) => {
      if (!mounted) return "Loading..."
      return `${categoryCount} ${categoryCount === 1 ? "category" : "categories"} | Total Value: ${formatCurrency(totalValue)}`
    },
    [formatCurrency, mounted],
  )

  // If categories is not an array, handle it properly
  const categoriesArray = useMemo(() => {
    return Array.isArray(initialData) ? initialData : initialData || []
  }, [initialData])

  // Handle delete confirmation
  const handleDeleteCategoryConfirmation = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          toast.success("Category deleted successfully")
          refetch()
        },
        onError: (error: any) => {
          toast.error("Failed to delete category", {
            description: error?.message || "Unknown error occurred",
          })
        },
      })
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  return (
    <>
      <DataTable<BriefCategoryPayload>
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
          searchFields: ["title", "slug"],
          enableDateFilter: true,
          getItemDate: (category) => category.createdAt,
        }}
        renderRowActions={(category) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(category)}
            onDelete={() => handleDeleteClick(category)}
            isDeleting={deleteCategoryMutation.isPending && categoryToDelete?.id === category.id}
          />
        )}
      />

      {/* Category Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title={isEditMode ? "Edit Category" : "Add New Category"}
        form={form}
        size="lg"
        onSubmit={onSubmit}
        isSubmitting={createCategoryMutation.isPending || updateCategoryMutation.isPending}
        submitLabel={isEditMode ? "Save Changes" : "Add Category"}
      >
        <div className="grid md:grid-cols-12 gap-4">
          <div className="col-span-6">
            <div className="col-span-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category name *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormDescription>Enter the category name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Category description"
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Enter a description for the category</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="col-span-6">
            <div className="space-y-2">
              <FormLabel>Category Image</FormLabel>
              <ImageUploadButton
                title={isEditMode ? "Update Image" : "Upload Image"}
                imageUrl={currentImageUrl}
                endpoint="categoryImage"
                setImageUrl={handleImageUrlChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {currentImageUrl && currentImageUrl !== "/placeholder.png"
                  ? isEditMode
                    ? "Current category image"
                    : "Image uploaded"
                  : "No image selected - placeholder will be used"}
              </p>
            </div>
          </div>
        </div>
      </EntityForm >

      {/* Delete Confirmation Dialog */}
      < ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        description={
          categoryToDelete ? (
            <>
              Are you sure you want to delete <strong>{categoryToDelete.title}</strong> ({categoryToDelete.slug}) ? This
              action is irreversible.
            </>
          ) : (
            "Are you sure you want to delete this category?"
          )
        }
        onConfirm={handleDeleteCategoryConfirmation}
        isConfirming={deleteCategoryMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}

export default CategoryFormForEditing
