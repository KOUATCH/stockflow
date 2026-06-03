"use client"

import { useState, useMemo } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  Download,
  SlidersHorizontal,
  Calendar,
  FileText
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryDTO } from "@/types/category"

interface CategoriesTableProps {
  data: CategoryDTO[]
  onEdit?: (category: CategoryDTO) => void
  onDelete?: (categoryId: string) => void
  onCreate?: () => void
  onRefresh?: () => void
  onExport?: (data: CategoryDTO[]) => void
  title?: string
  isLoading?: boolean
}

export function CategoriesTable({
  data,
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
  onExport,
  title = "Categories Management",
  isLoading = false
}: CategoriesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<CategoryDTO>[] = [
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
      accessorKey: "imageUrl",
      header: "Image",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center">
            <img
              src={category.imageUrl || "/placeholder.svg"}
              alt={category.title}
              className="h-10 w-10 rounded-md object-cover border border-slate-200 dark:border-slate-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Category Name
            {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.getValue("slug")}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null
        return (
          <div className="max-w-[200px] text-sm text-slate-600 dark:text-slate-400 truncate">
            {description || "No description"}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Created Date
            {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <div className="text-sm flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {date.toLocaleDateString()}
          </div>
        )
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        const date = new Date(row.getValue("updatedAt"))
        return (
          <div className="text-sm flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {date.toLocaleDateString()}
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(category)}
              className="h-8 w-8 p-0 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
              title="Edit category"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(category.id)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit?.(category)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(category.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Summary stats
  const summary = useMemo(() => {
    const totalCategories = data.length
    const filteredCategories = table.getFilteredRowModel().rows.length
    const selectedCategories = Object.keys(rowSelection).length

    return {
      total: totalCategories,
      filtered: filteredCategories,
      selected: selectedCategories,
    }
  }, [data.length, table.getFilteredRowModel().rows.length, rowSelection])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {summary.total} categories | {summary.filtered} filtered
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(table.getFilteredRowModel().rows.map(row => row.original))}
              className="bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          <Button
            size="sm"
            onClick={onCreate}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search categories..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 bg-white/80 dark:bg-slate-800/80"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              View
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
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
      </div>

      {/* Selected rows info */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
          <span>{Object.keys(rowSelection).length} of {table.getFilteredRowModel().rows.length} row(s) selected</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-200/60 dark:border-slate-700/60">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-slate-700 dark:text-slate-300"
                    >
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-slate-200/40 dark:border-slate-700/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-4"
                    >
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
                  className="h-24 text-center text-slate-500 dark:text-slate-400"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60">
            <TableRow>
              <TableCell colSpan={2} className="font-medium">
                Summary
              </TableCell>
              <TableCell className="font-medium">
                Total Categories: {summary.total}
              </TableCell>
              <TableCell className="font-medium">
                Filtered: {summary.filtered}
              </TableCell>
              <TableCell className="font-medium">
                Selected: {summary.selected}
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-slate-600 dark:text-slate-400">
          {Object.keys(rowSelection).length > 0 && (
            <span>{Object.keys(rowSelection).length} of {table.getFilteredRowModel().rows.length} row(s) selected. </span>
          )}
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}