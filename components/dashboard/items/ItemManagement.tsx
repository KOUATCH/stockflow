"use client"

import { useState, useMemo, useCallback } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { Plus, RefreshCw, Download, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTable } from "@/components/ui/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { ItemForm } from "./item-form"
import { ItemStats } from "./item-stats"
import { ItemTableColumns } from "./item-table-columns"
import {
  useOrgItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useItemManagementState,
} from "@/hooks/use-item-management"
import type { ItemFilters } from "@/types/item"
import type { ItemCreateInput } from "@/lib/validations/item"

interface ItemManagementProps {
  organizationId: string
  categories?: Array<{ id: string; title: string }>
  brands?: Array<{ id: string; brandName: string }>
  units?: Array<{ id: string; name: string }>
  taxRates?: Array<{ id: string; name: string; rate: number }>
}

export function ItemManagement({
  organizationId,
  categories = [],
  brands = [],
  units = [],
  taxRates = [],
}: ItemManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true)

  // Build filters
  const filters = useMemo<ItemFilters>(
    () => ({
      search: searchTerm || undefined,
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      brandId: selectedBrand !== "all" ? selectedBrand : undefined,
      isActive: showActiveOnly ? true : undefined,
    }),
    [searchTerm, selectedCategory, selectedBrand, showActiveOnly],
  )

  // Hooks
  const {
    formDialogOpen,
    editDialogOpen,
    deleteDialogOpen,
    itemToEdit,
    itemToDelete,
    setFormDialogOpen,
    setEditDialogOpen,
    setDeleteDialogOpen,
    handleAddClick,
    handleEditClick,
    handleDeleteClick,
    resetState,
  } = useItemManagementState()

  const { data: itemsResponse, isLoading, error, refetch } = useOrgItems(organizationId, filters)
  const createItemMutation = useCreateItem(organizationId)
  const updateItemMutation = useUpdateItem(organizationId)
  const deleteItemMutation = useDeleteItem(organizationId)

  // Data processing
  const items = useMemo(() => {
    if (!itemsResponse?.success || !itemsResponse.data) return []
    return itemsResponse.data
  }, [itemsResponse])

  // Stats calculation
  const stats = useMemo(() => {
    const totalItems = items.length
    const activeItems = items.filter((item) => item.isActive).length
    const lowStockItems = items.filter(
      (item) => item.quantity !== undefined && item.quantity <= item.minStockLevel,
    ).length
    const totalValue = items.reduce((sum, item) => sum + item.sellingPrice * (item.quantity || 0), 0)

    return {
      totalItems,
      activeItems,
      lowStockItems,
      totalValue,
    }
  }, [items])

  // Utility functions
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount)
  }, [])

  const formatDate = useCallback((date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, "MMM dd, yyyy")
  }, [])

  // Event handlers
  const handleRefresh = useCallback(async () => {
    try {
      await refetch()
      toast.success("Items refreshed successfully")
    } catch (error) {
      toast.error("Failed to refresh items")
    }
  }, [refetch])

  const handleExport = useCallback(() => {
    try {
      const exportData = items.map((item) => ({
        Name: item.name,
        SKU: item.sku,
        "Cost Price": item.costPrice,
        "Selling Price": item.sellingPrice,
        Quantity: item.quantity || 0,
        "Min Stock": item.minStockLevel,
        Status: item.isActive ? "Active" : "Inactive",
        "Date Added": formatDate(item.createdAt),
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Items")

      const fileName = `Items_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast.success("Export successful", {
        description: `${items.length} items exported to ${fileName}`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }, [items, formatDate])

  const handleCreateItem = useCallback(
    async (data: ItemCreateInput) => {
      try {
        await createItemMutation.mutateAsync(data)
        setFormDialogOpen(false)
        resetState()
      } catch (error) {
        // Error handling is done in the mutation
      }
    },
    [createItemMutation, setFormDialogOpen, resetState],
  )

  const handleUpdateItem = useCallback(
    async (data: ItemCreateInput) => {
      if (!itemToEdit) return

      try {
        await updateItemMutation.mutateAsync({ ...data, id: itemToEdit.id })
        setEditDialogOpen(false)
        resetState()
      } catch (error) {
        // Error handling is done in the mutation
      }
    },
    [updateItemMutation, itemToEdit, setEditDialogOpen, resetState],
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete) return

    try {
      await deleteItemMutation.mutateAsync(itemToDelete.id)
      setDeleteDialogOpen(false)
      resetState()
    } catch (error) {
      // Error handling is done in the mutation
    }
  }, [deleteItemMutation, itemToDelete, setDeleteDialogOpen, resetState])

  // Table columns
  const columns = useMemo(
    () =>
      ItemTableColumns({
        formatCurrency,
        formatDate,
        onEdit: handleEditClick,
        onDelete: handleDeleteClick,
      }),
    [formatCurrency, formatDate, handleEditClick, handleDeleteClick],
  )

  // Error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Items</CardTitle>
          <CardDescription>Failed to load items. Please try refreshing the page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <ItemStats stats={stats} formatCurrency={formatCurrency} />

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Items Management</CardTitle>
              <CardDescription>Manage your inventory items, pricing, and stock levels</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search items by name, SKU, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.brandName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={showActiveOnly ? "active" : "all"}
              onValueChange={(value) => setShowActiveOnly(value === "active")}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <DataTable
            data={items}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No items found. Create your first item to get started."
          />
        </CardContent>
      </Card>

      {/* Create Item Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory with detailed information and settings.
            </DialogDescription>
          </DialogHeader>
          <ItemForm
            onSubmit={handleCreateItem}
            isSubmitting={createItemMutation.isPending}
            categories={categories}
            brands={brands}
            units={units}
            taxRates={taxRates}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update item information and settings.</DialogDescription>
          </DialogHeader>
          {itemToEdit && (
            <ItemForm
              onSubmit={handleUpdateItem}
              isSubmitting={updateItemMutation.isPending}
              initialData={itemToEdit}
              categories={categories}
              brands={brands}
              units={units}
              taxRates={taxRates}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete ? (
                <div className="space-y-2">
                  <p>
                    Are you sure you want to delete <strong>{itemToDelete.name}</strong>?
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>SKU: {itemToDelete.sku}</p>
                    <p>This action cannot be undone and will remove all associated data.</p>
                  </div>
                </div>
              ) : (
                "Are you sure you want to delete this item?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteItemMutation.isPending}
            >
              {deleteItemMutation.isPending ? "Deleting..." : "Delete Item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
