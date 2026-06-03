# Enhanced Data Table System

A comprehensive, enterprise-grade data table component system built for the StockFlow retail management application. This system provides a unified, modern, and feature-rich solution for displaying and managing tabular data across the entire application.

## 🚀 Features

### Core Features
- **Advanced Filtering**: Multi-type filters (text, select, date, boolean, range)
- **Global Search**: Search across all visible columns
- **Sorting**: Multi-column sorting with visual indicators
- **Pagination**: Advanced pagination with page jumping
- **Row Selection**: Single and bulk row selection
- **Column Management**: Show/hide columns, resizing, reordering
- **Export**: CSV, Excel, PDF export with filtering
- **Responsive Design**: Mobile-first responsive layout

### Enterprise Features
- **Professional Styling**: Modern, consistent design system
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Comprehensive error states with recovery options
- **Empty States**: Contextual empty states with actions
- **Accessibility**: Full ARIA support and keyboard navigation
- **TypeScript**: Complete type safety and IntelliSense
- **Performance**: Virtualization for large datasets
- **Internationalization**: Built-in i18n support

### Business Features
- **Bulk Operations**: Multi-row actions with confirmation
- **Analytics**: Built-in metrics and statistics
- **Audit Trail**: Action logging and user tracking
- **Customization**: Themes, layouts, and branding
- **Integration**: Works with existing notification and error systems

## 📦 Installation

The enhanced data table system is already included in your StockFlow application. Simply import the components you need:

```typescript
import {
  EnhancedDataTable,
  createTableConfig,
  createToolbarConfig,
  type EnhancedColumnDef,
} from "@/components/ui/enhanced-data-table"
```

## 🎯 Quick Start

### Basic Table

```typescript
import { EnhancedDataTable, createTableConfig } from "@/components/ui/enhanced-data-table"

const columns: EnhancedColumnDef<MyData>[] = [
  {
    accessorKey: "name",
    header: "Name",
    options: { searchable: true, sortable: true }
  },
  {
    accessorKey: "status",
    header: "Status",
    options: { filterable: true }
  }
]

function MyTable({ data }: { data: MyData[] }) {
  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      config={createTableConfig()}
    />
  )
}
```

### Advanced Table with All Features

```typescript
import {
  EnhancedDataTable,
  createTableConfig,
  createToolbarConfig,
  createTextFilter,
  createSelectFilter,
  createBulkDeleteAction,
} from "@/components/ui/enhanced-data-table"

function AdvancedTable() {
  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span>{row.getValue("name")}</span>
        </div>
      ),
      options: {
        searchable: true,
        sortable: true,
        width: 200,
      }
    },
    // ... more columns
  ], [])

  const config = createTableConfig({
    searchable: true,
    filterable: true,
    exportable: true,
    selectable: true,
    striped: true,
  })

  const toolbar = createToolbarConfig({
    title: "Product Management",
    description: "Manage your product catalog",
    actions: [
      {
        label: "Add Product",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => console.log("Add product"),
      }
    ],
    bulkActions: [
      createBulkDeleteAction((items) => console.log("Delete", items))
    ],
    filters: [
      createTextFilter("name", "Product Name"),
      createSelectFilter("category", "Category", categoryOptions),
    ],
    export: {
      enabled: true,
      formats: ["csv", "xlsx", "pdf"],
      customExporter: handleExport,
    }
  })

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      config={config}
      toolbar={toolbar}
      loading={loading}
      error={error}
      onRowClick={handleRowClick}
      onSelectionChange={handleSelectionChange}
    />
  )
}
```

## 🎨 Styling and Themes

### Theme Configuration

```typescript
import { createThemeConfig } from "@/components/ui/enhanced-data-table"

const theme = createThemeConfig({
  variant: "modern",        // "default" | "minimal" | "modern" | "enterprise"
  size: "md",              // "sm" | "md" | "lg"
  colorScheme: "light",    // "light" | "dark" | "auto"
  shadowLevel: "sm",       // "none" | "sm" | "md" | "lg"
  roundedCorners: true,
  borderStyle: "light",    // "none" | "light" | "medium" | "heavy"
})

<EnhancedDataTable theme={theme} ... />
```

### Custom Styling

The table system uses Tailwind CSS and follows the application's design system. You can customize styling through:

- **CSS Classes**: Standard Tailwind utility classes
- **CSS Variables**: Component-level CSS custom properties
- **Theme Variants**: Pre-built theme configurations
- **Custom Components**: Override individual components

## 🔧 Configuration

### Table Configuration

```typescript
const config = createTableConfig({
  searchable: true,         // Enable global search
  sortable: true,          // Enable column sorting
  filterable: true,        // Enable column filters
  exportable: true,        // Enable data export
  selectable: true,        // Enable row selection
  paginated: true,         // Enable pagination
  resizable: false,        // Enable column resizing
  virtualizeRows: false,   // Enable row virtualization
  showRowNumbers: true,    // Show row numbers
  showFooter: false,       // Show table footer
  stickyHeader: true,      // Sticky header on scroll
  compactMode: false,      // Compact row spacing
  striped: true,           // Alternating row colors
  bordered: false,         // Table borders
  hoverable: true,         // Row hover effects
})
```

### Column Configuration

```typescript
const column: EnhancedColumnDef<MyData> = {
  accessorKey: "name",
  header: "Product Name",
  cell: ({ row }) => <CustomCell data={row.original} />,

  // Enhanced options
  options: {
    searchable: true,        // Include in search
    filterable: true,        // Show filter for this column
    sortable: true,         // Enable sorting
    resizable: true,        // Allow column resizing
    hideable: true,         // Allow hiding column
    exportable: true,       // Include in exports
    width: 200,            // Fixed width
    minWidth: 100,         // Minimum width
    maxWidth: 300,         // Maximum width
  },

  // Filter configuration
  filterType: "text",       // Filter type
  filterOptions: [...],     // Filter options for select filters

  // Custom formatting
  formatValue: (value) => formatCurrency(value),
  sticky: "left",          // Pin column to left/right
}
```

## 📊 Examples

### Inventory Management Table

See `examples/inventory-table-example.tsx` for a complete implementation showing:

- Product listing with images and status
- Multi-level filtering (category, status, location)
- Bulk operations (delete, export, status update)
- Custom cell rendering with badges and icons
- Low stock alerts and visual indicators
- Export functionality with custom formatting

### Migration from Legacy Tables

Before (Legacy Implementation):
```typescript
// Basic table with limited functionality
function OldTable({ data }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.status}</td>
            <td>
              <button onClick={() => edit(item)}>Edit</button>
              <button onClick={() => delete(item)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

After (Enhanced Implementation):
```typescript
// Feature-rich table with enterprise capabilities
function NewTable({ data }) {
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      options: { searchable: true, sortable: true }
    },
    {
      accessorKey: "status",
      header: "Status",
      options: { filterable: true }
    }
  ]

  return (
    <EnhancedDataTable
      data={data}
      columns={columns}
      config={createTableConfig({
        searchable: true,
        filterable: true,
        exportable: true,
        selectable: true,
      })}
      toolbar={createToolbarConfig({
        title: "Data Management",
        actions: [editAction, deleteAction],
        filters: [textFilter, statusFilter],
      })}
    />
  )
}
```

## 🔌 Integration

### With Server Actions

```typescript
// Using with server actions and error handling
import { inventoryAction } from "@/actions/inventory"

function InventoryTable() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshData = async () => {
    setLoading(true)
    const result = await inventoryAction.getItems()

    if (result.success) {
      setData(result.data)
      setError(null)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <EnhancedDataTable
      data={data}
      loading={loading}
      error={error}
      toolbar={{
        refresh: { enabled: true, onRefresh: refreshData }
      }}
    />
  )
}
```

### With Notifications

```typescript
// Integration with notification system
import { notify } from "@/lib/notifications/notify"

function TableWithNotifications() {
  const handleBulkDelete = async (items) => {
    try {
      await deleteItems(items)
      notify({
        title: "Success",
        description: `${items.length} items deleted successfully`,
      })
    } catch (error) {
      notify({
        title: "Error",
        description: "Failed to delete items",
        variant: "destructive",
      })
    }
  }

  return (
    <EnhancedDataTable
      toolbar={{
        bulkActions: [
          createBulkDeleteAction(handleBulkDelete)
        ]
      }}
    />
  )
}
```

## 🎛️ API Reference

### Components

- **EnhancedDataTable**: Main table component
- **EnhancedTableToolbar**: Toolbar with search, filters, and actions
- **EnhancedTablePagination**: Advanced pagination component
- **EnhancedTableFilters**: Multi-type filtering system
- **TableColumnVisibility**: Column show/hide management
- **TableEmptyState**: Empty state with contextual messaging
- **TableLoadingState**: Loading states with skeletons
- **TableErrorState**: Error handling with recovery options

### Helper Functions

- **createTableConfig()**: Create table configuration
- **createToolbarConfig()**: Create toolbar configuration
- **createThemeConfig()**: Create theme configuration
- **createTextFilter()**: Create text filter
- **createSelectFilter()**: Create select filter
- **createBooleanFilter()**: Create boolean filter
- **createDateFilter()**: Create date filter
- **createBulkDeleteAction()**: Create bulk delete action
- **createEditAction()**: Create edit action

### Types

All TypeScript types are exported for full type safety:

- **EnhancedDataTableProps**: Main component props
- **TableConfig**: Table configuration options
- **ToolbarConfig**: Toolbar configuration
- **FilterConfig**: Filter configuration
- **ActionButton**: Action button configuration
- **BulkAction**: Bulk action configuration
- **EnhancedColumnDef**: Enhanced column definition

## 🐛 Troubleshooting

### Common Issues

1. **Columns not rendering correctly**
   - Ensure `accessorKey` matches your data structure
   - Check that column definitions are memoized

2. **Filters not working**
   - Verify filter keys match column accessorKeys
   - Ensure filterable is enabled in table config

3. **Performance with large datasets**
   - Enable virtualization: `virtualizeRows: true`
   - Implement server-side pagination
   - Use skeleton loading states

4. **Styling conflicts**
   - Check Tailwind CSS conflicts
   - Verify theme configuration
   - Use custom CSS classes for overrides

### Performance Tips

- Use `useMemo` for column definitions
- Enable virtualization for >1000 rows
- Implement server-side operations for large datasets
- Use skeleton loading for better perceived performance

## 📈 Roadmap

### Current Version (v1.0)
- ✅ Core table functionality
- ✅ Advanced filtering and search
- ✅ Export capabilities
- ✅ Professional styling
- ✅ Error handling integration

### Upcoming Features (v1.1)
- 🔄 Real-time data updates
- 🔄 Advanced column operations
- 🔄 Custom filter components
- 🔄 Enhanced virtualization
- 🔄 Improved mobile experience

### Future Enhancements (v2.0)
- 📋 Drag-and-drop row reordering
- 📊 Inline editing capabilities
- 🎨 Advanced theming system
- 📱 Mobile-specific optimizations
- 🔒 Advanced security features

## 🤝 Contributing

This table system is part of the StockFlow application. For improvements or bug fixes:

1. Update the relevant component files
2. Test with existing table implementations
3. Update documentation and examples
4. Ensure backward compatibility

## 📄 License

Part of the StockFlow Retail Management System. All rights reserved.
