'use client'

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Package, AlertTriangle } from 'lucide-react';
import { InventoryLevel } from '@/types/inventory';
import type { CellContext } from '@tanstack/react-table';

import {
  EnhancedDataTable,
  createTableConfig,
  createToolbarConfig,
  createTextFilter,
  createSelectFilter,
  createBooleanFilter,
  type EnhancedColumnDef,
} from '@/components/ui/enhanced-data-table';

type InventoryLevelCell = CellContext<InventoryLevel, unknown>;

interface InventoryLevelsTableProps {
  levels: InventoryLevel[];
  loading: boolean;
  onRefresh: () => void;
  onAdjustStock?: (level: InventoryLevel) => void;
  onViewDetails?: (level: InventoryLevel) => void;
}

export function InventoryLevelsTable({
  levels,
  loading,
  onRefresh,
  onAdjustStock = () => {},
  onViewDetails = () => {},
}: InventoryLevelsTableProps) {

  const getStockStatus = (level: InventoryLevel) => {
    if (level.quantityAvailable <= 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (level.quantityAvailable <= 10) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const getLocationOptions = () => {
    const locations = Array.from(new Set(levels.map(level => level.location?.name).filter(Boolean)));
    return locations.map(location => ({ label: location!, value: location! }));
  };

  const getStatusOptions = () => [
    { label: 'In Stock', value: 'in-stock' },
    { label: 'Low Stock', value: 'low-stock' },
    { label: 'Out of Stock', value: 'out-of-stock' },
  ];

  const columns = useMemo<EnhancedColumnDef<InventoryLevel>[]>(() => [
    {
      accessorKey: "item.name",
      header: "Item",
      cell: ({ row }: InventoryLevelCell) => {
        const level = row.original;
        return (
          <div className="flex items-center gap-3">
            {level.item?.imageUrls?.[0] ? (
              <img
                src={level.item.imageUrls[0]}
                alt={level.item.name}
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <div className="font-medium">{level.item?.name}</div>
              <div className="text-sm text-muted-foreground">{level.item?.sku}</div>
            </div>
          </div>
        );
      },
      options: {
        searchable: true,
        sortable: true,
        width: 280,
      },
    },
    {
      accessorKey: "item.sku",
      header: "SKU",
      cell: ({ row }: InventoryLevelCell) => (
        <span className="font-mono text-sm">{row.original.item?.sku}</span>
      ),
      options: {
        searchable: true,
        sortable: true,
        width: 120,
      },
    },
    {
      accessorKey: "location.name",
      header: "Location",
      options: {
        searchable: true,
        filterable: true,
        sortable: true,
        width: 140,
      },
    },
    {
      accessorKey: "quantityOnHand",
      header: "On Hand",
      cell: ({ row }: InventoryLevelCell) => (
        <span className="font-mono text-right">{row.original.quantityOnHand}</span>
      ),
      options: {
        sortable: true,
        isNumeric: true,
        align: 'right',
        width: 100,
      },
    },
    {
      accessorKey: "quantityReserved",
      header: "Reserved",
      cell: ({ row }: InventoryLevelCell) => (
        <span className="font-mono text-right">{row.original.quantityReserved}</span>
      ),
      options: {
        sortable: true,
        isNumeric: true,
        align: 'right',
        width: 100,
      },
    },
    {
      accessorKey: "quantityAvailable",
      header: "Available",
      cell: ({ row }: InventoryLevelCell) => {
        const available = row.original.quantityAvailable;
        const isLow = available <= 10;
        return (
          <div className="flex items-center justify-end gap-2">
            <span className={`font-mono ${isLow ? 'text-destructive font-medium' : ''}`}>
              {available}
            </span>
            {isLow && available > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
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
      accessorKey: "totalValue",
      header: "Value",
      cell: ({ row }: InventoryLevelCell) => (
        <span className="font-mono text-right">
          ${row.original.totalValue.toFixed(2)}
        </span>
      ),
      options: {
        sortable: true,
        isNumeric: true,
        align: 'right',
        width: 120,
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: InventoryLevelCell) => {
        const status = getStockStatus(row.original);
        return (
          <Badge variant={status.variant}>
            {status.label}
          </Badge>
        );
      },
      options: {
        filterable: true,
        width: 120,
      },
    },
  ], []);

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
  }), []);

  const toolbarConfig = useMemo(() => createToolbarConfig({
    title: "Inventory Levels",
    description: "Current stock levels across all locations",
    actions: [
      {
        label: "Refresh",
        icon: <RefreshCw className="h-4 w-4" />,
        onClick: () => onRefresh(),
        variant: "outline",
        disabled: () => loading,
      },
    ],
    bulkActions: [
      {
        label: "Bulk Adjust",
        icon: <Package className="h-4 w-4" />,
        onClick: (selectedRows: InventoryLevel[]) => console.log("Bulk adjust:", selectedRows),
        variant: "outline",
      },
    ],
    filters: [
      createTextFilter("item.name", "Item Name", "Search items..."),
      createTextFilter("item.sku", "SKU", "Search SKUs..."),
      createSelectFilter("location.name", "Location", getLocationOptions()),
      createSelectFilter("status", "Status", getStatusOptions()),
      createBooleanFilter("lowStock", "Low Stock Only"),
    ],
    search: {
      enabled: true,
      placeholder: "Search items, SKUs, or locations...",
    },
    refresh: {
      enabled: true,
      onRefresh,
    },
    export: {
      enabled: true,
      formats: ["csv", "xlsx", "pdf"],
      filename: "inventory-levels",
    },
  }), [loading, onRefresh, levels]);

  return (
    <EnhancedDataTable
      data={levels}
      columns={columns}
      config={tableConfig}
      toolbar={toolbarConfig}
      loading={loading}
      onRowClick={onViewDetails}
      emptyStateConfig={{
        enabled: true,
        title: "No inventory levels",
        description: "No inventory data available. Items will appear here once you have inventory.",
        icon: <Package className="h-12 w-12 text-muted-foreground/50" />,
      }}
      loadingConfig={{
        enabled: true,
        skeletonRows: 8,
        loadingMessage: "Loading inventory levels...",
      }}
      errorConfig={{
        enabled: true,
        retryEnabled: true,
        onRetry: onRefresh,
      }}
      ariaLabel="Inventory levels table"
      ariaDescription="Table showing current stock levels across all locations with filtering and export capabilities"
    />
  );
}
