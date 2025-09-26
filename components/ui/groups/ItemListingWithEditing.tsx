"use client"

import ItemFormForEditing from "@/components/dashboard/items/ItemFormForEditing"
import ImageUploadButton from "@/components/FormInputs/ImageUploadButton"
import { type Column, ConfirmationDialog, DataTable, EntityForm, TableActions } from "@/components/ui/data-table"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCreateAnItem } from "@/hooks/itemsHooks/useCreateAnItem"
import { useDeleteAnItem } from "@/hooks/itemsHooks/useDeleteAnItem"
import { useOrgItemsNew } from "@/hooks/useAllItemQueries"

import { generateSimpleSKU } from "@/lib/generateSKU"
import { BrandDTO } from "@/types/brand"
import type { ItemDTO } from "@/types/item"
import { TaxRateDTO } from "@/types/taxRates"
import { CategoryDTO } from "@/types/types"
import { UnitDTO } from "@/types/unit"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@react-email/components"
import { format } from "date-fns"
import { DollarSign } from "lucide-react"
import Link from "next/link"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { z } from "zod"



interface ItemDetailProps {
  title: string
  editingId: string
  organizationId: string
  initialItemData: ItemDTO[]
  initialCategoryData: CategoryDTO[]
  initialBrandData: BrandDTO[]
  initialUnitData: UnitDTO[]
  initialTaxRateData: TaxRateDTO[]
}

// Simple form schema for adding new items (basic fields only)
const itemFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  costPrice: z.number().min(0, "Cost price must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
  createdAt: z.date().optional(),
  thumbnail: z.string().optional(),
  imageUrls: z.string().optional(),
  organizationId: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
})

type ItemFormValues = z.infer<typeof itemFormSchema>

const ItemListingWithEditing = ({
  title,
  organizationId,
  editingId,
  initialItemData,
  initialCategoryData,
  initialBrandData,
  initialUnitData,
  initialTaxRateData

}: ItemDetailProps) => {

  // Ensure organizationId is provided
  console.log(organizationId)
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch items")
  }
  const itemsArray = Array.isArray(initialItemData) ? initialItemData : initialItemData || []
  console.log({ initialBrandData })
  console.log({ initialCategoryData })
  console.log({ initialUnitData })
  console.log({ initialTaxRateData })
  // Use custom hook to fetch items
  const { refetch } = useOrgItemsNew(organizationId)
  const createItemMutation = useCreateAnItem(organizationId)
  // const updateItemMutation = useUpdateAnItem()
  const deleteItemMutation = useDeleteAnItem()

  // Local state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [comprehensiveFormOpen, setComprehensiveFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemImageUrl, setItemImageUrl] = useState(
    "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd",
  )
  const [itemToEdit, setItemToEdit] = useState<ItemDTO | null>(null)
  const [itemToDelete, setItemToDelete] = useState<ItemDTO | null>(null)
  const [sku, setSku] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState(false)




  // Form for adding new items (simple form)
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      costPrice: 0,
      quantity: 0,
      sellingPrice: 0,
      thumbnail: "",
      organizationId: "",
      imageUrls: "",
      sku: "",
    },
  })

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      name: "",
      slug: "",
      costPrice: 0,
      quantity: 0,
      sellingPrice: 0,
      thumbnail: "",
      organizationId: organizationId,
      imageUrls: "",
      sku: "",
    })
    setItemImageUrl("https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd")
    setSku("")
    setIsEditMode(false)
    setItemToEdit(null)
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
  const handleExport = useCallback((filteredItems: ItemDTO[]) => {
    try {
      const exportData = filteredItems.map((item) => ({
        Name: item.name,
        Slug: item.slug,
        SKU: item.sku,
        "Cost Price": item.costPrice,
        "Selling Price": item.sellingPrice,
        "Total Sales": formatCurrency(item.salesTotal || 0),
        "Date Added": formatDate(item.createdAt),
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Items")

      const fileName = `Items_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast.success("Export successful", {
        description: `Items exported to ${fileName}`,
      })
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }, [])

  // Handle add new click (simple form)
  const handleAddClick = () => {
    setItemToEdit(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit click (comprehensive form)
  const handleEditClick = (item: ItemDTO) => {
    console.log("Opening comprehensive edit form for:", item)
    setItemToEdit(item)
    setIsEditMode(true)
    setComprehensiveFormOpen(true)
  }

  const copyToClipboard = async (): Promise<void> => {
    const currentSku = form.getValues("sku") || sku
    if (currentSku) {
      try {
        await navigator.clipboard.writeText(currentSku)
        toast.success("SKU copied to clipboard!")
      } catch (err) {
        console.error("Failed to copy SKU:", err)
        toast.error("Failed to copy SKU to clipboard")
      }
    }
  }

  // Handle delete click
  const handleDeleteClick = (item: ItemDTO) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Handle form submission (add new item only)
  const onSubmit = async (data: ItemFormValues) => {
    try {
      const { id, ...rest } = data
      const newItemData = {
        id: crypto.randomUUID(),
        ...rest,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        thumbnail: itemImageUrl || "/placeholder.png",
        organizationId: organizationId || "",
        createdAt: new Date(),
        quantity: Number(data.quantity) || 0,
        sku: data.sku,
        imageUrls: itemImageUrl ? [itemImageUrl] : [],
      }

      createItemMutation.mutateAsync(newItemData, {
        onSuccess: async () => {
          toast.success("Item added successfully")
          setFormDialogOpen(false)
          resetFormToDefaults()
          await refetch()
        },
        onError: (error: any) => {
          toast.error("Failed to add item", {
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

  // Calculate total items value
  const getTotalValue = useCallback((items: ItemDTO[]) => {
    return items.reduce((total, item) => {
      const price = Number(item.sellingPrice) * Number(item.quantity) || 0
      if (isNaN(price)) {
        console.warn(`Invalid sellingPrice or quantity for item ${item.id}:`, item)
        return total
      }
      return total + price
    }, 0)
  }, [])


  // Define columns for the data table
  const columns: Column<ItemDTO>[] = [
    {
      header: "Image",
      accessorKey: "imageUrls",
      cell: (row) => (
        <img src={row.imageUrls || "/placeholder.svg"} alt={row?.name || ""} className="h-10 w-10 rounded-md object-cover" />
      ),
    },
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
      header: "Weight",
      accessorKey: "weight",
    },

    {
      header: "Qtty",
      accessorKey: (row: ItemDTO) => Number(row.quantity) || 0,
    },
    {
      header: "Cost Price",
      accessorKey: (row) => formatCurrency(Number(row.costPrice) || 0),
    },
    {
      header: "Selling Price",
      accessorKey: (row) => formatCurrency(Number(row.sellingPrice) || 0),
    },
    {
      header: "Sales Total",
      accessorKey: (row) => formatCurrency(Number(row.salesTotal) || 0),
    },

    {
      header: "Suppliers",
      accessorKey: "id",
      cell: (row) => (
        <Button className="rounded-full"  >
          <Link href={`/dashboard/inventory/items/${row.id}/suppliers`}>
            Suppliers
          </Link>
        </Button >

      ),

    },
  ]

  // Generate subtitle with total value
  const getSubtitle = useCallback((itemCount: number, totalValue: number) => {
    return `${itemCount} ${itemCount === 1 ? "item" : "items"} | Total Value: ${formatCurrency(totalValue)}`
  }, [])


  // Handle delete confirmation
  const handleDeleteItemConfirmation = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete.id!, {
        onSuccess: () => {
          toast.success("Item deleted successfully")
          refetch()
        },
        onError: (error: any) => {
          toast.error("Failed to delete item", {
            description: error?.message || "Unknown error occurred",
          })
        },
      })
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <>
      <DataTable<ItemDTO>
        title={"Items Information"}
        subtitle={itemsArray.length > 0 ? getSubtitle(itemsArray.length, getTotalValue(itemsArray)) : "No items found"}
        data={itemsArray}
        columns={columns}
        keyField="id"
        onRefresh={handleRefresh}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name", "slug", "sku"],
          enableDateFilter: true,
          getItemDate: (item) => item.createdAt,
        }}
        renderRowActions={(item) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(item)}
            onDelete={() => handleDeleteClick(item)}
            isDeleting={deleteItemMutation.isPending && itemToDelete?.id === item.id}
          />
        )}
      />

      {/* Simple Add Item Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title="New Item"
        form={form}
        size="lg"
        onSubmit={onSubmit}
        isSubmitting={createItemMutation.isPending}
        submitLabel="Add New Item"
      >
        <div className="grid md:grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
                  </FormControl>
                  <FormDescription>Enter the name of the item</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
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
                  <FormDescription>Enter the item quantity</FormDescription>
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
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the item cost price in XAF</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Enter the item selling price in XAF</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Item Image
              </label>
              <ImageUploadButton
                title="Upload Item Image"
                imageUrl={itemImageUrl}
                setImageUrl={setItemImageUrl}
                endpoint="itemImageUpload"
              />
              <div className="text-xs text-muted-foreground">
                {itemImageUrl ? "New image selected" : "No image selected"}
              </div>
            </div>
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product SKU *</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Generated SKU will appear here..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          {...field}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newSku = generateSimpleSKU(9, "DBAKES")
                            form.setValue("sku", newSku)
                            setSku(newSku)
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Generate SKU
                        </button>
                        {field.value && (
                          <button
                            type="button"
                            onClick={copyToClipboard}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            title="Copy to clipboard"
                          >
                            📋
                          </button>
                        )}
                      </div>
                      {field.value && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800">
                            <strong>Generated SKU:</strong> {field.value}
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Geneerate the item SKU</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        </div>
      </EntityForm>

      {/* Comprehensive Edit Form Dialog */}
      <ItemFormForEditing
        open={comprehensiveFormOpen}
        onOpenChange={setComprehensiveFormOpen}
        itemData={itemToEdit}
        onSuccess={() => {
          refetch()
          setComprehensiveFormOpen(false)
        }}
        initialBrandData={initialBrandData}
        initialCategoryData={initialCategoryData.map(cat => ({
          ...cat,
          organizationId: cat.organizationId ?? "",
          description: cat.description === null ? undefined : cat.description,
        }))}
        initialUnitData={initialUnitData}
        initialTaxRateData={initialTaxRateData}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Item"
        description={
          itemToDelete ? (
            <>
              Are you sure you want to delete <strong>{itemToDelete.name}</strong> ({itemToDelete.sku})? This action is
              irreversible.
            </>
          ) : (
            "Are you sure you want to delete this item?"
          )
        }
        onConfirm={handleDeleteItemConfirmation}
        isConfirming={deleteItemMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}

export default ItemListingWithEditing
