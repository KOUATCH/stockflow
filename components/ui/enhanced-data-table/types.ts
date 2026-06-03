/**
 * Enhanced Data Table Types and Interfaces
 * Comprehensive type definitions for enterprise-grade data tables
 */

import { ColumnDef, Row, Table } from "@tanstack/react-table"
import { ReactNode } from "react"

// Base table configuration
export interface TableConfig {
  searchable?: boolean
  sortable?: boolean
  filterable?: boolean
  exportable?: boolean
  importable?: boolean
  selectable?: boolean
  paginated?: boolean
  resizable?: boolean
  virtualizeRows?: boolean
  showRowNumbers?: boolean
  showFooter?: boolean
  stickyHeader?: boolean
  compactMode?: boolean
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
}

// Filter types and configurations
export interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'multiSelect' | 'boolean'
  options?: { label: string; value: string | number | boolean }[]
  placeholder?: string
  defaultValue?: any
  multiple?: boolean
  searchable?: boolean
}

// Action button configurations
export interface ActionButton {
  label: string
  icon?: ReactNode
  onClick: (row: any) => void
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: (row: any) => boolean
  hidden?: (row: any) => boolean
  className?: string
  tooltip?: string
}

// Serializable action button config (for server-to-client prop passing)
export interface SerializableActionButton {
  label: string
  action: string // action identifier instead of function
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  hidden?: boolean
  className?: string
  tooltip?: string
}

// Bulk action configurations
export interface BulkAction {
  label: string
  icon?: ReactNode
  onClick: (selectedRows: any[]) => void
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  requiresConfirmation?: boolean
  confirmationMessage?: string
  disabled?: (selectedRows: any[]) => boolean
  hidden?: (selectedRows: any[]) => boolean
  minSelection?: number
  maxSelection?: number
}

// Serializable bulk action config (for server-to-client prop passing)
export interface SerializableBulkAction {
  label: string
  action: string // action identifier instead of function
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  requiresConfirmation?: boolean
  confirmationMessage?: string
  disabled?: boolean
  hidden?: boolean
  minSelection?: number
  maxSelection?: number
}

// Export configurations
export interface ExportConfig {
  enabled: boolean
  formats?: ('csv' | 'xlsx' | 'pdf' | 'json')[]
  filename?: string
  includeFilters?: boolean
  customExporter?: (data: any[], format: string) => void
}

// Toolbar configurations
export interface ToolbarConfig {
  title?: string
  description?: string
  actions?: ActionButton[]
  bulkActions?: BulkAction[]
  filters?: FilterConfig[]
  search?: {
    enabled: boolean
    placeholder?: string
    searchableColumns?: string[]
  }
  refresh?: {
    enabled: boolean
    onRefresh?: () => void
  }
  // Serializable refresh config (for server-to-client prop passing)
  refreshAction?: {
    enabled: boolean
    action?: string // action identifier instead of function
  }
  export?: ExportConfig
  import?: {
    enabled: boolean
    onImport?: (file: File) => void
    acceptedFormats?: string[]
  }
}

// Status and metrics display
export interface StatusMetrics {
  totalRows: number
  filteredRows: number
  selectedRows: number
  customMetrics?: { label: string; value: string | number; color?: string }[]
}

// Column enhancement options
export interface ColumnOptions {
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  resizable?: boolean
  pinnable?: boolean
  hideable?: boolean
  exportable?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
}

// Enhanced column definition
export type EnhancedColumnDef<TData, TValue = any> = ColumnDef<TData, TValue> & {
  options?: ColumnOptions
  filterType?: FilterConfig['type']
  filterOptions?: FilterConfig['options']
  formatValue?: (value: any) => string
  renderCell?: (value: any, row: TData) => ReactNode
  sticky?: 'left' | 'right'
}

// Table theme and styling
export interface TableTheme {
  variant?: 'default' | 'minimal' | 'modern' | 'enterprise'
  size?: 'sm' | 'md' | 'lg'
  colorScheme?: 'light' | 'dark' | 'auto'
  roundedCorners?: boolean
  shadowLevel?: 'none' | 'sm' | 'md' | 'lg'
  borderStyle?: 'none' | 'light' | 'medium' | 'heavy'
}

// Loading and error states
export interface LoadingConfig {
  enabled: boolean
  skeletonRows?: number
  customLoader?: ReactNode
  loadingMessage?: string
}

export interface ErrorConfig {
  enabled: boolean
  errorMessage?: string
  retryEnabled?: boolean
  onRetry?: () => void
  customErrorComponent?: ReactNode
}

// Serializable error config (for server-to-client prop passing)
export interface SerializableErrorConfig {
  enabled: boolean
  errorMessage?: string
  retryEnabled?: boolean
  retryAction?: string // action identifier instead of function
}

// Empty state configuration
export interface EmptyStateConfig {
  enabled: boolean
  title?: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  customComponent?: ReactNode
}

// Main enhanced data table props
export interface EnhancedDataTableProps<TData> {
  // Data and columns
  data: TData[]
  columns: EnhancedColumnDef<TData>[]

  // Configuration
  config?: TableConfig
  toolbar?: ToolbarConfig
  theme?: TableTheme

  // State management
  loading?: boolean
  error?: string | null

  // Callbacks
  onRowClick?: (row: TData) => void
  onRowDoubleClick?: (row: TData) => void
  onSelectionChange?: (selectedRows: TData[]) => void
  onSortingChange?: (sorting: any[]) => void
  onFiltersChange?: (filters: any[]) => void
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void

  // Serializable action handlers (for server-to-client prop passing)
  actionHandlers?: {
    onRowClick?: string
    onRowDoubleClick?: string
    onSelectionChange?: string
    onSortingChange?: string
    onFiltersChange?: string
    onPaginationChange?: string
  }

  // States
  loadingConfig?: LoadingConfig
  errorConfig?: ErrorConfig
  emptyStateConfig?: EmptyStateConfig

  // Advanced features
  virtualizationEnabled?: boolean
  persistFilters?: boolean
  persistSorting?: boolean
  persistColumnVisibility?: boolean
  globalFilterEnabled?: boolean

  // Custom renderers
  customToolbar?: ReactNode
  customPagination?: ReactNode
  customFooter?: ReactNode

  // Accessibility
  ariaLabel?: string
  ariaDescription?: string
}

// Row state and styling
export interface RowState {
  selected?: boolean
  expanded?: boolean
  disabled?: boolean
  highlighted?: boolean
  className?: string
  style?: React.CSSProperties
}

export interface GetRowStateFunction<TData> {
  (row: TData): RowState
}

// Column state
export interface ColumnState {
  visible?: boolean
  pinned?: 'left' | 'right' | false
  width?: number
  order?: number
}

// Table instance extensions
export interface EnhancedTableInstance<TData> extends Table<TData> {
  exportData: (format: string) => void
  selectAll: () => void
  deselectAll: () => void
  getSelectedRowsData: () => TData[]
  resetFilters: () => void
  resetSorting: () => void
  getTableState: () => any
  setTableState: (state: any) => void
}

// Server-side operations
export interface ServerSideConfig {
  enabled: boolean
  totalRowCount: number
  onPaginationChange: (pageIndex: number, pageSize: number) => void
  onSortingChange: (sorting: any[]) => void
  onFiltersChange: (filters: any[]) => void
  onSearchChange: (search: string) => void
}

// Analytics and tracking
export interface AnalyticsConfig {
  enabled: boolean
  trackEvents?: boolean
  trackFilters?: boolean
  trackSorting?: boolean
  trackExports?: boolean
  onEvent?: (event: string, data?: any) => void
}
