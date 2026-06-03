"use client";

import { Checkbox } from "@/components/ui/checkbox";

import deleteTaxRate from "@/actions/taxRate/deleteTaxRate";
import DateColumn from "@/components/DataTableColumns/DateColumn";
import NewActionColumn from "@/components/DataTableColumns/NewActionColumn";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { getBilingualText, type Locale } from "@/types/bilingual";
import { TaxRate } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

const DISPLAY_LOCALE: Locale = "en"

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
    accessorKey: "nameEn",
    header: ({ column }) => <SortableColumn column={column} title="Name" />,
    cell: ({ row }) => {
      const localized = getBilingualText(
        row.original.nameEn,
        row.original.nameFr,
        DISPLAY_LOCALE
      )
      const alt = DISPLAY_LOCALE === "en" ? row.original.nameFr : row.original.nameEn
      return (
        <div className="flex flex-col">
          <span className="font-medium">{localized}</span>
          {alt && alt !== localized && (
            <span className="text-xs italic text-slate-500">{alt}</span>
          )}
        </div>
      )
    },
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
