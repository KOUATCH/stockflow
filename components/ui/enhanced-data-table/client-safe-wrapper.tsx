"use client"

import { useMemo, useCallback } from 'react'
import { EnhancedDataTable } from './enhanced-data-table'
import type { EnhancedDataTableProps } from './types'

/**
 * Client-safe wrapper for EnhancedDataTable
 * Handles function serialization issues when props come from server components
 */
export function ClientSafeEnhancedDataTable<TData>(
  props: EnhancedDataTableProps<TData> & {
    // Allow serializable action identifiers
    onRowClickAction?: string
    onRowDoubleClickAction?: string
    onSelectionChangeAction?: string
    onRetryAction?: string
  }
) {
  // Create safe handlers that only execute if they're actual functions
  const safeOnRowClick = useCallback((row: TData) => {
    if (props.onRowClick && typeof props.onRowClick === 'function') {
      props.onRowClick(row)
    }
  }, [props.onRowClick])

  const safeOnRowDoubleClick = useCallback((row: TData) => {
    if (props.onRowDoubleClick && typeof props.onRowDoubleClick === 'function') {
      props.onRowDoubleClick(row)
    }
  }, [props.onRowDoubleClick])

  const safeOnSelectionChange = useCallback((selectedRows: TData[]) => {
    if (props.onSelectionChange && typeof props.onSelectionChange === 'function') {
      props.onSelectionChange(selectedRows)
    }
  }, [props.onSelectionChange])

  // Create safe error config that handles onRetry properly
  const safeErrorConfig = useMemo(() => {
    if (!props.errorConfig) return undefined

    const config = { ...props.errorConfig }

    // Only include onRetry if it's actually a function
    if (config.onRetry && typeof config.onRetry !== 'function') {
      delete config.onRetry
    }

    return config
  }, [props.errorConfig])

  // Create safe empty state config
  const safeEmptyStateConfig = useMemo(() => {
    if (!props.emptyStateConfig) return undefined

    const config = { ...props.emptyStateConfig }

    // Handle action onClick safely
    if (config.action?.onClick && typeof config.action.onClick !== 'function') {
      config.action = undefined
    }

    return config
  }, [props.emptyStateConfig])

  // Create safe toolbar config
  const safeToolbar = useMemo(() => {
    if (!props.toolbar) return undefined

    const toolbar = { ...props.toolbar }

    // Handle refresh onRefresh safely
    if (toolbar.refresh?.onRefresh && typeof toolbar.refresh.onRefresh !== 'function') {
      toolbar.refresh = { ...toolbar.refresh }
      delete toolbar.refresh.onRefresh
    }

    // Handle actions onClick safely
    if (toolbar.actions) {
      toolbar.actions = toolbar.actions.map(action => {
        if (action.onClick && typeof action.onClick !== 'function') {
          const { onClick, ...rest } = action
          return rest as any
        }
        return action
      })
    }

    // Handle bulk actions onClick safely
    if (toolbar.bulkActions) {
      toolbar.bulkActions = toolbar.bulkActions.map(action => {
        if (action.onClick && typeof action.onClick !== 'function') {
          const { onClick, ...rest } = action
          return rest as any
        }
        return action
      })
    }

    return toolbar
  }, [props.toolbar])

  // Clean props to remove serializable action identifiers and replace with safe handlers
  const cleanProps = useMemo(() => {
    const {
      onRowClickAction,
      onRowDoubleClickAction,
      onSelectionChangeAction,
      onRetryAction,
      onRowClick,
      onRowDoubleClick,
      onSelectionChange,
      errorConfig,
      emptyStateConfig,
      toolbar,
      ...rest
    } = props

    return {
      ...rest,
      onRowClick: onRowClick && typeof onRowClick === 'function' ? safeOnRowClick : undefined,
      onRowDoubleClick: onRowDoubleClick && typeof onRowDoubleClick === 'function' ? safeOnRowDoubleClick : undefined,
      onSelectionChange: onSelectionChange && typeof onSelectionChange === 'function' ? safeOnSelectionChange : undefined,
      errorConfig: safeErrorConfig,
      emptyStateConfig: safeEmptyStateConfig,
      toolbar: safeToolbar,
    }
  }, [props, safeOnRowClick, safeOnRowDoubleClick, safeOnSelectionChange, safeErrorConfig, safeEmptyStateConfig, safeToolbar])

  return <EnhancedDataTable {...cleanProps} />
}

export default ClientSafeEnhancedDataTable
