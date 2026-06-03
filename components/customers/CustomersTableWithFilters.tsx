"use client"

import { notify } from "@/lib/notifications/notify"
import type { CustomerWithStats } from "@/types/customerTypes"
import { useMemo, useState } from "react"
import { CustomerFiltersComponent, type CustomerFilters } from "./customerFilters"
import { CustomerTable } from "./CustomerTable"

interface CustomerTableWithFiltersProps {
  customers: CustomerWithStats[]
}

export function CustomerTableWithFilters({ customers }: CustomerTableWithFiltersProps) {
  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    status: "all",
    minRevenue: "",
    maxRevenue: "",
    dateFrom: undefined,
    dateTo: undefined,
    paymentTerms: "all",
  })

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch =
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm) ||
          customer.phone?.toLowerCase().includes(searchTerm) ||
          customer.code?.toLowerCase().includes(searchTerm)
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "active" && !customer.isActive) return false
        if (filters.status === "inactive" && customer.isActive) return false
      }

      // Revenue range filter
      if (filters.minRevenue && customer.totalRevenue < Number.parseFloat(filters.minRevenue)) {
        return false
      }
      if (filters.maxRevenue && customer.totalRevenue > Number.parseFloat(filters.maxRevenue)) {
        return false
      }

      // Date range filter
      if (filters.dateFrom && customer.createdAt < filters.dateFrom) {
        return false
      }
      if (filters.dateTo && customer.createdAt > filters.dateTo) {
        return false
      }

      // Payment terms filter
      if (filters.paymentTerms !== "all") {
        const terms = Number.parseInt(filters.paymentTerms)
        if (filters.paymentTerms === "60" && customer.paymentTerms < 60) return false
        if (filters.paymentTerms !== "60" && customer.paymentTerms !== terms) return false
      }

      return true
    })
  }, [customers, filters])

  const handleExport = () => {
    // Create CSV content
    const headers = ["Name", "Code", "Email", "Phone", "Status", "Revenue", "Orders", "Payment Terms", "Created"]
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map((customer) =>
        [
          `"${customer.name}"`,
          `"${customer.code || ""}"`,
          `"${customer.email || ""}"`,
          `"${customer.phone || ""}"`,
          customer.isActive ? "Active" : "Inactive",
          customer.totalRevenue,
          customer.totalOrders,
          customer.paymentTerms,
          customer.createdAt.toISOString().split("T")[0],
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `customers-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    notify({
      title: "Export completed",
      description: `Exported ${filteredCustomers.length} customers to CSV file.`,
    })
  }

  return (
    <div className="space-y-4">
      <CustomerFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        totalCount={customers.length}
        filteredCount={filteredCustomers.length}
      />
      <CustomerTable customers={filteredCustomers} />
    </div>
  )
}
