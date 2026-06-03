/**
 * Enhanced Inventory Table Example
 * Demonstrates migration from old table to new enhanced data table
 */

"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  EnhancedDataTable,
  createTableConfig,
  createToolbarConfig,
  createThemeConfig,
  createTextFilter,
  createSelectFilter,
  createBooleanFilter,
  createEditAction,
  createDeleteAction,
  createViewAction,
  createBulkDeleteAction,
  createBulkExportAction,
  EnhancedColumnDef,
} from "../index"

// Badge component for status
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Icons
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  Download,
  Upload,
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

// Sample inventory data type
interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  brand: string
  quantity: number
  price: number
  cost: number
  status: "active" | "inactive" | "discontinued"
  lowStock: boolean
  lastUpdated: string
  location: string
}

// Sample data
const SAMPLE_INVENTORY: InventoryItem[] = [
  {
    id: "1",
    name: "Premium Coffee Beans",
    sku: "PCB-001",
    category: "Beverages",
    brand: "Premium Coffee Co.",
    quantity: 150,
    price: 24.99,
    cost: 12.50,
    status: "active",
    lowStock: false,
    lastUpdated: "2024-01-15",
    location: "Warehouse A",
  },
  {
    id: "2",
    name: "Organic Tea Bags",
    sku: "OTB-002",
    category: "Beverages",
    brand: "Organic Tea Ltd.",
    quantity: 5,
    price: 18.99,
    cost: 9.25,
    status: "active",
    lowStock: true,
    lastUpdated: "2024-01-14",
    location: "Warehouse B",
  },
  // Add more sample data as needed
]

interface EnhancedInventoryTableProps {
  data?: InventoryItem[]
  loading?: boolean
  error?: string | null
  onEdit?: (item: InventoryItem) => void
  onDelete?: (item: InventoryItem) => void
  onView?: (item: InventoryItem) => void
  onAddNew?: () => void
  onRefresh?: () => void
  onBulkDelete?: (items: InventoryItem[]) => void
  onExport?: (data: InventoryItem[], format: string) => void
}

export function EnhancedInventoryTable({
  data = SAMPLE_INVENTORY,
  loading = false,
  error = null,
  onEdit = (item) => console.log("Edit:", item),
  onDelete = (item) => console.log("Delete:", item),
  onView = (item) => console.log("View:", item),
  onAddNew = () => console.log("Add new item"),
  onRefresh = () => console.log("Refresh data"),
  onBulkDelete = (items) => console.log("Bulk delete:", items),
  onExport = (data, format) => console.log("Export:", format, data),
}: EnhancedInventoryTableProps) {

  // Define table columns with enhanced features
  const columns = useMemo<EnhancedColumnDef<InventoryItem>[]>(() => [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-sm text-muted-foreground">{row.original.sku}</div>
          </div>
        </div>
      ),
      options: {
        searchable: true,
        sortable: true,
        filterable: true,
        width: 250,
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("category")}
        </Badge>
      ),
      options: {
        searchable: true,
        filterable: true,
        width: 120,
      },
    },
    {
      accessorKey: "brand",
      header: "Brand",
      options: {
        searchable: true,
        filterable: true,
        width: 150,
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number
        const lowStock = row.original.lowStock

        return (
          <div className="flex items-center gap-2">
            <span className={lowStock ? "text-destructive font-medium" : ""}>
              {quantity}
            </span>
            {lowStock && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )
      },
      options: {
        sortable: true,
        filterable: true,
        isNumeric: true,
        align: "right",
        width: 100,
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"))
        return (
          <div className="font-medium">
            ${price.toFixed(2)}
          </div>
        )
      },
      options: {
        sortable: true,
        isNumeric: true,
        align: "right",
        width: 100,
      },
    },
    {
      accessorKey: "cost",
      header: "Cost",
      cell: ({ row }) => {
        const cost = parseFloat(row.getValue("cost"))
        return (
          <div className="text-muted-foreground">
            ${cost.toFixed(2)}
          </div>
        )
      },
      options: {
        sortable: true,
        isNumeric: true,
        align: "right",
        width: 100,
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variants = {
          active: "default",
          inactive: "secondary",
          discontinued: "destructive",
        } as const

        return (
          <Badge variant={variants[status as keyof typeof variants]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
      options: {
        filterable: true,
        width: 120,
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      options: {
        filterable: true,
        width: 120,
      },
    },
    {
      accessorKey: "lastUpdated",
      header: "Last Updated",
      cell: ({ row }) => {
        const date = new Date(row.getValue("lastUpdated"))
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </div>
        )
      },
      options: {
        sortable: true,
        width: 120,
      },
    },
  ], [])

  // Table configuration
  const tableConfig = useMemo(() => createTableConfig({
    searchable: true,
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    paginated: true,
    showRowNumbers: true,
    stickyHeader: true,
    striped: true,
    hoverable: true,
  }), [])

  // Toolbar configuration
  const toolbarConfig = useMemo(() => createToolbarConfig({
    title: "Inventory Management",
    description: "Manage your product inventory with advanced filtering and bulk operations",
    actions: [
      {
        label: "Add Item",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => onAddNew(),
        variant: "default",
      },
      {
        label: "Import",
        icon: <Upload className="h-4 w-4" />,
        onClick: () => console.log("Import clicked"),
        variant: "outline",
      },
    ],
    bulkActions: [
      createBulkDeleteAction(onBulkDelete),
      createBulkExportAction((selectedRows) => onExport(selectedRows, "csv")),
      {
        label: "Update Status",
        icon: <CheckCircle className="h-4 w-4" />,
        onClick: (selectedRows) => console.log("Update status:", selectedRows),
        variant: "outline",
      },
    ],
    filters: [
      createTextFilter("name", "Product Name", "Search products..."),
      createSelectFilter("category", "Category", [
        { label: "Beverages", value: "Beverages" },
        { label: "Food", value: "Food" },
        { label: "Electronics", value: "Electronics" },
      ]),
      createSelectFilter("status", "Status", [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Discontinued", value: "discontinued" },
      ]),
      createBooleanFilter("lowStock", "Low Stock Only"),
      createSelectFilter("location", "Location", [
        { label: "Warehouse A", value: "Warehouse A" },
        { label: "Warehouse B", value: "Warehouse B" },
        { label: "Store Front", value: "Store Front" },
      ]),
    ],
    search: {
      enabled: true,
      placeholder: "Search inventory...",
    },
    refresh: {
      enabled: true,
      onRefresh,
    },
    export: {
      enabled: true,
      formats: ["csv", "xlsx", "pdf"],
      customExporter: onExport,
    },
  }), [onAddNew, onRefresh, onBulkDelete, onExport])

  // Theme configuration
  const themeConfig = useMemo(() => createThemeConfig({
    variant: "modern",
    size: "md",
    shadowLevel: "sm",
    roundedCorners: true,
  }), [])

  // Row actions configuration
  const rowActions = useMemo(() => [
    createViewAction(onView),
    createEditAction(onEdit),
    createDeleteAction(onDelete, (row) => row.status === "discontinued"),
  ], [onView, onEdit, onDelete])

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      config={tableConfig}
      toolbar={toolbarConfig}
      theme={themeConfig}
      loading={loading}
      error={error}
      onRowClick={(row) => onView(row)}
      onSelectionChange={(selectedRows) => console.log("Selection changed:", selectedRows)}
      emptyStateConfig={{
        enabled: true,
        title: "No inventory items",
        description: "Start building your inventory by adding your first product.",
        icon: <Package className="h-12 w-12 text-muted-foreground/50" />,
        action: {
          label: "Add Item",
          onClick: onAddNew,
        },
      }}
      loadingConfig={{
        enabled: true,
        skeletonRows: 8,
        loadingMessage: "Loading inventory data...",
      }}
      errorConfig={{
        enabled: true,
        retryEnabled: true,
        onRetry: onRefresh,
      }}
      ariaLabel="Inventory management table"
      ariaDescription="Table showing all inventory items with filtering and bulk operations"
    />
  )
}

// Migration Guide Example
export const MIGRATION_EXAMPLE = {
  before: `
// OLD TABLE IMPLEMENTATION
function OldInventoryTable({ data, loading }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>
                <button onClick={() => edit(item)}>Edit</button>
                <button onClick={() => delete(item)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
  `,
  after: `
// NEW ENHANCED TABLE IMPLEMENTATION
function NewInventoryTable({ data, loading }) {
  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Product Name",
      options: { searchable: true, sortable: true }
    },
    {
      accessorKey: "category",
      header: "Category",
      options: { filterable: true }
    },
    // ... more columns
  ], [])

  const config = createTableConfig({
    searchable: true,
    sortable: true,
    filterable: true,
    exportable: true,
    selectable: true,
  })

  const toolbar = createToolbarConfig({
    title: "Inventory Management",
    actions: [{ label: "Add Item", onClick: onAdd }],
    filters: [
      createTextFilter("name", "Product Name"),
      createSelectFilter("category", "Category", options)
    ],
  })

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      config={config}
      toolbar={toolbar}
      loading={loading}
    />
  )
}
  `,
  benefits: [
    "✅ Built-in search, filtering, and sorting",
    "✅ Professional loading and error states",
    "✅ Bulk operations and row selection",
    "✅ Export functionality (CSV, Excel, PDF)",
    "✅ Responsive design and accessibility",
    "✅ Consistent styling across all tables",
    "✅ Advanced column features (resizing, hiding)",
    "✅ Enterprise-grade error handling",
    "✅ Customizable themes and layouts",
    "✅ TypeScript support with full type safety",
  ],
}

export default EnhancedInventoryTable