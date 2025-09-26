"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDeleteStockTransfer, useStockTransfers, useUpdateTransferStatus } from "@/hooks/useStockTransfer"
import { format } from "date-fns"
import { AlertCircle, ArrowRight, Calendar, MoreHorizontal, Package, Search, Truck, User } from "lucide-react"
import { useState } from "react"

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  IN_TRANSIT: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
}

const statusIcons = {
  PENDING: AlertCircle,
  IN_TRANSIT: Truck,
  COMPLETED: Package,
  CANCELLED: AlertCircle,
}

interface StockTransferListProps {
  locationId?: string
}

export function StockTransferList({ locationId }: StockTransferListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const {
    data: transfers,
    isLoading,
    error,
  } = useStockTransfers(locationId, statusFilter === "all" ? undefined : statusFilter)
  const updateStatus = useUpdateTransferStatus()
  const deleteTransfer = useDeleteStockTransfer()

  const filteredTransfers = transfers?.filter(
    (transfer) =>
      transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromLocation?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toLocation?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStatusUpdate = async (id: string, status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED") => {
    try {
      await updateStatus.mutateAsync({ id, status })
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transfer?")) {
      try {
        await deleteTransfer.mutateAsync(id)
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load stock transfers</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Stock Transfers
        </CardTitle>
        <CardDescription>Manage inventory transfers between locations with real-time status tracking</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transfer number or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transfer List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer #</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No stock transfers found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransfers?.map((transfer) => {
                    const StatusIcon = statusIcons[transfer.status]
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{transfer.fromLocation?.name}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{transfer.toLocation?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {transfer.items.length} item{transfer.items.length !== 1 ? "s" : ""}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[transfer.status]} border`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {transfer.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(transfer.requestedAt), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {transfer.requestedByUser?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {transfer.status === "PENDING" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(transfer.id, "IN_TRANSIT")}
                                    disabled={updateStatus.isPending}
                                  >
                                    Approve & Start Transit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusUpdate(transfer.id, "CANCELLED")}
                                    disabled={updateStatus.isPending}
                                  >
                                    Cancel Transfer
                                  </DropdownMenuItem>
                                </>
                              )}
                              {transfer.status === "IN_TRANSIT" && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(transfer.id, "COMPLETED")}
                                  disabled={updateStatus.isPending}
                                >
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(transfer.id)}
                                disabled={deleteTransfer.isPending}
                                className="text-destructive"
                              >
                                Delete Transfer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
