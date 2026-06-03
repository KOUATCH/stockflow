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
  Search,
  RefreshCw,
  Download,
  SlidersHorizontal,
  RotateCcw as RefundIcon,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  DollarSign
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRefunds } from "@/hooks/usePayments"
import type { PaymentRefundWithDetails } from "@/types/payments"
import type { RefundStatus } from "@prisma/client"
import { format } from "date-fns"

interface EnhancedRefundsTableProps {
  organizationId: string
  onViewRefund?: (refund: PaymentRefundWithDetails) => void
  onUpdateRefundStatus?: (refund: PaymentRefundWithDetails, status: RefundStatus) => void
}

type RefundsTablePayload = {
  refunds: PaymentRefundWithDetails[]
  pagination?: {
    current: number
    total: number
    count: number
    limit: number
  }
}

export function EnhancedRefundsTable({
  organizationId,
  onViewRefund,
  onUpdateRefundStatus,
}: EnhancedRefundsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading, error, refetch } = useRefunds(
    organizationId,
    {},
    currentPage,
    pageSize
  )

  const refundsPayload = data?.data as RefundsTablePayload | undefined
  const refunds = refundsPayload?.refunds || []
  const pagination = refundsPayload?.pagination

  const getStatusBadge = (status: RefundStatus) => {
    const configs = {
      PENDING: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      APPROVED: { variant: "default" as const, icon: CheckCircle, label: "Approved" },
      PROCESSED: { variant: "default" as const, icon: CheckCircle, label: "Processed" },
      FAILED: { variant: "destructive" as const, icon: X, label: "Failed" },
      CANCELLED: { variant: "outline" as const, icon: X, label: "Cancelled" },
    }

    const config = configs[status] || { variant: "outline" as const, icon: AlertCircle, label: status }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const columns: ColumnDef<PaymentRefundWithDetails>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
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
        accessorKey: "refundNumber",
        header: "Refund #",
        cell: ({ row }) => (
          <div className="font-medium text-primary">
            {row.getValue("refundNumber")}
          </div>
        ),
      },
      {
        accessorKey: "payment.paymentNumber",
        header: "Payment #",
        cell: ({ row }) => {
          const payment = row.original.payment
          return payment ? (
            <div className="font-medium">
              {payment.paymentNumber}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        accessorKey: "amount",
        header: "Refund Amount",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"))
          const payment = row.original.payment
          const originalAmount = payment?.amount || 0
          const isPartial = amount < originalAmount

          return (
            <div className="flex flex-col">
              <span className="font-medium">
                ${amount.toFixed(2)}
              </span>
              {isPartial && (
                <span className="text-xs text-muted-foreground">
                  of ${originalAmount.toFixed(2)}
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => {
          const reason = row.getValue("reason") as string
          return (
            <div className="max-w-[200px] truncate" title={reason}>
              {reason}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: "createdAt",
        header: "Requested",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"))
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {format(date, "MMM dd, yyyy")}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(date, "HH:mm")}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "processedAt",
        header: "Processed",
        cell: ({ row }) => {
          const processedAt = row.getValue("processedAt") as Date | null
          if (!processedAt) {
            return <span className="text-muted-foreground">-</span>
          }

          const date = new Date(processedAt)
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {format(date, "MMM dd, yyyy")}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(date, "HH:mm")}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "processedBy.name",
        header: "Processed By",
        cell: ({ row }) => {
          const processedBy = row.original.processedBy
          return processedBy ? (
            <div className="max-w-[120px] truncate">
              {processedBy.name}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const refund = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(refund.id)}
                >
                  Copy refund ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onViewRefund && (
                  <DropdownMenuItem
                    onClick={() => onViewRefund(refund)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </DropdownMenuItem>
                )}
                {onUpdateRefundStatus && refund.status === "PENDING" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onUpdateRefundStatus(refund, "APPROVED")}
                      className="cursor-pointer"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateRefundStatus(refund, "CANCELLED")}
                      className="cursor-pointer text-destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}
                {onUpdateRefundStatus && refund.status === "APPROVED" && (
                  <DropdownMenuItem
                    onClick={() => onUpdateRefundStatus(refund, "PROCESSED")}
                    className="cursor-pointer"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Mark processed
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [onViewRefund, onUpdateRefundStatus]
  )

  const table = useReactTable({
    data: refunds,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load refunds</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter refunds..."
              value={
                (table.getColumn("refundNumber")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("refundNumber")?.setFilterValue(event.target.value)
              }
              className="pl-8 max-w-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                View
                <ChevronDown className="ml-2 h-4 w-4" />
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
                      {column.id.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-left">
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
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
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
                  <div className="flex flex-col items-center justify-center">
                    <RefundIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No refunds found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Page {pagination.current} of {pagination.total}
            </p>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(pagination.total, currentPage + 1))}
                disabled={currentPage >= pagination.total || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
