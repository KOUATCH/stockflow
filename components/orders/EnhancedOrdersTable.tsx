"use client"

import React, { useState, useMemo } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DatePicker } from "@/components/ui/date-picker"
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  Receipt,
  Search,
  Settings,
  Truck,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { OrderStatus, OrderPaymentStatus } from '@/types/orders'
import {
  ExtendedClientOrder,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  formatCurrency,
  formatOrderNumber,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  calculateOrderProgress,
} from '@/types/orders'

interface EnhancedOrdersTableProps {
  orders: ExtendedClientOrder[]
}

export function EnhancedOrdersTable({ orders }: EnhancedOrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Advanced filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<OrderPaymentStatus | 'all'>('all')
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>(undefined)
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>(undefined)

  const columns: ColumnDef<ExtendedClientOrder>[] = [
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
      accessorKey: "orderNumber",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Order #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <div className="font-mono text-sm font-medium">
              {formatOrderNumber(order.orderNumber)}
            </div>
            <div className="text-xs text-muted-foreground">
              {order.orderLines.length} items
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <div className="font-medium">{order.customerName}</div>
            {order.customerEmail && (
              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
            )}
            {order.customerPhone && (
              <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as OrderStatus
        return (
          <Badge className={ORDER_STATUS_COLORS[status]}>
            {getOrderStatusLabel(status)}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value === 'all' ? true : row.getValue(id) === value
      },
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Payment
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const paymentStatus = row.getValue("paymentStatus") as OrderPaymentStatus
        const order = row.original
        return (
          <div>
            <Badge className={PAYMENT_STATUS_COLORS[paymentStatus]}>
              {getPaymentStatusLabel(paymentStatus)}
            </Badge>
            {order.advanceAmount > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Advance: {formatCurrency(order.advanceAmount)}
              </div>
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value === 'all' ? true : row.getValue(id) === value
      },
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
            {order.balanceAmount > 0 && (
              <div className="text-sm text-red-600">
                Due: {formatCurrency(order.balanceAmount)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "orderDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <div className="text-sm">{format(new Date(order.orderDate), 'MMM dd, yyyy')}</div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(order.orderDate), 'HH:mm')}
            </div>
            {order.expectedDate && (
              <div className="text-xs text-muted-foreground">
                Expected: {format(new Date(order.expectedDate), 'MMM dd')}
              </div>
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const rowDate = new Date(row.getValue(id) as string)
        const { from, to } = value as { from?: Date; to?: Date }

        if (!from && !to) return true
        if (from && !to) return rowDate >= from
        if (!from && to) return rowDate <= to
        if (from && to) return rowDate >= from && rowDate <= to

        return true
      },
    },
    {
      accessorKey: "deliveryProgress",
      header: "Progress",
      cell: ({ row }) => {
        const order = row.original
        const progress = calculateOrderProgress(order)
        return (
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">{progress}%</div>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original
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
              <DropdownMenuSeparator />
              <Link href={`/dashboard/orders/${order.id}`}>
                <Button variant="ghost" className="w-full justify-start px-2 py-1.5">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </Link>

              {/* Edit Order - Only for DRAFT and PENDING orders */}
              {['DRAFT', 'PENDING'].includes(order.status) && (
                <Link href={`/dashboard/orders/${order.id}/edit`}>
                  <Button variant="ghost" className="w-full justify-start px-2 py-1.5">
                    <Package className="mr-2 h-4 w-4" />
                    Edit Order
                  </Button>
                </Link>
              )}

              {/* Payment Management - Only when balance amount exists */}
              {order.balanceAmount > 0 && (
                <Link href={`/dashboard/orders/${order.id}/payment`}>
                  <Button variant="ghost" className="w-full justify-start px-2 py-1.5">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Payment
                  </Button>
                </Link>
              )}

              {/* Create Delivery - Only for confirmed and processing orders */}
              {['CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'PARTIALLY_DELIVERED'].includes(order.status) && (
                <Link href={`/dashboard/orders/${order.id}/delivery`}>
                  <Button variant="ghost" className="w-full justify-start px-2 py-1.5">
                    <Truck className="mr-2 h-4 w-4" />
                    Create Delivery
                  </Button>
                </Link>
              )}

              {/* Always show order number for copying */}
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1.5"
                onClick={() => navigator.clipboard.writeText(order.orderNumber)}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Copy Order #
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Apply advanced filters
  const filteredData = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter

      const orderDate = new Date(order.orderDate)
      const matchesDateRange =
        (!dateFromFilter || orderDate >= dateFromFilter) &&
        (!dateToFilter || orderDate <= dateToFilter)

      return matchesStatus && matchesPayment && matchesDateRange
    })
  }, [orders, statusFilter, paymentFilter, dateFromFilter, dateToFilter])

  const table = useReactTable({
    data: filteredData,
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
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const clearFilters = () => {
    setGlobalFilter('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setDateFromFilter(undefined)
    setDateToFilter(undefined)
    table.resetColumnFilters()
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-600" />
          Client Orders ({filteredData.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Advanced Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search all columns..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={OrderStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
                <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                <SelectItem value={OrderStatus.READY_FOR_PICKUP}>Ready for Pickup</SelectItem>
                <SelectItem value={OrderStatus.PARTIALLY_DELIVERED}>Partially Delivered</SelectItem>
                <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                <SelectItem value={OrderStatus.RETURNED}>Returned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as OrderPaymentStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value={OrderPaymentStatus.UNPAID}>Unpaid</SelectItem>
                <SelectItem value={OrderPaymentStatus.ADVANCE_PAID}>Advance Paid</SelectItem>
                <SelectItem value={OrderPaymentStatus.PARTIALLY_PAID}>Partially Paid</SelectItem>
                <SelectItem value={OrderPaymentStatus.FULLY_PAID}>Fully Paid</SelectItem>
                <SelectItem value={OrderPaymentStatus.REFUNDED}>Refunded</SelectItem>
                <SelectItem value={OrderPaymentStatus.DISPUTED}>Disputed</SelectItem>
              </SelectContent>
            </Select>

            <DatePicker
              date={dateFromFilter}
              onDateChange={setDateFromFilter}
              placeholder="From date"
              className="w-full"
            />

            <DatePicker
              date={dateToFilter}
              onDateChange={setDateToFilter}
              placeholder="To date"
              className="w-full"
            />

            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>

            <div className="text-sm text-muted-foreground flex items-center">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          </div>
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
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
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No orders found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
