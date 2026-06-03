"use client"

import { DeleteCustomerDialog } from "@/components/customers/DeleteCustomerDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getLocaleFromPathname, localizePath } from "@/i18n/routing"
import { DEFAULT_LOCALE } from "@/types/bilingual"
import type { CustomerWithStats } from "@/types/customerTypes"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpDown, Calendar, CreditCard, Edit, Eye, Mail, MoreHorizontal, Phone, Star, Trash2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface CustomerTableProps {
  customers: CustomerWithStats[]
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE
  const localizedHref = (href: string) => localizePath(href, locale)
  const [sortField, setSortField] = useState<keyof CustomerWithStats>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; customerId: string; customerName: string }>({
    open: false,
    customerId: "",
    customerName: "",
  })

  const sortedCustomers = [...customers].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field: keyof CustomerWithStats) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleDeleteClick = (customerId: string, customerName: string) => {
    setDeleteDialog({ open: true, customerId, customerName })
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-700/80">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent font-semibold text-slate-700 dark:text-slate-300"
                    onClick={() => handleSort("name")}
                  >
                    Customer
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent font-semibold text-slate-700 dark:text-slate-300"
                    onClick={() => handleSort("email")}
                  >
                    Contact
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent font-semibold text-slate-700 dark:text-slate-300"
                    onClick={() => handleSort("totalOrders")}
                  >
                    Orders
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent font-semibold text-slate-700 dark:text-slate-300"
                    onClick={() => handleSort("totalRevenue")}
                  >
                    Revenue
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent font-semibold text-slate-700 dark:text-slate-300"
                    onClick={() => handleSort("lastOrderDate")}
                  >
                    Last Order
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCustomers.map((customer, index) => {
                const isVip = (Number(customer?.totalOrders) || 0) > 10000
                const recentCustomer = (() => {
                  const createdDate = new Date(customer?.createdAt)
                  const thirtyDaysAgo = new Date()
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                  return createdDate >= thirtyDaysAgo
                })()

                return (
                  <TableRow
                    key={customer.id}
                    className="group border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all duration-200"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0">
                          <AvatarImage src="" alt={customer.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xs sm:text-sm">
                            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-slate-900 dark:text-white truncate text-sm sm:text-base">{customer.name}</div>
                            {isVip && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>VIP Customer</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {recentCustomer && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hidden sm:inline-flex">
                                New
                              </Badge>
                            )}
                          </div>
                          {customer.code && (
                            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                              #{customer.code}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1 sm:space-y-2">
                        {customer.email && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                              <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px] sm:max-w-[200px]">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <div className="p-1 rounded bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                              <Phone className="h-3 w-3 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-300 truncate">{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                          <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{customer.totalOrders}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                          {customer.totalOrders === 1 ? 'order' : 'orders'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                          ${customer.totalRevenue.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                          ${(customer.totalRevenue / Math.max(customer.totalOrders, 1)).toFixed(0)} avg
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {customer.lastOrderDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-slate-400 hidden sm:block flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            {formatDistanceToNow(customer.lastOrderDate, { addSuffix: true })}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-slate-400 hidden sm:block flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Never</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant={customer.isActive ? "default" : "secondary"}
                        className={
                          customer.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }
                      >
                        <div className={`w-2 h-2 rounded-full mr-2 ${customer.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel className="text-slate-600 dark:text-slate-400">Customer Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={localizedHref(`/dashboard/customers/${customer.id}`)} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={localizedHref(`/dashboard/customers/${customer.id}/edit`)} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={localizedHref(`/dashboard/customers/${customer.id}/orders`)} className="cursor-pointer">
                              <CreditCard className="mr-2 h-4 w-4" />
                              View Orders
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                            onClick={() => handleDeleteClick(customer.id, customer.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteCustomerDialog
        customerId={deleteDialog.customerId}
        customerName={deleteDialog.customerName}
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      />
    </TooltipProvider>
  )
}
