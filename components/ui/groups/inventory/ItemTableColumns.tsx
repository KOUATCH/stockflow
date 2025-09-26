import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Column } from "@/components/ui/data-table"
import { ItemWithInventoryLevelsPayload } from "@/types/itemTypes"
import Link from "next/link"

interface ItemTableColumnsProps {
  formatCurrency: (amount: number) => string
  formatDate: (date: Date | string) => string
}

export const ItemTableColumns = ({ formatCurrency, formatDate }: ItemTableColumnsProps): Column<ItemWithInventoryLevelsPayload>[] => [
  {
    header: "Image",
    accessorKey: "imageUrls",
    cell: (row) => (
      <div className="relative h-12 w-12 overflow-hidden rounded-lg border">
        <img
          src={row.imageUrls || "/placeholder.svg"}
          alt={row?.name || "Item image"}
          className="h-full w-full object-cover transition-transform hover:scale-105"
          loading="lazy"
        />
      </div>
    ),
  },
  {
    header: "Item Details",
    accessorKey: "name",
    cell: (row) => (
      <div className="space-y-1">
        <div className="font-medium text-sm">
          {row?.name ? (row.name.length > 25 ? `${row.name.substring(0, 25)}...` : row.name) : "Unnamed Item"}
        </div>
        <div className="text-xs text-muted-foreground font-mono">SKU: {row.sku || "N/A"}</div>
      </div>
    ),
  },
  {
    header: "Stock",
    accessorKey: (row: ItemWithInventoryLevelsPayload) => row.inventoryLevels[0]?.quantityOnHand,
    cell: (row) => {
      const quantity = Number(row.inventoryLevels[0]?.quantityOnHand) || 0
      const isLowStock = quantity < 10 && quantity > 0
      const isOutOfStock = quantity === 0
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{quantity}</span>
          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
          {isLowStock && (
            <Badge variant="secondary" className="text-xs">
              Low Stock
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    header: "Cost Price",
    accessorKey: "costPrice",
    cell: (row) => <span className="font-mono text-sm">{formatCurrency(Number(row.costPrice) || 0)}</span>,
  },
  {
    header: "Selling Price",
    accessorKey: "sellingPrice",
    cell: (row) => (
      <span className="font-mono text-sm font-medium">{formatCurrency(Number(row.sellingPrice) || 0)}</span>
    ),
  },
  {
    header: "Total Value",
    // Use a function accessor to calculate the total value
    accessorKey: (row: ItemWithInventoryLevelsPayload) => (Number(row.sellingPrice) || 0) * (Number(row.inventoryLevels[0]?.quantityOnHand) || 0),
    cell: (row) => {
      const totalValue = (Number(row.sellingPrice) || 0) * (Number(row.inventoryLevels[0]?.quantityOnHand) || 0)
      return <span className="font-mono text-sm font-medium">{formatCurrency(totalValue)}</span>
    },
  },
  {
    header: "Actions",
    // Use a function accessor that returns a unique identifier for the row
    accessorKey: (row: ItemWithInventoryLevelsPayload) => `actions-${row.id}`,
    cell: (row) => (
      <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard/inventory/items/${row.id}/suppliers`}>Suppliers</Link>
      </Button>
    ),
  },
]
