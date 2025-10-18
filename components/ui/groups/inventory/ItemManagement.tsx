"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { memo, useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { z } from "zod"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog, EntityForm } from "@/components/ui/data-table"

import { useDeleteItem, useOrgItemsNew } from "@/hooks/useAllItemQueries"

import type { BrandDTO } from "@/types/brand"
import type { TaxRateDTO } from "@/types/taxRates"
import type { CategoryDTO } from "@/types/types"
import type { UnitDTO } from "@/types/unit"

import { useCreateItem } from "@/hooks/itemsHooks/useItemHooks"
import { formatCurrency } from "@/lib/formatCurrency"
import { formatDate } from "@/lib/formateDate"
import { ItemWithInventoryLevelsPayload } from "@/types/itemTypes"
import { ItemForm2 } from "./ItemForm2"
import { useItemManagement } from "./hooks/useItemManagement"

// Import TanStack Table components
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  ChevronDownIcon,
  Download,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal
} from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

// Enhanced form schema with better validation
const itemFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").trim(),
    slug: z.string().optional(),
    costPrice: z.number().min(0, "Cost price must be positive").max(1000000, "Cost price seems too high"),
    quantity: z
      .number()
      .int("Quantity must be a whole number")
      .min(0, "Quantity cannot be negative")
      .max(100000, "Quantity seems too high"),
    sellingPrice: z.number().min(0, "Selling price must be positive").max(1000000, "Selling price seems too high"),
    createdAt: z.date().optional(),
    thumbnail: z.string().url().optional().or(z.literal("")),
    imageUrls: z.string().optional(),
    organizationId: z.string().min(1, "Organization ID is required"),
    sku: z
      .string()
      .min(3, "SKU must be at least 3 characters")
      .max(50, "SKU must be less than 50 characters")
      .regex(/^[A-Z0-9-_]+$/, "SKU can only contain uppercase letters, numbers, hyphens, and underscores"),
  })
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: "Selling price should be greater than or equal to cost price",
    path: ["sellingPrice"],
  })

export type ItemFormValues = z.infer<typeof itemFormSchema>

interface ItemManagementProps {
  title: string
  editingId: string
  organizationId: string
  initialItemData: ItemWithInventoryLevelsPayload[]
  initialCategoryData: CategoryDTO[]
  initialBrandData: BrandDTO[]
  initialUnitData: UnitDTO[]
  initialTaxRateData: TaxRateDTO[]
}

const DEFAULT_IMAGE_URL = "https://14J7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylKf1PXSCqAuseUG0gx8mhd"

// Custom filter function for better searching
const globalFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
  const item = row.original
  const searchValue = value.toLowerCase()

  return (
    item.name?.toLowerCase().includes(searchValue) ||
    item.sku?.toLowerCase().includes(searchValue) ||
    item.slug?.toLowerCase().includes(searchValue) ||
    String(item.costPrice).includes(searchValue) ||
    String(item.sellingPrice).includes(searchValue)
  )
}

// Define our columns
const getColumns = (
  formatCurrency: (amount: number) => string,
  formatDate: (date: Date | string) => string,
  handleEditClick: (item: ItemWithInventoryLevelsPayload) => void,
  handleDeleteClick: (item: ItemWithInventoryLevelsPayload) => void,
  isDeleting: boolean,
  itemToDelete: ItemWithInventoryLevelsPayload | null
): ColumnDef<ItemWithInventoryLevelsPayload>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border">
              <img
                src={item.thumbnail || DEFAULT_IMAGE_URL}
                alt={item.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground line-clamp-1">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.sku}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "costPrice",
      header: "Cost",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("costPrice"))
        return <span className="font-medium">{formatCurrency(amount)}</span>
      },
    },
    {
      accessorKey: "sellingPrice",
      header: "Price",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("sellingPrice"))
        return <span className="font-medium text-green-600">{formatCurrency(amount)}</span>
      },
    },
    {
      accessorKey: "inventoryLevels",
      header: "Stock",
      cell: ({ row }) => {
        const inventoryLevels = row.getValue("inventoryLevels") as any[]
        const quantity = inventoryLevels?.[0]?.quantityOnHand || 0

        let status = "default"
        if (quantity === 0) status = "destructive"
        else if (quantity < 10) status = "warning"

        return (
          <Badge variant={status as any}>
            {quantity} in stock
          </Badge>
        )
      },
    },
    {
      accessorKey: "value",
      header: "Total Value",
      cell: ({ row }) => {
        const item = row.original
        const quantity = item.inventoryLevels?.[0]?.quantityOnHand || 0
        const value = (Number(item.sellingPrice) || 0) * quantity
        return <span className="font-medium">{formatCurrency(value)}</span>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date Added",
      cell: ({ row }) => {
        return formatDate(row.getValue("createdAt"))
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original
        const isBeingDeleted = isDeleting && itemToDelete?.id === item.id

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.id || "")}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditClick(item)}>
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(item)}
                disabled={isBeingDeleted}
                className="text-destructive focus:text-destructive"
              >
                {isBeingDeleted ? "Deleting..." : "Delete Item"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

// Modern TanStack Table Component
const ModernItemTable = ({
  data,
  columns,
  isLoading,
  onRefresh,
  onAdd,
  onExport,
  onEdit,
  onDelete,
  isDeleting,
  itemToDelete,
  title,
  subtitle,
}: {
  data: ItemWithInventoryLevelsPayload[]
  columns: ColumnDef<ItemWithInventoryLevelsPayload>[]
  isLoading: boolean
  onRefresh: () => void
  onAdd: () => void
  onExport: (data: ItemWithInventoryLevelsPayload[]) => void
  onEdit: (item: ItemWithInventoryLevelsPayload) => void
  onDelete: (item: ItemWithInventoryLevelsPayload) => void
  isDeleting: boolean
  itemToDelete: ItemWithInventoryLevelsPayload | null
  title: string
  subtitle: string
}) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      global: globalFilterFn,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn,
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows

  return (
    <div className="w-full space-y-4 p-3">
      {/* Header with title and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                View
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item (Quick)
          </Button>
          <Button size="sm" asChild className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
            <Link href="/dashboard/inventory/items/create">
              <Package className="mr-2 h-4 w-4" />
              Add Item (Full)
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8 sm:w-[300px] md:w-[400px]"
          />
        </div>

        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedRows.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(selectedRows.map(row => row.original))}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Selected
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport(data)}
        >
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading state
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={columns.length}>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              className="h-8 w-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ItemManagement = memo<ItemManagementProps>(
  ({
    title,
    organizationId,
    editingId,
    initialItemData,
    initialCategoryData,
    initialBrandData,
    initialUnitData,
    initialTaxRateData,
  }) => {
    // Validate required props
    if (!organizationId) {
      throw new Error("Organization ID is required to manage items")
    }

    // Ensure data is properly formatted
    const itemsArray = useMemo(() => (Array.isArray(initialItemData) ? initialItemData : []), [initialItemData])

    // Custom hook for item management logic
    const {
      formDialogOpen,
      setFormDialogOpen,
      deleteDialogOpen,
      setDeleteDialogOpen,
      itemToDelete,
      setItemToDelete,
      handleAddClick,
      handleEditClick,
      handleDeleteClick,
      resetFormToDefaults,
    } = useItemManagement()

    // API hooks
    const { refetch, isLoading, error } = useOrgItemsNew(organizationId)
    const createItemMutation = useCreateItem()
    const deleteItemMutation = useDeleteItem()

    // Form setup
    const form = useForm<ItemFormValues>({
      resolver: zodResolver(itemFormSchema),
      defaultValues: {
        name: "",
        slug: "",
        costPrice: 0,
        quantity: 0,
        sellingPrice: 0,
        thumbnail: "",
        organizationId: organizationId,
        imageUrls: "",
        sku: "",
      },
      mode: "onChange", // Enable real-time validation
    })

    // Local state
    const [itemImageUrl, setItemImageUrl] = useState(DEFAULT_IMAGE_URL)

    // Memoized calculations
    const itemStats = useMemo(() => {
      const totalValue = initialItemData.reduce((total, item) => {
        const value = (Number(item?.sellingPrice) || 0) * (Number(item?.inventoryLevels[0]?.quantityOnHand) || 0)
        return total + (isNaN(value) ? 0 : value)
      }, 0)

      const lowStockItems = initialItemData.filter((item) => (Number(item.inventoryLevels[0]?.quantityOnHand) || 0) < 10)
      const outOfStockItems = initialItemData.filter((item) => (Number(item.inventoryLevels[0]?.quantityOnHand) || 0) === 0)

      return {
        totalItems: initialItemData.length,
        totalValue,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
      }
    }, [initialItemData])

    // Export functionality
    const handleExport = useCallback(
      (filteredItems: ItemWithInventoryLevelsPayload[]) => {
        try {
          const exportData = filteredItems.map((item) => ({
            Name: item.name,
            Slug: item.slug,
            SKU: item.sku,
            "Cost Price": item.costPrice,
            "Selling Price": item.sellingPrice,
            "Total Value": (Number(item.sellingPrice) || 0) * (Number(item.maxStockLevel) || 0),
            "Date Added": formatDate(item.createdAt),
          }))

          const worksheet = XLSX.utils.json_to_sheet(exportData)
          const workbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workbook, worksheet, "Items")

          const fileName = `Items_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xlsx`
          XLSX.writeFile(workbook, fileName)

          toast.success("Export successful", {
            description: `${filteredItems.length} items exported to ${fileName}`,
          })
        } catch (error) {
          console.error("Export error:", error)
          toast.error("Export failed", {
            description: error instanceof Error ? error.message : "Unknown error occurred",
          })
        }
      },
      [formatDate],
    )

    // Form handlers
    const handleFormDialogClose = useCallback(
      (open: boolean) => {
        setFormDialogOpen(open)
        if (!open) {
          setTimeout(() => {
            resetFormToDefaults()
            form.reset()
            setItemImageUrl(DEFAULT_IMAGE_URL)
          }, 150)
        }
      },
      [setFormDialogOpen, resetFormToDefaults, form],
    )

    const handleRefresh = useCallback(async () => {
      try {
        await refetch()
        toast.success("Items refreshed successfully")
      } catch (error) {
        toast.error("Failed to refresh items")
      }
    }, [refetch])

    // Form submission
    const onSubmit = useCallback(
      async (data: ItemFormValues) => {
        try {
          const { id, ...rest } = data
          const newItemData = {
            id: crypto.randomUUID(),
            ...rest,
            slug: data.name.toLowerCase().replace(/\s+/g, "-"),
            thumbnail: itemImageUrl || DEFAULT_IMAGE_URL,
            organizationId: organizationId,
            createdAt: new Date(),
            quantity: Number(data.quantity) || 0,
            costPrice: Number(data.costPrice) || 0,
            sellingPrice: Number(data.sellingPrice) || 0,
            sku: data.sku,
            imageUrls: itemImageUrl ? "" : "",
          }

          await createItemMutation.mutateAsync(newItemData)

          toast.success("Item added successfully", {
            description: `${data.name} has been added to your inventory`,
          })

          setFormDialogOpen(false)
          resetFormToDefaults()
          form.reset()
          setItemImageUrl(itemImageUrl)
          await refetch()
        } catch (error) {
          console.error("Submit error:", error)
          toast.error("Failed to add item", {
            description: error instanceof Error ? error.message : "Unknown error occurred",
          })
        }
      },
      [itemImageUrl, organizationId, createItemMutation, setFormDialogOpen, resetFormToDefaults, form, refetch],
    )

    // Delete confirmation
    const handleDeleteConfirmation = useCallback(async () => {
      if (!itemToDelete) return

      try {
        await deleteItemMutation.mutateAsync({ id: itemToDelete.id!, organizationId })
        toast.success("Item deleted successfully", {
          description: `${itemToDelete.name} has been removed from your inventory`,
        })
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        await refetch()
      } catch (error) {
        console.error("Delete error:", error)
        toast.error("Failed to delete item", {
          description: error instanceof Error ? error.message : "Unknown error occurred",
        })
      }
    }, [itemToDelete, deleteItemMutation, setDeleteDialogOpen, setItemToDelete, refetch])

    // Table columns
    const columns = useMemo(
      () => getColumns(formatCurrency, formatDate, handleEditClick, handleDeleteClick, deleteItemMutation.isPending, itemToDelete),
      [formatCurrency, formatDate, handleEditClick, handleDeleteClick, deleteItemMutation.isPending, itemToDelete]
    )

    // Subtitle with stats
    const subtitle = useMemo(() => {
      if (itemsArray.length === 0) return "No items found"
      return `${itemStats.totalItems} ${itemStats.totalItems === 1 ? "item" : "items"} | Total Value: ${formatCurrency(itemStats.totalValue)}`
    }, [itemsArray.length, itemStats.totalItems, itemStats.totalValue, formatCurrency])

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
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        {/* Stats Overview */}
        {/* <ItemStats stats={itemStats} formatCurrency={formatCurrency} /> */}

        {/* Modern TanStack Table */}
        <ModernItemTable
          data={itemsArray}
          columns={columns}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onAdd={handleAddClick}
          onExport={handleExport}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          isDeleting={deleteItemMutation.isPending}
          itemToDelete={itemToDelete}
          title={title || "Items Management"}
          subtitle={subtitle}
        />

        {/* Add Item Form Dialog */}
        <EntityForm
          open={formDialogOpen}
          onOpenChange={handleFormDialogClose}
          title="Add New Item"
          form={form}
          size="lg"
          onSubmit={onSubmit}
          isSubmitting={createItemMutation.isPending}
          submitLabel="Add Item"
        >
          <ItemForm2
            form={form}
            itemImageUrl={itemImageUrl}
            setItemImageUrl={setItemImageUrl}
            organizationId={organizationId}
          />
        </EntityForm>


        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Item"
          description={
            itemToDelete ? (
              <div className="space-y-2">
                <p>
                  Are you sure you want to delete <strong>{itemToDelete.name}</strong>?
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>SKU: {itemToDelete.sku}</p>
                  <p>This action cannot be undone.</p>
                </div>
              </div>
            ) : (
              "Are you sure you want to delete this item?"
            )
          }
          onConfirm={handleDeleteConfirmation}
          isConfirming={deleteItemMutation.isPending}
          confirmLabel="Delete Item"
          variant="destructive"
        />
      </div>
    )
  },
)

ItemManagement.displayName = "Item Management"

export default ItemManagement