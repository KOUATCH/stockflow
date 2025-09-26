"use client"

import { cashDrawerTransaction, cashDrawerTransactionType } from "@/lib/cashSystem/db"
// import type { cashDrawerTransaction,  } from "@/types"
import { Receipt, TrendingDown, TrendingUp } from "lucide-react"
import { useState } from "react"

interface TransactionHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId?: string
  events?: cashDrawerTransaction[]
}

export function TransactionHistory({ open, onOpenChange, sessionId, events = [] }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Filter and search events
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        searchTerm === "" ||
        event.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.amount.toString().includes(searchTerm)

      const matchesFilter = filterType === "all" || event.type === filterType

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

  // Calculate summary statistics
  const summary = {
    totalEvents: filteredEvents.length,
    totalCashIn: filteredEvents
      .filter((e) => e.type === "CASH_IN" || e.type === "OPENING_BALANCE")
      .reduce((sum, e) => sum + e.amount, 0),
    totalCashOut: filteredEvents
      .filter((e) => e.type === "CASH_OUT" || e.type === "CLOSING_BALANCE")
      .reduce((sum, e) => sum + e.amount, 0),
    totalSales: filteredEvents.filter((e) => e.type === "SALE").reduce((sum, e) => sum + e.amount, 0),
  }

  const getEventIcon = (type: cashDrawerTransactionType) => {
    switch (type) {
      case "CASH_IN":
      case "OPENING_BALANCE":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "CASH_OUT":
      case "CLOSING_BALANCE":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "SALE":
        return <Receipt className="h-4 w-4 text-blue-600" />
      case "RETURN":
        return <TrendingDown className="h-4 w-4 text-orange-600" />
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />
    }
  }

  const getEventTypeLabel = (type: cashDrawerTransactionType) => {
    switch (type) {
      case "OPENING_BALANCE":
        return "Opening Balance"
      case "CLOSING_BALANCE":
        return "Closing Balance"
      case "CASH_IN":
        return "Cash In"
      case "CASH_OUT":
        return "Cash Out"
      case "SALE":
        return "Sale"
      case "RETURN":
        return "Return"
      default:
        return type
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <button onClick={() => onOpenChange(false)} className="rounded-lg p-2 hover:bg-gray-100">
                ×
              </button>
            </div>

            {/* Summary Cards */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-green-50 p-3">
                <div className="text-sm text-green-600">Total Cash In</div>
                <div className="text-lg font-semibold text-green-700">{formatCurrency(summary.totalCashIn)}</div>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <div className="text-sm text-red-600">Total Cash Out</div>
                <div className="text-lg font-semibold text-red-700">{formatCurrency(summary.totalCashOut)}</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b p-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border px-3 py-2"
              >
                <option value="all">All Types</option>
                <option value="CASH_IN">Cash In</option>
                <option value="CASH_OUT">Cash Out</option>
                <option value="SALE">Sales</option>
                <option value="RETURN">Returns</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="rounded-lg border px-3 py-2 hover:bg-gray-50"
              >
                {sortOrder === "desc" ? "Newest First" : "Oldest First"}
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredEvents.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500">No transactions found</div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="rounded-lg border p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getEventIcon(event.type)}
                        <div>
                          <div className="font-medium">{getEventTypeLabel(event.type)}</div>
                          <div className="text-sm text-gray-600">{formatDateTime((event.createdAt).toString())}</div>
                          {event.reason && <div className="text-sm text-gray-700 mt-1">{event.reason}</div>}
                          {event.notes && <div className="text-xs text-gray-500 mt-1">{event.notes}</div>}
                        </div>
                      </div>
                      <div
                        className={`text-lg font-semibold ${event.type === "CASH_IN" || event.type === "OPENING_BALANCE" || event.type === "SALE"
                          ? "text-green-600"
                          : "text-red-600"
                          }`}
                      >
                        {event.type === "CASH_OUT" || event.type === "CLOSING_BALANCE" || event.type === "RETURN"
                          ? "-"
                          : "+"}
                        {formatCurrency(Math.abs(event.amount))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
