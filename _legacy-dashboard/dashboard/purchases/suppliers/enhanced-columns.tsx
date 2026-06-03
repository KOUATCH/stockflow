"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SortableColumn from "@/components/DataTableColumns/SortableColumn";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  Archive,
  Award,
  Building2,
  Contact,
  Copy,
  CreditCard,
  DollarSign,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Phone,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Trash2,
  TrendingUp,
  Truck,
  User,
  Users,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";

export type EnhancedSupplier = {
  id: string;
  name: string;
  code?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  taxId?: string | null;
  paymentTerms?: number | null;
  creditLimit?: number | null;
  notes?: string | null;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  // Image fields for supplier representative
  imageUrls?: string[];
  repAvatar?: string;
  repName?: string;
  _count?: {
    purchaseOrders: number;
    supplierItems: number;
    payables: number;
  };
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const getSupplierInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const getSupplierColor = (name: string): string => {
  const colors = [
    'from-blue-500 to-indigo-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-violet-500',
    'from-orange-500 to-red-500',
    'from-teal-500 to-cyan-500',
    'from-pink-500 to-rose-500',
    'from-amber-500 to-yellow-500',
    'from-slate-500 to-gray-500'
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const getStatusBadge = (isActive: boolean) => {
  return (
    <Badge
      variant={isActive ? "default" : "destructive"}
      className={`flex items-center gap-1 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
          : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
      }`}
    >
      {isActive ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
};

const getPaymentTermsBadge = (paymentTerms: number | null) => {
  if (!paymentTerms) return null;

  const getTermsColor = (days: number) => {
    if (days <= 15) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
    if (days <= 30) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700";
  };

  return (
    <Badge variant="outline" className={`${getTermsColor(paymentTerms)} font-medium text-xs`}>
      {paymentTerms} days
    </Badge>
  );
};

const formatCurrency = (amount?: number | null) => {
  if (!amount) return "No limit";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const enhancedSuppliersColumns: ColumnDef<EnhancedSupplier>[] = [
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
        className="border-slate-300 dark:border-slate-600"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-slate-300 dark:border-slate-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableColumn column={column} title="Supplier & Representative" />,
    cell: ({ row }) => {
      const supplier = row.original;
      const initials = getSupplierInitials(supplier.name);
      const gradientClass = getSupplierColor(supplier.name);
      const repImageUrl = supplier.repAvatar || (supplier.imageUrls && supplier.imageUrls[0]);
      const repName = supplier.repName || supplier.contactPerson;

      return (
        <div className="flex items-center gap-3 min-w-[280px]">
          {/* Company Logo/Icon */}
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${gradientClass} shadow-md`}>
            <Building2 className="w-6 h-6 text-white" />
          </div>

          {/* Supplier Representative Image */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 border-2 border-white dark:border-slate-600 shadow-sm -ml-2 z-10">
            {repImageUrl ? (
              <img
                src={repImageUrl}
                alt={repName || "Representative"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  target.style.display = 'none';
                  if (parent) {
                    parent.innerHTML = '<svg class="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                  }
                }}
              />
            ) : (
              <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {supplier.name}
              </p>
              {supplier.code && (
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-400">
                  {supplier.code}
                </code>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Contact className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {repName ? `Rep: ${repName}` : "No representative assigned"}
              </span>
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const name = row.original.name?.toLowerCase() || "";
      const code = row.original.code?.toLowerCase() || "";
      const contact = row.original.contactPerson?.toLowerCase() || "";
      const repName = row.original.repName?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return name.includes(searchValue) || code.includes(searchValue) || contact.includes(searchValue) || repName.includes(searchValue);
    },
  },
  {
    accessorKey: "email",
    header: "Contact Details",
    cell: ({ row }) => {
      const supplier = row.original;

      return (
        <div className="space-y-1 min-w-[200px]">
          {supplier.email && (
            <div className="flex items-center gap-1 text-xs">
              <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 truncate">{supplier.email}</span>
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center gap-1 text-xs">
              <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">{supplier.phone}</span>
            </div>
          )}
          {supplier.taxId && (
            <div className="flex items-center gap-1 text-xs">
              <FileText className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 font-mono">Tax: {supplier.taxId}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Location",
    cell: ({ row }) => {
      const supplier = row.original;

      return (
        <div className="space-y-1 min-w-[180px]">
          {supplier.address && (
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 dark:text-slate-400 truncate">{supplier.address}</span>
            </div>
          )}
          {(supplier.city || supplier.state) && (
            <div className="text-xs text-slate-500 dark:text-slate-500 pl-4">
              {[supplier.city, supplier.state].filter(Boolean).join(", ")}
              {supplier.zipCode && ` ${supplier.zipCode}`}
            </div>
          )}
          {supplier.country && (
            <div className="text-xs text-slate-500 dark:text-slate-500 pl-4">
              {supplier.country}
            </div>
          )}
          {!supplier.address && !supplier.city && !supplier.state && (
            <span className="text-xs text-slate-400">No address provided</span>
          )}
        </div>
      );
    },
  },
  {
    id: "performance",
    header: ({ column }) => <SortableColumn column={column} title="Performance" />,
    cell: ({ row }) => {
      // Mock performance data - in real app, this would come from actual metrics
      const onTimeDelivery = Math.floor(Math.random() * 40) + 60; // 60-100%
      const qualityScore = (Math.random() * 2 + 3).toFixed(1); // 3.0-5.0
      const totalOrders = Math.floor(Math.random() * 500) + 10;

      const deliveryColor = onTimeDelivery >= 90 ? "text-green-600 dark:text-green-400" :
                           onTimeDelivery >= 75 ? "text-yellow-600 dark:text-yellow-400" :
                           "text-red-600 dark:text-red-400";

      const qualityNum = parseFloat(qualityScore);
      const qualityColor = qualityNum >= 4.5 ? "text-green-600 dark:text-green-400" :
                          qualityNum >= 3.5 ? "text-yellow-600 dark:text-yellow-400" :
                          "text-red-600 dark:text-red-400";

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${deliveryColor}`}>
              {onTimeDelivery}% on-time
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className={`text-sm font-medium ${qualityColor}`}>
              {qualityScore} quality
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {totalOrders} orders
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const performanceA = Math.floor(Math.random() * 40) + 60;
      const performanceB = Math.floor(Math.random() * 40) + 60;
      return performanceA - performanceB;
    },
  },
  {
    id: "orderValue",
    header: ({ column }) => <SortableColumn column={column} title="Order Value" />,
    cell: ({ row }) => {
      // Mock order value data
      const totalValue = Math.floor(Math.random() * 500000) + 10000;
      const avgOrderValue = Math.floor(Math.random() * 5000) + 500;
      const trend = Math.random() > 0.5 ? "up" : "down";
      const percentage = Math.floor(Math.random() * 30) + 5;

      return (
        <div className="text-right space-y-1">
          <div className="font-semibold text-slate-900 dark:text-white">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Avg: {formatCurrency(avgOrderValue)}
          </div>
          <div className={`flex items-center justify-end gap-1 text-xs ${
            trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend === "down" ? "rotate-180" : ""}`} />
            {percentage}%
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const valueA = Math.floor(Math.random() * 500000) + 10000;
      const valueB = Math.floor(Math.random() * 500000) + 10000;
      return valueA - valueB;
    },
  },
  {
    id: "items",
    header: ({ column }) => <SortableColumn column={column} title="Items Supplied" />,
    cell: ({ row }) => {
      const supplier = row.original;
      const itemsCount = supplier._count?.supplierItems || 0;
      const payablesCount = supplier._count?.payables || 0;

      return (
        <div className="text-center space-y-1">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {itemsCount} Items
          </div>
          {payablesCount > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {payablesCount} Payables
            </div>
          )}
          <div className="flex items-center justify-center gap-1">
            <div className={`w-2 h-2 rounded-full ${itemsCount > 10 ? "bg-green-500" : itemsCount > 5 ? "bg-yellow-500" : "bg-slate-400"}`}></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {itemsCount > 10 ? "High" : itemsCount > 5 ? "Medium" : "Low"}
            </span>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const itemsA = rowA.original._count?.supplierItems || 0;
      const itemsB = rowB.original._count?.supplierItems || 0;
      return itemsA - itemsB;
    },
  },
  {
    accessorKey: "paymentTerms",
    header: ({ column }) => <SortableColumn column={column} title="Payment Terms" />,
    cell: ({ row }) => {
      const supplier = row.original;
      const paymentTerms = supplier.paymentTerms;

      return (
        <div className="text-center space-y-1">
          {paymentTerms ? (
            <>
              <div className="font-semibold text-slate-900 dark:text-white">
                {paymentTerms} days
              </div>
              {getPaymentTermsBadge(paymentTerms)}
            </>
          ) : (
            <span className="text-xs text-slate-400">Not specified</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "creditLimit",
    header: ({ column }) => <SortableColumn column={column} title="Credit Limit" />,
    cell: ({ row }) => {
      const supplier = row.original;
      const creditLimit = supplier.creditLimit;

      return (
        <div className="text-center space-y-1">
          <div className="font-semibold text-slate-900 dark:text-white">
            {formatCurrency(creditLimit)}
          </div>
          {creditLimit && (
            <div className="flex items-center justify-center gap-1">
              <CreditCard className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Available
              </span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <SortableColumn column={column} title="Status" />,
    cell: ({ row }) => {
      const supplier = row.original;
      const isActive = supplier.isActive;
      const isPreferred = Math.random() > 0.8; // 20% chance of being preferred
      const isVerified = Math.random() > 0.6; // 40% chance of being verified

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant={isActive ? "default" : "destructive"}
            className={`flex items-center gap-1 w-fit text-xs ${
              isActive
                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
                : ""
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}></div>
            {isActive ? "Active" : "Inactive"}
          </Badge>

          <div className="flex flex-wrap gap-1">
            {isPreferred && (
              <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700/50">
                <Star className="w-3 h-3" />
                Preferred
              </Badge>
            )}
            {isVerified && (
              <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/50">
                <Shield className="w-3 h-3" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const isActive = row.original.isActive;
      const isPreferred = Math.random() > 0.8;
      const isVerified = Math.random() > 0.6;
      const searchValue = value.toLowerCase();

      const status = isActive ? "active" : "inactive";
      const preferred = isPreferred ? "preferred" : "";
      const verified = isVerified ? "verified" : "";

      return status.includes(searchValue) || preferred.includes(searchValue) || verified.includes(searchValue);
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableColumn column={column} title="Created" />,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return (
        <div className="text-sm">
          <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDate(date)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {diffDays === 0 ? "Today" : `${diffDays} days ago`}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const supplier = row.original;

      const handleDeleteSupplier = async () => {
        try {
          // Add your delete supplier action here
          console.log("Delete supplier:", supplier.id);
          // const res = await deleteSupplier(supplier.id);
          // if (res?.ok) {
          //   window.location.reload();
          // }
        } catch (error) {
          console.error("Failed to delete supplier:", error);
        }
      };

      const handleCopyId = () => {
        navigator.clipboard.writeText(supplier.id);
      };

      const handleCopyCode = () => {
        if (supplier.code) {
          navigator.clipboard.writeText(supplier.code);
        }
      };

      const handleCopyEmail = () => {
        if (supplier.email) {
          navigator.clipboard.writeText(supplier.email);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Actions
            </DropdownMenuLabel>

            {/* Copy Actions */}
            <DropdownMenuItem onClick={handleCopyId}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Supplier ID
            </DropdownMenuItem>
            {supplier.code && (
              <DropdownMenuItem onClick={handleCopyCode}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Supplier Code
              </DropdownMenuItem>
            )}
            {supplier.email && (
              <DropdownMenuItem onClick={handleCopyEmail}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Email
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* View Actions */}
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/suppliers/${supplier.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/suppliers/${supplier.id}/purchase-history`}>
                <FileText className="mr-2 h-4 w-4" />
                View Purchase History
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/suppliers/${supplier.id}/products`}>
                <Package className="mr-2 h-4 w-4" />
                View Products
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/suppliers/${supplier.id}/financial`}>
                <DollarSign className="mr-2 h-4 w-4" />
                Financial Summary
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Management Actions */}
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/suppliers/${supplier.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Supplier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/suppliers/${supplier.id}/manage-terms`}>
                <Settings className="mr-2 h-4 w-4" />
                Manage Terms
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/purchases/suppliers/${supplier.id}/update-contacts`}>
                <Users className="mr-2 h-4 w-4" />
                Update Contacts
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Status Actions */}
            <DropdownMenuItem>
              <Award className="mr-2 h-4 w-4" />
              Mark as Preferred
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              Verify Supplier
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Archive className="mr-2 h-4 w-4" />
              Archive Supplier
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Communication Actions */}
            {supplier.email && (
              <DropdownMenuItem onClick={() => window.open(`mailto:${supplier.email}`, '_blank')}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
            )}
            {supplier.phone && (
              <DropdownMenuItem onClick={() => window.open(`tel:${supplier.phone}`, '_blank')}>
                <Phone className="mr-2 h-4 w-4" />
                Call Supplier
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleDeleteSupplier}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Supplier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
