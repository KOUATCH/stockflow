"use client";

import { Checkbox } from "@/components/ui/checkbox";

import deleteTaxRate from "@/actions/taxRate/deleteTaxRate";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import NewActionColumn from "@/components/DataTableColumns/NewActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { TaxRate } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<TaxRate>[] = [
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
    accessorKey: "taxRateName",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
  },

  {
    accessorKey: "rate",
    header: ({ column }) => <SortableColumn column={column} title="Rate" />,
  },

  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: ({ row }) => <DateColumn row={row} accessorKey="createdAt" />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const taxRate = row.original;
      const handleDeleteTaxRate = async () => {
        const res = await deleteTaxRate(taxRate.id);
        if (res?.success) {
          window.location.reload();
        }
      };
      return (
        <NewActionColumn
          modelName="taxRate"
          editEndpoint={`/dashboard/settings/tax-rates/update/${taxRate.id}`}
          onDelete={handleDeleteTaxRate}
        />
      );
    },
  },
];
