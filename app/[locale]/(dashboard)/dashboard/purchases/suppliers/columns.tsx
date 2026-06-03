"use client";

import { Checkbox } from "@/components/ui/checkbox";

import { deleteSupplier } from "@/actions/suppliers/deleteSupplier";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import NewActionColumn from "@/components/DataTableColumns/NewActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { Supplier } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Supplier>[] = [
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
    accessorKey: "Name",
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
      const supplier = row.original;
      const handleDeleteSupplier = async () => {
        const res = await deleteSupplier(supplier.id, supplier.organizationId);
        if (res?.success) {
          window.location.reload();
        }
      };
      return (
        <NewActionColumn
          modelName="supplier"
          editEndpoint={`/dashboard/inventory/suppliers/update/${supplier.id}`}
          onDelete={handleDeleteSupplier}
        />
      );
    },
  },
];
