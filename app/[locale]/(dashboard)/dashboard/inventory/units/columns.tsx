"use client";

import { Checkbox } from "@/components/ui/checkbox";

import { deleteUnit } from "@/actions/units/deleteUnit";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import NewActionColumn from "@/components/DataTableColumns/NewActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { UnitResponse } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<UnitResponse>[] = [
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
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },
  
  {
    accessorKey: "symbol",
    header: ({ column }) => <SortableColumn column={column} title="Symbol" />,
  },
  
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const unit = row.original;
        const handleDeleteUnit = async () => {
          const res = await deleteUnit(unit.id);
          if (res?.data?.id) {
            window.location.reload();
          }
        };
      return (
        <NewActionColumn 
        modelName="unit"
        editEndpoint={`/dashboard/inventory/units/update/${unit.id}`}
        onDelete={handleDeleteUnit}
        />
      );
    },
  },
];
