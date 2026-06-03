/**
 * Enhanced Data Table - Main Export
 * Professional enterprise-grade data table system
 */

// Main Table Components
export { default as EnhancedDataTable } from "./enhanced-data-table"
export { default as ClientSafeEnhancedDataTable } from "./client-safe-wrapper"

import type {
  ActionButton,
  BulkAction,
  EnhancedColumnDef,
  FilterConfig,
  TableConfig,
  TableTheme,
  ToolbarConfig,
} from "./types"

// Table Components
export { EnhancedTableToolbar } from "./table-toolbar"
export { EnhancedTablePagination } from "./table-pagination"
export { EnhancedTableFilters } from "./table-filters"
export { TableColumnVisibility } from "./table-column-visibility"

// State Components
export {
  TableEmptyState,
  InventoryEmptyState,
  UsersEmptyState,
  OrdersEmptyState,
  AnalyticsEmptyState,
  ContextualEmptyState,
} from "./table-empty-state"

export {
  TableLoadingState,
  SearchLoadingState,
  FilterLoadingState,
  ExportLoadingState,
  ImportLoadingState,
  RefreshLoadingState,
  CompactLoadingState,
  LoadingOverlay,
} from "./table-loading-state"

export {
  TableErrorState,
  NetworkErrorState,
  ServerErrorState,
  AuthErrorState,
  ValidationErrorState,
} from "./table-error-state"

// Types
export type {
  EnhancedDataTableProps,
  TableConfig,
  ToolbarConfig,
  FilterConfig,
  ActionButton,
  BulkAction,
  ExportConfig,
  TableTheme,
  LoadingConfig,
  ErrorConfig,
  EmptyStateConfig,
  EnhancedColumnDef,
  RowState,
  ColumnState,
  ServerSideConfig,
  AnalyticsConfig,
  StatusMetrics,
  ColumnOptions,
  GetRowStateFunction,
  EnhancedTableInstance,
} from "./types"

// Utility functions for creating table configurations
export const createTableConfig = (overrides: Partial<TableConfig> = {}): TableConfig => ({
  searchable: true,
  sortable: true,
  filterable: true,
  exportable: true,
  selectable: true,
  paginated: true,
  resizable: false,
  virtualizeRows: false,
  showRowNumbers: false,
  showFooter: false,
  stickyHeader: true,
  compactMode: false,
  striped: true,
  bordered: false,
  hoverable: true,
  ...overrides,
})

export const createToolbarConfig = (overrides: Partial<ToolbarConfig> = {}): ToolbarConfig => ({
  title: "",
  description: "",
  actions: [],
  bulkActions: [],
  filters: [],
  search: {
    enabled: true,
    placeholder: "Search...",
  },
  refresh: {
    enabled: true,
  },
  export: {
    enabled: true,
    formats: ["csv", "xlsx", "pdf"],
  },
  import: {
    enabled: false,
  },
  ...overrides,
})

export const createThemeConfig = (overrides: Partial<TableTheme> = {}): TableTheme => ({
  variant: "modern",
  size: "md",
  colorScheme: "light",
  roundedCorners: true,
  shadowLevel: "sm",
  borderStyle: "light",
  ...overrides,
})

// Column helpers
export const createActionColumn = (actions: ActionButton[]): EnhancedColumnDef<any> => ({
  id: "actions",
  header: "Actions",
  cell: () => null, // Will be handled by the table component
  enableSorting: false,
  enableHiding: false,
  options: {
    searchable: false,
    filterable: false,
    exportable: false,
    width: 100,
  },
})

export const createSelectionColumn = (): EnhancedColumnDef<any> => ({
  id: "select",
  header: ({ table }) => null, // Will be handled by the table component
  cell: () => null, // Will be handled by the table component
  enableSorting: false,
  enableHiding: false,
  options: {
    searchable: false,
    filterable: false,
    exportable: false,
    width: 50,
  },
})

export const createRowNumberColumn = (): EnhancedColumnDef<any> => ({
  id: "rowNumber",
  header: "#",
  cell: () => null, // Will be handled by the table component
  enableSorting: false,
  enableHiding: false,
  options: {
    searchable: false,
    filterable: false,
    exportable: false,
    width: 60,
  },
})

// Filter helpers
export const createTextFilter = (
  key: string,
  label: string,
  placeholder?: string
): FilterConfig => ({
  key,
  label,
  type: "text",
  placeholder: placeholder || `Filter by ${label.toLowerCase()}...`,
})

export const createSelectFilter = (
  key: string,
  label: string,
  options: { label: string; value: string | number | boolean }[],
  placeholder?: string
): FilterConfig => ({
  key,
  label,
  type: "select",
  options,
  placeholder: placeholder || `Select ${label.toLowerCase()}...`,
})

export const createDateFilter = (
  key: string,
  label: string,
  placeholder?: string
): FilterConfig => ({
  key,
  label,
  type: "date",
  placeholder: placeholder || `Select ${label.toLowerCase()}...`,
})

export const createDateRangeFilter = (
  key: string,
  label: string,
  placeholder?: string
): FilterConfig => ({
  key,
  label,
  type: "dateRange",
  placeholder: placeholder || `Select ${label.toLowerCase()} range...`,
})

export const createBooleanFilter = (
  key: string,
  label: string
): FilterConfig => ({
  key,
  label,
  type: "boolean",
})

// Action helpers
export const createEditAction = (
  onEdit: (row: any) => void,
  disabled?: (row: any) => boolean
): ActionButton => ({
  label: "Edit",
  icon: "✏️",
  onClick: onEdit,
  variant: "ghost",
  disabled,
  tooltip: "Edit this item",
})

export const createDeleteAction = (
  onDelete: (row: any) => void,
  disabled?: (row: any) => boolean
): ActionButton => ({
  label: "Delete",
  icon: "🗑️",
  onClick: onDelete,
  variant: "ghost",
  disabled,
  tooltip: "Delete this item",
})

export const createViewAction = (
  onView: (row: any) => void,
  disabled?: (row: any) => boolean
): ActionButton => ({
  label: "View",
  icon: "👁️",
  onClick: onView,
  variant: "ghost",
  disabled,
  tooltip: "View details",
})

// Bulk action helpers
export const createBulkDeleteAction = (
  onBulkDelete: (selectedRows: any[]) => void
): BulkAction => ({
  label: "Delete Selected",
  icon: "🗑️",
  onClick: onBulkDelete,
  variant: "destructive",
  requiresConfirmation: true,
  confirmationMessage: "Are you sure you want to delete the selected items? This action cannot be undone.",
})

export const createBulkExportAction = (
  onBulkExport: (selectedRows: any[]) => void
): BulkAction => ({
  label: "Export Selected",
  icon: "📥",
  onClick: onBulkExport,
  variant: "outline",
})

// Constants
export const DEFAULT_PAGE_SIZES = [10, 20, 30, 40, 50, 100]
export const DEFAULT_EXPORT_FORMATS = ["csv", "xlsx", "pdf", "json"] as const
export const DEFAULT_SKELETON_ROWS = 5

// Re-export Table types from TanStack for convenience
export type { ColumnDef, Row, Table, SortingState, ColumnFiltersState, VisibilityState } from "@tanstack/react-table"
