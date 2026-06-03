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
import {
  Activity,
  AlertTriangle,
  Archive,
  Award,
  Building2,
  Calendar,
  CheckCircle,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Gift,
  Mail,
  MoreHorizontal,
  Package,
  Phone,
  PieChart,
  Send,
  Star,
  TrendingDown,
  TrendingUp,
  Trash2,
  User,
  Users,
  Wallet,
  XCircle,
  Zap
} from "lucide-react";

export type EnhancedSalaryRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeImage?: string;
  department: string;
  jobTitle: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  taxWithholdings: number;
  paymentStatus: 'DRAFT' | 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  paymentDate?: Date;
  paymentMethod: 'DIRECT_DEPOSIT' | 'CHECK' | 'CASH';
  workingDays: number;
  totalHours: number;
  overtimeHours: number;
  ptoTaken: number;
  healthInsurance: number;
  retirement401k: number;
  socialSecurity: number;
  medicare: number;
  federalTax: number;
  stateTax: number;
  createdAt: Date;
  updatedAt: Date;
  // Enhanced fields for analytics
  performanceRating?: number;
  attendanceScore?: number;
  lastPaymentDate?: Date;
  yearToDateTotal?: number;
  bankAccount?: string;
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) {
    return "N/A";
  }

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  } catch (error) {
    console.warn('Date formatting error:', error, 'for date:', date);
    return "Invalid Date";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatHours = (hours: number) => {
  return `${hours.toFixed(1)}h`;
};

function getPaymentStatus(record: EnhancedSalaryRecord) {
  const status = record.paymentStatus;

  switch (status) {
    case 'PAID':
      return {
        label: "Paid",
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/20"
      };
    case 'PROCESSING':
      return {
        label: "Processing",
        variant: "secondary" as const,
        icon: Activity,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/20"
      };
    case 'PENDING':
      return {
        label: "Pending Approval",
        variant: "outline" as const,
        icon: AlertTriangle,
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
      };
    case 'FAILED':
      return {
        label: "Failed",
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/20"
      };
    default:
      return {
        label: "Draft",
        variant: "secondary" as const,
        icon: FileText,
        color: "text-slate-600 dark:text-slate-400",
        bgColor: "bg-slate-100 dark:bg-slate-900/20"
      };
  }
}

function getPaymentMethod(method: string) {
  const methodConfig = {
    DIRECT_DEPOSIT: { label: "Direct Deposit", icon: CreditCard, color: "text-blue-600" },
    CHECK: { label: "Check", icon: FileText, color: "text-green-600" },
    CASH: { label: "Cash", icon: Wallet, color: "text-yellow-600" }
  };

  return methodConfig[method as keyof typeof methodConfig] || methodConfig.DIRECT_DEPOSIT;
}

function getPerformanceRating(rating?: number) {
  if (!rating) return null;

  if (rating >= 4.5) return { label: "Excellent", color: "text-green-600", bgColor: "bg-green-100" };
  if (rating >= 3.5) return { label: "Good", color: "text-blue-600", bgColor: "bg-blue-100" };
  if (rating >= 2.5) return { label: "Average", color: "text-yellow-600", bgColor: "bg-yellow-100" };
  return { label: "Needs Improvement", color: "text-red-600", bgColor: "bg-red-100" };
}

export const enhancedSalaryColumns: ColumnDef<EnhancedSalaryRecord>[] = [
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
    accessorKey: "employeeName",
    header: ({ column }) => <SortableColumn column={column} title="Employee Details" />,
    cell: ({ row }) => {
      const record = row.original;
      const imageUrl = record.employeeImage;

      return (
        <div className="flex items-center gap-3 min-w-[280px]">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 border-2 border-white dark:border-slate-600 shadow-lg">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={record.employeeName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  target.style.display = 'none';
                  if (parent) {
                    parent.innerHTML = '<svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                  }
                }}
              />
            ) : (
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {record.employeeName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {record.department}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {record.jobTitle}
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const name = row.original.employeeName?.toLowerCase() || "";
      const department = row.original.department?.toLowerCase() || "";
      const jobTitle = row.original.jobTitle?.toLowerCase() || "";
      const searchValue = value.toLowerCase();
      return name.includes(searchValue) || department.includes(searchValue) || jobTitle.includes(searchValue);
    },
  },
  {
    id: "workDetails",
    header: ({ column }) => <SortableColumn column={column} title="Work Summary" />,
    cell: ({ row }) => {
      const record = row.original;
      const attendanceScore = record.attendanceScore || Math.random() * 100;
      const attendanceColor = attendanceScore >= 95 ? "text-green-600" :
                             attendanceScore >= 85 ? "text-yellow-600" : "text-red-600";

      return (
        <div className="space-y-2 min-w-[180px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Working Days:</span>
            <span className="text-sm font-medium">{record.workingDays} days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Hours:</span>
            <span className="text-sm font-medium">{formatHours(record.totalHours)}</span>
          </div>
          {record.overtimeHours > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Overtime:</span>
              <span className="text-sm font-medium text-orange-600">{formatHours(record.overtimeHours)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Attendance:</span>
            <span className={`text-sm font-medium ${attendanceColor}`}>
              {attendanceScore.toFixed(1)}%
            </span>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.totalHours - rowB.original.totalHours;
    },
  },
  {
    id: "compensation",
    header: ({ column }) => <SortableColumn column={column} title="Compensation Breakdown" />,
    cell: ({ row }) => {
      const record = row.original;
      const overtimeRate = record.overtimeHours > 0 ? (record.overtime / record.overtimeHours) : 0;

      return (
        <div className="space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Base Salary:</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {formatCurrency(record.baseSalary)}
            </span>
          </div>
          {record.overtime > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Overtime:</span>
              <span className="text-sm font-medium text-orange-600">
                {formatCurrency(record.overtime)}
              </span>
            </div>
          )}
          {record.bonuses > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Bonuses:</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(record.bonuses)}
              </span>
            </div>
          )}
          <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Gross Pay:</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(record.grossPay)}
              </span>
            </div>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.grossPay - rowB.original.grossPay;
    },
  },
  {
    id: "deductions",
    header: ({ column }) => <SortableColumn column={column} title="Deductions & Taxes" />,
    cell: ({ row }) => {
      const record = row.original;

      return (
        <div className="space-y-1 min-w-[180px]">
          <div className="text-xs font-medium text-slate-600 mb-2">Tax Withholdings:</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Federal Tax:</span>
              <span className="text-xs text-red-600">{formatCurrency(record.federalTax)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">State Tax:</span>
              <span className="text-xs text-red-600">{formatCurrency(record.stateTax)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Social Security:</span>
              <span className="text-xs text-red-600">{formatCurrency(record.socialSecurity)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Medicare:</span>
              <span className="text-xs text-red-600">{formatCurrency(record.medicare)}</span>
            </div>
          </div>
          <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Total Deductions:</span>
              <span className="text-sm font-semibold text-red-600">
                {formatCurrency(record.deductions)}
              </span>
            </div>
          </div>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.deductions - rowB.original.deductions;
    },
  },
  {
    id: "benefits",
    header: ({ column }) => <SortableColumn column={column} title="Benefits" />,
    cell: ({ row }) => {
      const record = row.original;

      return (
        <div className="space-y-1 min-w-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Health Insurance:</span>
            <span className="text-xs font-medium">{formatCurrency(record.healthInsurance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">401(k):</span>
            <span className="text-xs font-medium">{formatCurrency(record.retirement401k)}</span>
          </div>
          {record.ptoTaken > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">PTO Used:</span>
              <span className="text-xs text-orange-600">{record.ptoTaken} days</span>
            </div>
          )}
          <div className="pt-1">
            <div className="text-xs text-green-600 font-medium">
              Total Benefits: {formatCurrency(record.healthInsurance + record.retirement401k)}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "netPay",
    header: ({ column }) => <SortableColumn column={column} title="Net Pay" />,
    cell: ({ row }) => {
      const record = row.original;
      const ytdGrowth = record.yearToDateTotal ?
        ((record.netPay * 12) - record.yearToDateTotal) / record.yearToDateTotal * 100 : 0;

      return (
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(record.netPay)}
          </div>
          <div className="text-xs text-slate-500">
            Take-home pay
          </div>
          {record.yearToDateTotal && (
            <div className="text-xs">
              <div className="text-slate-500">YTD: {formatCurrency(record.yearToDateTotal)}</div>
              <div className={`flex items-center justify-center gap-1 ${
                ytdGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {ytdGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(ytdGrowth).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.netPay - rowB.original.netPay;
    },
  },
  {
    id: "paymentStatus",
    header: ({ column }) => <SortableColumn column={column} title="Payment Status" />,
    cell: ({ row }) => {
      const record = row.original;
      const status = getPaymentStatus(record);
      const method = getPaymentMethod(record.paymentMethod);
      const StatusIcon = status.icon;
      const MethodIcon = method.icon;

      return (
        <div className="space-y-2">
          <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
          <div className="flex items-center gap-1">
            <MethodIcon className={`w-3 h-3 ${method.color}`} />
            <span className="text-xs text-slate-500">{method.label}</span>
          </div>
          {record.paymentDate && (
            <div className="text-xs text-slate-500">
              Paid: {formatDate(record.paymentDate)}
            </div>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const status = row.original.paymentStatus.toLowerCase();
      const method = row.original.paymentMethod.toLowerCase();
      const searchValue = value.toLowerCase();
      return status.includes(searchValue) || method.includes(searchValue);
    },
  },
  {
    id: "performance",
    header: ({ column }) => <SortableColumn column={column} title="Performance" />,
    cell: ({ row }) => {
      const record = row.original;
      const rating = record.performanceRating || (3 + Math.random() * 2); // Mock rating 3-5
      const ratingInfo = getPerformanceRating(rating);

      return (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <div className="text-sm font-medium">{rating.toFixed(1)}/5.0</div>
          {ratingInfo && (
            <div className={`text-xs px-2 py-1 rounded-full ${ratingInfo.bgColor} ${ratingInfo.color}`}>
              {ratingInfo.label}
            </div>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const ratingA = rowA.original.performanceRating || 0;
      const ratingB = rowB.original.performanceRating || 0;
      return ratingA - ratingB;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <SortableColumn column={column} title="Last Updated" />,
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let timeAgo = "";
      if (diffHours < 24) {
        timeAgo = diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
      } else {
        timeAgo = diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
      }

      return (
        <div className="text-sm">
          <div className="font-medium text-slate-900 dark:text-white">
            {formatDate(date)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {timeAgo}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const record = row.original;

      const handleCopyId = () => {
        navigator.clipboard.writeText(record.id);
      };

      const handleCopyEmployeeId = () => {
        navigator.clipboard.writeText(record.employeeId);
      };

      const handleSendPayslip = () => {
        console.log("Send payslip to:", record.employeeName);
        // Implement payslip sending logic
      };

      const handleProcessPayment = () => {
        console.log("Process payment for:", record.employeeName);
        // Implement payment processing logic
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
              Salary Actions
            </DropdownMenuLabel>

            {/* View Actions */}
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Detailed Payslip
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              View Employee Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <PieChart className="mr-2 h-4 w-4" />
              View Tax Breakdown
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Payment Actions */}
            {record.paymentStatus === 'PENDING' && (
              <DropdownMenuItem onClick={handleProcessPayment}>
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleSendPayslip}>
              <Mail className="mr-2 h-4 w-4" />
              Send Payslip via Email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download Pay Statement
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Edit Actions */}
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Salary Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Gift className="mr-2 h-4 w-4" />
              Add Bonus/Adjustment
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Award className="mr-2 h-4 w-4" />
              Update Performance Rating
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Copy Actions */}
            <DropdownMenuItem onClick={handleCopyId}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Record ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyEmployeeId}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Employee ID
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Administrative Actions */}
            <DropdownMenuItem>
              <Archive className="mr-2 h-4 w-4" />
              Archive Record
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];