import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Mail, Phone, Calendar } from "lucide-react"
import Link from "next/link"

interface Employee {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone?: string
  jobTitle: string
  department: string
  hireDate: Date
  isActive: boolean
  salaryInfo?: {
    baseSalary: number
    payFrequency: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY'
    currency: string
    effectiveDate: Date
  }
  bankInfo?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    accountType: 'CHECKING' | 'SAVINGS'
  }
  taxInfo?: {
    taxId: string
    exemptions: number
    additionalWithholding: number
  }
  createdAt: Date
}

interface EmployeeTableColumnsProps {
  formatCurrency: (amount: number) => string
}

export const createEmployeeColumns = ({ formatCurrency }: EmployeeTableColumnsProps): ColumnDef<Employee>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Employee
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const employee = row.original
      return (
        <div className="space-y-1">
          <div className="font-medium">{employee.name}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {employee.email}
          </div>
          {employee.phone && (
            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {employee.phone}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Department
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.getValue("department")}</div>
        <div className="text-sm text-muted-foreground">{row.original.jobTitle}</div>
      </div>
    ),
  },
  {
    accessorKey: "hireDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Hire Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const hireDate = row.getValue("hireDate") as Date
      return (
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{new Date(hireDate).toLocaleDateString()}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "salaryInfo.baseSalary",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 lg:px-3"
      >
        Monthly Salary
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const salary = row.original.salaryInfo?.baseSalary || 0
      return (
        <div className="text-right font-medium">
          {formatCurrency(salary)}
        </div>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return isActive ? (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
          Active
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          Inactive
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original
      return (
        <Link href={`/dashboard/payroll/employees/${employee.id}/edit`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
      )
    },
  },
]