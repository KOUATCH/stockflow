"use client"

import { useState, useMemo } from "react"
import type { ComponentProps } from "react"
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
  Receipt,
  RefreshCw,
  Download,
  SlidersHorizontal,
  Calendar,
  CreditCard,
  RotateCcw as RefundIcon,
  Eye,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  DollarSign
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePayments } from "@/hooks/usePayments"
import type { OrderPaymentMethod, OrderPaymentStatus, OrderPaymentWithDetails } from "@/types/payments"
import { formatDistanceToNow, format } from "date-fns"

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>
type PaymentBadgeConfig = {
  variant: BadgeVariant
  icon: LucideIcon
  label: string
}

interface EnhancedPaymentsTableProps {
  organizationId: string
  onViewPayment?: (payment: OrderPaymentWithDetails) => void
  onEditPayment?: (payment: OrderPaymentWithDetails) => void
  onRefundPayment?: (payment: OrderPaymentWithDetails) => void
  onGenerateReceipt?: (payment: OrderPaymentWithDetails) => void
}

type PaymentsTablePayload = {
  payments: OrderPaymentWithDetails[]
  pagination?: {
    current: number
    total: number
    count: number
    limit: number
  }
}

export function EnhancedPaymentsTable({
  organizationId,
  onViewPayment,
  onEditPayment,
  onRefundPayment,
  onGenerateReceipt,
}: EnhancedPaymentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading, error, refetch } = usePayments(
    organizationId,
    {},
    currentPage,
    pageSize
  )

  const paymentsPayload = data?.data as PaymentsTablePayload | undefined
  const payments = paymentsPayload?.payments || []
  const pagination = paymentsPayload?.pagination

  const getStatusBadge = (status: OrderPaymentStatus) => {
    const configs: Record<string, PaymentBadgeConfig> = {
      COMPLETED: { variant: "default" as const, icon: CheckCircle, label: "Completed" },
      UNPAID: { variant: "outline" as const, icon: AlertCircle, label: "Unpaid" },
      PENDING: { variant: "secondary" as const, icon: AlertCircle, label: "Pending" },
      PARTIALLY_PAID: { variant: "secondary" as const, icon: AlertCircle, label: "Partial" },
      PARTIAL: { variant: "secondary" as const, icon: AlertCircle, label: "Partial" },
      FULLY_PAID: { variant: "default" as const, icon: CheckCircle, label: "Paid" },
      PAID: { variant: "default" as const, icon: CheckCircle, label: "Paid" },
      REFUNDED: { variant: "destructive" as const, icon: RefundIcon, label: "Refunded" },
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

  const getMethodBadge = (method: OrderPaymentMethod) => {
    const configs: Record<string, PaymentBadgeConfig> = {
      CASH: { variant: "default" as const, icon: DollarSign, label: "Cash" },
      CARD: { variant: "default" as const, icon: CreditCard, label: "Card" },
      CREDIT_CARD: { variant: "default" as const, icon: CreditCard, label: "Credit Card" },
      DEBIT_CARD: { variant: "default" as const, icon: CreditCard, label: "Debit Card" },
      BANK_TRANSFER: { variant: "secondary" as const, icon: CreditCard, label: "Bank Transfer" },
      MOBILE_MONEY: { variant: "secondary" as const, icon: CreditCard, label: "Mobile Money" },
      CHEQUE: { variant: "outline" as const, icon: CreditCard, label: "Cheque" },
      STORE_CREDIT: { variant: "outline" as const, icon: CreditCard, label: "Store Credit" },
      OTHER: { variant: "outline" as const, icon: CreditCard, label: "Other" },
    }

    const config = configs[method] || { variant: "outline" as const, icon: CreditCard, label: method }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const columns: ColumnDef<OrderPaymentWithDetails>[] = useMemo(
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
        accessorKey: "paymentNumber",
        header: "Payment #",
        cell: ({ row }) => (
          <div className="font-medium text-primary">
            {row.getValue("paymentNumber")}
          </div>
        ),
      },
      {
        accessorKey: "order.orderNumber",
        header: "Order #",
        cell: ({ row }) => {
          const order = row.original.order
          return order ? (
            <div className="font-medium">
              {order.orderNumber}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        accessorKey: "order.customerName",
        header: "Customer",
        cell: ({ row }) => {
          const order = row.original.order
          return order ? (
            <div className="max-w-[150px] truncate">
              {order.customerName}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"))
          return (
            <div className="font-medium">
              ${amount.toFixed(2)}
            </div>
          )
        },
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => getMethodBadge(row.getValue("method")),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
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
        accessorKey: "paymentDate",
        header: "Date",
        cell: ({ row }) => {
          const date = new Date(row.getValue("paymentDate"))
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
            <span className="text-muted-foreground">System</span>
          )
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const payment = row.original
          const canRefundPayment = payment.status === "PAID" || payment.status === "FULLY_PAID"

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
                  onClick={() => navigator.clipboard.writeText(payment.id)}
                >
                  Copy payment ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onViewPayment && (
                  <DropdownMenuItem
                    onClick={() => onViewPayment(payment)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </DropdownMenuItem>
                )}
                {onGenerateReceipt && (
                  <DropdownMenuItem
                    onClick={() => onGenerateReceipt(payment)}
                    className="cursor-pointer"
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Generate receipt
                  </DropdownMenuItem>
                )}
                {onRefundPayment && canRefundPayment && (
                  <DropdownMenuItem
                    onClick={() => onRefundPayment(payment)}
                    className="cursor-pointer"
                  >
                    <RefundIcon className="mr-2 h-4 w-4" />
                    Process refund
                  </DropdownMenuItem>
                )}
                {onEditPayment && payment.status === "PENDING" && (
                  <DropdownMenuItem
                    onClick={() => onEditPayment(payment)}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit payment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [onViewPayment, onEditPayment, onRefundPayment, onGenerateReceipt]
  )

  const table = useReactTable({
    data: payments,
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
            <p className="text-sm text-muted-foreground">Failed to load payments</p>
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
              placeholder="Filter payments..."
              value={
                (table.getColumn("paymentNumber")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("paymentNumber")?.setFilterValue(event.target.value)
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
                    <CreditCard className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No payments found</p>
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
