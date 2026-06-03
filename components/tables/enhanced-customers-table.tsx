"use client"

import { useMemo } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Users,
  RefreshCw,
  Download,
  Calendar,
  FileText,
  Mail,
  Phone,
  CreditCard,
  MoreHorizontal
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CustomerWithStats } from "@/types/customerTypes"
import type { Row } from "@tanstack/react-table"

import {
  EnhancedDataTable,
  createTableConfig,
  createToolbarConfig,
  createTextFilter,
  createSelectFilter,
  createBooleanFilter,
  createEditAction,
  createDeleteAction,
  createBulkDeleteAction,
  type EnhancedColumnDef,
} from '@/components/ui/enhanced-data-table'

interface CustomersTableProps {
  data: CustomerWithStats[]
  onEdit?: (customer: CustomerWithStats) => void
  onDelete?: (customerId: string) => void
  onCreate?: () => void
  onRefresh?: () => void
  onExport?: (data: CustomerWithStats[], format: string) => void
  title?: string
  isLoading?: boolean
}

export function EnhancedCustomersTable({
  data,
  onEdit = () => {},
  onDelete = () => {},
  onCreate = () => {},
  onRefresh = () => {},
  onExport = () => {},
  title = "Customers Management",
  isLoading = false
}: CustomersTableProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Summary stats
  const summary = useMemo(() => {
    const totalCustomers = data.length
    const activeCustomers = data.filter(c => c.isActive).length
    const totalRevenue = data.reduce((sum, customer) => sum + customer.totalRevenue, 0)

    return {
      total: totalCustomers,
      active: activeCustomers,
      totalRevenue,
    }
  }, [data])

  const columns = useMemo<EnhancedColumnDef<CustomerWithStats>[]>(() => [
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }: { row: Row<CustomerWithStats> }) => {
        const customer = row.original;
        const initials = customer.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{customer.name}</div>
              {customer.code && (
                <div className="text-xs text-muted-foreground">{customer.code}</div>
              )}
            </div>
          </div>
        );
      },
      options: {
        searchable: true,
        sortable: true,
        width: 250,
      },
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }: { row: Row<CustomerWithStats> }) => {
        const customer = row.original;
        return (
          <div className="space-y-1">
            {customer.email && (
              <div className="flex items-center gap-1 text-xs">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-1 text-xs">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{customer.phone}</span>
              </div>
            )}
          </div>
        );
      },
      options: {
        searchable: true,
        width: 200,
      },
    },
    {
      accessorKey: "totalRevenue",
      header: "Revenue",
      cell: ({ row }: { row: Row<CustomerWithStats> }) => {
        const revenue = row.getValue("totalRevenue") as number;
        return (
          <div className="flex items-center gap-1">
            <CreditCard className="h-3 w-3 text-green-600" />
            <span className="font-medium text-sm">{formatCurrency(revenue)}</span>
          </div>
        );
      },
      options: {
        sortable: true,
        isNumeric: true,
        align: 'right',
        width: 120,
      },
    },
    {
      accessorKey: "totalOrders",
      header: "Orders",
      cell: ({ row }: { row: Row<CustomerWithStats> }) => {
        const orders = row.getValue("totalOrders") as number;
        return (
          <Badge variant={orders > 10 ? "default" : orders > 5 ? "secondary" : "outline"} className="text-xs">
            {orders} orders
          </Badge>
        );
      },
      options: {
        sortable: true,
        isNumeric: true,
        width: 120,
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: { row: Row<CustomerWithStats> }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
      options: {
        filterable: true,
        width: 100,
      },
    },
    {
      accessorKey: "lastOrderDate",
      header: "Last Order",
      cell: ({ row }: { row: Row<CustomerWithStats> }) => {
        const lastOrderDate = row.getValue("lastOrderDate") as Date | null;
        if (!lastOrderDate) {
          return <span className="text-xs text-muted-foreground">Never</span>;
        }
        return (
          <div className="text-sm flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            {new Date(lastOrderDate).toLocaleDateString()}
          </div>
        );
      },
      options: {
        sortable: true,
        width: 120,
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }: { row: Row<CustomerWithStats> }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <div className="text-sm flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            {date.toLocaleDateString()}
          </div>
        )
      },
      options: {
        sortable: true,
        width: 120,
      },
    },
  ], [formatCurrency])

  const tableConfig = useMemo(() => createTableConfig({
    searchable: true,
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    paginated: true,
    showRowNumbers: false,
    stickyHeader: true,
    striped: true,
    hoverable: true,
    showFooter: true,
  }), [])

  const toolbarConfig = useMemo(() => createToolbarConfig({
    title: title,
    description: `${summary.total} customers | ${summary.active} active | ${formatCurrency(summary.totalRevenue)} total revenue`,
    actions: [
      {
        label: "Add Customer",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => onCreate(),
        variant: "default",
      },
      {
        label: "Refresh",
        icon: <RefreshCw className="h-4 w-4" />,
        onClick: () => onRefresh(),
        variant: "outline",
        disabled: () => isLoading,
      },
    ],
    bulkActions: [
      createBulkDeleteAction((selectedRows: CustomerWithStats[]) => {
        selectedRows.forEach((customer: CustomerWithStats) => onDelete(customer.id))
      }),
      {
        label: "Export Selected",
        icon: <Download className="h-4 w-4" />,
        onClick: (selectedRows: CustomerWithStats[]) => onExport(selectedRows, 'csv'),
        variant: "outline",
      },
      {
        label: "Deactivate Selected",
        icon: <Users className="h-4 w-4" />,
        onClick: (selectedRows: CustomerWithStats[]) => console.log("Deactivate:", selectedRows),
        variant: "outline",
      },
    ],
    filters: [
      createTextFilter("name", "Customer Name", "Search customers..."),
      createTextFilter("email", "Email", "Search by email..."),
      createSelectFilter("isActive", "Status", [
        { label: "Active", value: true },
        { label: "Inactive", value: false },
      ]),
      createBooleanFilter("hasOrders", "Has Orders"),
    ],
    search: {
      enabled: true,
      placeholder: "Search customers...",
    },
    refresh: {
      enabled: true,
      onRefresh,
    },
    export: {
      enabled: true,
      formats: ["csv", "xlsx", "pdf"],
      filename: "customers",
      customExporter: onExport,
    },
  }), [title, summary, isLoading, onCreate, onRefresh, onExport, onDelete, formatCurrency])

  const rowActions = useMemo(() => [
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (customer: CustomerWithStats) => onEdit(customer),
      variant: "ghost" as const,
    },
    {
      label: "Copy ID",
      icon: <FileText className="h-4 w-4" />,
      onClick: (customer: CustomerWithStats) => navigator.clipboard.writeText(customer.id),
      variant: "ghost" as const,
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (customer: CustomerWithStats) => onDelete(customer.id),
      variant: "ghost" as const,
      disabled: (customer: CustomerWithStats) => customer.isActive,
    },
  ], [onEdit, onDelete])

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      config={tableConfig}
      toolbar={toolbarConfig}
      loading={isLoading}
      onRowClick={(customer) => onEdit(customer)}
      emptyStateConfig={{
        enabled: true,
        title: "No customers found",
        description: "Start building your customer base by adding your first customer.",
        icon: <Users className="h-12 w-12 text-muted-foreground/50" />,
        action: {
          label: "Add Customer",
          onClick: onCreate,
        },
      }}
      loadingConfig={{
        enabled: true,
        skeletonRows: 10,
        loadingMessage: "Loading customers...",
      }}
      errorConfig={{
        enabled: true,
        retryEnabled: true,
        onRetry: onRefresh,
      }}
      customFooter={
        <div className="bg-muted/50 p-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Total Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{summary.active}</div>
              <div className="text-sm text-muted-foreground">Active Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
          </div>
        </div>
      }
      ariaLabel="Customers management table"
      ariaDescription="Table showing all customers with filtering, sorting, and bulk operations"
    />
  )
}
