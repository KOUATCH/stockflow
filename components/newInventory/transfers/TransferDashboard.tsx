"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTransfers, useTransferActions } from "@/hooks/useTransferQueries"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import type { TransferStatus } from "@/types/inventoryMovementTypes"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Plus,
  Search,
  Truck,
  X,
  AlertCircle,
  BarChart3,
} from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useState } from "react"
import { format } from "date-fns"
import { CreateTransferModal } from "./CreateTransferModal"
import { TransferDetailsModal } from "./TransferDetailsModal"

const statusConfig = {
  DRAFT: {
    icon: <Clock className="h-3 w-3" />,
    color: "bg-gray-100 text-gray-800",
    label: "Draft",
  },
  APPROVED: {
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-800",
    label: "Approved",
  },
  IN_TRANSIT: {
    icon: <Truck className="h-3 w-3" />,
    color: "bg-yellow-100 text-yellow-800",
    label: "In Transit",
  },
  COMPLETED: {
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-100 text-green-800",
    label: "Completed",
  },
  CANCELLED: {
    icon: <X className="h-3 w-3" />,
    color: "bg-red-100 text-red-800",
    label: "Cancelled",
  },
}

export function TransferDashboard() {
  const { data: session } = useSession()
  const orgId = user || ""

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<TransferStatus | "all">("all")
  const [selectedFromLocation, setSelectedFromLocation] = useState<string>("all")
  const [selectedToLocation, setSelectedToLocation] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Fetch data
  const { data: transfersData, isLoading: transfersLoading } = useTransfers(orgId, {
    search: searchTerm,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    fromLocationId: selectedFromLocation === "all" ? undefined : selectedFromLocation,
    toLocationId: selectedToLocation === "all" ? undefined : selectedToLocation,
    page: 1,
    limit: 50,
  })

  const { data: locationsResponse } = useOrgLocationsNew(orgId, { enabled: !!orgId })
  const { approveTransfer, isApproving } = useTransferActions()

  const transfers = transfersData?.data || []
  const locations = locationsResponse?.data || []

  const handleApproveTransfer = (transfer: any) => {
    if (!user) return

    approveTransfer({
      transferId: transfer.id,
      organizationId: orgId,
      approvedById: session.user.id,
    })
  }

  const handleViewDetails = (transfer: any) => {
    setSelectedTransfer(transfer)
    setShowDetailsModal(true)
  }

  if (transfersLoading) {
    return <TransferLoadingSkeleton />
  }

  // Calculate summary stats
  const summaryStats = transfers.reduce(
    (acc, transfer) => {
      acc.total++
      acc.statusCounts[transfer.status] = (acc.statusCounts[transfer.status] || 0) + 1
      return acc
    },
    {
      total: 0,
      statusCounts: {} as Record<TransferStatus, number>,
    },
  )

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Transfers</h1>
          <p className="text-muted-foreground mt-1">Manage inventory movements between locations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.total}</div>
            <p className="text-xs text-muted-foreground">All time transfers</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.statusCounts.DRAFT || 0}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.statusCounts.IN_TRANSIT || 0}</div>
            <p className="text-xs text-muted-foreground">Currently moving</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.statusCounts.COMPLETED || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.statusCounts.CANCELLED || 0}</div>
            <p className="text-xs text-muted-foreground">Cancelled transfers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transfers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transfers">Active Transfers</TabsTrigger>
          <TabsTrigger value="analytics">Transfer Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transfers" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Transfer Management
              </CardTitle>
              <CardDescription>View and manage inventory transfers between locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transfers by number or notes..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as TransferStatus | "all")}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedFromLocation} onValueChange={setSelectedFromLocation}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="From Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedToLocation} onValueChange={setSelectedToLocation}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="To Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transfers Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead className="text-center">Items</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-lg font-medium">No transfers found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm ||
                            selectedStatus !== "all" ||
                            selectedFromLocation !== "all" ||
                            selectedToLocation !== "all"
                              ? "Try adjusting your filters"
                              : "Create your first inventory transfer"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transfers.map((transfer) => {
                        const statusInfo = statusConfig[transfer.status as keyof typeof statusConfig]
                        const totalItems = transfer.lines.reduce((sum, line) => sum + line.quantity, 0)

                        return (
                          <TableRow key={transfer.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div>
                                <p className="font-medium">{transfer.transferNumber}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(transfer.date), "MMM dd, yyyy")}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm">{format(new Date(transfer.createdAt), "MMM dd, yyyy")}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(transfer.createdAt), "HH:mm")}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{transfer.fromLocation.name}</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{transfer.toLocation.name}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div>
                                <span className="font-medium">{totalItems}</span>
                                <p className="text-xs text-muted-foreground">{transfer.lines.length} SKUs</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={`gap-1.5 ${statusInfo?.color || "bg-gray-100 text-gray-800"}`}>
                                {statusInfo?.icon}
                                {statusInfo?.label || transfer.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">{transfer.createdBy?.name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{transfer.createdBy?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(transfer)}
                                  className="text-xs"
                                >
                                  View
                                </Button>
                                {transfer.status === "DRAFT" && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleApproveTransfer(transfer)}
                                    disabled={isApproving}
                                    className="text-xs bg-green-600 hover:bg-green-700"
                                  >
                                    {isApproving ? "..." : "Approve"}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Transfer Trends
                </CardTitle>
                <CardDescription>Track transfer patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium mt-4">Analytics Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    Detailed transfer analytics and reporting features will be available here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Transfer Performance
                </CardTitle>
                <CardDescription>Monitor transfer efficiency and timing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium mt-4">Performance Metrics Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    Transfer performance and efficiency metrics will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTransferModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => setShowCreateModal(false)}
      />

      {selectedTransfer && (
        <TransferDetailsModal open={showDetailsModal} onOpenChange={setShowDetailsModal} transfer={selectedTransfer} />
      )}
    </div>
  )
}

const TransferLoadingSkeleton = () => (
  <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
)
