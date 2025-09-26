"use client";

import { Checkbox } from "@/components/ui/checkbox";

import deleteBrand from "@/actions/brands/deleteBrand";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import NewActionColumn from "@/components/DataTableColumns/NewActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { Brand } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Brand>[] = [
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
    accessorKey: "brandName",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },
  
  {
    accessorKey: "slug",
    header: ({ column }) => <SortableColumn column={column} title="Slug" />,
  },
  
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const brand = row.original;
        const handleDeleteBrand = async () => {
          const res = await deleteBrand(brand.id);
          if (res?.ok) {
            window.location.reload();
          }
        };
      return (
        <NewActionColumn 
        modelName="brand"
        editEndpoint={`/dashboard/inventory/brands/update/${brand.id}`}
        onDelete={handleDeleteBrand}
        />
      );
    },
  },
];
